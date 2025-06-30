import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { TrendingUp, TrendingDown, Users, Target, Clock, Award } from 'lucide-react';
import { AppContextType } from '../App';
import { mockDesigners } from '../services/mockData';
import { Chart, ChartContainer, ChartTooltip, ChartTooltipContent } from './ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsProps {
  context: AppContextType;
}

const performanceData = [
  { month: 'Січ', productivity: 85, quality: 88, efficiency: 82 },
  { month: 'Лют', productivity: 87, quality: 90, efficiency: 85 },
  { month: 'Бер', productivity: 83, quality: 85, efficiency: 79 },
  { month: 'Квіт', productivity: 89, quality: 92, efficiency: 88 },
  { month: 'Тра', productivity: 91, quality: 94, efficiency: 89 },
  { month: 'Чер', productivity: 88, quality: 89, efficiency: 86 }
];

export function Analytics({ context }: AnalyticsProps) {
  const totalDesigners = mockDesigners.length;
  const avgProductivity = Math.round(mockDesigners.reduce((sum, d) => sum + d.kpis.productivity, 0) / totalDesigners);
  const avgQuality = Math.round(mockDesigners.reduce((sum, d) => sum + d.kpis.quality, 0) / totalDesigners);
  const avgEfficiency = Math.round(mockDesigners.reduce((sum, d) => sum + d.efficiency, 0) / totalDesigners);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>Аналітика команди</h1>
        <p className="text-muted-foreground">Детальна аналітика продуктивності та розвитку дизайнерів</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
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
              <Award className="w-4 h-4" />
              Якість
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgQuality}%</div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="w-3 h-3 text-green-600" />
              <span className="text-green-600">+3% за місяць</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Ефективність
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgEfficiency}%</div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingDown className="w-3 h-3 text-red-600" />
              <span className="text-red-600">-2% за місяць</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Огляд</TabsTrigger>
          <TabsTrigger value="performance">Продуктивність</TabsTrigger>
          <TabsTrigger value="skills">Навички</TabsTrigger>
          <TabsTrigger value="growth">Розвиток</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Динаміка показників</CardTitle>
                <CardDescription>Зміна ключових метрик за останні 6 місяців</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{
                  productivity: { label: 'Продуктивність', color: 'hsl(var(--chart-1))' },
                  quality: { label: 'Якість', color: 'hsl(var(--chart-2))' },
                  efficiency: { label: 'Ефективність', color: 'hsl(var(--chart-3))' }
                }} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="productivity" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                      <Line type="monotone" dataKey="quality" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                      <Line type="monotone" dataKey="efficiency" stroke="hsl(var(--chart-3))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Розподіл по рівнях</CardTitle>
                <CardDescription>Кількість дизайнерів за рівнями досвіду</CardDescription>
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
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Індивідуальна продуктивність</CardTitle>
              <CardDescription>KPI показники кожного дизайнера</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockDesigners.map(designer => (
                  <div key={designer.id} className="p-4 border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors"
                       onClick={() => context.setRightPanel({ 
                         isOpen: true, 
                         type: 'designer', 
                         data: designer, 
                         mode: 'view' 
                       })}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <img 
                          src={designer.avatar} 
                          alt={designer.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <h4 className="font-medium">{designer.name}</h4>
                          <p className="text-sm text-muted-foreground">{designer.position}</p>
                        </div>
                      </div>
                      <Badge variant={designer.level === 'Senior' ? 'default' : designer.level === 'Middle' ? 'secondary' : 'outline'}>
                        {designer.level}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Продуктивність</div>
                        <div className="font-medium">{designer.kpis.productivity}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Якість</div>
                        <div className="font-medium">{designer.kpis.quality}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Ефективність</div>
                        <div className="font-medium">{designer.efficiency}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Загальний KPI</div>
                        <div className="font-medium">{designer.kpis.overallScore}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Розвиток навичок</CardTitle>
              <CardDescription>Прогрес розвитку ключових навичок команди</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Target className="w-12 h-12 mx-auto mb-4" />
                <p>Детальна аналітика навичок</p>
                <p className="text-sm mt-2">Перейдіть до розділу "Матриця навичок" для детального аналізу</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="growth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Навчання та розвиток</CardTitle>
              <CardDescription>Статистика завершення навчальних модулів</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Award className="w-12 h-12 mx-auto mb-4" />
                <p>Аналітика навчання</p>
                <p className="text-sm mt-2">Статистика та звіти по навчальних програмах</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}