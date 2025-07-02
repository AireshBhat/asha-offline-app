import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { ASHAWorker, PatientData, ConsultationData, ReferralData, SyncStatus } from '../types/earthstar';
import { EarthstarHealthCore } from '../lib/earthstar-core';
import { SyncManager } from '../lib/sync-manager';
import { SAMPLE_IDENTITIES } from '../lib/earthstar-config';

interface HealthState {
  currentUser: ASHAWorker | null;
  patients: PatientData[];
  consultations: ConsultationData[];
  referrals: ReferralData[];
  syncStatus: SyncStatus;
  isLoading: boolean;
  error: string | null;
}

type HealthAction =
  | { type: 'SET_USER'; payload: ASHAWorker }
  | { type: 'ADD_PATIENT'; payload: PatientData }
  | { type: 'ADD_CONSULTATION'; payload: ConsultationData }
  | { type: 'ADD_REFERRAL'; payload: ReferralData }
  | { type: 'UPDATE_SYNC_STATUS'; payload: SyncStatus }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOAD_DATA'; payload: { patients: PatientData[]; consultations: ConsultationData[]; referrals: ReferralData[] } };

const initialState: HealthState = {
  currentUser: null,
  patients: [],
  consultations: [],
  referrals: [],
  syncStatus: {
    lastSync: 0,
    syncType: 'manual',
    documentsTransferred: 0,
    errors: [],
    isOnline: navigator.onLine
  },
  isLoading: false,
  error: null
};

function healthReducer(state: HealthState, action: HealthAction): HealthState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, currentUser: action.payload };
    case 'ADD_PATIENT':
      return { ...state, patients: [...state.patients, action.payload] };
    case 'ADD_CONSULTATION':
      return { ...state, consultations: [...state.consultations, action.payload] };
    case 'ADD_REFERRAL':
      return { ...state, referrals: [...state.referrals, action.payload] };
    case 'UPDATE_SYNC_STATUS':
      return { ...state, syncStatus: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'LOAD_DATA':
      return {
        ...state,
        patients: action.payload.patients,
        consultations: action.payload.consultations,
        referrals: action.payload.referrals
      };
    default:
      return state;
  }
}

interface HealthContextType extends HealthState {
  loginAsASHA: (ashaId: string) => void;
  registerPatient: (patientData: Omit<PatientData, 'id' | 'healthId' | 'registrationDate'>) => Promise<void>;
  recordConsultation: (consultationData: Omit<ConsultationData, 'id'>) => Promise<void>;
  createReferral: (referralData: Omit<ReferralData, 'id' | 'status'>) => Promise<void>;
  syncData: () => Promise<void>;
  discoverNearbyWorkers: () => Promise<string[]>;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export function HealthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(healthReducer, initialState);
  const earthstarCore = EarthstarHealthCore.getInstance();
  const syncManager = SyncManager.getInstance();

  // Load initial data and set up sync monitoring
  useEffect(() => {
    loadInitialData();
    
    // Monitor sync status
    const syncInterval = setInterval(() => {
      const syncStatus = syncManager.getSyncStatus();
      dispatch({ type: 'UPDATE_SYNC_STATUS', payload: syncStatus });
    }, 1000);

    return () => clearInterval(syncInterval);
  }, []);

  const loadInitialData = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Load sample data for demo
      const samplePatients: PatientData[] = [
        {
          id: 'p001',
          name: 'Meera Devi',
          age: 28,
          gender: 'F',
          village: 'Rampur',
          familySize: 4,
          healthId: 'HP001',
          primaryASHA: SAMPLE_IDENTITIES.asha1.address,
          registrationDate: new Date().toISOString(),
          consent: {
            allowsDataSharing: true,
            sharingLevel: 'healthcare_team',
            primaryASHA: SAMPLE_IDENTITIES.asha1.address,
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          }
        },
        {
          id: 'p002',
          name: 'Raj Kumar',
          age: 45,
          gender: 'M',
          village: 'Rampur',
          familySize: 6,
          healthId: 'HP002',
          primaryASHA: SAMPLE_IDENTITIES.asha1.address,
          registrationDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          consent: {
            allowsDataSharing: true,
            sharingLevel: 'public_health',
            primaryASHA: SAMPLE_IDENTITIES.asha1.address,
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          }
        }
      ];

