import CryptoJS from 'crypto-js';
import { HealthDocument, EarthstarIdentity, PatientData, ConsultationData, ReferralData } from '../types/earthstar';
import { EARTHSTAR_CONFIG, HEALTH_PATHS, HEALTH_SHARES } from './earthstar-config';

// Core Earthstar document operations
export class EarthstarHealthCore {
  private static instance: EarthstarHealthCore;
  private documents: Map<string, HealthDocument> = new Map();
  private syncQueue: HealthDocument[] = [];

  static getInstance(): EarthstarHealthCore {
    if (!EarthstarHealthCore.instance) {
      EarthstarHealthCore.instance = new EarthstarHealthCore();
    }
    return EarthstarHealthCore.instance;
  }

  // Generate cryptographic hash for document
  private generateTextHash(text: string): string {
    return CryptoJS.SHA256(text).toString(CryptoJS.enc.Base64);
  }

  // Generate document signature (simplified for demo)
  private generateSignature(document: Partial<HealthDocument>, secret: string): string {
    const signatureData = `${document.author}${document.path}${document.timestamp}${document.textHash}`;
    return CryptoJS.HmacSHA256(signatureData, secret).toString(CryptoJS.enc.Base64);
  }

  // Validate document structure and permissions
  private validateDocument(document: HealthDocument): { valid: boolean; reason?: string } {
    // Check format version
    if (document.format !== EARTHSTAR_CONFIG.FORMAT_VERSION) {
      return { valid: false, reason: 'Invalid format version' };
    }

    // Check path ownership
    if (!this.validatePathPermissions(document.path, document.author)) {
      return { valid: false, reason: 'Insufficient path permissions' };
    }

    // Check timestamp (not too far in future)
    const maxFutureTime = Date.now() + (5 * 60 * 1000); // 5 minutes
    if (document.timestamp > maxFutureTime * 1000) {
      return { valid: false, reason: 'Timestamp too far in future' };
    }

    // Check ephemeral document expiry
    if (document.deleteAfter && document.deleteAfter < Date.now() * 1000) {
      return { valid: false, reason: 'Ephemeral document expired' };
    }

    return { valid: true };
  }

  // Validate path-based write permissions
  private validatePathPermissions(path: string, author: string): boolean {
    const ownershipPattern = /~([^\/]+)/g;
    const authorizedWriters: string[] = [];
    let match;

    while ((match = ownershipPattern.exec(path)) !== null) {
      authorizedWriters.push(match[1]);
    }

    // If no ~ in path, it's a shared path - check role-based permissions
    if (authorizedWriters.length === 0) {
      return this.validateSharedPathPermission(path, author);
    }

    // Check if author is in the list of authorized writers
    return authorizedWriters.includes(author);
  }

  private validateSharedPathPermission(path: string, author: string): boolean {
    // Simplified role checking for demo
    const sharedPathPermissions: Record<string, string[]> = {
      '/referrals/shared/': ['asha', 'anm', 'doctor'],
      '/analytics/public/': ['district_admin', 'data_analyst']
    };

    for (const [pathPrefix, allowedRoles] of Object.entries(sharedPathPermissions)) {
      if (path.startsWith(pathPrefix)) {
        // In a real implementation, this would check user roles from identity
        return true; // Simplified for demo
      }
    }

    return false;
  }

  // Ingest document into local storage
  async ingestDocument(newDoc: HealthDocument): Promise<{ status: string; reason?: string }> {
    // Validate document
    const validation = this.validateDocument(newDoc);
    if (!validation.valid) {
      return { status: 'rejected', reason: validation.reason };
    }

    // Check for existing document with same path and author
    const docKey = `${newDoc.author}:${newDoc.path}`;
    const existingDoc = this.documents.get(docKey);

    if (existingDoc && existingDoc.timestamp >= newDoc.timestamp) {
      return { status: 'ignored', reason: 'obsolete document' };
    }

    // Store document
    this.documents.set(docKey, newDoc);

    // Add to sync queue for propagation
    this.syncQueue.push(newDoc);

    return { status: 'accepted' };
  }

  // Create patient registration document
  createPatientRegistration(ashaIdentity: EarthstarIdentity, patientData: PatientData): HealthDocument {
    const text = JSON.stringify({
      name: patientData.name,
      age_group: this.anonymizeAge(patientData.age),
      gender: patientData.gender,
      village: patientData.village,
      family_size: patientData.familySize,
      registration_date: patientData.registrationDate,
      primary_asha: ashaIdentity.address,
      health_id: patientData.healthId,
      consent: patientData.consent
    });

    const timestamp = Date.now() * 1000;
    const textHash = this.generateTextHash(text);
    const path = HEALTH_PATHS.patientRegistration(ashaIdentity.address, patientData.id);

    const document: HealthDocument = {
      author: ashaIdentity.address,
      text,
      textHash,
      format: EARTHSTAR_CONFIG.FORMAT_VERSION,
      path,
      signature: '',
      timestamp,
      share: HEALTH_SHARES.village.address,
      shareSignature: ''
    };

    document.signature = this.generateSignature(document, ashaIdentity.secret);
    document.shareSignature = this.generateSignature(document, HEALTH_SHARES.village.secret);

    return document;
  }

