# ASHA Healthcare System

A **decentralized, offline-first healthcare information system** designed for ASHA (Accredited Social Health Activist) workers in rural India. Built on Earthstar's peer-to-peer architecture, this system enables community health workers to manage patient data, track consultations, and coordinate referrals while respecting privacy and working seamlessly in low-connectivity environments.

## 🌟 Vision

> "Technology as Dharma" - Creating a regenerative healthcare information ecosystem that strengthens community health networks rather than extracting from them.

## 🏗️ Architecture Overview

### Core Philosophy
- **Dharma-Centered Design**: Healthcare data as sacred trust sustaining community wellbeing
- **Regenerative Information Ecosystem**: Data that strengthens rather than extracts from communities
- **Community Ownership**: Data sovereignty remains with villages and individuals
- **Offline-First**: Works without internet connectivity, syncs when possible
- **Self-Hosted**: [Always self-hosted, servers optional](https://earthstar-project.org/) - no dependency on external services

### Technology Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: [Earthstar](https://earthstar-project.org/) (peer-to-peer data protocol)
- **Storage**: Local SQLite + distributed document sync
- **Encryption**: CryptoJS for data protection
- **UI**: Lucide React icons + Framer Motion animations

## 🚀 Key Features

### 📱 ASHA Worker Interface
- **Village Dashboard**: Real-time health status overview
- **Patient Registration**: Voice + touch input for accessibility
- **Quick Consultations**: Symptom tracking and treatment recording
- **Referral Management**: Coordinate with health facilities
- **Offline Operation**: Full functionality without internet

### 🔐 Privacy & Security
- **Multi-layer Encryption**: Transport, document, and share-level encryption
- **Consent Management**: Patient-controlled data sharing preferences
- **Pseudonymous Identities**: Patient privacy through encrypted references
- **Role-based Access**: Path-based permissions using Earthstar's `~` syntax

### 🌐 Sync Strategy
- **Proximity Sync**: Bluetooth/WiFi Direct between nearby ASHA workers
- **Hub Sync**: Weekly visits to Primary Health Centers
- **Opportunistic Sync**: When mobile connectivity is available
- **Emergency Priority**: Critical referrals get immediate routing
- **Sneakernet Support**: [Physical data transfer](https://earthstar-project.org/) when no connectivity available

## 📊 Data Structure

### Patient Records
```typescript
interface PatientData {
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
```

### Consultation Tracking
```typescript
interface ConsultationData {
  id: string;
  patientId: string;
  symptoms: string[];
  vitalSigns: { temperature?: number; pulse?: number; /* ... */ };
  diagnosis: string;
  treatment: string[];
  medications: string[];
  needsReferral: boolean;
  type: 'routine' | 'emergency' | 'follow_up';
  isSensitive: boolean;
}
```

### Referral System
```typescript
interface ReferralData {
  id: string;
  patientId: string;
  facilityId: string;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  complaint: string;
  findings: string;
  diagnosis: string;
  reason: string;
  transport: boolean;
  status: 'pending' | 'accepted' | 'completed' | 'rejected';
}
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern web browser

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd asha-web-app

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🏛️ System Architecture

### Identity & Trust Network
```
ASHA Worker: @asha.b[keypair]
Patient: @p123.b[keypair] (auto-generated)
Health Facility: @phc1.b[keypair]
Supervisor: @supe.b[keypair]
```

### Share Structure (Data Boundaries)
```
Public Shares:
+village.health.b[pubkey]     # Village-level health data
+block.referrals.b[pubkey]    # Block-level referral tracking
+district.analytics.b[pubkey] # Anonymized public health data
+training.materials.b[pubkey] # Educational content

Private Shares:
+medical.sensitive.b[pubkey]  # Encrypted medical records
+family.planning.b[pubkey]    # Reproductive health data
```

### Document Paths
```
/patients/~@asha.b.../registration/patient_id
/consultations/~@asha.b.../2025/consultation_id
/referrals/2025/01/referral_id
/analytics/~@district.b.../monthly_stats
```

*Based on [Earthstar es.5 Data Format](https://earthstar-project.org/specs/data-spec-es5)*

## 🔄 Data Flow

### Offline-First Operation
1. **Local Storage**: SQLite database on device
2. **Sync Queue**: Pending operations when offline
3. **Proximity Sync**: Peer-to-peer when ASHA workers meet
4. **Facility Sync**: Weekly visits to health centers
5. **Emergency Routing**: Critical data gets priority

### Conflict Resolution
- **Timestamp-based**: Standard [Earthstar resolution](https://willowprotocol.org/specs/data-model/index.html#data_model_concepts)
- **Medical Priority**: Emergency documents take precedence
- **Community Validation**: Critical referrals require consensus
- **Role-based**: Primary ASHA decisions prioritized

## 🎯 Use Cases

### For ASHA Workers
- Register new patients with voice/touch input
- Record consultations and vital signs
- Track follow-ups and medication adherence
- Create and monitor referrals
- View village health analytics
- Sync data when visiting health centers

### For Health Facilities
- Receive and track referrals
- Update referral status
- Share treatment outcomes
- Access patient history (with consent)
- Coordinate with ASHA network

### For District Administrators
- View anonymized health trends
- Monitor referral patterns
- Track ASHA performance metrics
- Plan resource allocation
- Generate public health reports

## 🔧 Configuration

### Environment Setup
```typescript
// src/lib/earthstar-config.ts
export const EARTHSTAR_CONFIG = {
  FORMAT_VERSION: "es.5", // [Earthstar v11 specification](https://earthstar-project.org/)
  SYNC_INTERVAL: 30000, // 30 seconds
  MAX_DOCUMENT_SIZE: 1024 * 1024, // 1MB
  RETENTION_PERIOD: 365 * 24 * 60 * 60 * 1000 // 1 year
};
```

### Share Configuration
```typescript
export const HEALTH_SHARES = {
  village: {
    address: "+village.health.b...",
    secret: "village_secret_key",
    name: "Village Health Data",
    description: "Community health information"
  },
  medical: {
    address: "+medical.sensitive.b...",
    secret: "medical_secret_key", 
    name: "Medical Records",
    description: "Encrypted patient records"
  }
};
```

## 🧪 Testing

### Sample Data
The system includes sample ASHA workers and patients for testing:
- **ASHA Workers**: Sunita Devi, Maya Sharma
- **Sample Patients**: Meera Devi, Raj Kumar
- **Test Consultations**: Various health scenarios
- **Sample Referrals**: Different urgency levels

### Demo Mode
```bash
# Login as sample ASHA worker
npm run dev
# Use "asha1" or "asha2" as login credentials
```

## 📈 Analytics & Reporting

### Health Metrics
- **Consultation Trends**: Monthly patient visits
- **Referral Patterns**: Facility utilization
- **Health Indicators**: Village-level statistics
- **ASHA Performance**: Activity tracking

### Data Visualization
- **Charts**: Recharts for health trend visualization
- **Maps**: Village and facility locations
- **Timelines**: Patient care journeys
- **Dashboards**: Real-time health status

## 🔒 Privacy & Compliance

### Data Protection
- **Encryption at Rest**: All local data encrypted
- **Encryption in Transit**: Secure sync communications
- **Access Controls**: Role-based permissions
- **Audit Trails**: Document access logging

### Consent Management
- **Granular Control**: Patient chooses sharing level
- **Time-limited**: Consent expires automatically
- **Revocable**: Patients can withdraw consent
- **Transparent**: Clear data usage policies

## 🌍 Community Integration

### Governance Model
```
Village Health Committee
├── ASHA Workers (Primary Users)
├── Community Representatives
├── ANM (Technical Supervisor)
└── Local Government (Policy)
```

### Cultural Adaptation
- **Local Languages**: Multi-language support
- **Cultural Practices**: Respect for traditional medicine
- **Community Values**: Aligned with local cultures and beliefs
- **Accessibility**: Voice and touch interfaces

## 🚧 Development Roadmap

### Phase 1: Foundation (3 months) ✅
- [ ] Core Earthstar implementation
- [ ] Basic patient registration
- [ ] Simple consultation tracking
- [ ] Local sync between devices

### Phase 2: Network (6 months) 🔄
- [ ] Multi-device sync implementation
- [ ] Referral tracking system
- [ ] Integration with health centers
- [ ] Mobile connectivity optimization

### Phase 3: Intelligence (12 months) 📋
- [ ] Predictive analytics for health trends
- [ ] Decision support for ASHA workers
- [ ] Integration with state health systems
- [ ] Advanced privacy features

### Phase 4: Ecosystem (18 months) 📋
- [ ] Full integration with existing healthcare systems
- [ ] Advanced peer learning features
- [ ] Community health planning tools
- [ ] Policy feedback mechanisms

## 🤝 Contributing

### Development Guidelines
1. **Dharma-Centered**: All features should serve community wellbeing
2. **Offline-First**: Ensure functionality without internet
3. **Privacy by Design**: Encrypt sensitive data by default
4. **Accessibility**: Support voice and touch interfaces
5. **Cultural Respect**: Adapt to local practices and values

### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Tailwind CSS for styling
- React hooks for state management
- Earthstar patterns for data handling

## 📚 Documentation

- **[Protocol.md](docs/Protocol.md)**: Detailed system architecture
- **API Documentation**: Component interfaces and data flows
- **Deployment Guide**: Production setup instructions
- **User Manual**: ASHA worker training materials
- **[Earthstar Documentation](https://earthstar-project.org/)**: Core protocol and API guides
- **[Earthstar JavaScript API](https://deno.land/x/earthstar@v10.2.2/src/entries/universal.ts)**: Library reference
- **[Earthstar Tutorials](https://earthstar-project.org/tutorials/create-a-chat-app)**: Getting started guides

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **ASHA Workers**: For their invaluable feedback and testing
- **[Earthstar Community](https://opencollective.com/earthstar)**: For the peer-to-peer protocol and [open source contributions](https://opencollective.com/search?tag=open%20source)
- **Healthcare Professionals**: For medical domain expertise

---

**Built with ❤️ for community health and wellbeing**

*"The health of the individual and the community are inseparably linked"* 