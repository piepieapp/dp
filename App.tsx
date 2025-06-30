import { useState, useEffect } from 'react';
import { SidebarProvider } from './components/ui/sidebar';
import { AppSidebar } from './components/AppSidebar';
import { Dashboard } from './components/Dashboard';
import { DesignersManager } from './components/DesignersManager';
import { DesignerProfile } from './components/DesignerProfile';
import { DesignerEditor } from './components/DesignerEditor';
import { SkillsMatrix } from './components/SkillsMatrix';
import { SkillEditor } from './components/SkillEditor';
import { LearningModuleManager } from './components/LearningModule';
import { ModuleEditor } from './components/ModuleEditor';
import { ModuleDetails } from './components/ModuleDetails';
import { LessonView } from './components/LessonView';
import { LessonEditor } from './components/LessonEditor';
import { TestEditor } from './components/TestEditor';
import { ProjectsManager } from './components/ProjectsManager';
import { ProjectEditor } from './components/ProjectEditor';
import { Analytics } from './components/Analytics';
import { Calendar } from './components/Calendar';
import { Settings } from './components/Settings';
import { Toaster } from './components/ui/sonner';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from './components/ui/breadcrumb';
import { ChevronLeft, Download, Upload, Database } from 'lucide-react';
import { Button } from './components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { Designer, LearningModule, Project, Skill, Lesson } from './types';
import { dataStorage } from './services/dataStorage';
import { mockDesigners, mockSkills, mockLearningModules } from './services/mockData';

export interface AppContextType {
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: string;
    read: boolean;
  }>;
  addNotification: (notification: Omit<AppContextType['notifications'][0], 'id' | 'timestamp' | 'read'>) => void;
  currentUser: {
    id: string;
    name: string;
    role: 'admin' | 'team_lead' | 'designer';
    permissions: string[];
  };
  dataVersion: number;
  triggerDataRefresh: () => void;
}

interface NavigationState {
  section: string;
  subsection?: string;
  id?: string;
  mode?: 'view' | 'edit' | 'create';
  data?: any;
  moduleId?: string; // для контексту в якому модулі ми працюємо
}

