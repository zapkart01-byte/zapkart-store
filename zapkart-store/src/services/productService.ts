import { supabase } from './supabase';

// Fetches all products owned by a specific store
export async function getProductsByStore(storeId: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Fetches all active category definitions
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data;
}

// Inserts or updates a product in the Supabase database
export async function upsertProduct(product: any) {
  const { data, error } = await supabase
    .from('products')
    .upsert(product)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Deletes a product from the database
export async function deleteProduct(productId: string) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) throw error;
  return true;
}

// Uploads a product photo to the Supabase storage bucket
export async function uploadProductImage(storeId: string, fileUri: string): Promise<string> {
  const response = await fetch(fileUri);
  const blob = await response.blob();
  const fileName = `${storeId}/${Date.now()}.jpg`;

  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(fileName, blob, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}

/**
 * Uploads multiple product images in parallel and returns their public URLs.
 * Each image gets a unique timestamp-based filename to avoid collisions.
 * @param storeId - The store's UUID
 * @param fileUris - Array of local file URIs to upload
 * @returns Array of public URLs for the uploaded images
 */
export async function uploadMultipleProductImages(
  storeId: string,
  fileUris: string[]
): Promise<string[]> {
  const uploadPromises = fileUris.map(async (uri, index) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    // Use timestamp + index to ensure unique filenames within the same batch
    const fileName = `${storeId}/${Date.now()}_${index}.jpg`;

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, blob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  });

  return Promise.all(uploadPromises);
}
