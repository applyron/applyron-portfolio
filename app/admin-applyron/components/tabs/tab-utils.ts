"use client";

import { useEffect, useEffectEvent, useState } from "react";

import type { ValidationError } from "@/lib/validate";

export type AdminTabProps = {
  onDirtyChange?: (dirty: boolean) => void;
  onUnauthorized?: () => void;
};

type ErrorPayload = {
  error?: unknown;
  errors?: unknown;
};

export function getAdminErrorMessage(payload: unknown, fallback: string): string {
  if (
    payload &&
    typeof payload === "object" &&
    typeof (payload as ErrorPayload).error === "string" &&
    (payload as { error: string }).error.trim()
  ) {
    return (payload as { error: string }).error;
  }

  return fallback;
}

export function getAdminValidationErrors(payload: unknown): ValidationError[] {
  if (
    !payload ||
    typeof payload !== "object" ||
    !Array.isArray((payload as ErrorPayload).errors)
  ) {
    return [];
  }

  return (payload as { errors: unknown[] }).errors.filter(
    (item): item is ValidationError =>
      Boolean(
        item &&
          typeof item === "object" &&
          typeof (item as ValidationError).field === "string" &&
          typeof (item as ValidationError).message === "string",
      ),
  );
}

export function useDirtyTracker<T>(
  value: T,
  onDirtyChange?: (dirty: boolean) => void,
) {
  const [cleanSnapshot, setCleanSnapshot] = useState<string>();
  const currentSnapshot = JSON.stringify(value);
  const isDirty =
    cleanSnapshot !== undefined && currentSnapshot !== cleanSnapshot;
  const notifyDirtyChange = useEffectEvent((dirty: boolean) => {
    onDirtyChange?.(dirty);
  });

  useEffect(() => {
    notifyDirtyChange(isDirty);
  }, [isDirty]);

  useEffect(() => {
    return () => {
      notifyDirtyChange(false);
    };
  }, []);

  return {
    currentSnapshot,
    isDirty,
    setCleanSnapshot,
  };
}
