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
import { X, Edit2, Save, Users, Target, TrendingUp } from 'lucide-react';
import { Skill } from '../../types';
import { AppContextType } from '../../App';
import { mockDesigners } from '../../services/mockData';
import { toast } from 'sonner@2.0.3';

interface SkillPanelProps {
  context: AppContextType;
  onClose: () => void;
}

export function SkillPanel({ context, onClose }: SkillPanelProps) {
  const { rightPanel, setRightPanel, addNotification } = context;
  const skill = rightPanel.data as Skill;
  const isEditing = rightPanel.mode === 'edit';
  const isCreating = rightPanel.mode === 'create';
  
  const [formData, setFormData] = useState({
    name: skill?.name || '',
    category: skill?.category || 'Design',
    description: skill?.description || '',
    maxLevel: skill?.maxLevel || 5,
  });

  const handleSave = () => {
    toast.success(isCreating ? 'Навичку створено успішно!' : 'Зміни збережено!');
    addNotification({
      title: isCreating ? 'Нова навичка' : 'Оновлення навички',
      message: `Навичка "${formData.name}" ${isCreating ? 'створена' : 'оновлена'}`,
      type: 'success'
    });
    setRightPanel({ mode: 'view', data: { ...skill, ...formData } });
  };

  const getSkillStats = () => {
    const allRatings = mockDesigners.flatMap(designer => 
      designer.skills.filter(s => s.skillId === skill?.id)
    );
    
    const avgLevel = allRatings.length > 0 ? 
      Math.round(allRatings.reduce((sum, rating) => sum + rating.currentLevel, 0) / allRatings.length * 10) / 10 : 0;
    
    const designersWithSkill = allRatings.length;
    const designersWithoutSkill = mockDesigners.length - designersWithSkill;
    
    const levelDistribution = [1, 2, 3, 4, 5].map(level => ({
      level,
      count: allRatings.filter(rating => rating.currentLevel === level).length
    }));

    return {
      avgLevel,
      designersWithSkill,
      designersWithoutSkill,
      levelDistribution,
      totalDesigners: mockDesigners.length
    };
  };

  const stats = skill ? getSkillStats() : null;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold">{isCreating ? 'Нова навичка' : formData.name}</h3>
            <p className="text-sm text-muted-foreground">{formData.category}</p>
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

        {/* Stats */}
        {stats && !isEditing && !isCreating && (
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold">{stats.avgLevel}/{skill.maxLevel}</div>
              <div className="text-xs text-muted-foreground">Середній рівень</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{stats.designersWithSkill}</div>
              <div className="text-xs text-muted-foreground">Мають навичку</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{stats.designersWithoutSkill}</div>
              <div className="text-xs text-muted-foreground">Не мають</div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {isEditing || isCreating ? (
            <EditSkillForm formData={formData} setFormData={setFormData} />
          ) : (
            <ViewSkillMode skill={skill} stats={stats} context={context} />
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function EditSkillForm({ formData, setFormData }: any) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Інформація про навичку</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Назва навички</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Наприклад: UI Design"
            />
          </div>
          <div>
            <Label htmlFor="category">Категорія</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Design">Design</SelectItem>
                <SelectItem value="Research">Research</SelectItem>
                <SelectItem value="Tools">Tools</SelectItem>
                <SelectItem value="Development">Development</SelectItem>
                <SelectItem value="Leadership">Leadership</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description">Опис</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Опишіть навичку та її важливість"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="maxLevel">Максимальний рівень</Label>
            <Select value={formData.maxLevel.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, maxLevel: parseInt(value) }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 рівні</SelectItem>
                <SelectItem value="5">5 рівнів</SelectItem>
                <SelectItem value="10">10 рівнів</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ViewSkillMode({ skill, stats, context }: { skill: Skill; stats: any; context: AppContextType }) {
  if (!skill) return <div>Навичку не знайдено</div>;

  const designersWithSkill = mockDesigners.filter(designer => 
    designer.skills.some(s => s.skillId === skill.id)
  );

  const designersWithoutSkill = mockDesigners.filter(designer => 
    !designer.skills.some(s => s.skillId === skill.id)
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Про навичку</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm">{skill.description}</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Категорія:</span>
              <Badge variant="outline" className="ml-2">{skill.category}</Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Макс. рівень:</span>
              <span className="ml-2 font-semibold">{skill.maxLevel}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Розподіл по рівнях</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.levelDistribution.map(({ level, count }) => (
                <div key={level} className="flex items-center justify-between">
                  <span className="text-sm">Рівень {level}</span>
                  <div className="flex items-center gap-2 flex-1 max-w-32">
                    <Progress value={(count / stats.totalDesigners) * 100} className="flex-1" />
                    <span className="text-sm w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Дизайнери з навичкою ({designersWithSkill.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {designersWithSkill.map(designer => {
              const skillRating = designer.skills.find(s => s.skillId === skill.id);
              return (
                <div key={designer.id} 
                     className="flex items-center justify-between p-3 bg-secondary/50 rounded cursor-pointer hover:bg-secondary/70 transition-colors"
                     onClick={() => context.setRightPanel({ type: 'designer', data: designer, mode: 'view' })}>
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
                  <div className="flex items-center gap-3 text-sm">
                    <div className="text-right">
                      <div className="font-medium">{skillRating?.currentLevel}/{skill.maxLevel}</div>
                      {skillRating && skillRating.targetLevel > skillRating.currentLevel && (
                        <div className="text-xs text-muted-foreground">
                          → {skillRating.targetLevel}
                        </div>
                      )}
                    </div>
                    <div className="w-16">
                      <Progress value={((skillRating?.currentLevel || 0) / skill.maxLevel) * 100} className="h-2" />
                    </div>
                  </div>
                </div>
              );
            })}
            {designersWithSkill.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Жоден дизайнер не має цієї навички
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {designersWithoutSkill.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Дизайнери без навички ({designersWithoutSkill.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {designersWithoutSkill.map(designer => (
                <Badge key={designer.id} variant="outline" className="cursor-pointer hover:bg-secondary"
                       onClick={() => context.setRightPanel({ type: 'designer', data: designer, mode: 'view' })}>
                  {designer.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}