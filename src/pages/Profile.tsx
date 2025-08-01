import React from 'react';
import { ArrowLeft, Grid3X3, Camera, Martini } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  // Mock test user data
  const testUser = {
    first_name: 'Yiru',
    last_name: 'Yao',
    email: 'yiru82@gmail.com'
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
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
        <h2 className="text-2xl font-bold font-space-grotesk mb-2">{testUser.first_name} {testUser.last_name}</h2>
        <p className="text-gray-400 font-space-grotesk">{testUser.email}</p>
      </div>

      {/* Sign Out Button */}
      <div className="px-6 pb-20">
        <Button 
          onClick={handleSignOut}
          className="px-8 py-3 h-12 bg-amber-600 hover:bg-amber-700 text-black font-space-grotesk rounded-full border-0 mx-auto block"
        >
          Sign Out
        </Button>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800">
        <div className="flex justify-around items-center py-3">
          <div className="flex flex-col items-center cursor-pointer" onClick={() => navigate('/')}>
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