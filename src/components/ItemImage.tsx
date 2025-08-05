import React from 'react';
import { useImageUrl } from '@/hooks/useImageUrl';

interface ItemImageProps {
  src: string;
  alt: string;
  className?: string;
  onError?: () => void;
}

export const ItemImage: React.FC<ItemImageProps> = ({ src, alt, className, onError }) => {
  const { imageUrl, loading, error } = useImageUrl(src);

  // Get category-specific emoji based on alt text
  const getCategoryEmoji = (itemName: string) => {
    const name = itemName.toLowerCase();
    if (name.includes('whiskey') || name.includes('bourbon') || name.includes('rye')) return '🥃';
    if (name.includes('gin')) return '🍸';
    if (name.includes('tequila')) return '🌵';
    if (name.includes('liqueur') || name.includes('amaretto') || name.includes('cointreau')) return '🍷';
    if (name.includes('tonic') || name.includes('ginger') || name.includes('juice')) return '🥤';
    return '🥃'; // Default
  };

  const emoji = getCategoryEmoji(alt);

  if (error) {
    console.log(`Image not found in storage: ${src} - Using ${emoji} placeholder`);
    onError?.();
    return (
      <div className="flex items-center justify-center text-4xl bg-gradient-to-br from-amber-100 to-orange-200 text-amber-800">
        {emoji}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-gray-800 animate-pulse">
        {/* Hide placeholder while loading */}
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className="flex items-center justify-center text-4xl bg-gradient-to-br from-amber-100 to-orange-200 text-amber-800">
        {emoji}
      </div>
    );
  }

  return (
    <img 
      src={imageUrl} 
      alt={alt}
      className={className}
      onError={(e) => {
        console.log(`Failed to load image from signed URL: ${src}`);
        onError?.();
        // Replace with fallback emoji
        const parent = e.currentTarget.parentElement;
        if (parent) {
          parent.innerHTML = `<div class="flex items-center justify-center text-4xl bg-gradient-to-br from-amber-100 to-orange-200 text-amber-800">${emoji}</div>`;
        }
      }}
    />
  );
};