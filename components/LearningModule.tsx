import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Plus, Search, BookOpen, Users, Clock, CheckCircle, Play, AlertCircle, Edit, Eye } from 'lucide-react';
import { AppContextType } from '../App';
import { dataStorage } from '../services/dataStorage';
import { LearningModule, Designer } from '../types';

interface LearningModuleManagerProps {
  context: AppContextType;
  navigateTo: (nav: any) => void;
  currentNavigation: any;
}

export function LearningModuleManager({ context, navigateTo }: LearningModuleManagerProps) {
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [designers, setDesigners] = useState<Designer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

  useEffect(() => {
    setIsLoading(true);
    const modulesData = dataStorage.getLearningModules();
    const designersData = dataStorage.getDesigners();

    setModules(modulesData || []);
    setDesigners(designersData || []);
    setIsLoading(false);
  }, [context.dataVersion]); // Додано context.dataVersion

  const filteredModules = modules.filter(module => {
    const title = module.title || '';
    const description = module.description || '';
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || module.category === categoryFilter;
    const matchesDifficulty = difficultyFilter === 'all' || module.difficulty === difficultyFilter;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getModuleStats = (module: LearningModule) => {
    const allAssignments = designers.flatMap(designer =>
      (designer.learningModules || []).filter(m => m.id === module.id)
    );
    
    return {
      assigned: allAssignments.length,
      completed: allAssignments.filter(m => m.status === 'Completed').length,
      inProgress: allAssignments.filter(m => m.status === 'In Progress').length,
      avgProgress: allAssignments.length > 0 ? 
        Math.round(allAssignments.reduce((sum, m) => sum + (m.progress || 0), 0) / allAssignments.length) : 0
    };
  };

  const categories = ['all', ...Array.from(new Set(modules.map(m => m.category)))].filter(Boolean);
  const difficulties = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  const totalModules = modules.length;
  const assignedModulesOverall = designers.flatMap(d => d.learningModules || []);
  const totalAssignments = assignedModulesOverall.length;
  const completedAssignments = assignedModulesOverall.filter(m => m.status === 'Completed').length;
  const inProgressAssignments = assignedModulesOverall.filter(m => m.status === 'In Progress').length;

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Завантаження модулів навчання...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Управління навчанням</h1>
          <p className="text-muted-foreground">Створення модулів, призначення та відстеження прогресу</p>
        </div>
        {context.currentUser.permissions.includes('create_modules') && (
          <Button onClick={() => navigateTo({ 
            section: 'learning', 
            subsection: 'module-editor', 
            mode: 'create' 
          })}>
            <Plus className="w-4 h-4 mr-2" />
            Створити модуль
          </Button>
        )}
      </div>

      {/* Learning Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Модулів
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalModules}</div>
            <p className="text-xs text-muted-foreground">
              навчальних програм
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4" />
              Призначено
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssignments}</div>
            <p className="text-xs text-muted-foreground">
              всього призначень
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Завершено
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedAssignments}</div>
            <p className="text-xs text-muted-foreground">
              {totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0}% від призначених
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Play className="w-4 h-4" />
              В процесі
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inProgressAssignments}</div>
            <p className="text-xs text-muted-foreground">
              активно навчаються
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="modules" className="w-full">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="modules">Модулі</TabsTrigger>
            <TabsTrigger value="assignments">Призначення</TabsTrigger>
            <TabsTrigger value="progress">Прогрес</TabsTrigger>
          </TabsList>
          
          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Пошук модулів..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Категорія" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'Всі категорії' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Складність" />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map(difficulty => (
                  <SelectItem key={difficulty} value={difficulty}>
                    {difficulty === 'all' ? 'Всі рівні' : difficulty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="modules" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredModules.map(module => {
              const stats = getModuleStats(module);
              return (
                <Card key={module.id} className="hover:shadow-lg transition-shadow group">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-base">{module.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{module.description}</CardDescription>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline">{module.category}</Badge>
                        <Badge variant={
                          module.difficulty === 'Beginner' ? 'secondary' :
                          module.difficulty === 'Intermediate' ? 'default' : 'destructive'
                        }>
                          {module.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{module.estimatedTime}h</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                        <span>{module.tests?.length || 0} тестів</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Призначено: {stats.assigned}</span>
                        <span>Завершено: {stats.completed}</span>
                      </div>
                      {stats.assigned > 0 ? (
                        <>
                          <Progress value={(stats.completed / stats.assigned) * 100} />
                          <div className="text-xs text-muted-foreground text-center">
                            Середній прогрес: {stats.avgProgress}%
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-muted-foreground text-center py-2">
                          Модуль не призначено
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => navigateTo({ 
                          section: 'learning', 
                          subsection: 'module-details', 
                          id: module.id 
                        })}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Переглянути
                      </Button>
                      {context.currentUser.permissions.includes('create_modules') && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateTo({ 
                              section: 'learning', 
                              subsection: 'module-editor', 
                              id: module.id,
                              mode: 'edit' 
                            });
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                  {context.currentUser.permissions.includes('create_modules') && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700 hover:bg-red-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Ви впевнені, що хочете видалити модуль "${module.title}"? Це також видалить його з призначень у дизайнерів та всі пов'язані уроки і тести.`)) {
                          dataStorage.deleteLearningModule(module.id);
                          context.triggerDataRefresh();
                          context.addNotification({
                            title: 'Модуль видалено',
                            message: `Модуль "${module.title}" успішно видалено.`,
                            type: 'success'
                          });
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredModules.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Модулі не знайдені</h3>
              <p className="text-muted-foreground mb-4">
                Спробуйте змінити фільтри або створити новий модуль
              </p>
              {context.currentUser.permissions.includes('create_modules') && (
                <Button onClick={() => navigateTo({ 
                  section: 'learning', 
                  subsection: 'module-editor', 
                  mode: 'create' 
                })}>
                  <Plus className="w-4 h-4 mr-2" />
                  Створити перший модуль
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Активні призначення</CardTitle>
              <CardDescription>Модулі призначені дизайнерам команди</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {designers.map(designer => {
                  const activeModules = (designer.learningModules || []).filter(m => m.status !== 'Completed');
                  if (activeModules.length === 0) return null;
                  
                  return (
                    <div key={designer.id} 
                         className="p-4 border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors"
                         onClick={() => navigateTo({ 
                           section: 'designers', 
                           subsection: 'designer-profile', 
                           id: designer.id 
                         })}>
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={designer.avatar} alt={designer.name} />
                          <AvatarFallback>{designer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{designer.name}</div>
                          <div className="text-sm text-muted-foreground">{designer.position}</div>
                        </div>
                        <Badge variant="outline" className="ml-auto">
                          {activeModules.length} модулів
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {activeModules.map(module => (
                          <div key={module.id} className="flex items-center justify-between text-sm">
                            <span>{module.title}</span>
                            <div className="flex items-center gap-2">
                              <span>{module.progress || 0}%</span>
                              <div className="w-16 h-1 bg-secondary rounded-full">
                                <div 
                                  className="h-1 bg-primary rounded-full" 
                                  style={{ width: `${module.progress || 0}%` }}
                                />
                              </div>
                              <Badge variant={
                                module.status === 'Completed' ? 'default' :
                                module.status === 'In Progress' ? 'secondary' : 'outline'
                              } className="text-xs">
                                {module.status === 'In Progress' ? <Play className="w-3 h-3" /> :
                                 module.status === 'Completed' ? <CheckCircle className="w-3 h-3" /> :
                                 <AlertCircle className="w-3 h-3" />}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {modules.map(module => {
              const stats = getModuleStats(module);
              return (
                <Card key={module.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => navigateTo({ 
                        section: 'learning', 
                        subsection: 'module-details', 
                        id: module.id 
                      })}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{module.title}</CardTitle>
                    <CardDescription>
                      {stats.assigned} призначень • {stats.completed} завершено
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Прогрес завершення</span>
                      <span>{stats.assigned > 0 ? Math.round((stats.completed / stats.assigned) * 100) : 0}%</span>
                    </div>
                    <Progress value={stats.assigned > 0 ? (stats.completed / stats.assigned) * 100 : 0} />
                    
                    <div className="grid grid-cols-3 gap-4 text-center text-sm">
                      <div>
                        <div className="font-medium text-green-600">{stats.completed}</div>
                        <div className="text-xs text-muted-foreground">Завершено</div>
                      </div>
                      <div>
                        <div className="font-medium text-blue-600">{stats.inProgress}</div>
                        <div className="text-xs text-muted-foreground">В процесі</div>
                      </div>
                      <div>
                        <div className="font-medium">{stats.avgProgress}%</div>
                        <div className="text-xs text-muted-foreground">Середній прогрес</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}