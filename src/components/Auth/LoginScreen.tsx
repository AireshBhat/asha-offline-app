import React, { useState } from 'react';
import { Heart, User, Key, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';
import { useHealth } from '../../contexts/HealthContext';

export function LoginScreen() {
  const { loginAsASHA } = useHealth();
  const [selectedASHA, setSelectedASHA] = useState('');

  const ashaWorkers = [
    { id: 'asha1', name: 'Sunita Devi', village: 'Rampur', block: 'Block 12' },
    { id: 'asha2', name: 'Maya Sharma', village: 'Rampur', block: 'Block 12' }
  ];

  const handleLogin = () => {
    if (selectedASHA) {
      loginAsASHA(selectedASHA);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="bg-emerald-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center"
          >
            <Heart className="h-10 w-10 text-emerald-600" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">ASHA स्वास्थ्य</h1>
          <p className="text-gray-600">Community Health Network</p>
          <p className="text-sm text-emerald-600 mt-2">Powered by Earthstar Protocol</p>
        </div>

        {/* Login Form */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select ASHA Worker Identity
            </label>
            <div className="space-y-3">
              {ashaWorkers.map((asha) => (
                <motion.label
                  key={asha.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedASHA === asha.id
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="asha"
                    value={asha.id}
                    checked={selectedASHA === asha.id}
                    onChange={(e) => setSelectedASHA(e.target.value)}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                  />
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <User className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{asha.name}</p>
                    <p className="text-sm text-gray-600">{asha.village}, {asha.block}</p>
                  </div>
                </motion.label>
              ))}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogin}
            disabled={!selectedASHA}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Key className="h-5 w-5" />
            <span>Access Health System</span>
          </motion.button>

          {/* Earthstar Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Smartphone className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Offline-First Design</h4>
                <p className="text-sm text-blue-700">
                  This system works completely offline using Earthstar protocol. 
                  Your data stays on your device and syncs peer-to-peer with other ASHA workers.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Heart className="h-5 w-5 text-emerald-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-emerald-900 mb-1">Community Data Sovereignty</h4>
                <p className="text-sm text-emerald-700">
                  Your community maintains full control over health data. 
                  No external servers, no corporate surveillance, just community-owned healthcare.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}