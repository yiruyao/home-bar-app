import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Bot, User, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useItems } from '@/hooks/useItems';
import { createClaudeSupabaseAPI, formatConversationHistory } from '@/lib/claude-supabase';
import { runNetworkDiagnostics, testClaudeAPIConnection } from '@/lib/network-test';
import { Keyboard } from '@capacitor/keyboard';
import { Capacitor } from '@capacitor/core';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Local storage key for chat history
const CHAT_STORAGE_KEY = 'home-bar-chat-history';
const MAX_CONTEXT_MESSAGES = 10; // Limit context to last 10 messages for API efficiency

const Mix = () => {
  const navigate = useNavigate();
  const { items: userInventory, isLoading: inventoryLoading } = useItems();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [claudeAPI, setClaudeAPI] = useState<any>(null);
  const [apiKeyPrompted, setApiKeyPrompted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load chat history from localStorage on component mount
  const loadChatHistory = () => {
    try {
      const savedMessages = localStorage.getItem(CHAT_STORAGE_KEY);
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        console.log('📚 Loaded', parsedMessages.length, 'messages from localStorage');
        return parsedMessages;
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
    return [];
  };

  // Save chat history to localStorage
  const saveChatHistory = (messages: Message[]) => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
      console.log('💾 Saved', messages.length, 'messages to localStorage');
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  };

  // Clear chat history
  const clearChatHistory = () => {
    setMessages([]);
    localStorage.removeItem(CHAT_STORAGE_KEY);
    console.log('🗑️ Chat history cleared');
    
    // Create new welcome message with current inventory
    if (userInventory !== undefined && !inventoryLoading) {
      const inventoryCount = userInventory?.length || 0;
      const welcomeContent = claudeAPI
        ? `🍸 Hey there! I'm your personal mixologist AI powered by Claude. I can see you have ${inventoryCount} items in your bar inventory. Ask me for cocktail recommendations, recipes, or anything drink-related!`
        : `🍸 Hey there! I'm your personal mixologist AI. To use the AI features, you'll need to set your Claude API key. For now, I can see you have ${inventoryCount} items in your inventory. Ask me anything about cocktails!`;
      
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: welcomeContent,
        timestamp: new Date()
      };
      const newMessages = [welcomeMessage];
      setMessages(newMessages);
      saveChatHistory(newMessages);
    }
  };

  // Prevent document scrolling on mix page
  useEffect(() => {
    // Add class to body to prevent scrolling
    document.body.classList.add('mix-page-active');
    
    return () => {
      // Clean up - remove class when leaving page
      document.body.classList.remove('mix-page-active');
    };
  }, []);

  // Initialize Claude API
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize Claude Supabase API (uses Edge Functions)
        const api = createClaudeSupabaseAPI();
        setClaudeAPI(api);
        console.log('🎯 Initialized Claude Supabase API via Edge Functions');
      } catch (error) {
        console.error('Failed to initialize Claude API:', error);
      }
    };

    initializeApp();
  }, []);

  // Auto-scroll to bottom when new messages are added or chat history is loaded
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      // Use a small delay to ensure DOM is fully rendered
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages]);

  // Debug input area visibility and ensure it stays visible
  useEffect(() => {
    const inputArea = document.querySelector('.chat-input-area') as HTMLElement;
    console.log('🔍 Input area render check:', inputArea, 'Display:', inputArea?.style?.display, 'Visibility:', inputArea?.style?.visibility);
    
    // Force visibility on every render
    if (inputArea) {
      inputArea.style.visibility = 'visible';
      inputArea.style.opacity = '1';
      inputArea.style.display = 'block';
    }
  }, [messages, isLoading]);

  // Handle iOS keyboard events
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // Get actual tab bar height - normal calculation since positioning is fixed
      const getTabBarHeight = () => {
        const tabBar = document.querySelector('.ios-tab-bar') as HTMLElement;
        if (tabBar) {
          // Get actual height including padding and borders
          const height = tabBar.offsetHeight;
          console.log('Tab bar offsetHeight:', height);
          return height;
        }
        return 83; // fallback to standard tab bar height
      };

      // Set initial position after component mounts
      const initializeInputPosition = () => {
        const inputArea = document.querySelector('.chat-input-area') as HTMLElement;
        if (inputArea) {
          // Position above tab bar with padding space (99px)
          inputArea.style.bottom = '99px';
          inputArea.style.transform = 'translateY(0px)';
          inputArea.style.transition = 'bottom 0.25s ease-out';
          inputArea.style.visibility = 'visible';
          inputArea.style.opacity = '1';
          inputArea.style.display = 'block';
          console.log('Initial input area positioned above tab bar at 99px');
        }
      };

      // Wait for DOM to be ready
      setTimeout(initializeInputPosition, 100);

      const showListener = Keyboard.addListener('keyboardWillShow', (info) => {
        console.log('Keyboard will show, height:', info.keyboardHeight);
        // Position input area flush against keyboard - no gap
        const inputArea = document.querySelector('.chat-input-area') as HTMLElement;
        if (inputArea) {
          // Position exactly at keyboard height - completely flush
          inputArea.style.bottom = `${info.keyboardHeight}px`;
          inputArea.style.transform = 'translateY(0px)';
          inputArea.style.transition = 'bottom 0.25s ease-out';
          inputArea.style.zIndex = '1001';
          inputArea.style.visibility = 'visible';
          inputArea.style.opacity = '1';
          console.log('Input area positioned flush at bottom:', info.keyboardHeight);
        }
        // Hide tab bar when keyboard is up
        const tabBar = document.querySelector('.ios-tab-bar') as HTMLElement;
        if (tabBar) {
          tabBar.style.display = 'none';
          console.log('Tab bar hidden');
        }
      });

      // Handle both keyboardWillHide and keyboardDidHide for reliability
      const hideListener = Keyboard.addListener('keyboardWillHide', () => {
        console.log('Keyboard will hide');
        const inputArea = document.querySelector('.chat-input-area') as HTMLElement;
        if (inputArea) {
          // Position above tab bar with padding space (99px)
          inputArea.style.bottom = '99px';
          inputArea.style.transform = 'translateY(0px)';
          inputArea.style.transition = 'bottom 0.25s ease-out';
          inputArea.style.zIndex = '1000';
          inputArea.style.visibility = 'visible';
          inputArea.style.opacity = '1';
          console.log('Input area positioned above tab bar at 99px');
        }
        const tabBar = document.querySelector('.ios-tab-bar') as HTMLElement;
        if (tabBar) {
          tabBar.style.display = 'block';
          console.log('Tab bar shown');
        }
      });

      const didHideListener = Keyboard.addListener('keyboardDidHide', () => {
        console.log('Keyboard did hide (backup handler)');
        const inputArea = document.querySelector('.chat-input-area') as HTMLElement;
        if (inputArea) {
          // Position above tab bar with padding space (99px) (backup)
          inputArea.style.bottom = '99px';
          inputArea.style.transform = 'translateY(0px)';
          inputArea.style.transition = 'bottom 0.25s ease-out';
          inputArea.style.zIndex = '1000';
          inputArea.style.visibility = 'visible';
          inputArea.style.opacity = '1';
          console.log('Input area positioned above tab bar at 99px (backup)');
        }
        const tabBar = document.querySelector('.ios-tab-bar') as HTMLElement;
        if (tabBar) {
          tabBar.style.display = 'block';
          console.log('Tab bar shown (backup)');
        }
      });

      return () => {
        showListener.remove();
        hideListener.remove();
        didHideListener.remove();
      };
    }
  }, []);

  // Initialize chat history and welcome message
  useEffect(() => {
    // Load saved messages first
    const savedMessages = loadChatHistory();
    
    if (savedMessages.length > 0) {
      // Use saved messages if they exist
      setMessages(savedMessages);
      console.log('📚 Restored chat history with', savedMessages.length, 'messages');
      
      // Scroll to bottom after loading chat history
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'instant' });
        }
      }, 200);
    } else if (userInventory !== undefined && !inventoryLoading) {
      // Only create welcome message if no saved messages and inventory is loaded (including empty arrays)
      console.log('🎯 Creating new welcome message with inventory:', userInventory?.length || 0);
      console.log('🔑 API available:', !!claudeAPI);
      console.log('📊 Inventory loading state:', inventoryLoading);
      console.log('📦 Inventory data:', userInventory);
      
      const inventoryCount = userInventory?.length || 0;
      const welcomeContent = claudeAPI
        ? `🍸 Hey there! I'm your personal mixologist AI powered by Claude. I can see you have ${inventoryCount} items in your bar inventory. Ask me for cocktail recommendations, recipes, or anything drink-related!`
        : `🍸 Hey there! I'm your personal mixologist AI. To use the AI features, you'll need to set your Claude API key. For now, I can see you have ${inventoryCount} items in your inventory. Ask me anything about cocktails!`;
      
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: welcomeContent,
        timestamp: new Date()
      };
      const newMessages = [welcomeMessage];
      setMessages(newMessages);
      saveChatHistory(newMessages);
    }
  }, [userInventory, inventoryLoading, claudeAPI]);

  // Save messages whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      saveChatHistory(messages);
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    console.log('📤 Sending message, input area before:', document.querySelector('.chat-input-area'));

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    console.log('📤 After state updates, input area:', document.querySelector('.chat-input-area'));

    try {
      // Get AI response (we'll implement this next)
      const aiResponse = await getChatResponse(userMessage.content, userInventory);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Please try again!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      console.log('📤 Message sent, input area after:', document.querySelector('.chat-input-area'));
      console.log('📤 Input ref current:', inputRef.current);
      // Don't auto-focus on mobile to prevent keyboard issues
      if (!Capacitor.isNativePlatform()) {
        inputRef.current?.focus();
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };


  const runDiagnostics = async () => {
    console.log('🏥 Running Claude Doctor Diagnostics...');
    
    // Run network diagnostics
    await runNetworkDiagnostics();
    
    // Test actual API connection if we have the key
    if (claudeAPI) {
      const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;
      if (apiKey) {
        await testClaudeAPIConnection(apiKey);
      }
    }
  };

  const getChatResponse = async (message: string, inventory: any[] | null): Promise<string> => {
    if (!inventory) {
      return "I'm still loading your inventory. Please wait a moment and try again!";
    }
    // Use direct Claude API (Capacitor shouldn't have CORS issues)
    const apiToUse = claudeAPI;
    
    if (!apiToUse) {
      return getStaticMixologistResponse(message, inventory);
    }

    try {
      // Get optimized conversation history for context (exclude welcome, limit to recent messages)
      const recentMessages = messages
        .filter(m => m.id !== 'welcome')
        .slice(-MAX_CONTEXT_MESSAGES); // Only send last N messages for efficiency
      
      const conversationHistory = formatConversationHistory(recentMessages);

      console.log('🔄 Using Claude Supabase API for request');
      console.log('📊 Request details:', {
        inventory_count: inventory.length,
        history_length: conversationHistory.length,
        message_length: message.length
      });

      // Use Claude API for intelligent response
      const response = await apiToUse.sendMessage(message, inventory, conversationHistory);
      console.log('✅ Got response:', response.substring(0, 100) + '...');
      return response;
    } catch (error) {
      console.error('❌ Claude API error in getChatResponse:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      
      // Check for specific error types
      if (error instanceof Error && error.message.includes('CORS_ERROR')) {
        return `🚫 CORS Error: Direct API calls from browser are blocked. The API key is valid but browsers restrict direct API access for security. Consider using a backend server for production.`;
      }
      
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        return `🌐 Network Error: Cannot reach Claude API. Please check your internet connection.`;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return `🤔 AI connection issue: ${errorMessage}. Here's what I can tell you based on your ${inventory.length} inventory items: ${getStaticMixologistResponse(message, inventory)}`;
    }
  };

  // Fallback responses when Claude API is not available
  const getStaticMixologistResponse = (message: string, inventory: any[] | null): string => {
    if (!inventory) return "I'm still loading your inventory data...";
    
    const lowerMessage = message.toLowerCase();
    
    // Get inventory categories for context
    const spirits = inventory.filter(item => item.category === 'spirits');
    const liqueurs = inventory.filter(item => item.category === 'liqueurs');
    const mixers = inventory.filter(item => item.category === 'mixers');
    
    if (lowerMessage.includes('cocktail') || lowerMessage.includes('recipe') || lowerMessage.includes('drink')) {
      if (spirits.length === 0) {
        return "I'd love to suggest cocktails, but I notice you don't have any spirits in your inventory yet. Consider adding some whiskey, gin, vodka, or rum to get started with classic cocktails!";
      }
      
      const spiritNames = spirits.map(s => s.name).join(', ');
      return `Based on your spirits (${spiritNames}), I can suggest some great cocktails! For detailed AI-powered recipes tailored to your exact inventory, you'll need to set up your Claude API key in the environment variables.`;
    }
    
    if (lowerMessage.includes('what') && lowerMessage.includes('have')) {
      return `You currently have ${inventory.length} items: ${spirits.length} spirits, ${liqueurs.length} liqueurs, and ${mixers.length} mixers. Would you like me to suggest what cocktails you can make with these?`;
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
      return "I'm here to help you create amazing cocktails! Ask me about recipes, what you can make with your current inventory, or cocktail recommendations. For full AI-powered assistance, set up your Claude API key!";
    }
    
    return `That's an interesting question about "${message}"! With your current inventory of ${inventory.length} items, there are definitely some cocktail possibilities. For detailed, personalized recommendations, you'll need to configure your Claude API key.`;
  };

  return (
    <div className="mix-page-container bg-black text-white" style={{ height: '100vh', width: '100vw', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
      {/* Header - Absolutely fixed and cannot move */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 bg-black border-b border-gray-800 safe-area-top z-50" style={{ position: 'fixed', top: 0 }}>
        <Trash2 
          className="w-6 h-6 text-gray-400 hover:text-red-400 cursor-pointer transition-colors" 
          onClick={clearChatHistory}
          title="Clear chat history"
        />
        <h1 className="text-xl font-bold font-space-grotesk text-center">Chat</h1>
        <Bot className="w-6 h-6 text-amber-500 cursor-pointer" onClick={runDiagnostics} />
      </div>

      {/* Chat Messages - ONLY scrollable area with strict containment */}
      <div 
        className="absolute left-0 right-0 overflow-y-auto px-4 py-4" 
        style={{ 
          top: '120px', 
          bottom: '160px', 
          position: 'absolute',
          overscrollBehavior: 'contain',
          touchAction: 'pan-y',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'user' 
                  ? 'bg-blue-600' 
                  : 'bg-amber-600'
              }`}>
                {message.role === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-black" />
                )}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-white'
              }`}>
                <p className="text-sm font-space-grotesk whitespace-pre-wrap">
                  {message.content}
                </p>
                <p className={`text-xs mt-1 opacity-70 ${
                  message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-black" />
              </div>
              <div className="bg-gray-800 rounded-lg px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Fixed at bottom with precise positioning - NO CONTAINER PADDING OR BORDER */}
      <div className="chat-input-area fixed left-0 right-0 bg-black" style={{ bottom: '99px', zIndex: 1000 }}>
        <div className="flex items-center space-x-2 px-4 py-4">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask for cocktail recipes, recommendations..."
            className="flex-1 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 font-space-grotesk px-3 rounded-md h-12"
            disabled={isLoading}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="sentences"
            style={{ fontSize: '16px' }}
          />
          <Button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-amber-600 hover:bg-amber-700 text-black font-space-grotesk flex-shrink-0 h-12 px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Mix;