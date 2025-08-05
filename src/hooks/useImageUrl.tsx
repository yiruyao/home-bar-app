import { useState, useEffect } from 'react';
import { getImageUrl } from '@/lib/storage';

export const useImageUrl = (path: string): { imageUrl: string; loading: boolean; error: string | null } => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(!!path);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!path) {
      setImageUrl('');
      setLoading(false);
      setError(null);
      return;
    }

    const loadImageUrl = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const url = await getImageUrl(path);
        setImageUrl(url);
      } catch (err) {
        console.error('Failed to load image URL:', err);
        setError(err instanceof Error ? err.message : 'Failed to load image');
        setImageUrl('');
      } finally {
        setLoading(false);
      }
    };

    loadImageUrl();
  }, [path]);

  return { imageUrl, loading, error };
};