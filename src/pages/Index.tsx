
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useItems } from '@/hooks/useItems';
import { useProfile } from '@/hooks/useProfile';
import AuthButton from '@/components/auth/AuthButton';
import { User, Plus } from 'lucide-react';
import landingImage from '@/assets/landing.png';
import { ItemImage } from '@/components/ItemImage';

const Index = () => {
  const { user, loading, signInWithProvider, signOut } = useAuth();
  const navigate = useNavigate();
  const { items, itemsByCategory, isLoading: itemsLoading } = useItems();
  const { profile, isLoading: profileLoading } = useProfile();
  const [authLoading, setAuthLoading] = useState<'google' | 'apple' | null>(null);
  

  // Prevent document scrolling on home page
  useEffect(() => {
    // Add class to body to prevent scrolling
    document.body.classList.add('home-page-active');
    
    return () => {
      // Clean up - remove class when leaving page
      document.body.classList.remove('home-page-active');
    };
  }, []);


  // Get the user's first name for display
  const firstName = profile?.first_name || 
    (user?.user_metadata?.name ? user.user_metadata.name.split(' ')[0] : '') || 
    'User';

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
    try {
      await signInWithProvider(provider);
    } catch (error) {
      // Silent error handling
    }
    setAuthLoading(null);
  };


  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show authenticated view only if user is actually logged in
  if (user) {
    return (
      <div className="home-page-container bg-black text-white" style={{ height: '100vh', width: '100vw', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
        {/* Header - Fixed */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 bg-black border-b border-gray-800 safe-area-top z-50" style={{ position: 'fixed', top: 0 }}>
          <div className="w-6 h-6" /> {/* Spacer for centering */}
          <h1 className="text-xl font-bold font-space-grotesk text-center">{firstName}'s Bar</h1>
          <User className="w-6 h-6 cursor-pointer" onClick={() => navigate('/profile')} />
        </div>

        {/* Scrollable content area */}
        <div 
          className="absolute left-0 right-0 overflow-y-auto px-6 py-6 pb-24" 
          style={{ 
            top: '120px', 
            bottom: '83px', 
            position: 'absolute',
            overscrollBehavior: 'contain',
            touchAction: 'pan-y',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {/* Total Items */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-space-grotesk">Total Items</p>
              <p className="text-3xl font-bold font-space-grotesk">
                {itemsLoading ? '...' : items.length}
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
          {itemsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            Object.entries(itemsByCategory).map(([category, categoryItems]) => (
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
                        <ItemImage 
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
            ))
          )}
        </div>

      </div>
    );
  }


  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Hero Section with Full Image */}
      <div className="flex items-center justify-center mb-4">
        <img
          src={landingImage}
          alt="Home Bar App"
          className="max-w-full h-auto block"
          style={{ minHeight: '400px', objectFit: 'cover' }}
        />
      </div>

      {/* Bottom Section with Auth */}
      <div className="bg-black px-6 pt-0 pb-6">
        <div className="max-w-sm mx-auto text-center space-y-4">
          <div className="space-y-2">
          
          
            <h1 className="text-xl font-bold text-white font-space-grotesk">
              Welcome to Home Bar
            </h1>
            <p className="text-gray-300 text-sm leading-relaxed font-space-grotesk">
              Manage inventory and get cocktail inspirations
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
    </div>
  );
};

export default Index;
