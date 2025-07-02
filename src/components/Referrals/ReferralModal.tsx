import React, { useState } from 'react';
import { X, ArrowRightLeft, User, MapPin, AlertTriangle, Car, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHealth } from '../../contexts/HealthContext';
import { ReferralData } from '../../types/earthstar';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const healthFacilities = [
  { id: 'PHC001', name: 'Primary Health Centre - Rampur', type: 'PHC', distance: '2 km' },
  { id: 'CHC001', name: 'Community Health Centre - Block 12', type: 'CHC', distance: '15 km' },
  { id: 'DH001', name: 'District Hospital - Hamirpur', type: 'District Hospital', distance: '45 km' },
  { id: 'PRIVATE001', name: 'Private Clinic - Dr. Sharma', type: 'Private', distance: '8 km' }
];

export function ReferralModal({ isOpen, onClose }: ReferralModalProps) {
  const { patients, createReferral, isLoading } = useHealth();
  const [formData, setFormData] = useState({
    patientId: '',
    facilityId: '',
    urgency: 'medium' as 'low' | 'medium' | 'high' | 'emergency',
    complaint: '',
    findings: '',
    diagnosis: '',
    reason: '',
    transport: false,
    accompanist: '',
    expectedArrival: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const referralData: Omit<ReferralData, 'id' | 'status'> = {
        patientId: formData.patientId,
        facilityId: formData.facilityId,
        urgency: formData.urgency,
        complaint: formData.complaint,
        findings: formData.findings,
        diagnosis: formData.diagnosis,
        reason: formData.reason,
        transport: formData.transport,
        accompanist: formData.accompanist || undefined,
        expectedArrival: formData.expectedArrival || undefined
      };

      await createReferral(referralData);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Failed to create referral:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      facilityId: '',
      urgency: 'medium',
      complaint: '',
      findings: '',
      diagnosis: '',
      reason: '',
      transport: false,
      accompanist: '',
      expectedArrival: ''
    });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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
              className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <ArrowRightLeft className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Create Patient Referral</h3>
                    <p className="text-sm text-gray-500">Transfer patient to higher level facility</p>
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Patient Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="inline h-4 w-4 mr-1" />
                        Select Patient *
                      </label>
                      <select
                        required
                        value={formData.patientId}
                        onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="">Choose a patient...</option>
                        {patients.map(patient => (
                          <option key={patient.id} value={patient.id}>
                            {patient.name} - {patient.healthId}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Target Facility */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPin className="inline h-4 w-4 mr-1" />
                        Target Health Facility *
                      </label>
                      <div className="space-y-2">
                        {healthFacilities.map(facility => (
                          <label key={facility.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                              type="radio"
                              name="facilityId"
                              value={facility.id}
                              checked={formData.facilityId === facility.id}
                              onChange={(e) => setFormData(prev => ({ ...prev, facilityId: e.target.value }))}
                              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-900">{facility.name}</span>
                                <span className="text-sm text-gray-500">{facility.distance}</span>
                              </div>
                              <span className="text-sm text-gray-600">{facility.type}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Urgency Level */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <AlertTriangle className="inline h-4 w-4 mr-1" />
                        Urgency Level *
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: 'low', label: 'Low', desc: 'Routine referral' },
                          { value: 'medium', label: 'Medium', desc: 'Within 24 hours' },
                          { value: 'high', label: 'High', desc: 'Within 6 hours' },
                          { value: 'emergency', label: 'Emergency', desc: 'Immediate' }
                        ].map(urgency => (
                          <button
                            key={urgency.value}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, urgency: urgency.value as any }))}
                            className={`p-3 rounded-lg text-left transition-colors border ${
                              formData.urgency === urgency.value 
                                ? getUrgencyColor(urgency.value)
                                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            <div className="font-medium">{urgency.label}</div>
                            <div className="text-xs opacity-75">{urgency.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Chief Complaint */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Chief Complaint *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={formData.complaint}
                        onChange={(e) => setFormData(prev => ({ ...prev, complaint: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Primary reason for referral..."
                      />
                    </div>

                    {/* Clinical Findings */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Clinical Findings *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={formData.findings}
                        onChange={(e) => setFormData(prev => ({ ...prev, findings: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Physical examination findings, vital signs..."
                      />
                    </div>

                    {/* Provisional Diagnosis */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Provisional Diagnosis *
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={formData.diagnosis}
                        onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Suspected condition or diagnosis..."
                      />
                    </div>

                    {/* Reason for Referral */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for Referral *
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={formData.reason}
                        onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Why this referral is needed..."
                      />
                    </div>
                  </div>
                </div>

                {/* Transport & Logistics */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
                    <Car className="h-4 w-4" />
                    <span>Transport & Logistics</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.transport}
                          onChange={(e) => setFormData(prev => ({ ...prev, transport: e.target.checked }))}
                          className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                        />
                        <span className="text-sm font-medium text-gray-700">Transport arranged</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Accompanist
                      </label>
                      <input
                        type="text"
                        value={formData.accompanist}
                        onChange={(e) => setFormData(prev => ({ ...prev, accompanist: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Family member name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expected Arrival
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.expectedArrival}
                        onChange={(e) => setFormData(prev => ({ ...prev, expectedArrival: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-6 border-t border-gray-200">
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
                    {isLoading ? 'Creating...' : 'Create Referral'}
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