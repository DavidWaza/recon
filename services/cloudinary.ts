/**
 * Direct (unsigned) browser upload to Cloudinary.
 *
 * Requires two public env vars:
 *   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME    — your Cloudinary cloud name
 *   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET — an UNSIGNED upload preset
 *
 * Create the preset in Cloudinary → Settings → Upload → "Add upload preset",
 * set Signing Mode to "Unsigned". Unsigned presets are designed for
 * client-side uploads, so no secret key is exposed.
 */
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export const cloudinaryConfigured = Boolean(CLOUD_NAME && UPLOAD_PRESET);

export async function uploadImageToCloudinary(file: File): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.",
    );
  }

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: form },
  );

  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    throw new Error(
      detail?.error?.message ?? `Upload failed (${res.status})`,
    );
  }

  const data = (await res.json()) as { secure_url: string };
  return data.secure_url;
}
