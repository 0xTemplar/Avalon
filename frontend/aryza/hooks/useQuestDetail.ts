import { useQuery } from '@tanstack/react-query';
import {
  firebaseService,
  type FirebaseQuest,
  type FirebaseSubmission,
} from '../lib/firebaseService';

// Use Firebase data structures directly

export interface Submission {
  id: string;
  author: {
    address: string;
    username: string;
    avatar: string;
  };
  content: string;
  description: string;
  timestamp: string;
  votes: number;
  status: 'pending' | 'approved' | 'rejected' | 'winner';
  previewUrl?: string;
}

export interface QuestDetail {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  category: string;
  reward: string;
  creator: {
    address: string;
    username: string;
    avatar: string;
    reputation: number;
  };
  participants: number;
  maxParticipants: number;
  deadline: string;
  createdAt: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  status: 'Active' | 'Completed' | 'Expired';
  tags: string[];
  color: string;
  requirements: string[];
  deliverables: string[];
  submissions: Submission[];
  hasWinners: boolean;
  winners: string[];
}

// Firebase-only implementation

// Transform Firebase quest and submissions to QuestDetail format
const transformFirebaseQuestToDetail = (
  firebaseQuest: FirebaseQuest,
  submissions: FirebaseSubmission[]
): QuestDetail => {
  const transformedSubmissions: Submission[] = submissions.map((sub) => ({
    id: sub.id || sub.submissionId,
    author: sub.author,
    content: sub.content,
    description: sub.description,
    timestamp: sub.timestamp,
    votes: sub.votes,
    status: sub.status,
    previewUrl: sub.previewUrl,
  }));

  return {
    id: firebaseQuest.id || `fb-${firebaseQuest.questId}`, // Use unique Firestore ID, stable fallback
    title: firebaseQuest.title,
    description: firebaseQuest.description,
    longDescription:
      firebaseQuest.description +
      '\n\nThis quest offers an opportunity to showcase your skills and creativity while earning rewards. Follow the requirements carefully and submit your best work to compete for the bounty.',
    category: firebaseQuest.category,
    reward: firebaseQuest.reward + ' XTZ',
    creator: firebaseQuest.creator,
    participants: firebaseQuest.participants,
    maxParticipants: firebaseQuest.maxParticipants,
    deadline: firebaseQuest.deadline,
    createdAt: firebaseQuest.createdAt,
    difficulty: firebaseQuest.difficulty,
    status: firebaseQuest.status,
    tags: firebaseQuest.tags,
    color: firebaseQuest.color,
    requirements: firebaseQuest.requirements,
    deliverables: firebaseQuest.deliverables,
    submissions: transformedSubmissions,
    hasWinners: firebaseQuest.hasWinners,
    winners: firebaseQuest.winners,
  };
};

export const useQuestDetail = (id: string | string[] | undefined) => {
  const questId = id ? (Array.isArray(id) ? id[0] : id) : '';

  return useQuery<QuestDetail | null>({
    queryKey: ['quest-detail', questId],
    queryFn: async (): Promise<QuestDetail | null> => {
      if (!questId) {
        throw new Error('Quest ID is required');
      }

      try {
        // Get quest from Firebase using Firestore document ID
        const firebaseQuest = await firebaseService.getQuest(questId);

        if (!firebaseQuest) {
          console.log(`Quest ${questId} not found in Firebase`);
          return null;
        }

        // Get submissions for this quest using the blockchain quest ID
        const submissions = await firebaseService.getSubmissionsByQuest(
          firebaseQuest.questId
        );

        // Transform to QuestDetail format
        return transformFirebaseQuestToDetail(firebaseQuest, submissions);
      } catch (error) {
        console.error('Error fetching quest detail from Firebase:', error);
        throw error;
      }
    },
    enabled: !!questId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
};
