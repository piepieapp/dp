// Enhanced Data Storage Service для збереження всіх даних в localStorage
export interface AppData {
  designers: any[];
  learningModules: any[];
  skills: any[];
  projects: any[];
  tests: any[];
  lessons: any[];
  settings: any;
  images: { [key: string]: string }; // Зберігаємо зображення окремо
  lastUpdated: string;
  version: string;
  backups: BackupEntry[];
}

export interface BackupEntry {
  id: string;
  timestamp: string;
  description: string;
  data: Partial<AppData>;
  automatic: boolean;
}

class DataStorageService {
  private readonly STORAGE_KEY = 'designer-management-platform';
  private readonly IMAGES_KEY = 'designer-platform-images';
  private readonly VERSION = '2.0.0';
  private readonly MAX_BACKUPS = 10;
  private migrationInProgress = false; // Flag to prevent recursion

  // Отримати всі дані (safe version)
  getAllData(): AppData | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return null;
      
      const parsed = JSON.parse(data) as AppData;
      
      // Prevent infinite recursion during migration
      if (this.migrationInProgress) {
        return parsed;
      }
      
      // Міграція старих версій
      if (!parsed.version || this.isOlderVersion(parsed.version, this.VERSION)) {
        return this.performSafeMigration(parsed);
      }
      
      return parsed;
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
      
