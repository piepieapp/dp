import { useState, useEffect } from 'react';
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
import { 
  Save, X, Eye, Play, FileText, Video, Target, 
  Clock, AlertCircle, CheckCircle, Upload, Link,
  Image, Mic, Download, Settings
} from 'lucide-react';
import { AppContextType } from '../App';

interface LessonEditorProps {
  lessonId?: string;
  moduleId?: string;
  mode: 'create' | 'edit';
  context: AppContextType;
  navigateTo: (nav: any) => void;
}

interface LessonForm {
  title: string;
  type: 'video' | 'article' | 'interactive' | 'audio' | 'presentation';
  duration: number; // в хвилинах
  content: string;
  description: string;
  videoUrl?: string;
  attachments: Attachment[];
  settings: LessonSettings;
  order: number;
  prerequisites: string[];
  learningObjectives: string[];
  resources: LessonResource[];
}

interface Attachment {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'document' | 'audio' | 'video';
  url: string;
  size: number;
}

interface LessonSettings {
  isPublished: boolean;
  allowComments: boolean;
  trackCompletion: boolean;
  passingScore?: number;
  timeLimit?: number;
  retakeAllowed: boolean;
  certificateEligible: boolean;
}

interface LessonResource {
  id: string;
  title: string;
  url: string;
  type: 'link' | 'document' | 'tool';
  description: string;
}

