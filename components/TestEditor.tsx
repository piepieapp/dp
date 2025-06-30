import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';
import { 
  Save, X, Plus, Trash2, Edit, Eye, CheckCircle, 
  AlertCircle, Clock, Target, HelpCircle, Settings,
  RotateCcw, Award, BarChart, Users
} from 'lucide-react';
import { AppContextType } from '../App';
import { dataStorage } from '../services/dataStorage';
import { Test as GlobalTest, Question as GlobalQuestion, LearningModule as GlobalLearningModule } from '../types';

interface TestEditorProps {
  testId?: string;
  moduleId?: string;
  mode: 'create' | 'edit';
  context: AppContextType;
  navigateTo: (nav: any) => void;
}

interface TestForm {
  title: string;
  description: string;
  instructions: string;
  passingScore: number;
  timeLimit: number; // в хвилинах
  maxAttempts: number;
  questions: Question[];
  settings: TestSettings;
  isPublished: boolean;
}

interface Question {
  id: string;
  type: 'multiple-choice' | 'multiple-select' | 'text' | 'true-false' | 'rating';
  question: string;
  explanation?: string;
  points: number;
  options?: string[];
  correctAnswers: (string | number)[];
  required: boolean;
  order: number;
}

interface TestSettings {
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showResults: boolean;
  allowReview: boolean;
  showCorrectAnswers: boolean;
  retakeAllowed: boolean;
  requirePassing: boolean;
  certificateEligible: boolean;
}

