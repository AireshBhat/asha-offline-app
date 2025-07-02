# ASHA Healthcare System Architecture using Earthstar

## System Philosophy: Dharma-Centered Design

Following the principles of Integral Humanism, this system treats healthcare data as a **sacred trust** that sustains community wellbeing. Rather than extractive data collection, we create a **regenerative information ecosystem** that strengthens community health networks.

## Core Architecture

### 1. Identity & Trust Network

```
ASHA Worker Identity: @asha.b[keypair]
Patient Identity: @p123.b[keypair] (auto-generated)
Health Facility: @phc1.b[keypair]
Supervisor: @supe.b[keypair]
```

**Web of Trust Implementation:**
- ASHA workers validate each other through proximity verification
- Patients validated through family/community connections
- Health facilities anchor the trust network
- Supervisors provide quality assurance validation

### 2. Share Structure (Data Boundaries)

```
Primary Shares:
+village.health.b[pubkey]     # Village-level health data
+block.referrals.b[pubkey]    # Block-level referral tracking  
+district.analytics.b[pubkey]  # Anonymized public health data
+training.materials.b[pubkey]  # Educational content

Private Shares:
+medical.sensitive.b[pubkey]   # Encrypted medical records
+family.planning.b[pubkey]     # Reproductive health data
```

### 3. Document Schema

#### Patient Registration
```javascript
{
  path: "/patients/~@asha.b.../registration/patient_id",
  text: JSON.stringify({
    name: "encrypted_name",
    age_group: "25-35", // Anonymized
    gender: "F",
    village: "encrypted_location",
    family_size: 4,
    registration_date: "2025-01-15"
  }),
  timestamp: 1737868800000000,
  author: "@asha.b...",
  signature: "b...",
  share: "+village.health.b..."
}
```

#### Medical Consultation
```javascript
{
  path: "/consultations/~@asha.b.../2025/consultation_id",
  text: JSON.stringify({
    patient_ref: "encrypted_patient_id",
    symptoms: ["fever", "cough"],
    diagnosis: "suspected_respiratory_infection",
    treatment: ["ORS", "paracetamol"],
    referral_needed: false,
    follow_up_date: "2025-01-22"
  }),
  timestamp: 1737868800000000,
  deleteAfter: 1769404800000000, // 1 year retention
  author: "@asha.b..."
}
```

#### Referral Tracking
```javascript
{
  path: "/referrals/2025/01/referral_id",
  text: JSON.stringify({
    patient_ref: "encrypted_patient_id",
    referring_asha: "@asha.b...",
    facility: "@phc1.b...",
    urgency: "medium",
    condition: "pregnancy_complication",
    status: "pending",
    created: "2025-01-15T10:30:00Z"
  }),
  author: "@asha.b..."
}
```

## 4. Offline-First Data Flow

### Local Device Storage
```
SQLite Database:
├── earthstar_documents/     # Local Earthstar replica
├── sync_queue/             # Pending sync operations  
├── media_cache/            # Attachments (photos, audio)
└── user_preferences/       # App settings
```

### Sync Strategy (Hierarchical)
```
Village Level → Block Level → District Level → State Level
     ↓              ↓             ↓              ↓
ASHA Workers → Health Centers → District Hospital → HMIS
```

**Sync Triggers:**
1. **Proximity Sync**: When ASHA workers meet (Bluetooth/WiFi Direct)
2. **Hub Sync**: Weekly visits to Primary Health Centers
3. **Mobile Sync**: Opportunistic when data connectivity available
4. **Emergency Sync**: Critical referrals get priority routing

## 5. Privacy Architecture

### Data Classification
```
Public Data:     Community health statistics, training materials
Sensitive Data:  Individual health records (encrypted)
Critical Data:   Family planning, mental health (double-encrypted)
```

### Encryption Layers
1. **Transport**: All sync communications encrypted
2. **Document**: Medical records encrypted with patient consent
3. **Share**: Private shares require additional keys
4. **Identity**: Patient identities use pseudonymous references

### Access Control
```javascript
// Path-based permissions using Earthstar's ~ syntax
"/patients/~@asha123.b.../records/*"     // Only this ASHA can write
"/referrals/shared/*"                    // Any authorized ASHA can read
"/analytics/~@district.b.../*"           // Only district admin can write
```

## 6. Application Interface Design

### ASHA Worker App Screens

#### 1. Village Dashboard
```
┌─ My Village Health Status ─────────────────┐
│ 📊 This Month:                             │
│ • 45 Consultations                         │
│ • 8 Referrals (3 pending)                  │
│ • 12 Follow-ups due                        │
│                                            │
│ 🔄 Last Sync: 2 hours ago                  │
│ 📶 Connection: Offline                     │
└────────────────────────────────────────────┘
```

