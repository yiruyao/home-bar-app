
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import AuthButton from '@/components/auth/AuthButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster } from '@/components/ui/toaster';
import { User, Grid3X3, Camera, Martini, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import cocktailShakerHero from '@/assets/cocktail-hero-updated.png';

const Index = () => {
  console.log('Index component rendering');
  const { user, loading, signInWithProvider, signOut } = useAuth();
  const navigate = useNavigate();
  const [authLoading, setAuthLoading] = useState<'google' | 'apple' | null>(null);

  // Mock test user data
  const testUser = {
    first_name: 'Yiru',
    last_name: 'Yao',
    email: 'yiru82@gmail.com'
  };

  // Mock inventory data for demonstration
  const mockItems = [
    // Spirits
    {
      id: '1',
      name: 'Rittenhouse Rye Whiskey',
      category: 'spirits',
      description: 'A 100-proof straight rye whiskey perfect for classic cocktails like Manhattans and Old Fashioneds.',
      quantity: 1,
      picture_url: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400'
    },
    {
      id: '2', 
      name: "Hendrick's Gin",
      category: 'spirits',
      description: 'A distinctive gin infused with cucumber and rose petals, offering a unique botanical profile.',
      quantity: 1,
      picture_url: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400'
    },
    {
      id: '3',
      name: 'Espolòn Tequila Blanco', 
      category: 'spirits',
      description: 'A premium 100% blue agave tequila with bright, crisp flavor perfect for margaritas.',
      quantity: 1,
      picture_url: 'https://images.unsplash.com/photo-1606467278097-3e6a3eaa4fb8?w=400'
    },
    // Liqueurs
    {
      id: '4',
      name: 'Cointreau Triple Sec',
      category: 'liqueurs', 
      description: 'Premium French orange liqueur made from sweet and bitter orange peels.',
      quantity: 1,
      picture_url: 'https://images.unsplash.com/photo-1578912996078-305d92249aa6?w=400'
    },
    {
      id: '5',
      name: 'Disaronno Amaretto',
      category: 'liqueurs',
      description: 'Italian almond liqueur with a distinctive sweet almond flavor and smooth finish.',
      quantity: 1, 
      picture_url: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b9d?w=400'
    },
    {
      id: '6',
      name: 'Kahlúa Coffee Liqueur',
      category: 'liqueurs',
      description: 'Rich Mexican coffee liqueur made with rum, sugar, and arabica coffee.',
      quantity: 1,
      picture_url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400'
    },
    // Mixers
    {
      id: '7',
      name: 'Fever-Tree Tonic Water',
      category: 'mixers',
      description: 'Premium tonic water made with natural quinine from the Congo.',
      quantity: 4,
      picture_url: 'https://images.unsplash.com/photo-1605029103232-bc7cf0f3b3df?w=400'
    },
    {
      id: '8', 
      name: 'Q Ginger Beer',
      category: 'mixers',
      description: 'Artisanal ginger beer with real ginger and agave. Perfect for Moscow Mules.',
      quantity: 2,
      picture_url: 'https://images.unsplash.com/photo-1639317632997-4e1bfed3c294?w=400'
    },
    {
      id: '9',
      name: 'Ocean Spray Cranberry Juice',
      category: 'mixers', 
      description: 'Classic cranberry juice cocktail with sweet-tart flavor.',
      quantity: 1,
      picture_url: 'https://images.unsplash.com/photo-1582434142716-405ea16e8df8?w=400'
    }
  ];

  // Group items by category
  const itemsByCategory = mockItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  // Get emoji for category
  const getCategoryEmoji = (category: string) => {
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

  // Get background color for category
  const getCategoryColor = (category: string) => {
    const colorMap: Record<string, string> = {
      spirits: 'bg-amber-100',
      liqueurs: 'bg-pink-200',
      mixers: 'bg-blue-100',
      bitters: 'bg-purple-200',
      garnishes: 'bg-green-200',
      other: 'bg-gray-200'
    };
    return colorMap[category] || 'bg-gray-200';
  };

  const handleAuth = async (provider: 'google' | 'apple') => {
    setAuthLoading(provider);
    await signInWithProvider(provider);
    setAuthLoading(null);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Temporary: Show authenticated view for testing
  const showAuthenticatedView = true;

  if (user || showAuthenticatedView) {
    return (
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="w-6 h-6" /> {/* Spacer for centering */}
          <h1 className="text-xl font-bold font-space-grotesk text-center">{testUser.first_name}'s Bar</h1>
          <User className="w-6 h-6 cursor-pointer" onClick={() => navigate('/profile')} />
        </div>

        <div className="px-6 py-6 pb-24">{/* Added pb-24 for bottom navigation space */}
          {/* Total Items */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-space-grotesk">Total Items</p>
              <p className="text-3xl font-bold font-space-grotesk">
                {mockItems.length}
              </p>
            </div>
            <button 
              onClick={() => navigate('/add-item')}
              className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center hover:bg-amber-700 transition-colors"
            >
              <Plus className="w-5 h-5 text-black" />
            </button>
          </div>

          {/* Items by Category */}
          {Object.entries(itemsByCategory).map(([category, categoryItems]) => (
            <div key={category} className="mb-8">
              <h2 className="text-lg font-bold mb-4 font-space-grotesk capitalize">
                {category}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {(categoryItems as any[]).map((item: any) => (
                  <div 
                    key={item.id} 
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => navigate(`/item/${item.id}`)}
                  >
                    <div className="rounded-lg overflow-hidden aspect-square">
                      <img 
                        src={item.picture_url} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-white font-normal font-space-grotesk text-sm mt-2 text-left">
                      {item.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800">
          <div className="flex justify-around items-center py-3">
            <div className="flex flex-col items-center">
              <Grid3X3 className="w-6 h-6 mb-1" />
              <span className="text-xs font-space-grotesk text-white">Inventory</span>
        </div>
            <div className="flex flex-col items-center">
              <Camera className="w-6 h-6 mb-1 text-gray-400" />
              <span className="text-xs font-space-grotesk text-gray-400">Scan</span>
            </div>
            <div className="flex flex-col items-center">
              <Martini className="w-6 h-6 mb-1 text-gray-400" />
              <span className="text-xs font-space-grotesk text-gray-400">Mix</span>
            </div>
          </div>
        </div>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Hero Section with Full Image */}
      <div className="flex items-center justify-center">
        <img 
          src={cocktailShakerHero}
          alt="Cocktail Hero"
          className="max-w-full h-auto"
        />
      </div>

      {/* Bottom Section with Auth */}
      <div className="bg-black px-6 py-12">
        <div className="max-w-sm mx-auto text-center space-y-6">
          <div className="space-y-3">
            <h1 className="text-xl font-bold text-white font-space-grotesk">
              Welcome to Home Bar
            </h1>
            <p className="text-gray-300 text-sm leading-relaxed font-space-grotesk">
              Manage your home bar inventory and get cocktail inspirations.
            </p>
          </div>
          
          <div className="space-y-3">
            <AuthButton
              provider="google"
              onClick={() => handleAuth('google')}
              loading={authLoading === 'google'}
              className="w-full h-12 text-sm rounded-full font-space-grotesk"
            />
            
            <AuthButton
              provider="apple"
              onClick={() => handleAuth('apple')}
              loading={authLoading === 'apple'}
              className="w-full h-12 text-sm rounded-full font-space-grotesk"
            />
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default Index;
