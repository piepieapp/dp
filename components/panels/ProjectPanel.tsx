import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import { X, Edit2, Save, ExternalLink, Clock, User, CheckCircle2 } from 'lucide-react';
import { Project, Task } from '../../types';
import { AppContextType } from '../../App';
import { toast } from 'sonner@2.0.3';

interface ProjectPanelProps {
  context: AppContextType;
  onClose: () => void;
}

export function ProjectPanel({ context, onClose }: ProjectPanelProps) {
  const { rightPanel, setRightPanel, addNotification } = context;
  const project = rightPanel.data as Project;
  const isEditing = rightPanel.mode === 'edit';
  const isCreating = rightPanel.mode === 'create';
  
  const [formData, setFormData] = useState({
    name: project?.name || '',
    jiraKey: project?.jiraKey || '',
    status: project?.status || 'Active',
    startDate: project?.startDate || new Date().toISOString().split('T')[0],
    endDate: project?.endDate || '',
    hoursSpent: project?.hoursSpent || 0,
  });

  const handleSave = () => {
    toast.success(isCreating ? 'Проект створено успішно!' : 'Зміни збережено!');
    addNotification({
      title: isCreating ? 'Новий проект' : 'Оновлення проекту',
      message: `Проект "${formData.name}" ${isCreating ? 'створено' : 'оновлено'}`,
      type: 'success'
    });
    setRightPanel({ mode: 'view', data: { ...project, ...formData } });
  };

  const getProjectProgress = () => {
    if (!project?.tasks.length) return 0;
    const completedTasks = project.tasks.filter(task => task.status === 'Done').length;
    return Math.round((completedTasks / project.tasks.length) * 100);
  };

  const getTotalEstimatedHours = () => {
    return project?.tasks.reduce((sum, task) => sum + task.estimatedHours, 0) || 0;
  };

  const getTotalActualHours = () => {
    return project?.tasks.reduce((sum, task) => sum + task.actualHours, 0) || 0;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold">{isCreating ? 'Новий проект' : formData.name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Jira: {formData.jiraKey}</span>
              {!isCreating && (
                <Button size="sm" variant="ghost" className="h-auto p-0 text-blue-600 hover:text-blue-800">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Відкрити в Jira
                </Button>
              )}
            </div>
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
              <Button size="sm" variant="outline" onClick={() => setRightPanel({ mode: 'edit' })}>
                <Edit2 className="w-4 h-4 mr-2" />
                Редагувати
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Project Stats */}
        {project && !isEditing && !isCreating && (
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold">{getProjectProgress()}%</div>
              <div className="text-xs text-muted-foreground">Завершено</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{project.tasks.length}</div>
              <div className="text-xs text-muted-foreground">Завдань</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{getTotalActualHours()}h</div>
              <div className="text-xs text-muted-foreground">Витрачено</div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {isEditing || isCreating ? (
            <EditProjectForm formData={formData} setFormData={setFormData} />
          ) : (
            <ViewProjectMode project={project} context={context} />
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function EditProjectForm({ formData, setFormData }: any) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Інформація про проект</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Назва проекту</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Назва проекту"
            />
          </div>
          <div>
            <Label htmlFor="jiraKey">Jira ключ</Label>
            <Input
              id="jiraKey"
              value={formData.jiraKey}
              onChange={(e) => setFormData(prev => ({ ...prev, jiraKey: e.target.value }))}
              placeholder="PROJ-123"
            />
          </div>
          <div>
            <Label htmlFor="status">Статус</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Активний</SelectItem>
                <SelectItem value="Completed">Завершено</SelectItem>
                <SelectItem value="On Hold">Призупинено</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Дата початку</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="endDate">Дата завершення</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ViewProjectMode({ project, context }: { project: Project; context: AppContextType }) {
  if (!project) return <div>Проект не знайдено</div>;

  const completedTasks = project.tasks.filter(task => task.status === 'Done').length;
  const inProgressTasks = project.tasks.filter(task => task.status === 'In Progress').length;
  const todoTasks = project.tasks.filter(task => task.status === 'To Do').length;

  const totalEstimated = project.tasks.reduce((sum, task) => sum + task.estimatedHours, 0);
  const totalActual = project.tasks.reduce((sum, task) => sum + task.actualHours, 0);
  const efficiency = totalEstimated > 0 ? Math.round((totalEstimated / totalActual) * 100) : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Огляд проекту</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Статус:</span>
              <Badge variant={project.status === 'Active' ? 'default' : project.status === 'Completed' ? 'secondary' : 'outline'} className="ml-2">
                {project.status}
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Jira ключ:</span>
              <span className="ml-2 font-mono">{project.jiraKey}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Початок:</span>
              <span className="ml-2">{new Date(project.startDate).toLocaleDateString('uk-UA')}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Завершення:</span>
              <span className="ml-2">{project.endDate ? new Date(project.endDate).toLocaleDateString('uk-UA') : 'Не встановлено'}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Прогрес проекту</span>
                <span>{Math.round((completedTasks / project.tasks.length) * 100)}%</span>
              </div>
              <Progress value={(completedTasks / project.tasks.length) * 100} />
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-green-600">{completedTasks}</div>
                <div className="text-xs text-muted-foreground">Завершено</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-blue-600">{inProgressTasks}</div>
                <div className="text-xs text-muted-foreground">В роботі</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-600">{todoTasks}</div>
                <div className="text-xs text-muted-foreground">Заплановано</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Час та ефективність</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Заплановано:</span>
              <span className="ml-2 font-semibold">{totalEstimated}h</span>
            </div>
            <div>
              <span className="text-muted-foreground">Витрачено:</span>
              <span className="ml-2 font-semibold">{totalActual}h</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Ефективність</span>
              <span className={efficiency > 100 ? 'text-green-600' : efficiency < 80 ? 'text-red-600' : 'text-yellow-600'}>
                {efficiency}%
              </span>
            </div>
            <Progress value={Math.min(efficiency, 100)} className={efficiency > 100 ? 'text-green-600' : ''} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Завдання ({project.tasks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {project.tasks.map(task => (
              <TaskItem key={task.id} task={task} />
            ))}
            {project.tasks.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Немає завдань для цього проекту
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TaskItem({ task }: { task: Task }) {
  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'Done': return 'text-green-600';
      case 'In Progress': return 'text-blue-600';
      case 'To Do': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'Done': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'In Progress': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'To Do': return <Clock className="w-4 h-4 text-gray-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'High': return 'text-red-600';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="flex items-center justify-between p-3 border rounded hover:bg-secondary/50 transition-colors">
      <div className="flex items-center gap-3 flex-1">
        {getStatusIcon(task.status)}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-sm">{task.title}</h4>
            <Badge variant="outline" className="text-xs">
              {task.jiraKey}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
            <span className={getStatusColor(task.status)}>{task.status}</span>
            <span className={getPriorityColor(task.priority)}>
              {task.priority} Priority
            </span>
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {task.assignee}
            </span>
          </div>
        </div>
      </div>
      <div className="text-right text-xs text-muted-foreground">
        <div>{task.actualHours}h / {task.estimatedHours}h</div>
        <div className={task.actualHours > task.estimatedHours ? 'text-red-600' : 'text-green-600'}>
          {task.estimatedHours > 0 ? Math.round((task.actualHours / task.estimatedHours) * 100) : 0}%
        </div>
      </div>
    </div>
  );
}