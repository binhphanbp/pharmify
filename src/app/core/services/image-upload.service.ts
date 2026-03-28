import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class ImageUploadService {
  private readonly BUCKET = 'product-images';

  constructor(private supabase: SupabaseService) {}

  /**
   * Upload a product image to Supabase Storage
   * @param file - File object from input[type="file"]
   * @param productSlug - Product slug used as filename
   * @returns Public URL of the uploaded image
   */
  async uploadProductImage(file: File, productSlug: string): Promise<string> {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filePath = `products/${productSlug}.${ext}`;

    const { error } = await this.supabase.client.storage
      .from(this.BUCKET)
      .upload(filePath, file, {
        contentType: file.type,
        upsert: true, // Overwrite if exists
      });

    if (error) throw error;

    return this.getPublicUrl(filePath);
  }

  /**
   * Upload image from a URL (for seeding/migration)
   * @param imageBuffer - Image data as ArrayBuffer
   * @param productSlug - Product slug
   * @param contentType - MIME type
   */
  async uploadFromBuffer(
    imageBuffer: ArrayBuffer,
    productSlug: string,
    contentType = 'image/jpeg',
  ): Promise<string> {
    const ext = contentType.split('/')[1] || 'jpg';
    const filePath = `products/${productSlug}.${ext}`;

    const { error } = await this.supabase.client.storage
      .from(this.BUCKET)
      .upload(filePath, imageBuffer, {
        contentType,
        upsert: true,
      });

    if (error) throw error;

    return this.getPublicUrl(filePath);
  }

  /**
   * Delete a product image from Storage
   */
  async deleteProductImage(productSlug: string): Promise<void> {
    const { data: files } = await this.supabase.client.storage
      .from(this.BUCKET)
      .list('products', { search: productSlug });

    if (files && files.length > 0) {
      const paths = files.map((f) => `products/${f.name}`);
      const { error } = await this.supabase.client.storage
        .from(this.BUCKET)
        .remove(paths);

      if (error) throw error;
    }
  }

  /**
   * Get public URL of a file in Storage
   */
  getPublicUrl(filePath: string): string {
    const { data } = this.supabase.client.storage
      .from(this.BUCKET)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  /**
   * Upload image and update the product's image_url in the database
   */
  async uploadAndUpdateProduct(
    file: File,
    productId: string,
    productSlug: string,
  ): Promise<string> {
    // 1. Upload to Storage
    const publicUrl = await this.uploadProductImage(file, productSlug);

    // 2. Update product record in DB
    const { error } = await this.supabase.client
      .from('products')
      .update({ image_url: publicUrl })
      .eq('id', productId);

    if (error) {
      // Try RPC if direct update fails (RLS)
      await this.supabase.client.rpc('fn_update_product_image', {
        p_slug: productSlug,
        p_image_url: publicUrl,
      });
    }

    return publicUrl;
  }
}
