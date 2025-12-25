"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useUploadContext } from "@/components/ui/upload-context";

type Props = {
  propertyId: string;
  onUpload: (formData: FormData) => Promise<void>;
};

export default function ImageUploader({ propertyId, onUpload }: Props) {
  const [uploading, startTransition] = useTransition();
  const [status, setStatus] = useState<string>("");
  const { setUploading } = useUploadContext();
  const router = useRouter();

  async function compressImage(file: File): Promise<File> {
    const bitmap = await createImageBitmap(file);
    const maxSize = 1280;
    const ratio = Math.min(maxSize / bitmap.width, maxSize / bitmap.height, 1);
    const width = Math.round(bitmap.width * ratio);
    const height = Math.round(bitmap.height * ratio);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.6)
    );
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" });
  }

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setStatus("Compressing and uploading...");
    setUploading(true);

    startTransition(async () => {
      for (const f of Array.from(files)) {
        const compressed = await compressImage(f);
        const fd = new FormData();
        fd.append("property_id", propertyId);
        fd.append("file", compressed);
        await onUpload(fd);
      }
      setStatus("Upload complete");
      setUploading(false);
      router.refresh();
      setTimeout(() => setStatus(""), 2500);
    });
  }

  return (
    <div className="border rounded p-4 bg-white">
      <p className="text-sm text-gray-600 mb-2">Upload multiple images. We will compress them to reduce size.</p>
      <input type="file" accept="image/*" multiple onChange={handleChange} />
      {uploading && <p className="text-sm text-gray-500 mt-2">{status}</p>}
      {!uploading && status && <p className="text-sm text-green-600 mt-2">{status}</p>}
    </div>
  );
}
