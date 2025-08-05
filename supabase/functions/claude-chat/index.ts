import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}

interface ClaudeRequest {
  message: string;
  inventory: InventoryItem[];
  conversationHistory: ClaudeMessage[];
}

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  description?: string;
  quantity: number;
}

const formatInventoryContext = (inventory: InventoryItem[]): string => {
  if (inventory.length === 0) {
    return "The user's bar inventory is currently empty.";
  }

  const inventoryByCategory = inventory.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(`${item.name} (${item.quantity}x)${item.description ? ` - ${item.description}` : ''}`);
    return acc;
  }, {} as Record<string, string[]>);

  let context = "Here's the user's current bar inventory:\n\n";
  
  Object.entries(inventoryByCategory).forEach(([category, items]) => {
    context += `**${category.charAt(0).toUpperCase() + category.slice(1)}:**\n`;
    items.forEach(item => {
      context += `- ${item}\n`;
    });
    context += '\n';
  });

  return context.trim();
};

const createSystemPrompt = (inventory: InventoryItem[]): string => {
  const inventoryContext = formatInventoryContext(inventory);
  
  return `You are an expert mixologist AI assistant helping users create cocktails with their home bar inventory. You are knowledgeable, creative, and enthusiastic about cocktails.

${inventoryContext}

Guidelines for responses:
1. Always prioritize recipes that use ingredients the user already has
2. If suggesting cocktails requiring ingredients they don't have, mention what they'd need to buy
3. Provide clear, step-by-step instructions for cocktails
4. Include garnish suggestions and glassware recommendations
5. Be creative with substitutions using available ingredients
6. Keep responses conversational and enthusiastic
7. Ask clarifying questions about taste preferences, occasion, etc.
8. Suggest both classic and creative cocktail variations
9. Include brief descriptions of flavor profiles
10. Keep responses concise but informative

Always respond as a friendly mixologist who's excited to help create amazing drinks!`;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, inventory, conversationHistory }: ClaudeRequest = await req.json()

    // Get Claude API key from environment
    const apiKey = Deno.env.get('CLAUDE_API_KEY')
    if (!apiKey) {
      throw new Error('Claude API key not configured')
    }

    // Prepare system prompt and messages
    const systemPrompt = createSystemPrompt(inventory);
    const messages: ClaudeMessage[] = [
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    console.log('🤖 Calling Claude API with:', {
      inventory_items: inventory.length,
      message_history: conversationHistory.length,
      message_preview: message.substring(0, 50) + '...'
    });

    // Call Claude API
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
        system: systemPrompt,
        messages: messages
      })
    });

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      console.error('❌ Claude API error:', claudeResponse.status, errorText);
      throw new Error(`Claude API error: ${claudeResponse.status} - ${errorText}`);
    }

    const data = await claudeResponse.json();
    console.log('✅ Claude API response received successfully');

    if (data.content && data.content[0] && data.content[0].text) {
      return new Response(
        JSON.stringify({ response: data.content[0].text }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    } else {
      console.error('❌ Invalid response format:', data);
      throw new Error('Invalid response format from Claude API');
    }

  } catch (error) {
    console.error('❌ Edge Function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        details: 'Edge function failed to process Claude API request'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})