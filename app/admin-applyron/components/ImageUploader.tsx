"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import type { UploadTarget } from "@/lib/upload-image";
import { useAdminI18n } from "./AdminI18nProvider";

type Props = {
  currentUrl: string;
  onUploaded: (url: string) => void;
  uploadTarget?: UploadTarget;
};

export default function ImageUploader({
  currentUrl,
  onUploaded,
  uploadTarget = "generic",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { messages } = useAdminI18n();

  function resetInput() {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  async function upload(file: File) {
    setUploading(true);
    setError("");
    setSuccess("");
    const form = new FormData();
    form.append("file", file);
    form.append("target", uploadTarget);

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || messages.imageUploader.error);
      } else {
        onUploaded(data.url);
        if (data.resized && data.width && data.height) {
          setSuccess(
            messages.imageUploader.successOptimized(
              data.width,
              data.height,
              messages.imageUploader.targetLabel[uploadTarget],
            ),
          );
        } else {
          setSuccess(messages.imageUploader.successPlain);
        }
        resetInput();
      }
    } catch {
      setError(messages.imageUploader.error);
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (uploading) return;
    const file = e.dataTransfer.files[0];
    if (file) {
      void upload(file);
    }
  }

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          if (!uploading) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => {
          if (!uploading) {
            inputRef.current?.click();
          }
        }}
        className={`border-2 border-dashed rounded-xl p-4 transition flex flex-col items-center justify-center min-h-[120px] ${
          dragOver
            ? "border-purple-400 bg-purple-500/10"
            : "border-purple-500/30 hover:border-purple-500/60 bg-[#0d0030]"
        } ${uploading ? "cursor-progress" : "cursor-pointer"}`}
      >
        {currentUrl ? (
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-24 h-24 overflow-hidden rounded-lg border border-purple-500/20 bg-[#06001a]">
              <Image
                src={currentUrl}
                alt={messages.imageUploader.previewAlt}
                fill
                className={`object-contain rounded transition ${uploading ? "opacity-30" : "opacity-100"}`}
                unoptimized
              />
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#030014]/80 text-xs font-medium text-white">
                  {messages.imageUploader.uploading}
                </div>
              )}
            </div>
            <span className="text-xs text-gray-400">
              {uploading
                ? messages.imageUploader.uploadingReplacement
                : messages.imageUploader.clickOrDragReplace}
            </span>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-3xl mb-2">📷</div>
            <p className="text-sm text-gray-400">
              {uploading
                ? messages.imageUploader.uploading
                : messages.imageUploader.clickOrDrag}
            </p>
            <p className="text-xs text-gray-600 mt-1">{messages.imageUploader.fileHint}</p>
          </div>
        )}
      </div>
      <p className="mt-2 text-xs text-gray-500">
        {messages.imageUploader.helper[uploadTarget]}
      </p>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      {success && !error && <p className="text-green-400 text-xs mt-1">{success}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) {
            void upload(file);
          }
        }}
      />
    </div>
  );
}