export default function App() {
  const [navigation, setNavigation] = useState<NavigationState>({ section: 'dashboard' });
  const [navigation, setNavigation] = useState<NavigationState>({ section: 'dashboard' });
  const [dataVersion, setDataVersion] = useState(0); // <--- Новий стан
  const [notifications, setNotifications] = useState<AppContextType['notifications']>([
    {
      id: '1',
      title: 'Новий модуль навчання',
      message: 'Модуль "Advanced UX Research" готовий до призначення',
      type: 'info',
      timestamp: new Date().toISOString(),
      read: false
    },
    {
      id: '2',
      title: 'Оновлення навичок',
      message: 'Марія Петренко завершила тест з UI Design',
      type: 'success',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      read: false
    }
  ]);

  const [showDataManagement, setShowDataManagement] = useState(false);

  // Ініціалізація localStorage з mock даними при першому завантаженні
  useEffect(() => {
    const existingData = dataStorage.getAllData();
    if (!existingData) {
      dataStorage.initializeWithMockData({
        designers: mockDesigners,
        skills: mockSkills,
        learningModules: mockLearningModules,
        projects: [],
        tests: [],
        lessons: []
      });
      
      addNotification({
        title: 'Дані ініціалізовано',
        message: 'Завантажено початкові дані з mock даних',
        type: 'info'
      });
    }
  }, []);

  const addNotification = (notification: Omit<AppContextType['notifications'][0], 'id' | 'timestamp' | 'read'>) => {
    const newNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const triggerDataRefresh = () => setDataVersion(v => v + 1); // <--- Нова функція

  const appContext: AppContextType = {
    notifications,
    addNotification,
    currentUser: {
      id: 'current-user',
      name: 'Олександр Коваленко',
      role: 'team_lead',
      permissions: ['manage_team', 'assign_modules', 'view_analytics', 'create_modules', 'edit_skills']
    },
    dataVersion,         // <--- Додано в контекст
    triggerDataRefresh   // <--- Додано в контекст
  };

  const navigateTo = (newNav: Partial<NavigationState>) => {
    setNavigation(prev => ({ ...prev, ...newNav }));
  };

  const goBack = () => {
    // Smart back navigation based on context
    if (navigation.subsection === 'lesson-editor' || navigation.subsection === 'test-editor') {
      // Якщо редагуємо урок/тест, повертаємось до редагування модуля
      if (navigation.moduleId) {
        setNavigation({ 
          section: 'learning', 
          subsection: 'module-editor', 
          id: navigation.moduleId, 
          mode: 'edit' 
        });
      } else {
        setNavigation({ section: 'learning' });
      }
    } else if (navigation.subsection === 'designer-editor') {
      setNavigation({ section: 'designers' });
    } else if (navigation.subsection) {
      setNavigation({ section: navigation.section });
    } else {
      setNavigation({ section: 'dashboard' });
    }
  };

  const exportData = () => {
    const data = dataStorage.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `designer-platform-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    addNotification({
      title: 'Дані експортовано',
      message: 'Backup файл успішно завантажено',
      type: 'success'
    });
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string;
        if (dataStorage.importData(data)) {
          addNotification({
            title: 'Дані імпортовано',
            message: 'Дані успішно відновлено з backup файлу',
            type: 'success'
          });
          // Перезавантажуємо сторінку для оновлення даних
          window.location.reload();
        } else {
          throw new Error('Invalid data format');
        }
      } catch (error) {
        addNotification({
          title: 'Помилка імпорту',
          message: 'Не вдалось імпортувати дані з файлу',
          type: 'error'
        });
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    if (confirm('Ви впевнені що хочете очистити всі дані? Цю дію неможливо скасувати.')) {
      dataStorage.clearAllData();
      addNotification({
        title: 'Дані очищено',
        message: 'Всі дані видалено з локального сховища',
        type: 'warning'
      });
      window.location.reload();
    }
  };

  const renderBreadcrumb = () => {
    const items = [];
    
    items.push({ label: getSectionLabel(navigation.section), path: navigation.section });
    
    if (navigation.subsection) {
      // Якщо редагуємо урок/тест, додаємо проміжний крок
      if ((navigation.subsection === 'lesson-editor' || navigation.subsection === 'test-editor') && navigation.moduleId) {
        items.push({ label: 'Редагувати модуль', path: 'module-editor' });
      }
      items.push({ label: getSubsectionLabel(navigation.subsection, navigation.mode), path: navigation.subsection });
    }

    return (
      <div className="flex items-center gap-4 mb-6">
        {items.length > 1 && (
          <Button variant="ghost" size="sm" onClick={goBack} className="flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" />
            Назад
          </Button>
        )}
        <Breadcrumb>
          <BreadcrumbList>
            {items.map((item, index) => (
              <div key={item.path} className="flex items-center">
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {index === items.length - 1 ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink 
                      onClick={() => {
                        if (item.path === 'module-editor' && navigation.moduleId) {
                          navigateTo({ 
                            section: 'learning', 
                            subsection: 'module-editor', 
                            id: navigation.moduleId, 
                            mode: 'edit' 
                          });
                        } else {
                          navigateTo({ section: item.path, subsection: undefined, id: undefined });
                        }
                      }}
                      className="cursor-pointer"
                    >
                      {item.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Data Management Button */}
        <div className="ml-auto">
          <Dialog open={showDataManagement} onOpenChange={setShowDataManagement}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Database className="w-4 h-4 mr-2" />
                Управління даними
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Управління даними</DialogTitle>
                <DialogDescription>
                  Експорт, імпорт та управління збереженими даними платформи
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button onClick={exportData} className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Експорт даних
                  </Button>
                  <div>
                    <input
                      type="file"
                      accept=".json"
                      onChange={importData}
                      style={{ display: 'none' }}
                      id="import-file"
                    />
                    <Button 
                      onClick={() => document.getElementById('import-file')?.click()}
                      variant="outline"
                      className="w-full flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Імпорт даних
                    </Button>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <Button 
                    onClick={clearAllData}
                    variant="destructive"
                    className="w-full"
                  >
                    Очистити всі дані
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    Видалить всі збережені дані з локального сховища
                  </p>
                </div>
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  <p>Останнє оновлення: {dataStorage.getAllData()?.lastUpdated ? 
                    new Date(dataStorage.getAllData()!.lastUpdated).toLocaleString('uk-UA') : 'Невідомо'}
                  </p>
                  <p>Версія: {dataStorage.getAllData()?.version || 'Невідома'}</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    const props = { 
      context: appContext, 
      navigateTo,
      currentNavigation: navigation 
    };
    
    // Детальні сторінки профілів
    if (navigation.subsection === 'designer-profile' && navigation.id) {
      return <DesignerProfile designerId={navigation.id} {...props} />;
    }
    
    // Редагування дизайнерів
    if (navigation.subsection === 'designer-editor') {
      return <DesignerEditor designerId={navigation.id} mode={navigation.mode || 'create'} {...props} />;
    }
    
    // Модулі навчання
    if (navigation.subsection === 'module-details' && navigation.id) {
      return <ModuleDetails moduleId={navigation.id} {...props} />;
    }
    
    if (navigation.subsection === 'module-editor') {
      return <ModuleEditor moduleId={navigation.id} mode={navigation.mode || 'create'} {...props} />;
    }
    
    // Уроки
    if (navigation.subsection === 'lesson-view' && navigation.data) {
      return <LessonView lesson={navigation.data} {...props} />;
    }
    
    if (navigation.subsection === 'lesson-editor') {
      return <LessonEditor 
        lessonId={navigation.id} 
        moduleId={navigation.moduleId} 
        mode={navigation.mode || 'create'} 
        {...props} 
      />;
    }

    // Тести
    if (navigation.subsection === 'test-editor') {
      return <TestEditor 
        testId={navigation.id} 
        moduleId={navigation.moduleId} 
        mode={navigation.mode || 'create'} 
        {...props} 
      />;
    }

    // Навички
    if (navigation.subsection === 'skill-editor') {
      return <SkillEditor skillId={navigation.id} mode={navigation.mode || 'create'} {...props} />;
    }

    // Проекти
    if (navigation.subsection === 'project-editor') {
      return <ProjectEditor projectId={navigation.id} mode={navigation.mode || 'create'} {...props} />;
    }

    // Основні секції
    switch (navigation.section) {
      case 'dashboard':
        return <Dashboard {...props} />;
      case 'designers':
        return <DesignersManager {...props} />;
      case 'skills':
        return <SkillsMatrix {...props} />;
      case 'learning':
        return <LearningModuleManager {...props} />;
      case 'projects':
        return <ProjectsManager {...props} />;
      case 'analytics':
        return <Analytics {...props} />;
      case 'calendar':
        return <Calendar {...props} />;
      case 'settings':
        return <Settings {...props} />;
      default:
        return <Dashboard {...props} />;
    }
  };

  return (
    <SidebarProvider>
      <div className="w-full h-screen flex bg-background">
        <AppSidebar 
          activeSection={navigation.section} 
          onSectionChange={(section) => navigateTo({ section })}
          notifications={notifications}
        />
        
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {renderBreadcrumb()}
            {renderContent()}
          </div>
        </main>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}

function getSectionLabel(section: string): string {
  const labels: Record<string, string> = {
    dashboard: 'Дашборд',
    designers: 'Дизайнери',
    skills: 'Навички',
    learning: 'Навчання',
    projects: 'Проекти',
    analytics: 'Аналітика',
    calendar: 'Календар',
    settings: 'Налаштування'
  };
  return labels[section] || section;
}

function getSubsectionLabel(subsection: string, mode?: string): string {
  const labels: Record<string, string> = {
    'designer-profile': 'Профіль дизайнера',
    'designer-editor': mode === 'create' ? 'Створити дизайнера' : 'Редагувати дизайнера',
    'module-details': 'Деталі модуля',
    'module-editor': mode === 'create' ? 'Створити модуль' : 'Редагувати модуль',
    'lesson-view': 'Урок',
    'lesson-editor': mode === 'create' ? 'Створити урок' : 'Редагувати урок',
    'test-editor': mode === 'create' ? 'Створити тест' : 'Редагувати тест',
    'skill-editor': mode === 'create' ? 'Створити навичку' : 'Редагувати навичку',
    'project-editor': mode === 'create' ? 'Створити проект' : 'Редагувати проект'
  };
  return labels[subsection] || subsection;
}