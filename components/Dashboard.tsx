import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Users, Target, BookOpen, FolderOpen, TrendingUp, TrendingDown, Calendar, Clock } from 'lucide-react';
import { AppContextType } from '../App';
import { dataStorage, AppData } from '../services/dataStorage';
import { Designer, Project, LearningModule } from '../types';

interface DashboardProps {
  context: AppContextType;
}

export function Dashboard({ context }: DashboardProps) {
  const [appData, setAppData] = useState<AppData | null>(null);

  useEffect(() => {
    const data = dataStorage.getAllData();
    setAppData(data);
  }, []);

  if (!appData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div>Завантаження даних дашборду...</div>
      </div>
    );
  }

  const designers = appData.designers || [];
  const totalDesigners = designers.length;

  const avgProductivity = totalDesigners > 0
    ? Math.round(designers.reduce((sum, d) => sum + (d.kpis?.productivity || 0), 0) / totalDesigners)
    : 0;

  const avgEfficiency = totalDesigners > 0
    ? Math.round(designers.reduce((sum, d) => sum + (d.efficiency || 0), 0) / totalDesigners)
    : 0;
  
  const allProjects = designers.flatMap(d => d.projects || []) as Project[];
  const activeProjects = allProjects.filter(p => p.status === 'Active').length;
  // TODO: Implement "this month" logic if completion date is available
  const completedProjects = allProjects.filter(p => p.status === 'Completed').length;
  
  const allLearningModulesAssigned = designers.flatMap(d => d.learningModules || []) as LearningModule[];
  const learningInProgress = allLearningModulesAssigned.filter(m => m.status === 'In Progress').length;
  // TODO: Implement "this month" logic if completion date is available for assigned modules
  const learningCompleted = allLearningModulesAssigned.filter(m => m.status === 'Completed').length;

  const topPerformers = [...designers]
    .sort((a, b) => (b.kpis?.overallScore || 0) - (a.kpis?.overallScore || 0))
    .slice(0, 5);

  const recentlyCompletedLearning = designers
    .flatMap(designer => 
      (designer.learningModules || []).filter(m => m.status === 'Completed' && m.completedDate)
        .map(m => ({
          ...m,
          designerName: designer.name,
          designerAvatar: designer.avatar,
          // completedDate is assumed to be part of LearningModule type when assigned
        }))
    )
    .sort((a, b) => new Date(b.completedDate || 0).getTime() - new Date(a.completedDate || 0).getTime())
    .slice(0, 5);

  const upcomingDeadlines = allProjects
    .filter(p => p.status === 'Active' && p.deadline)
    .map(p => {
      const designerInfo = designers.find(d => d.projects?.some(dp => dp.id === p.id));
      return {
        project: p.name,
        deadline: p.deadline,
        designer: designerInfo?.name || 'N/A',
      };
    })
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    .slice(0, 3);

  return (
    <div className="h-full bg-background">
      <div className="h-full overflow-auto">
        <div className="p-4 lg:p-6 space-y-6">
          {/* Header */}
          <div className="flex-shrink-0">
            <h1>Дашборд команди</h1>
            <p className="text-muted-foreground">Огляд поточного стану команди дизайнерів</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => context.setRightPanel({ isOpen: false })}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Команда
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalDesigners}</div>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-green-600">+2 за місяць</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Продуктивність
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgProductivity}%</div>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-green-600">+5% за місяць</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" />
                  Проекти
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeProjects}</div>
                <p className="text-sm text-muted-foreground">
                  {completedProjects} завершено цього місяця
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Навчання
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{learningInProgress}</div>
                <p className="text-sm text-muted-foreground">
                  {learningCompleted} завершено цього місяця
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Топ виконавці</CardTitle>
                <CardDescription>За загальним KPI</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPerformers.map((designer, index) => (
                    <div key={designer.id} 
                         className="flex items-center gap-3 cursor-pointer hover:bg-secondary/50 p-2 rounded transition-colors"
                         onClick={() => context.setRightPanel({ 
                           isOpen: true, 
                           type: 'designer', 
                           data: designer, 
                           mode: 'view' 
                         })}>
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                        {index + 1}
                      </div>
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={designer.avatar} alt={designer.name} />
                        <AvatarFallback>{designer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{designer.name}</div>
                        <div className="text-xs text-muted-foreground">{designer.position}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-sm">{designer.kpis.overallScore}%</div>
                        <div className="text-xs text-muted-foreground">KPI</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Learning Completions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Нещодавно завершені</CardTitle>
                <CardDescription>Модулі навчання</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentlyCompleted.map((module, index) => (
                    <div key={`${module.id}-${index}`} 
                         className="flex items-center gap-3 cursor-pointer hover:bg-secondary/50 p-2 rounded transition-colors"
                         onClick={() => context.setRightPanel({ 
                           isOpen: true, 
                           type: 'module', 
                           data: module, 
                           mode: 'view' 
                         })}>
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={item.designerAvatar as string | undefined} alt={item.designerName} />
                        <AvatarFallback>{item.designerName?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.title}</div>
                        <div className="text-xs text-muted-foreground">{item.designerName}</div>
                      </div>
                      <Badge variant="default" className="text-xs">
                        100%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Deadlines */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Найближчі дедлайни</CardTitle>
                <CardDescription>Проекти що потребують уваги</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingDeadlines.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 rounded hover:bg-secondary/50 cursor-pointer transition-colors">
                      <Calendar className="w-8 h-8 text-orange-500" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.project}</div>
                        <div className="text-xs text-muted-foreground">{item.designer}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{new Date(item.deadline).toLocaleDateString('uk-UA')}</div>
                        <div className="text-xs text-muted-foreground">
                          {Math.ceil((new Date(item.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} днів
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Team Overview */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Розподіл по рівнях</CardTitle>
                <CardDescription>Структура команди за досвідом</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Junior', 'Middle', 'Senior', 'Lead'].map(levelName => {
                    const count = designers.filter(d => d.level === levelName).length;
                    const percentage = totalDesigners > 0 ? (count / totalDesigners) * 100 : 0;
                    return (
                      <div key={levelName} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">{levelName}</span>
                          <span className="text-sm">{count} ({Math.round(percentage)}%)</span>
                        </div>
                        <Progress value={percentage} />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Активність команди</CardTitle>
                <CardDescription>Поточні активності</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-secondary/30 rounded">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">Активні проекти</span>
                    </div>
                    <span className="font-medium">{activeProjects}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-secondary/30 rounded">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Навчання в процесі</span>
                    </div>
                    <span className="font-medium">{learningInProgress}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-secondary/30 rounded">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <span className="text-sm">Середня ефективність</span>
                    </div>
                    <span className="font-medium">{avgEfficiency}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Швидкі дії</CardTitle>
              <CardDescription>Найчастіші операції</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto p-4 flex-col gap-2"
                        onClick={() => context.setRightPanel({ 
                          isOpen: true, 
                          type: 'designer', 
                          data: null, 
                          mode: 'create' 
                        })}>
                  <Users className="w-6 h-6" />
                  <span>Додати дизайнера</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex-col gap-2"
                        onClick={() => context.setRightPanel({ 
                          isOpen: true, 
                          type: 'module', 
                          data: null, 
                          mode: 'create' 
                        })}>
                  <BookOpen className="w-6 h-6" />
                  <span>Створити модуль</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex-col gap-2"
                        onClick={() => context.setRightPanel({ 
                          isOpen: true, 
                          type: 'skill', 
                          data: null, 
                          mode: 'create' 
                        })}>
                  <Target className="w-6 h-6" />
                  <span>Додати навичку</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex-col gap-2"
                        onClick={() => context.setRightPanel({ 
                          isOpen: true, 
                          type: 'project', 
                          data: null, 
                          mode: 'create' 
                        })}>
                  <FolderOpen className="w-6 h-6" />
                  <span>Новий проект</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}