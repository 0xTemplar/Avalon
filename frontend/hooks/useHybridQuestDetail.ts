import { useState, useEffect, useCallback } from 'react';
import {
  firebaseService,
  type FirebaseQuest,
  type FirebaseSubmission,
} from '../lib/firebaseService';
import { useQuestDetail } from './useQuestDetail';
import { QuestDetail, Submission } from './useQuestDetail';

// Convert Firebase quest to UI quest detail format
const convertFirebaseToUIQuestDetail = (
  firebaseQuest: FirebaseQuest,
  submissions: FirebaseSubmission[] = []
): QuestDetail => {
  return {
    id: firebaseQuest.questId,
    title: firebaseQuest.title,
    description: firebaseQuest.description,
    longDescription:
      firebaseQuest.description +
      '\n\nThis quest offers an opportunity to showcase your skills and creativity while earning rewards. Follow the requirements carefully and submit your best work to compete for the bounty.',
    category: firebaseQuest.category,
    reward: firebaseQuest.reward,
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
    hasWinners: firebaseQuest.hasWinners,
    winners: firebaseQuest.winners,
    submissions: submissions.map(convertFirebaseToUISubmission),
  };
};

// Convert Firebase submission to UI submission format
const convertFirebaseToUISubmission = (
  firebaseSubmission: FirebaseSubmission
): Submission => {
  return {
    id: firebaseSubmission.submissionId,
    author: firebaseSubmission.author,
    content: firebaseSubmission.content,
    description: firebaseSubmission.description,
    timestamp: firebaseSubmission.timestamp,
    votes: firebaseSubmission.votes,
    status: firebaseSubmission.status,
    previewUrl: firebaseSubmission.previewUrl,
  };
};

export const useHybridQuestDetail = (id: string | string[] | undefined) => {
  const [firebaseQuest, setFirebaseQuest] = useState<QuestDetail | null>(null);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(true);
  const [firebaseError, setFirebaseError] = useState<Error | null>(null);
  const [dataSource, setDataSource] = useState<'firebase' | 'subgraph'>(
    'firebase'
  );

  const questId = id ? (Array.isArray(id) ? id[0] : id) : '';

  // Subgraph fallback
  const {
    data: subgraphQuest,
    isLoading: isSubgraphLoading,
    error: subgraphError,
  } = useQuestDetail(id);

  // Load Firebase quest data
  const loadFirebaseQuest = useCallback(async () => {
    if (!questId) return;

    try {
      setIsFirebaseLoading(true);
      setFirebaseError(null);

      // Format quest ID for Firebase lookup - just remove 0x prefix, no padding
      const formattedId = questId.replace(/^0x/, '');
      console.log(
        `🔍 Looking for quest ID: "${questId}" (formatted: "${formattedId}") in Firebase...`
      );

      // Try to find quest by blockchain ID
      const quest = await firebaseService.getQuestByBlockchainId(formattedId);

      if (quest) {
        // Load submissions for this quest
        try {
          const submissions = await firebaseService.getSubmissionsByQuest(
            formattedId
          );
          const questDetail = convertFirebaseToUIQuestDetail(
            quest,
            submissions
          );
          setFirebaseQuest(questDetail);
          setDataSource('firebase');
          console.log(
            `📊 Firebase loaded quest ${formattedId} with ${submissions.length} submissions`
          );
        } catch (submissionError) {
          console.warn(
            'Error loading submissions, showing quest without submissions:',
            submissionError
          );
          // Show quest without submissions if submission loading fails
          const questDetail = convertFirebaseToUIQuestDetail(quest, []);
          setFirebaseQuest(questDetail);
          setDataSource('firebase');
        }
      } else {
        setFirebaseQuest(null);
        setDataSource('subgraph');
        console.log(
          `📊 Quest ${formattedId} not found in Firebase, falling back to subgraph`
        );
      }
    } catch (error) {
      console.error('Firebase quest detail loading error:', error);
      setFirebaseError(error as Error);
      setDataSource('subgraph');
    } finally {
      setIsFirebaseLoading(false);
    }
  }, [questId]);

  // Initial load
  useEffect(() => {
    loadFirebaseQuest();
  }, [loadFirebaseQuest]);

  // Determine which data to use
  const shouldUseFallback =
    !firebaseQuest && !isFirebaseLoading && !firebaseError;

  const finalQuest = shouldUseFallback ? subgraphQuest : firebaseQuest;
  const finalLoading = shouldUseFallback
    ? isSubgraphLoading
    : isFirebaseLoading;

  // Create a more informative error if quest is not found in either source
  let finalError = shouldUseFallback ? subgraphError : firebaseError;

  if (!finalQuest && !finalLoading && !finalError) {
    finalError = new Error(
      shouldUseFallback
        ? 'Quest not found in either Firebase or subgraph. This quest may not exist or may have been created before the current data reset.'
        : 'Quest not found in Firebase. Subgraph fallback also failed.'
    );
  }

  // Add submission to Firebase
  const addSubmissionToFirebase = useCallback(
    async (
      submissionData: Omit<
        FirebaseSubmission,
        'id' | 'createdAtTimestamp' | 'updatedAtTimestamp'
      >
    ) => {
      try {
        console.log('📝 Adding submission to Firebase immediately...');
        const docId = await firebaseService.createSubmission(submissionData);

        // Refresh quest data to include new submission
        await loadFirebaseQuest();

        return docId;
      } catch (error) {
        console.error('Error adding submission to Firebase:', error);
        throw error;
      }
    },
    [loadFirebaseQuest]
  );

  // Update quest in Firebase
  const updateQuestInFirebase = useCallback(
    async (updates: Partial<FirebaseQuest>) => {
      if (!firebaseQuest) return;

      try {
        const quest = await firebaseService.getQuestByBlockchainId(
          firebaseQuest.id
        );
        if (quest?.id) {
          await firebaseService.updateQuest(quest.id, updates);
          await loadFirebaseQuest();
        }
      } catch (error) {
        console.error('Error updating quest in Firebase:', error);
        throw error;
      }
    },
    [firebaseQuest, loadFirebaseQuest]
  );

  return {
    data: finalQuest,
    isLoading: finalLoading,
    error: finalError,
    refetch: loadFirebaseQuest,
    dataSource,

    // Firebase-specific methods
    addSubmissionToFirebase,
    updateQuestInFirebase,
    firebaseQuest,
    isFirebaseLoading,
    firebaseError,

    // Subgraph data for comparison
    subgraphQuest,
    isSubgraphLoading,
    subgraphError,

    // Statistics
    stats: {
      usingFallback: shouldUseFallback,
      hasFirebaseData: !!firebaseQuest,
      hasSubgraphData: !!subgraphQuest,
    },
  };
};
