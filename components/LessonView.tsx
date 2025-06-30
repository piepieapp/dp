import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Checkbox } from './ui/checkbox';
import { Textarea } from './ui/textarea';
import { 
  Play, Pause, SkipForward, SkipBack, Volume2, 
  CheckCircle, BookOpen, MessageSquare, Flag,
  Clock, Target, Award, Download, Share
} from 'lucide-react';
import { AppContextType } from '../App';

interface LessonViewProps {
  lesson: any;
  context: AppContextType;
  navigateTo: (nav: any) => void;
}

export function LessonView({ lesson, context, navigateTo }: LessonViewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [notes, setNotes] = useState('');
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  // Mock lesson data
  const lessonData = {
    id: lesson.id,
    title: lesson.title,
    description: lesson.content,
    type: lesson.type,
    duration: lesson.duration,
    transcript: `
      Ласкаво просимо до уроку з UX дослідження. 
      
      У цьому уроку ми розглянемо:
      - Основні принципи UX дослідження
      - Методи збору даних
      - Аналіз результатів
      - Практичні приклади
      
      Давайте почнемо з основ...
    `,
    checklist: [
      { id: '1', text: 'Переглянути відео повністю', completed: false },
      { id: '2', text: 'Прочитати додаткові матеріали', completed: false },
      { id: '3', text: 'Зробити нотатки ключових моментів', completed: false },
      { id: '4', text: 'Виконати практичне завдання', completed: false }
    ],
    resources: [
      { id: '1', title: 'Слайди презентації', type: 'pdf', url: '#' },
      { id: '2', title: 'Шаблон для дослідження', type: 'template', url: '#' },
      { id: '3', title: 'Приклади кейсів', type: 'link', url: '#' }
    ],
    quiz: {
      questions: [
        {
          id: '1',
          question: 'Що є основною метою UX дослідження?',
          options: [
            'Створення красивого дизайну',
            'Розуміння потреб користувачів',
            'Збільшення продажів',
            'Покращення технічних характеристик'
          ],
          correct: 1
        },
        {
          id: '2',
          question: 'Який метод найкращий для збору якісних даних?',
          options: [
            'Опитування',
            'A/B тестування',
            'Інтерв\'ю',
            'Веб-аналітика'
          ],
          correct: 2
        }
      ]
    }
  };

  const totalDuration = 900; // 15 minutes in seconds
  const progress = (currentTime / totalDuration) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChecklistChange = (id: string, checked: boolean) => {
    setChecklist(prev => ({ ...prev, [id]: checked }));
  };

  const completedTasks = Object.values(checklist).filter(Boolean).length;
  const totalTasks = lessonData.checklist.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{lessonData.title}</h1>
            <Badge variant="secondary">{lessonData.type}</Badge>
          </div>
          <p className="text-lg text-muted-foreground">{lessonData.description}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {lessonData.duration}
            </div>
            <div className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              {completedTasks}/{totalTasks} завдань завершено
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Share className="w-4 h-4 mr-2" />
            Поділитися
          </Button>
          <Button variant="outline" size="sm">
            <Flag className="w-4 h-4 mr-2" />
            Позначити
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video/Content Player */}
          <Card>
            <CardContent className="p-0">
              {lessonData.type === 'video' ? (
                <div className="relative">
                  <div className="aspect-video bg-black rounded-t-lg flex items-center justify-center">
                    <div className="text-white text-center">
                      <Play className="w-16 h-16 mx-auto mb-4 opacity-80" />
                      <p>Відео контент</p>
                      <p className="text-sm opacity-60">Тривалість: {lessonData.duration}</p>
                    </div>
                  </div>
                  
                  {/* Video Controls */}
                  <div className="p-4 space-y-3">
                    <Progress value={progress} />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsPlaying(!isPlaying)}
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <Button size="sm" variant="ghost">
                          <SkipBack className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <SkipForward className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Volume2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatTime(currentTime)} / {formatTime(totalDuration)}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <div className="prose max-w-none">
                    <p>{lessonData.transcript}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lesson Content Tabs */}
          <Tabs defaultValue="transcript" className="space-y-4">
            <TabsList>
              <TabsTrigger value="transcript">Транскрипт</TabsTrigger>
              <TabsTrigger value="resources">Ресурси</TabsTrigger>
              <TabsTrigger value="quiz">Тест</TabsTrigger>
              <TabsTrigger value="notes">Нотатки</TabsTrigger>
            </TabsList>

            <TabsContent value="transcript">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Текст уроку</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-line">{lessonData.transcript}</div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resources">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lessonData.resources.map(resource => (
                  <Card key={resource.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <BookOpen className="w-5 h-5 text-blue-500" />
                          <div>
                            <h4 className="font-medium">{resource.title}</h4>
                            <Badge variant="outline" className="text-xs mt-1">
                              {resource.type.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="quiz">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Перевірка знань</CardTitle>
                  <CardDescription>Відповідайте на питання щоб перевірити розуміння матеріалу</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {lessonData.quiz.questions.map((question, index) => (
                    <div key={question.id} className="space-y-3">
                      <h4 className="font-medium">
                        {index + 1}. {question.question}
                      </h4>
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center space-x-2">
                            <Checkbox id={`q${question.id}-${optionIndex}`} />
                            <label 
                              htmlFor={`q${question.id}-${optionIndex}`}
                              className="text-sm cursor-pointer"
                            >
                              {option}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <Button className="w-full">Перевірити відповіді</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Мої нотатки</CardTitle>
                  <CardDescription>Записуйте важливі моменти для майбутнього використання</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Додайте свої нотатки..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[200px]"
                  />
                  <Button className="mt-4">Зберегти нотатки</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Прогрес уроку</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {Math.round((completedTasks / totalTasks) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Завершено</div>
              </div>
              <Progress value={(completedTasks / totalTasks) * 100} />
              <div className="text-xs text-muted-foreground text-center">
                {completedTasks} з {totalTasks} завдань
              </div>
            </CardContent>
          </Card>

          {/* Checklist */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Список завдань</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lessonData.checklist.map(item => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={item.id}
                      checked={checklist[item.id] || false}
                      onCheckedChange={(checked) => handleChecklistChange(item.id, checked as boolean)}
                    />
                    <label 
                      htmlFor={item.id}
                      className={`text-sm cursor-pointer flex-1 ${
                        checklist[item.id] ? 'line-through text-muted-foreground' : ''
                      }`}
                    >
                      {item.text}
                    </label>
                    {checklist[item.id] && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <Button 
                className="w-full"
                onClick={() => {
                  context.addNotification({
                    title: 'Урок завершено',
                    message: `Урок "${lessonData.title}" позначено як завершений`,
                    type: 'success'
                  });
                }}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Завершити урок
              </Button>
              <Button variant="outline" className="w-full">
                <MessageSquare className="w-4 h-4 mr-2" />
                Залишити відгук
              </Button>
              <Button variant="outline" className="w-full">
                <Award className="w-4 h-4 mr-2" />
                Отримати сертифікат
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}