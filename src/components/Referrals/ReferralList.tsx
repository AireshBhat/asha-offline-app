import React, { useState } from 'react';
import { ArrowRightLeft, Plus, Clock, CheckCircle, XCircle, AlertTriangle, MapPin, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHealth } from '../../contexts/HealthContext';
import { ReferralModal } from './ReferralModal';

export function ReferralList() {
  const { referrals, patients } = useHealth();
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState<string | null>(null);

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient?.name || 'Unknown Patient';
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'accepted': return CheckCircle;
      case 'completed': return CheckCircle;
      case 'rejected': return XCircle;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'accepted': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getFacilityName = (facilityId: string) => {
    // In a real app, this would fetch from a facilities database
    const facilities: Record<string, string> = {
      'PHC001': 'Primary Health Centre - Rampur',
      'CHC001': 'Community Health Centre - Block 12',
      'DH001': 'District Hospital - Hamirpur',
      'PRIVATE001': 'Private Clinic - Dr. Sharma'
    };
    return facilities[facilityId] || 'Unknown Facility';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Referrals</h2>
          <p className="text-gray-600">Patient referrals and transfer coordination</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowReferralModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Create Referral</span>
        </motion.button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { status: 'pending', label: 'Pending', count: referrals.filter(r => r.status === 'pending').length, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
          { status: 'accepted', label: 'Accepted', count: referrals.filter(r => r.status === 'accepted').length, color: 'text-blue-600 bg-blue-50 border-blue-200' },
          { status: 'completed', label: 'Completed', count: referrals.filter(r => r.status === 'completed').length, color: 'text-green-600 bg-green-50 border-green-200' },
          { status: 'rejected', label: 'Rejected', count: referrals.filter(r => r.status === 'rejected').length, color: 'text-red-600 bg-red-50 border-red-200' }
        ].map((item) => (
          <div key={item.status} className={`p-4 rounded-lg border ${item.color}`}>
            <div className="text-2xl font-bold">{item.count}</div>
            <div className="text-sm font-medium">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Referral Cards */}
      <div className="space-y-4">
        <AnimatePresence>
          {referrals.map((referral) => {
            const patientName = getPatientName(referral.patientId);
            const urgencyColor = getUrgencyColor(referral.urgency);
            const StatusIcon = getStatusIcon(referral.status);
            const statusColor = getStatusColor(referral.status);
            const facilityName = getFacilityName(referral.facilityId);
            
            return (
              <motion.div
                key={referral.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                whileHover={{ y: -2, boxShadow: "0 8px 25px rgba(0,0,0,0.1)" }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer transition-all"
                onClick={() => setSelectedReferral(
                  selectedReferral === referral.id ? null : referral.id
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="bg-emerald-100 p-2 rounded-lg">
                      <ArrowRightLeft className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{patientName}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${urgencyColor}`}>
                          {referral.urgency.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                          {referral.status.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>To: {facilityName}</span>
                        </div>
                        
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Chief Complaint:</span> {referral.complaint}
                        </p>
                        
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Provisional Diagnosis:</span> {referral.diagnosis}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-sm text-gray-500 mb-2">
                      <StatusIcon className="h-4 w-4" />
                      <span>Today</span>
                    </div>
                    {referral.transport && (
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        Transport Arranged
                      </span>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {selectedReferral === referral.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 pt-6 border-t border-gray-100 space-y-4"
                    >
                      {/* Clinical Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Clinical Findings</h4>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm">
                            {referral.findings}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Reason for Referral</h4>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm">
                            {referral.reason}
                          </p>
                        </div>
                      </div>

                      {/* Transport & Accompanist */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Transport</h4>
                          <p className="text-sm text-gray-700">
                            {referral.transport ? 'Arranged' : 'Not arranged'}
                          </p>
                        </div>
                        
                        {referral.accompanist && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Accompanist</h4>
                            <p className="text-sm text-gray-700">{referral.accompanist}</p>
                          </div>
                        )}
                      </div>

                      {/* Expected Arrival */}
                      {referral.expectedArrival && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Expected Arrival</h4>
                          <p className="text-sm text-gray-700">{referral.expectedArrival}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex space-x-3 pt-4">
                        {referral.status === 'pending' && (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                              Mark Accepted
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                              Mark Rejected
                            </motion.button>
                          </>
                        )}
                        
                        {referral.status === 'accepted' && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Mark Completed
                          </motion.button>
                        )}
                        
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Edit Referral
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                        >
                          <Phone className="h-4 w-4" />
                          <span>Contact Facility</span>
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {referrals.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <ArrowRightLeft className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No referrals created</h3>
          <p className="text-gray-500 mb-4">Start by creating your first patient referral</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowReferralModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Create First Referral
          </motion.button>
        </motion.div>
      )}

      {/* Referral Modal */}
      <ReferralModal
        isOpen={showReferralModal}
        onClose={() => setShowReferralModal(false)}
      />
    </div>
  );
}