import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { Checkbox } from '../ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { X, Edit2, Save, Plus, Users, Clock, BookOpen, CheckCircle, Play } from 'lucide-react';
import { LearningModule, Designer } from '../../types';
import { AppContextType } from '../../App';
import { mockDesigners } from '../../services/mockData';
import { toast } from 'sonner@2.0.3';

interface ModulePanelProps {
  context: AppContextType;
  onClose: () => void;
}

export function ModulePanel({ context, onClose }: ModulePanelProps) {
  const { rightPanel, setRightPanel, addNotification } = context;
  const module = rightPanel.data as LearningModule;
  const isEditing = rightPanel.mode === 'edit';
  const isCreating = rightPanel.mode === 'create';
  
  const [formData, setFormData] = useState({
    title: module?.title || '',
    description: module?.description || '',
    category: module?.category || 'Design',
    difficulty: module?.difficulty || 'Beginner',
    estimatedTime: module?.estimatedTime || 0,
  });

  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedDesigners, setSelectedDesigners] = useState<string[]>([]);

  const handleSave = () => {
    toast.success(isCreating ? 'Модуль створено успішно!' : 'Зміни збережено!');
    addNotification({
      title: isCreating ? 'Новий модуль' : 'Оновлення модуля',
      message: `Модуль "${formData.title}" ${isCreating ? 'створено' : 'оновлено'}`,
      type: 'success'
    });
    setRightPanel({ mode: 'view', data: { ...module, ...formData } });
  };

  const handleAssign = () => {
    toast.success(`Модуль призначено ${selectedDesigners.length} дизайнерам`);
    addNotification({
      title: 'Модуль призначено',
      message: `"${module.title}" призначено ${selectedDesigners.length} дизайнерам`,
      type: 'info'
    });
    setShowAssignDialog(false);
    setSelectedDesigners([]);
  };

  const getModuleStats = () => {
    const allAssignments = mockDesigners.flatMap(designer => 
      designer.learningModules.filter(m => m.id === module?.id)
    );
    
    return {
      total: allAssignments.length,
      completed: allAssignments.filter(m => m.status === 'Completed').length,
      inProgress: allAssignments.filter(m => m.status === 'In Progress').length,
      notStarted: allAssignments.filter(m => m.status === 'Not Started').length,
      avgProgress: allAssignments.length > 0 ? 
        Math.round(allAssignments.reduce((sum, m) => sum + m.progress, 0) / allAssignments.length) : 0
    };
  };

  const stats = module ? getModuleStats() : null;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold">{isCreating ? 'Новий модуль' : formData.title}</h3>
            <p className="text-sm text-muted-foreground">{formData.category} • {formData.difficulty}</p>
          </div>
          <div className="flex items-center gap-2">
            {isEditing || isCreating ? (
              <>
                <Button size="sm" variant="outline" onClick={() => setRightPanel({ mode: 'view' })}>
                  Скасувати
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Зберегти
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" variant="outline" onClick={() => setShowAssignDialog(true)}>
                  <Users className="w-4 h-4 mr-2" />
                  Призначити
                </Button>
                <Button size="sm" variant="outline" onClick={() => setRightPanel({ mode: 'edit' })}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Редагувати
                </Button>
              </>
            )}
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        {stats && !isEditing && !isCreating && (
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center">
              <div className="text-sm font-medium">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Призначено</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-green-600">{stats.completed}</div>
              <div className="text-xs text-muted-foreground">Завершено</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-blue-600">{stats.inProgress}</div>
              <div className="text-xs text-muted-foreground">В процесі</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium">{stats.avgProgress}%</div>
              <div className="text-xs text-muted-foreground">Середній прогрес</div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {isEditing || isCreating ? (
            <EditModuleForm formData={formData} setFormData={setFormData} />
          ) : (
            <ViewModuleMode module={module} context={context} />
          )}
        </div>
      </ScrollArea>

      {/* Assign Dialog */}
      {showAssignDialog && (
        <div className="absolute inset-0 bg-background border-l">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Призначити модуль</h3>
              <Button size="sm" variant="ghost" onClick={() => setShowAssignDialog(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">Оберіть дизайнерів для призначення модуля</p>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {mockDesigners.map(designer => (
                <div key={designer.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={designer.id}
                    checked={selectedDesigners.includes(designer.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedDesigners(prev => [...prev, designer.id]);
                      } else {
                        setSelectedDesigners(prev => prev.filter(id => id !== designer.id));
                      }
                    }}
                  />
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={designer.avatar} alt={designer.name} />
                    <AvatarFallback>{designer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <label htmlFor={designer.id} className="text-sm font-medium cursor-pointer">
                      {designer.name}
                    </label>
                    <p className="text-xs text-muted-foreground">{designer.position}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowAssignDialog(false)} className="flex-1">
                Скасувати
              </Button>
              <Button onClick={handleAssign} disabled={selectedDesigners.length === 0} className="flex-1">
                Призначити ({selectedDesigners.length})
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EditModuleForm({ formData, setFormData }: any) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Основна інформація</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Назва модуля</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Назва навчального модуля"
            />
          </div>
          <div>
            <Label htmlFor="description">Опис</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Детальний опис модуля та його цілей"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Категорія</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Research">Research</SelectItem>
                  <SelectItem value="Tools">Tools</SelectItem>
                  <SelectItem value="Leadership">Leadership</SelectItem>
                  <SelectItem value="Development">Development</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="difficulty">Складність</Label>
              <Select value={formData.difficulty} onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="estimatedTime">Орієнтовний час (години)</Label>
            <Input
              id="estimatedTime"
              type="number"
              min="0"
              value={formData.estimatedTime}
              onChange={(e) => setFormData(prev => ({ ...prev, estimatedTime: parseInt(e.target.value) }))}
              placeholder="Скільки годин потрібно для вивчення"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Навчальні матеріали</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button variant="outline" size="sm" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Додати урок
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Додати тест
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Додати ресурси
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ViewModuleMode({ module, context }: { module: LearningModule; context: AppContextType }) {
  if (!module) return <div>Модуль не знайдено</div>;

  const assignedDesigners = mockDesigners.filter(designer => 
    designer.learningModules.some(m => m.id === module.id)
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Про модуль</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm">{module.description}</p>
          <Separator />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Категорія:</span>
              <Badge variant="outline" className="ml-2">{module.category}</Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Складність:</span>
              <Badge variant={
                module.difficulty === 'Beginner' ? 'secondary' :
                module.difficulty === 'Intermediate' ? 'default' : 'destructive'
              } className="ml-2">
                {module.difficulty}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Час:</span>
              <span>{module.estimatedTime} годин</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Тестів:</span>
              <span>{module.tests?.length || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Призначені дизайнери ({assignedDesigners.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {assignedDesigners.map(designer => {
              const designerModule = designer.learningModules.find(m => m.id === module.id);
              return (
                <div key={designer.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded cursor-pointer hover:bg-secondary/70 transition-colors"
                     onClick={() => context.setRightPanel({ type: 'designer', data: designer, mode: 'view' })}>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={designer.avatar} alt={designer.name} />
                      <AvatarFallback>{designer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">{designer.name}</div>
                      <div className="text-xs text-muted-foreground">{designer.position}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-medium">{designerModule?.progress || 0}%</div>
                      <div className="w-16">
                        <Progress value={designerModule?.progress || 0} className="h-1" />
                      </div>
                    </div>
                    <Badge variant={
                      designerModule?.status === 'Completed' ? 'default' :
                      designerModule?.status === 'In Progress' ? 'secondary' : 'outline'
                    }>
                      {designerModule?.status === 'Completed' ? <CheckCircle className="w-3 h-3" /> :
                       designerModule?.status === 'In Progress' ? <Play className="w-3 h-3" /> :
                       <Clock className="w-3 h-3" />}
                    </Badge>
                  </div>
                </div>
              );
            })}
            {assignedDesigners.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Модуль ще не призначено жодному дизайнеру
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {module.tests && module.tests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Тести та оцінювання</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {module.tests.map(test => (
                <div key={test.id} className="p-3 border rounded">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm">{test.title}</h4>
                    <Badge variant="outline">
                      Прохідний бал: {test.passingScore}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Питань: {test.questions.length} • 
                    Спроб: {test.attempts?.length || 0}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}