import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

const SUBGRAPH_URL =
  'https://api.studio.thegraph.com/query/117682/first/v0.0.9';

export interface SubgraphUser {
  id: string;
  username: string | null;
  reputation: string;
  totalQuestsCreated: string;
  totalQuestsCompleted: string;
  totalRewardsEarned: string;
  skills: string[];
  createdQuests: {
    id: string;
    questId: string;
    title: string;
    bountyAmount: string;
    status: string;
    participantCount: string;
  }[];
}

interface SubgraphResponse {
  data: {
    user: SubgraphUser | null;
  };
}

const fetchUserFromSubgraph = async (
  address: string
): Promise<SubgraphUser | null> => {
  if (!address) return null;

  const query = `
    {
      user(id: "${address.toLowerCase()}") {
        id
        username
        reputation
        totalQuestsCreated
        totalQuestsCompleted
        totalRewardsEarned
        skills
        createdQuests(first: 10, orderBy: createdAt, orderDirection: desc) {
          id
          questId
          title
          bountyAmount
          status
          participantCount
        }
      }
    }
  `;

  try {
    const response = await fetch(SUBGRAPH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: SubgraphResponse = await response.json();
    return result.data.user;
  } catch (error) {
    console.error('Error fetching user from subgraph:', error);
    throw error;
  }
};

export const useSubgraphUserProfile = (address?: string) => {
  const normalizedAddress = address?.toLowerCase();

  const query = useQuery<SubgraphUser | null>({
    queryKey: ['subgraph-user', normalizedAddress],
    queryFn: () => fetchUserFromSubgraph(normalizedAddress!),
    enabled: !!normalizedAddress,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });

  // Transform and format data for easier use
  const formattedData = useMemo(() => {
    if (!query.data) return null;

    return {
      ...query.data,
      formattedReputation: parseInt(query.data.reputation).toLocaleString(),
      formattedTotalRewards: `${(
        parseFloat(query.data.totalRewardsEarned) / 1e18
      ).toFixed(2)} ETH`,
      hasProfile: query.data.username !== null,
      displayName:
        query.data.username ||
        `${query.data.id.slice(0, 6)}...${query.data.id.slice(-4)}`,
    };
  }, [query.data]);

  return {
    ...query,
    data: formattedData,
  };
};
