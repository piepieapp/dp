import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { 
  Save, X, Plus, Trash2, BookOpen, FileText, Video, 
  Target, Clock, AlertCircle, CheckCircle, Edit, Eye,
  DragHandleDots2, GripVertical
} from 'lucide-react';
import { AppContextType } from '../App';
import { mockLearningModules } from '../services/mockData';

interface ModuleEditorProps {
  moduleId?: string;
  mode: 'create' | 'edit';
  context: AppContextType;
  navigateTo: (nav: any) => void;
}

interface ModuleForm {
  title: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: number;
  lessons: Lesson[];
  tests: Test[];
  resources: Resource[];
}

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'article' | 'interactive';
  duration: string;
  content: string;
  order: number;
  isCompleted?: boolean;
}

interface Test {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  passingScore: number;
  timeLimit: number;
}

interface Question {
  id: string;
  question: string;
  type: 'multiple-choice' | 'text' | 'rating';
  options?: string[];
  correctAnswer?: string | number;
}

interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'link' | 'video' | 'document';
  url: string;
  description: string;
}

export function ModuleEditor({ moduleId, mode, context, navigateTo }: ModuleEditorProps) {
  const [moduleForm, setModuleForm] = useState<ModuleForm>({
    title: '',
    description: '',
    category: '',
    difficulty: 'Beginner',
    estimatedTime: 0,
    lessons: [],
    tests: [],
    resources: []
  });

  const [showAddLesson, setShowAddLesson] = useState(false);
  const [showAddTest, setShowAddTest] = useState(false);
  const [showAddResource, setShowAddResource] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock categories
  const categories = ['Design', 'Research', 'Tools', 'Leadership', 'Development', 'Innovation'];

  useEffect(() => {
    if (mode === 'edit' && moduleId) {
      // Load existing module data
      const existingModule = mockLearningModules.find(m => m.id === moduleId);
      if (existingModule) {
        setModuleForm({
          title: existingModule.title,
          description: existingModule.description,
          category: existingModule.category,
          difficulty: existingModule.difficulty,
          estimatedTime: existingModule.estimatedTime,
          lessons: [
            {
              id: '1',
              title: 'Введення в UX дослідження',
              type: 'video',
              duration: '15 хв',
              content: 'Основи UX дослідження та його роль в дизайн процесі',
              order: 1
            },
            {
              id: '2', 
              title: 'Методи збору даних',
              type: 'article',
              duration: '25 хв',
              content: 'Інтерв\'ю, анкетування, спостереження',
              order: 2
            }
          ],
          tests: existingModule.tests.map(test => ({
            id: test.id,
            title: test.title,
            description: '',
            questions: test.questions.map(q => ({
              id: q.id,
              question: q.question,
              type: q.type,
              options: q.options,
              correctAnswer: q.correctAnswer
            })),
            passingScore: test.passingScore,
            timeLimit: 60
          })),
          resources: [
            {
              id: '1',
              title: 'UX Research Toolkit',
              type: 'pdf',
              url: '#',
              description: 'Збірка шаблонів для проведення досліджень'
            }
          ]
        });
      }
    }
  }, [mode, moduleId]);

  const handleSave = async () => {
    setIsLoading(true);
    
    // Validate form
    if (!moduleForm.title || !moduleForm.description || !moduleForm.category) {
      context.addNotification({
        title: 'Помилка валідації',
        message: 'Заповніть всі обов\'язкові поля',
        type: 'error'
      });
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      context.addNotification({
        title: mode === 'create' ? 'Модуль створено' : 'Модуль оновлено',
        message: `Модуль "${moduleForm.title}" успішно ${mode === 'create' ? 'створено' : 'оновлено'}`,
        type: 'success'
      });

      // Navigate back to modules list
      navigateTo({ section: 'learning' });
    } catch (error) {
      context.addNotification({
        title: 'Помилка',
        message: 'Не вдалось зберегти модуль',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeLesson = (lessonId: string) => {
    setModuleForm(prev => ({
      ...prev,
      lessons: prev.lessons.filter(l => l.id !== lessonId)
    }));
  };

  const removeTest = (testId: string) => {
    setModuleForm(prev => ({
      ...prev,
      tests: prev.tests.filter(t => t.id !== testId)
    }));
  };

  const removeResource = (resourceId: string) => {
    setModuleForm(prev => ({
      ...prev,
      resources: prev.resources.filter(r => r.id !== resourceId)
    }));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'article': return <FileText className="w-4 h-4" />;
      case 'interactive': return <Target className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {mode === 'create' ? 'Створити модуль' : 'Редагувати модуль'}
          </h1>
          <p className="text-muted-foreground">
            {mode === 'create' 
              ? 'Створіть новий навчальний модуль для команди'
              : 'Оновіть інформацію про модуль'
            }
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigateTo({ section: 'learning' })}
          >
            <X className="w-4 h-4 mr-2" />
            Скасувати
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Збереження...' : 'Зберегти'}
          </Button>
        </div>
      </div>

      {/* Form Content */}
      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList>
          <TabsTrigger value="basic">Основна інформація</TabsTrigger>
          <TabsTrigger value="lessons">Уроки ({moduleForm.lessons.length})</TabsTrigger>
          <TabsTrigger value="tests">Тести ({moduleForm.tests.length})</TabsTrigger>
          <TabsTrigger value="resources">Ресурси ({moduleForm.resources.length})</TabsTrigger>
        </TabsList>

        {/* Basic Information */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Загальна інформація</CardTitle>
              <CardDescription>Основні відомості про модуль</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Назва модуля *</Label>
                  <Input
                    id="title"
                    value={moduleForm.title}
                    onChange={(e) => setModuleForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Введіть назву модуля"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Категорія *</Label>
                  <Select 
                    value={moduleForm.category} 
                    onValueChange={(value) => setModuleForm(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Оберіть категорію" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Рівень складності *</Label>
                  <Select 
                    value={moduleForm.difficulty} 
                    onValueChange={(value: any) => setModuleForm(prev => ({ ...prev, difficulty: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Початковий</SelectItem>
                      <SelectItem value="Intermediate">Середній</SelectItem>
                      <SelectItem value="Advanced">Просунутий</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedTime">Орієнтовний час (години) *</Label>
                  <Input
                    id="estimatedTime"
                    type="number"
                    value={moduleForm.estimatedTime}
                    onChange={(e) => setModuleForm(prev => ({ ...prev, estimatedTime: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Опис модуля *</Label>
                <Textarea
                  id="description"
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Детальний опис модуля навчання"
                  className="min-h-[120px]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lessons */}
        <TabsContent value="lessons">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Уроки модуля</CardTitle>
                  <CardDescription>Структуруйте навчальний контент</CardDescription>
                </div>
                <Button onClick={() => navigateTo({ 
                  section: 'learning', 
                  subsection: 'lesson-editor', 
                  moduleId: moduleId,
                  mode: 'create' 
                })}>
                  <Plus className="w-4 h-4 mr-2" />
                  Створити урок
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {moduleForm.lessons.length > 0 ? (
                <div className="space-y-3">
                  {moduleForm.lessons.map((lesson, index) => (
                    <div key={lesson.id} className="flex items-center gap-3 p-4 border rounded-lg hover:bg-secondary/50 transition-colors group">
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(lesson.type)}
                          <span className="font-medium">{lesson.title}</span>
                          <Badge variant="outline">{lesson.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{lesson.content}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{lesson.duration}</span>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigateTo({ 
                            section: 'learning', 
                            subsection: 'lesson-editor', 
                            id: lesson.id,
                            moduleId: moduleId,
                            mode: 'edit' 
                          })}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigateTo({ 
                            section: 'learning', 
                            subsection: 'lesson-view', 
                            data: lesson 
                          })}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeLesson(lesson.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Немає уроків</h3>
                  <p className="text-muted-foreground mb-4">Створіть перший урок для цього модуля</p>
                  <Button onClick={() => navigateTo({ 
                    section: 'learning', 
                    subsection: 'lesson-editor', 
                    moduleId: moduleId,
                    mode: 'create' 
                  })}>
                    <Plus className="w-4 h-4 mr-2" />
                    Створити урок
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tests */}
        <TabsContent value="tests">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Тести та перевірки</CardTitle>
                  <CardDescription>Створіть тести для оцінки знань</CardDescription>
                </div>
                <Button onClick={() => navigateTo({ 
                  section: 'learning', 
                  subsection: 'test-editor', 
                  moduleId: moduleId,
                  mode: 'create' 
                })}>
                  <Plus className="w-4 h-4 mr-2" />
                  Створити тест
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {moduleForm.tests.length > 0 ? (
                <div className="space-y-3">
                  {moduleForm.tests.map(test => (
                    <div key={test.id} className="p-4 border rounded-lg hover:bg-secondary/50 transition-colors group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="font-medium">{test.title}</span>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigateTo({ 
                              section: 'learning', 
                              subsection: 'test-editor', 
                              id: test.id,
                              moduleId: moduleId,
                              mode: 'edit' 
                            })}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeTest(test.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div>Питань: {test.questions.length}</div>
                        <div>Прохідний бал: {test.passingScore}%</div>
                        <div>Час: {test.timeLimit} хв</div>
                      </div>
                      {test.description && (
                        <p className="text-sm text-muted-foreground mt-2">{test.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Немає тестів</h3>
                  <p className="text-muted-foreground mb-4">Створіть перший тест для перевірки знань</p>
                  <Button onClick={() => navigateTo({ 
                    section: 'learning', 
                    subsection: 'test-editor', 
                    moduleId: moduleId,
                    mode: 'create' 
                  })}>
                    <Plus className="w-4 h-4 mr-2" />
                    Створити тест
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources */}
        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Додаткові ресурси</CardTitle>
                  <CardDescription>Матеріали для самостійного вивчення</CardDescription>
                </div>
                <Button onClick={() => setShowAddResource(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Додати ресурс
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {moduleForm.resources.length > 0 ? (
                <div className="space-y-3">
                  {moduleForm.resources.map(resource => (
                    <div key={resource.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <FileText className="w-5 h-5 text-blue-500" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{resource.title}</span>
                          <Badge variant="outline">{resource.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{resource.description}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeResource(resource.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Немає ресурсів</h3>
                  <p className="text-muted-foreground mb-4">Додайте корисні матеріали</p>
                  <Button onClick={() => setShowAddResource(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Додати ресурс
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Resource Dialog */}
      <AddResourceDialog 
        open={showAddResource} 
        onOpenChange={setShowAddResource}
        onAdd={(resource) => {
          const newResource = {
            ...resource,
            id: Date.now().toString()
          };
          setModuleForm(prev => ({
            ...prev,
            resources: [...prev.resources, newResource]
          }));
          setShowAddResource(false);
        }}
      />
    </div>
  );
}

// Helper Components
function AddResourceDialog({ open, onOpenChange, onAdd }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (resource: Omit<Resource, 'id'>) => void;
}) {
  const [form, setForm] = useState({
    title: '',
    type: 'pdf' as 'pdf' | 'link' | 'video' | 'document',
    url: '',
    description: ''
  });

  const handleSubmit = () => {
    if (form.title && form.url) {
      onAdd(form);
      setForm({ title: '', type: 'pdf', url: '', description: '' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Додати ресурс</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Назва ресурсу</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Введіть назву ресурсу"
            />
          </div>
          <div className="space-y-2">
            <Label>Тип ресурсу</Label>
            <Select value={form.type} onValueChange={(value: any) => setForm(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF документ</SelectItem>
                <SelectItem value="link">Посилання</SelectItem>
                <SelectItem value="video">Відео</SelectItem>
                <SelectItem value="document">Документ</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>URL</Label>
            <Input
              value={form.url}
              onChange={(e) => setForm(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label>Опис</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Короткий опис ресурсу"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSubmit}>Додати ресурс</Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Скасувати</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}