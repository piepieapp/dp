import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Search, Calendar, Users, Clock, Edit, Eye } from 'lucide-react';
import { AppContextType } from '../App';
import { mockDesigners } from '../services/mockData';

interface ProjectsManagerProps {
  context: AppContextType;
  navigateTo: (nav: any) => void;
  currentNavigation: any;
}

export function ProjectsManager({ context, navigateTo }: ProjectsManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Отримуємо всі проекти з mockDesigners
  const allProjects = mockDesigners.flatMap(designer => 
    designer.projects.map(project => ({
      ...project,
      assignedDesigner: designer.name
    }))
  );

  const filteredProjects = allProjects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const projectStats = {
    total: allProjects.length,
    active: allProjects.filter(p => p.status === 'Active').length,
    completed: allProjects.filter(p => p.status === 'Completed').length,
    onHold: allProjects.filter(p => p.status === 'On Hold').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Управління проектами</h1>
          <p className="text-muted-foreground">Відстеження та координація проектних робіт</p>
        </div>
        {context.currentUser.permissions.includes('create_modules') && (
          <Button onClick={() => navigateTo({ 
            section: 'projects', 
            subsection: 'project-editor', 
            mode: 'create' 
          })}>
            <Plus className="w-4 h-4 mr-2" />
            Створити проект
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Всього проектів</p>
                <p className="text-2xl font-bold">{projectStats.total}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Активні</p>
                <p className="text-2xl font-bold text-green-600">{projectStats.active}</p>
              </div>
              <Clock className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Завершені</p>
                <p className="text-2xl font-bold text-blue-600">{projectStats.completed}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Призупинені</p>
                <p className="text-2xl font-bold text-yellow-600">{projectStats.onHold}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Пошук проектів..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Всі статуси</SelectItem>
            <SelectItem value="Active">Активні</SelectItem>
            <SelectItem value="Completed">Завершені</SelectItem>
            <SelectItem value="On Hold">Призупинені</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProjects.map(project => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow group">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-base">{project.name}</CardTitle>
                  <CardDescription>{project.description || 'Опис проекту'}</CardDescription>
                </div>
                <Badge variant={
                  project.status === 'Active' ? 'default' :
                  project.status === 'Completed' ? 'secondary' : 'outline'
                }>
                  {project.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{new Date(project.startDate).toLocaleDateString('uk-UA')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{project.hoursSpent}г</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Прогрес</span>
                  <span>{project.progress || 0}%</span>
                </div>
                <Progress value={project.progress || 0} />
              </div>

              <div className="text-sm text-muted-foreground">
                <span>Виконавець: {project.assignedDesigner}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    console.log('View project:', project.id);
                  }}
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
                        section: 'projects', 
                        subsection: 'project-editor', 
                        id: project.id,
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
        ))}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Проекти не знайдені</h3>
          <p className="text-muted-foreground mb-4">
            Спробуйте змінити фільтри або створити новий проект
          </p>
          {context.currentUser.permissions.includes('create_modules') && (
            <Button onClick={() => navigateTo({ 
              section: 'projects', 
              subsection: 'project-editor', 
              mode: 'create' 
            })}>
              <Plus className="w-4 h-4 mr-2" />
              Створити проект
            </Button>
          )}
        </div>
      )}
    </div>
  );
}