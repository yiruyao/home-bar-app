import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Grid3X3, Camera, Martini } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import whiskeyBottle from '@/assets/whiskey-bottle.png';
import ginBottle from '@/assets/gin-bottle.png';
import tequilaBottle from '@/assets/tequila-bottle.png';
import orangeLiqueurBottle from '@/assets/orange-liqueur-bottle.png';
import amarettoBottle from '@/assets/amaretto-bottle.png';
import coffeeLiqueurBottle from '@/assets/coffee-liqueur-bottle.png';
import tonicWaterBottle from '@/assets/tonic-water-bottle.png';
import gingerBeerBottle from '@/assets/ginger-beer-bottle.png';
import cranberryJuiceBottle from '@/assets/cranberry-juice-bottle.png';

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

      // Fetch item from database
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('id', id)
        .eq('user_id', mockUserId)
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
    navigate('/');
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = Math.max(0, quantity + change);
    setQuantity(newQuantity);
    setQuantityChanged(newQuantity !== originalQuantity);
  };

  const handleAddToInventory = async () => {
    try {
      if (quantity === 0) {
        // Delete the item
        const { error } = await supabase
          .from('items')
          .delete()
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
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <ArrowLeft className="w-6 h-6 cursor-pointer" onClick={handleBack} />
        <h1 className="text-xl font-bold font-space-grotesk">
          {isAddingNewItem ? "Add Item" : "Item Details"}
        </h1>
        <div className="w-6 h-6" /> {/* Spacer for centering */}
      </div>

      {/* Item Image */}
      <div className="relative h-80 bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
        {item.picture_url ? (
          <img 
            src={item.picture_url} 
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-8xl">🥃</div>
        )}
      </div>

      {/* Item Content */}
      <div className="px-6 py-6">
        {/* Item Info */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold font-space-grotesk">{item.name}</h2>
          <p className="text-gray-400 font-space-grotesk leading-relaxed">
            {item.description || "No description available."}
          </p>
        </div>

        {/* Quantity Section */}
        <div className="mt-8 mb-8">
          <div className="flex items-center justify-between">
            <span className="text-gray-300 font-space-grotesk text-left">
              {quantity} {quantity === 1 ? 'bottle' : 'bottles'}
            </span>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => handleQuantityChange(-1)}
                className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition-colors"
              >
                <Minus className="w-4 h-4 text-white" />
              </button>
              <span className="text-xl font-bold font-space-grotesk w-8 text-center text-white">
                {quantity}
              </span>
              <button 
                onClick={() => handleQuantityChange(1)}
                className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition-colors"
              >
                <Plus className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pb-20">
          <Button 
            onClick={handleEdit}
            className="px-8 py-3 h-12 bg-amber-600 hover:bg-amber-700 text-black font-space-grotesk rounded-full border-0"
          >
            Edit
          </Button>
          <Button 
            onClick={handleAddToInventory}
            className={`flex-1 h-12 font-space-grotesk font-bold rounded-full transition-colors ${
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

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800">
        <div className="flex justify-around items-center py-3">
          <div className="flex flex-col items-center cursor-pointer" onClick={() => navigate('/')}>
            <Grid3X3 className="w-6 h-6 mb-1 text-white" />
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
    </div>
  );
};

export default ItemDetails;