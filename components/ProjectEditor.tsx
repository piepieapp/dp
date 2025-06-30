import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  Save, X, Plus, Trash2, Users, Calendar, Clock,
  AlertCircle, CheckCircle, Target, FileText 
} from 'lucide-react';
import { AppContextType } from '../App';
import { mockDesigners } from '../services/mockData';

interface ProjectEditorProps {
  projectId?: string;
  mode: 'create' | 'edit';
  context: AppContextType;
  navigateTo: (nav: any) => void;
}

export function ProjectEditor({ projectId, mode, context, navigateTo }: ProjectEditorProps) {
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    jiraKey: '',
    status: 'Active' as 'Active' | 'Completed' | 'On Hold',
    startDate: '',
    endDate: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    teamMembers: [] as Array<{designerId: string, role: string, allocation: number}>,
    tasks: [] as Array<{id: string, title: string, status: string, assigneeId: string}>,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    
    if (!projectForm.name || !projectForm.description || !projectForm.jiraKey) {
      context.addNotification({
        title: 'Помилка валідації',
        message: 'Заповніть всі обов\'язкові поля',
        type: 'error'
      });
      setIsLoading(false);
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      context.addNotification({
        title: mode === 'create' ? 'Проект створено' : 'Проект оновлено',
        message: `Проект "${projectForm.name}" успішно ${mode === 'create' ? 'створено' : 'оновлено'}`,
        type: 'success'
      });

      navigateTo({ section: 'projects' });
    } catch (error) {
      context.addNotification({
        title: 'Помилка',
        message: 'Не вдалось зберегти проект',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {mode === 'create' ? 'Створити проект' : 'Редагувати проект'}
          </h1>
          <p className="text-muted-foreground">
            {mode === 'create' 
              ? 'Створіть новий проект для команди'
              : 'Оновіть інформацію про проект'
            }
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigateTo({ section: 'projects' })}
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

      <Card>
        <CardHeader>
          <CardTitle>Загальна інформація</CardTitle>
          <CardDescription>Основні відомості про проект</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Назва проекту *</Label>
              <Input
                id="name"
                value={projectForm.name}
                onChange={(e) => setProjectForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Введіть назву проекту"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="jiraKey">Jira Key *</Label>
              <Input
                id="jiraKey"
                value={projectForm.jiraKey}
                onChange={(e) => setProjectForm(prev => ({ ...prev, jiraKey: e.target.value }))}
                placeholder="PROJ-123"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Статус *</Label>
              <Select 
                value={projectForm.status} 
                onValueChange={(value: any) => setProjectForm(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Активний</SelectItem>
                  <SelectItem value="On Hold">Призупинено</SelectItem>
                  <SelectItem value="Completed">Завершено</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Пріоритет</Label>
              <Select 
                value={projectForm.priority} 
                onValueChange={(value: any) => setProjectForm(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Низький</SelectItem>
                  <SelectItem value="Medium">Середній</SelectItem>
                  <SelectItem value="High">Високий</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Дата початку</Label>
              <Input
                id="startDate"
                type="date"
                value={projectForm.startDate}
                onChange={(e) => setProjectForm(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Дата завершення</Label>
              <Input
                id="endDate"
                type="date"
                value={projectForm.endDate}
                onChange={(e) => setProjectForm(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Опис проекту *</Label>
            <Textarea
              id="description"
              value={projectForm.description}
              onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Детальний опис проекту та його цілей"
              className="min-h-[120px]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}