import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Settings as SettingsIcon, ExternalLink, Bell, Users, Shield, Database, Download } from 'lucide-react';
import { AppContextType } from '../App';
import { toast } from 'sonner@2.0.3';

interface SettingsProps {
  context: AppContextType;
}

export function Settings({ context }: SettingsProps) {
  const [jiraSettings, setJiraSettings] = useState({
    enabled: true,
    apiUrl: 'https://your-company.atlassian.net',
    username: 'admin@company.com',
    apiToken: '••••••••••••••••',
    syncInterval: '30'
  });

  const [googleSettings, setGoogleSettings] = useState({
    enabled: true,
    calendarId: 'primary',
    syncInterval: '15'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    monthlyReports: true
  });

  const handleSaveJiraSettings = () => {
    toast.success('Налаштування Jira збережено');
    context.addNotification({
      title: 'Налаштування оновлено',
      message: 'Конфігурацію Jira успішно збережено',
      type: 'success'
    });
  };

  const handleTestJiraConnection = () => {
    toast.success('Підключення до Jira успішне');
  };

  const handleExportData = () => {
    toast.success('Експорт даних розпочато');
    context.addNotification({
      title: 'Експорт даних',
      message: 'Файл буде готовий за кілька хвилин',
      type: 'info'
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>Налаштування системи</h1>
        <p className="text-muted-foreground">Конфігурація інтеграцій та параметрів платформи</p>
      </div>

      <Tabs defaultValue="integrations" className="w-full">
        <TabsList>
          <TabsTrigger value="integrations">Інтеграції</TabsTrigger>
          <TabsTrigger value="notifications">Сповіщення</TabsTrigger>
          <TabsTrigger value="users">Користувачі</TabsTrigger>
          <TabsTrigger value="data">Дані</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-6">
          {/* Jira Integration */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Інтеграція з Jira
                  </CardTitle>
                  <CardDescription>Налаштування підключення до Atlassian Jira</CardDescription>
                </div>
                <Badge variant={jiraSettings.enabled ? 'default' : 'secondary'}>
                  {jiraSettings.enabled ? 'Активна' : 'Відключена'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="jira-enabled"
                  checked={jiraSettings.enabled}
                  onCheckedChange={(checked) => setJiraSettings(prev => ({ ...prev, enabled: checked }))}
                />
                <Label htmlFor="jira-enabled">Увімкнути інтеграцію з Jira</Label>
              </div>

              {jiraSettings.enabled && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="jira-url">URL Jira</Label>
                    <Input
                      id="jira-url"
                      value={jiraSettings.apiUrl}
                      onChange={(e) => setJiraSettings(prev => ({ ...prev, apiUrl: e.target.value }))}
                      placeholder="https://your-company.atlassian.net"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="jira-username">Email користувача</Label>
                      <Input
                        id="jira-username"
                        value={jiraSettings.username}
                        onChange={(e) => setJiraSettings(prev => ({ ...prev, username: e.target.value }))}
                        placeholder="admin@company.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="jira-token">API Token</Label>
                      <Input
                        id="jira-token"
                        type="password"
                        value={jiraSettings.apiToken}
                        onChange={(e) => setJiraSettings(prev => ({ ...prev, apiToken: e.target.value }))}
                        placeholder="API token"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="jira-sync">Інтервал синхронізації (хвилини)</Label>
                    <Select value={jiraSettings.syncInterval} onValueChange={(value) => setJiraSettings(prev => ({ ...prev, syncInterval: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 хвилин</SelectItem>
                        <SelectItem value="30">30 хвилин</SelectItem>
                        <SelectItem value="60">1 година</SelectItem>
                        <SelectItem value="120">2 години</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveJiraSettings}>
                      Зберегти налаштування
                    </Button>
                    <Button variant="outline" onClick={handleTestJiraConnection}>
                      Тестувати підключення
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Google Calendar Integration */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Google Calendar
                  </CardTitle>
                  <CardDescription>Синхронізація з Google Calendar</CardDescription>
                </div>
                <Badge variant={googleSettings.enabled ? 'default' : 'secondary'}>
                  {googleSettings.enabled ? 'Активна' : 'Відключена'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="google-enabled"
                  checked={googleSettings.enabled}
                  onCheckedChange={(checked) => setGoogleSettings(prev => ({ ...prev, enabled: checked }))}
                />
                <Label htmlFor="google-enabled">Увімкнути синхронізацію з Google Calendar</Label>
              </div>

              {googleSettings.enabled && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="calendar-id">ID календаря</Label>
                    <Input
                      id="calendar-id"
                      value={googleSettings.calendarId}
                      onChange={(e) => setGoogleSettings(prev => ({ ...prev, calendarId: e.target.value }))}
                      placeholder="primary або calendar@gmail.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="google-sync">Інтервал синхронізації (хвилини)</Label>
                    <Select value={googleSettings.syncInterval} onValueChange={(value) => setGoogleSettings(prev => ({ ...prev, syncInterval: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 хвилин</SelectItem>
                        <SelectItem value="15">15 хвилин</SelectItem>
                        <SelectItem value="30">30 хвилин</SelectItem>
                        <SelectItem value="60">1 година</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button>
                    Підключити Google Calendar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Налаштування сповіщень
              </CardTitle>
              <CardDescription>Керування типами та частотою сповіщень</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">Email сповіщення</Label>
                    <p className="text-sm text-muted-foreground">Отримувати сповіщення на email</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-notifications">Push сповіщення</Label>
                    <p className="text-sm text-muted-foreground">Сповіщення в браузері</p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="weekly-reports">Тижневі звіти</Label>
                    <p className="text-sm text-muted-foreground">Отримувати тижневі звіти про команду</p>
                  </div>
                  <Switch
                    id="weekly-reports"
                    checked={notificationSettings.weeklyReports}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, weeklyReports: checked }))}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="monthly-reports">Місячні звіти</Label>
                    <p className="text-sm text-muted-foreground">Отримувати місячні аналітичні звіти</p>
                  </div>
                  <Switch
                    id="monthly-reports"
                    checked={notificationSettings.monthlyReports}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, monthlyReports: checked }))}
                  />
                </div>
              </div>
              <Button>Зберегти налаштування</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4" />
                Управління користувачами
              </CardTitle>
              <CardDescription>Ролі та дозволи користувачів</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="w-12 h-12 mx-auto mb-4" />
                <p>Управління ролями та дозволами</p>
                <p className="text-sm mt-2">Налаштування доступу для різних типів користувачів</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="w-4 h-4" />
                Управління даними
              </CardTitle>
              <CardDescription>Експорт, імпорт та резервне копіювання</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Експорт даних</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Завантажити дані команди в різних форматах
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExportData}>
                      <Download className="w-4 h-4 mr-2" />
                      Експорт CSV
                    </Button>
                    <Button variant="outline" onClick={handleExportData}>
                      <Download className="w-4 h-4 mr-2" />
                      Експорт Excel
                    </Button>
                    <Button variant="outline" onClick={handleExportData}>
                      <Download className="w-4 h-4 mr-2" />
                      Експорт JSON
                    </Button>
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">Резервне копіювання</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Автоматичне резервне копіювання даних
                  </p>
                  <div className="flex items-center space-x-2">
                    <Switch id="backup-enabled" />
                    <Label htmlFor="backup-enabled">Увімкнути автоматичне резервне копіювання</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}