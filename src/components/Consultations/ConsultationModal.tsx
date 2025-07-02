import React, { useState } from 'react';
import { X, FileText, User, Thermometer, Heart, Stethoscope, Pill } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHealth } from '../../contexts/HealthContext';
import { ConsultationData } from '../../types/earthstar';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const commonSymptoms = [
  'Fever', 'Cough', 'Headache', 'Body ache', 'Nausea', 'Vomiting',
  'Diarrhea', 'Abdominal pain', 'Chest pain', 'Shortness of breath',
  'Dizziness', 'Fatigue', 'Loss of appetite', 'Skin rash'
];

const commonTreatments = [
  'Rest and fluids', 'ORS', 'Paracetamol', 'Cold compress', 'Warm compress',
  'Steam inhalation', 'Dietary advice', 'Hygiene counseling', 'Referral to PHC'
];

const commonMedications = [
  'Paracetamol 500mg', 'ORS packets', 'Iron tablets', 'Vitamin tablets',
  'Antacid tablets', 'Cough syrup', 'Antiseptic cream', 'Bandages'
];

export function ConsultationModal({ isOpen, onClose }: ConsultationModalProps) {
  const { patients, recordConsultation, isLoading } = useHealth();
  const [formData, setFormData] = useState({
    patientId: '',
    symptoms: [] as string[],
    temperature: '',
    bloodPressure: '',
    pulse: '',
    weight: '',
    diagnosis: '',
    treatment: [] as string[],
    medications: [] as string[],
    needsReferral: false,
    followUpDate: '',
    type: 'routine' as 'routine' | 'emergency' | 'follow_up',
    isSensitive: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const consultationData: Omit<ConsultationData, 'id'> = {
        patientId: formData.patientId,
        symptoms: formData.symptoms,
        vitalSigns: {
          ...(formData.temperature && { temperature: parseFloat(formData.temperature) }),
          ...(formData.bloodPressure && { bloodPressure: formData.bloodPressure }),
          ...(formData.pulse && { pulse: parseInt(formData.pulse) }),
          ...(formData.weight && { weight: parseFloat(formData.weight) })
        },
        diagnosis: formData.diagnosis,
        treatment: formData.treatment,
        medications: formData.medications,
        needsReferral: formData.needsReferral,
        followUpDate: formData.followUpDate || undefined,
        type: formData.type,
        isSensitive: formData.isSensitive
      };

      await recordConsultation(consultationData);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Failed to record consultation:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      symptoms: [],
      temperature: '',
      bloodPressure: '',
      pulse: '',
      weight: '',
      diagnosis: '',
      treatment: [],
      medications: [],
      needsReferral: false,
      followUpDate: '',
      type: 'routine',
      isSensitive: false
    });
  };

  const toggleArrayItem = (array: string[], item: string, setter: (items: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item));
    } else {
      setter([...array, item]);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-0"
            onClick={onClose}
          />
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0 relative z-10">
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
                    <FileText className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Record Consultation</h3>
                    <p className="text-sm text-gray-500">Document patient visit and treatment</p>
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

                    {/* Consultation Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Consultation Type *
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: 'routine', label: 'Routine', color: 'bg-green-100 text-green-800' },
                          { value: 'follow_up', label: 'Follow-up', color: 'bg-blue-100 text-blue-800' },
                          { value: 'emergency', label: 'Emergency', color: 'bg-red-100 text-red-800' }
                        ].map(type => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, type: type.value as any }))}
                            className={`p-2 rounded-lg text-sm font-medium transition-colors ${formData.type === type.value ? type.color : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                          >
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Symptoms */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Symptoms & Complaints *
                      </label>
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                        {commonSymptoms.map(symptom => (
                          <label key={symptom} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={formData.symptoms.includes(symptom)}
                              onChange={() => toggleArrayItem(
                                formData.symptoms,
                                symptom,
                                (items) => setFormData(prev => ({ ...prev, symptoms: items }))
                              )}
                              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-700">{symptom}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Vital Signs */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Thermometer className="inline h-4 w-4 mr-1" />
                        Vital Signs
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <input
                            type="number"
                            step="0.1"
                            placeholder="Temperature (°F)"
                            value={formData.temperature}
                            onChange={(e) => setFormData(prev => ({ ...prev, temperature: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Blood Pressure"
                            value={formData.bloodPressure}
                            onChange={(e) => setFormData(prev => ({ ...prev, bloodPressure: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            placeholder="Pulse (bpm)"
                            value={formData.pulse}
                            onChange={(e) => setFormData(prev => ({ ...prev, pulse: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            step="0.1"
                            placeholder="Weight (kg)"
                            value={formData.weight}
                            onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Diagnosis */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Stethoscope className="inline h-4 w-4 mr-1" />
                        Diagnosis *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={formData.diagnosis}
                        onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Enter diagnosis or provisional diagnosis..."
                      />
                    </div>

                    {/* Treatment */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Treatment Given
                      </label>
                      <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3">
                        {commonTreatments.map(treatment => (
                          <label key={treatment} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={formData.treatment.includes(treatment)}
                              onChange={() => toggleArrayItem(
                                formData.treatment,
                                treatment,
                                (items) => setFormData(prev => ({ ...prev, treatment: items }))
                              )}
                              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-700">{treatment}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Medications */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Pill className="inline h-4 w-4 mr-1" />
                        Medications Dispensed
                      </label>
                      <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3">
                        {commonMedications.map(medication => (
                          <label key={medication} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={formData.medications.includes(medication)}
                              onChange={() => toggleArrayItem(
                                formData.medications,
                                medication,
                                (items) => setFormData(prev => ({ ...prev, medications: items }))
                              )}
                              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-700">{medication}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Follow-up and Referral */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Follow-up Date
                        </label>
                        <input
                          type="date"
                          value={formData.followUpDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, followUpDate: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.needsReferral}
                            onChange={(e) => setFormData(prev => ({ ...prev, needsReferral: e.target.checked }))}
                            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                          />
                          <span className="text-sm font-medium text-gray-700">Needs referral to higher facility</span>
                        </label>

                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.isSensitive}
                            onChange={(e) => setFormData(prev => ({ ...prev, isSensitive: e.target.checked }))}
                            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                          />
                          <span className="text-sm font-medium text-gray-700">Contains sensitive medical information</span>
                        </label>
                      </div>
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
                    {isLoading ? 'Recording...' : 'Record Consultation'}
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