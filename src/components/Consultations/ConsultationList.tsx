import React, { useState } from 'react';
import { FileText, Plus, Calendar, User, Thermometer, Heart, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHealth } from '../../contexts/HealthContext';
import { ConsultationModal } from './ConsultationModal';

export function ConsultationList() {
  const { consultations, patients } = useHealth();
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<string | null>(null);

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient?.name || 'Unknown Patient';
  };

  const getUrgencyColor = (type: string, needsReferral: boolean) => {
    if (type === 'emergency') return 'text-red-600 bg-red-100';
    if (needsReferral) return 'text-orange-600 bg-orange-100';
    return 'text-green-600 bg-green-100';
  };

  const getUrgencyIcon = (type: string, needsReferral: boolean) => {
    if (type === 'emergency') return AlertTriangle;
    if (needsReferral) return Heart;
    return FileText;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Consultations</h2>
          <p className="text-gray-600">Patient consultation records and follow-ups</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowConsultationModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>New Consultation</span>
        </motion.button>
      </div>

      {/* Consultation Cards */}
      <div className="space-y-4">
        <AnimatePresence>
          {consultations.map((consultation) => {
            const patientName = getPatientName(consultation.patientId);
            const urgencyColor = getUrgencyColor(consultation.type, consultation.needsReferral);
            const UrgencyIcon = getUrgencyIcon(consultation.type, consultation.needsReferral);
            
            return (
              <motion.div
                key={consultation.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                whileHover={{ y: -2, boxShadow: "0 8px 25px rgba(0,0,0,0.1)" }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer transition-all"
                onClick={() => setSelectedConsultation(
                  selectedConsultation === consultation.id ? null : consultation.id
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg ${urgencyColor}`}>
                      <UrgencyIcon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-gray-900">{patientName}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${urgencyColor}`}>
                          {consultation.type.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Consultation ID: {consultation.id}
                      </p>
                      
                      {/* Symptoms */}
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700">Chief Complaints:</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {consultation.symptoms.map((symptom, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {symptom}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Vital Signs */}
                      {Object.keys(consultation.vitalSigns).length > 0 && (
                        <div className="mt-3 flex items-center space-x-4 text-sm text-gray-600">
                          {consultation.vitalSigns.temperature && (
                            <div className="flex items-center space-x-1">
                              <Thermometer className="h-4 w-4" />
                              <span>{consultation.vitalSigns.temperature}°F</span>
                            </div>
                          )}
                          {consultation.vitalSigns.pulse && (
                            <div className="flex items-center space-x-1">
                              <Heart className="h-4 w-4" />
                              <span>{consultation.vitalSigns.pulse} bpm</span>
                            </div>
                          )}
                          {consultation.vitalSigns.bloodPressure && (
                            <span>BP: {consultation.vitalSigns.bloodPressure}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>Today</span>
                    </div>
                    {consultation.needsReferral && (
                      <span className="inline-block mt-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                        Referral Needed
                      </span>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {selectedConsultation === consultation.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 pt-6 border-t border-gray-100 space-y-4"
                    >
                      {/* Diagnosis */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Diagnosis</h4>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                          {consultation.diagnosis}
                        </p>
                      </div>

                      {/* Treatment */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Treatment Given</h4>
                        <div className="flex flex-wrap gap-2">
                          {consultation.treatment.map((treatment, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                            >
                              {treatment}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Medications */}
                      {consultation.medications.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Medications Dispensed</h4>
                          <div className="flex flex-wrap gap-2">
                            {consultation.medications.map((medication, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
                              >
                                {medication}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Follow-up */}
                      {consultation.followUpDate && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Follow-up</h4>
                          <p className="text-gray-700">
                            Scheduled for: {consultation.followUpDate}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex space-x-3 pt-4">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Edit Consultation
                        </motion.button>
                        {consultation.needsReferral && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-orange-50 hover:bg-orange-100 text-orange-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Create Referral
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Schedule Follow-up
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

      {consultations.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No consultations recorded</h3>
          <p className="text-gray-500 mb-4">Start by recording your first patient consultation</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowConsultationModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Record First Consultation
          </motion.button>
        </motion.div>
      )}

      {/* Consultation Modal */}
      <ConsultationModal
        isOpen={showConsultationModal}
        onClose={() => setShowConsultationModal(false)}
      />
    </div>
  );
}