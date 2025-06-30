import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { 
  BookOpen, Play, CheckCircle, Clock, Users, Target, 
  Plus, Edit, Trash2, FileText, Video, Image, Link,
  Award, BarChart, AlertCircle, Calendar
} from 'lucide-react';
import { AppContextType } from '../App';
import { dataStorage } from '../services/dataStorage';
import { LearningModule as GlobalLearningModule, Designer, Lesson as GlobalLesson, Test as GlobalTest } from '../types';

interface ModuleDetailsProps {
  moduleId: string;
  context: AppContextType;
  navigateTo: (nav: any) => void;
}

export function ModuleDetails({ moduleId, context, navigateTo }: ModuleDetailsProps) {
  const [module, setModule] = useState<GlobalLearningModule | null>(null);
  const [designers, setDesigners] = useState<Designer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAssignModule, setShowAssignModule] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [assignDeadline, setAssignDeadline] = useState('');

  // States for add lesson/test dialogs (if they are part of this component)
  // const [showAddLesson, setShowAddLesson] = useState(false);
  // const [showAddTest, setShowAddTest] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const modules = dataStorage.getLearningModules();
    const currentModule = modules.find(m => m.id === moduleId);
    setModule(currentModule || null);

    const designersData = dataStorage.getDesigners();
    setDesigners(designersData || []);

    setIsLoading(false);
  }, [moduleId]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Завантаження деталей модуля...</div>;
  }

  if (!module) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3>Модуль не знайдено</h3>
          <p className="text-muted-foreground">Можливо, модуль було видалено або ID неправильний.</p>
        </div>
      </div>
    );
  }

  const getTypeIcon = (type: GlobalLesson['type']) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'article': return <FileText className="w-4 h-4" />;
      case 'interactive': return <Target className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      case 'link': return <Link className="w-4 h-4" />;
      case 'image': return <Image className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Calculate enrolled users and completion rate based on actual designer assignments
  const enrolledUsersList = designers.filter(d => d.learningModules?.some(lm => lm.id === module.id));
  const enrolledCount = enrolledUsersList.length;
  const completedByEnrolled = enrolledUsersList.filter(d =>
    d.learningModules?.find(lm => lm.id === module.id)?.status === 'Completed'
  ).length;
  const completionRate = enrolledCount > 0 ? Math.round((completedByEnrolled / enrolledCount) * 100) : 0;


  const moduleLessons = module.lessons || [];
  const completedLessons = moduleLessons.filter(l => l.completed).length;
  const totalLessons = moduleLessons.length;
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{module.title}</h1>
            <Badge variant={module.status === 'Published' ? 'default' : 'secondary'}>
              {module.status}
            </Badge>
          </div>
          <p className="text-lg text-muted-foreground">{module.description}</p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {module.estimatedTime} год
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {enrolledCount} учасників
            </div>
            <div className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              {module.difficulty}
            </div>
            <div className="flex items-center gap-1">
              <Award className="w-4 h-4" />
              {completionRate}% завершили
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          {context.currentUser.permissions.includes('assign_modules') && (
            <Button onClick={() => setShowAssignModule(true)}>
              <Users className="w-4 h-4 mr-2" />
              Призначити користувачам
            </Button>
          )}
          {context.currentUser.permissions.includes('manage_team') && (
            <Button variant="outline" onClick={() => navigateTo({ section: 'learning', subsection: 'module-editor', id: module?.id, mode: 'edit' })}>
              <Edit className="w-4 h-4 mr-2" />
              Редагувати модуль
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Прогрес (загальний)</p>
                <p className="text-2xl font-bold">{Math.round(progressPercentage)}%</p>
              </div>
              <BarChart className="w-8 h-8 text-blue-500" />
            </div>
            <Progress value={progressPercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Уроки</p>
                <p className="text-2xl font-bold">{completedLessons}/{totalLessons}</p>
              </div>
              <BookOpen className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Тести</p>
                <p className="text-2xl font-bold">
                  {(module.tests || []).filter(t => (t as any).status === 'completed').length}/{(module.tests || []).length}
                </p>
              </div>
              <Target className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Учасники</p>
                <p className="text-2xl font-bold">{enrolledCount}</p>
              </div>
              <Users className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="lessons" className="space-y-4">
        <TabsList>
          <TabsTrigger value="lessons">Уроки</TabsTrigger>
          <TabsTrigger value="tests">Тести</TabsTrigger>
          <TabsTrigger value="resources">Ресурси</TabsTrigger>
          <TabsTrigger value="assignments">Завдання</TabsTrigger>
          <TabsTrigger value="participants">Учасники</TabsTrigger>
          <TabsTrigger value="analytics">Аналітика</TabsTrigger>
        </TabsList>

        <TabsContent value="lessons" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Уроки модуля</h3>
            {context.currentUser.permissions.includes('manage_team') && (
               <Button onClick={() => navigateTo({ section: 'learning', subsection: 'lesson-editor', moduleId: module?.id, mode: 'create' })}>
                <Plus className="w-4 h-4 mr-2" />
                Додати урок
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {(module.lessons || []).map((lesson, index) => (
              <Card key={lesson.id} className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigateTo({ 
                      section: 'learning', 
                      subsection: 'lesson-view', 
                      data: lesson 
                    })}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm">
                        {index + 1}
                      </div>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(lesson.type)}
                        <div>
                          <h4 className="font-medium">{lesson.title}</h4>
                          <p className="text-sm text-muted-foreground">{lesson.content}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">{lesson.duration}</span>
                      {lesson.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Play className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tests" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Тести та перевірки</h3>
            {context.currentUser.permissions.includes('manage_team') && (
              <Button onClick={() => navigateTo({ section: 'learning', subsection: 'test-editor', moduleId: module?.id, mode: 'create' })}>
                <Plus className="w-4 h-4 mr-2" />
                Створити тест
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(module.tests || []).map(test => (
              <Card key={test.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{test.title}</CardTitle>
                    <Badge variant={(test as any).status === 'completed' ? 'default' : 'secondary'}>
                      {(test as any).status === 'completed' ? 'Завершено' : 'Доступний'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Питань:</span>
                      <span className="ml-2 font-medium">{(test.questions || []).length}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Час:</span>
                      <span className="ml-2 font-medium">{(test as any).timeLimit || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Прохідний бал:</span>
                      <span className="ml-2 font-medium">{test.passingScore}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Спроби:</span>
                      <span className="ml-2 font-medium">{(test.attempts || []).length}</span>
                    </div>
                  </div>
                  
                  {(test as any).bestScore && (
                    <div className="p-2 bg-green-50 rounded border border-green-200">
                      <div className="text-sm text-green-800">
                        Найкращий результат: <span className="font-bold">{(test as any).bestScore}%</span>
                      </div>
                    </div>
                  )}
                  
                  <Button className="w-full" variant={test.status === 'completed' ? 'outline' : 'default'}>
                    {test.status === 'completed' ? 'Переглянути результат' : 'Розпочати тест'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Додаткові ресурси</h3>
            {context.currentUser.permissions.includes('manage_team') && (
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Додати ресурс
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {((module as any).resources || []).map((resource: any) => (
              <Card key={resource.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {getResourceIcon(resource.type)}
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{resource.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{resource.description}</p>
                      <Badge variant="outline" className="text-xs">
                        {resource.type.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Практичні завдання</h3>
            {context.currentUser.permissions.includes('manage_team') && (
              <Button disabled> {/* TODO: Implement assignment creation */}
                <Plus className="w-4 h-4 mr-2" />
                Створити завдання
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {((module as any).assignments || []).map((assignment: any) => (
              <Card key={assignment.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{assignment.title}</CardTitle>
                      <CardDescription>{assignment.description}</CardDescription>
                    </div>
                    <Badge variant={assignment.status === 'completed' ? 'default' : 'secondary'}>
                      {assignment.status === 'completed' ? 'Завершено' : 'Активне'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Дедлайн: {new Date(assignment.dueDate).toLocaleDateString('uk-UA')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {assignment.submissions} подань
                      </div>
                    </div>
                    <Button variant="outline" size="sm" disabled> {/* TODO: Implement view submissions */}
                      Переглянути подання
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
             {((module as any).assignments || []).length === 0 && <p className="text-sm text-muted-foreground">Завдань для цього модуля ще немає.</p>}
          </div>
        </TabsContent>

        <TabsContent value="participants" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Учасники модуля</h3>
            <div className="text-sm text-muted-foreground">
              {enrolledCount} активних учасників
            </div>
          </div>

          <div className="space-y-3">
            {enrolledUsersList.map(user => {
              const userModuleData = user.learningModules?.find(lm => lm.id === module.id);
              return (
                <Card key={user.id} className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => navigateTo({
                        section: 'designers',
                        subsection: 'designer-profile',
                        id: user.id
                      })}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="font-medium">{user.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {userModuleData?.status === 'Completed' ? 'Завершено' : 'В процесі'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{userModuleData?.progress || 0}%</div>
                        <Progress value={userModuleData?.progress || 0} className="w-20 mt-1" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {enrolledUsersList.length === 0 && <p className="text-sm text-muted-foreground">Ще ніхто не призначений на цей модуль.</p>}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Статистика завершення</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Завершили</span>
                    <span className="font-medium">{completionRate}%</span>
                  </div>
                  <Progress value={completionRate} />
                  <div className="text-xs text-muted-foreground">
                    {completedByEnrolled} з {enrolledCount} учасників
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Середній час</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold">6.5</div>
                  <div className="text-sm text-muted-foreground">годин</div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Середній час на завершення
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Рейтинг модуля</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold">4.7</div>
                  <div className="flex justify-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Award key={i} className={`w-4 h-4 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Базується на 8 відгуках
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Assign Module Dialog */}
      <Dialog open={showAssignModule} onOpenChange={setShowAssignModule}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Призначити модуль користувачам</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {designers.map(user => (
                <div key={user.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`assign-${user.id}`}
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedUsers([...selectedUsers, user.id]);
                      } else {
                        setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                      }
                    }}
                  />
                  <Label htmlFor={`assign-${user.id}`} className="flex-1 cursor-pointer">
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.position}</div>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="assign-deadline">Дедлайн</Label>
              <Input id="assign-deadline" type="date" value={assignDeadline} onChange={e => setAssignDeadline(e.target.value)} />
            </div>
            
            <div className="space-y-2">
              <Label>Коментар (необов'язково)</Label>
              <Textarea placeholder="Додайте інструкції або коментар..." />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={() => {
                  if (selectedUsers.length === 0 || !assignDeadline || !module) {
                    context.addNotification({
                      title: 'Помилка',
                      message: 'Оберіть користувачів та вкажіть дедлайн',
                      type: 'error',
                    });
                    return;
                  }
                  selectedUsers.forEach(userId => {
                    const userToUpdate = designers.find(d => d.id === userId);
                    if (userToUpdate) {
                      const alreadyAssigned = userToUpdate.learningModules?.find(lm => lm.id === module.id);
                      if (alreadyAssigned) {
                        console.warn(`Module ${module.title} already assigned to ${userToUpdate.name}`);
                        // Optionally, update deadline or notify user
                        return;
                      }

                      const newAssignedModule: GlobalLearningModule = {
                        id: module.id,
                        title: module.title,
                        description: module.description,
                        category: module.category,
                        difficulty: module.difficulty,
                        estimatedTime: module.estimatedTime,
                        status: 'Not Started',
                        progress: 0,
                        assignedDate: new Date().toISOString(),
                        deadline: assignDeadline,
                        tests: module.tests || [],
                        lessons: module.lessons || [],
                      };
                      const updatedUser = {
                        ...userToUpdate,
                        learningModules: [...(userToUpdate.learningModules || []), newAssignedModule],
                      };
                      dataStorage.saveDesigner(updatedUser);
                    }
                  });
                  context.addNotification({
                    title: 'Модуль призначено',
                    message: `Модуль "${module.title}" призначено ${selectedUsers.length} користувачам`,
                    type: 'success',
                  });
                  setShowAssignModule(false);
                  setSelectedUsers([]);
                  setAssignDeadline('');
                }}
                disabled={selectedUsers.length === 0 || !assignDeadline}
              >
                Призначити ({selectedUsers.length})
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