import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const useNativeIntegration = () => {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#000000' });
        
        await SplashScreen.hide();
        
        Keyboard.addListener('keyboardWillShow', () => {
          document.body.classList.add('keyboard-open');
        });
        
        Keyboard.addListener('keyboardWillHide', () => {
          document.body.classList.remove('keyboard-open');
        });
      } catch (error) {
        console.log('Native features not available:', error);
      }
    };

    initializeApp();

    return () => {
      Keyboard.removeAllListeners();
    };
  }, []);

  const hapticFeedback = async (style: ImpactStyle = ImpactStyle.Light) => {
    try {
      await Haptics.impact({ style });
    } catch (error) {
      console.log('Haptic feedback not available:', error);
    }
  };

  const exitApp = async () => {
    try {
      await App.exitApp();
    } catch (error) {
      console.log('Exit app not available:', error);
    }
  };

  return {
    hapticFeedback,
    exitApp
  };
};