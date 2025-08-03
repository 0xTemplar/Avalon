import { useQuery } from '@tanstack/react-query';
import { gql, request } from 'graphql-request';
import { ethers } from 'ethers';
import { Quest } from '../components/quests/types';

interface SubgraphQuest {
  questId: string;
  title: string;
  bountyAmount: string;
  status: 'CREATED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  participantCount: string;
  submissionCount: string;
  creator: {
    username: string;
    reputation: string;
  };
  createdAt: string;
}

interface SubgraphResponse {
  quests: SubgraphQuest[];
}

const QUESTS_QUERY = gql`
  query GetQuests($first: Int!, $orderBy: String!, $orderDirection: String!) {
    quests(first: $first, orderBy: $orderBy, orderDirection: $orderDirection) {
      questId
      title
      bountyAmount
      status
      participantCount
      submissionCount
      creator {
        username
        reputation
      }
      createdAt
    }
  }
`;

const SUBGRAPH_URL =
  'https://api.studio.thegraph.com/query/117682/first/v0.0.8';
const SUBGRAPH_HEADERS = {
  Authorization: 'Bearer 8bc64f5ab2554c33e35df2b552b79818',
};

const inferCategory = (quest: SubgraphQuest): string => {
  const title = quest.title.toLowerCase();

  if (title.includes('design')) return 'Design';
  if (title.includes('write') || title.includes('story')) return 'Writing';
  if (title.includes('music') || title.includes('audio')) return 'Music';
  if (title.includes('animation') || title.includes('motion'))
    return 'Animation';
  if (title.includes('nft')) return 'NFT';
  if (
    title.includes('develop') ||
    title.includes('code') ||
    title.includes('app')
  )
    return 'Development';

  return 'General';
};

const inferDifficulty = (bountyWei: string): 'Easy' | 'Medium' | 'Hard' => {
  const bountyEth = parseFloat(ethers.formatEther(bountyWei));

  if (bountyEth < 0.1) return 'Easy';
  if (bountyEth < 0.5) return 'Medium';
  return 'Hard';
};

const mapStatus = (
  subgraphStatus: string
): 'Active' | 'Completed' | 'Expired' => {
  switch (subgraphStatus) {
    case 'CREATED':
    case 'ACTIVE':
      return 'Active';
    case 'COMPLETED':
      return 'Completed';
    case 'CANCELLED':
      return 'Expired';
    default:
      return 'Active';
  }
};

const calculateDeadline = (createdAt: string): string => {
  const deadlineTimestamp = parseInt(createdAt) + 7 * 24 * 60 * 60;
  const now = Math.floor(Date.now() / 1000);
  const timeLeft = deadlineTimestamp - now;

  if (timeLeft <= 0) return 'Expired';

  const daysLeft = Math.floor(timeLeft / (24 * 60 * 60));
  const hoursLeft = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60));

  if (daysLeft > 0) return `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`;
  if (hoursLeft > 0) return `${hoursLeft} hour${hoursLeft > 1 ? 's' : ''} left`;
  return 'Less than 1 hour left';
};

const getCategoryColor = (category: string): string => {
  const colors = {
    Design: '#00ff88',
    Writing: '#ff00ff',
    Music: '#00ffff',
    Animation: '#ff8800',
    NFT: '#ffff00',
    Development: '#8800ff',
    General: '#00ff88',
  };
  return colors[category as keyof typeof colors] || '#ffffff';
};

// Transform subgraph quest to UI quest
const transformQuest = (subgraphQuest: SubgraphQuest): Quest => {
  const category = inferCategory(subgraphQuest);
  const difficulty = inferDifficulty(subgraphQuest.bountyAmount);
  const status = mapStatus(subgraphQuest.status);
  const deadline = calculateDeadline(subgraphQuest.createdAt);
  const color = getCategoryColor(category);

  return {
    id: subgraphQuest.questId,
    title: subgraphQuest.title,
    description:
      'Complete this quest to earn rewards and build your reputation in the community.',
    category,
    reward: `${parseFloat(
      ethers.formatEther(subgraphQuest.bountyAmount)
    ).toFixed(3)} ETH`,
    creator: {
      address: '0x' + '0'.repeat(36) + subgraphQuest.questId.padStart(4, '0'),
      username: subgraphQuest.creator.username,
      avatar: `https://images.unsplash.com/photo-${
        1500000000 + parseInt(subgraphQuest.questId)
      }?w=100&h=100&fit=crop&crop=face`, // Mock avatar
    },
    participants: parseInt(subgraphQuest.participantCount),
    deadline,
    difficulty,
    status,
    tags: [category],
    color,
  };
};

export const useSubgraphQuests = (
  first: number = 10,
  orderBy: string = 'createdAt',
  orderDirection: string = 'desc'
) => {
  return useQuery<Quest[]>({
    queryKey: ['subgraph-quests', first, orderBy, orderDirection],
    queryFn: async (): Promise<Quest[]> => {
      try {
        const response = await request<SubgraphResponse>(
          SUBGRAPH_URL,
          QUESTS_QUERY,
          { first, orderBy, orderDirection },
          SUBGRAPH_HEADERS
        );

        return response.quests.map(transformQuest);
      } catch (error) {
        console.error('Error fetching quests from subgraph:', error);
        throw error;
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export type { SubgraphQuest, SubgraphResponse };
