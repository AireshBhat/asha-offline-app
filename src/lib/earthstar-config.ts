import { EarthstarIdentity, HealthShare } from '../types/earthstar';

// Earthstar configuration for ASHA Healthcare System
export const EARTHSTAR_CONFIG = {
  FORMAT_VERSION: "es.5" as const,
  IDENTITY_PREFIX: "@",
  SHARE_PREFIX: "+",
  PATH_SEPARATOR: "/",
  OWNERSHIP_MARKER: "~",
  EPHEMERAL_MARKER: "!",
};

// Pre-configured health shares for the system
export const HEALTH_SHARES: Record<string, HealthShare> = {
  village: {
    address: "+village1.bhyux4opeug2ieqcy36exrf4qymc56adwll4zeazm42oamxtr7heq",
    secret: "buaqth6jr5wkksnhdlpfi64cqcnjzfx3r6cssnfqdvitjmfygsk3q",
    name: "Village Health Data",
    description: "Semi-public health data within village community"
  },
  
  block: {
    address: "+block12.bhyux4opeug2ieqcy36exrf4qymc56adwll4zeazm42oamxtr7heq",
    secret: "buaqth6jr5wkksnhdlpfi64cqcnjzfx3r6cssnfqdvitjmfygsk3q",
    name: "Block Health Network",
    description: "Referral tracking and inter-village coordination"
  },
  
  district: {
    address: "+district.bhyux4opeug2ieqcy36exrf4qymc56adwll4zeazm42oamxtr7heq",
    secret: "buaqth6jr5wkksnhdlpfi64cqcnjzfx3r6cssnfqdvitjmfygsk3q",
    name: "District Analytics",
    description: "Anonymized public health data and analytics"
  },
  
  medical: {
    address: "+medical.bhyux4opeug2ieqcy36exrf4qymc56adwll4zeazm42oamxtr7heq",
    secret: "buaqth6jr5wkksnhdlpfi64cqcnjzfx3r6cssnfqdvitjmfygsk3q",
    name: "Private Medical Records",
    description: "Encrypted sensitive medical information"
  }
};

// Sample ASHA worker identities for demo
export const SAMPLE_IDENTITIES: Record<string, EarthstarIdentity> = {
  asha1: {
    address: "@asha.bo5sotcncvkr7p4c3lnexxpb4hjqi5tcxcov5b4irbnnz2teoifua",
    secret: "becvcwa5dp6kbmjvjs26pe76xxbgjn3yw4cqzl42jqjujob7mk4xq"
  },
  
  asha2: {
    address: "@maya.bnkivt7pdzydgjagu4ooltwmhyoolgidv6iqrnlh5dc7duiuywbfq",
    secret: "b4p3qioleiepi5a6iaalf6pm3qhgapkftxnxcszjwa352qr6gempa"
  },
  
  anm1: {
    address: "@anm1.bce576gvty3ecz5unzynwqwutjzqe6bvhcujec2mimz7n2o5ilkfa",
    secret: "bdp3qioleiepi5a6iaalf6pm3qhgapkftxnxcszjwa352qr6gempa"
  },
  
  facility: {
    address: "@phc1.bce576gvty3ecz5unzynwqwutjzqe6bvhcujec2mimz7n2o5ilkfa",
    secret: "bdp3qioleiepi5a6iaalf6pm3qhgapkftxnxcszjwa352qr6gempa"
  }
};

// Healthcare-specific path patterns
export const HEALTH_PATHS = {
  patientRegistration: (ashaAddress: string, patientId: string) => 
    `/patients/~${ashaAddress}/registration/${patientId}`,
  
  consultation: (ashaAddress: string, year: number, consultationId: string) =>
    `/consultations/~${ashaAddress}/${year}/${consultationId}`,
  
  consultationEphemeral: (ashaAddress: string, year: number, consultationId: string) =>
    `/consultations!/~${ashaAddress}/${year}/${consultationId}`,
  
  referral: (year: number, month: number, referralId: string) =>
    `/referrals/shared/${year}/${month}/${referralId}`,
  
  emergency: (facilityAddress: string, ashaAddress: string, emergencyId: string) =>
    `/emergency!/~${facilityAddress}~${ashaAddress}/${emergencyId}`,
  
  consent: (ashaAddress: string, patientId: string, timestamp: number) =>
    `/consent/~${ashaAddress}/patient/${patientId}/${timestamp}`,
  
  supervision: (anmAddress: string, ashaAddress: string, date: string) =>
    `/supervision/~${anmAddress}/asha/${ashaAddress}/${date}`,
  
  analytics: (geographicScope: string, year: number, month: number) =>
    `/analytics/public/${geographicScope}/${year}/${month}`
};

// Role-based share access
export const getSharesForRole = (userRole: string, location?: string): HealthShare[] => {
  switch(userRole) {
    case 'asha':
      return [HEALTH_SHARES.village, HEALTH_SHARES.block, HEALTH_SHARES.medical];
    case 'anm':
      return [HEALTH_SHARES.village, HEALTH_SHARES.block, HEALTH_SHARES.district];
    case 'district_admin':
      return [HEALTH_SHARES.district];
    case 'doctor':
      return [HEALTH_SHARES.village, HEALTH_SHARES.block, HEALTH_SHARES.medical];
    default:
      return [];
  }
};