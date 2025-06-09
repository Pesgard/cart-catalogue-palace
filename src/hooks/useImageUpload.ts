import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file: File, productId?: string): Promise<string | null> => {
    try {
      setUploading(true);

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Por favor selecciona un archivo de imagen válido",
          variant: "destructive",
        });
        return null;
      }

      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "La imagen no puede superar los 5MB",
          variant: "destructive",
        });
        return null;
      }

      // Generar nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${productId || Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      // Subir archivo a Storage
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Obtener URL pública
      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      toast({
        title: "Éxito",
        description: "Imagen subida correctamente",
      });

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      const message = error instanceof Error ? error.message : 'Error subiendo imagen';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (imageUrl: string): Promise<boolean> => {
    try {
      // Extraer el path del archivo de la URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `products/${fileName}`;

      const { error } = await supabase.storage
        .from('product-images')
        .remove([filePath]);

      if (error) {
        throw error;
      }

      toast({
        title: "Éxito",
        description: "Imagen eliminada correctamente",
      });

      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      const message = error instanceof Error ? error.message : 'Error eliminando imagen';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      return false;
    }
  };

  const replaceImage = async (file: File, oldImageUrl: string, productId?: string): Promise<string | null> => {
    try {
      // Subir nueva imagen
      const newImageUrl = await uploadImage(file, productId);
      
      if (!newImageUrl) {
        return null;
      }

      // Eliminar imagen anterior
      if (oldImageUrl && oldImageUrl.includes('product-images')) {
        await deleteImage(oldImageUrl);
      }

      return newImageUrl;
    } catch (error) {
      console.error('Error replacing image:', error);
      const message = error instanceof Error ? error.message : 'Error reemplazando imagen';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      return null;
    }
  };

  const getImageUrl = (filePath: string): string => {
    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  };

  return {
    uploading,
    uploadImage,
    deleteImage,
    replaceImage,
    getImageUrl
  };
}; 