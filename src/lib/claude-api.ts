// Claude API integration for the AI mixologist

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

export class ClaudeAPI {
  private apiKey: string;
  private apiUrl: string = 'https://api.anthropic.com/v1/messages';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private formatInventoryContext(inventory: InventoryItem[]): string {
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
  }

  private createSystemPrompt(inventory: InventoryItem[]): string {
    const inventoryContext = this.formatInventoryContext(inventory);
    
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
  }

  async sendMessage(
    message: string, 
    inventory: InventoryItem[], 
    conversationHistory: ClaudeMessage[] = []
  ): Promise<string> {
    try {
      console.log('🤖 Sending message to Claude API:', message);
      const systemPrompt = this.createSystemPrompt(inventory);
      
      // Prepare messages for Claude API
      const messages: ClaudeMessage[] = [
        ...conversationHistory,
        { role: 'user', content: message }
      ];

      console.log('📤 API Request details:', {
        url: this.apiUrl,
        inventory_items: inventory.length,
        message_history: conversationHistory.length
      });

      const requestBody = {
        model: 'claude-3-haiku-20240307', // Using Haiku for faster responses
        max_tokens: 1000,
        system: systemPrompt,
        messages: messages
      };

      console.log('📋 Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 API Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error details:', errorText);
        throw new Error(`Claude API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ API Response received successfully');
      
      if (data.content && data.content[0] && data.content[0].text) {
        return data.content[0].text;
      } else {
        console.error('❌ Invalid response format:', data);
        throw new Error('Invalid response format from Claude API');
      }
    } catch (error) {
      console.error('❌ Claude API error details:', error);
      console.error('❌ Error type:', typeof error);
      console.error('❌ Error constructor:', error?.constructor?.name);
      console.error('❌ Error message:', error?.message);
      console.error('❌ Error stack:', error?.stack);
      
      // Provide more detailed error information
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error('🚫 Network/CORS issue detected - this is likely due to browser CORS restrictions');
        throw new Error('CORS_ERROR: Direct browser API calls to Claude are restricted. API key is present but browser blocks the request.');
      }
      
      if (error instanceof Error) {
        throw new Error(`Claude API Error: ${error.message}`);
      }
      
      throw new Error('Unknown Claude API error occurred');
    }
  }
}

// Factory function to create Claude API instance
export const createClaudeAPI = (apiKey?: string): ClaudeAPI | null => {
  // Try to get API key from environment variables
  const key = apiKey || 
               import.meta.env.VITE_CLAUDE_API_KEY || 
               process.env.VITE_CLAUDE_API_KEY ||
               process.env.CLAUDE_API_KEY;

  console.log('🔍 Checking for Claude API key...');
  console.log('Key available:', key ? 'Yes' : 'No');

  if (!key) {
    console.warn('❌ Claude API key not found. Set VITE_CLAUDE_API_KEY in your environment.');
    return null;
  }

  console.log('✅ Claude API initialized successfully');
  return new ClaudeAPI(key);
};

// Helper function to get conversation history in the right format
export const formatConversationHistory = (messages: Array<{role: string, content: string}>): ClaudeMessage[] => {
  return messages
    .filter(msg => msg.role === 'user' || msg.role === 'assistant')
    .map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    }));
};