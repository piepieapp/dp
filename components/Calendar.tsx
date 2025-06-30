import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Calendar as CalendarIcon, Plus, Clock, Users, MapPin, Video, ExternalLink, Settings, RefreshCw } from 'lucide-react';
import { AppContextType } from '../App';
import { mockDesigners } from '../services/mockData';
import { toast } from 'sonner@2.0.3';

interface CalendarProps {
  context: AppContextType;
}

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start: string;
  end: string;
  type: 'meeting' | 'review' | 'training' | 'deadline' | 'personal';
  attendees: string[];
  location?: string;
  meetingLink?: string;
  createdBy: string;
  isGoogleEvent?: boolean;
  googleEventId?: string;
}

const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Design Review: Mobile App',
    description: 'Перегляд дизайну мобільного додатку з командою розробки',
    start: '2024-12-26T14:00:00',
    end: '2024-12-26T15:30:00',
    type: 'review',
    attendees: ['1', '2'],
    location: 'Конференц-зал А',
    meetingLink: 'https://meet.google.com/abc-def-ghi',
    createdBy: '1',
    isGoogleEvent: true,
    googleEventId: 'google_event_123'
  },
  {
    id: '2',
    title: 'UX Research Planning',
    description: 'Планування дослідження користувачів для нового проекту',
    start: '2024-12-27T10:00:00',
    end: '2024-12-27T11:00:00',
    type: 'meeting',
    attendees: ['2', '3'],
    meetingLink: 'https://meet.google.com/xyz-123-456',
    createdBy: '2'
  },
  {
    id: '3',
    title: 'Design System Workshop',
    description: 'Навчальний семінар з дизайн системи',
    start: '2024-12-28T13:00:00',
    end: '2024-12-28T16:00:00',
    type: 'training',
    attendees: ['1', '2', '3'],
    location: 'Навчальна кімната',
    createdBy: '1'
  },
  {
    id: '4',
    title: 'Project Deadline: Landing Page',
    description: 'Дедлайн здачі лендінг сторінки',
    start: '2024-12-29T17:00:00',
    end: '2024-12-29T17:00:00',
    type: 'deadline',
    attendees: ['3'],
    createdBy: '3'
  }
];

