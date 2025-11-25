import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Settings} from 'lucide-react';

interface HeaderProps {
  username: string;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ username, onLogout }) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          {/* Logo and Title Section */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-primary shrink-0" />
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">
                Admin Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 truncate hidden sm:block">
                CopyExpress Claremont
              </p>
            </div>
          </div>

          {/* User Info and Logout Section */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <span className="text-xs sm:text-sm text-gray-600 hidden md:inline truncate max-w-[120px]">
              Welcome, {username}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onLogout}
              className="shrink-0"
            >
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};