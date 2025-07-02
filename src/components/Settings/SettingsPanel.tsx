import React, { useState } from 'react';
import { Settings, User, Shield, Wifi, Database, Download, Upload, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';
import { useHealth } from '../../contexts/HealthContext';

export function SettingsPanel() {
  const { currentUser, syncStatus, discoverNearbyWorkers } = useHealth();
  const [nearbyWorkers, setNearbyWorkers] = useState<string[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);

  const handleDiscoverWorkers = async () => {
    setIsDiscovering(true);
    try {
      const workers = await discoverNearbyWorkers();
      setNearbyWorkers(workers);
    } catch (error) {
      console.error('Failed to discover workers:', error);
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleExportData = () => {
    // In a real implementation, this would export Earthstar documents
    const data = {
      timestamp: new Date().toISOString(),
      user: currentUser?.name,
      note: 'Earthstar health data export'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `asha-health-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-600">System configuration and data management</p>
      </div>

      {/* User Profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center space-x-2 mb-4">
          <User className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">ASHA Worker Profile</h3>
        </div>
        
        {currentUser && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={currentUser.name}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                <input
                  type="text"
                  value={currentUser.registrationNumber}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Village</label>
                <input
                  type="text"
                  value={currentUser.village}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Block</label>
                <input
                  type="text"
                  value={currentUser.block}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
            </div>
            
            <div className="bg-emerald-50 p-4 rounded-lg">
              <h4 className="font-medium text-emerald-900 mb-1">Earthstar Identity</h4>
              <p className="text-sm text-emerald-700 font-mono break-all">
                {currentUser.identity.address}
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Sync & Network */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center space-x-2 mb-4">
          <Wifi className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Network & Synchronization</h3>
        </div>
        
        <div className="space-y-4">
          {/* Sync Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-1">Connection Status</h4>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${syncStatus.isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-700">
                  {syncStatus.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-1">Last Sync</h4>
              <p className="text-sm text-gray-700">
                {syncStatus.lastSync > 0 
                  ? new Date(syncStatus.lastSync).toLocaleString()
                  : 'Never'
                }
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-1">Sync Method</h4>
              <p className="text-sm text-gray-700 capitalize">
                {syncStatus.syncType.replace('_', ' ')}
              </p>
            </div>
          </div>

          {/* Nearby Workers Discovery */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Nearby ASHA Workers</h4>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDiscoverWorkers}
                disabled={isDiscovering}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-3 py-1 rounded-lg text-sm transition-colors flex items-center space-x-1"
              >
                <Smartphone className="h-4 w-4" />
                <span>{isDiscovering ? 'Discovering...' : 'Discover'}</span>
              </motion.button>
            </div>
            
            {nearbyWorkers.length > 0 ? (
              <div className="space-y-2">
                {nearbyWorkers.map((worker, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-blue-900">{worker}</span>
                    <button className="text-blue-600 hover:text-blue-800 text-sm">
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                No nearby workers discovered. Try the discovery feature to find ASHA workers in proximity.
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Data Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center space-x-2 mb-4">
          <Database className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Data Management</h3>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportData}
              className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-900">Export Data</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Upload className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-900">Import Data</span>
            </motion.button>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-1">Data Sovereignty</h4>
            <p className="text-sm text-yellow-700">
              All health data is stored locally using Earthstar protocol. You maintain full control 
              over patient information and can export or transfer data at any time.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Privacy & Security */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center space-x-2 mb-4">
          <Shield className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Privacy & Security</h3>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">End-to-End Encryption</h4>
                <p className="text-sm text-gray-600">All patient data is encrypted using Earthstar cryptography</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full" />
            </div>
            
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Local Data Storage</h4>
                <p className="text-sm text-gray-600">No cloud storage - all data remains on your device</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full" />
            </div>
            
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Patient Consent Management</h4>
                <p className="text-sm text-gray-600">Granular control over data sharing permissions</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full" />
            </div>
          </div>
          
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg">
            <h4 className="font-medium text-emerald-900 mb-1">Earthstar Protocol Benefits</h4>
            <ul className="text-sm text-emerald-700 space-y-1">
              <li>• Peer-to-peer synchronization without central servers</li>
              <li>• Cryptographic identity verification</li>
              <li>• Community-controlled data governance</li>
              <li>• Offline-first design for rural connectivity</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}