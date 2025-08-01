import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
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
  const [quantity, setQuantity] = useState(1);
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [quantityChanged, setQuantityChanged] = useState(false);
  const [originalQuantity, setOriginalQuantity] = useState(1);

  // Mock data as fallback for when database doesn't have the item
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

  const isAddingNewItem = location.pathname === '/add-item';

  // Fetch item data on component mount
  useEffect(() => {
    const fetchItem = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      // Check if this is a mock item ID (simple numbers)
      const isMockId = /^\d+$/.test(id);
      
      if (!isMockId) {
        // Try to fetch from database for real UUIDs
        try {
          const { data, error } = await supabase
            .from('items')
            .select('*')
            .eq('id', id)
            .single();

          if (data && !error) {
            setItem(data);
            setQuantity(data.quantity);
            setOriginalQuantity(data.quantity);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Error fetching item:', error);
        }
      }
      
      // Fallback to mock data for simple IDs or when database fetch fails
      const mockItem = mockItems.find(item => item.id === id);
      if (mockItem) {
        setItem(mockItem);
        setQuantity(mockItem.quantity);
        setOriginalQuantity(mockItem.quantity);
      }
      
      setLoading(false);
    };

    fetchItem();
  }, [id]);

  const handleBack = () => {
    window.location.href = '/';
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = Math.max(1, quantity + change);
    setQuantity(newQuantity);
    setQuantityChanged(newQuantity !== originalQuantity);
  };

  const handleAddToInventory = async () => {
    try {
      // Check if this is a mock item ID (simple numbers)
      const isMockId = /^\d+$/.test(id);
      
      if (isMockId) {
        // For mock items, just show success message without database update
        toast({
          title: "Updated Inventory",
          description: `${item?.name || 'Item'} quantity updated to ${quantity}.`,
        });
        setOriginalQuantity(quantity);
        setQuantityChanged(false);
        return;
      }

      // For real database items, update in database
      const mockUserId = 'mock-user-yiru-yao';
      
      // Update quantity in database
      const { error } = await supabase
        .from('items')
        .update({ 
          quantity: quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', mockUserId);

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
    window.location.href = `/add-item?edit=${id}&name=${encodeURIComponent(item?.name || '')}&category=${item?.category || ''}&description=${encodeURIComponent(item?.description || '')}&quantity=${quantity}`;
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
                ? 'bg-amber-600 hover:bg-amber-700 text-black' 
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
          >
            Update
          </Button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800">
        <div className="flex justify-around items-center py-3">
          <div className="flex flex-col items-center cursor-pointer" onClick={() => window.location.href = '/'}>
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