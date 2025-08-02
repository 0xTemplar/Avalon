import React from 'react';
import { Quest } from './types';

interface QuestListProps {
  quests: Quest[];
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

export default function QuestList({
  quests,
  bookmarkedQuests,
  toggleBookmark,
}: QuestListProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {quests.map((quest) => (
        <div
          key={quest.id}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '24px',
            background: '#050505',
            border: '1px solid #222',
            transition: 'all 0.3s',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = quest.color;
            e.currentTarget.style.background = '#0a0a0a';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#222';
            e.currentTarget.style.background = '#050505';
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '8px',
              }}
            >
              <span
                style={{
                  color: quest.color,
                  fontSize: '11px',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                }}
              >
                {quest.category}
              </span>
              <span style={{ color: '#666', fontSize: '11px' }}>
                {getDifficultySymbol(quest.difficulty)}
              </span>
            </div>
            <h3
              style={{
                fontSize: '18px',
                fontWeight: '400',
                marginBottom: '8px',
                fontFamily: 'var(--font-space-grotesk)',
              }}
            >
              {quest.title}
            </h3>
            <p
              style={{
                color: '#666',
                fontSize: '14px',
                maxWidth: '600px',
              }}
            >
              {quest.description}
            </p>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '40px',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: '300',
                  color: '#fff',
                }}
              >
                {quest.reward}
              </div>
              <div style={{ fontSize: '11px', color: '#666' }}>REWARD</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', color: '#fff' }}>
                {quest.participants}
              </div>
              <div style={{ fontSize: '11px', color: '#666' }}>JOINED</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', color: quest.color }}>
                {quest.deadline}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleBookmark(quest.id);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: bookmarkedQuests.includes(quest.id) ? '#00ff88' : '#444',
                fontSize: '20px',
                cursor: 'pointer',
              }}
            >
              {bookmarkedQuests.includes(quest.id) ? '★' : '☆'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
