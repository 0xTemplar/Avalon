import React from 'react';
import { useState, useEffect } from 'react';

// Component imports
import Navigation from '../components/navigation/Navigation';
import HeroSection from '../components/hero/HeroSection';
import StatsTicker from '../components/stats/StatsTicker';
import QuestFilters from '../components/filters/QuestFilters';
import QuestSection from '../components/quests/QuestSection';
import CreateQuestModal from '../components/modals/CreateQuestModal';
import Footer from '../components/footer/Footer';
import BackgroundElements from '../components/ui/BackgroundElements';
import GlobalStyles from '../components/ui/GlobalStyles';

// Type imports
import { Quest } from '../components/quests/types';

const mockQuests: Quest[] = [
  {
    id: '1',
    title: 'Design a Cyberpunk Album Cover',
    description:
      'Create an original album cover for an electronic music artist. Must incorporate neon aesthetics and futuristic elements.',
    category: 'Design',
    reward: '0.5 XTZ',
    creator: {
      address: '0x742d...5f8c',
      username: 'CyberArtist',
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
    },
    participants: 12,
    deadline: '3 days left',
    difficulty: 'Medium',
    status: 'Active',
    tags: ['Design', 'Music', 'Digital Art'],
    color: '#00ff88',
  },
  {
    id: '2',
    title: 'Write a Sci-Fi Short Story',
    description:
      'Craft a 2000-word science fiction story set in a post-apocalyptic world where AI and humans coexist.',
    category: 'Writing',
    reward: '0.3 XTZ',
    creator: {
      address: '0x8f3a...2d1e',
      username: 'StoryWeaver',
      avatar:
        'https://images.unsplash.com/photo-1494790108755-2616b332c3c8?w=100&h=100&fit=crop&crop=face',
    },
    participants: 8,
    deadline: '5 days left',
    difficulty: 'Easy',
    status: 'Active',
    tags: ['Writing', 'Fiction', 'Creative'],
    color: '#ff00ff',
  },
  {
    id: '3',
    title: 'Compose Ambient Soundtrack',
    description:
      'Create a 5-minute ambient music piece for a meditation app. Should evoke calmness and transcendence.',
    category: 'Music',
    reward: '0.8 XTZ',
    creator: {
      address: '0x1a9b...7c3d',
      username: 'ZenComposer',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    },
    participants: 5,
    deadline: '7 days left',
    difficulty: 'Hard',
    status: 'Active',
    tags: ['Music', 'Audio', 'Meditation'],
    color: '#00ffff',
  },
  {
    id: '4',
    title: 'Design NFT Collection Concept',
    description:
      'Conceptualize and design a unique NFT collection with 10 sample pieces. Theme: "Digital Renaissance".',
    category: 'Design',
    reward: '1.2 XTZ',
    creator: {
      address: '0x5e2f...9a1b',
      username: 'NFTVisionary',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    },
    participants: 20,
    deadline: '2 days left',
    difficulty: 'Hard',
    status: 'Active',
    tags: ['NFT', 'Design', 'Blockchain'],
    color: '#ffff00',
  },
  {
    id: '5',
    title: 'Create Motion Graphics Loop',
    description:
      'Design a seamless 10-second motion graphics loop for social media. Theme: "Future of Work".',
    category: 'Animation',
    reward: '0.4 XTZ',
    creator: {
      address: '0x3c7e...4f2a',
      username: 'MotionMaster',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    },
    participants: 15,
    deadline: '4 days left',
    difficulty: 'Medium',
    status: 'Active',
    tags: ['Animation', 'Motion', 'Social Media'],
    color: '#ff8800',
  },
  {
    id: '6',
    title: 'Poetry Collection on Web3',
    description:
      'Write a collection of 5 poems exploring themes of decentralization, community, and digital identity.',
    category: 'Writing',
    reward: '0.25 XTZ',
    creator: {
      address: '0x9d8c...6e5f',
      username: 'DigitalPoet',
      avatar:
        'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100&h=100&fit=crop&crop=face',
    },
    participants: 6,
    deadline: '6 days left',
    difficulty: 'Easy',
    status: 'Active',
    tags: ['Poetry', 'Writing', 'Web3'],
    color: '#88ff00',
  },
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'reward' | 'deadline' | 'participants'>(
    'reward'
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    { id: 1, text: 'New quest posted: "Create 3D Avatar"', time: '2m ago' },
    { id: 2, text: 'Your submission was accepted!', time: '1h ago' },
    { id: 3, text: 'Quest deadline approaching', time: '3h ago' },
  ]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [bookmarkedQuests, setBookmarkedQuests] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    // Set mobile state
    setIsMobile(window.innerWidth <= 768);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    if (window.innerWidth > 768) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const categories = ['All', 'Design', 'Writing', 'Music', 'Animation', 'NFT'];

  const toggleBookmark = (questId: string) => {
    setBookmarkedQuests((prev) =>
      prev.includes(questId)
        ? prev.filter((id) => id !== questId)
        : [...prev, questId]
    );
  };

  // Filter and sort quests
  let filteredQuests =
    selectedCategory === 'All'
      ? mockQuests
      : mockQuests.filter((quest) => quest.category === selectedCategory);

  if (selectedDifficulty !== 'All') {
    filteredQuests = filteredQuests.filter(
      (quest) => quest.difficulty === selectedDifficulty
    );
  }

  if (searchQuery) {
    filteredQuests = filteredQuests.filter(
      (quest) =>
        quest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quest.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quest.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );
  }

  // Sort
  filteredQuests = [...filteredQuests].sort((a, b) => {
    switch (sortBy) {
      case 'reward':
        return parseFloat(b.reward) - parseFloat(a.reward);
      case 'deadline':
        return parseInt(a.deadline) - parseInt(b.deadline);
      case 'participants':
        return b.participants - a.participants;
      default:
        return 0;
    }
  });

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#000',
        cursor: !isMobile ? 'crosshair' : 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <GlobalStyles />

      <BackgroundElements
        isMobile={isMobile}
        mousePos={mousePos}
        hoveredCard={hoveredCard}
      />

      <Navigation
        isMobile={isMobile}
        isWalletConnected={isWalletConnected}
        setIsWalletConnected={setIsWalletConnected}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        notifications={notifications}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
        setShowCreateModal={setShowCreateModal}
      />

      <HeroSection
        isMobile={isMobile}
        setShowCreateModal={setShowCreateModal}
      />

      <StatsTicker isMobile={isMobile} />

      <QuestFilters
        isMobile={isMobile}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedDifficulty={selectedDifficulty}
        setSelectedDifficulty={setSelectedDifficulty}
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      <QuestSection
        quests={filteredQuests}
        isMobile={isMobile}
        viewMode={viewMode}
        hoveredCard={hoveredCard}
        setHoveredCard={setHoveredCard}
        bookmarkedQuests={bookmarkedQuests}
        toggleBookmark={toggleBookmark}
      />

      <CreateQuestModal
        showCreateModal={showCreateModal}
        setShowCreateModal={setShowCreateModal}
      />

      <Footer isMobile={isMobile} />
    </div>
  );
}
