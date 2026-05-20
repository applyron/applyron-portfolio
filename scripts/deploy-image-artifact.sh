#!/usr/bin/env bash
set -euo pipefail

APP_NAME="applyron-portfolio"
IMAGE_REPO="applyron-portfolio-app"
REMOTE_APP_DIR="/srv/apps/applyron-portfolio"
REMOTE_COMPOSE_FILE="/opt/stacks/applyron-portfolio/compose.yaml"
DEPLOY_METHOD="applyron-portfolio-local-image-artifact"

SSH_TARGET="${SSH_TARGET:-altos-server}"
SSH_PORT="${SSH_PORT:-22}"
PREFLIGHT_ONLY="false"
SKIP_CHECKS="false"
KEEP_ARTIFACTS="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --preflight-only)
      PREFLIGHT_ONLY="true"
      ;;
    --skip-checks)
      SKIP_CHECKS="true"
      ;;
    --keep-artifacts)
      KEEP_ARTIFACTS="true"
      ;;
    --ssh-target)
      SSH_TARGET="$2"
      shift
      ;;
    --ssh-port)
      SSH_PORT="$2"
      shift
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 1
      ;;
  esac
  shift
done

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

require_clean_git() {
  if [[ -n "$(git status --porcelain)" ]]; then
    echo "Production deploy requires a clean Git worktree." >&2
    git status --short >&2
    exit 1
  fi
}

run_checks() {
  if [[ "$SKIP_CHECKS" == "true" ]]; then
    echo "Skipping local npm checks."
    return 0
  fi

  npm ci
  npm run lint
  npm run build
}

write_manifest() {
  local manifest_path="$1"
  local release_id="$2"
  local commit="$3"
  local branch="$4"
  local repo_url="$5"

  python3 - "$manifest_path" "$APP_NAME" "$repo_url" "$commit" "$branch" "$release_id" "$DEPLOY_METHOD" "$REMOTE_COMPOSE_FILE" <<'PY'
from __future__ import annotations

import json
import socket
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit

manifest_path = Path(sys.argv[1])
app = sys.argv[2]
repo_url = sys.argv[3]
commit = sys.argv[4]
branch = sys.argv[5]
release_id = sys.argv[6]
deploy_method = sys.argv[7]
compose_file = sys.argv[8]

def sanitize_repo_url(value: str) -> str:
    if not value:
        return ""
    try:
        parts = urlsplit(value)
    except Exception:
        return value
    if parts.scheme in {"http", "https", "ssh"} and "@" in parts.netloc:
        return urlunsplit((parts.scheme, parts.netloc.rsplit("@", 1)[1], parts.path, parts.query, parts.fragment))
    return value

manifest = {
    "schema_version": "1",
    "app": app,
    "repo_url": sanitize_repo_url(repo_url),
    "commit": commit,
    "branch": branch,
    "dirty": False,
    "release_id": release_id,
    "deployed_at_utc": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    "deploy_method": deploy_method,
    "source_host": socket.gethostname(),
    "compose_file": compose_file,
}
manifest_path.write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8")
PY
}

check_manifest_for_credentials() {
  local manifest_path="$1"
  if grep -Eq 'https?://[^/[:space:]@:]+:[^/[:space:]@]+@|https?://[^/[:space:]@]+@' "$manifest_path"; then
    echo "Release manifest appears to contain credentials in repo_url." >&2
    exit 1
  fi
}

write_summary() {
  local summary_path="$1"
  local release_id="$2"
  local image_ref="$3"

  python3 - "$summary_path" "$APP_NAME" "$release_id" "$image_ref" <<'PY'
import json
import sys
from pathlib import Path

summary = {
    "app": sys.argv[2],
    "release_id": sys.argv[3],
    "artifact_model": "docker-image-tar",
    "images": [sys.argv[4]],
}
Path(sys.argv[1]).write_text(json.dumps(summary, indent=2, sort_keys=True) + "\n", encoding="utf-8")
PY
}

save_image_archive() {
  local image_ref="$1"
  local archive_path="$2"

  docker save "$image_ref" | gzip -c >"$archive_path"
}

write_checksums() {
  local release_dir="$1"

  (cd "$release_dir" && find . -type f ! -name checksums.sha256 -print | LC_ALL=C sort | xargs sha256sum > checksums.sha256)
}

upload_and_deploy() {
  local release_id="$1"
  local package_path="$2"
  local remote_package="/tmp/${APP_NAME}-${release_id}-image-release.tar.gz"

  scp -P "$SSH_PORT" "$package_path" "${SSH_TARGET}:${remote_package}"
  ssh -p "$SSH_PORT" "$SSH_TARGET" "set -euo pipefail
install -d -m 2775 -o deploy -g applyron '$REMOTE_APP_DIR' '$REMOTE_APP_DIR/releases'
rm -rf '$REMOTE_APP_DIR/releases/$release_id'
install -d -m 2775 -o deploy -g applyron '$REMOTE_APP_DIR/releases/$release_id'
tar -xzf '$remote_package' -C '$REMOTE_APP_DIR/releases/$release_id'
chown -R deploy:applyron '$REMOTE_APP_DIR/releases/$release_id'
rm -f '$remote_package'
/srv/platform/bin/deploy-image-release '$APP_NAME' '$release_id'"
}

main() {
  require_clean_git

  local commit short_commit branch repo_url timestamp release_id image_ref tmp_root release_dir package_path
  commit="$(git rev-parse HEAD)"
  short_commit="${commit:0:12}"
  branch="$(git rev-parse --abbrev-ref HEAD)"
  repo_url="$(git config --get remote.origin.url || true)"
  timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
  release_id="${timestamp}-${short_commit}"
  image_ref="${IMAGE_REPO}:${release_id}"
  tmp_root="${TMPDIR:-/tmp}/${APP_NAME}-${release_id}"
  release_dir="$tmp_root/release"
  package_path="$tmp_root/${APP_NAME}-${release_id}-image-release.tar.gz"

  rm -rf "$tmp_root"
  mkdir -p "$release_dir/images"
  if [[ "$KEEP_ARTIFACTS" != "true" ]]; then
    trap 'rm -rf "$tmp_root"' EXIT
  fi

  run_checks

  docker build -t "$image_ref" -f Dockerfile .
  save_image_archive "$image_ref" "$release_dir/images/${IMAGE_REPO}.tar.gz"
  write_manifest "$release_dir/.applyron-release.json" "$release_id" "$commit" "$branch" "$repo_url"
  check_manifest_for_credentials "$release_dir/.applyron-release.json"
  write_summary "$release_dir/deploy-summary.json" "$release_id" "$image_ref"
  write_checksums "$release_dir"
  tar -czf "$package_path" -C "$release_dir" .

  if [[ "$PREFLIGHT_ONLY" == "true" ]]; then
    echo "Preflight artifact ready: $package_path"
    return 0
  fi

  upload_and_deploy "$release_id" "$package_path"
}

main "$@"
