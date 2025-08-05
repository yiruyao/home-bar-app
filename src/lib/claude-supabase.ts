// Claude API integration via Supabase Edge Functions

import { supabase } from '@/integrations/supabase/client';

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

export class ClaudeSupabaseAPI {
  async sendMessage(
    message: string, 
    inventory: InventoryItem[], 
    conversationHistory: ClaudeMessage[] = []
  ): Promise<string> {
    try {
      console.log('🚀 Sending message via Supabase Edge Function:', message);
      console.log('📊 Request details:', {
        inventory_items: inventory.length,
        message_history: conversationHistory.length,
        message_length: message.length
      });

      console.log('🔗 Supabase URL:', supabase.supabaseUrl);
      console.log('🔗 Calling function: claude-chat');

      const { data, error } = await supabase.functions.invoke('claude-chat', {
        body: {
          message,
          inventory,
          conversationHistory
        }
      });

      console.log('📥 Raw Supabase response:', { data, error });

      if (error) {
        console.error('❌ Supabase function error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Supabase function error: ${error.message || error.details || 'Unknown error'}`);
      }

      if (!data) {
        console.error('❌ No data returned from edge function');
        throw new Error('No data returned from edge function');
      }

      if (!data.response) {
        console.error('❌ Invalid response format from edge function:', data);
        
        // Check if it's an error response
        if (data.error) {
          throw new Error(`Edge function error: ${data.error}`);
        }
        
        throw new Error('Invalid response format from edge function - missing response field');
      }

      console.log('✅ Got response from edge function:', data.response.substring(0, 100) + '...');
      return data.response;

    } catch (error) {
      console.error('❌ Claude Supabase API error:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      
      if (error instanceof Error) {
        throw new Error(`Claude Supabase API Error: ${error.message}`);
      }
      
      throw new Error('Unknown Claude Supabase API error occurred');
    }
  }
}

// Factory function to create Claude Supabase API instance
export const createClaudeSupabaseAPI = (): ClaudeSupabaseAPI => {
  console.log('✅ Claude Supabase API initialized successfully');
  return new ClaudeSupabaseAPI();
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