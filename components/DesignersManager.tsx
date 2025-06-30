import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { 
  Plus, Search, Users, Target, TrendingUp, AlertTriangle, 
  Calendar, Edit, Eye, UserPlus, Filter, MoreVertical 
} from 'lucide-react';
import { AppContextType } from '../App';
import { Designer } from '../types';
import { dataStorage } from '../services/dataStorage';
import { mockDesigners } from '../services/mockData';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

interface DesignersManagerProps {
  context: AppContextType;
  navigateTo: (nav: any) => void;
  currentNavigation: any;
}

export function DesignersManager({ context, navigateTo }: DesignersManagerProps) {
  const [designers, setDesigners] = useState<Designer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Завантажуємо дизайнерів з localStorage або mock даних
  useEffect(() => {
    const storedDesigners = dataStorage.getDesigners();
    if (storedDesigners.length > 0) {
      setDesigners(storedDesigners);
    } else {
      setDesigners(mockDesigners);
    }
  }, []);

  const filteredDesigners = designers.filter(designer => {
    const matchesSearch = designer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         designer.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = positionFilter === 'all' || designer.position.includes(positionFilter);
    const matchesDepartment = departmentFilter === 'all' || (designer.department || 'Design') === departmentFilter;
    const matchesLevel = levelFilter === 'all' || (designer.level || 'Middle') === levelFilter;
    
    return matchesSearch && matchesPosition && matchesDepartment && matchesLevel;
  });

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const calculateDaysSinceJoining = (startDate: string) => {
    if (!startDate) return null;
    const today = new Date();
    const start = new Date(startDate);
    const diffTime = Math.abs(today.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getAverageSkillLevel = (skills: any[]) => {
    if (!skills || skills.length === 0) return 0;
    const total = skills.reduce((sum, skill) => sum + (skill.level || skill.currentLevel || 0), 0);
    return Math.round(total / skills.length);
  };

  const getLowPerformers = () => {
    return designers.filter(designer => {
      const avgSkill = getAverageSkillLevel(designer.skills);
      const efficiency = designer.efficiency || 0;
      return avgSkill < 60 || efficiency < 70;
    });
  };

  const getUpcomingBirthdays = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return designers.filter(designer => {
      if (!designer.birthDate) return false;
      const birth = new Date(designer.birthDate);
      const thisYearBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
      
      return thisYearBirthday >= today && thisYearBirthday <= nextWeek;
    });
  };

  // Статистика команди
  const teamStats = {
    total: designers.length,
    active: designers.filter(d => d.isActive !== false).length,
    averageSkillLevel: Math.round(designers.reduce((sum, d) => sum + getAverageSkillLevel(d.skills), 0) / designers.length),
    lowPerformers: getLowPerformers().length,
    upcomingBirthdays: getUpcomingBirthdays().length
  };

  const uniquePositions = ['all', ...Array.from(new Set(designers.map(d => d.position.split(' ')[0])))];
  const uniqueDepartments = ['all', ...Array.from(new Set(designers.map(d => d.department || 'Design')))];
  const uniqueLevels = ['all', 'Junior', 'Middle', 'Senior', 'Lead', 'Principal'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Управління дизайнерами</h1>
          <p className="text-muted-foreground">Команда та їх професійний розвиток</p>
        </div>
        {context.currentUser.permissions.includes('manage_team') && (
          <Button onClick={() => navigateTo({ 
            section: 'designers', 
            subsection: 'designer-editor', 
            mode: 'create' 
          })}>
            <UserPlus className="w-4 h-4 mr-2" />
            Додати дизайнера
          </Button>
        )}
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Всього дизайнерів</p>
                <p className="text-2xl font-bold">{teamStats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Активні</p>
                <p className="text-2xl font-bold text-green-600">{teamStats.active}</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Середній рівень</p>
                <p className="text-2xl font-bold">{teamStats.averageSkillLevel}%</p>
              </div>
              <Target className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Потребують уваги</p>
                <p className="text-2xl font-bold text-red-600">{teamStats.lowPerformers}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Дні народження</p>
                <p className="text-2xl font-bold text-purple-600">{teamStats.upcomingBirthdays}</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Пошук дизайнерів..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <Select value={positionFilter} onValueChange={setPositionFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Посада" />
            </SelectTrigger>
            <SelectContent>
              {uniquePositions.map(position => (
                <SelectItem key={position} value={position}>
                  {position === 'all' ? 'Всі посади' : position}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Відділ" />
            </SelectTrigger>
            <SelectContent>
              {uniqueDepartments.map(dept => (
                <SelectItem key={dept} value={dept}>
                  {dept === 'all' ? 'Всі відділи' : dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Рівень" />
            </SelectTrigger>
            <SelectContent>
              {uniqueLevels.map(level => (
                <SelectItem key={level} value={level}>
                  {level === 'all' ? 'Всі рівні' : level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            Сітка
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            Список
          </Button>
        </div>
      </div>

      {/* Designers Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDesigners.map(designer => {
            const avgSkillLevel = getAverageSkillLevel(designer.skills);
            const daysSinceJoining = calculateDaysSinceJoining(designer.startDate);
            const age = calculateAge(designer.birthDate);
            
            return (
              <Card key={designer.id} className="hover:shadow-lg transition-shadow group">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={designer.avatar} alt={designer.name} />
                      <AvatarFallback>{designer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{designer.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">{designer.position}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigateTo({ 
                          section: 'designers', 
                          subsection: 'designer-profile', 
                          id: designer.id 
                        })}>
                          <Eye className="w-4 h-4 mr-2" />
                          Переглянути профіль
                        </DropdownMenuItem>
                        {context.currentUser.permissions.includes('manage_team') && (
                          <DropdownMenuItem onClick={() => navigateTo({ 
                            section: 'designers', 
                            subsection: 'designer-editor', 
                            id: designer.id,
                            mode: 'edit' 
                          })}>
                            <Edit className="w-4 h-4 mr-2" />
                            Редагувати
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Навички</span>
                      <span>{avgSkillLevel}%</span>
                    </div>
                    <Progress value={avgSkillLevel} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {age && (
                      <div>
                        <span className="text-muted-foreground">Вік:</span>
                        <div className="font-medium">{age} років</div>
                      </div>
                    )}
                    {daysSinceJoining && (
                      <div>
                        <span className="text-muted-foreground">В команді:</span>
                        <div className="font-medium">{daysSinceJoining} днів</div>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">Ефективність:</span>
                      <div className="font-medium">{designer.efficiency || 85}%</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Проектів:</span>
                      <div className="font-medium">{designer.projects?.length || 0}</div>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline">{designer.level || 'Middle'}</Badge>
                    <Badge variant="secondary">{designer.department || 'Design'}</Badge>
                    {(designer.isActive === false) && (
                      <Badge variant="destructive">Неактивний</Badge>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => navigateTo({ 
                        section: 'designers', 
                        subsection: 'designer-profile', 
                        id: designer.id 
                      })}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Переглянути
                    </Button>
                    {context.currentUser.permissions.includes('manage_team') && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateTo({ 
                            section: 'designers', 
                            subsection: 'designer-editor', 
                            id: designer.id,
                            mode: 'edit' 
                          });
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* List View */
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-medium">Дизайнер</th>
                    <th className="text-left p-4 font-medium">Посада</th>
                    <th className="text-left p-4 font-medium">Відділ</th>
                    <th className="text-left p-4 font-medium">Рівень</th>
                    <th className="text-left p-4 font-medium">Навички</th>
                    <th className="text-left p-4 font-medium">Ефективність</th>
                    <th className="text-left p-4 font-medium">Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDesigners.map(designer => {
                    const avgSkillLevel = getAverageSkillLevel(designer.skills);
                    
                    return (
                      <tr key={designer.id} className="border-b hover:bg-muted/25 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={designer.avatar} alt={designer.name} />
                              <AvatarFallback>{designer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{designer.name}</div>
                              <div className="text-sm text-muted-foreground">{designer.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">{designer.position}</td>
                        <td className="p-4">{designer.department || 'Design'}</td>
                        <td className="p-4">
                          <Badge variant="outline">{designer.level || 'Middle'}</Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Progress value={avgSkillLevel} className="w-16 h-2" />
                            <span className="text-sm">{avgSkillLevel}%</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-sm">{designer.efficiency || 85}%</span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => navigateTo({ 
                                section: 'designers', 
                                subsection: 'designer-profile', 
                                id: designer.id 
                              })}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {context.currentUser.permissions.includes('manage_team') && (
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => navigateTo({ 
                                  section: 'designers', 
                                  subsection: 'designer-editor', 
                                  id: designer.id,
                                  mode: 'edit' 
                                })}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {filteredDesigners.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Дизайнери не знайдені</h3>
          <p className="text-muted-foreground mb-4">
            Спробуйте змінити фільтри або додати нового дизайнера
          </p>
          {context.currentUser.permissions.includes('manage_team') && (
            <Button onClick={() => navigateTo({ 
              section: 'designers', 
              subsection: 'designer-editor', 
              mode: 'create' 
            })}>
              <UserPlus className="w-4 h-4 mr-2" />
              Додати дизайнера
            </Button>
          )}
        </div>
      )}

      {/* Alerts */}
      {teamStats.lowPerformers > 0 && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <h4 className="font-medium text-red-800 dark:text-red-400">
                  Увага: {teamStats.lowPerformers} дизайнерів потребують уваги
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Низькі показники навичок або ефективності
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {teamStats.upcomingBirthdays > 0 && (
        <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <div>
                <h4 className="font-medium text-purple-800 dark:text-purple-400">
                  Дні народження цього тижня: {teamStats.upcomingBirthdays}
                </h4>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Не забудьте привітати колег!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}