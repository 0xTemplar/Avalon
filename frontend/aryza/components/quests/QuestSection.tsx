import React from 'react';
import { Quest } from './types';
import QuestGrid from './QuestGrid';
import QuestList from './QuestList';

interface QuestSectionProps {
  quests: Quest[];
  isMobile: boolean;
  viewMode: 'grid' | 'list';
  hoveredCard: string | null;
  setHoveredCard: (id: string | null) => void;
  bookmarkedQuests: string[];
  toggleBookmark: (questId: string) => void;
}

export default function QuestSection({
  quests,
  isMobile,
  viewMode,
  hoveredCard,
  setHoveredCard,
  bookmarkedQuests,
  toggleBookmark,
}: QuestSectionProps) {
  return (
    <section
      style={{
        padding: !isMobile ? '80px 40px 120px' : '40px 20px 80px',
        maxWidth: '1400px',
        margin: '0 auto',
      }}
    >
      {quests.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 20px',
            color: '#666',
          }}
        >
          <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>
            NO QUESTS FOUND
          </h3>
          <p>Try adjusting your filters or search query</p>
        </div>
      ) : viewMode === 'grid' ? (
        <QuestGrid
          quests={quests}
          isMobile={isMobile}
          hoveredCard={hoveredCard}
          setHoveredCard={setHoveredCard}
          bookmarkedQuests={bookmarkedQuests}
          toggleBookmark={toggleBookmark}
        />
      ) : (
        <QuestList
          quests={quests}
          bookmarkedQuests={bookmarkedQuests}
          toggleBookmark={toggleBookmark}
        />
      )}
    </section>
  );
}
