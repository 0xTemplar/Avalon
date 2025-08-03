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
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

export default function QuestSection({
  quests,
  isMobile,
  viewMode,
  hoveredCard,
  setHoveredCard,
  bookmarkedQuests,
  toggleBookmark,
  isLoading,
  error,
  onRetry,
}: QuestSectionProps) {
  return (
    <section
      style={{
        padding: !isMobile ? '80px 40px 120px' : '40px 20px 80px',
        maxWidth: '1400px',
        margin: '0 auto',
      }}
    >
      {isLoading ? (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 20px',
            color: '#666',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              width: '40px',
              height: '40px',
              border: '3px solid #333',
              borderRadius: '50%',
              borderTopColor: '#00ff88',
              animation: 'spin 1s ease-in-out infinite',
              marginBottom: '16px',
            }}
          />
          <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>
            LOADING QUESTS
          </h3>
          <p>Fetching the latest quests from the blockchain...</p>
        </div>
      ) : error ? (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 20px',
            color: '#666',
          }}
        >
          <h3
            style={{ fontSize: '24px', marginBottom: '16px', color: '#ff0088' }}
          >
            ERROR LOADING QUESTS
          </h3>
          <p style={{ marginBottom: '24px' }}>
            Failed to fetch quests from the blockchain. Please try again.
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              style={{
                padding: '12px 24px',
                background: '#00ff88',
                color: '#000',
                border: 'none',
                fontSize: '12px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontWeight: '600',
                cursor: 'pointer',
                clipPath:
                  'polygon(0 0, calc(100% - 10px) 0, 100% 100%, 10px 100%)',
              }}
            >
              RETRY →
            </button>
          )}
        </div>
      ) : quests.length === 0 ? (
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
