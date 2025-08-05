import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useNavigate } from 'react-router-dom';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

const Profile = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { profile, isLoading, uploadProfileImage, isUploadingImage, uploadImageError } = useProfile();
  const [showPlusOverlay, setShowPlusOverlay] = useState(false);

  // Prevent document scrolling on profile page
  useEffect(() => {
    // Add class to body to prevent scrolling
    document.body.classList.add('profile-page-active');
    
    return () => {
      // Clean up - remove class when leaving page
      document.body.classList.remove('profile-page-active');
    };
  }, []);

  const handleBack = () => {
    navigate('/', { replace: true });
  };

  const handleSignOut = async () => {
    await signOut();
    // No need to navigate - App.tsx will automatically redirect to landing page when user becomes null
  };

  const handleAvatarClick = () => {
    setShowPlusOverlay(!showPlusOverlay);
  };

  const handleImagePicker = async () => {
    try {
      setShowPlusOverlay(false);

      // Check if we're on a native platform
      if (!Capacitor.isNativePlatform()) {
        alert('Image upload is only available on mobile devices');
        return;
      }

      // Open photo library
      const image = await CapacitorCamera.getPhoto({
        quality: 80,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
        width: 400,
        height: 400
      });

      if (image.dataUrl) {
        // Convert data URL to File object
        const response = await fetch(image.dataUrl);
        const blob = await response.blob();
        const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });

        // Upload the image using the proper mutation
        uploadProfileImage(file);
      }
    } catch (error) {
      console.error('Error uploading profile image:', error);
      
      // Handle specific errors
      if (error?.message?.includes('row-level security policy')) {
        alert('Upload failed due to security policies. Please ensure you are signed in.');
      } else if (error?.message?.includes('StorageApiError')) {
        alert('Storage upload failed. Please check if the "profiles" bucket exists and has proper permissions.');
      } else {
        alert(`Failed to upload image: ${error?.message || 'Unknown error'}`);
      }
    }
  };

  return (
    <div className="profile-page-container bg-black text-white" style={{ height: '100vh', width: '100vw', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
      {/* Header - Fixed */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 bg-black border-b border-gray-800 safe-area-top z-50" style={{ position: 'fixed', top: 0 }}>
        <ArrowLeft className="w-6 h-6 cursor-pointer" onClick={handleBack} />
        <h1 className="text-xl font-bold font-space-grotesk text-center">Profile</h1>
        <div className="w-6 h-6" /> {/* Spacer for centering */}
      </div>

      {/* Scrollable profile content area */}
      <div 
        className="absolute left-0 right-0 overflow-y-auto px-6 py-12 text-center" 
        style={{ 
          top: '120px', 
          bottom: '83px', 
          position: 'absolute',
          overscrollBehavior: 'contain',
          touchAction: 'pan-y',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {/* Avatar */}
        <div className="relative w-32 h-32 mx-auto mb-6">
          <div 
            className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-300 to-orange-400 flex items-center justify-center overflow-hidden cursor-pointer relative"
            onClick={handleAvatarClick}
          >
            {profile?.picture_url ? (
              <img 
                src={profile.picture_url} 
                alt="Profile Avatar" 
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-16 h-16 text-white" />
            )}
            
            {/* Plus overlay */}
            {showPlusOverlay && (
              <div 
                className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleImagePicker();
                }}
              >
                <Plus className="w-8 h-8 text-white" />
              </div>
            )}

            {/* Loading overlay */}
            {isUploadingImage && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        <h2 className="text-2xl font-bold font-space-grotesk mb-2">
          {isLoading ? 'Loading...' : profile ? `${profile.first_name} ${profile.last_name}` : 'User'}
        </h2>
        <p className="text-gray-400 font-space-grotesk mb-8">
          {isLoading ? 'Loading...' : profile?.email || 'No email'}
        </p>

        {/* Sign Out Button - Now inside scrollable area */}
        <div className="mt-8">
          <Button 
            onClick={handleSignOut}
            className="px-8 py-3 h-12 bg-amber-600 hover:bg-amber-700 text-black font-space-grotesk rounded-full border-0 mx-auto block"
          >
            Sign Out
          </Button>
        </div>
      </div>

    </div>
  );
};

export default Profile;