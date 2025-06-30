import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  User, Calendar, Clock, Target, BookOpen, Star, TrendingUp, 
  Award, MessageSquare, Edit, Mail, Phone, MapPin, Briefcase,
  GraduationCap, PlusCircle, AlertCircle
} from 'lucide-react';
import { AppContextType } from '../App';
import { dataStorage } from '../services/dataStorage';
import { Designer, LearningModule as GlobalLearningModule, Skill, LearningModule as AssignedLearningModule } from '../types';

interface DesignerProfileProps {
  designerId: string;
  context: AppContextType;
  navigateTo: (nav: any) => void;
  currentNavigation: any;
}

export function DesignerProfile({ designerId, context, navigateTo }: DesignerProfileProps) {
  const [designer, setDesigner] = useState<Designer | null>(null);
  const [allLearningModules, setAllLearningModules] = useState<GlobalLearningModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAssignModule, setShowAssignModule] = useState(false);
  const [selectedModule, setSelectedModule] = useState('');
  const [assignDeadline, setAssignDeadline] = useState('');

  useEffect(() => {
    setIsLoading(true);
    const storedDesigners = dataStorage.getDesigners();
    const currentDesigner = storedDesigners.find(d => d.id === designerId);

    if (currentDesigner) {
      const skillsFromStorage = dataStorage.getSkills();
      const enrichedSkills = (currentDesigner.skills || []).map(ds => {
        const skillInfo = skillsFromStorage.find(s => s.id === ds.skillId);
        return {
          ...ds,
          name: skillInfo?.name || ds.skillName || 'Unknown Skill',
          category: skillInfo?.category || ds.category || 'Unknown',
        };
      });
      setDesigner({ ...currentDesigner, skills: enrichedSkills });
    } else {
      setDesigner(null);
    }

    const modules = dataStorage.getLearningModules();
    setAllLearningModules(modules || []);
    setIsLoading(false);
  }, [designerId]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Завантаження профілю...</div>;
  }

  if (!designer) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3>Дизайнера не знайдено</h3>
          <p className="text-muted-foreground">Перевірте правильність ID дизайнера або він був видалений.</p>
        </div>
      </div>
    );
  }

  // Корисні розрахунки (використовують `designer` зі стану)
  const calculateAge = (birthDate: string): number => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const calculateWorkDays = (joinDate: string): number => {
    const join = new Date(joinDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - join.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getPerformanceColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getNextBirthday = (birthDate: string): { days: number; date: string } => {
    const birth = new Date(birthDate);
    const today = new Date();
    const thisYear = today.getFullYear();
    let nextBirthday = new Date(thisYear, birth.getMonth(), birth.getDate());
    
    if (nextBirthday < today) {
      nextBirthday = new Date(thisYear + 1, birth.getMonth(), birth.getDate());
    }
    
    const diffTime = nextBirthday.getTime() - today.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      days,
      date: nextBirthday.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' })
    };
  };

  const age = designer.birthDate ? calculateAge(designer.birthDate) : null;
  const workDays = designer.joinDate ? calculateWorkDays(designer.joinDate) : null;
  const nextBirthday = designer.birthDate ? getNextBirthday(designer.birthDate) : null;

  const designerPeerReviews = designer.peerReviews || [];
  const averageRating = designerPeerReviews.length > 0
    ? designerPeerReviews.reduce((sum, review) => sum + review.rating, 0) / designerPeerReviews.length
    : 0;

  const designerLearningModules = designer.learningModules || [];
  const completedModules = designerLearningModules.filter(m => m.status === 'Completed').length;
  const totalModules = designerLearningModules.length;
  const learningProgress = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-6">
          <Avatar className="w-24 h-24">
            <AvatarImage src={designer.avatar} alt={designer.name} />
            <AvatarFallback className="text-xl">
              {designer.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{designer.name}</h1>
              <Badge variant={designer.status === 'Active' ? 'default' : 'secondary'}>
                {designer.status}
              </Badge>
            </div>
            <p className="text-xl text-muted-foreground">{designer.position}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                {designer.level}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {designer.location}
              </div>
              {age && (
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {age} років
                </div>
              )}
              {workDays && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {workDays} днів в команді
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          {context.currentUser.permissions.includes('manage_team') && (
            <Button
              onClick={() => navigateTo({ section: 'designers', subsection: 'designer-editor', id: designerId, mode: 'edit' })}
              variant="outline"
            >
              <Edit className="w-4 h-4 mr-2" />
              Редагувати
            </Button>
          )}
          {context.currentUser.permissions.includes('assign_modules') && (
            <Button onClick={() => setShowAssignModule(true)}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Призначити модуль
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Загальний KPI</p>
                <p className={`text-2xl font-bold ${getPerformanceColor(designer.kpis.overallScore)}`}>
                  {designer.kpis.overallScore}%
                </p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Продуктивність</p>
                <p className={`text-2xl font-bold ${getPerformanceColor(designer.kpis.productivity)}`}>
                  {designer.kpis.productivity}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Навчання</p>
                <p className="text-2xl font-bold">{completedModules}/{totalModules}</p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-500" />
            </div>
            <Progress value={learningProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Рейтинг команди</p>
                <div className="flex items-center gap-1">
                  <p className="text-2xl font-bold">{averageRating.toFixed(1)}</p>
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                </div>
              </div>
              <Award className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Special Alerts */}
      {nextBirthday && nextBirthday.days <= 7 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">
                  День народження незабаром!
                </p>
                <p className="text-sm text-yellow-700">
                  {nextBirthday.date} ({nextBirthday.days} {nextBirthday.days === 1 ? 'день' : 'днів'})
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Огляд</TabsTrigger>
          <TabsTrigger value="performance">Продуктивність</TabsTrigger>
          <TabsTrigger value="learning">Навчання</TabsTrigger>
          <TabsTrigger value="projects">Проекти</TabsTrigger>
          <TabsTrigger value="feedback">Відгуки</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Контактна інформація</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{designer.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{designer.phone || 'Не вказано'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>
                    Приєднався: {designer.joinDate ? new Date(designer.joinDate).toLocaleDateString('uk-UA') : 'Не вказано'}
                  </span>
                </div>
                {designer.birthDate && (
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>
                      Дата народження: {new Date(designer.birthDate).toLocaleDateString('uk-UA')} ({age} років)
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Навички</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(designer.skills || []).slice(0, 8).map(skill => (
                    <div key={skill.id || skill.skillId} className="flex items-center justify-between">
                      <span className="text-sm">{skill.skillName}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={skill.level || skill.currentLevel || 0} className="w-20" />
                        <span className="text-xs text-muted-foreground w-8">
                          {skill.level || skill.currentLevel || 0}%
                        </span>
                      </div>
                    </div>
                  ))}
                  {(designer.skills || []).length > 8 && (
                    <Button variant="ghost" size="sm" className="w-full mt-2"
                            onClick={() => navigateTo({ section: 'skills', subsection: 'designer-skills', id: designerId })}>
                      Показати всі навички ({(designer.skills || []).length})
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>KPI Метрики</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Загальний KPI</span>
                    <span className={`font-bold ${getPerformanceColor(designer.kpis.overallScore)}`}>
                      {designer.kpis.overallScore}%
                    </span>
                  </div>
                  <Progress value={designer.kpis.overallScore} />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Продуктивність</span>
                    <span className={`font-bold ${getPerformanceColor(designer.kpis.productivity)}`}>
                      {designer.kpis.productivity}%
                    </span>
                  </div>
                  <Progress value={designer.kpis.productivity} />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Якість роботи</span>
                    <span className={`font-bold ${getPerformanceColor(designer.kpis.qualityScore)}`}>
                      {designer.kpis.qualityScore}%
                    </span>
                  </div>
                  <Progress value={designer.kpis.qualityScore} />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Дотримання дедлайнів</span>
                    <span className={`font-bold ${getPerformanceColor(designer.kpis.timeManagement)}`}>
                      {designer.kpis.timeManagement}%
                    </span>
                  </div>
                  <Progress value={designer.kpis.timeManagement} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Робочі показники</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span>Годин на тиждень</span>
                  <span className="font-medium">{designer.hoursWorked}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span>Ефективність</span>
                  <span className="font-medium">{designer.efficiency}%</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span>Активних проектів</span>
                  <span className="font-medium">
                    {designer.projects.filter(p => p.status === 'Active').length}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span>Завершених проектів</span>
                  <span className="font-medium">
                    {designer.projects.filter(p => p.status === 'Completed').length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="learning" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Поточні модулі навчання</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(designer.learningModules || []).map(module => (
                    <div key={module.id} className="p-3 border rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors"
                         onClick={() => navigateTo({ 
                           section: 'learning', 
                           subsection: 'module-details', 
                           id: module.id 
                         })}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{module.title}</h4>
                        <Badge variant={
                          module.status === 'Completed' ? 'default' : 
                          module.status === 'In Progress' ? 'secondary' : 'outline'
                        }>
                          {module.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{module.description}</p>
                      <Progress value={module.progress} className="mb-1" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Прогрес: {module.progress}%</span>
                        <span>Дедлайн: {new Date(module.deadline).toLocaleDateString('uk-UA')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Статистика навчання</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-secondary/30 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{completedModules}</div>
                  <div className="text-sm text-muted-foreground">Завершено модулів</div>
                </div>
                <div className="text-center p-4 bg-secondary/30 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {(designer.learningModules || []).filter(m => m.status === 'In Progress').length}
                  </div>
                  <div className="text-sm text-muted-foreground">В процесі</div>
                </div>
                <div className="text-center p-4 bg-secondary/30 rounded-lg">
                  <div className="text-2xl font-bold">{Math.round(learningProgress)}%</div>
                  <div className="text-sm text-muted-foreground">Загальний прогрес</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(designer.projects || []).map(project => (
              <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{project.name}</CardTitle>
                    <Badge variant={
                      project.status === 'Completed' ? 'default' : 
                      project.status === 'Active' ? 'secondary' : 'outline'
                    }>
                      {project.status}
                    </Badge>
                  </div>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Прогрес</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Роль: {project.role}</span>
                      <span>Дедлайн: {new Date(project.deadline).toLocaleDateString('uk-UA')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Відгуки від колег</CardTitle>
                <CardDescription>Peer review оцінки</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(designer.peerReviews || []).map(review => (
                    <div key={review.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{review.reviewerName}</span>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${
                                  i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                }`} 
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.date).toLocaleDateString('uk-UA')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Підсумок оцінок</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-secondary/30 rounded-lg">
                    <div className="text-3xl font-bold text-yellow-600 flex items-center justify-center gap-2">
                      {averageRating.toFixed(1)}
                      <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="text-sm text-muted-foreground">Середній рейтинг</div>
                  </div>
                  <div className="text-center p-4 bg-secondary/30 rounded-lg">
                    <div className="text-2xl font-bold">{(designer.peerReviews || []).length}</div>
                    <div className="text-sm text-muted-foreground">Всього відгуків</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Assign Module Dialog */}
      <Dialog open={showAssignModule} onOpenChange={setShowAssignModule}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Призначити модуль навчання</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Модуль</Label>
              <Select value={selectedModule} onValueChange={setSelectedModule}>
                <SelectTrigger>
                  <SelectValue placeholder="Оберіть модуль" />
                </SelectTrigger>
                <SelectContent>
                  {allLearningModules.map(module => (
                    <SelectItem key={module.id} value={module.id}>
                      {module.title} ({module.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Дедлайн</Label>
              <Input type="date" value={assignDeadline} onChange={(e) => setAssignDeadline(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Коментар (необов'язково)</Label>
              <Textarea placeholder="Додайте коментар або інструкції..." />
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={() => {
                if (!selectedModule || !assignDeadline) {
                  context.addNotification({
                    title: 'Помилка',
                    message: 'Оберіть модуль та вкажіть дедлайн',
                    type: 'error',
                  });
                  return;
                }
                const moduleToAssign = allLearningModules.find(m => m.id === selectedModule);
                if (designer && moduleToAssign) {
                  const newAssignedModule: AssignedLearningModule = {
                    id: moduleToAssign.id,
                    title: moduleToAssign.title,
                    description: moduleToAssign.description,
                    category: moduleToAssign.category,
                    difficulty: moduleToAssign.difficulty,
                    estimatedTime: moduleToAssign.estimatedTime,
                    status: 'Not Started',
                    progress: 0,
                    assignedDate: new Date().toISOString(),
                    deadline: assignDeadline,
                    tests: moduleToAssign.tests || [],
                  };

                  const updatedDesigner = {
                    ...designer,
                    learningModules: [...(designer.learningModules || []), newAssignedModule],
                  };
                  dataStorage.saveDesigner(updatedDesigner);
                  setDesigner(updatedDesigner);

                  context.addNotification({
                    title: 'Модуль призначено',
                    message: `Модуль "${moduleToAssign.title}" успішно призначено для ${designer.name}`,
                    type: 'success',
                  });
                  setShowAssignModule(false);
                  setSelectedModule('');
                  setAssignDeadline('');
                }
              }}>
                Призначити
              </Button>
              <Button variant="outline" onClick={() => setShowAssignModule(false)}>
                Скасувати
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}