#### 2. Patient Registration (Voice + Touch)
```
┌─ New Patient Registration ─────────────────┐
│                                            │
│ 🎤 [Record Name] or ✏️ [Type]              │
│                                            │
│ Age: [25-35] ▼   Gender: [F] [M] [O]       │
│                                            │
│ 📍 Location: Auto-detected                 │
│ 👨‍👩‍👧‍👦 Family Size: [4]                     │
│                                            │
│ [📷 Photo] [👆 Fingerprint] [Save]         │
└────────────────────────────────────────────┘
```

#### 3. Quick Consultation
```
┌─ Quick Health Check ──────────────────────┐
│ Patient: [Search/Select] 🔍               │
│                                           │
│ Symptoms (tap multiple):                  │
│ [Fever] [Cough] [Diarrhea] [Pain] [+More] │
│                                           │
│ Treatment Given:                          │
│ [ORS] [Paracetamol] [Iron Tablets] [+Add] │
│                                           │
│ 🚨 Refer to PHC? [Yes] [No]               │
│ 📅 Follow-up in: [3 days] ▼              │
│                                           │
│ [💾 Save] [🎤 Voice Note]                 │
└───────────────────────────────────────────┘
```

## 7. System Resilience Features

### Conflict Resolution
```javascript
// Earthstar's timestamp-based resolution enhanced with medical logic
if (document.path.includes('/emergency/')) {
  // Emergency documents always take precedence
  priority = 'highest';
} else if (document.author === patient.primary_asha) {
  // Primary ASHA decisions take precedence
  priority = 'high';
} else {
  // Standard timestamp-based resolution
  priority = 'standard';
}
```

### Data Validation
```javascript
// Community validation for critical data
const validateReferral = (referral) => {
  const validators = findNearbyASHAWorkers(referral.location);
  const consensus = validators.map(v => v.validate(referral));
  return consensus.filter(c => c.valid).length >= 2;
};
```

### Backup & Recovery
- **Peer Backup**: Each document replicated across 3+ ASHA workers
- **Facility Backup**: Health centers maintain regional backups
- **Paper Fallback**: Critical forms available offline for extreme cases

## 8. Integration Points

### Existing Systems
```
ASHA App ←→ HMIS (Health Management Information System)
    ↓
 ANM System ←→ Hospital Information Systems
    ↓
District Health Analytics ←→ State Health Department
```

### Data Flow
1. **Upward**: Anonymized statistics flow to state systems
2. **Downward**: Policy updates and training materials flow down
3. **Lateral**: Peer-to-peer sharing between ASHA workers
4. **Emergency**: Direct routing for urgent referrals

## 9. Community Ownership Model

### Governance Structure
```
Village Health Committee
├── ASHA Workers (Primary Users)
├── Community Representatives  
├── ANM (Technical Supervisor)
└── Local Government (Policy)
```

### Data Sovereignty
- **Community Control**: Villages decide data sharing policies
- **Individual Consent**: Patients control their medical records
- **Collective Benefit**: Anonymized data serves public health
- **Cultural Respect**: System adapts to local practices

## 10. Implementation Phases

### Phase 1: Foundation (3 months)
- Core Earthstar implementation
- Basic patient registration
- Simple consultation tracking
- Local sync between devices

### Phase 2: Network (6 months)  
- Multi-device sync implementation
- Referral tracking system
- Integration with health centers
- Mobile connectivity optimization

### Phase 3: Intelligence (12 months)
- Predictive analytics for health trends
- Decision support for ASHA workers
- Integration with state health systems
- Advanced privacy features

### Phase 4: Ecosystem (18 months)
- Full integration with existing healthcare systems
- Advanced peer learning features
- Community health planning tools
- Policy feedback mechanisms

## Conclusion: Technology as Dharma

This system embodies the principle that technology should **sustain and enhance life** rather than extract from it. By using Earthstar's decentralized architecture, we create a healthcare information system that:

- **Respects individual autonomy** while serving collective wellbeing
- **Builds community capacity** rather than creating dependency
- **Preserves cultural values** while enabling modern healthcare
- **Ensures data sovereignty** remains with communities
- **Creates resilient systems** that work even when infrastructure fails

The ASHA workers become not just data collectors, but **knowledge stewards** in a regenerative health ecosystem that grows stronger with each interaction, embodying the timeless principle that the health of the individual and the community are inseparably linked.