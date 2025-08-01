import React from 'react';
import { ArrowLeft, Grid3X3, Camera, Martini } from 'lucide-react';

const Profile = () => {
  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <ArrowLeft className="w-6 h-6 cursor-pointer" onClick={handleBack} />
        <h1 className="text-xl font-bold font-space-grotesk">Profile</h1>
        <div className="w-6 h-6" /> {/* Spacer for centering */}
      </div>

      {/* Profile Content */}
      <div className="px-6 py-12 text-center">
        {/* Avatar */}
        <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-300 to-orange-400 flex items-center justify-center overflow-hidden">
          <img 
            src="/lovable-uploads/49d6d963-de0b-4170-803b-f75ab3b3c6ea.png" 
            alt="Profile Avatar" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* User Info */}
        <h2 className="text-2xl font-bold font-space-grotesk mb-2">Yiru Yao</h2>
        <p className="text-gray-400 font-space-grotesk">yiru82@gmail.com</p>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800">
        <div className="flex justify-around items-center py-3">
          <div className="flex flex-col items-center cursor-pointer" onClick={() => window.location.href = '/'}>
            <Grid3X3 className="w-6 h-6 mb-1 text-gray-400" />
            <span className="text-xs font-space-grotesk text-gray-400">Inventory</span>
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

export default Profile;