// Bottle identification service using Claude Vision API via Supabase Edge Functions

import { supabase } from '@/integrations/supabase/client';

export interface BottleIdentification {
  brand: string;
  name: string;
  category: 'spirits' | 'liqueurs' | 'mixers' | 'bitters' | 'garnishes' | 'other';
  description: string;
  confidence: number;
  alcoholContent?: string;
  volume?: string;
}

export interface IdentificationResult {
  success: boolean;
  identification?: BottleIdentification;
  error?: string;
  rawResponse?: string;
}

export const identifyBottleFromImage = async (imageData: string): Promise<BottleIdentification> => {
  try {
    console.log('🔍 Starting bottle identification...');
    console.log('📊 Image data length:', imageData.length);

    const { data, error } = await supabase.functions.invoke('identify-bottle', {
      body: {
        imageData: imageData
      }
    });

    if (error) {
      console.error('❌ Supabase function error:', error);
      throw new Error(`Identification service error: ${error.message || 'Unknown error'}`);
    }

    console.log('📥 Raw identification response:', data);

    if (!data) {
      throw new Error('No response from identification service');
    }

    const result: IdentificationResult = data;

    if (!result.success) {
      console.error('❌ Identification failed:', result.error);
      throw new Error(result.error || 'Bottle identification failed');
    }

    if (!result.identification) {
      throw new Error('No identification data returned');
    }

    console.log('✅ Bottle identified successfully:', result.identification);
    return result.identification;

  } catch (error) {
    console.error('❌ Bottle identification error:', error);
    
    if (error instanceof Error) {
      throw new Error(`Identification failed: ${error.message}`);
    }
    
    throw new Error('Unknown identification error occurred');
  }
};

export const getCategoryDisplayName = (category: string): string => {
  const categoryMap: Record<string, string> = {
    spirits: 'Spirits',
    liqueurs: 'Liqueurs', 
    mixers: 'Mixers',
    bitters: 'Bitters',
    garnishes: 'Garnishes',
    other: 'Other'
  };
  return categoryMap[category] || 'Other';
};

export const getCategoryEmoji = (category: string): string => {
  const emojiMap: Record<string, string> = {
    spirits: '🥃',
    liqueurs: '🍷',
    mixers: '🥤',
    bitters: '🧪',
    garnishes: '🍋',
    other: '📦'
  };
  return emojiMap[category] || '📦';
};