export function TestEditor({ testId, moduleId, mode, context, navigateTo }: TestEditorProps) {
  const [testForm, setTestForm] = useState<TestForm>({
    title: '',
    description: '',
    instructions: '',
    passingScore: 70,
    timeLimit: 30,
    maxAttempts: 3,
    questions: [],
    settings: {
      shuffleQuestions: false,
      shuffleOptions: true,
      showResults: true,
      allowReview: true,
      showCorrectAnswers: true,
      retakeAllowed: true,
      requirePassing: false,
      certificateEligible: false
    },
    isPublished: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && testId && moduleId) {
      setIsLoading(true);
      const modules = dataStorage.getLearningModules();
      const module = modules.find(m => m.id === moduleId);
      const test = module?.tests?.find(t => t.id === testId);

      if (test) {
        setTestForm({
          title: test.title,
          description: (test as any).description || '',
          instructions: (test as any).instructions || '',
          passingScore: test.passingScore,
          timeLimit: (test as any).timeLimit || 30,
          maxAttempts: (test as any).maxAttempts || 3,
          questions: (test.questions || []).map((q: GlobalQuestion, index: number) => {
            let correctAnswers: (string | number)[] = [];
            if (q.correctAnswer) {
              if (q.type === 'multiple-choice' || q.type === 'true-false') {
                const optIndex = (q.options || []).indexOf(q.correctAnswer);
                if (optIndex !== -1) correctAnswers = [optIndex];
              } else if (q.type === 'multiple-select' && q.options) {
                correctAnswers = q.correctAnswer.split(',').map(ca => (q.options || []).indexOf(ca)).filter(idx => idx !== -1);
              } else { // text, rating
                correctAnswers = [q.correctAnswer];
              }
            }
            return {
              id: q.id,
              type: q.type as Question['type'],
              question: q.question,
              explanation: (q as any).explanation || '',
              points: (q as any).points || 5,
              options: q.options || [],
              correctAnswers: correctAnswers,
              required: (q as any).required !== undefined ? (q as any).required : true,
              order: (q as any).order || index + 1,
            };
          }),
          settings: (test as any).settings || {
            shuffleQuestions: false,
            shuffleOptions: true,
            showResults: true,
            allowReview: true,
            showCorrectAnswers: true,
            retakeAllowed: true,
            requirePassing: false,
            certificateEligible: false
          },
          isPublished: (test as any).isPublished || false,
        });
      } else {
        context.addNotification({ title: 'Помилка', message: `Тест з ID ${testId} в модулі ${moduleId} не знайдено.`, type: 'error' });
        if (moduleId) navigateTo({ section: 'learning', subsection: 'module-editor', id: moduleId, mode: 'edit' });
        else navigateTo({ section: 'learning' });
      }
      setIsLoading(false);
    } else if (mode === 'create') {
      setTestForm({
        title: '',
        description: '',
        instructions: '',
        passingScore: 70,
        timeLimit: 30,
        maxAttempts: 3,
        questions: [],
        settings: {
          shuffleQuestions: false,
          shuffleOptions: true,
          showResults: true,
          allowReview: true,
          showCorrectAnswers: true,
          retakeAllowed: true,
          requirePassing: false,
          certificateEligible: false
        },
        isPublished: false
      });
    }
  }, [mode, testId, moduleId, context, navigateTo]);

  const handleSave = async () => {
    setIsLoading(true);
    
    if (!testForm.title || testForm.questions.length === 0) {
      context.addNotification({
        title: 'Помилка валідації',
        message: 'Додайте назву тесту та хоча б одне питання',
        type: 'error'
      });
      setIsLoading(false);
      return;
    }

    const questionsToSave: GlobalQuestion[] = testForm.questions.map(q => {
      let correctAnswerValue: string | undefined = undefined;
      if (q.correctAnswers && q.options && q.correctAnswers.length > 0) {
        if (q.type === 'multiple-choice' || q.type === 'true-false') {
          correctAnswerValue = q.options[q.correctAnswers[0] as number];
        } else if (q.type === 'multiple-select') {
          correctAnswerValue = q.correctAnswers.map(idx => q.options![idx as number]).join(',');
        }
      } else if (q.type === 'text' && q.correctAnswers.length > 0) {
         correctAnswerValue = q.correctAnswers.join(',');
      }

      return {
        id: q.id || Date.now().toString() + Math.random(),
        question: q.question,
        type: q.type,
        options: q.options,
        correctAnswer: correctAnswerValue,
        // explanation: q.explanation, // Add if defined in GlobalQuestion
        // points: q.points, // Add if defined in GlobalQuestion
        // required: q.required, // Add if defined in GlobalQuestion
        // order: q.order, // Add if defined in GlobalQuestion
      };
    });

    const testToSave: GlobalTest = {
      id: mode === 'create' ? Date.now().toString() : testId!,
      title: testForm.title,
      questions: questionsToSave,
      passingScore: testForm.passingScore,
      attempts: [], // Default to empty attempts array
      // Add other fields from TestForm if they exist in GlobalTest type
      // description: testForm.description,
      // instructions: testForm.instructions,
      // timeLimit: testForm.timeLimit,
      // maxAttempts: testForm.maxAttempts,
      // settings: testForm.settings,
      // isPublished: testForm.isPublished,
    };

    try {
      if (!moduleId) {
        context.addNotification({ title: 'Помилка', message: "ID модуля відсутній. Неможливо зберегти тест.", type: 'error' });
        setIsLoading(false);
        return;
      }
      dataStorage.saveTest(testToSave, moduleId);
      context.triggerDataRefresh(); // <--- Виклик triggerDataRefresh
      
      context.addNotification({
        title: mode === 'create' ? 'Тест створено' : 'Тест оновлено',
        message: `Тест "${testForm.title}" успішно ${mode === 'create' ? 'створено' : 'оновлено'}`,
        type: 'success'
      });

      if (moduleId) {
        navigateTo({ 
          section: 'learning', 
          subsection: 'module-editor', 
          id: moduleId, 
          mode: 'edit' 
        });
      } else {
        navigateTo({ section: 'learning' }); // Fallback
      }
    } catch (error) {
      console.error("Error saving test:", error);
      context.addNotification({
        title: 'Помилка збереження',
        message: 'Не вдалось зберегти тест',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addQuestion = (question: Omit<Question, 'id' | 'order'>) => {
    const newQuestion: Question = {
      ...question,
      id: Date.now().toString(),
      order: testForm.questions.length + 1
    };
    setTestForm(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
    setShowAddQuestion(false);
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    setTestForm(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, ...updates } : q
      )
    }));
  };

  const removeQuestion = (questionId: string) => {
    setTestForm(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const totalPoints = testForm.questions.reduce((sum, q) => sum + q.points, 0);
  const averageTimePerQuestion = testForm.questions.length > 0 ? testForm.timeLimit / testForm.questions.length : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {mode === 'create' ? 'Створити тест' : 'Редагувати тест'}
          </h1>
          <p className="text-muted-foreground">
            {mode === 'create' 
              ? 'Створіть тест для перевірки знань студентів'
              : 'Редагуйте питання та налаштування тесту'
            }
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {showPreview ? 'Редагувати' : 'Попередній перегляд'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              if (moduleId) {
                navigateTo({ 
                  section: 'learning', 
                  subsection: 'module-editor', 
                  id: moduleId, 
                  mode: 'edit' 
                });
              } else {
                navigateTo({ section: 'learning' });
              }
            }}
          >
            <X className="w-4 h-4 mr-2" />
            Скасувати
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Збереження...' : 'Зберегти'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {showPreview ? (
            /* Preview Mode */
            <TestPreview test={testForm} />
          ) : (
            /* Edit Mode */
            <Tabs defaultValue="basic" className="space-y-6">
              <TabsList>
                <TabsTrigger value="basic">Основне</TabsTrigger>
                <TabsTrigger value="questions">Питання ({testForm.questions.length})</TabsTrigger>
                <TabsTrigger value="settings">Налаштування</TabsTrigger>
              </TabsList>

              {/* Basic Tab */}
              <TabsContent value="basic">
                <Card>
                  <CardHeader>
                    <CardTitle>Загальна інформація</CardTitle>
                    <CardDescription>Основні налаштування тесту</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Назва тесту *</Label>
                      <Input
                        id="title"
                        value={testForm.title}
                        onChange={(e) => setTestForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Введіть назву тесту"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Опис тесту</Label>
                      <Textarea
                        id="description"
                        value={testForm.description}
                        onChange={(e) => setTestForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Короткий опис що перевіряє цей тест"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="instructions">Інструкції для студентів</Label>
                      <Textarea
                        id="instructions"
                        value={testForm.instructions}
                        onChange={(e) => setTestForm(prev => ({ ...prev, instructions: e.target.value }))}
                        placeholder="Детальні інструкції як проходити тест"
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label>Прохідний бал: {testForm.passingScore}%</Label>
                        <Slider
                          value={[testForm.passingScore]}
                          onValueChange={(value) => setTestForm(prev => ({ ...prev, passingScore: value[0] }))}
                          max={100}
                          min={50}
                          step={5}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Ліміт часу: {testForm.timeLimit} хв</Label>
                        <Slider
                          value={[testForm.timeLimit]}
                          onValueChange={(value) => setTestForm(prev => ({ ...prev, timeLimit: value[0] }))}
                          max={120}
                          min={10}
                          step={5}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Максимум спроб: {testForm.maxAttempts}</Label>
                        <Slider
                          value={[testForm.maxAttempts]}
                          onValueChange={(value) => setTestForm(prev => ({ ...prev, maxAttempts: value[0] }))}
                          max={10}
                          min={1}
                          step={1}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Questions Tab */}
              <TabsContent value="questions">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Питання тесту</CardTitle>
                        <CardDescription>Створіть питання різних типів</CardDescription>
                      </div>
                      <Button onClick={() => setShowAddQuestion(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Додати питання
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {testForm.questions.length > 0 ? (
                      <div className="space-y-4">
                        {testForm.questions.map((question, index) => (
                          <QuestionCard
                            key={question.id}
                            question={question}
                            index={index}
                            onEdit={() => setEditingQuestion(question)}
                            onDelete={() => removeQuestion(question.id)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-medium mb-2">Немає питань</h3>
                        <p className="text-muted-foreground mb-4">Додайте перше питання до тесту</p>
                        <Button onClick={() => setShowAddQuestion(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Додати питання
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Налаштування тесту</CardTitle>
                    <CardDescription>Поведінка та відображення тесту</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Перемішувати питання</Label>
                          <p className="text-sm text-muted-foreground">Показувати питання в випадковому порядку</p>
                        </div>
                        <Switch
                          checked={testForm.settings.shuffleQuestions}
                          onCheckedChange={(checked) => 
                            setTestForm(prev => ({
                              ...prev,
                              settings: { ...prev.settings, shuffleQuestions: checked }
                            }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Перемішувати варіанти</Label>
                          <p className="text-sm text-muted-foreground">Змінювати порядок варіантів відповідей</p>
                        </div>
                        <Switch
                          checked={testForm.settings.shuffleOptions}
                          onCheckedChange={(checked) => 
                            setTestForm(prev => ({
                              ...prev,
                              settings: { ...prev.settings, shuffleOptions: checked }
                            }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Показувати результати</Label>
                          <p className="text-sm text-muted-foreground">Відображати бал після завершення</p>
                        </div>
                        <Switch
                          checked={testForm.settings.showResults}
                          onCheckedChange={(checked) => 
                            setTestForm(prev => ({
                              ...prev,
                              settings: { ...prev.settings, showResults: checked }
                            }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Дозволити перегляд</Label>
                          <p className="text-sm text-muted-foreground">Можливість переглянути відповіді</p>
                        </div>
                        <Switch
                          checked={testForm.settings.allowReview}
                          onCheckedChange={(checked) => 
                            setTestForm(prev => ({
                              ...prev,
                              settings: { ...prev.settings, allowReview: checked }
                            }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Показувати правильні відповіді</Label>
                          <p className="text-sm text-muted-foreground">Відображати правильні варіанти після тесту</p>
                        </div>
                        <Switch
                          checked={testForm.settings.showCorrectAnswers}
                          onCheckedChange={(checked) => 
                            setTestForm(prev => ({
                              ...prev,
                              settings: { ...prev.settings, showCorrectAnswers: checked }
                            }))
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Test Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Статистика тесту</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{testForm.questions.length}</div>
                  <div className="text-xs text-muted-foreground">Питань</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{totalPoints}</div>
                  <div className="text-xs text-muted-foreground">Балів</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Ліміт часу:</span>
                  <span>{testForm.timeLimit} хв</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>На питання:</span>
                  <span>~{averageTimePerQuestion.toFixed(1)} хв</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Прохідний бал:</span>
                  <span>{testForm.passingScore}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Максимум спроб:</span>
                  <span>{testForm.maxAttempts}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Validation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Перевірка</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                {testForm.title ? 
                  <CheckCircle className="w-4 h-4 text-green-500" /> : 
                  <AlertCircle className="w-4 h-4 text-red-500" />
                }
                <span className="text-sm">Назва тесту</span>
              </div>
              <div className="flex items-center gap-2">
                {testForm.questions.length > 0 ? 
                  <CheckCircle className="w-4 h-4 text-green-500" /> : 
                  <AlertCircle className="w-4 h-4 text-red-500" />
                }
                <span className="text-sm">Питання ({testForm.questions.length})</span>
              </div>
              <div className="flex items-center gap-2">
                {testForm.instructions ? 
                  <CheckCircle className="w-4 h-4 text-green-500" /> : 
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                }
                <span className="text-sm">Інструкції</span>
              </div>
              <div className="flex items-center gap-2">
                {testForm.passingScore >= 50 ? 
                  <CheckCircle className="w-4 h-4 text-green-500" /> : 
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                }
                <span className="text-sm">Прохідний бал</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <Button variant="outline" className="w-full">
                <BarChart className="w-4 h-4 mr-2" />
                Аналітика тесту
              </Button>
              <Button variant="outline" className="w-full">
                <Users className="w-4 h-4 mr-2" />
                Результати студентів
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Question Dialog */}
      <AddQuestionDialog 
        open={showAddQuestion} 
        onOpenChange={setShowAddQuestion}
        onAdd={addQuestion}
      />

      {/* Edit Question Dialog */}
      {editingQuestion && (
        <EditQuestionDialog 
          question={editingQuestion}
          onSave={(updates) => {
            updateQuestion(editingQuestion.id, updates);
            setEditingQuestion(null);
          }}
          onClose={() => setEditingQuestion(null)}
        />
      )}
    </div>
  );
}

// Helper Components
function QuestionCard({ question, index, onEdit, onDelete }: {
  question: Question;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'multiple-choice': return 'Один варіант';
      case 'multiple-select': return 'Кілька варіантів';
      case 'text': return 'Текстова відповідь';
      case 'true-false': return 'Так/Ні';
      case 'rating': return 'Оцінка';
      default: return type;
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">
            {index + 1}
          </div>
          <div className="flex-1">
            <h4 className="font-medium">{question.question}</h4>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{getTypeLabel(question.type)}</Badge>
              <Badge variant="secondary">{question.points} балів</Badge>
              {question.required && <Badge variant="destructive" className="text-xs">Обов'язкове</Badge>}
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={onEdit}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {question.options && question.options.length > 0 && (
        <div className="space-y-1 text-sm text-muted-foreground">
          {question.options.map((option, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded border ${
                question.correctAnswers.includes(i) ? 'bg-green-500 border-green-500' : 'border-gray-300'
              }`} />
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TestPreview({ test }: { test: TestForm }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          <CardTitle>{test.title}</CardTitle>
        </div>
        <CardDescription>{test.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {test.instructions && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium mb-2">Інструкції:</h4>
            <p className="text-sm">{test.instructions}</p>
          </div>
        )}
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="font-medium">{test.questions.length}</div>
            <div className="text-sm text-muted-foreground">Питань</div>
          </div>
          <div>
            <div className="font-medium">{test.timeLimit} хв</div>
            <div className="text-sm text-muted-foreground">Час</div>
          </div>
          <div>
            <div className="font-medium">{test.passingScore}%</div>
            <div className="text-sm text-muted-foreground">Прохідний бал</div>
          </div>
        </div>

        <div className="space-y-4">
          {test.questions.map((question, index) => (
            <div key={question.id} className="p-4 border rounded-lg">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{question.question}</h4>
                  <div className="text-sm text-muted-foreground">
                    {question.points} балів
                  </div>
                </div>
              </div>
              
              {question.options && (
                <div className="space-y-2 ml-9">
                  {question.options.map((option, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded border border-gray-300" />
                      <span className="text-sm">{option}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AddQuestionDialog({ open, onOpenChange, onAdd }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (question: Omit<Question, 'id' | 'order'>) => void;
}) {
  const [questionForm, setQuestionForm] = useState({
    type: 'multiple-choice' as Question['type'],
    question: '',
    explanation: '',
    points: 5,
    options: ['', '', '', ''],
    correctAnswers: [] as number[],
    required: true
  });

  const handleSubmit = () => {
    if (questionForm.question.trim()) {
      onAdd({
        ...questionForm,
        options: questionForm.options.filter(opt => opt.trim() !== ''),
      });
      // Reset form
      setQuestionForm({
        type: 'multiple-choice',
        question: '',
        explanation: '',
        points: 5,
        options: ['', '', '', ''],
        correctAnswers: [],
        required: true
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Додати питання</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Тип питання</Label>
              <Select 
                value={questionForm.type} 
                onValueChange={(value: any) => setQuestionForm(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple-choice">Один варіант</SelectItem>
                  <SelectItem value="multiple-select">Кілька варіантів</SelectItem>
                  <SelectItem value="text">Текстова відповідь</SelectItem>
                  <SelectItem value="true-false">Так/Ні</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Балів за питання</Label>
              <Input
                type="number"
                value={questionForm.points}
                onChange={(e) => setQuestionForm(prev => ({ 
                  ...prev, 
                  points: parseInt(e.target.value) || 5 
                }))}
                min="1"
                max="20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Текст питання</Label>
            <Textarea
              value={questionForm.question}
              onChange={(e) => setQuestionForm(prev => ({ ...prev, question: e.target.value }))}
              placeholder="Введіть текст питання..."
            />
          </div>

          {(questionForm.type === 'multiple-choice' || questionForm.type === 'multiple-select') && (
            <div className="space-y-3">
              <Label>Варіанти відповідей</Label>
              {questionForm.options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Checkbox
                    checked={questionForm.correctAnswers.includes(index)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setQuestionForm(prev => ({
                          ...prev,
                          correctAnswers: questionForm.type === 'multiple-choice' 
                            ? [index] 
                            : [...prev.correctAnswers, index]
                        }));
                      } else {
                        setQuestionForm(prev => ({
                          ...prev,
                          correctAnswers: prev.correctAnswers.filter(i => i !== index)
                        }));
                      }
                    }}
                  />
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...questionForm.options];
                      newOptions[index] = e.target.value;
                      setQuestionForm(prev => ({ ...prev, options: newOptions }));
                    }}
                    placeholder={`Варіант ${index + 1}`}
                  />
                </div>
              ))}
              <div className="text-xs text-muted-foreground">
                Відмітьте правильні варіанти
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSubmit}>Додати питання</Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Скасувати</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EditQuestionDialog({ question, onSave, onClose }: {
  question: Question;
  onSave: (updates: Partial<Question>) => void;
  onClose: () => void;
}) {
  const [questionForm, setQuestionForm] = useState(question);

  const handleSave = () => {
    onSave(questionForm);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Редагувати питання</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Текст питання</Label>
            <Textarea
              value={questionForm.question}
              onChange={(e) => setQuestionForm(prev => ({ ...prev, question: e.target.value }))}
            />
          </div>

          {questionForm.options && (
            <div className="space-y-3">
              <Label>Варіанти відповідей</Label>
              {questionForm.options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Checkbox
                    checked={questionForm.correctAnswers.includes(index)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setQuestionForm(prev => ({
                          ...prev,
                          correctAnswers: [...prev.correctAnswers, index]
                        }));
                      } else {
                        setQuestionForm(prev => ({
                          ...prev,
                          correctAnswers: prev.correctAnswers.filter(i => i !== index)
                        }));
                      }
                    }}
                  />
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...questionForm.options!];
                      newOptions[index] = e.target.value;
                      setQuestionForm(prev => ({ ...prev, options: newOptions }));
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave}>Зберегти зміни</Button>
            <Button variant="outline" onClick={onClose}>Скасувати</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}