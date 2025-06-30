import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Search, Users, Target, TrendingUp, Edit, Eye } from 'lucide-react';
import { AppContextType } from '../App';
import { dataStorage } from '../services/dataStorage';
import { Skill, Designer, SkillRating } from '../types';

interface SkillsMatrixProps {
  context: AppContextType;
  navigateTo: (nav: any) => void;
  currentNavigation: any;
}

export function SkillsMatrix({ context, navigateTo }: SkillsMatrixProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [designers, setDesigners] = useState<Designer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    setIsLoading(true);
    const skillsData = dataStorage.getSkills();
    const designersData = dataStorage.getDesigners();

    setSkills(skillsData || []);
    setDesigners(designersData || []);
    setIsLoading(false);
  }, [context.dataVersion]); // Додано context.dataVersion

  const filteredSkills = skills.filter(skill => {
    const name = skill.name || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || skill.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getSkillStats = (skill: Skill) => {
    const allRatings = designers.flatMap(designer =>
      (designer.skills || []).filter(s => s.skillId === skill.id)
    );
    
    const avgLevel = allRatings.length > 0 ? 
      Math.round(allRatings.reduce((sum, rating) => sum + (rating.level || rating.currentLevel || 0), 0) / allRatings.length) : 0;
    
    const designersWithSkill = allRatings.length;
    const skillGap = designers.length - designersWithSkill;
    
    return { avgLevel, designersWithSkill, skillGap };
  };

  const categories = ['all', ...Array.from(new Set(skills.map(s => s.category)))];

  const overallStats = {
    totalSkills: skills.length,
    avgLevel: skills.length > 0
      ? Math.round(skills.reduce((sum, skill) => {
          const stats = getSkillStats(skill);
          return sum + stats.avgLevel;
        }, 0) / (skills.length || 1))
      : 0,
    coverage: skills.length > 0 && designers.length > 0
      ? Math.round(
          (skills.reduce((sum, skill) => sum + getSkillStats(skill).designersWithSkill, 0) /
          (skills.length * designers.length)) * 100
        )
      : 0,
    skillGaps: skills.reduce((sum, skill) => sum + getSkillStats(skill).skillGap, 0)
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Завантаження матриці навичок...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Матриця навичок</h1>
          <p className="text-muted-foreground">Відстеження та розвиток компетенцій команди</p>
        </div>
        {context.currentUser.permissions.includes('edit_skills') && (
          <Button onClick={() => navigateTo({ 
            section: 'skills', 
            subsection: 'skill-editor', 
            mode: 'create' 
          })}>
            <Plus className="w-4 h-4 mr-2" />
            Додати навичку
          </Button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Всього навичок</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.totalSkills}</div>
            <p className="text-xs text-muted-foreground">
              {categories.length - 1} категорій
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Середній рівень</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overallStats.avgLevel}%
            </div>
            <p className="text-xs text-muted-foreground">
              З максимального 100%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Покриття команди</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overallStats.coverage}%
            </div>
            <p className="text-xs text-muted-foreground">
              Дизайнери мають навички
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Пробіли в навичках</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {overallStats.skillGaps}
            </div>
            <p className="text-xs text-muted-foreground">
              Потребують розвитку
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Пошук навичок..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Категорія" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Всі категорії</SelectItem>
            {categories.slice(1).map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSkills.map(skill => {
          const stats = getSkillStats(skill);
          return (
            <Card key={skill.id} className="hover:shadow-lg transition-shadow group">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-base">{skill.name}</CardTitle>
                    <CardDescription>{skill.description}</CardDescription>
                  </div>
                  <Badge variant="outline">{skill.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Середній рівень</span>
                  <span className="font-semibold">{stats.avgLevel}%</span>
                </div>
                <Progress value={stats.avgLevel} />
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-600" />
                    <span className="text-muted-foreground">Мають:</span>
                    <span className="font-medium">{stats.designersWithSkill}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-red-600" />
                    <span className="text-muted-foreground">Пробіл:</span>
                    <span className="font-medium">{stats.skillGap}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      // Navigate to skill details view
                      console.log('View skill details:', skill.id);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Переглянути
                  </Button>
                  {context.currentUser.permissions.includes('edit_skills') && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateTo({ 
                          section: 'skills', 
                          subsection: 'skill-editor', 
                          id: skill.id,
                          mode: 'edit' 
                        });
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                   {context.currentUser.permissions.includes('edit_skills') && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700 hover:bg-red-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Ви впевнені, що хочете видалити навичку "${skill.name}"? Це також видалить її у всіх дизайнерів.`)) {
                          dataStorage.deleteSkill(skill.id);
                          context.triggerDataRefresh();
                          context.addNotification({
                            title: 'Навичку видалено',
                            message: `Навичка "${skill.name}" була успішно видалена.`,
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
      {filteredSkills.length === 0 && (
        <div className="text-center py-12">
          <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Навички не знайдені</h3>
          <p className="text-muted-foreground mb-4">
            Спробуйте змінити фільтри або додати нову навичку
          </p>
          {context.currentUser.permissions.includes('edit_skills') && (
            <Button onClick={() => navigateTo({ 
              section: 'skills', 
              subsection: 'skill-editor', 
              mode: 'create' 
            })}>
              <Plus className="w-4 h-4 mr-2" />
              Додати навичку
            </Button>
          )}
        </div>
      )}

      {/* Detailed Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Детальна матриця навичок</CardTitle>
          <CardDescription>Навички кожного дизайнера по категоріям</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Дизайнер</th>
                  {filteredSkills.map(skill => (
                    <th key={skill.id} className="text-center p-2 min-w-24">
                      <div className="font-medium text-sm">{skill.name}</div>
                      <div className="text-xs text-muted-foreground">{skill.category}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {designers.map(designer => (
                  <tr key={designer.id} className="border-b hover:bg-secondary/50 cursor-pointer"
                      onClick={() => navigateTo({ 
                        section: 'designers', 
                        subsection: 'designer-profile', 
                        id: designer.id 
                      })}>
                    <td className="p-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={designer.avatar} alt={designer.name} />
                          <AvatarFallback>{designer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{designer.name}</div>
                          <div className="text-xs text-muted-foreground">{designer.position}</div>
                        </div>
                      </div>
                    </td>
                    {filteredSkills.map(skill => {
                      const skillRating = (designer.skills || []).find(s => s.skillId === skill.id);
                      return (
                        <td key={skill.id} className="text-center p-2">
                          {skillRating ? (
                            <div className="space-y-1">
                              <div className="text-sm font-medium">
                                {skillRating.level || skillRating.currentLevel || 0}%
                              </div>
                              <div className="w-full bg-secondary rounded-full h-1">
                                <div 
                                  className="bg-primary h-1 rounded-full" 
                                  style={{ width: `${skillRating.level || skillRating.currentLevel || 0}%` }}
                                />
                              </div>
                              {(skillRating.targetLevel || 0) > (skillRating.level || skillRating.currentLevel || 0) && (
                                <div className="text-xs text-muted-foreground">
                                  → {skillRating.targetLevel}%
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground">—</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}