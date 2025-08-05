import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}

interface IdentifyBottleRequest {
  imageData: string; // Base64 encoded image
}

interface BottleIdentification {
  brand: string;
  name: string;
  category: 'spirits' | 'liqueurs' | 'mixers' | 'bitters' | 'garnishes' | 'other';
  description: string;
  confidence: number;
  alcoholContent?: string;
  volume?: string;
}

const createVisionPrompt = (): string => {
  return `You are an expert sommelier and bartender. Analyze this bottle image and provide detailed information about the alcoholic beverage.

Look for:
- Brand name (e.g., "Hendrick's", "Jack Daniel's", "Cointreau")
- Product name (e.g., "Gin", "Old No. 7", "Triple Sec")
- Category classification
- Any visible alcohol percentage
- Bottle size/volume if visible
- Key characteristics for description

Respond with a JSON object in this exact format:
{
  "brand": "Brand Name",
  "name": "Full Product Name",
  "category": "spirits|liqueurs|mixers|bitters|garnishes|other",
  "description": "Detailed description including flavor profile, origin, and typical use in cocktails",
  "confidence": 0.95,
  "alcoholContent": "40% ABV" (if visible),
  "volume": "750ml" (if visible)
}

Category guidelines:
- spirits: Whiskey, gin, vodka, rum, tequila, brandy
- liqueurs: Amaretto, Cointreau, Kahlúa, Bailey's, Grand Marnier
- mixers: Tonic water, ginger beer, juices, sodas
- bitters: Angostura, Peychaud's, etc.
- garnishes: Cherries, olives, etc.
- other: Anything that doesn't fit above categories

If you cannot identify the bottle clearly, set confidence below 0.5 and provide your best guess based on visible elements.`;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { imageData }: IdentifyBottleRequest = await req.json()

    if (!imageData) {
      throw new Error('No image data provided')
    }

    // Get Claude API key from environment
    const apiKey = Deno.env.get('CLAUDE_API_KEY')
    if (!apiKey) {
      throw new Error('Claude API key not configured')
    }

    console.log('🔍 Starting bottle identification...');

    // Prepare the vision prompt
    const systemPrompt = createVisionPrompt();

    // Call Claude Vision API
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022', // Use the latest model with vision
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: systemPrompt
              },
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: imageData.replace(/^data:image\/[a-z]+;base64,/, '') // Remove data URL prefix
                }
              }
            ]
          }
        ]
      })
    });

    console.log('📥 Claude Vision API response status:', claudeResponse.status);

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      console.error('❌ Claude Vision API error:', claudeResponse.status, errorText);
      throw new Error(`Claude Vision API error: ${claudeResponse.status} - ${errorText}`);
    }

    const data = await claudeResponse.json();
    console.log('✅ Claude Vision API response received');

    if (data.content && data.content[0] && data.content[0].text) {
      const responseText = data.content[0].text;
      console.log('🔍 Raw Claude response:', responseText);

      try {
        // Parse the JSON response from Claude
        const identificationResult: BottleIdentification = JSON.parse(responseText);
        
        // Validate the response structure
        if (!identificationResult.brand || !identificationResult.name || !identificationResult.category) {
          throw new Error('Invalid identification response structure');
        }

        // Ensure confidence is within valid range
        identificationResult.confidence = Math.max(0, Math.min(1, identificationResult.confidence || 0.5));

        console.log('✅ Bottle identified:', identificationResult);

        return new Response(
          JSON.stringify({ 
            success: true,
            identification: identificationResult 
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      } catch (parseError) {
        console.error('❌ Failed to parse Claude response as JSON:', parseError);
        console.error('Raw response:', responseText);
        
        // Return a fallback response if JSON parsing fails
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Failed to parse bottle identification',
            rawResponse: responseText
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        )
      }
    } else {
      console.error('❌ Invalid response format:', data);
      throw new Error('Invalid response format from Claude Vision API');
    }

  } catch (error) {
    console.error('❌ Bottle identification error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Unknown error occurred',
        details: 'Edge function failed to identify bottle'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})