import { Timestamp } from 'firebase/firestore';

// Developer Profile
export interface Developer {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  skills: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  joinedAt: Timestamp;
  lastActiveAt: Timestamp;
  preferences: {
    learningStyle: 'visual' | 'practical' | 'theoretical' | 'mixed';
    focusAreas: string[];
    dailyLearningGoal: number; // minutes
  };
  stats: {
    totalSessions: number;
    totalLearningTime: number; // minutes
    currentStreak: number; // days
    longestStreak: number; // days
  };
}

// Learning Session
export interface Session {
  id: string;
  developerId: string;
  projectId?: string;
  startTime: Timestamp;
  endTime?: Timestamp;
  duration?: number; // minutes
  type: 'coding' | 'learning' | 'debugging' | 'reviewing';
  status: 'active' | 'paused' | 'completed';
  concepts: string[];
  skills: string[];
  activities: Activity[];
  insights?: string[];
  public: boolean;
}

// Activity within a session
export interface Activity {
  timestamp: Timestamp;
  type: 'file_edit' | 'commit' | 'search' | 'documentation' | 'test' | 'debug';
  description: string;
  metadata?: Record<string, any>;
}

// Project
export interface Project {
  id: string;
  name: string;
  description: string;
  githubUrl?: string;
  members: string[]; // Developer IDs
  createdAt: Timestamp;
  updatedAt: Timestamp;
  technologies: string[];
  status: 'planning' | 'active' | 'maintenance' | 'archived';
  stats: {
    totalCommits: number;
    totalSessions: number;
    totalLearningTime: number;
  };
}

// Commit Analysis
export interface CommitAnalysis {
  id: string;
  projectId: string;
  developerId: string;
  commitHash: string;
  timestamp: Timestamp;
  message: string;
  filesChanged: number;
  additions: number;
  deletions: number;
  concepts: string[];
  skills: string[];
  complexity: 'low' | 'medium' | 'high';
  analysis: {
    summary: string;
    learningPoints: string[];
    improvements?: string[];
  };
}

// AI Recommendation
export interface Recommendation {
  id: string;
  developerId: string;
  type: 'skill' | 'concept' | 'project' | 'resource';
  title: string;
  description: string;
  reason: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: Timestamp;
  expiresAt?: Timestamp;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  metadata?: Record<string, any>;
}

// Knowledge Graph Node (simplified for Firestore)
export interface KnowledgeNode {
  id: string;
  type: 'concept' | 'skill' | 'pattern' | 'technology';
  name: string;
  description: string;
  level: number; // 1-5, complexity/difficulty
  prerequisites: string[]; // IDs of prerequisite nodes
  relatedNodes: string[]; // IDs of related nodes
  resources: Resource[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Learning Resource
export interface Resource {
  type: 'documentation' | 'tutorial' | 'video' | 'article' | 'exercise';
  title: string;
  url: string;
  estimatedTime?: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}