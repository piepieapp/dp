import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { X, Edit2, Save, Calendar, Clock, Target, TrendingUp, BookOpen, FolderOpen } from 'lucide-react';
import { Designer } from '../../types';
import { AppContextType } from '../../App';
import { toast } from 'sonner@2.0.3';

interface DesignerPanelProps {
  context: AppContextType;
  onClose: () => void;
}

export function DesignerPanel({ context, onClose }: DesignerPanelProps) {
  const { rightPanel, setRightPanel, addNotification } = context;
  const designer = rightPanel.data as Designer;
  const isEditing = rightPanel.mode === 'edit';
  const isCreating = rightPanel.mode === 'create';
  
  const [formData, setFormData] = useState({
    name: designer?.name || '',
    email: designer?.email || '',
    position: designer?.position || '',
    birthDate: designer?.birthDate || '',
    department: designer?.department || '',
    level: designer?.level || 'Junior',
    rating: designer?.rating || 0,
    workingHours: designer?.workingHours || 0,
    efficiency: designer?.efficiency || 0
  });

  const handleSave = () => {
    // Simulate saving
    toast.success(isCreating ? 'Дизайнера додано успішно!' : 'Зміни збережено!');
    addNotification({
      title: isCreating ? 'Новий дизайнер' : 'Оновлення профілю',
      message: `${formData.name} - профіль ${isCreating ? 'створено' : 'оновлено'}`,
      type: 'success'
    });
    setRightPanel({ mode: 'view', data: { ...designer, ...formData } });
  };

  const handleEdit = () => {
    setRightPanel({ mode: 'edit' });
  };

  const handleCancel = () => {
    setFormData({
      name: designer?.name || '',
      email: designer?.email || '',
      position: designer?.position || '',
      birthDate: designer?.birthDate || '',
      department: designer?.department || '',
      level: designer?.level || 'Junior',
      rating: designer?.rating || 0,
      workingHours: designer?.workingHours || 0,
      efficiency: designer?.efficiency || 0
    });
    setRightPanel({ mode: 'view' });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={designer?.avatar} alt={formData.name} />
            <AvatarFallback>{formData.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{isCreating ? 'Новий дизайнер' : formData.name}</h3>
            <p className="text-sm text-muted-foreground">{formData.position}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing || isCreating ? (
            <>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                Скасувати
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Зберегти
              </Button>
            </>
          ) : (
            <Button size="sm" variant="outline" onClick={handleEdit}>
              <Edit2 className="w-4 h-4 mr-2" />
              Редагувати
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {isEditing || isCreating ? (
            <EditForm formData={formData} setFormData={setFormData} isCreating={isCreating} />
          ) : (
            <ViewMode designer={designer} context={context} />
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function EditForm({ formData, setFormData, isCreating }: any) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Основна інформація</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="name">Повне ім'я</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ім'я та прізвище"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@company.com"
              />
            </div>
            <div>
              <Label htmlFor="position">Посада</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                placeholder="UI/UX Designer"
              />
            </div>
            <div>
              <Label htmlFor="department">Відділ</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                placeholder="Product Design"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Профільна інформація</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="birthDate">Дата народження</Label>
            <Input
              id="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="level">Рівень</Label>
            <Select value={formData.level} onValueChange={(value) => setFormData(prev => ({ ...prev, level: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Junior">Junior</SelectItem>
                <SelectItem value="Middle">Middle</SelectItem>
                <SelectItem value="Senior">Senior</SelectItem>
                <SelectItem value="Lead">Lead</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Показники ефективності</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="rating">Рейтинг (1-5)</Label>
            <Input
              id="rating"
              type="number"
              min="1"
              max="5"
              step="0.1"
              value={formData.rating}
              onChange={(e) => setFormData(prev => ({ ...prev, rating: parseFloat(e.target.value) }))}
            />
          </div>
          <div>
            <Label htmlFor="efficiency">Ефективність (%)</Label>
            <Input
              id="efficiency"
              type="number"
              min="0"
              max="100"
              value={formData.efficiency}
              onChange={(e) => setFormData(prev => ({ ...prev, efficiency: parseInt(e.target.value) }))}
            />
          </div>
          <div>
            <Label htmlFor="workingHours">Відпрацьовано годин</Label>
            <Input
              id="workingHours"
              type="number"
              min="0"
              value={formData.workingHours}
              onChange={(e) => setFormData(prev => ({ ...prev, workingHours: parseInt(e.target.value) }))}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ViewMode({ designer, context }: { designer: Designer; context: AppContextType }) {
  if (!designer) return <div>Дизайнера не знайдено</div>;

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Огляд</TabsTrigger>
        <TabsTrigger value="skills">Навички</TabsTrigger>
        <TabsTrigger value="projects">Проекти</TabsTrigger>
        <TabsTrigger value="learning">Навчання</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4 mt-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Особиста інформація</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Email:</span>
              <span className="text-sm">{designer.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Дата народження:</span>
              <span className="text-sm">{new Date(designer.birthDate).toLocaleDateString('uk-UA')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Приєднався:</span>
              <span className="text-sm">{new Date(designer.joinDate).toLocaleDateString('uk-UA')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Відділ:</span>
              <span className="text-sm">{designer.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Рівень:</span>
              <Badge variant={designer.level === 'Senior' ? 'default' : designer.level === 'Middle' ? 'secondary' : 'outline'}>
                {designer.level}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">KPI Показники</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(designer.kpis).filter(([key]) => key !== 'overallScore').map(([key, value]) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="capitalize">
                    {key === 'productivity' ? 'Продуктивність' : 
                     key === 'quality' ? 'Якість' :
                     key === 'delivery' ? 'Своєчасність' :
                     key === 'collaboration' ? 'Співпраця' :
                     key === 'growth' ? 'Розвиток' : key}
                  </span>
                  <span>{value}%</span>
                </div>
                <Progress value={value} className="h-2" />
              </div>
            ))}
            <Separator />
            <div className="flex justify-between items-center">
              <span className="font-medium">Загальний рейтинг:</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">{designer.rating}/5.0</span>
                <div className="flex items-center">
                  <Target className="w-4 h-4 text-yellow-500" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Статистика</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-sm">Відпрацьовано: {designer.workingHours} годин</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm">Ефективність: {designer.efficiency}%</span>
            </div>
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-purple-500" />
              <span className="text-sm">Активних проектів: {designer.projects.filter(p => p.status === 'Active').length}</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-orange-500" />
              <span className="text-sm">Модулів навчання: {designer.learningModules.length}</span>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="skills" className="space-y-4 mt-4">
        {designer.skills.map(skill => (
          <Card key={skill.skillId}>
            <CardContent className="pt-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h4 className="font-medium">{skill.skillName}</h4>
                  <p className="text-sm text-muted-foreground">{skill.category}</p>
                </div>
                <Badge variant="outline">{skill.currentLevel}/5</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Поточний рівень</span>
                  <span>Цільовий рівень</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={(skill.currentLevel / 5) * 100} className="flex-1" />
                  <span className="text-sm text-muted-foreground">→ {skill.targetLevel}/5</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Останнє оновлення: {new Date(skill.lastUpdated).toLocaleDateString('uk-UA')}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="projects" className="space-y-4 mt-4">
        {designer.projects.map(project => (
          <Card key={project.id} className="cursor-pointer hover:shadow-md transition-shadow" 
                onClick={() => context.setRightPanel({ type: 'project', data: project, mode: 'view' })}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{project.name}</CardTitle>
                  <CardDescription>Jira: {project.jiraKey}</CardDescription>
                </div>
                <Badge variant={project.status === 'Active' ? 'default' : 'secondary'}>
                  {project.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Дата початку:</span>
                  <span>{new Date(project.startDate).toLocaleDateString('uk-UA')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Відпрацьовано годин:</span>
                  <span>{project.hoursSpent}</span>
                </div>
                <div className="flex justify-between">
                  <span>Завдань:</span>
                  <span>{project.tasks.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="learning" className="space-y-4 mt-4">
        {designer.learningModules.map(module => (
          <Card key={module.id} className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => context.setRightPanel({ type: 'module', data: module, mode: 'view' })}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{module.title}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </div>
                <Badge variant={module.status === 'Completed' ? 'default' : module.status === 'In Progress' ? 'secondary' : 'outline'}>
                  {module.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Прогрес</span>
                    <span>{module.progress}%</span>
                  </div>
                  <Progress value={module.progress} />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Категорія:</span>
                    <span className="ml-2">{module.category}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Складність:</span>
                    <span className="ml-2">{module.difficulty}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </TabsContent>
    </Tabs>
  );
}