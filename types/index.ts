export interface Designer {
  id: string;
  name: string;
  email: string;
  position: string;
  birthDate?: string;
  joinDate?: string;
  avatar?: string;
  phone?: string;
  location: string;
  department: string;
  level: 'Junior' | 'Middle' | 'Senior' | 'Lead';
  status: 'Active' | 'Inactive';
  skills: SkillRating[];
  workingHours: number;
  hoursWorked: number;
  efficiency: number;
  rating: number; // Visible only to team leads
  projects: Project[];
  learningModules: LearningModule[];
  kpis: KPIMetrics;
  peerReviews: PeerReview[];
}

export interface PeerReview {
  id: string;
  reviewerName: string;
  reviewerId: string;
  rating: number; // 1-5 stars
  comment: string;
  date: string;
}

export interface SkillRating {
  id: string;
  skillId: string;
  skillName: string;
  category: string;
  level: number; // 0-100
  currentLevel: number;
  targetLevel: number;
  lastUpdated: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
  maxLevel: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  jiraKey: string;
  status: 'Active' | 'Completed' | 'On Hold';
  progress: number;
  role: string;
  startDate: string;
  endDate?: string;
  deadline: string;
  hoursSpent: number;
  tasks: Task[];
}

export interface Task {
  id: string;
  title: string;
  jiraKey: string;
  status: 'To Do' | 'In Progress' | 'Done';
  assignee: string;
  priority: 'Low' | 'Medium' | 'High';
  estimatedHours: number;
  actualHours: number;
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: number;
  status: 'Not Started' | 'In Progress' | 'Completed';
  progress: number;
  deadline?: string;
  tests: Test[];
  assignedDate: string;
  completedDate?: string;
}

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'article' | 'interactive';
  duration: string;
  completed: boolean;
  content: string;
}

export interface Test {
  id: string;
  title: string;
  questions: Question[];
  passingScore: number;
  attempts: TestAttempt[];
}

export interface Question {
  id: string;
  question: string;
  type: 'multiple-choice' | 'text' | 'rating';
  options?: string[];
  correctAnswer?: string;
}

export interface TestAttempt {
  id: string;
  date: string;
  score: number;
  passed: boolean;
  answers: { questionId: string; answer: string }[];
}

export interface KPIMetrics {
  productivity: number;
  qualityScore: number;
  timeManagement: number;
  quality: number;
  delivery: number;
  collaboration: number;
  growth: number;
  overallScore: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teamlead' | 'designer';
  avatar?: string;
}