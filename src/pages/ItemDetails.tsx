import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Grid3X3, Camera, Martini } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ItemImage } from '@/components/ItemImage';

const ItemDetails = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [quantityChanged, setQuantityChanged] = useState(false);
  const [originalQuantity, setOriginalQuantity] = useState(1);


  // Mock user ID (UUID format for database compatibility)
  const mockUserId = '12345678-1234-1234-1234-123456789012';

  const isAddingNewItem = location.pathname === '/add-item';

  // Reset scroll position when component mounts
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    // Also reset any page content scroll
    const pageContent = document.querySelector('.page-content');
    if (pageContent) {
      pageContent.scrollTop = 0;
    }
  }, [id]);

  // Set up mock authentication and fetch item data
  useEffect(() => {
    const setupAuthAndFetchItem = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      // Mock authentication session
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

      // Fetch item from database (exclude soft-deleted items)
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('id', id)
        .eq('user_id', mockUserId)
        .is('deleted_at', null)
        .maybeSingle();

      if (data && !error) {
        setItem(data);
        setQuantity(data.quantity);
        setOriginalQuantity(data.quantity);
      }
      
      setLoading(false);
    };

    setupAuthAndFetchItem();
  }, [id]);

  const handleBack = () => {
    navigate('/', { replace: true });
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = Math.max(0, quantity + change);
    setQuantity(newQuantity);
    setQuantityChanged(newQuantity !== originalQuantity);
  };

  const handleAddToInventory = async () => {
    try {
      if (quantity === 0) {
        // Soft delete the item by setting deleted_at timestamp
        const { error } = await supabase
          .from('items')
          .update({ 
            deleted_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id);

        if (error) {
          console.error('Error deleting item:', error);
          toast({
            title: "Error",
            description: "Failed to delete item. Please try again.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Item Deleted",
          description: `${item?.name || 'Item'} has been removed from your inventory.`,
        });
        
        // Navigate back to home
        navigate('/');
        return;
      }

      // Update item quantity in database
      const { error } = await supabase
        .from('items')
        .update({ 
          quantity: quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id);

      if (error) {
        console.error('Error updating quantity:', error);
        toast({
          title: "Error",
          description: "Failed to update quantity. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Updated Inventory",
        description: `${item?.name || 'Item'} quantity updated to ${quantity}.`,
      });
      setOriginalQuantity(quantity);
      setQuantityChanged(false);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = () => {
    // Navigate to add-item page with current item data for editing
    navigate(`/add-item?edit=${item.id}&name=${encodeURIComponent(item?.name || '')}&category=${item?.category || ''}&description=${encodeURIComponent(item?.description || '')}&quantity=${quantity}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <ArrowLeft className="w-6 h-6 cursor-pointer" onClick={handleBack} />
          <h1 className="text-xl font-bold font-space-grotesk">Item Not Found</h1>
          <div className="w-6 h-6" />
        </div>
        <div className="px-6 py-12 text-center">
          <p className="text-gray-400 font-space-grotesk">Item not found</p>
          <Button 
            onClick={handleBack}
            className="mt-4 bg-amber-600 hover:bg-amber-700 text-black font-space-grotesk"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-black text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 safe-area-top">
        <ArrowLeft className="w-6 h-6 cursor-pointer" onClick={handleBack} />
        <h1 className="text-xl font-bold font-space-grotesk">
          {isAddingNewItem ? "Add Item" : "Item Details"}
        </h1>
        <div className="w-6 h-6" /> {/* Spacer for centering */}
      </div>

      {/* Item Image */}
      <div className="relative h-64 bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
        {item.picture_url ? (
          <ItemImage 
            src={item.picture_url} 
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-6xl">🥃</div>
        )}
      </div>

      {/* Item Content - Scrollable with tab bar spacing */}
      <div className="flex-1 overflow-y-auto px-6 py-4 pb-24">
        {/* Item Info */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold font-space-grotesk">{item.name}</h2>
          <p className="text-gray-400 font-space-grotesk text-sm leading-relaxed">
            {item.description || "No description available."}
          </p>
        </div>

        {/* Quantity Section */}
        <div className="mt-6 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-300 font-space-grotesk text-sm">
              {quantity} {quantity === 1 ? 'bottle' : 'bottles'}
            </span>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => handleQuantityChange(-1)}
                className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition-colors"
              >
                <Minus className="w-4 h-4 text-white" />
              </button>
              <span className="text-lg font-bold font-space-grotesk w-8 text-center text-white">
                {quantity}
              </span>
              <button 
                onClick={() => handleQuantityChange(1)}
                className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition-colors"
              >
                <Plus className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-4">
          <Button 
            onClick={handleEdit}
            className="px-6 py-2 h-10 bg-amber-600 hover:bg-amber-700 text-black font-space-grotesk rounded-full border-0 text-sm"
          >
            Edit
          </Button>
          <Button 
            onClick={handleAddToInventory}
            className={`flex-1 h-10 font-space-grotesk font-bold rounded-full transition-colors text-sm ${
              quantityChanged 
                ? quantity === 0
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-amber-600 hover:bg-amber-700 text-black'
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
          >
            {quantity === 0 ? 'Delete' : 'Update'}
          </Button>
        </div>
      </div>

    </div>
  );
};

export default ItemDetails;