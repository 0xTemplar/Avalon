import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { firebaseService, type FirebaseQuest } from '../lib/firebaseService';
import { useSubgraphQuests } from './useSubgraphQuests';
import { Quest } from '../components/quests/types';

// Convert Firebase quest to UI quest format
const convertFirebaseToUIQuest = (firebaseQuest: FirebaseQuest): Quest => {
  return {
    id: firebaseQuest.questId,
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

interface UseHybridQuestsOptions {
  limitCount?: number;
  category?: string;
  difficulty?: string;
  searchQuery?: string;
  orderBy?: string;
  orderDirection?: string;
  useRealTime?: boolean; // Enable real-time Firebase updates
  fallbackToSubgraph?: boolean; // Fallback to subgraph if Firebase is empty
}

export const useHybridQuests = ({
  limitCount = 20,
  category,
  difficulty,
  searchQuery,
  orderBy = 'createdAt',
  orderDirection = 'desc',
  useRealTime = true,
  fallbackToSubgraph = true,
}: UseHybridQuestsOptions = {}) => {
  const [firebaseQuests, setFirebaseQuests] = useState<Quest[]>([]);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(true);
  const [firebaseError, setFirebaseError] = useState<Error | null>(null);
  const [dataSource, setDataSource] = useState<'firebase' | 'subgraph' | 'hybrid'>('firebase');

  // Subgraph fallback
  const {
    data: subgraphQuests,
    isLoading: isSubgraphLoading,
    error: subgraphError,
    refetch: refetchSubgraph,
  } = useSubgraphQuests(limitCount, orderBy, orderDirection);

  // Load initial Firebase data
  const loadFirebaseQuests = useCallback(async () => {
    try {
      setIsFirebaseLoading(true);
      setFirebaseError(null);
      
      const quests = await firebaseService.getQuests(
        limitCount,
        category,
        difficulty,
        searchQuery
      );
      
      const uiQuests = quests.map(convertFirebaseToUIQuest);
      setFirebaseQuests(uiQuests);
      setDataSource(quests.length > 0 ? 'firebase' : 'subgraph');
      
      console.log(`📊 Firebase loaded ${quests.length} quests`);
    } catch (error) {
      console.error('Firebase quest loading error:', error);
      setFirebaseError(error as Error);
      setDataSource('subgraph');
    } finally {
      setIsFirebaseLoading(false);
    }
  }, [limitCount, category, difficulty, searchQuery]);

  // Set up real-time Firebase listener
  useEffect(() => {
    if (!useRealTime) return;

    console.log('🔥 Setting up real-time Firebase listener');
    
    const unsubscribe = firebaseService.onQuestsUpdate((quests) => {
      const uiQuests = quests.map(convertFirebaseToUIQuest);
      setFirebaseQuests(uiQuests);
      setDataSource('firebase');
      console.log(`🔄 Real-time update: ${quests.length} quests`);
    }, limitCount);

    return () => {
      console.log('🔥 Cleaning up Firebase listener');
      unsubscribe();
    };
  }, [limitCount, useRealTime]);

  // Initial load
  useEffect(() => {
    loadFirebaseQuests();
  }, [loadFirebaseQuests]);

  // Determine which data to use
  const shouldUseFallback = fallbackToSubgraph && 
    firebaseQuests.length === 0 && 
    !isFirebaseLoading &&
    !firebaseError;

  const finalQuests = shouldUseFallback ? (subgraphQuests || []) : firebaseQuests;
  const finalLoading = shouldUseFallback ? isSubgraphLoading : isFirebaseLoading;
  const finalError = shouldUseFallback ? subgraphError : firebaseError;

  // Sync function for manual data refresh
  const syncData = useCallback(async () => {
    console.log('🔄 Manual sync triggered');
    await Promise.all([
      loadFirebaseQuests(),
      refetchSubgraph(),
    ]);
  }, [loadFirebaseQuests, refetchSubgraph]);

  // Function to add quest to Firebase immediately
  const addQuestToFirebase = useCallback(async (questData: Omit<FirebaseQuest, 'id' | 'createdAtTimestamp' | 'updatedAtTimestamp'>) => {
    try {
      console.log('📝 Adding quest to Firebase immediately...');
      const docId = await firebaseService.createQuest(questData);
      
      // If not using real-time, refresh manually
      if (!useRealTime) {
        await loadFirebaseQuests();
      }
      
      return docId;
    } catch (error) {
      console.error('Error adding quest to Firebase:', error);
      throw error;
    }
  }, [loadFirebaseQuests, useRealTime]);

  return {
    data: finalQuests,
    isLoading: finalLoading,
    error: finalError,
    refetch: syncData,
    dataSource,
    
    // Firebase-specific methods
    addQuestToFirebase,
    firebaseQuests,
    isFirebaseLoading,
    firebaseError,
    
    // Subgraph data for comparison/verification
    subgraphQuests,
    isSubgraphLoading,
    subgraphError,
    
    // Statistics
    stats: {
      firebaseCount: firebaseQuests.length,
      subgraphCount: subgraphQuests?.length || 0,
      usingFallback: shouldUseFallback,
    },
  };
};