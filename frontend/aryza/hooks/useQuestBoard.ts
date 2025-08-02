import { useState, useCallback, useMemo } from 'react';
import { Contract, ethers } from 'ethers';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usePrivyEthers } from './usePrivyEthers';
import {
  CONTRACT_ADDRESSES,
  ETHERLINK_TESTNET_CHAIN_ID,
} from '../contracts/addresses';
import QuestBoardABI from '../abi/QuestBoard.json';
import { toast } from 'react-toastify';

export enum QuestType {
  Individual = 0,
  Collaborative = 1,
  Competition = 2,
}

export interface QuestRequirements {
  skillsRequired: string[];
  minReputation: number;
  kycRequired: boolean;
  allowedFileTypes: string[];
  maxFileSize: number;
}

export interface CreateQuestParams {
  title: string;
  description: string;
  metadataURI: string;
  questType: QuestType;
  bountyAmount: string; // ETH amount as string
  bountyToken: string; // Use ethers.ZeroAddress for ETH
  maxParticipants: number;
  maxCollaborators: number;
  submissionDeadline: number; // Unix timestamp
  reviewDeadline: number; // Unix timestamp
  requiresApproval: boolean;
  tags: string[];
  requirements: QuestRequirements;
}

export interface Quest {
  id: bigint;
  creator: string;
  title: string;
  description: string;
  metadataURI: string;
  questType: QuestType;
  bountyAmount: bigint;
  bountyToken: string;
  maxParticipants: bigint;
  maxCollaborators: bigint;
  submissionDeadline: bigint;
  reviewDeadline: bigint;
  requiresApproval: boolean;
  tags: string[];
  requirements: QuestRequirements;
  isActive: boolean;
  createdAt: bigint;
}

export const useQuestBoard = () => {
  const { provider, signer, address, chainId } = usePrivyEthers();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  // Create contract instance
  const contract = useMemo(() => {
    if (!provider) return null;
    return new Contract(
      CONTRACT_ADDRESSES.QuestBoard,
      QuestBoardABI,
      signer || provider
    );
  }, [provider, signer]);

  // Get active quests
  const {
    data: activeQuests,
    isLoading: isLoadingQuests,
    refetch: refetchQuests,
  } = useQuery({
    queryKey: ['activeQuests'],
    queryFn: async (): Promise<number[]> => {
      if (!contract) return [];
      try {
        const questIds = await contract.getActiveQuests();
        return questIds.map((id: bigint) => Number(id));
      } catch (error) {
        console.error('Error fetching active quests:', error);
        return [];
      }
    },
    enabled: !!contract,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get quest details
  const getQuest = useCallback(
    async (questId: number): Promise<Quest | null> => {
      if (!contract) return null;
      try {
        const questData = await contract.getQuest(questId);
        return {
          id: questData.id,
          creator: questData.creator,
          title: questData.title,
          description: questData.description,
          metadataURI: questData.metadataURI,
          questType: questData.questType,
          bountyAmount: questData.bountyAmount,
          bountyToken: questData.bountyToken,
          maxParticipants: questData.maxParticipants,
          maxCollaborators: questData.maxCollaborators,
          submissionDeadline: questData.submissionDeadline,
          reviewDeadline: questData.reviewDeadline,
          requiresApproval: questData.requiresApproval,
          tags: questData.tags,
          requirements: questData.requirements,
          isActive: questData.isActive,
          createdAt: questData.createdAt,
        };
      } catch (error) {
        console.error('Error getting quest:', error);
        return null;
      }
    },
    [contract]
  );

  // Create quest
  const createQuest = useCallback(
    async (params: CreateQuestParams) => {
      if (!contract || !signer) {
        throw new Error('Contract or signer not available');
      }

      if (chainId !== ETHERLINK_TESTNET_CHAIN_ID) {
        throw new Error('Please switch to Etherlink Testnet');
      }

      try {
        setLoading(true);

        const bountyAmountWei = ethers.parseEther(params.bountyAmount);

        // Prepare requirements tuple
        const requirements = {
          skillsRequired: params.requirements.skillsRequired,
          minReputation: params.requirements.minReputation,
          kycRequired: params.requirements.kycRequired,
          allowedFileTypes: params.requirements.allowedFileTypes,
          maxFileSize: params.requirements.maxFileSize,
        };

        toast.info('Creating quest...', {
          position: 'top-right',
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          style: {
            background: '#0a0a0a',
            border: '1px solid #00ccff',
            color: '#fff',
            fontFamily: 'var(--font-space-grotesk)',
            fontSize: '12px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          },
        });

        const tx = await contract.createQuest(
          params.title,
          params.description,
          params.metadataURI,
          params.questType,
          bountyAmountWei,
          params.bountyToken,
          params.maxParticipants,
          params.maxCollaborators,
          params.submissionDeadline,
          params.reviewDeadline,
          params.requiresApproval,
          params.tags,
          requirements,
          {
            value:
              params.bountyToken === ethers.ZeroAddress ? bountyAmountWei : 0,
          }
        );

        const receipt = await tx.wait();

        // Extract quest ID from event
        let questId = 0;
        if (receipt && receipt.logs) {
          for (const log of receipt.logs) {
            try {
              const parsedLog = contract.interface.parseLog({
                topics: log.topics,
                data: log.data,
              });
              if (parsedLog && parsedLog.name === 'QuestCreated') {
                questId = Number(parsedLog.args.questId);
                break;
              }
            } catch (e) {
              // Continue searching
            }
          }
        }

        toast.success('Quest created successfully!', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          style: {
            background: '#0a0a0a',
            border: '1px solid #00ff88',
            color: '#fff',
            fontFamily: 'var(--font-space-grotesk)',
            fontSize: '12px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          },
        });

        // Refresh quests list
        queryClient.invalidateQueries({ queryKey: ['activeQuests'] });

        return { tx, questId };
      } catch (error: unknown) {
        console.error('Error creating quest:', error);

        let errorMessage = 'Failed to create quest';
        if (error && typeof error === 'object') {
          const err = error as { reason?: string; message?: string };
          if (err.reason) {
            errorMessage = err.reason;
          } else if (err.message && err.message.includes('user rejected')) {
            errorMessage = 'Transaction cancelled by user';
          }
        }

        toast.error(errorMessage, {
          position: 'top-right',
          autoClose: 4000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          style: {
            background: '#0a0a0a',
            border: '1px solid #ff0088',
            color: '#fff',
            fontFamily: 'var(--font-space-grotesk)',
            fontSize: '12px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          },
        });

        throw error;
      } finally {
        setLoading(false);
      }
    },
    [contract, signer, chainId, queryClient]
  );

  return {
    activeQuests,
    isLoadingQuests,
    loading,
    getQuest,
    createQuest,
    refetchQuests,
    contract,
  };
};
