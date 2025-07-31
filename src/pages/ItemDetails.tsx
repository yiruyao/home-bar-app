import React, { useState } from 'react';
import { ArrowLeft, Plus, Minus, Grid3X3, Camera, BookOpen } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ItemDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [quantity, setQuantity] = useState(1);
  
  // Check if this is for adding a new item or editing existing
  const isNewItem = location.pathname === '/add-item';
  
  const handleBack = () => {
    navigate('/');
  };

  const handleQuantityChange = (change: number) => {
    setQuantity(Math.max(1, quantity + change));
  };

  const handleAddToInventory = () => {
    // TODO: Add to inventory logic
    navigate('/');
  };

  const handleEdit = () => {
    // TODO: Edit logic
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <ArrowLeft className="w-6 h-6 cursor-pointer" onClick={handleBack} />
        <h1 className="text-xl font-bold font-space-grotesk">Item Details</h1>
        <div className="w-6 h-6" /> {/* Spacer for centering */}
      </div>

      {/* Item Image */}
      <div className="bg-gradient-to-b from-amber-400 to-amber-600 h-64 flex items-center justify-center">
        <img 
          src="/lovable-uploads/2469f007-8c8f-4ff7-a1b9-cb8df0a979d0.png" 
          alt="Whiskey bottle" 
          className="h-48 object-contain"
        />
      </div>

      {/* Item Content */}
      <div className="px-6 py-6">
        {/* Item Name */}
        <h2 className="text-2xl font-bold font-space-grotesk mb-4">Whiskey</h2>
        
        {/* Description */}
        <p className="text-gray-300 font-space-grotesk mb-6 leading-relaxed">
          A classic spirit with a rich history, known for its complex flavors and smooth finish. Perfect for sipping neat, on the rocks, or in a variety of cocktails.
        </p>

        {/* Quantity Section */}
        <div className="mb-8">
          <h3 className="text-lg font-bold font-space-grotesk mb-4">Quantity</h3>
          <div className="flex items-center justify-between">
            <span className="text-gray-300 font-space-grotesk">1 bottle</span>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => handleQuantityChange(-1)}
                className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-xl font-bold font-space-grotesk w-8 text-center">{quantity}</span>
              <button 
                onClick={() => handleQuantityChange(1)}
                className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 mb-8">
          <Button 
            variant="outline"
            onClick={handleEdit}
            className="flex-1 h-12 text-white border-gray-600 hover:bg-gray-800 font-space-grotesk"
          >
            Edit
          </Button>
          <Button 
            onClick={handleAddToInventory}
            className="flex-1 h-12 bg-amber-600 hover:bg-amber-700 text-black font-space-grotesk font-bold"
          >
            Add to Inventory
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
            <BookOpen className="w-6 h-6 mb-1 text-gray-400" />
            <span className="text-xs font-space-grotesk text-gray-400">Recipes</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;