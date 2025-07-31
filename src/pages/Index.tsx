
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthButton from '@/components/auth/AuthButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster } from '@/components/ui/toaster';
import cocktailShakerHero from '@/assets/cocktail-hero-updated.png';

const Index = () => {
  const { user, loading, signInWithProvider, signOut } = useAuth();
  const [authLoading, setAuthLoading] = useState<'google' | 'apple' | null>(null);

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
          <h1 className="text-xl font-bold font-space-grotesk">My Bar</h1>
          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
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
              <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm2 4v-2H3c0 1.1.89 2 2 2zM3 9h2V7H3v2zm12 12h2v-2h-2v2zm4-18H9c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 12H9V5h10v10zm-8-2h2v-2h-2v2zm0-4h2V7h-2v2z"/>
              </svg>
              <span className="text-xs font-space-grotesk text-white">Inventory</span>
            </div>
            <div className="flex flex-col items-center">
              <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
              </svg>
              <span className="text-xs font-space-grotesk text-gray-400">Scan</span>
            </div>
            <div className="flex flex-col items-center">
              <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10,18H5V16H10M9,10V6H5V10M11,10H15V8H11M19,16V10H15V16M21,16V10.5L16.5,6H15V4H5V15H3V2H9V6H21V16Z"/>
              </svg>
              <span className="text-xs font-space-grotesk text-gray-400">Filter</span>
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