export function Calendar({ context }: CalendarProps) {
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [googleSyncEnabled, setGoogleSyncEnabled] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState(new Date());

  const handleGoogleSync = () => {
    toast.success('Синхронізація з Google Calendar завершена');
    setLastSyncTime(new Date());
    context.addNotification({
      title: 'Google Calendar синхронізовано',
      message: 'Отримано 3 нові події з Google Calendar',
      type: 'success'
    });
  };

  const handleCreateEvent = (eventData: any) => {
    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      ...eventData,
      createdBy: '1' // Current user
    };
    setEvents(prev => [...prev, newEvent]);
    toast.success('Подію створено успішно!');
    context.addNotification({
      title: 'Нова подія створена',
      message: `"${eventData.title}" додано до календаря`,
      type: 'info'
    });
    setShowCreateDialog(false);
  };

  const getEventTypeColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'meeting': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'review': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'training': return 'bg-green-100 text-green-800 border-green-200';
      case 'deadline': return 'bg-red-100 text-red-800 border-red-200';
      case 'personal': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEventTypeLabel = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'meeting': return 'Зустріч';
      case 'review': return 'Ревʼю';
      case 'training': return 'Навчання';
      case 'deadline': return 'Дедлайн';
      case 'personal': return 'Особисте';
      default: return 'Подія';
    }
  };

  const todayEvents = events.filter(event => {
    const eventDate = new Date(event.start);
    const today = new Date();
    return eventDate.toDateString() === today.toDateString();
  });

  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.start);
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return eventDate > today && eventDate <= nextWeek;
  }).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="p-4 lg:p-6 space-y-6 max-w-none">
      <div className="flex justify-between items-center">
        <div>
          <h1>Календар подій</h1>
          <p className="text-muted-foreground">Управління зустрічами, дедлайнами та навчанням</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGoogleSync}
            disabled={!googleSyncEnabled}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Синхронізувати Google
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Створити подію
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <CreateEventForm onSubmit={handleCreateEvent} onCancel={() => setShowCreateDialog(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Google Calendar Integration Status */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Інтеграція з Google Calendar
            </CardTitle>
            <Badge variant={googleSyncEnabled ? 'default' : 'secondary'}>
              {googleSyncEnabled ? 'Підключено' : 'Відключено'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Останнє оновлення: {lastSyncTime.toLocaleString('uk-UA')}
            </div>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Налаштування
            </Button>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Автоматична синхронізація кожні 15 хвилин • 
            {events.filter(e => e.isGoogleEvent).length} подій з Google Calendar
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Сьогодні ({todayEvents.length})</CardTitle>
            <CardDescription>{new Date().toLocaleDateString('uk-UA', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayEvents.length > 0 ? (
                todayEvents.map(event => (
                  <EventCard key={event.id} event={event} context={context} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Немає подій на сьогодні
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Найближчі події ({upcomingEvents.length})</CardTitle>
            <CardDescription>На найближчий тиждень</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.slice(0, 5).map(event => (
                  <EventCard key={event.id} event={event} context={context} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Немає запланованих подій
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Швидкі дії</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Users className="w-4 h-4 mr-2" />
              Запланувати ревʼю дизайну
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Clock className="w-4 h-4 mr-2" />
              Встановити дедлайн
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Створити навчальну сесію
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Video className="w-4 h-4 mr-2" />
              One-on-One зустріч
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Calendar View */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">Календар</CardTitle>
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
              <TabsList>
                <TabsTrigger value="month">Місяць</TabsTrigger>
                <TabsTrigger value="week">Тиждень</TabsTrigger>
                <TabsTrigger value="day">День</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CalendarIcon className="w-12 h-12 mx-auto mb-4" />
            <p>Тут буде інтерактивний календар</p>
            <p className="text-sm mt-2">
              Інтеграція з React Calendar компонентом для повного функціоналу
            </p>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

function EventCard({ event, context }: { event: CalendarEvent; context: AppContextType }) {
  const startTime = new Date(event.start);
  const endTime = new Date(event.end);
  const isDeadline = event.type === 'deadline';
  
  const attendeeDesigners = mockDesigners.filter(designer => 
    event.attendees.includes(designer.id)
  );

  return (
    <div className={`p-3 rounded-lg border ${getEventTypeColor(event.type)} cursor-pointer hover:shadow-sm transition-shadow`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-medium text-sm">{event.title}</h4>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <Clock className="w-3 h-3" />
            {isDeadline ? (
              <span>{startTime.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}</span>
            ) : (
              <span>
                {startTime.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })} - 
                {endTime.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {event.isGoogleEvent && (
            <Badge variant="outline" className="text-xs">Google</Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {getEventTypeLabel(event.type)}
          </Badge>
        </div>
      </div>
      
      {event.description && (
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{event.description}</p>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {attendeeDesigners.length > 0 && (
            <div className="flex -space-x-1">
              {attendeeDesigners.slice(0, 3).map(designer => (
                <Avatar key={designer.id} className="w-5 h-5 border border-background">
                  <AvatarImage src={designer.avatar} alt={designer.name} />
                  <AvatarFallback className="text-xs">
                    {designer.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              ))}
              {attendeeDesigners.length > 3 && (
                <div className="w-5 h-5 rounded-full bg-muted border border-background flex items-center justify-center text-xs">
                  +{attendeeDesigners.length - 3}
                </div>
              )}
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span className="truncate max-w-20">{event.location}</span>
            </div>
          )}
        </div>
        
        {event.meetingLink && (
          <Button size="sm" variant="ghost" className="h-auto p-1">
            <Video className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}

function getEventTypeColor(type: CalendarEvent['type']) {
  switch (type) {
    case 'meeting': return 'bg-blue-50 border-blue-200';
    case 'review': return 'bg-purple-50 border-purple-200';
    case 'training': return 'bg-green-50 border-green-200';
    case 'deadline': return 'bg-red-50 border-red-200';
    case 'personal': return 'bg-gray-50 border-gray-200';
    default: return 'bg-gray-50 border-gray-200';
  }
}

function getEventTypeLabel(type: CalendarEvent['type']) {
  switch (type) {
    case 'meeting': return 'Зустріч';
    case 'review': return 'Ревʼю';
    case 'training': return 'Навчання';
    case 'deadline': return 'Дедлайн';
    case 'personal': return 'Особисте';
    default: return 'Подія';
  }
}

function CreateEventForm({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start: '',
    end: '',
    type: 'meeting' as CalendarEvent['type'],
    attendees: [] as string[],
    location: '',
    meetingLink: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Створити нову подію</DialogTitle>
        <DialogDescription>
          Додайте нову подію до календаря команди
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4 py-4">
        <div>
          <Label htmlFor="title">Назва події</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Назва події"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="description">Опис</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Опис події"
            rows={3}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start">Початок</Label>
            <Input
              id="start"
              type="datetime-local"
              value={formData.start}
              onChange={(e) => setFormData(prev => ({ ...prev, start: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="end">Кінець</Label>
            <Input
              id="end"
              type="datetime-local"
              value={formData.end}
              onChange={(e) => setFormData(prev => ({ ...prev, end: e.target.value }))}
              required
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="type">Тип події</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as CalendarEvent['type'] }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="meeting">Зустріч</SelectItem>
              <SelectItem value="review">Ревʼю</SelectItem>
              <SelectItem value="training">Навчання</SelectItem>
              <SelectItem value="deadline">Дедлайн</SelectItem>
              <SelectItem value="personal">Особисте</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="location">Місце</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Конференц-зал або адреса"
            />
          </div>
          <div>
            <Label htmlFor="meetingLink">Посилання на зустріч</Label>
            <Input
              id="meetingLink"
              value={formData.meetingLink}
              onChange={(e) => setFormData(prev => ({ ...prev, meetingLink: e.target.value }))}
              placeholder="https://meet.google.com/..."
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Скасувати
        </Button>
        <Button type="submit">
          Створити подію
        </Button>
      </div>
    </form>
  );
}