import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Save, X, Plus, Trash2, Edit, User, Mail, Phone, MapPin,
  Calendar, Clock, Target, Award, Briefcase, GraduationCap,
  TrendingUp, AlertCircle, CheckCircle, Camera, Upload, Download,
  Loader2, Link, ImageIcon, Crop, RotateCw, Palette
} from 'lucide-react';
import { AppContextType } from '../App';
import { dataStorage } from '../services/dataStorage';
import { mockDesigners, mockSkills } from '../services/mockData';

interface DesignerEditorProps {
  designerId?: string;
  mode: 'create' | 'edit';
  context: AppContextType;
  navigateTo: (nav: any) => void;
}

interface DesignerForm {
  // Особиста інформація
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  avatar: string;
  
  // Професійна інформація
  startDate: string;
  employmentType: 'full-time' | 'part-time' | 'contractor' | 'intern';
  level: 'Junior' | 'Middle' | 'Senior' | 'Lead' | 'Principal';
  salary: number;
  location: string;
  
  // Навички та компетенції
  skills: SkillRating[];
  
  // Цілі та розвиток
  careerGoals: string[];
  developmentAreas: string[];
  achievements: Achievement[];
  
  // Робочі характеристики
  workingHours: {
    hoursPerWeek: number;
    flexibleSchedule: boolean;
    remoteWork: boolean;
  };
  
  // Особливості
  bio: string;
  interests: string[];
  languages: Language[];
  
  // Налаштування
  isActive: boolean;
  notifications: {
    email: boolean;
    slack: boolean;
    meetings: boolean;
  };

  // Метадані
  lastModified: string;
  version: number;
}

interface SkillRating {
  skillId: string;
  skillName: string;
  currentLevel: number;
  targetLevel: number;
  lastUpdated: string;
  notes?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'project' | 'certification' | 'award' | 'milestone';
  verified: boolean;
}

interface Language {
  language: string;
  level: 'Basic' | 'Intermediate' | 'Advanced' | 'Native';
}

