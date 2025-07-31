import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthButton from '@/components/auth/AuthButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster } from '@/components/ui/toaster';

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <Card className="shadow-soft">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-primary">
                Welcome to Home Bar! 🍹
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-elegant border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto mb-6 w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-soft">
              <span className="text-2xl">🍹</span>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Home Bar
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Create amazing cocktails at home
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4 px-8 pb-8">
            <div className="space-y-3">
              <AuthButton
                provider="google"
                onClick={() => handleAuth('google')}
                loading={authLoading === 'google'}
              />
              
              <AuthButton
                provider="apple"
                onClick={() => handleAuth('apple')}
                loading={authLoading === 'apple'}
              />
            </div>
            
            <div className="text-center pt-4">
              <p className="text-xs text-muted-foreground">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </div>
  );
};

export default Index;
