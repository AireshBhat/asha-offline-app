import React, { useState } from 'react';
import { X, User, MapPin, Users, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHealth } from '../../contexts/HealthContext';
import { PatientData } from '../../types/earthstar';

interface PatientRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PatientRegistrationModal({ isOpen, onClose }: PatientRegistrationModalProps) {
  const { registerPatient, isLoading } = useHealth();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'F' as 'M' | 'F' | 'O',
    village: '',
    familySize: '',
    allowsDataSharing: true,
    sharingLevel: 'healthcare_team' as 'asha_only' | 'healthcare_team' | 'public_health'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const patientData: Omit<PatientData, 'id' | 'healthId' | 'registrationDate' | 'primaryASHA'> = {
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        village: formData.village,
        familySize: parseInt(formData.familySize),
        consent: {
          allowsDataSharing: formData.allowsDataSharing,
          sharingLevel: formData.sharingLevel,
          primaryASHA: '', // Will be set by the context
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        }
      };

      await registerPatient(patientData);
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        age: '',
        gender: 'F',
        village: '',
        familySize: '',
        allowsDataSharing: true,
        sharingLevel: 'healthcare_team'
      });
    } catch (error) {
      console.error('Failed to register patient:', error);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <User className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Register New Patient</h3>
                    <p className="text-sm text-gray-500">Add patient to community health registry</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Basic Information</span>
                  </h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter patient's full name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Age *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        max="120"
                        value={formData.age}
                        onChange={(e) => handleChange('age', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Age"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender *
                      </label>
                      <select
                        required
                        value={formData.gender}
                        onChange={(e) => handleChange('gender', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="F">Female</option>
                        <option value="M">Male</option>
                        <option value="O">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Location & Family */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>Location & Family</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Village *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.village}
                        onChange={(e) => handleChange('village', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Village name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Family Size *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.familySize}
                        onChange={(e) => handleChange('familySize', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Number of family members"
                      />
                    </div>
                  </div>
                </div>

                {/* Data Consent */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Data Consent & Privacy</span>
                  </h4>

                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.allowsDataSharing}
                        onChange={(e) => handleChange('allowsDataSharing', e.target.checked)}
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">
                        Patient consents to health data sharing for care coordination
                      </span>
                    </label>

                    {formData.allowsDataSharing && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Data Sharing Level
                        </label>
                        <div className="space-y-2">
                          {[
                            { value: 'asha_only', label: 'ASHA Only', desc: 'Only primary ASHA worker' },
                            { value: 'healthcare_team', label: 'Healthcare Team', desc: 'ASHA, ANM, and health facility' },
                            { value: 'public_health', label: 'Public Health', desc: 'Anonymized for community health analytics' }
                          ].map((option) => (
                            <label key={option.value} className="flex items-start space-x-3">
                              <input
                                type="radio"
                                name="sharingLevel"
                                value={option.value}
                                checked={formData.sharingLevel === option.value}
                                onChange={(e) => handleChange('sharingLevel', e.target.value)}
                                className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                              />
                              <div>
                                <span className="text-sm font-medium text-gray-900">{option.label}</span>
                                <p className="text-xs text-gray-500">{option.desc}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    {isLoading ? 'Registering...' : 'Register Patient'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}