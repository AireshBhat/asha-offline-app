export interface EarthstarIdentity {
  address: string;
  secret: string;
}

export interface HealthShare {
  address: string;
  secret: string;
  name: string;
  description: string;
}

export interface HealthDocument {
  author: string;
  text: string;
  textHash: string;
  format: "es.5";
  path: string;
  signature: string;
  timestamp: number;
  share: string;
  shareSignature: string;
  deleteAfter?: number;
  attachmentSize?: number;
  attachmentHash?: string;
}

export interface PatientData {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  village: string;
  familySize: number;
  healthId: string;
  primaryASHA: string;
  registrationDate: string;
  consent: PatientConsent;
}

export interface PatientConsent {
  allowsDataSharing: boolean;
  sharingLevel: 'asha_only' | 'healthcare_team' | 'public_health';
  patientPublicKey?: string;
  primaryASHA: string;
  supervisingANM?: string;
  healthFacility?: string;
  expiryDate: string;
}

export interface ConsultationData {
  id: string;
  patientId: string;
  symptoms: string[];
  vitalSigns: {
    temperature?: number;
    bloodPressure?: string;
    pulse?: number;
    weight?: number;
  };
  diagnosis: string;
  treatment: string[];
  medications: string[];
  needsReferral: boolean;
  followUpDate?: string;
  type: 'routine' | 'emergency' | 'follow_up';
  isSensitive: boolean;
}

export interface ReferralData {
  id: string;
  patientId: string;
  facilityId: string;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  complaint: string;
  findings: string;
  diagnosis: string;
  reason: string;
  transport: boolean;
  accompanist?: string;
  status: 'pending' | 'accepted' | 'completed' | 'rejected';
  expectedArrival?: string;
}

export interface ASHAWorker {
  identity: EarthstarIdentity;
  name: string;
  village: string;
  block: string;
  district: string;
  phoneNumber: string;
  registrationNumber: string;
  supervisingANM?: string;
  isActive: boolean;
}

export interface SyncStatus {
  lastSync: number;
  syncType: 'proximity' | 'cellular' | 'wifi' | 'manual';
  documentsTransferred: number;
  errors: string[];
  isOnline: boolean;
}