  // Create consultation record
  createConsultationRecord(ashaIdentity: EarthstarIdentity, consultationData: ConsultationData): HealthDocument {
    const text = JSON.stringify({
      patient_ref: consultationData.patientId,
      symptoms: consultationData.symptoms,
      vital_signs: consultationData.vitalSigns,
      diagnosis: consultationData.diagnosis,
      treatment_given: consultationData.treatment,
      medications_dispensed: consultationData.medications,
      referral_needed: consultationData.needsReferral,
      follow_up_date: consultationData.followUpDate,
      consultation_type: consultationData.type
    });

    const timestamp = Date.now() * 1000;
    const textHash = this.generateTextHash(text);
    const year = new Date().getFullYear();
    
    // Use ephemeral path for routine consultations
    const path = consultationData.type === 'routine' 
      ? HEALTH_PATHS.consultationEphemeral(ashaIdentity.address, year, consultationData.id)
      : HEALTH_PATHS.consultation(ashaIdentity.address, year, consultationData.id);

    const document: HealthDocument = {
      author: ashaIdentity.address,
      text,
      textHash,
      format: EARTHSTAR_CONFIG.FORMAT_VERSION,
      path,
      signature: '',
      timestamp,
      share: consultationData.isSensitive ? HEALTH_SHARES.medical.address : HEALTH_SHARES.village.address,
      shareSignature: ''
    };

    // Set expiry for routine consultations (1 year)
    if (consultationData.type === 'routine') {
      document.deleteAfter = (Date.now() + (365 * 24 * 60 * 60 * 1000)) * 1000;
    }

    document.signature = this.generateSignature(document, ashaIdentity.secret);
    const shareSecret = consultationData.isSensitive ? HEALTH_SHARES.medical.secret : HEALTH_SHARES.village.secret;
    document.shareSignature = this.generateSignature(document, shareSecret);

    return document;
  }

  // Create referral document
  createReferralDocument(ashaIdentity: EarthstarIdentity, referralData: ReferralData): HealthDocument {
    const text = JSON.stringify({
      patient_ref: referralData.patientId,
      referring_asha: ashaIdentity.address,
      target_facility: referralData.facilityId,
      urgency_level: referralData.urgency,
      chief_complaint: referralData.complaint,
      clinical_findings: referralData.findings,
      provisional_diagnosis: referralData.diagnosis,
      reason_for_referral: referralData.reason,
      transport_arranged: referralData.transport,
      accompanist: referralData.accompanist,
      referral_status: referralData.status,
      created_timestamp: Date.now() * 1000,
      expected_arrival: referralData.expectedArrival
    });

    const timestamp = Date.now() * 1000;
    const textHash = this.generateTextHash(text);
    const now = new Date();
    const path = HEALTH_PATHS.referral(now.getFullYear(), now.getMonth() + 1, referralData.id);

    const document: HealthDocument = {
      author: ashaIdentity.address,
      text,
      textHash,
      format: EARTHSTAR_CONFIG.FORMAT_VERSION,
      path,
      signature: '',
      timestamp,
      share: HEALTH_SHARES.block.address,
      shareSignature: ''
    };

    document.signature = this.generateSignature(document, ashaIdentity.secret);
    document.shareSignature = this.generateSignature(document, HEALTH_SHARES.block.secret);

    return document;
  }

  // Query documents by criteria
  queryDocuments(criteria: {
    pathPattern?: string;
    author?: string;
    share?: string;
    timestampGt?: number;
    timestampLt?: number;
  }): HealthDocument[] {
    const results: HealthDocument[] = [];

    for (const doc of this.documents.values()) {
      let matches = true;

      if (criteria.pathPattern && !this.matchesPattern(doc.path, criteria.pathPattern)) {
        matches = false;
      }

      if (criteria.author && doc.author !== criteria.author) {
        matches = false;
      }

      if (criteria.share && doc.share !== criteria.share) {
        matches = false;
      }

      if (criteria.timestampGt && doc.timestamp <= criteria.timestampGt) {
        matches = false;
      }

      if (criteria.timestampLt && doc.timestamp >= criteria.timestampLt) {
        matches = false;
      }

      if (matches) {
        results.push(doc);
      }
    }

    return results.sort((a, b) => b.timestamp - a.timestamp);
  }

  private matchesPattern(path: string, pattern: string): boolean {
    // Simple pattern matching with * wildcard
    const regexPattern = pattern.replace(/\*/g, '.*');
    return new RegExp(`^${regexPattern}$`).test(path);
  }

  private anonymizeAge(age: number): string {
    if (age < 5) return '0-5';
    if (age < 15) return '5-15';
    if (age < 25) return '15-25';
    if (age < 35) return '25-35';
    if (age < 45) return '35-45';
    if (age < 55) return '45-55';
    if (age < 65) return '55-65';
    return '65+';
  }

  // Get sync queue for peer synchronization
  getSyncQueue(): HealthDocument[] {
    return [...this.syncQueue];
  }

  // Clear sync queue after successful sync
  clearSyncQueue(): void {
    this.syncQueue = [];
  }

  // Get all documents for export/backup
  getAllDocuments(): HealthDocument[] {
    return Array.from(this.documents.values());
  }
}