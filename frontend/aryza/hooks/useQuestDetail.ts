import { useQuery } from '@tanstack/react-query';
import { gql, request } from 'graphql-request';
import { ethers } from 'ethers';
import Avvvatars from 'avvvatars-react';

interface SubgraphQuestDetail {
  questId: string;
  title: string;
  description: string;
  bountyAmount: string;
  status: 'CREATED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  creator: {
    username: string;
    reputation: string;
  };
  participants: Array<{
    user: {
      username: string;
    };
    joinedAt: string;
    isActive: boolean;
  }>;
  submissions: Array<{
    submitter: {
      username: string;
    };
    status: string;
    isWinner: boolean;
    likeCount: string;
    commentCount: string;
  }>;
  winners: string[];
  metadataURI?: string;
  questType?: 'INDIVIDUAL' | 'COLLABORATIVE' | 'COMPETITION';
  maxParticipants?: string;
  submissionDeadline?: string;
  createdAt?: string;
  tags?: string[];
  skillsRequired?: string[];
}

interface SubgraphQuestDetailResponse {
  quest: SubgraphQuestDetail | null;
}

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

const QUEST_DETAIL_QUERY = gql`
  query GetQuestDetail($id: String!) {
    quest(id: $id) {
      questId
      title
      description
      bountyAmount
      status
      creator {
        username
        reputation
      }
      participants(first: 10) {
        user {
          username
        }
        joinedAt
        isActive
      }
      submissions(first: 5) {
        submitter {
          username
        }
        status
        isWinner
        likeCount
        commentCount
      }
      winners
      metadataURI
      questType
      maxParticipants
      submissionDeadline
      createdAt
      tags
      skillsRequired
    }
  }
`;

const SUBGRAPH_URL =
  'https://api.studio.thegraph.com/query/117682/first/version/latest';
const SUBGRAPH_HEADERS = {
  Authorization: 'Bearer 8bc64f5ab2554c33e35df2b552b79818',
};

const inferCategory = (quest: SubgraphQuestDetail): string => {
  if (quest.tags && quest.tags.length > 0) {
    const tag = quest.tags[0];
    if (
      [
        'Development',
        'Design',
        'Writing',
        'Music',
        'Animation',
        'NFT',
      ].includes(tag)
    ) {
      return tag;
    }
  }

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

const calculateDeadline = (
  createdAt?: string,
  submissionDeadline?: string
): string => {
  if (submissionDeadline) {
    const deadline = parseInt(submissionDeadline);
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = deadline - now;

    if (timeLeft <= 0) return 'Expired';

    const daysLeft = Math.floor(timeLeft / (24 * 60 * 60));
    const hoursLeft = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60));

    if (daysLeft > 0) return `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`;
    if (hoursLeft > 0)
      return `${hoursLeft} hour${hoursLeft > 1 ? 's' : ''} left`;
    return 'Less than 1 hour left';
  }

  if (createdAt) {
    const deadlineTimestamp = parseInt(createdAt) + 7 * 24 * 60 * 60;
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = deadlineTimestamp - now;

    if (timeLeft <= 0) return 'Expired';

    const daysLeft = Math.floor(timeLeft / (24 * 60 * 60));
    const hoursLeft = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60));

    if (daysLeft > 0) return `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`;
    if (hoursLeft > 0)
      return `${hoursLeft} hour${hoursLeft > 1 ? 's' : ''} left`;
    return 'Less than 1 hour left';
  }

  return '7 days left';
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

const getGenericRequirements = (category: string): string[] => {
  const commonRequirements = [
    'Original work only - no plagiarism or unauthorized use of copyrighted material',
    'Submit all source files and assets used in creation',
    'Provide clear documentation or explanation of your work process',
    'Meet the specified deadline for submission',
    'Follow community guidelines and maintain professional standards',
  ];

  const categorySpecific = {
    Design: [
      'Minimum resolution: 1920x1080px for digital designs',
      'Acceptable formats: PNG, JPG, SVG, or PDF with source files',
      'Include color palette and font specifications used',
    ],
    Development: [
      'Clean, well-commented code with proper documentation',
      'Include setup/installation instructions',
      'Provide testing documentation and examples',
      'Use version control (Git) for project management',
    ],
    Writing: [
      'Original content with proper grammar and spelling',
      'Word count as specified in quest description',
      'Include bibliography/sources if applicable',
      'Submit in common formats (DOC, PDF, or TXT)',
    ],
    Music: [
      'High-quality audio files (minimum 44.1kHz/16-bit)',
      'Acceptable formats: WAV, FLAC, or high-quality MP3',
      'Include project files from your DAW if requested',
      'Provide stems or individual tracks if specified',
    ],
    Animation: [
      'Minimum resolution: 1080p for video content',
      'Acceptable formats: MP4, MOV, or AVI',
      'Include project files from animation software',
      'Provide storyboard or concept sketches',
    ],
    NFT: [
      'High-resolution artwork (minimum 1000x1000px)',
      'Include metadata and description for NFT',
      'Provide both display and full-resolution versions',
      'Follow platform-specific requirements for minting',
    ],
  };

  const specific =
    categorySpecific[category as keyof typeof categorySpecific] || [];
  return [...specific, ...commonRequirements];
};

