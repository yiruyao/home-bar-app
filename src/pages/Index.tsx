
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthButton from '@/components/auth/AuthButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster } from '@/components/ui/toaster';
import cocktailShakerHero from '@/assets/cocktail-hero-new.png';

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

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <Card className="shadow-soft bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Welcome to Home Bar! 🍹
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Hello {user.email}! You're successfully signed in.
                </p>
                <Button 
                  onClick={handleSignOut}
                  variant="outline"
                  className="transition-all duration-300 hover:scale-105"
                >
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section with Full Image */}
      <div className="h-[60vh] flex items-center justify-center relative">
        <img 
          src={cocktailShakerHero}
          alt="Cocktail Hero"
          className="w-full h-full object-cover absolute inset-0"
        />
      </div>

      {/* Bottom Section with Auth */}
      <div className="bg-gray-900 px-6 py-12">
        <div className="max-w-sm mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-white">
              Welcome to Home Bar
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed">
              Manage your home bar inventory and get cocktail inspirations.
            </p>
          </div>
          
          <div className="space-y-4">
            <AuthButton
              provider="google"
              onClick={() => handleAuth('google')}
              loading={authLoading === 'google'}
              className="w-full h-14 text-lg rounded-full"
            />
            
            <AuthButton
              provider="apple"
              onClick={() => handleAuth('apple')}
              loading={authLoading === 'apple'}
              className="w-full h-14 text-lg rounded-full"
            />
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default Index;
