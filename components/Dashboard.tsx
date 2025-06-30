import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Users, Target, BookOpen, FolderOpen, TrendingUp, TrendingDown, Calendar, Clock } from 'lucide-react';
import { AppContextType } from '../App';
import { mockDesigners } from '../services/mockData';

interface DashboardProps {
  context: AppContextType;
}

export function Dashboard({ context }: DashboardProps) {
  const totalDesigners = mockDesigners.length;
  const avgProductivity = Math.round(mockDesigners.reduce((sum, d) => sum + d.kpis.productivity, 0) / totalDesigners);
  const avgEfficiency = Math.round(mockDesigners.reduce((sum, d) => sum + d.efficiency, 0) / totalDesigners);
  
  const activeProjects = mockDesigners.flatMap(d => d.projects).filter(p => p.status === 'Active').length;
  const completedProjects = mockDesigners.flatMap(d => d.projects).filter(p => p.status === 'Completed').length;
  
  const learningInProgress = mockDesigners.flatMap(d => d.learningModules).filter(m => m.status === 'In Progress').length;
  const learningCompleted = mockDesigners.flatMap(d => d.learningModules).filter(m => m.status === 'Completed').length;

  const topPerformers = mockDesigners
    .sort((a, b) => b.kpis.overallScore - a.kpis.overallScore)
    .slice(0, 5);

  const recentlyCompleted = mockDesigners
    .flatMap(designer => 
      designer.learningModules
        .filter(m => m.status === 'Completed')
        .map(m => ({ ...m, designerName: designer.name, designerAvatar: designer.avatar }))
    )
    .slice(0, 5);

  const upcomingDeadlines = [
    { project: 'Mobile App Redesign', deadline: '2024-12-30', designer: 'Марія Петренко' },
    { project: 'Landing Page Update', deadline: '2025-01-05', designer: 'Анна Сидоренко' },
    { project: 'Design System v2', deadline: '2025-01-10', designer: 'Дмитро Коваленко' }
  ];

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
                        <AvatarImage src={module.designerAvatar} alt={module.designerName} />
                        <AvatarFallback>{module.designerName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{module.title}</div>
                        <div className="text-xs text-muted-foreground">{module.designerName}</div>
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
                  {['Junior', 'Middle', 'Senior', 'Lead'].map(level => {
                    const count = mockDesigners.filter(d => d.level === level).length;
                    const percentage = (count / totalDesigners) * 100;
                    return (
                      <div key={level} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">{level}</span>
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