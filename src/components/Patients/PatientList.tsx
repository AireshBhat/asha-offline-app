import React, { useState } from 'react';
import { Search, Plus, User, Calendar, MapPin, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHealth } from '../../contexts/HealthContext';
import { PatientRegistrationModal } from './PatientRegistrationModal';

export function PatientList() {
  const { patients, consultations } = useHealth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.healthId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.village.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPatientConsultations = (patientId: string) => {
    return consultations.filter(c => c.patientId === patientId);
  };

  const getLastConsultationDate = (patientId: string) => {
    const patientConsultations = getPatientConsultations(patientId);
    if (patientConsultations.length === 0) return null;
    
    // Since we don't have actual dates in consultations, we'll simulate
    return new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Patient Registry</h2>
          <p className="text-gray-600">Manage community health records</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowRegistrationModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Register Patient</span>
        </motion.button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Search by name, Health ID, or village..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      {/* Patient Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {filteredPatients.map((patient) => {
            const lastConsultation = getLastConsultationDate(patient.id);
            const consultationCount = getPatientConsultations(patient.id).length;
            
            return (
              <motion.div
                key={patient.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                whileHover={{ y: -4, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer transition-all"
                onClick={() => setSelectedPatient(selectedPatient === patient.id ? null : patient.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-emerald-100 p-2 rounded-lg">
                      <User className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                      <p className="text-sm text-gray-500">ID: {patient.healthId}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    patient.gender === 'F' ? 'bg-pink-100 text-pink-800' :
                    patient.gender === 'M' ? 'bg-blue-100 text-blue-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {patient.gender === 'F' ? 'Female' : patient.gender === 'M' ? 'Male' : 'Other'}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Age: {patient.age} years</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{patient.village}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>Family: {patient.familySize} members</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Consultations: {consultationCount}</span>
                    {lastConsultation && (
                      <span className="text-gray-500">
                        Last visit: {lastConsultation.toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {selectedPatient === patient.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-gray-100 space-y-3"
                    >
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Registered:</span>
                          <p className="font-medium">
                            {new Date(patient.registrationDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Consent Level:</span>
                          <p className="font-medium capitalize">
                            {patient.consent.sharingLevel.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          New Consultation
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          View History
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

      {filteredPatients.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Start by registering your first patient'}
          </p>
          {!searchTerm && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowRegistrationModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Register First Patient
            </motion.button>
          )}
        </motion.div>
      )}

      {/* Registration Modal */}
      <PatientRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
      />
    </div>
  );
}