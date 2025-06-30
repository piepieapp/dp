import { Calendar, Users, BookOpen, BarChart3, Target, FolderOpen, Settings, Home, Bell } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter } from './ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Notifications } from './Notifications';
import { mockUser } from '../services/mockData';
import { AppContextType } from '../App';

const menuItems = [
  { title: 'Дашборд', icon: Home, id: 'dashboard' },
  { title: 'Дизайнери', icon: Users, id: 'designers' },
  { title: 'Матриця навичок', icon: Target, id: 'skills' },
  { title: 'Навчання', icon: BookOpen, id: 'learning' },
  { title: 'Проекти', icon: FolderOpen, id: 'projects' },
  { title: 'Аналітика', icon: BarChart3, id: 'analytics' },
  { title: 'Календар', icon: Calendar, id: 'calendar' },
  { title: 'Налаштування', icon: Settings, id: 'settings' }
];

interface AppSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  notifications: AppContextType['notifications'];
}

export function AppSidebar({ activeSection, onSectionChange, notifications }: AppSidebarProps) {
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-medium">Design Manager</h2>
              <p className="text-sm text-muted-foreground">Управління командою</p>
            </div>
          </div>
          <div className="relative">
            <Button variant="ghost" size="sm">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 text-xs flex items-center justify-center p-0">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Навігація</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeSection === item.id}
                    onClick={() => onSectionChange(item.id)}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                    {item.id === 'learning' && unreadCount > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {unreadCount}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
            <AvatarFallback>{mockUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{mockUser.name}</p>
            <p className="text-sm text-muted-foreground capitalize">{mockUser.role}</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}