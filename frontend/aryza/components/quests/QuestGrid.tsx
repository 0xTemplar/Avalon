import React from 'react';
import { Quest } from './types';

interface QuestGridProps {
  quests: Quest[];
  isMobile: boolean;
  hoveredCard: string | null;
  setHoveredCard: (id: string | null) => void;
  bookmarkedQuests: string[];
  toggleBookmark: (questId: string) => void;
}

const getDifficultySymbol = (difficulty: string) => {
  switch (difficulty) {
    case 'Easy':
      return '◆';
    case 'Medium':
      return '◆◆';
    case 'Hard':
      return '◆◆◆';
    default:
      return '◆';
  }
};

export default function QuestGrid({
  quests,
  isMobile,
  hoveredCard,
  setHoveredCard,
  bookmarkedQuests,
  toggleBookmark,
}: QuestGridProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: !isMobile ? 'repeat(3, 1fr)' : '1fr',
        gap: '30px',
        gridAutoRows: 'auto',
      }}
    >
      {quests.map((quest, index) => (
        <div
          key={quest.id}
          onMouseEnter={() => setHoveredCard(quest.id)}
          onMouseLeave={() => setHoveredCard(null)}
          onTouchStart={() => setHoveredCard(quest.id)}
          onTouchEnd={() => setHoveredCard(null)}
          style={{
            background: hoveredCard === quest.id ? '#0a0a0a' : '#050505',
            border: `1px solid ${
              hoveredCard === quest.id ? quest.color : '#222'
            }`,
            padding: !isMobile ? '40px' : '24px',
            transition:
              'background-color 0.2s ease, border-color 0.2s ease, transform 0.15s ease-out',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
            maxHeight: '500px',
            display: 'flex',
            flexDirection: 'column',
            transform:
              hoveredCard === quest.id
                ? 'scale(0.995) translateY(-2px)'
                : 'scale(1) translateY(0)',
            willChange: 'transform',
          }}
        >
          {/* Bookmark Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleBookmark(quest.id);
            }}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'transparent',
              border: 'none',
              color: bookmarkedQuests.includes(quest.id) ? '#00ff88' : '#444',
              fontSize: '20px',
              cursor: 'pointer',
              zIndex: 20,
              transition: 'color 0.2s ease',
            }}
          >
            {bookmarkedQuests.includes(quest.id) ? '★' : '☆'}
          </button>

          {/* Background pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '200px',
              height: '200px',
              background: quest.color,
              opacity: 0.03,
              clipPath: `polygon(${Math.random() * 100}% 0%, 100% ${
                Math.random() * 100
              }%, 100% 100%, ${Math.random() * 100}% 100%)`,
              transition: 'opacity 0.2s ease',
            }}
          ></div>

          {/* Quest number */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              right: '40px',
              fontSize: !isMobile ? '48px' : '36px',
              fontWeight: '900',
              color: '#111',
              fontFamily: 'var(--font-space-grotesk)',
            }}
          >
            {quest.id.padStart(2, '0')}
          </div>

          {/* Content */}
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ marginBottom: '20px' }}>
              <span
                style={{
                  color: quest.color,
                  fontSize: '11px',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                }}
              >
                {quest.category} {getDifficultySymbol(quest.difficulty)}
              </span>
            </div>

            <h3
              style={{
                fontSize: !isMobile ? '24px' : '20px',
                fontWeight: '300',
                marginBottom: '16px',
                lineHeight: '1.3',
                fontFamily: 'var(--font-space-grotesk)',
              }}
            >
              {quest.title}
            </h3>

            <p
              style={{
                color: '#666',
                fontSize: '14px',
                marginBottom: '30px',
                lineHeight: '1.6',
                flex: 1,
                overflow: 'hidden',
              }}
            >
              {quest.description}
            </p>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                marginTop: 'auto',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: !isMobile ? '28px' : '24px',
                    fontWeight: '300',
                    color: '#fff',
                    marginBottom: '4px',
                  }}
                >
                  {quest.reward}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: '#444',
                    letterSpacing: '0.1em',
                  }}
                >
                  {quest.participants} PARTICIPANTS •{' '}
                  {quest.deadline.toUpperCase()}
                </div>
              </div>

              {hoveredCard === quest.id && (
                <button
                  style={{
                    padding: '10px 20px',
                    background: 'none',
                    border: `1px solid ${quest.color}`,
                    color: quest.color,
                    fontSize: '11px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'opacity 0.15s ease-out',
                    opacity: 0,
                    animation: 'fadeIn 0.2s ease-out forwards',
                    animationDelay: '0.05s',
                  }}
                >
                  Enter Quest →
                </button>
              )}
            </div>
          </div>

          {/* Corner accent */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '60px',
              height: '60px',
              borderTop: `1px solid ${quest.color}`,
              borderRight: `1px solid ${quest.color}`,
              opacity: hoveredCard === quest.id ? 1 : 0,
              transition: 'opacity 0.2s ease',
            }}
          ></div>
        </div>
      ))}
    </div>
  );
}
