import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { firebaseService, type FirebaseQuest } from '../lib/firebaseService';
import { Quest } from '../components/quests/types';

// Firebase-based quest fetching - simplified since Firebase already has the right structure

// Transform Firebase quest to UI quest format (component expects specific format)
// Moved outside component to prevent recreation on every render
const transformFirebaseQuestToUI = (firebaseQuest: FirebaseQuest): Quest => {
  // Use Firestore document ID as primary ID, fallback to a stable combination
  const uniqueId = firebaseQuest.id || `fb-${firebaseQuest.questId}`;

  return {
    id: uniqueId,
    title: firebaseQuest.title,
    description: firebaseQuest.description,
    category: firebaseQuest.category,
    reward: firebaseQuest.reward,
    creator: firebaseQuest.creator,
    participants: firebaseQuest.participants,
    deadline: firebaseQuest.deadline,
    difficulty: firebaseQuest.difficulty,
    status: firebaseQuest.status,
    tags: firebaseQuest.tags,
    color: firebaseQuest.color,
  };
};

export const useSubgraphQuests = (
  first: number = 10,
  orderBy: string = 'createdAt',
  orderDirection: string = 'desc'
) => {
  const query = useQuery<FirebaseQuest[]>({
    queryKey: ['firebase-quests', first, orderBy, orderDirection],
    queryFn: async (): Promise<FirebaseQuest[]> => {
      try {
        // Fetch quests from Firebase
        return await firebaseService.getQuests(first);
      } catch (error) {
        console.error('Error fetching quests from Firebase:', error);
        throw error;
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });

  // Memoize the transformation to prevent infinite re-renders
  const transformedData = useMemo(() => {
    if (!query.data) return undefined;
    return query.data.map(transformFirebaseQuestToUI);
  }, [query.data]);

  return {
    ...query,
    data: transformedData,
  };
};

// Firebase-based quest hook (keeping same name for compatibility)
