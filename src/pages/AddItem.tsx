import React, { useState } from 'react';
import { ArrowLeft, Plus, Minus, Upload, X, Grid3X3, Camera, Martini } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

const AddItem = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    quantity: 1,
    image: null as File | null
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  const handleSave = () => {
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter an item title.",
        variant: "destructive"
      });
      return;
    }
    
    // TODO: Add item to database
    console.log('Adding item:', formData);
    
    toast({
      title: "Item Added",
      description: `${formData.title} has been added to your inventory.`,
    });
    
    navigate('/');
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <ArrowLeft className="w-6 h-6 cursor-pointer" onClick={handleBack} />
        <h1 className="text-xl font-bold font-space-grotesk">Add Item</h1>
        <div className="w-6 h-6" /> {/* Spacer for centering */}
      </div>

      {/* Form Content */}
      <div className="px-6 py-6 space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-white font-space-grotesk">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter item name"
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 font-space-grotesk"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-white font-space-grotesk">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Enter description (optional)"
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
          <Label className="text-white font-space-grotesk">Picture (Optional)</Label>
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

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-6 pb-20">
          <Button 
            variant="outline"
            onClick={handleBack}
            className="flex-1 h-12 text-white border-gray-600 hover:bg-gray-800 font-space-grotesk"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!formData.title.trim()}
            className="flex-1 h-12 bg-amber-600 hover:bg-amber-700 text-black font-space-grotesk font-bold disabled:opacity-50 disabled:cursor-not-allowed"
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
            <Martini className="w-6 h-6 mb-1 text-gray-400" />
            <span className="text-xs font-space-grotesk text-gray-400">Mix</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddItem;