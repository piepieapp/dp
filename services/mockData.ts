import { Designer, Skill, LearningModule, Project, User } from '../types';

export const mockUser: User = {
  id: '1',
  name: 'Олексій Іваненко',
  email: 'oleksiy@company.com',
  role: 'teamlead',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
};

export const mockSkills: Skill[] = [
  { id: '1', name: 'UI Design', category: 'Design', description: 'User Interface Design', maxLevel: 5 },
  { id: '2', name: 'UX Research', category: 'Research', description: 'User Experience Research', maxLevel: 5 },
  { id: '3', name: 'Prototyping', category: 'Design', description: 'Interactive Prototyping', maxLevel: 5 },
  { id: '4', name: 'Figma', category: 'Tools', description: 'Figma Design Tool', maxLevel: 5 },
  { id: '5', name: 'Adobe Creative Suite', category: 'Tools', description: 'Adobe Tools', maxLevel: 5 },
  { id: '6', name: 'Design Systems', category: 'Design', description: 'Design System Creation', maxLevel: 5 },
  { id: '7', name: 'User Testing', category: 'Research', description: 'Usability Testing', maxLevel: 5 },
  { id: '8', name: 'HTML/CSS', category: 'Development', description: 'Frontend Technologies', maxLevel: 5 }
];

export const mockDesigners: Designer[] = [
  {
    id: '1',
    name: 'Марія Петренко',
    email: 'maria@company.com',
    position: 'UI/UX Designer',
    birthDate: '1995-03-15',
    joinDate: '2022-01-15',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b89e0a1c?w=150&h=150&fit=crop&crop=face',
    phone: '+380 (67) 123-45-67',
    location: 'Київ, Україна',
    department: 'Product Design',
    level: 'Middle',
    status: 'Active',
    workingHours: 1840,
    hoursWorked: 40,
    efficiency: 87,
    rating: 4.2,
    skills: [
      { 
        id: 's1', 
        skillId: '1', 
        skillName: 'UI Design', 
        category: 'Design', 
        level: 80,
        currentLevel: 4, 
        targetLevel: 5, 
        lastUpdated: '2024-12-01' 
      },
      { 
        id: 's2',
        skillId: '2', 
        skillName: 'UX Research', 
        category: 'Research', 
        level: 60,
        currentLevel: 3, 
        targetLevel: 4, 
        lastUpdated: '2024-11-15' 
      },
      { 
        id: 's3',
        skillId: '4', 
        skillName: 'Figma', 
        category: 'Tools', 
        level: 95,
        currentLevel: 5, 
        targetLevel: 5, 
        lastUpdated: '2024-10-20' 
      }
    ],
    projects: [
      {
        id: 'p1',
        name: 'Mobile App Redesign',
        description: 'Повне перепроектування мобільного додатку',
        jiraKey: 'MAR-123',
        status: 'Active',
        progress: 75,
        role: 'Lead Designer',
        startDate: '2024-11-01',
        deadline: '2024-12-30',
        hoursSpent: 120,
        tasks: [
          {
            id: 't1',
            title: 'Design new onboarding flow',
            jiraKey: 'MAR-124',
            status: 'In Progress',
            assignee: 'Марія Петренко',
            priority: 'High',
            estimatedHours: 40,
            actualHours: 35
          }
        ]
      }
    ],
    learningModules: [
      {
        id: 'lm1',
        title: 'Advanced UX Research Methods',
        description: 'Deep dive into advanced user research techniques',
        category: 'Research',
        difficulty: 'Advanced',
        estimatedTime: 20,
        status: 'In Progress',
        progress: 65,
        deadline: '2024-12-30',
        tests: [],
        assignedDate: '2024-11-01'
      }
    ],
    kpis: {
      productivity: 85,
      qualityScore: 90,
      timeManagement: 88,
      quality: 90,
      delivery: 88,
      collaboration: 92,
      growth: 78,
      overallScore: 86.6
    },
    peerReviews: [
      {
        id: 'pr1',
        reviewerName: 'Дмитро Коваленко',
        reviewerId: '2',
        rating: 4,
        comment: 'Чудова робота над дизайном інтерфейсу. Марія завжди вчасно виконує завдання та має креативний підхід.',
        date: '2024-11-15'
      },
      {
        id: 'pr2',
        reviewerName: 'Анна Сидоренко',
        reviewerId: '3',
        rating: 5,
        comment: 'Дуже допомагає молодшим дизайнерам, відмінно організовує роботу.',
        date: '2024-10-20'
      }
    ]
  },
  {
    id: '2',
    name: 'Дмитро Коваленко',
    email: 'dmytro@company.com',
    position: 'Senior UX Designer',
    birthDate: '1988-07-22',
    joinDate: '2020-03-10',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    phone: '+380 (50) 987-65-43',
    location: 'Львів, Україна',
    department: 'Product Design',
    level: 'Senior',
    status: 'Active',
    workingHours: 2150,
    hoursWorked: 40,
    efficiency: 94,
    rating: 4.7,
    skills: [
      { 
        id: 's4',
        skillId: '1', 
        skillName: 'UI Design', 
        category: 'Design', 
        level: 95,
        currentLevel: 5, 
        targetLevel: 5, 
        lastUpdated: '2024-11-01' 
      },
      { 
        id: 's5',
        skillId: '2', 
        skillName: 'UX Research', 
        category: 'Research', 
        level: 100,
        currentLevel: 5, 
        targetLevel: 5, 
        lastUpdated: '2024-10-15' 
      },
      { 
        id: 's6',
        skillId: '6', 
        skillName: 'Design Systems', 
        category: 'Design', 
        level: 85,
        currentLevel: 4, 
        targetLevel: 5, 
        lastUpdated: '2024-12-01' 
      }
    ],
    projects: [
      {
        id: 'p2',
        name: 'Design System v2.0',
        description: 'Розробка нової версії дизайн системи',
        jiraKey: 'DS-200',
        status: 'Active',
        progress: 90,
        role: 'Tech Lead',
        startDate: '2024-10-15',
        deadline: '2025-01-10',
        hoursSpent: 180,
        tasks: [
          {
            id: 't2',
            title: 'Component library update',
            jiraKey: 'DS-201',
            status: 'Done',
            assignee: 'Дмитро Коваленко',
            priority: 'Medium',
            estimatedHours: 60,
            actualHours: 55
          }
        ]
      }
    ],
    learningModules: [
      {
        id: 'lm2',
        title: 'Design System Leadership',
        description: 'Leading design system initiatives',
        category: 'Leadership',
        difficulty: 'Advanced',
        estimatedTime: 25,
        status: 'Completed',
        progress: 100,
        tests: [],
        assignedDate: '2024-09-01',
        completedDate: '2024-10-15'
      }
    ],
    kpis: {
      productivity: 95,
      qualityScore: 96,
      timeManagement: 93,
      quality: 96,
      delivery: 93,
      collaboration: 89,
      growth: 85,
      overallScore: 91.6
    },
    peerReviews: [
      {
        id: 'pr3',
        reviewerName: 'Марія Петренко',
        reviewerId: '1',
        rating: 5,
        comment: 'Досвідчений професіонал з глибокими знаннями UX. Завжди готовий допомогти колегам.',
        date: '2024-11-20'
      }
    ]
  },
  {
    id: '3',
    name: 'Анна Сидоренко',
    email: 'anna@company.com',
    position: 'Junior UI Designer',
    birthDate: '1998-11-08',
    joinDate: '2024-06-01',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    phone: '+380 (63) 555-12-34',
    location: 'Харків, Україна',
    department: 'Product Design',
    level: 'Junior',
    status: 'Active',
    workingHours: 920,
    hoursWorked: 35,
    efficiency: 76,
    rating: 3.8,
    skills: [
      { 
        id: 's7',
        skillId: '1', 
        skillName: 'UI Design', 
        category: 'Design', 
        level: 40,
        currentLevel: 2, 
        targetLevel: 4, 
        lastUpdated: '2024-12-01' 
      },
      { 
        id: 's8',
        skillId: '4', 
        skillName: 'Figma', 
        category: 'Tools', 
        level: 65,
        currentLevel: 3, 
        targetLevel: 4, 
        lastUpdated: '2024-11-20' 
      },
      { 
        id: 's9',
        skillId: '3', 
        skillName: 'Prototyping', 
        category: 'Design', 
        level: 35,
        currentLevel: 2, 
        targetLevel: 3, 
        lastUpdated: '2024-11-10' 
      }
    ],
    projects: [
      {
        id: 'p3',
        name: 'Landing Page Redesign',
        description: 'Оновлення дизайну посадкової сторінки',
        jiraKey: 'LPR-50',
        status: 'Active',
        progress: 30,
        role: 'UI Designer',
        startDate: '2024-12-01',
        deadline: '2025-01-05',
        hoursSpent: 45,
        tasks: [
          {
            id: 't3',
            title: 'Create wireframes',
            jiraKey: 'LPR-51',
            status: 'To Do',
            assignee: 'Анна Сидоренко',
            priority: 'Medium',
            estimatedHours: 20,
            actualHours: 0
          }
        ]
      }
    ],
    learningModules: [
      {
        id: 'lm3',
        title: 'UI Design Fundamentals',
        description: 'Basic principles of user interface design',
        category: 'Design',
        difficulty: 'Beginner',
        estimatedTime: 15,
        status: 'In Progress',
        progress: 45,
        deadline: '2024-12-28',
        tests: [],
        assignedDate: '2024-11-15'
      }
    ],
    kpis: {
      productivity: 75,
      qualityScore: 80,
      timeManagement: 78,
      quality: 80,
      delivery: 78,
      collaboration: 88,
      growth: 92,
      overallScore: 82.6
    },
    peerReviews: [
      {
        id: 'pr4',
        reviewerName: 'Марія Петренко',
        reviewerId: '1',
        rating: 4,
        comment: 'Анна швидко навчається та має гарний потенціал. Рекомендую більше практики з UX дослідженнями.',
        date: '2024-11-25'
      }
    ]
  },
  {
    id: '4',
    name: 'Олена Іваненко',
    email: 'olena@company.com',
    position: 'Lead UX Designer',
    birthDate: '1985-02-14',
    joinDate: '2019-05-20',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    phone: '+380 (99) 123-78-90',
    location: 'Дніпро, Україна',
    department: 'Product Design',
    level: 'Lead',
    status: 'Active',
    workingHours: 2400,
    hoursWorked: 42,
    efficiency: 96,
    rating: 4.9,
    skills: [
      { 
        id: 's10',
        skillId: '2', 
        skillName: 'UX Research', 
        category: 'Research', 
        level: 100,
        currentLevel: 5, 
        targetLevel: 5, 
        lastUpdated: '2024-11-01' 
      },
      { 
        id: 's11',
        skillId: '6', 
        skillName: 'Design Systems', 
        category: 'Design', 
        level: 95,
        currentLevel: 5, 
        targetLevel: 5, 
        lastUpdated: '2024-10-15' 
      },
      { 
        id: 's12',
        skillId: '7', 
        skillName: 'User Testing', 
        category: 'Research', 
        level: 100,
        currentLevel: 5, 
        targetLevel: 5, 
        lastUpdated: '2024-12-01' 
      }
    ],
    projects: [
      {
        id: 'p4',
        name: 'User Research Platform',
        description: 'Створення платформи для UX досліджень',
        jiraKey: 'URP-100',
        status: 'Active',
        progress: 60,
        role: 'Research Lead',
        startDate: '2024-09-01',
        deadline: '2025-02-15',
        hoursSpent: 200,
        tasks: []
      }
    ],
    learningModules: [
      {
        id: 'lm4',
        title: 'AI in UX Design',
        description: 'Exploring AI applications in user experience design',
        category: 'Innovation',
        difficulty: 'Advanced',
        estimatedTime: 30,
        status: 'In Progress',
        progress: 80,
        deadline: '2025-01-20',
        tests: [],
        assignedDate: '2024-10-01'
      }
    ],
    kpis: {
      productivity: 96,
      qualityScore: 98,
      timeManagement: 95,
      quality: 98,
      delivery: 95,
      collaboration: 94,
      growth: 88,
      overallScore: 94.2
    },
    peerReviews: [
      {
        id: 'pr5',
        reviewerName: 'Дмитро Коваленко',
        reviewerId: '2',
        rating: 5,
        comment: 'Олена - найкращий UX експерт з яким я працював. Її підхід до досліджень надихає всю команду.',
        date: '2024-11-10'
      },
      {
        id: 'pr6',
        reviewerName: 'Анна Сидоренко',
        reviewerId: '3',
        rating: 5,
        comment: 'Чудовий лідер та ментор. Дуже багато навчилась працюючи з Оленою.',
        date: '2024-11-05'
      }
    ]
  }
];

export const mockLearningModules: LearningModule[] = [
  {
    id: 'lm1',
    title: 'Advanced UX Research Methods',
    description: 'Deep dive into advanced user research techniques including ethnographic studies, diary studies, and advanced analytics',
    category: 'Research',
    difficulty: 'Advanced',
    estimatedTime: 20,
    status: 'Not Started',
    progress: 0,
    tests: [
      {
        id: 'test1',
        title: 'UX Research Methods Assessment',
        passingScore: 80,
        attempts: [],
        questions: [
          {
            id: 'q1',
            question: 'What is the primary benefit of ethnographic research?',
            type: 'multiple-choice',
            options: ['Cost efficiency', 'Deep contextual insights', 'Quick results', 'Large sample size'],
            correctAnswer: 'Deep contextual insights'
          }
        ]
      }
    ],
    assignedDate: '2024-12-01'
  },
  {
    id: 'lm2',
    title: 'Design System Leadership',
    description: 'Learn how to lead design system initiatives and drive adoption across teams',
    category: 'Leadership',
    difficulty: 'Advanced',
    estimatedTime: 25,
    status: 'Not Started',
    progress: 0,
    tests: [],
    assignedDate: '2024-12-01'
  },
  {
    id: 'lm3',
    title: 'UI Design Fundamentals',
    description: 'Master the basic principles of user interface design including layout, typography, and color theory',
    category: 'Design',
    difficulty: 'Beginner',
    estimatedTime: 15,
    status: 'Not Started',
    progress: 0,
    tests: [],
    assignedDate: '2024-12-01'
  }
];