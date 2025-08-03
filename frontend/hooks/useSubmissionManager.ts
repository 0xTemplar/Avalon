import { useState, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Contract } from 'ethers';
import { usePrivyEthers } from './usePrivyEthers';
import { useUserProfile } from './useUserProfile';
import {
  firebaseService,
  type FirebaseSubmission,
} from '../lib/firebaseService';
import { CONTRACT_ADDRESSES } from '../contracts/addresses';
import SubmissionManagerABI from '../abi/SubmissionManager.json';
import QuestBoardABI from '../abi/QuestBoard.json';

export interface CreateSubmissionParams {
  questId: string;
  title: string;
  description: string;
  fileHashes: string[];
  previewUrl?: string;
  collaborators?: string[];
}

export interface SubmissionManagerHook {
  createSubmission: (params: CreateSubmissionParams) => Promise<void>;
  isCreating: boolean;
  error: string | null;
}

export const useSubmissionManager = (): SubmissionManagerHook => {
  const { signer, address, chainId } = usePrivyEthers();
  const { profile: userProfile } = useUserProfile();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create contract instances
  const submissionContract = useMemo(() => {
    if (!signer) return null;
    return new Contract(
      CONTRACT_ADDRESSES.SubmissionManager,
      SubmissionManagerABI.abi,
      signer
    );
  }, [signer]);

  const questBoardContract = useMemo(() => {
    if (!signer) return null;
    return new Contract(
      CONTRACT_ADDRESSES.QuestBoard,
      QuestBoardABI.abi,
      signer
    );
  }, [signer]);

  const createSubmission = useCallback(
    async (params: CreateSubmissionParams) => {
      if (
        !submissionContract ||
        !questBoardContract ||
        !address ||
        !userProfile
      ) {
        throw new Error('Wallet not connected or profile not found');
      }

      setIsCreating(true);
      setError(null);

      try {
        console.log('Creating submission on blockchain...', params);
        console.log('Wallet address:', address);
        console.log('Chain ID:', chainId);
        console.log('User profile:', userProfile);
        console.log('Contract addresses:', {
          SubmissionManager: CONTRACT_ADDRESSES.SubmissionManager,
          QuestBoard: CONTRACT_ADDRESSES.QuestBoard,
        });

        // Validate network (Etherlink testnet)
        if (chainId !== 128123) {
          throw new Error(
            `Wrong network. Please switch to Etherlink testnet (Chain ID: 128123). Current: ${chainId}`
          );
        }

        // Get blockchain quest ID from external quest ID
        let blockchainQuestId: number;

        // Check if questId is already a number (backward compatibility)
        const parsedQuestId = parseInt(params.questId);
        if (!isNaN(parsedQuestId) && parsedQuestId > 0) {
          // It's already a numeric blockchain ID
          blockchainQuestId = parsedQuestId;
          console.log('Using numeric quest ID directly:', blockchainQuestId);
        } else {
          // It's an external ID, need to convert to blockchain ID
          try {
            const questBoardContract = new Contract(
              CONTRACT_ADDRESSES.QuestBoard,
              QuestBoardABI.abi,
              signer
            );
            blockchainQuestId = await questBoardContract.getQuestIdByExternalId(
              params.questId
            );
            console.log(
              `Converted external ID "${params.questId}" to blockchain ID:`,
              blockchainQuestId
            );
          } catch (error) {
            throw new Error(
              `Failed to find quest with external ID "${params.questId}": ${error}`
            );
          }
        }

        if (!blockchainQuestId || blockchainQuestId <= 0) {
          throw new Error(`Invalid blockchain quest ID: ${blockchainQuestId}`);
        }

        // Step 1: Join quest first (required before submission)
        console.log('Joining quest...');
        try {
          const joinTx = await questBoardContract.joinQuest(blockchainQuestId);
          await joinTx.wait();
          console.log('✅ Successfully joined quest!');
        } catch (joinError) {
          console.log(
            'ℹ️ Join quest failed (may already be joined):',
            joinError
          );
          // Continue - user might already be joined
        }

        // Step 2: Create submission on blockchain
        console.log('Creating submission...');
        const tx = await submissionContract.createSubmission(
          blockchainQuestId, // Use blockchain quest ID
          params.title,
          params.description,
          params.fileHashes,
          params.previewUrl || '', // metadataURI
          params.collaborators || [] // empty array for solo submissions
        );

        console.log('Transaction sent:', tx.hash);
        const receipt = await tx.wait();
        console.log('Transaction confirmed:', receipt);

        // Extract submission ID from events
        let submissionId = '1'; // fallback
        if (receipt && receipt.logs) {
          for (const log of receipt.logs) {
            try {
              const parsedLog = submissionContract.interface.parseLog({
                topics: log.topics,
                data: log.data,
              });
              if (parsedLog && parsedLog.name === 'SubmissionCreated') {
                submissionId = parsedLog.args.submissionId.toString();
                break;
              }
            } catch {
              // Continue searching
            }
          }
        }

        console.log('Submission created with ID:', submissionId);

        // Sync to Firebase
        const firebaseSubmissionData: Omit<
          FirebaseSubmission,
          'id' | 'createdAtTimestamp' | 'updatedAtTimestamp'
        > = {
          questId: blockchainQuestId.toString(),
          submissionId: submissionId,
          author: {
            address: address,
            username: userProfile.username,
            avatar: `dummy-${address}`, // Use dummy avatar based on address
          },
          content: params.title,
          description: params.description,
          timestamp: new Date().toISOString(),
          votes: 0,
          status: 'pending',
          previewUrl: params.previewUrl,
          txHash: tx.hash,
        };

        await firebaseService.createSubmission(firebaseSubmissionData);
        console.log('Submission synced to Firebase');

        // Invalidate relevant queries
        await queryClient.invalidateQueries({
          queryKey: ['quest-detail'],
        });
        await queryClient.invalidateQueries({
          queryKey: ['submissions'],
        });

        console.log('✅ Submission created successfully!');
      } catch (err) {
        console.error('Error creating submission:', err);

        // Enhanced error logging for debugging
        if (err instanceof Error) {
          console.error('Error details:', {
            message: err.message,
            name: err.name,
            stack: err.stack,
          });
        }

        const errorMessage =
          err instanceof Error ? err.message : 'Failed to create submission';
        setError(errorMessage);
        throw err;
      } finally {
        setIsCreating(false);
      }
    },
    [
      submissionContract,
      questBoardContract,
      address,
      userProfile,
      queryClient,
      chainId,
      signer,
    ]
  );

  return {
    createSubmission,
    isCreating,
    error,
  };
};

// Hook to fetch submissions for a quest
export const useQuestSubmissions = (questId: string | undefined) => {
  return useQuery<FirebaseSubmission[]>({
    queryKey: ['submissions', questId],
    queryFn: async (): Promise<FirebaseSubmission[]> => {
      if (!questId) return [];
      return await firebaseService.getSubmissionsByQuest(questId);
    },
    enabled: !!questId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
};
