import "server-only";

const IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ATTACHMENT_MIME_TYPES = new Set([...IMAGE_MIME_TYPES, "application/pdf"]);

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;

export function validateImageUpload(file: File): string | null {
  if (!IMAGE_MIME_TYPES.has(file.type)) {
    return "Format gambar harus JPG, PNG, atau WebP.";
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return "Ukuran gambar maksimal 5 MB.";
  }

  return null;
}

export function validateAttachmentUpload(file: File): string | null {
  if (!ATTACHMENT_MIME_TYPES.has(file.type)) {
    return "Lampiran harus berupa JPG, PNG, WebP, atau PDF.";
  }

  if (file.size > MAX_ATTACHMENT_BYTES) {
    return "Ukuran lampiran maksimal 5 MB.";
  }

  return null;
}

export function assertImageUpload(file: File) {
  const error = validateImageUpload(file);
  if (error) throw new Error(error);
}

export function safeUploadExtension(file: File) {
  const extensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "application/pdf": "pdf",
  };

  return extensions[file.type] ?? "bin";
}