const getGenericDeliverables = (category: string): string[] => {
  const commonDeliverables = [
    'Complete project files and documentation',
    'Brief project summary and creative process explanation',
    'List of tools, software, or resources used',
  ];

  const categorySpecific = {
    Design: [
      'Final design files in specified formats and resolutions',
      'Source files (PSD, AI, Sketch, Figma, etc.)',
      'Asset library including fonts, icons, and images used',
      'Style guide or design specifications document',
    ],
    Development: [
      'Complete source code with documentation',
      'README file with setup and usage instructions',
      'Test cases and documentation',
      'Deployed application or demo link (if applicable)',
    ],
    Writing: [
      'Final written content in requested format',
      'Draft versions showing revision process',
      'Research notes and source materials',
      'Content outline or structure document',
    ],
    Music: [
      'Final audio tracks in specified formats',
      'Individual stems or instrument tracks',
      'Project files from digital audio workstation',
      'Lyrics, sheet music, or composition notes',
    ],
    Animation: [
      'Final animation/video in specified format and resolution',
      'Project files from animation software',
      'Individual frames or keyframe sequences',
      'Storyboard and animation timeline',
    ],
    NFT: [
      'High-resolution artwork files',
      'NFT metadata and description',
      'Concept sketches and development process',
      'Marketing assets (thumbnails, previews)',
    ],
  };

  const specific = categorySpecific[
    category as keyof typeof categorySpecific
  ] || [
    'Project deliverables as specified in quest description',
    'Supporting materials and documentation',
  ];

  return [...specific, ...commonDeliverables];
};

const formatTimestamp = (timestamp: string): string => {
  const date = new Date(parseInt(timestamp) * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const transformQuestDetail = (
  subgraphQuest: SubgraphQuestDetail
): QuestDetail => {
  const category = inferCategory(subgraphQuest);
  const difficulty = inferDifficulty(subgraphQuest.bountyAmount);
  const status = mapStatus(subgraphQuest.status);
  const deadline = calculateDeadline(
    subgraphQuest.createdAt,
    subgraphQuest.submissionDeadline
  );
  const color = getCategoryColor(category);

  const mapSubmissionStatus = (
    status: string,
    isWinner: boolean
  ): 'pending' | 'approved' | 'rejected' | 'winner' => {
    if (isWinner) return 'winner';

    const statusLower = status.toLowerCase();
    if (statusLower.includes('approved') || statusLower === 'accepted')
      return 'approved';
    if (statusLower.includes('rejected') || statusLower === 'declined')
      return 'rejected';
    return 'pending';
  };

  const submissions: Submission[] = subgraphQuest.submissions.map(
    (sub, index) => ({
      id: (index + 1).toString(),
      author: {
        address: '0x' + Math.random().toString(16).substr(2, 40),
        username: sub.submitter.username,
        avatar: `https://images.unsplash.com/photo-${
          1500000000 + Math.floor(Math.random() * 1000000)
        }?w=100&h=100&fit=crop&crop=face`,
      },
      content: `Submission by ${sub.submitter.username}`,
      description:
        'A detailed submission following the quest requirements and showcasing creative expertise.',
      timestamp: '2 hours ago',
      votes: parseInt(sub.likeCount),
      status: mapSubmissionStatus(sub.status, sub.isWinner),
      previewUrl:
        Math.random() > 0.5
          ? `https://images.unsplash.com/photo-${
              1600000000 + Math.floor(Math.random() * 100000)
            }?w=400&h=400&fit=crop`
          : undefined,
    })
  );

  const hasWinners = subgraphQuest.winners && subgraphQuest.winners.length > 0;

  return {
    id: subgraphQuest.questId,
    title: subgraphQuest.title,
    description: subgraphQuest.description,
    longDescription:
      subgraphQuest.description +
      '\n\nThis quest offers an opportunity to showcase your skills and creativity while earning rewards. Follow the requirements carefully and submit your best work to compete for the bounty.',
    category,
    reward: `${parseFloat(
      ethers.formatEther(subgraphQuest.bountyAmount)
    ).toFixed(3)} XTZ`,
    creator: {
      address: '0x' + '0'.repeat(36) + subgraphQuest.questId.padStart(4, '0'),
      username: subgraphQuest.creator.username,
      avatar: `https://images.unsplash.com/photo-${
        1500000000 + parseInt(subgraphQuest.questId)
      }?w=100&h=100&fit=crop&crop=face`,
      reputation: parseInt(subgraphQuest.creator.reputation),
    },
    participants: subgraphQuest.participants.length,
    maxParticipants: subgraphQuest.maxParticipants
      ? parseInt(subgraphQuest.maxParticipants)
      : 50,
    deadline,
    createdAt: subgraphQuest.createdAt
      ? formatTimestamp(subgraphQuest.createdAt)
      : 'Recently',
    difficulty,
    status: hasWinners ? 'Completed' : status,
    tags: subgraphQuest.tags?.length ? subgraphQuest.tags : [category],
    color,
    requirements: getGenericRequirements(category),
    deliverables: getGenericDeliverables(category),
    submissions,
    hasWinners,
    winners: subgraphQuest.winners || [],
  };
};

export const useQuestDetail = (id: string | string[] | undefined) => {
  const questId = id ? (Array.isArray(id) ? id[0] : id) : '';

  // Format ID with 0x prefix and padding
  const formatId = (rawId: string): string => {
    if (!rawId) return '';
    const numericId = rawId.replace(/^0x/, '');
    return `0x${numericId.padStart(2, '0')}`;
  };

  const formattedId = formatId(questId);

  return useQuery<QuestDetail>({
    queryKey: ['quest-detail', formattedId],
    queryFn: async (): Promise<QuestDetail> => {
      if (!formattedId) {
        throw new Error('Quest ID is required');
      }

      try {
        const response = await request<SubgraphQuestDetailResponse>(
          SUBGRAPH_URL,
          QUEST_DETAIL_QUERY,
          { id: formattedId },
          SUBGRAPH_HEADERS
        );

        if (!response.quest) {
          throw new Error('Quest not found');
        }

        return transformQuestDetail(response.quest);
      } catch (error) {
        console.error('Error fetching quest detail from subgraph:', error);
        throw error;
      }
    },
    enabled: !!formattedId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
};
