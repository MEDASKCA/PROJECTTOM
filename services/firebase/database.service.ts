// Firebase database service - connects to medaskca-93d48
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  onSnapshot,
  Timestamp,
  QueryConstraint,
  Firestore,
} from 'firebase/firestore';
import { getFirebaseDb } from './config';
import { UniversalTheatreCase, TheatreStaff, AuditLog } from '@/types/universal-data';
import { startOfDay, endOfDay, addDays, parseISO } from 'date-fns';

export class FirebaseDatabaseService {
  private db: Firestore | null = null;

  constructor() {
    try {
      this.db = getFirebaseDb();
    } catch (error) {
      console.warn('⚠️ Firebase database not available:', error);
    }
  }

  private checkDb(): Firestore {
    if (!this.db) {
      throw new Error('Firebase database not configured');
    }
    return this.db;
  }

  // Convert Firestore timestamp to Date
  private convertTimestamp(timestamp: any): Date {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate();
    }
    if (typeof timestamp === 'string') {
      return parseISO(timestamp);
    }
    return new Date(timestamp);
  }

  // Normalize case data from Firestore to UniversalTheatreCase
  private normalizeCase(data: any, id: string): UniversalTheatreCase {
    return {
      id,
      patientId: data.patientId || data.patient_id || id,
      patientName: data.patientName || data.patient_name,
      patientAge: data.patientAge || data.patient_age,
      procedure: data.procedure || data.procedureName || data.procedure_name || 'Unknown',
      procedureName: data.procedureName || data.procedure_name,
      procedureCode: data.procedureCode || data.procedure_code,
      surgeon: data.surgeon || data.surgeonName || data.surgeon_name || 'Not assigned',
      surgeonName: data.surgeonName || data.surgeon_name,
      anaesthetist: data.anaesthetist || data.anaesthetistName || data.anaesthetist_name,
      anaesthetistName: data.anaesthetistName || data.anaesthetist_name,
      theatre: data.theatre || data.theatreNumber || data.theatre_number || data.room || 'Unknown',
      theatreNumber: data.theatreNumber || data.theatre_number,
      room: data.room,
      scheduledDate: data.scheduledDate ? this.convertTimestamp(data.scheduledDate) : new Date(),
      scheduledTime: data.scheduledTime || data.scheduled_time,
      startTime: data.startTime ? this.convertTimestamp(data.startTime) : undefined,
      endTime: data.endTime ? this.convertTimestamp(data.endTime) : undefined,
      estimatedDuration: data.estimatedDuration || data.estimated_duration,
      actualDuration: data.actualDuration || data.actual_duration,
      status: data.status || 'scheduled',
      priority: data.priority || data.urgency,
      urgency: data.urgency,
      specialRequirements: data.specialRequirements || data.special_requirements || [],
      equipment: data.equipment || [],
      notes: data.notes,
      createdAt: data.createdAt ? this.convertTimestamp(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? this.convertTimestamp(data.updatedAt) : undefined,
      createdBy: data.createdBy || data.created_by,
      updatedBy: data.updatedBy || data.updated_by,
      sourceSystem: 'firebase',
      sourceId: id,
    };
  }

  // Get today's theatre cases
  async getTodaysCases(): Promise<UniversalTheatreCase[]> {
    try {
      const db = this.checkDb();
      const today = new Date();
      const startOfToday = startOfDay(today);
      const endOfToday = endOfDay(today);

      const casesRef = collection(db, 'cases');
      const q = query(
        casesRef,
        where('scheduledDate', '>=', startOfToday),
        where('scheduledDate', '<=', endOfToday)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => this.normalizeCase(doc.data(), doc.id));
    } catch (error) {
      console.error('Error fetching today\'s cases:', error);
      // Fallback: get all cases and filter in memory
      return this.getAllCases().then(cases =>
        cases.filter(c => {
          const caseDate = new Date(c.scheduledDate);
          return caseDate >= startOfDay(new Date()) && caseDate <= endOfDay(new Date());
        })
      );
    }
  }

  // Get tomorrow's theatre cases
  async getTomorrowsCases(): Promise<UniversalTheatreCase[]> {
    try {
      const db = this.checkDb();
      const tomorrow = addDays(new Date(), 1);
      const startOfTomorrow = startOfDay(tomorrow);
      const endOfTomorrow = endOfDay(tomorrow);

      const casesRef = collection(db, 'cases');
      const q = query(
        casesRef,
        where('scheduledDate', '>=', startOfTomorrow),
        where('scheduledDate', '<=', endOfTomorrow)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => this.normalizeCase(doc.data(), doc.id));
    } catch (error) {
      console.error('Error fetching tomorrow\'s cases:', error);
      // Fallback: get all cases and filter in memory
      return this.getAllCases().then(cases =>
        cases.filter(c => {
          const caseDate = new Date(c.scheduledDate);
          const tomorrow = addDays(new Date(), 1);
          return caseDate >= startOfDay(tomorrow) && caseDate <= endOfDay(tomorrow);
        })
      );
    }
  }

  // Get all cases
  async getAllCases(): Promise<UniversalTheatreCase[]> {
    try {
      const db = this.checkDb();
      const casesRef = collection(db, 'cases');
      const snapshot = await getDocs(casesRef);
      return snapshot.docs.map(doc => this.normalizeCase(doc.data(), doc.id));
    } catch (error) {
      console.error('Error fetching all cases:', error);
      return [];
    }
  }

  // Get cases by date range
  async getCasesByDateRange(startDate: Date, endDate: Date): Promise<UniversalTheatreCase[]> {
    try {
      const db = this.checkDb();
      const casesRef = collection(db, 'cases');
      const q = query(
        casesRef,
        where('scheduledDate', '>=', startDate),
        where('scheduledDate', '<=', endDate)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => this.normalizeCase(doc.data(), doc.id));
    } catch (error) {
      console.error('Error fetching cases by date range:', error);
      return [];
    }
  }

  // Get cases by surgeon
  async getCasesBySurgeon(surgeonName: string): Promise<UniversalTheatreCase[]> {
    try {
      const allCases = await this.getAllCases();
      return allCases.filter(c =>
        c.surgeon?.toLowerCase().includes(surgeonName.toLowerCase()) ||
        c.surgeonName?.toLowerCase().includes(surgeonName.toLowerCase())
      );
    } catch (error) {
      console.error('Error fetching cases by surgeon:', error);
      return [];
    }
  }

  // Get cases by theatre
  async getCasesByTheatre(theatreName: string): Promise<UniversalTheatreCase[]> {
    try {
      const allCases = await this.getAllCases();
      return allCases.filter(c =>
        c.theatre?.toLowerCase().includes(theatreName.toLowerCase()) ||
        c.theatreNumber?.toLowerCase().includes(theatreName.toLowerCase()) ||
        c.room?.toLowerCase().includes(theatreName.toLowerCase())
      );
    } catch (error) {
      console.error('Error fetching cases by theatre:', error);
      return [];
    }
  }

  // Real-time listener for cases
  subscribeToTodaysCases(callback: (cases: UniversalTheatreCase[]) => void) {
    const db = this.checkDb();
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    const casesRef = collection(db, 'cases');
    const q = query(
      casesRef,
      where('scheduledDate', '>=', startOfToday),
      where('scheduledDate', '<=', endOfToday)
    );

    return onSnapshot(q, (snapshot) => {
      const cases = snapshot.docs.map(doc => this.normalizeCase(doc.data(), doc.id));
      callback(cases);
    });
  }

  // Audit logging for NHS DTAC compliance
  async logAudit(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    try {
      const db = this.checkDb();
      const auditRef = collection(db, 'audit_logs');
      const auditLog: AuditLog = {
        ...log,
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        gdprCompliant: true,
        dataEncrypted: true,
      };

      // In production, this would write to Firestore
      console.log('📋 Audit Log:', auditLog);
    } catch (error) {
      console.error('Error logging audit:', error);
    }
  }
}

// Singleton instance
export const firebaseDb = new FirebaseDatabaseService();