export function LessonEditor({ lessonId, moduleId, mode, context, navigateTo }: LessonEditorProps) {
  const [lessonForm, setLessonForm] = useState<LessonForm>({
    title: '',
    type: 'article',
    duration: 15,
    content: '',
    description: '',
    attachments: [],
    settings: {
      isPublished: false,
      allowComments: true,
      trackCompletion: true,
      retakeAllowed: true,
      certificateEligible: false
    },
    order: 1,
    prerequisites: [],
    learningObjectives: [],
    resources: []
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    if (mode === 'edit' && lessonId) {
      // Load existing lesson data
      // В реальному додатку тут буде API виклик
      setLessonForm(prev => ({
        ...prev,
        title: 'Основи UX досліджень',
        type: 'video',
        duration: 25,
        content: 'Детальний контент уроку...',
        description: 'Цей урок охоплює основні принципи UX досліджень'
      }));
    }
  }, [mode, lessonId]);

  // Автозбереження в draft
  useEffect(() => {
    const timer = setTimeout(() => {
      if (lessonForm.title || lessonForm.content) {
        setIsDraft(true);
        // Зберігаємо в localStorage або відправляємо на сервер
        localStorage.setItem(`lesson-draft-${lessonId || 'new'}`, JSON.stringify(lessonForm));
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [lessonForm, lessonId]);

  // Підрахунок слів
  useEffect(() => {
    const words = lessonForm.content.split(/\s+/).filter(word => word.length > 0).length;
    setWordCount(words);
  }, [lessonForm.content]);

  const handleSave = async () => {
    setIsLoading(true);
    
    // Валідація
    if (!lessonForm.title || !lessonForm.content) {
      context.addNotification({
        title: 'Помилка валідації',
        message: 'Заповніть назву та контент уроку',
        type: 'error'
      });
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Очищаємо draft
      localStorage.removeItem(`lesson-draft-${lessonId || 'new'}`);
      
      context.addNotification({
        title: mode === 'create' ? 'Урок створено' : 'Урок оновлено',
        message: `Урок "${lessonForm.title}" успішно ${mode === 'create' ? 'створено' : 'оновлено'}`,
        type: 'success'
      });

      // Повертаємось до редагування модуля
      if (moduleId) {
        navigateTo({ 
          section: 'learning', 
          subsection: 'module-editor', 
          id: moduleId, 
          mode: 'edit' 
        });
      } else {
        navigateTo({ section: 'learning' });
      }
    } catch (error) {
      context.addNotification({
        title: 'Помилка',
        message: 'Не вдалось зберегти урок',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addLearningObjective = () => {
    setLessonForm(prev => ({
      ...prev,
      learningObjectives: [...prev.learningObjectives, '']
    }));
  };

  const updateLearningObjective = (index: number, value: string) => {
    setLessonForm(prev => ({
      ...prev,
      learningObjectives: prev.learningObjectives.map((obj, i) => i === index ? value : obj)
    }));
  };

  const removeLearningObjective = (index: number) => {
    setLessonForm(prev => ({
      ...prev,
      learningObjectives: prev.learningObjectives.filter((_, i) => i !== index)
    }));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'article': return <FileText className="w-4 h-4" />;
      case 'interactive': return <Target className="w-4 h-4" />;
      case 'audio': return <Mic className="w-4 h-4" />;
      case 'presentation': return <Image className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const estimatedReadingTime = Math.ceil(wordCount / 200); // 200 words per minute

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">
              {mode === 'create' ? 'Створити урок' : 'Редагувати урок'}
            </h1>
            {isDraft && (
              <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                Збережено як чернетка
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {mode === 'create' 
              ? 'Створіть новий урок для модуля навчання'
              : 'Редагуйте контент та налаштування уроку'
            }
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {showPreview ? 'Сховати' : 'Попередній перегляд'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              if (moduleId) {
                navigateTo({ 
                  section: 'learning', 
                  subsection: 'module-editor', 
                  id: moduleId, 
                  mode: 'edit' 
                });
              } else {
                navigateTo({ section: 'learning' });
              }
            }}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {showPreview ? (
            /* Preview Mode */
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  {getTypeIcon(lessonForm.type)}
                  <CardTitle>{lessonForm.title || 'Назва уроку'}</CardTitle>
                  <Badge variant="outline">{lessonForm.type}</Badge>
                </div>
                <CardDescription>{lessonForm.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  {lessonForm.type === 'video' && lessonForm.videoUrl && (
                    <div className="aspect-video bg-black rounded-lg flex items-center justify-center mb-4">
                      <Play className="w-16 h-16 text-white opacity-80" />
                    </div>
                  )}
                  <div className="whitespace-pre-line">
                    {lessonForm.content || 'Контент уроку буде відображатися тут...'}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Edit Mode */
            <Tabs defaultValue="content" className="space-y-6">
              <TabsList>
                <TabsTrigger value="content">Контент</TabsTrigger>
                <TabsTrigger value="media">Медіа</TabsTrigger>
                <TabsTrigger value="objectives">Цілі</TabsTrigger>
                <TabsTrigger value="settings">Налаштування</TabsTrigger>
              </TabsList>

              {/* Content Tab */}
              <TabsContent value="content">
                <Card>
                  <CardHeader>
                    <CardTitle>Основний контент</CardTitle>
                    <CardDescription>Створіть змістовний та корисний урок</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="title">Назва уроку *</Label>
                        <Input
                          id="title"
                          value={lessonForm.title}
                          onChange={(e) => setLessonForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Введіть назву уроку"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="type">Тип уроку *</Label>
                        <Select 
                          value={lessonForm.type} 
                          onValueChange={(value: any) => setLessonForm(prev => ({ ...prev, type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="video">Відео урок</SelectItem>
                            <SelectItem value="article">Стаття</SelectItem>
                            <SelectItem value="interactive">Інтерактивний</SelectItem>
                            <SelectItem value="audio">Аудіо урок</SelectItem>
                            <SelectItem value="presentation">Презентація</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Короткий опис</Label>
                      <Textarea
                        id="description"
                        value={lessonForm.description}
                        onChange={(e) => setLessonForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Короткий опис того, що вивчать студенти"
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="content">Контент уроку *</Label>
                        <div className="text-xs text-muted-foreground">
                          {wordCount} слів • ~{estimatedReadingTime} хв читання
                        </div>
                      </div>
                      <Textarea
                        id="content"
                        value={lessonForm.content}
                        onChange={(e) => setLessonForm(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Введіть детальний контент уроку..."
                        className="min-h-[300px] font-mono"
                      />
                      <div className="text-xs text-muted-foreground">
                        Підтримується Markdown форматування
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Тривалість уроку: {lessonForm.duration} хвилин</Label>
                      <Slider
                        value={[lessonForm.duration]}
                        onValueChange={(value) => setLessonForm(prev => ({ ...prev, duration: value[0] }))}
                        max={120}
                        min={5}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>5 хв</span>
                        <span>120 хв</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Media Tab */}
              <TabsContent value="media">
                <Card>
                  <CardHeader>
                    <CardTitle>Медіа контент</CardTitle>
                    <CardDescription>Додайте відео, зображення та інші файли</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {lessonForm.type === 'video' && (
                      <div className="space-y-2">
                        <Label htmlFor="videoUrl">URL відео</Label>
                        <Input
                          id="videoUrl"
                          value={lessonForm.videoUrl || ''}
                          onChange={(e) => setLessonForm(prev => ({ ...prev, videoUrl: e.target.value }))}
                          placeholder="https://youtube.com/watch?v=..."
                        />
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Вкладення</Label>
                        <Button size="sm" variant="outline">
                          <Upload className="w-4 h-4 mr-2" />
                          Завантажити файл
                        </Button>
                      </div>
                      
                      {lessonForm.attachments.length > 0 ? (
                        <div className="space-y-2">
                          {lessonForm.attachments.map(attachment => (
                            <div key={attachment.id} className="flex items-center gap-3 p-3 border rounded-lg">
                              <FileText className="w-5 h-5 text-blue-500" />
                              <div className="flex-1">
                                <div className="font-medium">{attachment.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {(attachment.size / 1024 / 1024).toFixed(1)} MB
                                </div>
                              </div>
                              <Button size="sm" variant="ghost">
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 border-2 border-dashed rounded-lg">
                          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">Немає вкладень</p>
                          <p className="text-sm text-muted-foreground">Перетягніть файли сюди або використайте кнопку</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Objectives Tab */}
              <TabsContent value="objectives">
                <Card>
                  <CardHeader>
                    <CardTitle>Цілі навчання</CardTitle>
                    <CardDescription>Визначте що студенти вивчать з цього уроку</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Цілі навчання</Label>
                        <Button size="sm" variant="outline" onClick={addLearningObjective}>
                          <Target className="w-4 h-4 mr-2" />
                          Додати ціль
                        </Button>
                      </div>
                      
                      {lessonForm.learningObjectives.length > 0 ? (
                        <div className="space-y-3">
                          {lessonForm.learningObjectives.map((objective, index) => (
                            <div key={index} className="flex gap-2">
                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">
                                {index + 1}
                              </div>
                              <Input
                                value={objective}
                                onChange={(e) => updateLearningObjective(index, e.target.value)}
                                placeholder="Після цього уроку студент зможе..."
                                className="flex-1"
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeLearningObjective(index)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">Немає цілей навчання</p>
                          <p className="text-sm text-muted-foreground">Додайте цілі щоб показати студентам очікування</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Налаштування уроку</CardTitle>
                    <CardDescription>Налаштуйте доступ та поведінку уроку</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Опублікувати урок</Label>
                          <p className="text-sm text-muted-foreground">Зробити урок доступним для студентів</p>
                        </div>
                        <Switch
                          checked={lessonForm.settings.isPublished}
                          onCheckedChange={(checked) => 
                            setLessonForm(prev => ({
                              ...prev,
                              settings: { ...prev.settings, isPublished: checked }
                            }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Дозволити коментарі</Label>
                          <p className="text-sm text-muted-foreground">Студенти можуть залишати коментарі</p>
                        </div>
                        <Switch
                          checked={lessonForm.settings.allowComments}
                          onCheckedChange={(checked) => 
                            setLessonForm(prev => ({
                              ...prev,
                              settings: { ...prev.settings, allowComments: checked }
                            }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Відстежувати завершення</Label>
                          <p className="text-sm text-muted-foreground">Фіксувати коли урок завершено</p>
                        </div>
                        <Switch
                          checked={lessonForm.settings.trackCompletion}
                          onCheckedChange={(checked) => 
                            setLessonForm(prev => ({
                              ...prev,
                              settings: { ...prev.settings, trackCompletion: checked }
                            }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Дозволити перепроходження</Label>
                          <p className="text-sm text-muted-foreground">Студенти можуть пройти урок знову</p>
                        </div>
                        <Switch
                          checked={lessonForm.settings.retakeAllowed}
                          onCheckedChange={(checked) => 
                            setLessonForm(prev => ({
                              ...prev,
                              settings: { ...prev.settings, retakeAllowed: checked }
                            }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Дає право на сертифікат</Label>
                          <p className="text-sm text-muted-foreground">Урок зараховується для отримання сертифіката</p>
                        </div>
                        <Switch
                          checked={lessonForm.settings.certificateEligible}
                          onCheckedChange={(checked) => 
                            setLessonForm(prev => ({
                              ...prev,
                              settings: { ...prev.settings, certificateEligible: checked }
                            }))
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Інформація про урок</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                {getTypeIcon(lessonForm.type)}
                <span className="font-medium">{lessonForm.type}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Тривалість:</span>
                  <span>{lessonForm.duration} хв</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Слів:</span>
                  <span>{wordCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Читання:</span>
                  <span>~{estimatedReadingTime} хв</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Статус</div>
                <Badge variant={lessonForm.settings.isPublished ? 'default' : 'secondary'}>
                  {lessonForm.settings.isPublished ? 'Опубліковано' : 'Чернетка'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Validation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Перевірка</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                {lessonForm.title ? 
                  <CheckCircle className="w-4 h-4 text-green-500" /> : 
                  <AlertCircle className="w-4 h-4 text-red-500" />
                }
                <span className="text-sm">Назва уроку</span>
              </div>
              <div className="flex items-center gap-2">
                {lessonForm.content ? 
                  <CheckCircle className="w-4 h-4 text-green-500" /> : 
                  <AlertCircle className="w-4 h-4 text-red-500" />
                }
                <span className="text-sm">Контент</span>
              </div>
              <div className="flex items-center gap-2">
                {lessonForm.description ? 
                  <CheckCircle className="w-4 h-4 text-green-500" /> : 
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                }
                <span className="text-sm">Опис (рекомендовано)</span>
              </div>
              <div className="flex items-center gap-2">
                {lessonForm.learningObjectives.length > 0 ? 
                  <CheckCircle className="w-4 h-4 text-green-500" /> : 
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                }
                <span className="text-sm">Цілі навчання</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <Button variant="outline" className="w-full">
                <Settings className="w-4 h-4 mr-2" />
                Розширені налаштування
              </Button>
              <Button variant="outline" className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                Попередній перегляд
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}