export function DesignerEditor({ designerId, mode, context, navigateTo }: DesignerEditorProps) {
  const [designerForm, setDesignerForm] = useState<DesignerForm>({
    id: designerId || Date.now().toString(),
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    avatar: '',
    startDate: '',
    employmentType: 'full-time',
    level: 'Middle',
    salary: 0,
    location: '',
    skills: [],
    careerGoals: [],
    developmentAreas: [],
    achievements: [],
    workingHours: {
      hoursPerWeek: 40,
      flexibleSchedule: false,
      remoteWork: false
    },
    bio: '',
    interests: [],
    languages: [],
    isActive: true,
    notifications: {
      email: true,
      slack: true,
      meetings: true
    },
    lastModified: new Date().toISOString(),
    version: 1
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Dialog states
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [showAddAchievement, setShowAddAchievement] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);

  // Photo upload states
  const [photoURL, setPhotoURL] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && designerId) {
      // Завантажуємо дані дизайнера
      const designers = dataStorage.getDesigners();
      let designer = designers.find(d => d.id === designerId);
      
      // Якщо не знайдено в localStorage, беремо з mock
      if (!designer) {
        designer = mockDesigners.find(d => d.id === designerId);
      }
      
      if (designer) {
        setDesignerForm({
          id: designer.id,
          name: designer.name,
          email: designer.email || '',
          phone: designer.phone || '',
          position: designer.position,
          department: designer.department || 'Design',
          avatar: designer.avatar || '',
          startDate: designer.startDate || '',
          employmentType: designer.employmentType || 'full-time',
          level: designer.level || 'Middle',
          salary: designer.salary || 0,
          location: designer.location || '',
          skills: designer.skills.map(skill => ({
            skillId: skill.skillId,
            skillName: mockSkills.find(s => s.id === skill.skillId)?.name || '',
            currentLevel: skill.level,
            targetLevel: skill.targetLevel || skill.level,
            lastUpdated: skill.lastUpdated || new Date().toISOString(),
            notes: skill.notes || ''
          })),
          careerGoals: designer.careerGoals || [],
          developmentAreas: designer.developmentAreas || [],
          achievements: designer.achievements || [],
          workingHours: designer.workingHours || {
            hoursPerWeek: 40,
            flexibleSchedule: false,
            remoteWork: false
          },
          bio: designer.bio || '',
          interests: designer.interests || [],
          languages: designer.languages || [],
          isActive: designer.isActive !== false,
          notifications: designer.notifications || {
            email: true,
            slack: true,
            meetings: true
          },
          lastModified: designer.lastModified || new Date().toISOString(),
          version: designer.version || 1
        });
      }
    }
  }, [mode, designerId]);

  // Валідація форми
  const validateForm = useCallback(() => {
    const errors: string[] = [];
    
    if (!designerForm.name.trim()) {
      errors.push('Ім\'я є обов\'язковим полем');
    }
    
    if (!designerForm.email.trim()) {
      errors.push('Email є обов\'язковим полем');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(designerForm.email)) {
      errors.push('Некоректний формат email');
    }
    
    if (!designerForm.position.trim()) {
      errors.push('Посада є обов\'язковим полем');
    }

    if (designerForm.salary < 0) {
      errors.push('Зарплата не може бути від\'ємною');
    }

    if (designerForm.workingHours.hoursPerWeek < 1 || designerForm.workingHours.hoursPerWeek > 80) {
      errors.push('Кількість робочих годин має бути від 1 до 80');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  }, [designerForm]);

  // Автоматичне збереження
  useEffect(() => {
    if (mode === 'edit' && designerForm.name && hasUnsavedChanges) {
      const timer = setTimeout(() => {
        handleAutoSave();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [designerForm, mode, hasUnsavedChanges]);

  // Відслідковування змін
  useEffect(() => {
    if (mode === 'edit') {
      setHasUnsavedChanges(true);
    }
  }, [designerForm]);

  const handleAutoSave = async () => {
    if (!validateForm()) return;
    
    setIsSaving(true);
    try {
      const updatedForm = {
        ...designerForm,
        lastModified: new Date().toISOString(),
        version: designerForm.version + 1
      };

      const designerData = {
        ...updatedForm,
        skills: updatedForm.skills.map(skill => ({
          skillId: skill.skillId,
          level: skill.currentLevel,
          targetLevel: skill.targetLevel,
          lastUpdated: skill.lastUpdated,
          notes: skill.notes
        }))
      };

      dataStorage.saveDesigner(designerData);
      setDesignerForm(updatedForm);
      setLastSaved(new Date().toLocaleTimeString('uk-UA'));
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      context.addNotification({
        title: 'Помилка валідації',
        message: 'Будь ласка, виправте помилки у формі',
        type: 'error'
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const updatedForm = {
        ...designerForm,
        lastModified: new Date().toISOString(),
        version: designerForm.version + 1
      };

      const designerData = {
        ...updatedForm,
        skills: updatedForm.skills.map(skill => ({
          skillId: skill.skillId,
          level: skill.currentLevel,
          targetLevel: skill.targetLevel,
          lastUpdated: skill.lastUpdated,
          notes: skill.notes
        }))
      };

      dataStorage.saveDesigner(designerData);
      
      context.addNotification({
        title: mode === 'create' ? 'Дизайнера створено' : 'Профіль оновлено',
        message: `Профіль "${designerForm.name}" успішно ${mode === 'create' ? 'створено' : 'оновлено'}`,
        type: 'success'
      });

      setHasUnsavedChanges(false);
      navigateTo({ section: 'designers' });
    } catch (error) {
      context.addNotification({
        title: 'Помилка',
        message: 'Не вдалось зберегти профіль',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Завантаження фото через файл
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Drag & Drop для фото
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        processImageFile(file);
      }
    }
  };

  // Обробка зображення
  const processImageFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      context.addNotification({
        title: 'Файл занадто великий',
        message: 'Розмір файлу не повинен перевищувати 5MB',
        type: 'error'
      });
      return;
    }

    setIsProcessingImage(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      
      // Створюємо canvas для стиснення
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Визначаємо розміри (максимум 400x400)
        const maxSize = 400;
        const ratio = Math.min(maxSize / img.width, maxSize / img.height);
        const newWidth = img.width * ratio;
        const newHeight = img.height * ratio;
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        ctx?.drawImage(img, 0, 0, newWidth, newHeight);
        
        // Конвертуємо у base64 з якістю стиснення
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        
        setDesignerForm(prev => ({
          ...prev,
          avatar: compressedDataUrl
        }));
        
        setIsProcessingImage(false);
        setShowPhotoUpload(false);
        
        context.addNotification({
          title: 'Фото оновлено',
          message: 'Аватар успішно завантажено',
          type: 'success'
        });
      };
      
      img.src = result;
    };
    
    reader.readAsDataURL(file);
  };

  // Завантаження фото з URL
  const handleURLUpload = async () => {
    if (!photoURL.trim()) return;
    
    setIsProcessingImage(true);
    try {
      // Перевіряємо чи це валідний URL зображення
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const maxSize = 400;
        const ratio = Math.min(maxSize / img.width, maxSize / img.height);
        const newWidth = img.width * ratio;
        const newHeight = img.height * ratio;
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        ctx?.drawImage(img, 0, 0, newWidth, newHeight);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        
        setDesignerForm(prev => ({ ...prev, avatar: dataUrl }));
        setPhotoURL('');
        setIsProcessingImage(false);
        setShowPhotoUpload(false);
        
        context.addNotification({
          title: 'Фото оновлено',
          message: 'Аватар успішно завантажено з URL',
          type: 'success'
        });
      };
      
      img.onerror = () => {
        setIsProcessingImage(false);
        context.addNotification({
          title: 'Помилка завантаження',
          message: 'Не вдалось завантажити зображення з цього URL',
          type: 'error'
        });
      };
      
      img.src = photoURL;
    } catch (error) {
      setIsProcessingImage(false);
      context.addNotification({
        title: 'Помилка',
        message: 'Не вдалось завантажити зображення',
        type: 'error'
      });
    }
  };

  const addSkill = (skillId: string, level: number) => {
    const skill = mockSkills.find(s => s.id === skillId);
    if (skill && !designerForm.skills.find(s => s.skillId === skillId)) {
      const newSkill: SkillRating = {
        skillId,
        skillName: skill.name,
        currentLevel: level,
        targetLevel: level,
        lastUpdated: new Date().toISOString()
      };
      setDesignerForm(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill]
      }));
    }
    setShowAddSkill(false);
  };

  const updateSkillLevel = (skillId: string, field: 'currentLevel' | 'targetLevel', value: number) => {
    setDesignerForm(prev => ({
      ...prev,
      skills: prev.skills.map(skill => 
        skill.skillId === skillId 
          ? { ...skill, [field]: value, lastUpdated: new Date().toISOString() }
          : skill
      )
    }));
  };

  const removeSkill = (skillId: string) => {
    setDesignerForm(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s.skillId !== skillId)
    }));
  };

  const addCareerGoal = (goal: string) => {
    if (goal.trim()) {
      setDesignerForm(prev => ({
        ...prev,
        careerGoals: [...prev.careerGoals, goal.trim()]
      }));
    }
    setShowAddGoal(false);
  };

  const removeCareerGoal = (index: number) => {
    setDesignerForm(prev => ({
      ...prev,
      careerGoals: prev.careerGoals.filter((_, i) => i !== index)
    }));
  };

  const addAchievement = (achievement: Omit<Achievement, 'id'>) => {
    const newAchievement: Achievement = {
      ...achievement,
      id: Date.now().toString()
    };
    setDesignerForm(prev => ({
      ...prev,
      achievements: [...prev.achievements, newAchievement]
    }));
    setShowAddAchievement(false);
  };

  const removeAchievement = (achievementId: string) => {
    setDesignerForm(prev => ({
      ...prev,
      achievements: prev.achievements.filter(a => a.id !== achievementId)
    }));
  };

  // Розрахунок статистики
  const averageSkillLevel = designerForm.skills.length > 0 
    ? Math.round(designerForm.skills.reduce((sum, skill) => sum + skill.currentLevel, 0) / designerForm.skills.length)
    : 0;

  const skillGap = designerForm.skills.reduce((gap, skill) => {
    return gap + Math.max(0, skill.targetLevel - skill.currentLevel);
  }, 0);

  const daysSinceJoin = designerForm.startDate 
    ? Math.floor((Date.now() - new Date(designerForm.startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="space-y-6">
      {/* Header with Save Status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {mode === 'create' ? 'Створити профіль дизайнера' : 'Редагувати профіль'}
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-muted-foreground">
              {mode === 'create' 
                ? 'Додайте нового дизайнера до команди'
                : 'Оновіть інформацію та навички дизайнера'
              }
            </p>
            
            {/* Save Status */}
            <div className="flex items-center gap-2 text-sm">
              {isSaving && (
                <div className="flex items-center gap-1 text-blue-600">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Збереження...</span>
                </div>
              )}
              
              {hasUnsavedChanges && !isSaving && (
                <div className="flex items-center gap-1 text-orange-600">
                  <Clock className="w-3 h-3" />
                  <span>Незбережені зміни</span>
                </div>
              )}
              
              {lastSaved && !hasUnsavedChanges && !isSaving && (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-3 h-3" />
                  <span>Збережено {lastSaved}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigateTo({ section: 'designers' })}
          >
            <X className="w-4 h-4 mr-2" />
            Скасувати
          </Button>
          <Button onClick={handleSave} disabled={isLoading || validationErrors.length > 0}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Збереження...' : 'Зберегти'}
          </Button>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList>
              <TabsTrigger value="personal">Особиста інформація</TabsTrigger>
              <TabsTrigger value="professional">Професійне</TabsTrigger>
              <TabsTrigger value="skills">Навички ({designerForm.skills.length})</TabsTrigger>
              <TabsTrigger value="goals">Цілі та розвиток</TabsTrigger>
              <TabsTrigger value="settings">Налаштування</TabsTrigger>
            </TabsList>

            {/* Personal Information */}
            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle>Особиста інформація</CardTitle>
                  <CardDescription>Основні дані дизайнера</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar with Enhanced Upload */}
                  <div className="flex items-center gap-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={designerForm.avatar} alt={designerForm.name} />
                      <AvatarFallback className="text-lg">
                        {designerForm.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <Label>Аватар</Label>
                      <div className="flex gap-2">
                        <Dialog open={showPhotoUpload} onOpenChange={setShowPhotoUpload}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" disabled={isProcessingImage}>
                              {isProcessingImage ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Camera className="w-4 h-4 mr-2" />
                              )}
                              Змінити фото
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Завантажити фото</DialogTitle>
                              <DialogDescription>
                                Виберіть спосіб завантаження фото профіля
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4">
                              {/* File Upload */}
                              <div
                                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                                  isDragging 
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/10' 
                                    : 'border-muted-foreground/25 hover:border-blue-400'
                                }`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                              >
                                <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                                <p className="text-sm font-medium mb-1">
                                  Перетягніть файл сюди або натисніть для вибору
                                </p>
                                <p className="text-xs text-muted-foreground mb-3">
                                  PNG, JPG, GIF до 5MB
                                </p>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleFileUpload}
                                  className="hidden"
                                  id="file-upload"
                                />
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => document.getElementById('file-upload')?.click()}
                                  disabled={isProcessingImage}
                                >
                                  <Upload className="w-4 h-4 mr-2" />
                                  Вибрати файл
                                </Button>
                              </div>
                              
                              {/* URL Input */}
                              <div className="space-y-2">
                                <Label>Або введіть URL зображення</Label>
                                <div className="flex gap-2">
                                  <Input
                                    placeholder="https://example.com/photo.jpg"
                                    value={photoURL}
                                    onChange={(e) => setPhotoURL(e.target.value)}
                                  />
                                  <Button 
                                    onClick={handleURLUpload}
                                    disabled={!photoURL.trim() || isProcessingImage}
                                    size="sm"
                                  >
                                    <Link className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              
                              {isProcessingImage && (
                                <div className="text-center py-4">
                                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                  <p className="text-sm text-muted-foreground">Обробка зображення...</p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        {designerForm.avatar && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => setDesignerForm(prev => ({ ...prev, avatar: '' }))}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Повне ім'я *</Label>
                      <Input
                        id="name"
                        value={designerForm.name}
                        onChange={(e) => setDesignerForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Введіть повне ім'я"
                        className={validationErrors.some(e => e.includes('Ім\'я')) ? 'border-red-500' : ''}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={designerForm.email}
                        onChange={(e) => setDesignerForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="email@company.com"
                        className={validationErrors.some(e => e.includes('email') || e.includes('Email')) ? 'border-red-500' : ''}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Телефон</Label>
                      <Input
                        id="phone"
                        value={designerForm.phone}
                        onChange={(e) => setDesignerForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+380 XX XXX XX XX"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Локація</Label>
                      <Input
                        id="location"
                        value={designerForm.location}
                        onChange={(e) => setDesignerForm(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Київ, Україна"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Біографія</Label>
                    <Textarea
                      id="bio"
                      value={designerForm.bio}
                      onChange={(e) => setDesignerForm(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Розкажіть про себе, досвід, інтереси..."
                      className="min-h-[120px]"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Professional Information */}
            <TabsContent value="professional">
              <Card>
                <CardHeader>
                  <CardTitle>Професійна інформація</CardTitle>
                  <CardDescription>Робоча інформація та статус</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="position">Посада *</Label>
                      <Input
                        id="position"
                        value={designerForm.position}
                        onChange={(e) => setDesignerForm(prev => ({ ...prev, position: e.target.value }))}
                        placeholder="UI/UX Designer"
                        className={validationErrors.some(e => e.includes('Посада')) ? 'border-red-500' : ''}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="department">Відділ</Label>
                      <Select 
                        value={designerForm.department} 
                        onValueChange={(value) => setDesignerForm(prev => ({ ...prev, department: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Оберіть відділ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Design">Design</SelectItem>
                          <SelectItem value="Product">Product</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Development">Development</SelectItem>
                          <SelectItem value="Research">Research</SelectItem>
                          <SelectItem value="Strategy">Strategy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="level">Рівень</Label>
                      <Select 
                        value={designerForm.level} 
                        onValueChange={(value: any) => setDesignerForm(prev => ({ ...prev, level: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Junior">Junior</SelectItem>
                          <SelectItem value="Middle">Middle</SelectItem>
                          <SelectItem value="Senior">Senior</SelectItem>
                          <SelectItem value="Lead">Lead</SelectItem>
                          <SelectItem value="Principal">Principal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="employmentType">Тип зайнятості</Label>
                      <Select 
                        value={designerForm.employmentType} 
                        onValueChange={(value: any) => setDesignerForm(prev => ({ ...prev, employmentType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-time">Повна зайнятість</SelectItem>
                          <SelectItem value="part-time">Часткова зайнятість</SelectItem>
                          <SelectItem value="contractor">Контрактор</SelectItem>
                          <SelectItem value="intern">Стажист</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="startDate">Дата початку роботи</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={designerForm.startDate}
                        onChange={(e) => setDesignerForm(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="salary">Зарплата (USD)</Label>
                      <Input
                        id="salary"
                        type="number"
                        value={designerForm.salary}
                        onChange={(e) => setDesignerForm(prev => ({ ...prev, salary: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
                        min="0"
                        className={validationErrors.some(e => e.includes('Зарплата')) ? 'border-red-500' : ''}
                      />
                    </div>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Робочі години</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Годин на тиждень: {designerForm.workingHours.hoursPerWeek}</Label>
                        <Slider
                          value={[designerForm.workingHours.hoursPerWeek]}
                          onValueChange={(value) => setDesignerForm(prev => ({
                            ...prev,
                            workingHours: { ...prev.workingHours, hoursPerWeek: value[0] }
                          }))}
                          max={80}
                          min={1}
                          step={1}
                          className={validationErrors.some(e => e.includes('робочих годин')) ? 'border-red-500' : ''}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Гнучкий графік</Label>
                          <p className="text-sm text-muted-foreground">Можливість працювати у вільному графіку</p>
                        </div>
                        <Switch
                          checked={designerForm.workingHours.flexibleSchedule}
                          onCheckedChange={(checked) => setDesignerForm(prev => ({
                            ...prev,
                            workingHours: { ...prev.workingHours, flexibleSchedule: checked }
                          }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Віддалена робота</Label>
                          <p className="text-sm text-muted-foreground">Можливість працювати віддалено</p>
                        </div>
                        <Switch
                          checked={designerForm.workingHours.remoteWork}
                          onCheckedChange={(checked) => setDesignerForm(prev => ({
                            ...prev,
                            workingHours: { ...prev.workingHours, remoteWork: checked }
                          }))}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Skills */}
            <TabsContent value="skills">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Навички та компетенції</CardTitle>
                      <CardDescription>Поточний рівень та цілі розвитку</CardDescription>
                    </div>
                    <Button onClick={() => setShowAddSkill(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Додати навичку
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {designerForm.skills.length > 0 ? (
                    <div className="space-y-4">
                      {designerForm.skills.map(skill => (
                        <div key={skill.skillId} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-medium">{skill.skillName}</h4>
                              <p className="text-sm text-muted-foreground">
                                Оновлено: {new Date(skill.lastUpdated).toLocaleDateString('uk-UA')}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeSkill(skill.skillId)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between text-sm mb-2">
                                <span>Поточний рівень</span>
                                <span>{skill.currentLevel}%</span>
                              </div>
                              <Slider
                                value={[skill.currentLevel]}
                                onValueChange={(value) => updateSkillLevel(skill.skillId, 'currentLevel', value[0])}
                                max={100}
                                min={0}
                                step={5}
                              />
                            </div>

                            <div>
                              <div className="flex justify-between text-sm mb-2">
                                <span>Цільовий рівень</span>
                                <span>{skill.targetLevel}%</span>
                              </div>
                              <Slider
                                value={[skill.targetLevel]}
                                onValueChange={(value) => updateSkillLevel(skill.skillId, 'targetLevel', value[0])}
                                max={100}
                                min={skill.currentLevel}
                                step={5}
                              />
                            </div>

                            {skill.targetLevel > skill.currentLevel && (
                              <div className="text-sm text-blue-600">
                                Потрібно покращити на {skill.targetLevel - skill.currentLevel}%
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium mb-2">Немає навичок</h3>
                      <p className="text-muted-foreground mb-4">Додайте навички дизайнера</p>
                      <Button onClick={() => setShowAddSkill(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Додати навичку
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Goals and Development */}
            <TabsContent value="goals">
              <div className="space-y-6">
                {/* Career Goals */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Кар'єрні цілі</CardTitle>
                        <CardDescription>Цілі професійного розвитку</CardDescription>
                      </div>
                      <Button onClick={() => setShowAddGoal(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Додати ціль
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {designerForm.careerGoals.length > 0 ? (
                      <div className="space-y-3">
                        {designerForm.careerGoals.map((goal, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                            <Target className="w-5 h-5 text-blue-500" />
                            <span className="flex-1">{goal}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeCareerGoal(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground">Немає цілей</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Achievements */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Досягнення</CardTitle>
                        <CardDescription>Нагороди, сертифікації, мілстоуни</CardDescription>
                      </div>
                      <Button onClick={() => setShowAddAchievement(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Додати досягнення
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {designerForm.achievements.length > 0 ? (
                      <div className="space-y-3">
                        {designerForm.achievements.map(achievement => (
                          <div key={achievement.id} className="p-3 border rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <Award className="w-5 h-5 text-yellow-500 mt-0.5" />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium">{achievement.title}</h4>
                                    <Badge variant="outline">{achievement.type}</Badge>
                                    {achievement.verified && (
                                      <CheckCircle className="w-4 h-4 text-green-500" />
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {new Date(achievement.date).toLocaleDateString('uk-UA')}
                                  </p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeAchievement(achievement.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground">Немає досягнень</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Settings */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Налаштування профіля</CardTitle>
                  <CardDescription>Статус та налаштування уведомлень</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Активний співробітник</Label>
                      <p className="text-sm text-muted-foreground">Профіль відображається в команді</p>
                    </div>
                    <Switch
                      checked={designerForm.isActive}
                      onCheckedChange={(checked) => setDesignerForm(prev => ({ ...prev, isActive: checked }))}
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Уведомлення</h4>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Email уведомлення</Label>
                        <p className="text-sm text-muted-foreground">Отримувати уведомлення на email</p>
                      </div>
                      <Switch
                        checked={designerForm.notifications.email}
                        onCheckedChange={(checked) => setDesignerForm(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, email: checked }
                        }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Slack уведомлення</Label>
                        <p className="text-sm text-muted-foreground">Отримувати уведомлення в Slack</p>
                      </div>
                      <Switch
                        checked={designerForm.notifications.slack}
                        onCheckedChange={(checked) => setDesignerForm(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, slack: checked }
                        }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Уведомлення про зустрічі</Label>
                        <p className="text-sm text-muted-foreground">Нагадування про міти та дедлайни</p>
                      </div>
                      <Switch
                        checked={designerForm.notifications.meetings}
                        onCheckedChange={(checked) => setDesignerForm(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, meetings: checked }
                        }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Enhanced Sidebar */}
        <div className="space-y-6">
          {/* Profile Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Попередній перегляд</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Avatar className="w-16 h-16 mx-auto mb-3">
                  <AvatarImage src={designerForm.avatar} alt={designerForm.name} />
                  <AvatarFallback>
                    {designerForm.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-medium">{designerForm.name || 'Ім\'я Дизайнера'}</h3>
                <p className="text-sm text-muted-foreground">{designerForm.position || 'Посада'}</p>
                <Badge variant={designerForm.isActive ? 'default' : 'secondary'} className="mt-2">
                  {designerForm.isActive ? 'Активний' : 'Неактивний'}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Навичок:</span>
                  <span>{designerForm.skills.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Середній рівень:</span>
                  <span>{averageSkillLevel}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Пробіл навичок:</span>
                  <span>{skillGap}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Днів у команді:</span>
                  <span>{daysSinceJoin}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Досягнень:</span>
                  <span>{designerForm.achievements.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Цілей:</span>
                  <span>{designerForm.careerGoals.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Validation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Перевірка форми</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                {designerForm.name ? 
                  <CheckCircle className="w-4 h-4 text-green-500" /> : 
                  <AlertCircle className="w-4 h-4 text-red-500" />
                }
                <span className="text-sm">Ім'я</span>
              </div>
              <div className="flex items-center gap-2">
                {designerForm.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(designerForm.email) ? 
                  <CheckCircle className="w-4 h-4 text-green-500" /> : 
                  <AlertCircle className="w-4 h-4 text-red-500" />
                }
                <span className="text-sm">Email</span>
              </div>
              <div className="flex items-center gap-2">
                {designerForm.position ? 
                  <CheckCircle className="w-4 h-4 text-green-500" /> : 
                  <AlertCircle className="w-4 h-4 text-red-500" />
                }
                <span className="text-sm">Посада</span>
              </div>
              <div className="flex items-center gap-2">
                {designerForm.skills.length > 0 ? 
                  <CheckCircle className="w-4 h-4 text-green-500" /> : 
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                }
                <span className="text-sm">Навички</span>
              </div>
              <div className="flex items-center gap-2">
                {designerForm.avatar ? 
                  <CheckCircle className="w-4 h-4 text-green-500" /> : 
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                }
                <span className="text-sm">Фото</span>
              </div>
            </CardContent>
          </Card>

          {/* Backup Info */}
          {mode === 'edit' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Інформація про версії</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Версія:</span>
                  <span>{designerForm.version}</span>
                </div>
                <div className="flex justify-between">
                  <span>Останнє редагування:</span>
                  <span>{new Date(designerForm.lastModified).toLocaleDateString('uk-UA')}</span>
                </div>
                {lastSaved && (
                  <div className="flex justify-between">
                    <span>Автозбереження:</span>
                    <span>{lastSaved}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <AddSkillDialog 
        open={showAddSkill} 
        onOpenChange={setShowAddSkill}
        onAdd={addSkill}
        existingSkills={designerForm.skills.map(s => s.skillId)}
      />

      <AddGoalDialog 
        open={showAddGoal} 
        onOpenChange={setShowAddGoal}
        onAdd={addCareerGoal}
      />

      <AddAchievementDialog 
        open={showAddAchievement} 
        onOpenChange={setShowAddAchievement}
        onAdd={addAchievement}
      />
    </div>
  );
}

// Helper Components (same as before but with DialogDescription added)
function AddSkillDialog({ open, onOpenChange, onAdd, existingSkills }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (skillId: string, level: number) => void;
  existingSkills: string[];
}) {
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [level, setLevel] = useState(50);

  const availableSkills = mockSkills.filter(skill => !existingSkills.includes(skill.id));

  const handleSubmit = () => {
    if (selectedSkillId) {
      onAdd(selectedSkillId, level);
      setSelectedSkillId('');
      setLevel(50);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Додати навичку</DialogTitle>
          <DialogDescription>
            Виберіть навичку та вкажіть поточний рівень володіння
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Навичка</Label>
            <Select value={selectedSkillId} onValueChange={setSelectedSkillId}>
              <SelectTrigger>
                <SelectValue placeholder="Оберіть навичку" />
              </SelectTrigger>
              <SelectContent>
                {availableSkills.map(skill => (
                  <SelectItem key={skill.id} value={skill.id}>
                    {skill.name} ({skill.category})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Поточний рівень: {level}%</Label>
            <Slider
              value={[level]}
              onValueChange={(value) => setLevel(value[0])}
              max={100}
              min={0}
              step={5}
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSubmit} disabled={!selectedSkillId}>
              Додати навичку
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Скасувати
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AddGoalDialog({ open, onOpenChange, onAdd }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (goal: string) => void;
}) {
  const [goal, setGoal] = useState('');

  const handleSubmit = () => {
    if (goal.trim()) {
      onAdd(goal);
      setGoal('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Додати кар'єрну ціль</DialogTitle>
          <DialogDescription>
            Опишіть кар'єрну ціль або напрямок розвитку дизайнера
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Ціль</Label>
            <Textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Опишіть кар'єрну ціль..."
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSubmit}>Додати ціль</Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Скасувати</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AddAchievementDialog({ open, onOpenChange, onAdd }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (achievement: Omit<Achievement, 'id'>) => void;
}) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    type: 'project' as Achievement['type'],
    verified: false
  });

  const handleSubmit = () => {
    if (form.title && form.date) {
      onAdd(form);
      setForm({
        title: '',
        description: '',
        date: '',
        type: 'project',
        verified: false
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Додати досягнення</DialogTitle>
          <DialogDescription>
            Додайте нагороду, сертифікат, завершений проект або інше досягнення
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Назва досягнення</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Назва нагороди, сертифіката..."
            />
          </div>
          <div className="space-y-2">
            <Label>Тип</Label>
            <Select value={form.type} onValueChange={(value: any) => setForm(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="project">Проект</SelectItem>
                <SelectItem value="certification">Сертифікація</SelectItem>
                <SelectItem value="award">Нагорода</SelectItem>
                <SelectItem value="milestone">Мілстоун</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Опис</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Деталі досягнення..."
            />
          </div>
          <div className="space-y-2">
            <Label>Дата</Label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSubmit}>Додати досягнення</Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Скасувати</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}