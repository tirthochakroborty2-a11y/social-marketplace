import { createClient } from "./client";

/**
 * Listing-এর ছবি আপলোড
 * @param file - File object
 * @param userId - current user id
 * @returns public URL বা null
 */
export async function uploadListingImage(file: File, userId: string): Promise<string | null> {
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const fileName = `${userId}/${Date.now()}.${ext}`;

  const { data, error } = await supabase.storage
    .from("listings")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Upload error:", error);
    return null;
  }

  const { data: { publicUrl } } = supabase.storage
    .from("listings")
    .getPublicUrl(data.path);

  return publicUrl;
}

/**
 * Avatar আপলোড
 * @param file - File object
 * @param userId - current user id
 * @returns public URL বা null
 */
export async function uploadAvatar(file: File, userId: string): Promise<string | null> {
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const fileName = `${userId}/avatar-${Date.now()}.${ext}`;

  const { data, error } = await supabase.storage
    .from("avatars")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    console.error("Avatar upload error:", error);
    return null;
  }

  const { data: { publicUrl } } = supabase.storage
    .from("avatars")
    .getPublicUrl(data.path);

  return publicUrl;
}

/**
 * ছবি ডিলিট
 */
export async function deleteImage(bucket: "listings" | "avatars", path: string) {
  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  return !error;
}
