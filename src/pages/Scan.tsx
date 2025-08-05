import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Image, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { toast } from '@/hooks/use-toast';
import { identifyBottleFromImage, BottleIdentification, getCategoryDisplayName, getCategoryEmoji } from '@/lib/bottle-identification';

const Scan = () => {
  const navigate = useNavigate();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [identification, setIdentification] = useState<BottleIdentification | null>(null);
  const [identificationStatus, setIdentificationStatus] = useState<'idle' | 'identifying' | 'success' | 'error'>('idle');
  const [showCameraOptions, setShowCameraOptions] = useState(false);

  // Prevent document scrolling on scan page
  useEffect(() => {
    // Add class to body to prevent scrolling
    document.body.classList.add('scan-page-active');
    
    return () => {
      // Clean up - remove class when leaving page
      document.body.classList.remove('scan-page-active');
    };
  }, []);

  const handleBack = () => {
    navigate('/', { replace: true });
  };

  // Auto-open camera when page loads
  useEffect(() => {
    const openCameraOnLoad = async () => {
      // Small delay to ensure page is fully loaded
      setTimeout(() => {
        takePicture();
      }, 500);
    };

    openCameraOnLoad();
  }, []);


  const requestCameraPermission = async () => {
    try {
      console.log('🔍 Checking if running on native platform:', Capacitor.isNativePlatform());
      
      if (Capacitor.isNativePlatform()) {
        console.log('📱 Requesting camera permissions...');
        const permissions = await CapacitorCamera.requestPermissions({
          permissions: ['camera']
        });
        
        console.log('📋 Camera permission result:', permissions);
        
        if (permissions.camera === 'granted') {
          console.log('✅ Camera permission granted');
          return true;
        } else if (permissions.camera === 'denied') {
          console.log('❌ Camera permission denied');
          toast({
            title: "Camera Permission Denied",
            description: "Go to Settings > Privacy & Security > Camera > Your App Name and enable camera access",
            variant: "destructive",
          });
          return false;
        } else {
          console.log('⚠️ Camera permission status:', permissions.camera);
          return false;
        }
      }
      console.log('🌐 Running on web platform, returning true');
      return true;
    } catch (error) {
      console.error('❌ Permission request error:', error);
      return false;
    }
  };

  const takePicture = async () => {
    try {
      setIsLoading(true);
      console.log('📸 Requesting camera permission...');
      
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        setShowCameraOptions(true);
        return;
      }
      
      console.log('📸 Opening camera with config:', {
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        width: 1000,
        height: 1000,
        correctOrientation: true
      });
      
      const image = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        width: 1000,
        height: 1000,
        correctOrientation: true
      });

      console.log('✅ Photo captured successfully:', {
        hasDataUrl: !!image.dataUrl,
        format: image.format,
        webPath: image.webPath
      });
      setCapturedImage(image.dataUrl || null);
      setShowCameraOptions(false);
    } catch (error) {
      console.error('❌ Camera error details:', {
        message: error.message,
        code: error.code,
        error: error
      });
      setShowCameraOptions(true);
      
      // Check if user cancelled
      if (error.message && (error.message.includes('cancelled') || error.message.includes('User cancelled'))) {
        console.log('📷 User cancelled camera');
        // Don't show error toast for user cancellation
      } else {
        toast({
          title: "Camera Error",
          description: `Unable to access camera: ${error.message}`,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const requestPhotoPermission = async () => {
    try {
      console.log('🔍 Checking if running on native platform:', Capacitor.isNativePlatform());
      
      if (Capacitor.isNativePlatform()) {
        console.log('📱 Requesting photo permissions...');
        const permissions = await CapacitorCamera.requestPermissions({
          permissions: ['photos']
        });
        
        console.log('📋 Photo permission result:', permissions);
        
        if (permissions.photos === 'granted') {
          console.log('✅ Photo permission granted');
          return true;
        } else if (permissions.photos === 'denied') {
          console.log('❌ Photo permission denied');
          toast({
            title: "Photo Library Permission Denied",
            description: "Go to Settings > Privacy & Security > Photos > Your App Name and select 'All Photos'",
            variant: "destructive",
          });
          return false;
        } else {
          console.log('⚠️ Photo permission status:', permissions.photos);
          return false;
        }
      }
      console.log('🌐 Running on web platform, returning true');
      return true;
    } catch (error) {
      console.error('❌ Photo permission request error:', error);
      return false;
    }
  };

  const selectFromLibrary = async () => {
    try {
      setIsLoading(true);
      console.log('📱 Requesting photo library permission...');
      
      const hasPermission = await requestPhotoPermission();
      if (!hasPermission) {
        return;
      }
      
      console.log('📱 Opening photo library with config:', {
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
        width: 1000,
        height: 1000,
        correctOrientation: true
      });
      
      const image = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
        width: 1000,
        height: 1000,
        correctOrientation: true
      });

      console.log('✅ Photo selected successfully:', {
        hasDataUrl: !!image.dataUrl,
        format: image.format,
        webPath: image.webPath
      });
      setCapturedImage(image.dataUrl || null);
      setShowCameraOptions(false);
    } catch (error) {
      console.error('❌ Photo library error details:', {
        message: error.message,
        code: error.code,
        error: error
      });
      
      // Check if user cancelled
      if (error.message && (error.message.includes('cancelled') || error.message.includes('User cancelled'))) {
        console.log('📱 User cancelled photo selection');
        // Don't show error toast for user cancellation
      } else {
        toast({
          title: "Photo Library Error",
          description: `Unable to access photo library: ${error.message}`,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const identifyBottle = async () => {
    if (!capturedImage) return;
    
    setIsLoading(true);
    setIdentificationStatus('identifying');
    setIdentification(null);
    
    try {
      console.log('🔍 Starting bottle identification...');
      const result = await identifyBottleFromImage(capturedImage);
      
      setIdentification(result);
      setIdentificationStatus('success');
      
      toast({
        title: "Bottle Identified!",
        description: `Found: ${result.brand} ${result.name} (${Math.round(result.confidence * 100)}% confidence)`,
      });
      
    } catch (error) {
      console.error('❌ Identification failed:', error);
      setIdentificationStatus('error');
      
      toast({
        title: "Identification Failed",
        description: error instanceof Error ? error.message : "Unable to identify bottle. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearImage = () => {
    setCapturedImage(null);
    setIdentification(null);
    setIdentificationStatus('idle');
  };

  const cancelScan = () => {
    setCapturedImage(null);
    setIdentification(null);
    setIdentificationStatus('idle');
    setShowCameraOptions(true);
  };

  const addToInventory = () => {
    if (!identification || !capturedImage) return;
    
    // Navigate to AddItem page with pre-filled data and captured image
    const params = new URLSearchParams({
      name: `${identification.brand} ${identification.name}`.trim(),
      category: identification.category,
      description: identification.description,
      quantity: '1',
      capturedImage: capturedImage
    });
    
    navigate(`/add-item?${params.toString()}`);
  };

  const editBeforeAdding = () => {
    if (!identification || !capturedImage) return;
    
    // Navigate to AddItem page with pre-filled data, captured image, and edit flag
    const params = new URLSearchParams({
      name: `${identification.brand} ${identification.name}`.trim(),
      category: identification.category,
      description: identification.description,
      quantity: '1',
      capturedImage: capturedImage,
      edit_mode: 'true'
    });
    
    navigate(`/add-item?${params.toString()}`);
  };

  return (
    <div className="scan-page">
      {/* Centered content */}
      <div className="scan-content">
        <div className="w-full text-center">
        {capturedImage ? (
          <img 
            src={capturedImage} 
            alt="Captured bottle" 
            className="w-full h-40 object-cover rounded-lg border-2 border-gray-700 mb-4"
          />
        ) : showCameraOptions ? (
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <Camera className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-white font-space-grotesk text-sm mb-1">Choose Photo Source</p>
              <p className="text-gray-400 font-space-grotesk text-xs">Camera or library</p>
            </div>
            
            <div className="space-y-2">
              <Button
                onClick={takePicture}
                disabled={isLoading}
                className="w-full h-10 bg-amber-600 hover:bg-amber-700 text-black font-space-grotesk text-sm rounded-full"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Take Photo"
                )}
              </Button>
              
              <Button
                onClick={selectFromLibrary}
                disabled={isLoading}
                className="w-full h-10 bg-gray-700 hover:bg-gray-600 text-white font-space-grotesk text-sm rounded-full"
              >
                Choose from Library
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full h-32 bg-gray-800 rounded-lg border-2 border-dashed border-gray-600 flex flex-col items-center justify-center">
            <div className="w-6 h-6 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-gray-400 font-space-grotesk text-xs">Opening camera...</p>
          </div>
        )}

        {/* Identification Results */}
        {identification && identificationStatus === 'success' && (
          <div className="mt-4 w-full bg-gray-800 rounded-lg p-4 border border-green-600">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">{getCategoryEmoji(identification.category)}</div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-400 font-space-grotesk">
                    {Math.round(identification.confidence * 100)}% confident
                  </span>
                </div>
                <h3 className="font-bold font-space-grotesk text-white mb-1">
                  {identification.brand} {identification.name}
                </h3>
                <p className="text-xs text-gray-400 font-space-grotesk mb-2">
                  {getCategoryDisplayName(identification.category)}
                  {identification.alcoholContent && ` • ${identification.alcoholContent}`}
                  {identification.volume && ` • ${identification.volume}`}
                </p>
                <p className="text-xs text-gray-300 font-space-grotesk line-clamp-3">
                  {identification.description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Identification Error */}
        {identificationStatus === 'error' && (
          <div className="mt-4 w-full bg-gray-800 rounded-lg p-4 border border-red-600">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-400 font-space-grotesk">
                Could not identify bottle
              </span>
            </div>
            <p className="text-xs text-gray-400 font-space-grotesk mt-2">
              Try taking another photo with better lighting or a clearer view of the label.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-3 w-full space-y-2">
          {capturedImage && identificationStatus === 'success' && identification ? (
            /* Identification Success Actions */
            <>
              <Button
                onClick={addToInventory}
                className="w-full h-12 bg-amber-600 hover:bg-amber-700 text-black font-space-grotesk font-bold rounded-full"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Add to Inventory
              </Button>
              
              <Button
                onClick={cancelScan}
                className="w-full h-12 bg-gray-700 hover:bg-gray-600 text-white font-space-grotesk rounded-full"
              >
                Cancel
              </Button>
            </>
          ) : capturedImage ? (
            /* Default Image Actions */
            <>
              <Button
                onClick={identifyBottle}
                disabled={isLoading || identificationStatus === 'identifying'}
                className="w-full h-12 bg-amber-600 hover:bg-amber-700 text-black font-space-grotesk font-bold rounded-full"
              >
                {isLoading || identificationStatus === 'identifying' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                    Identifying...
                  </>
                ) : (
                  'Identify Bottle'
                )}
              </Button>
              
              <Button
                onClick={cancelScan}
                className="w-full h-12 bg-gray-700 hover:bg-gray-600 text-white font-space-grotesk font-bold rounded-full"
              >
                Cancel
              </Button>
            </>
          ) : null}
        </div>
        </div>
      </div>

    </div>
  );
};

export default Scan;