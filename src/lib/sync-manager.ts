import { HealthDocument, SyncStatus, EarthstarIdentity } from '../types/earthstar';
import { EarthstarHealthCore } from './earthstar-core';

export class SyncManager {
  private static instance: SyncManager;
  private syncStatus: SyncStatus = {
    lastSync: 0,
    syncType: 'manual',
    documentsTransferred: 0,
    errors: [],
    isOnline: navigator.onLine
  };
  private syncInProgress = false;
  private earthstarCore = EarthstarHealthCore.getInstance();

  static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  constructor() {
    // Monitor online status
    window.addEventListener('online', () => {
      this.syncStatus.isOnline = true;
      this.triggerAutoSync();
    });

    window.addEventListener('offline', () => {
      this.syncStatus.isOnline = false;
    });

    // Auto-sync every 5 minutes when online
    setInterval(() => {
      if (this.syncStatus.isOnline && !this.syncInProgress) {
        this.triggerAutoSync();
      }
    }, 5 * 60 * 1000);
  }

  // Simulate proximity-based sync (Bluetooth/WiFi Direct)
  async syncViaProximity(nearbyDevices: string[]): Promise<{ success: boolean; transferred: number }> {
    if (this.syncInProgress) {
      return { success: false, transferred: 0 };
    }

    this.syncInProgress = true;
    this.syncStatus.syncType = 'proximity';

    try {
      const syncQueue = this.earthstarCore.getSyncQueue();
      const prioritizedDocs = this.prioritizeHealthSync(syncQueue);
      
      // Simulate proximity sync with limited bandwidth
      const maxDocs = 10; // Limit for proximity sync
      const docsToSync = prioritizedDocs.slice(0, maxDocs);

      // Simulate sync delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mark documents as synced
      this.syncStatus.documentsTransferred = docsToSync.length;
      this.syncStatus.lastSync = Date.now();
      this.syncStatus.errors = [];

      if (docsToSync.length > 0) {
        this.earthstarCore.clearSyncQueue();
      }

      return { success: true, transferred: docsToSync.length };
    } catch (error) {
      this.syncStatus.errors.push(error instanceof Error ? error.message : 'Unknown sync error');
      return { success: false, transferred: 0 };
    } finally {
      this.syncInProgress = false;
    }
  }

  // Simulate cellular/WiFi sync
  async syncViaCellular(): Promise<{ success: boolean; transferred: number }> {
    if (this.syncInProgress || !this.syncStatus.isOnline) {
      return { success: false, transferred: 0 };
    }

    this.syncInProgress = true;
    this.syncStatus.syncType = 'cellular';

    try {
      const syncQueue = this.earthstarCore.getSyncQueue();
      const prioritizedDocs = this.prioritizeHealthSync(syncQueue);

      // Simulate network sync
      await new Promise(resolve => setTimeout(resolve, 2000));

      this.syncStatus.documentsTransferred = prioritizedDocs.length;
      this.syncStatus.lastSync = Date.now();
      this.syncStatus.errors = [];

      if (prioritizedDocs.length > 0) {
        this.earthstarCore.clearSyncQueue();
      }

      return { success: true, transferred: prioritizedDocs.length };
    } catch (error) {
      this.syncStatus.errors.push(error instanceof Error ? error.message : 'Network sync failed');
      return { success: false, transferred: 0 };
    } finally {
      this.syncInProgress = false;
    }
  }

  // Emergency sync for critical health data
  async triggerEmergencySync(emergencyDoc: HealthDocument): Promise<{ success: boolean; method: string }> {
    // Try multiple sync methods simultaneously
    const syncPromises = [
      this.syncViaProximity(['nearby-asha-1', 'nearby-asha-2']),
      this.syncViaCellular(),
      this.sendViaSMS(emergencyDoc)
    ];

    try {
      const results = await Promise.allSettled(syncPromises);
      
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.status === 'fulfilled' && result.value.success) {
          const methods = ['proximity', 'cellular', 'sms'];
          return { success: true, method: methods[i] };
        }
      }

