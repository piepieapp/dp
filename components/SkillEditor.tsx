import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { 
  Save, X, Plus, Trash2, Users, Target, TrendingUp,
  AlertCircle, CheckCircle, Award, BookOpen 
} from 'lucide-react';
import { AppContextType } from '../App';
import { mockSkills, mockDesigners } from '../services/mockData';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface SkillEditorProps {
  skillId?: string;
  mode: 'create' | 'edit';
  context: AppContextType;
  navigateTo: (nav: any) => void;
}

interface SkillForm {
  name: string;
  category: string;
  description: string;
  maxLevel: number;
  learningResources: LearningResource[];
  assessmentCriteria: AssessmentCriteria[];
}

interface LearningResource {
  id: string;
  title: string;
  type: 'article' | 'video' | 'course' | 'book';
  url: string;
  level: number; // 1-5
  description: string;
}

interface AssessmentCriteria {
  id: string;
  level: number; // 1-5
  title: string;
  description: string;
  requirements: string[];
}

export function SkillEditor({ skillId, mode, context, navigateTo }: SkillEditorProps) {
  const [skillForm, setSkillForm] = useState<SkillForm>({
    name: '',
    category: '',
    description: '',
    maxLevel: 5,
    learningResources: [],
    assessmentCriteria: []
  });

  const [showAddResource, setShowAddResource] = useState(false);
  const [showAddCriteria, setShowAddCriteria] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock categories
  const categories = ['Design', 'Research', 'Tools', 'Development', 'Soft Skills', 'Leadership'];

  useEffect(() => {
    if (mode === 'edit' && skillId) {
      // Load existing skill data
      const existingSkill = mockSkills.find(s => s.id === skillId);
      if (existingSkill) {
        setSkillForm({
          name: existingSkill.name,
          category: existingSkill.category,
          description: existingSkill.description,
          maxLevel: existingSkill.maxLevel,
          learningResources: [],
          assessmentCriteria: []
        });
      }
    }
  }, [mode, skillId]);

  const handleSave = async () => {
    setIsLoading(true);
    
    // Validate form
    if (!skillForm.name || !skillForm.category || !skillForm.description) {
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
        title: mode === 'create' ? 'Навичку створено' : 'Навичку оновлено',
        message: `Навичку "${skillForm.name}" успішно ${mode === 'create' ? 'створено' : 'оновлено'}`,
        type: 'success'
      });

      // Navigate back to skills matrix
      navigateTo({ section: 'skills' });
    } catch (error) {
      context.addNotification({
        title: 'Помилка',
        message: 'Не вдалось зберегти навичку',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addLearningResource = (resource: Omit<LearningResource, 'id'>) => {
    const newResource: LearningResource = {
      ...resource,
      id: Date.now().toString()
    };
    setSkillForm(prev => ({
      ...prev,
      learningResources: [...prev.learningResources, newResource]
    }));
    setShowAddResource(false);
  };

  const removeLearningResource = (resourceId: string) => {
    setSkillForm(prev => ({
      ...prev,
      learningResources: prev.learningResources.filter(r => r.id !== resourceId)
    }));
  };

  const addAssessmentCriteria = (criteria: Omit<AssessmentCriteria, 'id'>) => {
    const newCriteria: AssessmentCriteria = {
      ...criteria,
      id: Date.now().toString()
    };
    setSkillForm(prev => ({
      ...prev,
      assessmentCriteria: [...prev.assessmentCriteria, newCriteria]
    }));
    setShowAddCriteria(false);
  };

  const removeAssessmentCriteria = (criteriaId: string) => {
    setSkillForm(prev => ({
      ...prev,
      assessmentCriteria: prev.assessmentCriteria.filter(c => c.id !== criteriaId)
    }));
  };

  // Get skill statistics if editing
  const skillStats = skillId ? (() => {
    const allRatings = mockDesigners.flatMap(designer => 
      designer.skills.filter(s => s.skillId === skillId)
    );
    
    return {
      totalUsers: allRatings.length,
      avgLevel: allRatings.length > 0 ? 
        Math.round(allRatings.reduce((sum, rating) => sum + rating.level, 0) / allRatings.length) : 0,
      distribution: [1, 2, 3, 4, 5].map(level => {
        const count = allRatings.filter(r => Math.round(r.level / 20) === level - 1).length;
        return { level, count };
      })
    };
  })() : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {mode === 'create' ? 'Створити навичку' : 'Редагувати навичку'}
          </h1>
          <p className="text-muted-foreground">
            {mode === 'create' 
              ? 'Додайте нову навичку до матриці компетенцій'
              : 'Оновіть інформацію про навичку'
            }
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigateTo({ section: 'skills' })}
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
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList>
              <TabsTrigger value="basic">Основна інформація</TabsTrigger>
              <TabsTrigger value="resources">Ресурси навчання ({skillForm.learningResources.length})</TabsTrigger>
              <TabsTrigger value="assessment">Критерії оцінки ({skillForm.assessmentCriteria.length})</TabsTrigger>
            </TabsList>

            {/* Basic Information */}
            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle>Загальна інформація</CardTitle>
                  <CardDescription>Основні відомості про навичку</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Назва навички *</Label>
                      <Input
                        id="name"
                        value={skillForm.name}
                        onChange={(e) => setSkillForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Введіть назву навички"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Категорія *</Label>
                      <Select 
                        value={skillForm.category} 
                        onValueChange={(value) => setSkillForm(prev => ({ ...prev, category: value }))}
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Опис навички *</Label>
                    <Textarea
                      id="description"
                      value={skillForm.description}
                      onChange={(e) => setSkillForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Детальний опис навички та її застосування"
                      className="min-h-[120px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxLevel">Максимальний рівень: {skillForm.maxLevel}</Label>
                    <Slider
                      value={[skillForm.maxLevel]}
                      onValueChange={(value) => setSkillForm(prev => ({ ...prev, maxLevel: value[0] }))}
                      max={10}
                      min={3}
                      step={1}
                      className="w-full"
                    />
                    <div className="text-xs text-muted-foreground">
                      Оберіть максимальний рівень для цієї навички (3-10)
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Learning Resources */}
            <TabsContent value="resources">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Ресурси для навчання</CardTitle>
                      <CardDescription>Матеріали для розвитку навички</CardDescription>
                    </div>
                    <Button onClick={() => setShowAddResource(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Додати ресурс
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {skillForm.learningResources.length > 0 ? (
                    <div className="space-y-3">
                      {skillForm.learningResources.map(resource => (
                        <div key={resource.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <BookOpen className="w-5 h-5 text-blue-500" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{resource.title}</span>
                              <Badge variant="outline">{resource.type}</Badge>
                              <Badge variant="secondary">Рівень {resource.level}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{resource.description}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeLearningResource(resource.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium mb-2">Немає ресурсів</h3>
                      <p className="text-muted-foreground mb-4">Додайте навчальні матеріали</p>
                      <Button onClick={() => setShowAddResource(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Додати ресурс
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Assessment Criteria */}
            <TabsContent value="assessment">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Критерії оцінки</CardTitle>
                      <CardDescription>Визначте що означає кожний рівень</CardDescription>
                    </div>
                    <Button onClick={() => setShowAddCriteria(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Додати критерій
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {skillForm.assessmentCriteria.length > 0 ? (
                    <div className="space-y-3">
                      {skillForm.assessmentCriteria
                        .sort((a, b) => a.level - b.level)
                        .map(criteria => (
                          <div key={criteria.id} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="default">Рівень {criteria.level}</Badge>
                                <span className="font-medium">{criteria.title}</span>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeAssessmentCriteria(criteria.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{criteria.description}</p>
                            {criteria.requirements.length > 0 && (
                              <ul className="text-sm space-y-1">
                                {criteria.requirements.map((req, index) => (
                                  <li key={index} className="flex items-center gap-2">
                                    <CheckCircle className="w-3 h-3 text-green-500" />
                                    {req}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium mb-2">Немає критеріїв</h3>
                      <p className="text-muted-foreground mb-4">Визначте критерії оцінки</p>
                      <Button onClick={() => setShowAddCriteria(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Додати критерій
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Попередній перегляд</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="font-medium">{skillForm.name || 'Назва навички'}</div>
                <div className="text-sm text-muted-foreground">{skillForm.category || 'Категорія'}</div>
              </div>
              
              {skillForm.description && (
                <p className="text-sm">{skillForm.description}</p>
              )}

              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-500" />
                <span className="text-sm">Максимальний рівень: {skillForm.maxLevel}</span>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Ресурси: {skillForm.learningResources.length}</div>
                <div className="text-sm font-medium">Критерії: {skillForm.assessmentCriteria.length}</div>
              </div>
            </CardContent>
          </Card>

          {/* Current Usage (only in edit mode) */}
          {mode === 'edit' && skillStats && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Поточне використання</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">{skillStats.totalUsers}</div>
                    <div className="text-xs text-muted-foreground">Дизайнерів</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{skillStats.avgLevel}%</div>
                    <div className="text-xs text-muted-foreground">Середній рівень</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Розподіл по рівнях:</div>
                  {skillStats.distribution.map(item => (
                    <div key={item.level} className="flex items-center justify-between text-xs">
                      <span>Рівень {item.level}</span>
                      <span>{item.count} людей</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Validation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Перевірка</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                {skillForm.name ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                <span className="text-sm">Назва навички</span>
              </div>
              <div className="flex items-center gap-2">
                {skillForm.category ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                <span className="text-sm">Категорія</span>
              </div>
              <div className="flex items-center gap-2">
                {skillForm.description ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                <span className="text-sm">Опис</span>
              </div>
              <div className="flex items-center gap-2">
                {skillForm.learningResources.length > 0 ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-yellow-500" />}
                <span className="text-sm">Ресурси навчання</span>
              </div>
              <div className="flex items-center gap-2">
                {skillForm.assessmentCriteria.length > 0 ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-yellow-500" />}
                <span className="text-sm">Критерії оцінки</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Resource Dialog */}
      <AddResourceDialog 
        open={showAddResource} 
        onOpenChange={setShowAddResource}
        onAdd={addLearningResource}
        maxLevel={skillForm.maxLevel}
      />

      {/* Add Criteria Dialog */}
      <AddCriteriaDialog 
        open={showAddCriteria} 
        onOpenChange={setShowAddCriteria}
        onAdd={addAssessmentCriteria}
        maxLevel={skillForm.maxLevel}
        existingLevels={skillForm.assessmentCriteria.map(c => c.level)}
      />
    </div>
  );
}

// Helper Components
function AddResourceDialog({ open, onOpenChange, onAdd, maxLevel }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (resource: Omit<LearningResource, 'id'>) => void;
  maxLevel: number;
}) {
  const [form, setForm] = useState({
    title: '',
    type: 'article' as 'article' | 'video' | 'course' | 'book',
    url: '',
    level: 1,
    description: ''
  });

  const handleSubmit = () => {
    if (form.title && form.url) {
      onAdd(form);
      setForm({ title: '', type: 'article', url: '', level: 1, description: '' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Додати ресурс навчання</DialogTitle>
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Тип ресурсу</Label>
              <Select value={form.type} onValueChange={(value: any) => setForm(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="article">Стаття</SelectItem>
                  <SelectItem value="video">Відео</SelectItem>
                  <SelectItem value="course">Курс</SelectItem>
                  <SelectItem value="book">Книга</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Рівень (1-{maxLevel})</Label>
              <Select value={form.level.toString()} onValueChange={(value) => setForm(prev => ({ ...prev, level: parseInt(value) }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: maxLevel }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      Рівень {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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

function AddCriteriaDialog({ open, onOpenChange, onAdd, maxLevel, existingLevels }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (criteria: Omit<AssessmentCriteria, 'id'>) => void;
  maxLevel: number;
  existingLevels: number[];
}) {
  const [form, setForm] = useState({
    level: 1,
    title: '',
    description: '',
    requirements: ['']
  });

  const availableLevels = Array.from({ length: maxLevel }, (_, i) => i + 1)
    .filter(level => !existingLevels.includes(level));

  const handleSubmit = () => {
    if (form.title && form.description) {
      onAdd({
        ...form,
        requirements: form.requirements.filter(req => req.trim() !== '')
      });
      setForm({ level: availableLevels[0] || 1, title: '', description: '', requirements: [''] });
    }
  };

  const addRequirement = () => {
    setForm(prev => ({ ...prev, requirements: [...prev.requirements, ''] }));
  };

  const updateRequirement = (index: number, value: string) => {
    setForm(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => i === index ? value : req)
    }));
  };

  const removeRequirement = (index: number) => {
    setForm(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Додати критерій оцінки</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Рівень</Label>
              <Select 
                value={form.level.toString()} 
                onValueChange={(value) => setForm(prev => ({ ...prev, level: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableLevels.map(level => (
                    <SelectItem key={level} value={level.toString()}>
                      Рівень {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Назва рівня</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="напр. Початківець, Експерт"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Опис рівня</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Детальний опис що означає цей рівень"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Вимоги для рівня</Label>
              <Button size="sm" variant="outline" onClick={addRequirement}>
                <Plus className="w-4 h-4 mr-1" />
                Додати
              </Button>
            </div>
            <div className="space-y-2">
              {form.requirements.map((req, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={req}
                    onChange={(e) => updateRequirement(index, e.target.value)}
                    placeholder="Введіть вимогу..."
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeRequirement(index)}
                    disabled={form.requirements.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSubmit}>Додати критерій</Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Скасувати</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}