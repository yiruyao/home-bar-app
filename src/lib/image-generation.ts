import { CategoryType } from '@/types/database';

export const generateBottleImagePrompt = (
  name: string, 
  category: CategoryType, 
  description?: string
): string => {
  // Extract key information for better prompts
  const nameWords = name.toLowerCase();
  const descWords = description?.toLowerCase() || '';
  
  // Extract brand name (usually the first word or two)
  const brandName = name.split(' ').slice(0, 2).join(' ');
  
  // Determine liquid type and characteristics
  let liquidType = '';
  let bottleShape = '';
  let labelStyle = '';
  let brandingDetails = '';
  
  switch (category) {
    case 'spirits':
      if (nameWords.includes('gin')) {
        liquidType = 'clear liquid';
        bottleShape = 'tall elegant gin bottle';
        labelStyle = 'botanical-themed label with decorative elements';
        brandingDetails = `label clearly showing "${brandName}" in elegant typography`;
      } else if (nameWords.includes('whiskey') || nameWords.includes('bourbon') || nameWords.includes('rye')) {
        liquidType = 'amber whiskey liquid';
        bottleShape = 'square or rounded whiskey bottle';
        labelStyle = 'classic vintage label with gold accents';
        brandingDetails = `label prominently displaying "${brandName}" in bold vintage lettering`;
      } else if (nameWords.includes('vodka')) {
        liquidType = 'crystal clear liquid';
        bottleShape = 'sleek modern vodka bottle';
        labelStyle = 'minimalist clean label';
        brandingDetails = `simple label with "${brandName}" in modern typography`;
      } else if (nameWords.includes('tequila')) {
        liquidType = 'clear or light amber liquid';
        bottleShape = 'distinctive agave-inspired tequila bottle';
        labelStyle = 'Mexican-inspired colorful label';
        brandingDetails = `vibrant label featuring "${brandName}" with Mexican design elements`;
      } else if (nameWords.includes('rum')) {
        liquidType = 'golden amber rum liquid';
        bottleShape = 'traditional rum bottle';
        labelStyle = 'tropical or nautical themed label';
        brandingDetails = `maritime-style label with "${brandName}" in bold letters`;
      } else {
        liquidType = 'clear to amber liquid';
        bottleShape = 'premium spirits bottle';
        labelStyle = 'elegant branded label';
        brandingDetails = `sophisticated label displaying "${brandName}"`;
      }
      break;
      
    case 'liqueurs':
      liquidType = 'colored liquid';
      bottleShape = 'decorative liqueur bottle';
      if (nameWords.includes('orange') || nameWords.includes('cointreau')) {
        liquidType = 'orange-tinted liquid';
        labelStyle = 'French elegant label with orange motifs';
        brandingDetails = `premium French label with "${brandName}" in ornate script`;
      } else if (nameWords.includes('amaretto')) {
        liquidType = 'amber liquid';
        labelStyle = 'Italian-style ornate label';
        brandingDetails = `decorative Italian label featuring "${brandName}"`;
      } else {
        labelStyle = 'artisanal liqueur label with flavor indicators';
        brandingDetails = `craft label prominently showing "${brandName}"`;
      }
      break;
      
    case 'mixers':
      bottleShape = 'mixer bottle or can';
      if (nameWords.includes('tonic')) {
        liquidType = 'clear sparkling liquid';
        labelStyle = 'crisp blue and white label';
        brandingDetails = `clean label with "${brandName}" in modern fonts`;
      } else if (nameWords.includes('ginger')) {
        liquidType = 'golden ginger liquid';
        labelStyle = 'spicy themed label with ginger graphics';
        brandingDetails = `energetic label displaying "${brandName}" with ginger imagery`;
      } else if (nameWords.includes('cranberry')) {
        liquidType = 'deep red liquid';
        labelStyle = 'berry-themed red label';
        brandingDetails = `fruit-themed label with "${brandName}" prominently featured`;
      } else {
        liquidType = 'appropriate colored liquid';
        labelStyle = 'branded mixer label';
        brandingDetails = `commercial label showing "${brandName}"`;
      }
      break;
      
    default:
      liquidType = 'appropriate liquid';
      bottleShape = 'standard bottle';
      labelStyle = 'professional branded label';
      brandingDetails = `label displaying "${brandName}"`;
  }
  
  // Include description details if available
  let additionalDetails = '';
  if (description && description.length > 10) {
    additionalDetails = `, incorporating design elements that reflect: ${description.substring(0, 100)}`;
  }
  
  return `A ${bottleShape} with ${liquidType}, ${labelStyle}, ${brandingDetails}${additionalDetails}, professional product photography, premium lighted studio background with soft gradient studio lighting with rim lighting, high resolution, commercial photography style, centered composition, elegant shadow beneath bottle, photorealistic, high detail label text, luxury product photography`;
};

export const generateBottleImage = async (prompt: string): Promise<string | null> => {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    console.log('🔍 Environment check:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      urlStart: supabaseUrl?.substring(0, 20)
    });
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    const functionUrl = `${supabaseUrl}/functions/v1/generate-image`;
    console.log('📡 Calling function at:', functionUrl);
    
    // Using Supabase Edge Function for image generation
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ prompt }),
    });
    
    console.log('📡 Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`Image generation failed: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ Response data:', data);
    return data.imageUrl || null;
  } catch (error) {
    console.error('❌ Image generation error:', {
      message: error.message,
      stack: error.stack,
      error: error
    });
    return null;
  }
};