      // If localStorage is corrupted, try to recover or reset
      try {
        localStorage.removeItem(this.STORAGE_KEY);
        console.log('Removed corrupted data from localStorage');
        return null;
      } catch (cleanupError) {
        console.error('Failed to cleanup corrupted data:', cleanupError);
        return null;
      }
    }
  }

  // Safe version comparison
  private isOlderVersion(currentVersion: string, targetVersion: string): boolean {
    if (!currentVersion) return true;
    
    const current = currentVersion.split('.').map(Number);
    const target = targetVersion.split('.').map(Number);
    
    for (let i = 0; i < Math.max(current.length, target.length); i++) {
      const currPart = current[i] || 0;
      const targPart = target[i] || 0;
      
      if (currPart < targPart) return true;
      if (currPart > targPart) return false;
    }
    
    return false;
  }

  // Safe migration that prevents recursion
  private performSafeMigration(oldData: any): AppData {
    console.log('Starting safe migration to version', this.VERSION);
    
    // Set flag to prevent recursion
    this.migrationInProgress = true;
    
    try {
      const migratedData: AppData = {
        designers: oldData.designers || [],
        learningModules: oldData.learningModules || [],
        skills: oldData.skills || [],
        projects: oldData.projects || [],
        tests: oldData.tests || [],
        lessons: oldData.lessons || [],
        settings: oldData.settings || {},
        images: oldData.images || {},
        lastUpdated: oldData.lastUpdated || new Date().toISOString(),
        version: this.VERSION,
        backups: oldData.backups || []
      };

      // Migrate images from designers (safe approach)
      if (migratedData.designers && Array.isArray(migratedData.designers)) {
        migratedData.designers.forEach((designer, index) => {
          if (designer && designer.avatar && designer.avatar.startsWith('data:')) {
            try {
              const imageId = `designer-${designer.id}-avatar`;
              migratedData.images[imageId] = designer.avatar;
              migratedData.designers[index].avatar = imageId;
            } catch (imageError) {
              console.warn('Failed to migrate image for designer', designer.id, imageError);
              // Keep original avatar if migration fails
            }
          }
          
          // Add new fields safely
          if (designer) {
            if (!designer.version) {
              migratedData.designers[index].version = 1;
            }
            if (!designer.lastModified) {
              migratedData.designers[index].lastModified = new Date().toISOString();
            }
          }
        });
      }

      // Save migrated data directly to localStorage (bypassing saveAllData to prevent recursion)
      const dataToSave = JSON.stringify(migratedData);
      localStorage.setItem(this.STORAGE_KEY, dataToSave);
      
      console.log('Migration completed successfully');
      return migratedData;
      
    } catch (migrationError) {
      console.error('Migration failed:', migrationError);
      
      // Fallback: return original data with updated version
      const fallbackData = {
        ...oldData,
        version: this.VERSION,
        lastUpdated: new Date().toISOString()
      };
      
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(fallbackData));
      } catch (saveError) {
        console.error('Failed to save fallback data:', saveError);
      }
      
      return fallbackData;
    } finally {
      // Always clear the migration flag
      this.migrationInProgress = false;
    }
  }

  // Safe version of saveAllData
  saveAllData(data: Partial<AppData>): void {
    try {
      // Get current data safely (without triggering migration)
      let currentData: AppData;
      
      if (this.migrationInProgress) {
        // During migration, use default data
        currentData = this.getDefaultData();
      } else {
        const existing = this.getRawData();
        currentData = existing || this.getDefaultData();
      }
      
      const updatedData: AppData = {
        ...currentData,
        ...data,
        lastUpdated: new Date().toISOString(),
        version: this.VERSION
      };
      
      // Create automatic backup before important changes (but not during migration)
      if (!this.migrationInProgress && (data.designers || data.learningModules)) {
        this.createAutoBackup(currentData);
      }
      
      // Save to localStorage
      const dataToSave = JSON.stringify(updatedData);
      localStorage.setItem(this.STORAGE_KEY, dataToSave);
      
      console.log('Data saved successfully');
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
      
      // Handle localStorage quota exceeded
      if (error instanceof DOMException && error.code === 22) {
        console.log('localStorage quota exceeded, attempting cleanup...');
        this.emergencyCleanup();
        
        // Try saving again with minimal data
        try {
          const minimalData = {
            designers: data.designers || [],
            learningModules: data.learningModules || [],
            skills: data.skills || [],
            projects: [],
            tests: [],
            lessons: [],
            settings: {},
            images: {},
            lastUpdated: new Date().toISOString(),
            version: this.VERSION,
            backups: []
          };
          
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(minimalData));
          console.log('Saved minimal data after cleanup');
        } catch (secondError) {
          console.error('Failed to save even minimal data:', secondError);
        }
      }
    }
  }

  // Get raw data without any processing or migration
  private getRawData(): AppData | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return null;
      
      return JSON.parse(data) as AppData;
    } catch (error) {
      console.error('Error parsing raw data:', error);
      return null;
    }
  }

  // Emergency cleanup when localStorage is full
  private emergencyCleanup(): void {
    try {
      const data = this.getRawData();
      if (!data) return;

      // Remove all backups
      data.backups = [];
      
      // Remove all images
      data.images = {};
      
      // Clean up avatars in designers
      if (data.designers) {
        data.designers.forEach((designer, index) => {
          if (designer && designer.avatar && designer.avatar.startsWith('data:')) {
            data.designers[index].avatar = '';
          }
        });
      }

      // Save cleaned data
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      console.log('Emergency cleanup completed');
    } catch (error) {
      console.error('Emergency cleanup failed:', error);
    }
  }

  // Safe method to create automatic backup
  createAutoBackup(data: AppData): void {
    try {
      if (!data.backups) data.backups = [];

      const backup: BackupEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        description: 'Автоматичний backup',
        data: {
          designers: data.designers ? [...data.designers] : [],
          learningModules: data.learningModules ? [...data.learningModules] : [],
          skills: data.skills ? [...data.skills] : [],
          images: data.images ? { ...data.images } : {}
        },
        automatic: true
      };

      data.backups.unshift(backup);
      
      // Limit backups to prevent storage overflow
      if (data.backups.length > this.MAX_BACKUPS) {
        data.backups = data.backups.slice(0, this.MAX_BACKUPS);
      }
    } catch (error) {
      console.warn('Failed to create auto backup:', error);
    }
  }

  // Safe image saving
  saveImage(imageData: string, type: 'avatar' | 'other' = 'other', entityId?: string): string {
    try {
      const imageId = `${type}-${entityId || Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const data = this.getAllData() || this.getDefaultData();
      if (!data.images) data.images = {};
      
      data.images[imageId] = imageData;
      
      this.saveAllData({ images: data.images });
      return imageId;
    } catch (error) {
      console.error('Failed to save image:', error);
      return '';
    }
  }

  // Get image safely
  getImage(imageId: string): string | null {
    try {
      const data = this.getAllData();
      if (!data || !data.images) return null;
      
      return data.images[imageId] || null;
    } catch (error) {
      console.error('Failed to get image:', error);
      return null;
    }
  }

  // Delete image safely
  deleteImage(imageId: string): void {
    try {
      const data = this.getAllData();
      if (!data || !data.images) return;
      
      delete data.images[imageId];
      this.saveAllData({ images: data.images });
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  }

  // Safe designer operations
  saveDesigner(designer: any): void {
    try {
      const data = this.getAllData();
      if (!data) return;

      // Handle avatar safely
      if (designer.avatar && designer.avatar.startsWith('data:')) {
        try {
          const imageId = this.saveImage(designer.avatar, 'avatar', designer.id);
          if (imageId) {
            designer.avatar = imageId;
          }
        } catch (imageError) {
          console.warn('Failed to save designer avatar:', imageError);
          // Keep original avatar
        }
      }

      const existingIndex = data.designers.findIndex(d => d.id === designer.id);
      if (existingIndex >= 0) {
        // Clean up old avatar if it changed
        const oldDesigner = data.designers[existingIndex];
        if (oldDesigner.avatar && oldDesigner.avatar !== designer.avatar && !oldDesigner.avatar.startsWith('http')) {
          this.deleteImage(oldDesigner.avatar);
        }
        
        data.designers[existingIndex] = designer;
      } else {
        data.designers.push(designer);
      }
      
      this.saveAllData({ designers: data.designers });
    } catch (error) {
      console.error('Failed to save designer:', error);
    }
  }

  // Get designers with safe image resolution
  getDesigners(): any[] {
    try {
      const data = this.getAllData();
      if (!data || !data.designers) return [];

      return data.designers.map(designer => {
        if (!designer) return designer;
        
        if (designer.avatar && !designer.avatar.startsWith('data:') && !designer.avatar.startsWith('http')) {
          try {
            const imageData = this.getImage(designer.avatar);
            return {
              ...designer,
              avatar: imageData || designer.avatar
            };
          } catch (imageError) {
            console.warn('Failed to resolve designer avatar:', imageError);
            return designer;
          }
        }
        return designer;
      });
    } catch (error) {
      console.error('Failed to get designers:', error);
      return [];
    }
  }

  // Standard methods with error handling
  updateDesigners(designers: any[]): void {
    this.saveAllData({ designers: designers || [] });
  }

  updateLearningModules(modules: any[]): void {
    this.saveAllData({ learningModules: modules || [] });
  }

  saveLearningModule(module: any): void {
    try {
      const data = this.getAllData();
      if (!data) return;

      const existingIndex = data.learningModules.findIndex(m => m.id === module.id);
      if (existingIndex >= 0) {
        data.learningModules[existingIndex] = module;
      } else {
        data.learningModules.push(module);
      }
      
      this.saveAllData({ learningModules: data.learningModules });
    } catch (error) {
      console.error('Failed to save learning module:', error);
    }
  }

  getLearningModules(): any[] {
    try {
      const data = this.getAllData();
      return data?.learningModules || [];
    } catch (error) {
      console.error('Failed to get learning modules:', error);
      return [];
    }
  }

  saveLesson(lesson: any, moduleId: string): void {
    try {
      const data = this.getAllData();
      if (!data) return;

      // Save lesson separately
      const existingLessonIndex = data.lessons.findIndex(l => l.id === lesson.id);
      if (existingLessonIndex >= 0) {
        data.lessons[existingLessonIndex] = { ...lesson, moduleId };
      } else {
        data.lessons.push({ ...lesson, moduleId });
      }

      // Update module
      const moduleIndex = data.learningModules.findIndex(m => m.id === moduleId);
      if (moduleIndex >= 0) {
        if (!data.learningModules[moduleIndex].lessons) {
          data.learningModules[moduleIndex].lessons = [];
        }
        
        const lessonInModuleIndex = data.learningModules[moduleIndex].lessons.findIndex(l => l.id === lesson.id);
        if (lessonInModuleIndex >= 0) {
          data.learningModules[moduleIndex].lessons[lessonInModuleIndex] = lesson;
        } else {
          data.learningModules[moduleIndex].lessons.push(lesson);
        }
      }

      this.saveAllData({ lessons: data.lessons, learningModules: data.learningModules });
    } catch (error) {
      console.error('Failed to save lesson:', error);
    }
  }

  saveTest(test: any, moduleId: string): void {
    try {
      const data = this.getAllData();
      if (!data) return;

      // Save test separately
      const existingTestIndex = data.tests.findIndex(t => t.id === test.id);
      if (existingTestIndex >= 0) {
        data.tests[existingTestIndex] = { ...test, moduleId };
      } else {
        data.tests.push({ ...test, moduleId });
      }

      // Update module
      const moduleIndex = data.learningModules.findIndex(m => m.id === moduleId);
      if (moduleIndex >= 0) {
        if (!data.learningModules[moduleIndex].tests) {
          data.learningModules[moduleIndex].tests = [];
        }
        
        const testInModuleIndex = data.learningModules[moduleIndex].tests.findIndex(t => t.id === test.id);
        if (testInModuleIndex >= 0) {
          data.learningModules[moduleIndex].tests[testInModuleIndex] = test;
        } else {
          data.learningModules[moduleIndex].tests.push(test);
        }
      }

      this.saveAllData({ tests: data.tests, learningModules: data.learningModules });
    } catch (error) {
      console.error('Failed to save test:', error);
    }
  }

  updateSkills(skills: any[]): void {
    this.saveAllData({ skills: skills || [] });
  }

  saveSkill(skill: any): void {
    try {
      const data = this.getAllData();
      if (!data) return;

      const existingIndex = data.skills.findIndex(s => s.id === skill.id);
      if (existingIndex >= 0) {
        data.skills[existingIndex] = skill;
      } else {
        data.skills.push(skill);
      }
      
      this.saveAllData({ skills: data.skills });
    } catch (error) {
      console.error('Failed to save skill:', error);
    }
  }

  getSkills(): any[] {
    try {
      const data = this.getAllData();
      return data?.skills || [];
    } catch (error) {
      console.error('Failed to get skills:', error);
      return [];
    }
  }

  // Export/Import with error handling
  exportData(): string {
    try {
      const data = this.getAllData();
      if (!data) return '{}';

      const exportData = {
        ...data,
        exportedAt: new Date().toISOString(),
        exportVersion: this.VERSION
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      return '{}';
    }
  }

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (!data.version && !data.exportVersion) {
        throw new Error('Invalid export format');
      }

      // Clean up export metadata
      delete data.exportedAt;
      delete data.exportVersion;

      this.saveAllData(data);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  clearAllData(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.IMAGES_KEY);
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  }

  initializeWithMockData(mockData: Partial<AppData>): void {
    try {
      const existingData = this.getAllData();
      if (!existingData) {
        this.saveAllData({
          ...this.getDefaultData(),
          ...mockData
        });
      }
    } catch (error) {
      console.error('Failed to initialize with mock data:', error);
    }
  }

  // Get default data structure
  private getDefaultData(): AppData {
    return {
      designers: [],
      learningModules: [],
      skills: [],
      projects: [],
      tests: [],
      lessons: [],
      settings: {},
      images: {},
      lastUpdated: new Date().toISOString(),
      version: this.VERSION,
      backups: []
    };
  }

  // Auto-save with debounce
  private saveTimer: NodeJS.Timeout | null = null;
  
  autoSave(data: Partial<AppData>, delay: number = 2000): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }
    
    this.saveTimer = setTimeout(() => {
      this.saveAllData(data);
    }, delay);
  }

  // Storage statistics
  getStorageSize(): { used: number; total: number; percentage: number } {
    try {
      let used = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length;
        }
      }
      
      const total = 5 * 1024 * 1024; // 5MB
      const percentage = Math.round((used / total) * 100);
      
      return { used, total, percentage };
    } catch (error) {
      console.error('Failed to calculate storage size:', error);
      return { used: 0, total: 5 * 1024 * 1024, percentage: 0 };
    }
  }

  // Usage statistics
  getUsageStats() {
    try {
      const data = this.getAllData();
      if (!data) return null;

      const storageSize = this.getStorageSize();
      
      return {
        designers: data.designers?.length || 0,
        learningModules: data.learningModules?.length || 0,
        skills: data.skills?.length || 0,
        projects: data.projects?.length || 0,
        images: Object.keys(data.images || {}).length,
        backups: data.backups?.length || 0,
        lastUpdated: data.lastUpdated,
        version: data.version,
        storage: storageSize
      };
    } catch (error) {
      console.error('Failed to get usage stats:', error);
      return null;
    }
  }

  // Manual backup creation
  createManualBackup(description: string): string {
    try {
      const data = this.getAllData();
      if (!data) return '';

      if (!data.backups) data.backups = [];

      const backup: BackupEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        description: description || 'Ручний backup',
        data: {
          designers: [...(data.designers || [])],
          learningModules: [...(data.learningModules || [])],
          skills: [...(data.skills || [])],
          projects: [...(data.projects || [])],
          images: { ...(data.images || {}) }
        },
        automatic: false
      };

      data.backups.unshift(backup);
      this.saveAllData({ backups: data.backups });
      
      return backup.id;
    } catch (error) {
      console.error('Failed to create manual backup:', error);
      return '';
    }
  }

  getBackups(): BackupEntry[] {
    try {
      const data = this.getAllData();
      return data?.backups || [];
    } catch (error) {
      console.error('Failed to get backups:', error);
      return [];
    }
  }

  restoreFromBackup(backupId: string): boolean {
    try {
      const data = this.getAllData();
      if (!data || !data.backups) return false;

      const backup = data.backups.find(b => b.id === backupId);
      if (!backup) return false;

      this.saveAllData(backup.data);
      return true;
    } catch (error) {
      console.error('Error restoring from backup:', error);
      return false;
    }
  }
}

export const dataStorage = new DataStorageService();