import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();
    
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('🎨 Generating image with Flux.schnell via Replicate:', prompt);

    const replicateToken = Deno.env.get('REPLICATE_API_TOKEN');
    if (!replicateToken) {
      throw new Error('REPLICATE_API_TOKEN environment variable is not set');
    }

    // Using Flux.schnell via Replicate API (fast and high-quality)
    const response = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${replicateToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: {
          prompt: prompt,
          num_outputs: 1,
          aspect_ratio: "1:1",
          width: 512,
          height: 512,
          output_format: "jpg",
          output_quality: 90
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Replicate API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Replicate API error: ${response.status} - ${errorText}`);
    }

    const prediction = await response.json();
    console.log('📋 Prediction created:', prediction.id);

    // Poll for completion (Flux.schnell is fast, usually 2-3 seconds)
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds max
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          'Authorization': `Token ${replicateToken}`,
        },
      });

      if (!statusResponse.ok) {
        throw new Error(`Failed to check prediction status: ${statusResponse.status}`);
      }

      const statusData = await statusResponse.json();
      console.log(`📊 Attempt ${attempts + 1}: Status = ${statusData.status}`);
      
      if (statusData.status === 'succeeded') {
        const imageUrl = statusData.output?.[0];
        if (imageUrl) {
          console.log('✅ Flux.schnell image generated successfully');
          return new Response(
            JSON.stringify({ imageUrl }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
      } else if (statusData.status === 'failed') {
        throw new Error(`Flux generation failed: ${statusData.error || 'Unknown error'}`);
      }
      
      attempts++;
    }

    throw new Error('Flux image generation timed out after 30 seconds');

  } catch (error) {
    console.error('❌ Image generation error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate image',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});