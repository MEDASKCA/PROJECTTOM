// Universal data types for PROJECT TOM
// EPR agnostic - works with any Electronic Patient Record system

export interface UniversalTheatreCase {
  id: string;
  patientId: string;
  patientName?: string; // Optional for privacy
  patientAge?: number;
  procedure: string;
  procedureName?: string; // Alternative field name
  procedureCode?: string; // SNOMED/OPCS codes
  surgeon: string;
  surgeonName?: string; // Alternative field name
  anaesthetist?: string;
  anaesthetistName?: string;
  theatre: string;
  theatreNumber?: string; // Alternative field name
  room?: string; // Alternative field name
  scheduledDate: Date | string;
  scheduledTime?: string;
  startTime?: Date | string;
  endTime?: Date | string;
  estimatedDuration?: number; // minutes
  actualDuration?: number; // minutes
  status: CaseStatus;
  priority?: CasePriority;
  urgency?: string;
  specialRequirements?: string[];
  equipment?: string[];
  notes?: string;
  // Audit fields
  createdAt?: Date | string;
  updatedAt?: Date | string;
  createdBy?: string;
  updatedBy?: string;
  // EPR source tracking
  sourceSystem?: EPRSystem;
  sourceId?: string;
}

export type CaseStatus =
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'delayed'
  | 'emergency';

export type CasePriority =
  | 'routine'
  | 'urgent'
  | 'emergency'
  | 'elective';

export type EPRSystem =
  | 'epic'
  | 'cerner'
  | 'tpp'
  | 'emis'
  | 'manual'
  | 'firebase'
  | 'other';

export interface TheatreStaff {
  id: string;
  name: string;
  role: StaffRole;
  specialties?: string[];
  availability?: StaffAvailability[];
  email?: string;
  phone?: string;
}

export type StaffRole =
  | 'surgeon'
  | 'anaesthetist'
  | 'scrub_nurse'
  | 'circulating_nurse'
  | 'oda'
  | 'radiographer'
  | 'theatre_coordinator';

export interface StaffAvailability {
  date: Date | string;
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface TheatreRoom {
  id: string;
  name: string;
  number: string;
  specialties?: string[];
  equipment?: string[];
  status: 'available' | 'occupied' | 'cleaning' | 'maintenance';
}

export interface AuditLog {
  id: string;
  timestamp: Date | string;
  userId: string;
  userName?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  // NHS DTAC compliance
  gdprCompliant: boolean;
  dataEncrypted: boolean;
}

export interface TOMChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date | string;
  userId?: string;
  context?: string; // RAG context used
  audioUrl?: string; // TTS audio
}

export interface QueryContext {
  cases?: UniversalTheatreCase[];
  staff?: TheatreStaff[];
  rooms?: TheatreRoom[];
  metadata?: {
    queryType: string;
    dateRange?: { start: Date | string; end: Date | string };
    filters?: Record<string, any>;
  };
}
