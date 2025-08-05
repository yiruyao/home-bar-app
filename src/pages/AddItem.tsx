import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Upload, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { uploadImage, getImageUrl } from '@/lib/storage';
import { generateBottleImagePrompt, generateBottleImage } from '@/lib/image-generation';
import whiskeyBottle from '@/assets/whiskey-bottle.png';
import ginBottle from '@/assets/gin-bottle.png';
import tequilaBottle from '@/assets/tequila-bottle.png';
import orangeLiqueurBottle from '@/assets/orange-liqueur-bottle.png';
import amarettoBottle from '@/assets/amaretto-bottle.png';
import coffeeLiqueurBottle from '@/assets/coffee-liqueur-bottle.png';
import tonicWaterBottle from '@/assets/tonic-water-bottle.png';
import gingerBeerBottle from '@/assets/ginger-beer-bottle.png';
import cranberryJuiceBottle from '@/assets/cranberry-juice-bottle.png';

type CategoryType = 'spirits' | 'liqueurs' | 'mixers' | 'bitters' | 'garnishes' | 'other';

const AddItem = () => {
  const navigate = useNavigate();

  // Prevent document scrolling on add item page
  useEffect(() => {
    // Add class to body to prevent scrolling
    document.body.classList.add('add-item-page-active');
    
    return () => {
      // Clean up - remove class when leaving page
      document.body.classList.remove('add-item-page-active');
    };
  }, []);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '' as CategoryType | '',
    quantity: 1,
    image: null as File | null
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Mock data for fallback when editing mock items
  const mockItems = [
    {
      id: '1',
      name: 'Rittenhouse Rye Whiskey',
      category: 'spirits',
      description: 'A 100-proof straight rye whiskey perfect for classic cocktails like Manhattans and Old Fashioneds. Known for its spicy character and ability to cut through citrus and bitters.',
      quantity: 1,
      picture_url: whiskeyBottle
    },
    {
      id: '2', 
      name: "Hendrick's Gin",
      category: 'spirits',
      description: 'A distinctive gin infused with cucumber and rose petals, offering a unique botanical profile that works beautifully in gin and tonics or martinis.',
      quantity: 1,
      picture_url: ginBottle
    },
    {
      id: '3',
      name: 'Espolòn Tequila Blanco', 
      category: 'spirits',
      description: 'A premium 100% blue agave tequila with bright, crisp flavor perfect for margaritas and other agave-based cocktails. Clean finish with hints of pepper and citrus.',
      quantity: 1,
      picture_url: tequilaBottle
    },
    {
      id: '4',
      name: 'Cointreau Triple Sec',
      category: 'liqueurs', 
      description: 'Premium French orange liqueur made from sweet and bitter orange peels. Essential for classics like Margaritas, Cosmopolitans, and Sidecars.',
      quantity: 1,
      picture_url: orangeLiqueurBottle
    },
    {
      id: '5',
      name: 'Disaronno Amaretto',
      category: 'liqueurs',
      description: 'Italian almond liqueur with a distinctive sweet almond flavor and smooth finish. Perfect for Amaretto Sours or as a dessert drink ingredient.',
      quantity: 1, 
      picture_url: amarettoBottle
    },
    {
      id: '6',
      name: 'Kahlúa Coffee Liqueur',
      category: 'liqueurs',
      description: 'Rich Mexican coffee liqueur made with rum, sugar, and arabica coffee. Essential for White Russians, Espresso Martinis, and Mudslides.',
      quantity: 1,
      picture_url: coffeeLiqueurBottle
    },
    {
      id: '7',
      name: 'Fever-Tree Tonic Water',
      category: 'mixers',
      description: 'Premium tonic water made with natural quinine from the Congo. Provides the perfect bitter balance for gin and tonics with its crisp, clean taste.',
      quantity: 4,
      picture_url: tonicWaterBottle
    },
    {
      id: '8', 
      name: 'Q Ginger Beer',
      category: 'mixers',
      description: 'Artisanal ginger beer with real ginger and agave. Spicy and refreshing, perfect for Moscow Mules, Dark & Stormys, and other ginger cocktails.',
      quantity: 2,
      picture_url: gingerBeerBottle
    },
    {
      id: '9',
      name: 'Ocean Spray Cranberry Juice',
      category: 'mixers', 
      description: 'Classic cranberry juice cocktail with sweet-tart flavor. Essential for Cosmopolitans, Cape Codders, and adding color to mixed drinks.',
      quantity: 1,
      picture_url: cranberryJuiceBottle
    }
  ];

  // Handle URL parameters for editing or pre-filling from bottle identification
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    const name = urlParams.get('name');
    const category = urlParams.get('category');
    const description = urlParams.get('description');
    const quantity = urlParams.get('quantity');
    const editMode = urlParams.get('edit_mode');
    const capturedImage = urlParams.get('capturedImage');

    if (editId && name) {
      // Editing existing item
      setIsEditing(true);
      setEditingItemId(editId);
      setFormData({
        title: decodeURIComponent(name),
        description: description ? decodeURIComponent(description) : '',
        category: category as CategoryType || '',
        quantity: quantity ? parseInt(quantity) : 1,
        image: null
      });
      
      // Fetch the item to get the picture URL
      fetchItemForEdit(editId);
    } else if (name) {
      // Pre-filling from bottle identification (not editing existing item)
      setFormData({
        title: decodeURIComponent(name),
        description: description ? decodeURIComponent(description) : '',
        category: category as CategoryType || '',
        quantity: quantity ? parseInt(quantity) : 1,
        image: null
      });
      
      // Set the captured image as preview if available
      if (capturedImage) {
        setImagePreview(decodeURIComponent(capturedImage));
      }
    }
  }, []);

  const fetchItemForEdit = async (itemId: string) => {
    try {
      // Check if this is a mock item ID (simple numbers)
      const isMockId = /^\d+$/.test(itemId);
      
      if (isMockId) {
        // For mock items, get the picture from mock data
        const mockItem = mockItems.find(item => item.id === itemId);
        if (mockItem && mockItem.picture_url) {
          setImagePreview(mockItem.picture_url);
        }
        return;
      }

      // For real database items, fetch from database
      const { data, error } = await supabase
        .from('items')
        .select('picture_url')
        .eq('id', itemId)
        .single();

      if (data && data.picture_url) {
        // Convert storage path to signed URL for preview
        try {
          const signedUrl = await getImageUrl(data.picture_url);
          setImagePreview(signedUrl);
        } catch (imageError) {
          console.error('Error getting signed URL for image:', imageError);
          // Fallback to raw URL in case it's already a full URL
          setImagePreview(data.picture_url);
        }
      }
    } catch (error) {
      console.error('Error fetching item for edit:', error);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = Math.max(1, formData.quantity + change);
    setFormData(prev => ({
      ...prev,
      quantity: newQuantity
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Title is required.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.category) {
      toast({
        title: "Validation Error", 
        description: "Category is required.",
        variant: "destructive",
      });
      return;
    }

    if (formData.quantity < 1) {
      toast({
        title: "Validation Error",
        description: "Quantity must be at least 1.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Mock user ID (UUID format for database compatibility)
      const mockUserId = '12345678-1234-1234-1234-123456789012';
      
      // Set up mock authentication session
      await supabase.auth.setSession({
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        user: {
          id: mockUserId,
          email: 'yiru.yao@example.com',
          user_metadata: { name: 'Yiru Yao' },
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      } as any);
      
      // Handle image upload to Supabase storage
      let pictureUrl = null;
      if (formData.image) {
        try {
          console.log('📤 Uploading image to baritems bucket...');
          
          // Generate unique filename
          const fileExt = formData.image.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          
          console.log('📝 Generated filename:', fileName);
          
          const uploadResult = await uploadImage(formData.image, fileName);
          pictureUrl = fileName; // Store just the filename
          
          console.log('✅ Image uploaded successfully:', fileName);
          
          toast({
            title: "Image Uploaded",
            description: "Image uploaded successfully!",
          });
        } catch (uploadError) {
          console.error('❌ Image upload failed:', uploadError);
          toast({
            title: "Upload Error",
            description: "Failed to upload image. Item will be saved without image.",
            variant: "destructive",
          });
        }
      } else if (imagePreview && imagePreview.startsWith('data:')) {
        // Handle captured base64 image from scan
        try {
          console.log('📤 Uploading captured image to baritems bucket...');
          
          // Convert base64 to blob
          const response = await fetch(imagePreview);
          const blob = await response.blob();
          
          // Generate unique filename
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.jpg`;
          
          console.log('📝 Generated filename for captured image:', fileName);
          
          // Create File object from blob
          const file = new File([blob], fileName, { type: 'image/jpeg' });
          const uploadResult = await uploadImage(file, fileName);
          pictureUrl = fileName; // Store just the filename
          
          console.log('✅ Captured image uploaded successfully:', fileName);
          
          toast({
            title: "Image Uploaded",
            description: "Captured image uploaded successfully!",
          });
        } catch (uploadError) {
          console.error('❌ Captured image upload failed:', uploadError);
          toast({
            title: "Upload Error",
            description: "Failed to upload captured image. Item will be saved without image.",
            variant: "destructive",
          });
        }
      }
      
      // Generate AI image if no image is provided
      if (!pictureUrl && !imagePreview) {
        try {
          console.log('🎨 No image provided, generating AI image...');
          
          const prompt = generateBottleImagePrompt(
            formData.title, 
            formData.category as CategoryType, 
            formData.description
          );
          
          console.log('🖼️ Generated prompt:', prompt);
          
          const generatedImageUrl = await generateBottleImage(prompt);
          
          if (generatedImageUrl) {
            // Download the generated image and upload to Supabase storage
            const response = await fetch(generatedImageUrl);
            const blob = await response.blob();
            
            // Generate unique filename
            const fileName = `ai-${Date.now()}-${Math.random().toString(36).substring(2)}.jpg`;
            
            console.log('📝 Generated AI image filename:', fileName);
            
            // Create File object from blob
            const file = new File([blob], fileName, { type: 'image/jpeg' });
            const uploadResult = await uploadImage(file, fileName);
            pictureUrl = fileName; // Store just the filename
            
            console.log('✅ AI generated image uploaded successfully:', fileName);
            
            toast({
              title: "Image Generated",
              description: "AI generated a product image for your bottle!",
            });
          }
        } catch (aiError) {
          console.error('❌ AI image generation failed:', aiError);
          // Don't show error toast, just continue without image
        }
      }
      
      if (isEditing && editingItemId) {
        // Check if this is a mock item ID
        const isMockId = /^\d+$/.test(editingItemId);
        
        if (isMockId) {
          // For mock items, create a new database entry instead of updating
          const { data, error } = await supabase
            .from('items')
            .insert({
              name: formData.title.trim(),
              category: formData.category as CategoryType,
              description: formData.description.trim() || null,
              quantity: formData.quantity,
              user_id: mockUserId,
              picture_url: pictureUrl // Use uploaded filename or null
            })
            .select()
            .single();

          if (error) {
            console.error('Error creating database item:', error);
            toast({
              title: "Error",
              description: "Failed to save item. Please try again.",
              variant: "destructive",
            });
            return;
          }

          toast({
            title: "Item Saved",
            description: `${formData.title} has been saved to the database.`,
          });
        } else {
          // Update existing database item
          const updateData: any = {
            name: formData.title.trim(),
            category: formData.category as CategoryType,
            description: formData.description.trim() || null,
            quantity: formData.quantity,
            updated_at: new Date().toISOString()
          };
          
          // Only update picture_url if a new image was uploaded
          if (pictureUrl) {
            updateData.picture_url = pictureUrl;
          }
          
          const { data, error } = await supabase
            .from('items')
            .update(updateData)
            .eq('id', editingItemId)
            .select()
            .single();

          if (error) {
            console.error('Error updating item:', error);
            toast({
              title: "Error",
              description: "Failed to update item. Please try again.",
              variant: "destructive",
            });
            return;
          }

          toast({
            title: "Item Updated",
            description: `${formData.title} has been updated successfully.`,
          });
        }
      } else {
        // Insert new item
        const { data, error } = await supabase
          .from('items')
          .insert({
            name: formData.title.trim(),
            category: formData.category as CategoryType,
            description: formData.description.trim() || null,
            quantity: formData.quantity,
            user_id: mockUserId,
            picture_url: pictureUrl // Use uploaded filename or null
          })
          .select()
          .single();

        if (error) {
          console.error('Error adding item:', error);
          toast({
            title: "Error",
            description: "Failed to add item to inventory. Please try again.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Item Added",
          description: `${formData.title} has been added to your inventory.`,
        });
      }
      
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    navigate('/', { replace: true });
  };

  return (
    <div className="add-item-page-container bg-black text-white" style={{ height: '100vh', width: '100vw', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
      {/* Header - Fixed */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 bg-black border-b border-gray-800 safe-area-top z-50" style={{ position: 'fixed', top: 0 }}>
        <ArrowLeft className="w-6 h-6 cursor-pointer" onClick={handleBack} />
        <h1 className="text-xl font-bold font-space-grotesk text-center">{isEditing ? 'Edit Item' : 'Add Item'}</h1>
        <div className="w-6 h-6" /> {/* Spacer for centering */}
      </div>

      {/* Scrollable form content area */}
      <div 
        className="absolute left-0 right-0 overflow-y-auto px-6 py-6 space-y-6" 
        style={{ 
          top: '120px', 
          bottom: '83px', 
          position: 'absolute',
          overscrollBehavior: 'contain',
          touchAction: 'pan-y',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-white font-space-grotesk">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 font-space-grotesk"
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label className="text-white font-space-grotesk">Category</Label>
          <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white font-space-grotesk">
              <SelectValue className="text-white" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 z-50">
              <SelectItem value="spirits" className="text-white hover:bg-gray-700 focus:bg-gray-700 focus:text-white">Spirits</SelectItem>
              <SelectItem value="liqueurs" className="text-white hover:bg-gray-700 focus:bg-gray-700 focus:text-white">Liqueurs</SelectItem>
              <SelectItem value="mixers" className="text-white hover:bg-gray-700 focus:bg-gray-700 focus:text-white">Mixers</SelectItem>
              <SelectItem value="bitters" className="text-white hover:bg-gray-700 focus:bg-gray-700 focus:text-white">Bitters</SelectItem>
              <SelectItem value="garnishes" className="text-white hover:bg-gray-700 focus:bg-gray-700 focus:text-white">Garnishes</SelectItem>
              <SelectItem value="other" className="text-white hover:bg-gray-700 focus:bg-gray-700 focus:text-white">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-white font-space-grotesk">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 font-space-grotesk resize-none"
          />
        </div>

        {/* Quantity */}
        <div className="space-y-2">
          <Label className="text-white font-space-grotesk">Quantity</Label>
          <div className="flex items-center justify-between bg-gray-800 rounded-md p-4">
            <span className="text-gray-300 font-space-grotesk">Bottles/Units</span>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => handleQuantityChange(-1)}
                className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600"
              >
                <Minus className="w-4 h-4 text-white" />
              </button>
              <span className="text-xl font-bold font-space-grotesk w-8 text-center text-white">
                {formData.quantity}
              </span>
              <button 
                onClick={() => handleQuantityChange(1)}
                className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600"
              >
                <Plus className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <Label className="text-white font-space-grotesk">Picture</Label>
          <div className="space-y-3">
            {imagePreview ? (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-48 object-cover rounded-md"
                />
                <button
                  onClick={() => {
                    setImagePreview(null);
                    setFormData(prev => ({ ...prev, image: null }));
                  }}
                  className="absolute top-2 right-2 w-8 h-8 bg-black bg-opacity-75 rounded-full flex items-center justify-center hover:bg-opacity-100"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-700 border-dashed rounded-md cursor-pointer hover:border-gray-600">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 mb-3 text-gray-400" />
                  <p className="text-lg text-gray-400 font-space-grotesk mb-1">Click to upload image</p>
                  <p className="text-sm text-gray-500 font-space-grotesk">PNG, JPG, JPEG up to 10MB</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-6 pb-20">
          <Button 
            onClick={handleSave}
            className="w-full h-12 bg-amber-600 hover:bg-amber-700 text-black font-space-grotesk font-bold"
          >
            {isEditing ? 'Update Item' : 'Add to Inventory'}
          </Button>
        </div>
      </div>

    </div>
  );
};

export default AddItem;