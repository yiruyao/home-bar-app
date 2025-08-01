import React, { useState } from 'react';
import { X, Plus, Minus, Upload, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface AddItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: any) => void;
}

const AddItemForm: React.FC<AddItemFormProps> = ({ isOpen, onClose, onSave }) => {
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
      return; // Could add validation feedback here
    }
    
    onSave(formData);
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      quantity: 1,
      image: null
    });
    setImagePreview(null);
    onClose();
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      quantity: 1,
      image: null
    });
    setImagePreview(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold font-space-grotesk text-white">Add Item</h2>
          <button onClick={handleClose}>
            <X className="w-6 h-6 text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
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
              rows={3}
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 font-space-grotesk resize-none"
            />
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label className="text-white font-space-grotesk">Quantity</Label>
            <div className="flex items-center justify-between bg-gray-800 rounded-md p-3">
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
                    className="w-full h-32 object-cover rounded-md"
                  />
                  <button
                    onClick={() => {
                      setImagePreview(null);
                      setFormData(prev => ({ ...prev, image: null }));
                    }}
                    className="absolute top-2 right-2 w-6 h-6 bg-black bg-opacity-50 rounded-full flex items-center justify-center"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-700 border-dashed rounded-md cursor-pointer hover:border-gray-600">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-400" />
                    <p className="text-sm text-gray-400 font-space-grotesk">Click to upload image</p>
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
          <div className="flex space-x-3 pt-4">
            <Button 
              variant="outline"
              onClick={handleClose}
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
      </div>
    </div>
  );
};

export default AddItemForm;