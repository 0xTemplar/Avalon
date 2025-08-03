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
import { firebaseService, type FirebaseQuest } from '../lib/firebaseService';
import { usePrivy } from '@privy-io/react-auth';
import { useUserProfile } from './useUserProfile';

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
  description: string; // Stored both in contract and IPFS metadata
  metadataURI: string; // IPFS URI containing detailed metadata
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

interface QuestMetadata {
  title: string;
  description: string;
  requirements: QuestRequirements;
  tags: string[];
  questType: string;
  createdAt: string;
  creator: string;
  additionalInfo?: Record<string, unknown>;
}

// Helper function to fetch IPFS metadata
const fetchIPFSMetadata = async (
  ipfsUrl: string
): Promise<QuestMetadata | null> => {
  try {
    const response = await fetch(ipfsUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch IPFS metadata');
    }
    return (await response.json()) as QuestMetadata;
  } catch (error) {
    console.error('Error fetching IPFS metadata:', error);
    return null;
  }
};

export const useQuestBoard = () => {
  const { provider, signer, chainId } = usePrivyEthers();
  const { user } = usePrivy();
  const { profile } = useUserProfile(); // Get blockchain profile data
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

        // Fetch description from IPFS metadata, fallback to contract description
        let description =
          questData.description ||
          'Complete this quest to earn rewards and build your reputation.';
        if (questData.metadataURI) {
          const metadata = await fetchIPFSMetadata(questData.metadataURI);
          if (metadata && metadata.description) {
            description = metadata.description; // IPFS description takes priority
          }
        }

        return {
          id: questData.id,
          creator: questData.creator,
          title: questData.title,
          description: description, // From IPFS metadata
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
          params.description, // Keep for contract compatibility
          params.metadataURI, // IPFS metadata URI
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
            } catch {
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

        // Sync quest to Firebase immediately for real-time updates
        try {
          const creatorAddress = user?.wallet?.address || 'Unknown';
          const creatorUsername = profile?.username || 'Anonymous'; // Use blockchain username

          // Helper function to generate avatar string - using address or username
          const getAvatarString = () =>
            creatorAddress !== 'Unknown' ? creatorAddress : creatorUsername;

          // Helper function to infer category from tags and skills
          const inferCategory = (tags: string[], skills: string[]): string => {
            const allTerms = [...tags, ...skills].map((t) => t.toLowerCase());
            if (
              allTerms.some((t) =>
                ['ui', 'ux', 'design', 'figma', 'photoshop'].includes(t)
              )
            )
              return 'Design';
            if (
              allTerms.some((t) =>
                ['writing', 'content', 'copywriting', 'article'].includes(t)
              )
            )
              return 'Writing';
            if (
              allTerms.some((t) =>
                ['music', 'audio', 'sound', 'song'].includes(t)
              )
            )
              return 'Music';
            if (
              allTerms.some((t) =>
                ['animation', 'motion', 'video', '3d'].includes(t)
              )
            )
              return 'Animation';
            if (
              allTerms.some((t) =>
                ['nft', 'crypto', 'blockchain', 'token'].includes(t)
              )
            )
              return 'NFT';
            if (
              allTerms.some((t) =>
                ['code', 'development', 'programming', 'software'].includes(t)
              )
            )
              return 'Development';
            return 'General';
          };

          // Helper function to infer difficulty from bounty amount
          const inferDifficulty = (
            bountyAmount: string
          ): 'Easy' | 'Medium' | 'Hard' => {
            const amount = parseFloat(bountyAmount);
            if (amount <= 0.5) return 'Easy';
            if (amount <= 2.0) return 'Medium';
            return 'Hard';
          };

          // Generate color based on category
          const getCategoryColor = (category: string): string => {
            const colors: Record<string, string> = {
              Design: '#8B5CF6',
              Writing: '#06B6D4',
              Music: '#F59E0B',
              Animation: '#EF4444',
              NFT: '#10B981',
              Development: '#3B82F6',
              General: '#6B7280',
            };
            return colors[category] || '#6B7280';
          };

          const category = inferCategory(
            params.tags,
            params.requirements.skillsRequired
          );
          const difficulty = inferDifficulty(params.bountyAmount);
          const color = getCategoryColor(category);

          // Generate generic requirements and deliverables based on category
          const getGenericRequirements = (category: string): string[] => {
            const reqMap: Record<string, string[]> = {
              Design: [
                'Create original design concepts',
                'Use appropriate design software',
                'Follow brand guidelines',
                'Provide high-resolution files',
              ],
              Writing: [
                'Research the topic thoroughly',
                'Write in clear, engaging style',
                'Meet word count requirements',
                'Proofread for grammar and spelling',
              ],
              Music: [
                'Create original composition',
                'Use professional audio quality',
                'Match the requested genre/mood',
                'Provide both mixed and raw files',
              ],
              Animation: [
                'Create smooth, professional animations',
                'Use appropriate frame rates',
                'Deliver in requested format',
                'Include source files',
              ],
              NFT: [
                'Design unique digital artwork',
                'Ensure blockchain compatibility',
                'Follow NFT standards',
                'Provide metadata',
              ],
              Development: [
                'Write clean, documented code',
                'Follow coding best practices',
                'Include proper testing',
                'Provide deployment instructions',
              ],
              General: [
                'Follow project specifications',
                'Meet quality standards',
                'Submit on time',
                'Respond to feedback promptly',
              ],
            };
            return reqMap[category] || reqMap['General'];
          };

          const getGenericDeliverables = (category: string): string[] => {
            const delMap: Record<string, string[]> = {
              Design: [
                'Final design files (AI/PSD/Figma)',
                'High-resolution exports (PNG/JPG)',
                'Style guide document',
                'Source files',
              ],
              Writing: [
                'Final article/content',
                'Draft versions for review',
                'Research sources',
                'SEO optimization notes',
              ],
              Music: [
                'Master audio file (WAV/FLAC)',
                'Individual track stems',
                'MIDI files',
                'Composition notes',
              ],
              Animation: [
                'Final animation file (MP4/MOV)',
                'Individual scene files',
                'Source project files',
                'Asset library',
              ],
              NFT: [
                'Digital artwork files',
                'Metadata JSON',
                'Smart contract code',
                'Minting instructions',
              ],
              Development: [
                'Source code repository',
                'Documentation',
                'Test files',
                'Deployment guide',
              ],
              General: [
                'Project deliverables',
                'Progress reports',
                'Final presentation',
                'Source materials',
              ],
            };
            return delMap[category] || delMap['General'];
          };

          const firebaseQuestData: Omit<
            FirebaseQuest,
            'id' | 'createdAtTimestamp' | 'updatedAtTimestamp'
          > = {
            questId: questId.toString(),
            title: params.title,
            description: params.description,
            category,
            reward: params.bountyAmount,
            creator: {
              address: creatorAddress,
              username: creatorUsername,
              avatar: getAvatarString(),
              reputation: 20, // Default reputation
            },
            participants: 1, // Creator is first participant
            maxParticipants: params.maxParticipants,
            deadline: new Date(params.submissionDeadline * 1000).toISOString(),
            createdAt: new Date().toISOString(),
            difficulty,
            status: 'Active',
            tags: params.tags,
            color,
            requirements: getGenericRequirements(category),
            deliverables: getGenericDeliverables(category),
            hasWinners: false,
            winners: [],
            txHash: tx.hash,
          };

          await firebaseService.createQuest(firebaseQuestData);

          console.log(`🔥 Quest ${questId} synced to Firebase immediately!`);

          // Show Firebase sync success
          setTimeout(() => {
            toast.info('Quest available in real-time! 🔥', {
              position: 'top-right',
              autoClose: 2000,
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
          }, 1000);
        } catch (firebaseError) {
          console.error('Failed to sync quest to Firebase:', firebaseError);
          // Don't throw - Firebase sync failure shouldn't block quest creation
          toast.warning('Quest created but real-time sync failed', {
            position: 'top-right',
            autoClose: 3000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: false,
            style: {
              background: '#0a0a0a',
              border: '1px solid #ff8c00',
              color: '#fff',
              fontFamily: 'var(--font-space-grotesk)',
              fontSize: '12px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            },
          });
        }

        // Refresh quests list
        queryClient.invalidateQueries({ queryKey: ['activeQuests'] });
        // Also refresh subgraph quests
        queryClient.invalidateQueries({ queryKey: ['subgraph-quests'] });

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
    [
      contract,
      signer,
      chainId,
      queryClient,
      user?.wallet?.address,
      profile?.username,
    ]
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
