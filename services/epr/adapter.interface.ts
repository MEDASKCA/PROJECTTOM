// EPR (Electronic Patient Record) Adapter Interface
// Universal adapter pattern for NHS EPR systems: Epic, Cerner, TPP, EMIS, etc.

import { UniversalTheatreCase, TheatreStaff, EPRSystem } from '@/types/universal-data';

export interface EPRAdapter {
  // System identification
  getSystemName(): EPRSystem;
  isConfigured(): boolean;

  // Theatre case operations
  getCases(dateRange?: { start: Date; end: Date }): Promise<UniversalTheatreCase[]>;
  getCaseById(id: string): Promise<UniversalTheatreCase | null>;
  createCase(caseData: Partial<UniversalTheatreCase>): Promise<UniversalTheatreCase>;
  updateCase(id: string, updates: Partial<UniversalTheatreCase>): Promise<UniversalTheatreCase>;
  deleteCase(id: string): Promise<boolean>;

  // Staff operations
  getStaff(role?: string): Promise<TheatreStaff[]>;
  getStaffById(id: string): Promise<TheatreStaff | null>;

  // Realtime subscriptions (if supported)
  subscribeToCases?(callback: (cases: UniversalTheatreCase[]) => void): () => void;

  // Health check
  healthCheck(): Promise<{ healthy: boolean; message?: string }>;
}

// Base adapter class with common functionality
export abstract class BaseEPRAdapter implements EPRAdapter {
  protected systemName: EPRSystem;

  constructor(systemName: EPRSystem) {
    this.systemName = systemName;
  }

  getSystemName(): EPRSystem {
    return this.systemName;
  }

  abstract isConfigured(): boolean;
  abstract getCases(dateRange?: { start: Date; end: Date }): Promise<UniversalTheatreCase[]>;
  abstract getCaseById(id: string): Promise<UniversalTheatreCase | null>;
  abstract createCase(caseData: Partial<UniversalTheatreCase>): Promise<UniversalTheatreCase>;
  abstract updateCase(id: string, updates: Partial<UniversalTheatreCase>): Promise<UniversalTheatreCase>;
  abstract deleteCase(id: string): Promise<boolean>;
  abstract getStaff(role?: string): Promise<TheatreStaff[]>;
  abstract getStaffById(id: string): Promise<TheatreStaff | null>;

  async healthCheck(): Promise<{ healthy: boolean; message?: string }> {
    try {
      const cases = await this.getCases();
      return {
        healthy: true,
        message: `${this.systemName} connected successfully. ${cases.length} cases found.`,
      };
    } catch (error) {
      return {
        healthy: false,
        message: `${this.systemName} health check failed: ${error}`,
      };
    }
  }
}

// Manual entry adapter (for trusts without digital EPR integration)
export class ManualEntryAdapter extends BaseEPRAdapter {
  private cases: UniversalTheatreCase[] = [];
  private staff: TheatreStaff[] = [];

  constructor() {
    super('manual');
  }

  isConfigured(): boolean {
    return true; // Always available
  }

  async getCases(dateRange?: { start: Date; end: Date }): Promise<UniversalTheatreCase[]> {
    if (!dateRange) return this.cases;

    return this.cases.filter(c => {
      const caseDate = new Date(c.scheduledDate);
      return caseDate >= dateRange.start && caseDate <= dateRange.end;
    });
  }

  async getCaseById(id: string): Promise<UniversalTheatreCase | null> {
    return this.cases.find(c => c.id === id) || null;
  }

  async createCase(caseData: Partial<UniversalTheatreCase>): Promise<UniversalTheatreCase> {
    const newCase: UniversalTheatreCase = {
      id: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      patientId: caseData.patientId || `PAT_${Date.now()}`,
      procedure: caseData.procedure || 'Unknown procedure',
      surgeon: caseData.surgeon || 'Not assigned',
      theatre: caseData.theatre || 'Not assigned',
      scheduledDate: caseData.scheduledDate || new Date(),
      status: caseData.status || 'scheduled',
      sourceSystem: 'manual',
      ...caseData,
    };

    this.cases.push(newCase);
    return newCase;
  }

  async updateCase(id: string, updates: Partial<UniversalTheatreCase>): Promise<UniversalTheatreCase> {
    const index = this.cases.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error(`Case ${id} not found`);
    }

    this.cases[index] = { ...this.cases[index], ...updates };
    return this.cases[index];
  }

  async deleteCase(id: string): Promise<boolean> {
    const index = this.cases.findIndex(c => c.id === id);
    if (index === -1) return false;

    this.cases.splice(index, 1);
    return true;
  }

  async getStaff(role?: string): Promise<TheatreStaff[]> {
    if (!role) return this.staff;
    return this.staff.filter(s => s.role === role);
  }

  async getStaffById(id: string): Promise<TheatreStaff | null> {
    return this.staff.find(s => s.id === id) || null;
  }
}

// Factory to create appropriate adapter based on configuration
export class EPRAdapterFactory {
  static createAdapter(): EPRAdapter {
    const eprSystem = (process.env.NEXT_PUBLIC_EPR_SYSTEM as EPRSystem) || 'manual';

    switch (eprSystem.toLowerCase()) {
      case 'epic':
        // In production, return new EpicAdapter()
        console.log('📋 Epic adapter not yet implemented, using manual entry');
        return new ManualEntryAdapter();

      case 'cerner':
        // In production, return new CernerAdapter()
        console.log('📋 Cerner adapter not yet implemented, using manual entry');
        return new ManualEntryAdapter();

      case 'tpp':
        // In production, return new TPPAdapter()
        console.log('📋 TPP adapter not yet implemented, using manual entry');
        return new ManualEntryAdapter();

      case 'emis':
        // In production, return new EMISAdapter()
        console.log('📋 EMIS adapter not yet implemented, using manual entry');
        return new ManualEntryAdapter();

      case 'manual':
      default:
        console.log('📋 Using manual entry adapter');
        return new ManualEntryAdapter();
    }
  }
}
