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
import { useHybridQuests } from '../hooks/useHybridQuests';

export default function Home() {
  // Fetch quests using hybrid approach (Firebase + Subgraph fallback)
  const {
    data: questsData,
    isLoading: isLoadingQuests,
    error: questsError,
    refetch: refetchQuests,
    dataSource,
    stats,
  } = useHybridQuests({
    limitCount: 20,
    orderBy: 'createdAt',
    orderDirection: 'desc',
    useRealTime: true,
    fallbackToSubgraph: true,
  });
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

  // Quest data comes directly from hybrid hook

  // IDs to hide from the quest list
  const hiddenQuestIds = ['1', '4', '7', '3', '6', '8'];

  // Filter and sort quests
  let filteredQuests =
    selectedCategory === 'All'
      ? (questsData || []).filter((quest) => !hiddenQuestIds.includes(quest.id))
      : (questsData || []).filter(
          (quest) =>
            quest.category === selectedCategory &&
            !hiddenQuestIds.includes(quest.id)
        );

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

      {/* Data Source Indicator */}
      {(dataSource === 'firebase' || stats.firebaseCount > 0) && (
        <div
          style={{
            textAlign: 'center',
            margin: '20px 0 10px',
            opacity: 0.7,
            fontSize: '14px',
          }}
        >
          {dataSource === 'firebase' ? (
            <span style={{ color: '#00ff88' }}>
              🔥 Real-time data ({stats.firebaseCount} quests from Firebase)
            </span>
          ) : stats.usingFallback ? (
            <span style={{ color: '#ff8c00' }}>
              📊 Subgraph fallback ({stats.subgraphCount} quests)
            </span>
          ) : (
            <span style={{ color: '#888' }}>📈 Hybrid mode active</span>
          )}
        </div>
      )}

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
