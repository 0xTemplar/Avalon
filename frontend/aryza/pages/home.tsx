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

// Hook imports
import { useSubgraphQuests } from '../hooks/useSubgraphQuests';

export default function Home() {
  // Fetch real quests from subgraph
  const {
    data: subgraphQuests,
    isLoading: isLoadingQuests,
    error: questsError,
    refetch: refetchQuests,
  } = useSubgraphQuests(20, 'createdAt', 'desc');
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

  const categories = [
    'All',
    'Design',
    'Writing',
    'Music',
    'Animation',
    'NFT',
    'Development',
    'General',
  ];

  const toggleBookmark = (questId: string) => {
    setBookmarkedQuests((prev) =>
      prev.includes(questId)
        ? prev.filter((id) => id !== questId)
        : [...prev, questId]
    );
  };

  // Use subgraph data or empty array if loading/error
  const questsData = subgraphQuests || [];

  // Filter and sort quests
  let filteredQuests =
    selectedCategory === 'All'
      ? questsData
      : questsData.filter((quest) => quest.category === selectedCategory);

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
        isLoading={isLoadingQuests}
        error={questsError}
        onRetry={() => refetchQuests()}
      />

      <CreateQuestModal
        showCreateModal={showCreateModal}
        setShowCreateModal={setShowCreateModal}
      />

      <Footer isMobile={isMobile} />
    </div>
  );
}