      // All methods failed - activate offline emergency protocol
      await this.activateOfflineEmergencyProtocol(emergencyDoc);
      return { success: false, method: 'offline_protocol' };
    } catch (error) {
      console.error('Emergency sync failed:', error);
      return { success: false, method: 'failed' };
    }
  }

  // SMS fallback for emergency situations
  private async sendViaSMS(document: HealthDocument): Promise<{ success: boolean; transferred: number }> {
    // Simulate SMS sending for emergency data
    const emergencyData = JSON.parse(document.text);
    
    if (document.path.includes('/emergency/')) {
      // Create condensed SMS format
      const smsData = {
        type: 'EMERGENCY',
        patient: emergencyData.patient_id,
        location: emergencyData.location?.address,
        urgency: emergencyData.severity,
        contact: emergencyData.contact_numbers?.[0]
      };

      // Simulate SMS sending delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Emergency SMS sent:', smsData);
      return { success: true, transferred: 1 };
    }

    return { success: false, transferred: 0 };
  }

  // Offline emergency protocol
  private async activateOfflineEmergencyProtocol(emergencyDoc: HealthDocument): Promise<void> {
    const emergencyData = JSON.parse(emergencyDoc.text);
    
    // Generate paper form data
    const paperForm = {
      timestamp: new Date().toLocaleString(),
      patientId: emergencyData.patient_id,
      emergency: emergencyData.emergency_type,
      location: emergencyData.location?.address,
      contact: emergencyData.contact_numbers?.[0],
      instructions: 'Manual delivery to nearest health facility required'
    };

    // Store for manual processing
    localStorage.setItem(`emergency_${Date.now()}`, JSON.stringify(paperForm));
    
    // Set up retry mechanism
    const retryInterval = setInterval(async () => {
      const retryResult = await this.syncViaCellular();
      if (retryResult.success) {
        clearInterval(retryInterval);
        localStorage.removeItem(`emergency_${emergencyDoc.timestamp}`);
      }
    }, 5 * 60 * 1000); // Retry every 5 minutes

    console.log('Offline emergency protocol activated:', paperForm);
  }

  // Prioritize health documents for sync
  private prioritizeHealthSync(documents: HealthDocument[]): HealthDocument[] {
    return documents.sort((a, b) => {
      // Emergency referrals get highest priority
      if (a.path.includes('/emergency/')) return -1;
      if (b.path.includes('/emergency/')) return 1;

      // Recent consultations get high priority
      const isRecentA = this.isRecent(a.timestamp);
      const isRecentB = this.isRecent(b.timestamp);
      
      if (isRecentA && !isRecentB) return -1;
      if (!isRecentA && isRecentB) return 1;

      // Pending referrals get medium priority
      if (a.path.includes('/referrals/') && this.isPending(a)) return -1;
      if (b.path.includes('/referrals/') && this.isPending(b)) return 1;

      // Default: timestamp order (newest first)
      return b.timestamp - a.timestamp;
    });
  }

  private isRecent(timestamp: number): boolean {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    return timestamp > oneDayAgo * 1000; // Convert to microseconds
  }

  private isPending(document: HealthDocument): boolean {
    try {
      const data = JSON.parse(document.text);
      return data.referral_status === 'pending';
    } catch {
      return false;
    }
  }

  private async triggerAutoSync(): Promise<void> {
    if (!this.syncInProgress) {
      await this.syncViaCellular();
    }
  }

  // Get current sync status
  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  // Manual sync trigger
  async manualSync(): Promise<{ success: boolean; transferred: number }> {
    this.syncStatus.syncType = 'manual';
    return await this.syncViaCellular();
  }

  // Discover nearby ASHA workers (simulated)
  async discoverNearbyASHAWorkers(): Promise<string[]> {
    // Simulate Bluetooth/WiFi Direct discovery
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return [
      'ASHA-Maya-Village2',
      'ASHA-Priya-Village3',
      'ANM-Sunita-Block12'
    ];
  }
}