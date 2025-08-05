import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Grid3X3, Camera, Martini } from 'lucide-react';

interface TabItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  path: string;
}

const IOSTabBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs: TabItem[] = [
    {
      id: 'inventory',
      icon: <Grid3X3 className="w-6 h-6" />,
      label: 'Inventory',
      path: '/'
    },
    {
      id: 'scan',
      icon: <Camera className="w-6 h-6" />,
      label: 'Scan',
      path: '/scan'
    },
    {
      id: 'mix',
      icon: <Martini className="w-6 h-6" />,
      label: 'Mix',
      path: '/mix'
    }
  ];

  const handleTabPress = (path: string) => {
    navigate(path, { replace: true });
  };

  const isActiveTab = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="ios-tab-bar" style={{ margin: 0, padding: 0 }}>
      <div className="flex justify-center items-center py-2" style={{ paddingBottom: 'calc(8px + env(safe-area-inset-bottom))', margin: 0 }}>
        {tabs.map((tab, index) => {
          const isActive = isActiveTab(tab.path);
          return (
            <div key={tab.id} className="flex-1 flex justify-center">
              <button
                onClick={() => handleTabPress(tab.path)}
                className="flex flex-col items-center justify-center py-1"
              >
                <div className={`mb-1 transition-colors ${
                  isActive ? 'text-white' : 'text-gray-400'
                }`}>
                  {tab.icon}
                </div>
                <span className={`text-xs font-space-grotesk transition-colors ${
                  isActive ? 'text-white' : 'text-gray-400'
                }`}>
                  {tab.label}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IOSTabBar;