      const sampleConsultations: ConsultationData[] = [
        {
          id: 'c001',
          patientId: 'p001',
          symptoms: ['fever', 'headache'],
          vitalSigns: { temperature: 101.2, pulse: 88 },
          diagnosis: 'Viral fever',
          treatment: ['Rest', 'Paracetamol'],
          medications: ['Paracetamol 500mg'],
          needsReferral: false,
          type: 'routine',
          isSensitive: false
        }
      ];

      const sampleReferrals: ReferralData[] = [
        {
          id: 'r001',
          patientId: 'p002',
          facilityId: 'PHC001',
          urgency: 'medium',
          complaint: 'Chest pain',
          findings: 'Elevated BP, chest discomfort',
          diagnosis: 'Hypertension',
          reason: 'Specialist consultation required',
          transport: true,
          status: 'pending'
        }
      ];

      dispatch({
        type: 'LOAD_DATA',
        payload: {
          patients: samplePatients,
          consultations: sampleConsultations,
          referrals: sampleReferrals
        }
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load initial data' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loginAsASHA = (ashaId: string) => {
    const identity = SAMPLE_IDENTITIES[ashaId];
    if (identity) {
      const ashaWorker: ASHAWorker = {
        identity,
        name: ashaId === 'asha1' ? 'Sunita Devi' : 'Maya Sharma',
        village: 'Rampur',
        block: 'Block 12',
        district: 'Hamirpur',
        phoneNumber: '+91-9876543210',
        registrationNumber: `ASHA${ashaId.toUpperCase()}001`,
        isActive: true
      };
      dispatch({ type: 'SET_USER', payload: ashaWorker });
    }
  };

  const registerPatient = async (patientData: Omit<PatientData, 'id' | 'healthId' | 'registrationDate'>) => {
    if (!state.currentUser) {
      throw new Error('No ASHA user logged in');
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const newPatient: PatientData = {
        ...patientData,
        id: `p${Date.now()}`,
        healthId: `HP${Date.now()}`,
        registrationDate: new Date().toISOString(),
        primaryASHA: state.currentUser.identity.address
      };

      // Create Earthstar document
      const patientDoc = earthstarCore.createPatientRegistration(state.currentUser.identity, newPatient);
      await earthstarCore.ingestDocument(patientDoc);

      dispatch({ type: 'ADD_PATIENT', payload: newPatient });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to register patient' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const recordConsultation = async (consultationData: Omit<ConsultationData, 'id'>) => {
    if (!state.currentUser) {
      throw new Error('No ASHA user logged in');
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const newConsultation: ConsultationData = {
        ...consultationData,
        id: `c${Date.now()}`
      };

      // Create Earthstar document
      const consultationDoc = earthstarCore.createConsultationRecord(state.currentUser.identity, newConsultation);
      await earthstarCore.ingestDocument(consultationDoc);

      dispatch({ type: 'ADD_CONSULTATION', payload: newConsultation });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to record consultation' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createReferral = async (referralData: Omit<ReferralData, 'id' | 'status'>) => {
    if (!state.currentUser) {
      throw new Error('No ASHA user logged in');
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const newReferral: ReferralData = {
        ...referralData,
        id: `r${Date.now()}`,
        status: 'pending'
      };

      // Create Earthstar document
      const referralDoc = earthstarCore.createReferralDocument(state.currentUser.identity, newReferral);
      await earthstarCore.ingestDocument(referralDoc);

      // Trigger emergency sync if high urgency
      if (referralData.urgency === 'emergency' || referralData.urgency === 'high') {
        await syncManager.triggerEmergencySync(referralDoc);
      }

      dispatch({ type: 'ADD_REFERRAL', payload: newReferral });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create referral' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const syncData = async () => {
    try {
      await syncManager.manualSync();
      const syncStatus = syncManager.getSyncStatus();
      dispatch({ type: 'UPDATE_SYNC_STATUS', payload: syncStatus });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Sync failed' });
    }
  };

  const discoverNearbyWorkers = async (): Promise<string[]> => {
    return await syncManager.discoverNearbyASHAWorkers();
  };

  const contextValue: HealthContextType = {
    ...state,
    loginAsASHA,
    registerPatient,
    recordConsultation,
    createReferral,
    syncData,
    discoverNearbyWorkers
  };

  return (
    <HealthContext.Provider value={contextValue}>
      {children}
    </HealthContext.Provider>
  );
}

export function useHealth() {
  const context = useContext(HealthContext);
  if (context === undefined) {
    throw new Error('useHealth must be used within a HealthProvider');
  }
  return context;
}