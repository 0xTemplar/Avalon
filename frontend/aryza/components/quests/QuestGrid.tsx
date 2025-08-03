import React from 'react';
import { useRouter } from 'next/router';
import { Quest } from './types';
import Avvvatars from 'avvvatars-react';

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
  const router = useRouter();

  const handleQuestClick = (questId: string) => {
    router.push(`/quest/${questId}`);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: !isMobile ? 'repeat(3, 1fr)' : '1fr',
        gap: '30px',
        gridAutoRows: 'auto',
      }}
    >
      {quests.map((quest) => (
        <div
          key={quest.id}
          onClick={() => handleQuestClick(quest.id)}
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
            height: !isMobile ? '400px' : '340px',
            display: 'flex',
            flexDirection: 'column',
            transform:
              hoveredCard === quest.id
                ? 'scale(0.995) translateY(-2px)'
                : 'scale(1) translateY(0)',
            willChange: 'transform',
          }}
        >
          {/* Creator Profile - Floating Orb Design */}
          <div
            style={{
              position: 'absolute',
              bottom: '30px',
              left: '30px',
              zIndex: 25,
            }}
          >
            {/* Glowing Orb Container */}
            <div
              style={{
                position: 'relative',
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Outer Glow */}
              <div
                style={{
                  position: 'absolute',
                  inset: '-20px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${quest.color}20 0%, transparent 70%)`,
                  opacity: hoveredCard === quest.id ? 1 : 0,
                  transition: 'opacity 0.5s ease',
                  animation:
                    hoveredCard === quest.id
                      ? 'pulse 2s ease-in-out infinite'
                      : 'none',
                }}
              />

              {/* Energy Ring */}
              <div
                style={{
                  position: 'absolute',
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'transparent',
                  border: `2px solid ${quest.color}30`,
                  transform:
                    hoveredCard === quest.id ? 'scale(1.2)' : 'scale(1)',
                  transition: 'transform 0.3s ease',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: quest.color,
                    transform: 'translate(-50%, -50%)',
                    boxShadow: `0 0 10px ${quest.color}`,
                    animation:
                      hoveredCard === quest.id
                        ? 'orbit 3s linear infinite'
                        : 'none',
                  }}
                />
              </div>

              {/* Profile Image Core */}
              <div
                style={{
                  position: 'relative',
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: `linear-gradient(135deg, ${quest.color}40, transparent)`,
                  padding: '2px',
                  boxShadow: `0 0 20px ${quest.color}40`,
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: '#050505',
                  }}
                >
                  <Avvvatars
                    size={56}
                    style="shape"
                    value={quest.creator.avatar || quest.creator.username}
                  />
                </div>
              </div>

              {/* Username Badge */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '-25px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  whiteSpace: 'nowrap',
                }}
              >
                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(10px)',
                    padding: '4px 12px',
                    borderRadius: '16px',
                    border: `1px solid ${quest.color}40`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <div
                    style={{
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      background: quest.color,
                      boxShadow: `0 0 6px ${quest.color}`,
                    }}
                  />
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#fff',
                      fontFamily: 'var(--font-space-grotesk)',
                    }}
                  >
                    {quest.creator.username}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Add keyframe animations */}
          <style jsx>{`
            @keyframes pulse {
              0%,
              100% {
                opacity: 0.6;
                transform: scale(1);
              }
              50% {
                opacity: 1;
                transform: scale(1.1);
              }
            }

            @keyframes orbit {
              from {
                transform: translate(-50%, -50%) rotate(0deg) translateX(35px)
                  rotate(0deg);
              }
              to {
                transform: translate(-50%, -50%) rotate(360deg) translateX(35px)
                  rotate(-360deg);
              }
            }

            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: translateY(10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>

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
              clipPath: `polygon(${(parseInt(quest.id) * 37) % 100}% 0%, 100% ${
                (parseInt(quest.id) * 73) % 100
              }%, 100% 100%, ${(parseInt(quest.id) * 91) % 100}% 100%)`,
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
              marginTop: '20px', // Adjusted spacing
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
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                textOverflow: 'ellipsis',
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
                marginLeft: '100px', // Space for floating orb
              }}
            >
              <div>
                {/* Reward Container */}
                <div
                  style={{
                    background:
                      hoveredCard === quest.id
                        ? `linear-gradient(90deg, ${quest.color}10 0%, transparent 80%)`
                        : 'transparent',
                    padding: hoveredCard === quest.id ? '8px 12px 8px 0' : '0',
                    marginLeft: hoveredCard === quest.id ? '-12px' : '0',
                    paddingLeft: hoveredCard === quest.id ? '12px' : '0',
                    borderRadius: '6px',
                    marginBottom: '12px',
                    transition: 'all 0.3s ease',
                    display: 'inline-block',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '12px',
                    }}
                  >
                    {/* Primary Amount */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '6px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: !isMobile ? '28px' : '24px',
                          fontWeight: '300',
                          color: '#fff',
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {quest.reward.split(' ')[0].slice(0, 3)}
                      </span>
                      <span
                        style={{
                          fontSize: !isMobile ? '14px' : '12px',
                          color: quest.color,
                          fontWeight: '500',
                          letterSpacing: '0.05em',
                        }}
                      >
                        XTZ
                      </span>
                    </div>

                    {/* Separator */}
                    <span
                      style={{
                        color: '#333',
                        fontSize: '16px',
                        opacity: hoveredCard === quest.id ? 0.5 : 0.3,
                        transition: 'opacity 0.3s ease',
                      }}
                    >
                      |
                    </span>

                    {/* USD Value */}
                    <div
                      style={{
                        opacity: hoveredCard === quest.id ? 0.9 : 0.4,
                        transition: 'opacity 0.3s ease',
                      }}
                    >
                      <span
                        style={{
                          fontSize: !isMobile ? '16px' : '14px',
                          color: '#888',
                          fontWeight: '400',
                        }}
                      >
                        $
                        {(
                          parseFloat(quest.reward.replace(/[^\d.-]/g, '')) * 1.5
                        ).toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Meta Info */}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuestClick(quest.id);
                  }}
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
