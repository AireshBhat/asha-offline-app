import React from 'react';
import { Users, FileText, ArrowRightLeft, BarChart3, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigationItems = [
  { id: 'patients', label: 'Patients', icon: Users, color: 'text-blue-600' },
  { id: 'consultations', label: 'Consultations', icon: FileText, color: 'text-green-600' },
  { id: 'referrals', label: 'Referrals', icon: ArrowRightLeft, color: 'text-orange-600' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'text-purple-600' },
  { id: 'settings', label: 'Settings', icon: Settings, color: 'text-gray-600' }
];

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 overflow-x-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <motion.button
                key={item.id}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  isActive
                    ? `border-emerald-500 ${item.color}`
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}