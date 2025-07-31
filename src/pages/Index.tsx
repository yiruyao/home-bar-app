
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import AuthButton from '@/components/auth/AuthButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster } from '@/components/ui/toaster';
import { User, Grid3X3, Camera, Martini } from 'lucide-react';
import cocktailShakerHero from '@/assets/cocktail-hero-updated.png';

const Index = () => {
  const { user, loading, signInWithProvider, signOut } = useAuth();
  const navigate = useNavigate();
  const [authLoading, setAuthLoading] = useState<'google' | 'apple' | null>(null);

  // Mock test user data
  const testUser = {
    first_name: 'Yiru',
    last_name: 'Yao',
    email: 'yiru82@gmail.com'
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

        <div className="px-6 py-6">
          {/* Total Items */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <p className="text-gray-400 text-sm font-space-grotesk">Total Items</p>
            <p className="text-3xl font-bold font-space-grotesk">18</p>
          </div>

          {/* Spirits Section */}
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4 font-space-grotesk">Spirits</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-amber-100 rounded-lg p-4 aspect-square flex flex-col items-center justify-between">
                <div className="text-6xl">🥃</div>
                <p className="text-black font-semibold font-space-grotesk">Whiskey</p>
              </div>
              <div className="bg-pink-100 rounded-lg p-4 aspect-square flex flex-col items-center justify-between">
                <div className="text-6xl">🍸</div>
                <p className="text-black font-semibold font-space-grotesk">Vodka</p>
              </div>
              <div className="bg-amber-200 rounded-lg p-4 aspect-square flex flex-col items-center justify-between">
                <div className="text-6xl">🥃</div>
                <p className="text-black font-semibold font-space-grotesk">Rum</p>
              </div>
              <div className="bg-green-100 rounded-lg p-4 aspect-square flex flex-col items-center justify-between">
                <div className="text-6xl">🍸</div>
                <p className="text-black font-semibold font-space-grotesk">Gin</p>
              </div>
            </div>
          </div>

          {/* Liqueurs Section */}
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4 font-space-grotesk">Liqueurs</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-pink-200 rounded-lg p-4 aspect-square flex flex-col items-center justify-between">
                <div className="text-6xl">🍷</div>
                <p className="text-black font-semibold font-space-grotesk">Triple Sec</p>
              </div>
              <div className="bg-orange-200 rounded-lg p-4 aspect-square flex flex-col items-center justify-between">
                <div className="text-6xl">🍷</div>
                <p className="text-black font-semibold font-space-grotesk">Amaretto</p>
              </div>
              <div className="bg-red-200 rounded-lg p-4 aspect-square flex flex-col items-center justify-between">
                <div className="text-6xl">🍷</div>
                <p className="text-black font-semibold font-space-grotesk">Campari</p>
              </div>
              <div className="bg-yellow-200 rounded-lg p-4 aspect-square flex flex-col items-center justify-between">
                <div className="text-6xl">🍷</div>
                <p className="text-black font-semibold font-space-grotesk">Aperol</p>
              </div>
            </div>
          </div>

          {/* Mixers Section */}
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4 font-space-grotesk">Mixers</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-100 rounded-lg p-4 aspect-square flex flex-col items-center justify-between">
                <div className="text-6xl">🥤</div>
                <p className="text-black font-semibold font-space-grotesk">Tonic Water</p>
              </div>
              <div className="bg-green-200 rounded-lg p-4 aspect-square flex flex-col items-center justify-between">
                <div className="text-6xl">🥤</div>
                <p className="text-black font-semibold font-space-grotesk">Club Soda</p>
              </div>
              <div className="bg-yellow-300 rounded-lg p-4 aspect-square flex flex-col items-center justify-between">
                <div className="text-6xl">🥤</div>
                <p className="text-black font-semibold font-space-grotesk">Ginger Ale</p>
              </div>
              <div className="bg-red-300 rounded-lg p-4 aspect-square flex flex-col items-center justify-between">
                <div className="text-6xl">🧃</div>
                <p className="text-black font-semibold font-space-grotesk">Cranberry Juice</p>
              </div>
            </div>
          </div>

          {/* Sign Out Button */}
          <div className="mt-8 text-center">
            <Button 
              onClick={handleSignOut}
              variant="outline"
              className="transition-all duration-300 hover:scale-105 border-gray-600 text-white hover:bg-gray-800 font-space-grotesk"
            >
              Sign Out
            </Button>
          </div>
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
