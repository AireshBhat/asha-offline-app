import React from 'react';
import { Heart, Wifi, WifiOff, Users, FolderSync as Sync } from 'lucide-react';
import { useHealth } from '../../contexts/HealthContext';
import { motion } from 'framer-motion';

export function Header() {
  const { currentUser, syncStatus, syncData } = useHealth();

  const handleSync = async () => {
    await syncData();
  };

  return (
    <header className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="bg-white/20 p-2 rounded-lg"
            >
              <Heart className="h-8 w-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold">ASHA स्वास्थ्य</h1>
              <p className="text-emerald-100 text-sm">Community Health Network</p>
            </div>
          </div>

          {/* User Info and Status */}
          <div className="flex items-center space-x-6">
            {/* Sync Status */}
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSync}
                className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Sync className="h-4 w-4" />
                <span className="text-sm">Sync</span>
              </motion.button>
              
              <div className="flex items-center space-x-1">
                {syncStatus.isOnline ? (
                  <Wifi className="h-4 w-4 text-emerald-200" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-300" />
                )}
                <span className="text-sm text-emerald-100">
                  {syncStatus.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>

            {/* User Info */}
            {currentUser && (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="font-medium">{currentUser.name}</p>
                  <p className="text-emerald-100 text-sm">{currentUser.village}, {currentUser.block}</p>
                </div>
                <div className="bg-white/20 p-2 rounded-full">
                  <Users className="h-5 w-5" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sync Status Bar */}
        {syncStatus.lastSync > 0 && (
          <div className="pb-2">
            <div className="flex items-center justify-between text-sm text-emerald-100">
              <span>
                Last sync: {new Date(syncStatus.lastSync).toLocaleTimeString()} 
                ({syncStatus.syncType})
              </span>
              <span>
                {syncStatus.documentsTransferred} documents transferred
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}