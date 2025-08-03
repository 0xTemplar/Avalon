import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Avvvatars from 'avvvatars-react';
import { useQuestDetail, type QuestDetail } from '../../hooks/useQuestDetail';
import {
  formatDate,
  formatTimeRemaining,
  formatRelativeTime,
} from '../../lib/dateUtils';

export default function QuestDetail() {
  const router = useRouter();
  const { id } = router.query;

  const { data: quest, isLoading, error } = useQuestDetail(id);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'submissions' | 'discussion'
  >('overview');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isParticipating, setIsParticipating] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return '#00ff88';
      case 'Medium':
        return '#ffaa00';
      case 'Hard':
        return '#ff0055';
      default:
        return '#666';
    }
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ color: '#666', fontSize: '16px' }}>Loading quest...</div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    const isQuestNotFoundError = error.message.includes('Quest not found');

    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '24px',
          padding: '40px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>

        <div style={{ color: '#ff0055', fontSize: '24px', fontWeight: '300' }}>
          {isQuestNotFoundError ? 'Quest Not Found' : 'Error Loading Quest'}
        </div>

        <div
          style={{
            color: '#999',
            fontSize: '16px',
            maxWidth: '600px',
            lineHeight: '1.6',
          }}
        >
          {isQuestNotFoundError ? (
            <>
              Quest #{id} couldn&apos;t be found. This might happen because:
              <br />
              <br />
              • The quest was created before our recent data migration
              <br />
              • The quest ID doesn&apos;t exist
              <br />• There&apos;s a temporary sync issue between our data
              sources
            </>
          ) : (
            error.message
          )}
        </div>

        {isQuestNotFoundError && (
          <div
            style={{
              background: 'rgba(0, 255, 136, 0.1)',
              border: '1px solid rgba(0, 255, 136, 0.3)',
              padding: '16px 24px',
              borderRadius: '8px',
              color: '#00ff88',
              fontSize: '14px',
              maxWidth: '500px',
            }}
          >
            💡 <strong>Good news:</strong> New quests are now synced in
            real-time! Try creating a new quest to experience instant updates.
          </div>
        )}

        <div
          style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={() => router.push('/home')}
            style={{
              padding: '12px 24px',
              background: '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            ← Back to Quests
          </button>

          {isQuestNotFoundError && (
            <button
              onClick={() => router.push('/home')}
              style={{
                padding: '12px 24px',
                background: '#00ff88',
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Create New Quest →
            </button>
          )}
        </div>
      </div>
    );
  }

  // Handle case where quest is not found
  if (!quest) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ color: '#666', fontSize: '18px' }}>Quest not found</div>
        <button
          onClick={() => router.push('/home')}
          style={{
            padding: '12px 24px',
            background: '#333',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Back to Quests
        </button>
      </div>
    );
  }

  const progressPercentage = (quest.participants / quest.maxParticipants) * 100;

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#000',
        position: 'relative',
        padding: '0px 80px',
      }}
    >
      {/* Subtle Background Gradient */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: `
            radial-gradient(circle at 20% 50%, ${quest.color}08 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, ${quest.color}05 0%, transparent 50%),
            radial-gradient(circle at 40% 20%, ${quest.color}03 0%, transparent 50%)
          `,
          pointerEvents: 'none',
        }}
      />

      {/* Navigation */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: !isMobile ? '0 40px' : '0 20px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <button
            onClick={() => router.push('/home')}
            style={{
              background: 'none',
              border: 'none',
              color: '#666',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'color 0.2s ease',
              fontWeight: '500',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = quest.color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#666';
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Quests
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  padding: '6px 12px',
                  background: quest.hasWinners
                    ? '#00ff8820'
                    : `${quest.color}15`,
                  color: quest.hasWinners ? '#00ff88' : quest.color,
                  fontSize: '12px',
                  borderRadius: '6px',
                  fontWeight: '600',
                  letterSpacing: '0.03em',
                }}
              >
                {quest.hasWinners ? '🏆 Completed' : quest.status}
              </span>
              {quest.hasWinners && (
                <span
                  style={{
                    padding: '4px 8px',
                    background: 'rgba(255, 215, 0, 0.1)',
                    color: '#ffd700',
                    fontSize: '11px',
                    borderRadius: '4px',
                    fontWeight: '600',
                  }}
                >
                  {quest.winners.length} Winner
                  {quest.winners.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        style={{
          padding: !isMobile ? '60px 40px 40px' : '40px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
          }}
        >
          {/* Quest Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: !isMobile ? '1fr auto' : '1fr',
              gap: '40px',
              alignItems: 'start',
            }}
          >
            <div>
              {/* Meta Information */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '24px',
                  marginBottom: '24px',
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    color: quest.color,
                    fontSize: '13px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                >
                  {quest.category}
                </span>
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: getDifficultyColor(quest.difficulty),
                    fontSize: '13px',
                    fontWeight: '500',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: getDifficultyColor(quest.difficulty),
                    }}
                  />
                  {quest.difficulty}
                </span>
                <span
                  style={{
                    color: '#666',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                  }}
                >
                  #{quest.id.substring(0, 8)}
                </span>
              </div>

              {/* Title */}
              <h1
                style={{
                  fontSize: !isMobile ? '48px' : '32px',
                  fontWeight: '300',
                  lineHeight: '1.2',
                  marginBottom: '16px',
                  letterSpacing: '-0.02em',
                }}
              >
                {quest.title}
              </h1>

              {/* Data Source Indicator */}
              <div
                style={{
                  textAlign: 'center',
                  marginBottom: '16px',
                  opacity: 0.6,
                  fontSize: '13px',
                }}
              ></div>

              {/* Creator Info */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: `1px solid ${quest.color}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Avvvatars value={quest.creator.avatar} style="shape" />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#fff',
                      marginBottom: '2px',
                    }}
                  >
                    {quest.creator.username}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#666',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>{quest.creator.reputation}% reputation</span>
                    <span style={{ color: '#444' }}>•</span>
                    <span>Created {formatDate(quest.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reward Card */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '32px',
                minWidth: !isMobile ? '280px' : 'auto',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Subtle gradient accent */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '100px',
                  height: '100px',
                  background: `radial-gradient(circle, ${quest.color}20 0%, transparent 70%)`,
                  transform: 'translate(30%, -30%)',
                }}
              />

              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#666',
                    marginBottom: '8px',
                    fontWeight: '600',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  Reward Pool
                </div>
                <div
                  style={{
                    fontSize: '36px',
                    fontWeight: '300',
                    color: quest.color,
                    marginBottom: '4px',
                  }}
                >
                  {quest.reward}
                </div>
                <div
                  style={{
                    fontSize: '13px',
                    color: '#999',
                  }}
                >
                  {formatTimeRemaining(quest.deadline)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Section */}
      <section
        style={{
          padding: !isMobile ? '32px 40px' : '24px 20px',
          background: 'rgba(255, 255, 255, 0.01)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              gap: '20px',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '24px',
                  fontWeight: '300',
                  color: '#fff',
                }}
              >
                {quest.participants}
              </span>
              <span
                style={{
                  fontSize: '14px',
                  color: '#666',
                  marginLeft: '8px',
                }}
              >
                of {quest.maxParticipants} participants
              </span>
            </div>

            <button
              onClick={() =>
                !quest.hasWinners && setIsParticipating(!isParticipating)
              }
              disabled={quest.hasWinners}
              style={{
                padding: '12px 24px',
                background: quest.hasWinners
                  ? '#333'
                  : isParticipating
                  ? 'transparent'
                  : quest.color,
                color: quest.hasWinners
                  ? '#666'
                  : isParticipating
                  ? quest.color
                  : '#000',
                border: `1px solid ${quest.hasWinners ? '#333' : quest.color}`,
                fontSize: '14px',
                fontWeight: '600',
                cursor: quest.hasWinners ? 'not-allowed' : 'pointer',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                opacity: quest.hasWinners ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!quest.hasWinners) {
                  if (!isParticipating) {
                    e.currentTarget.style.background = `${quest.color}dd`;
                  } else {
                    e.currentTarget.style.background = `${quest.color}10`;
                  }
                }
              }}
              onMouseLeave={(e) => {
                if (!quest.hasWinners) {
                  if (!isParticipating) {
                    e.currentTarget.style.background = quest.color;
                  } else {
                    e.currentTarget.style.background = 'transparent';
                  }
                }
              }}
            >
              {quest.hasWinners
                ? '🏆 Quest Completed'
                : isParticipating
                ? 'Participating'
                : 'Join Quest'}
            </button>
          </div>

          {/* Progress Bar */}
          <div
            style={{
              width: '100%',
              height: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progressPercentage}%`,
                height: '100%',
                background: quest.color,
                transition: 'width 0.5s ease',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  width: '100px',
                  height: '100%',
                  background:
                    'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2))',
                  animation: 'shimmer 2s infinite',
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section
        style={{
          position: 'sticky',
          top: '64px',
          background: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          zIndex: 40,
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            padding: '0 40px',
          }}
        >
          {['overview', 'submissions', 'discussion'].map((tab) => (
            <button
              key={tab}
              onClick={() =>
                setActiveTab(tab as 'overview' | 'submissions' | 'discussion')
              }
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === tab ? '#fff' : '#666',
                fontSize: '14px',
                padding: '20px 24px',
                cursor: 'pointer',
                position: 'relative',
                transition: 'color 0.2s ease',
                fontWeight: activeTab === tab ? '600' : '500',
                textTransform: 'capitalize',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab) {
                  e.currentTarget.style.color = '#999';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab) {
                  e.currentTarget.style.color = '#666';
                }
              }}
            >
              {tab}
              {tab === 'submissions' && (
                <span
                  style={{
                    marginLeft: '8px',
                    padding: '2px 6px',
                    background:
                      activeTab === tab
                        ? `${quest.color}20`
                        : 'rgba(255, 255, 255, 0.05)',
                    color: activeTab === tab ? quest.color : '#999',
                    fontSize: '11px',
                    borderRadius: '4px',
                    fontWeight: '600',
                  }}
                >
                  {quest.submissions.length}
                </span>
              )}
              {activeTab === tab && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: quest.color,
                  }}
                />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Tab Content */}
      <section
        style={{
          padding: !isMobile ? '60px 40px' : '40px 20px',
          minHeight: '600px',
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
          }}
        >
          {activeTab === 'overview' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: !isMobile ? '1fr 380px' : '1fr',
                gap: '60px',
              }}
            >
              {/* Main Content */}
              <div>
                <div
                  style={{
                    marginBottom: '48px',
                  }}
                >
                  <h2
                    style={{
                      fontSize: '20px',
                      fontWeight: '600',
                      marginBottom: '24px',
                      color: '#fff',
                    }}
                  >
                    About this Quest
                  </h2>
                  <div
                    style={{
                      fontSize: '16px',
                      color: '#bbb',
                      lineHeight: '1.8',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {quest.longDescription}
                  </div>
                </div>

                {/* Requirements */}
                <div
                  style={{
                    marginBottom: '48px',
                  }}
                >
                  <h3
                    style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      marginBottom: '20px',
                      color: '#fff',
                    }}
                  >
                    Requirements
                  </h3>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    {quest.requirements.map((req, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          padding: '16px',
                          background: 'rgba(255, 255, 255, 0.02)',
                          borderRadius: '8px',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                        }}
                      >
                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            background: `${quest.color}20`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            marginTop: '2px',
                          }}
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke={quest.color}
                            strokeWidth="3"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        <span
                          style={{
                            fontSize: '15px',
                            color: '#999',
                            lineHeight: '1.5',
                          }}
                        >
                          {req}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  {quest.tags.map((tag, index) => (
                    <span
                      key={index}
                      style={{
                        padding: '6px 14px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '6px',
                        fontSize: '13px',
                        color: '#888',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = `${quest.color}40`;
                        e.currentTarget.style.color = quest.color;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor =
                          'rgba(255, 255, 255, 0.08)';
                        e.currentTarget.style.color = '#888';
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <div>
                <div
                  style={{
                    position: 'sticky',
                    top: '180px',
                  }}
                >
                  {/* Deliverables Card */}
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      padding: '24px',
                      marginBottom: '24px',
                    }}
                  >
                    <h3
                      style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        marginBottom: '20px',
                        color: '#fff',
                      }}
                    >
                      Deliverables
                    </h3>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                    >
                      {quest.deliverables.map((del, index) => (
                        <div
                          key={index}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px',
                            fontSize: '14px',
                            color: '#999',
                            lineHeight: '1.5',
                          }}
                        >
                          <span
                            style={{
                              color: quest.color,
                              fontSize: '16px',
                              lineHeight: '1',
                              marginTop: '2px',
                            }}
                          >
                            •
                          </span>
                          <span>{del}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={() =>
                      !quest.hasWinners && setShowSubmitModal(true)
                    }
                    disabled={quest.hasWinners}
                    style={{
                      width: '100%',
                      padding: '16px',
                      background: quest.hasWinners ? '#333' : quest.color,
                      color: quest.hasWinners ? '#666' : '#000',
                      border: 'none',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: quest.hasWinners ? 'not-allowed' : 'pointer',
                      borderRadius: '8px',
                      transition: 'all 0.2s ease',
                      opacity: quest.hasWinners ? 0.5 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!quest.hasWinners) {
                        e.currentTarget.style.background = `${quest.color}dd`;
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!quest.hasWinners) {
                        e.currentTarget.style.background = quest.color;
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    {quest.hasWinners
                      ? '🏆 Quest Completed'
                      : 'Submit Your Work'}
                  </button>

                  {/* Stats */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '12px',
                      marginTop: '24px',
                    }}
                  >
                    {[
                      {
                        label: 'Time Left',
                        value: formatTimeRemaining(quest.deadline),
                      },
                      {
                        label: 'Submissions',
                        value: quest.submissions.length.toString(),
                      },
                      {
                        label: 'Participants',
                        value: quest.participants.toString(),
                      },
                      { label: 'Difficulty', value: quest.difficulty },
                    ].map((stat, index) => (
                      <div
                        key={index}
                        style={{
                          padding: '16px',
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          borderRadius: '8px',
                          textAlign: 'center',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '11px',
                            color: '#666',
                            marginBottom: '4px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          {stat.label}
                        </div>
                        <div
                          style={{
                            fontSize: '16px',
                            fontWeight: '500',
                            color:
                              stat.label === 'Difficulty'
                                ? getDifficultyColor(stat.value)
                                : '#fff',
                          }}
                        >
                          {stat.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'submissions' && (
            <div>
              {quest.hasWinners && (
                <div
                  style={{
                    padding: '20px',
                    background:
                      'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(0, 255, 136, 0.1))',
                    border: '1px solid rgba(255, 215, 0, 0.2)',
                    borderRadius: '12px',
                    marginBottom: '32px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                    🏆
                  </div>
                  <h3
                    style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: '#ffd700',
                    }}
                  >
                    Quest Completed!
                  </h3>
                  <p
                    style={{
                      fontSize: '14px',
                      color: '#ccc',
                      marginBottom: '12px',
                    }}
                  >
                    {quest.winners.length} winner
                    {quest.winners.length > 1 ? 's have' : ' has'} been selected
                    for this quest.
                  </p>
                  <div style={{ fontSize: '12px', color: '#888' }}>
                    No new submissions can be made.
                  </div>
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '40px',
                  flexWrap: 'wrap',
                  gap: '20px',
                }}
              >
                <h2
                  style={{
                    fontSize: '24px',
                    fontWeight: '300',
                  }}
                >
                  Submissions
                </h2>

                <select
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    color: '#ccc',
                    fontSize: '14px',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <option>Most Recent</option>
                  <option>Most Votes</option>
                  <option>Oldest First</option>
                </select>
              </div>

              <div
                style={{
                  display: 'grid',
                  gap: '16px',
                }}
              >
                {quest.submissions.map((submission) => (
                  <div
                    key={submission.id}
                    style={{
                      padding: '32px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = `${quest.color}30`;
                      e.currentTarget.style.background =
                        'rgba(255, 255, 255, 0.03)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor =
                        'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.background =
                        'rgba(255, 255, 255, 0.02)';
                    }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          !isMobile && submission.previewUrl
                            ? '1fr auto'
                            : '1fr',
                        gap: '32px',
                        alignItems: 'start',
                      }}
                    >
                      <div>
                        {/* Submission Header */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            marginBottom: '20px',
                          }}
                        >
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '8px',
                              overflow: 'hidden',
                            }}
                          >
                            <Image
                              src={submission.author.avatar}
                              alt={submission.author.username}
                              width={40}
                              height={40}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                            />
                          </div>

                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontSize: '15px',
                                fontWeight: '600',
                                color: '#fff',
                                marginBottom: '2px',
                              }}
                            >
                              {submission.author.username}
                            </div>
                            <div
                              style={{
                                fontSize: '13px',
                                color: '#666',
                              }}
                            >
                              {formatRelativeTime(submission.timestamp)}
                            </div>
                          </div>

                          <span
                            style={{
                              padding: '4px 12px',
                              background:
                                submission.status === 'approved' ||
                                submission.status === 'winner'
                                  ? `${quest.color}20`
                                  : submission.status === 'rejected'
                                  ? '#ff005520'
                                  : 'rgba(255, 255, 255, 0.05)',
                              color:
                                submission.status === 'approved' ||
                                submission.status === 'winner'
                                  ? quest.color
                                  : submission.status === 'rejected'
                                  ? '#ff0055'
                                  : '#666',
                              fontSize: '12px',
                              borderRadius: '4px',
                              fontWeight: '600',
                              textTransform: 'capitalize',
                            }}
                          >
                            {submission.status === 'winner'
                              ? '🏆 Winner'
                              : submission.status}
                          </span>
                        </div>

                        <h3
                          style={{
                            fontSize: '18px',
                            fontWeight: '500',
                            marginBottom: '12px',
                            color: '#fff',
                          }}
                        >
                          {submission.content}
                        </h3>

                        <p
                          style={{
                            fontSize: '15px',
                            color: '#999',
                            lineHeight: '1.6',
                            marginBottom: '20px',
                          }}
                        >
                          {submission.description}
                        </p>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                          }}
                        >
                          <button
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              background: 'rgba(255, 255, 255, 0.03)',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              borderRadius: '6px',
                              padding: '8px 16px',
                              color: '#999',
                              fontSize: '14px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = quest.color;
                              e.currentTarget.style.color = quest.color;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor =
                                'rgba(255, 255, 255, 0.08)';
                              e.currentTarget.style.color = '#999';
                            }}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                            </svg>
                            {submission.votes}
                          </button>

                          <button
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#666',
                              fontSize: '14px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'color 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = quest.color;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = '#666';
                            }}
                          >
                            View Details
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M7 17L17 7M17 7H7M17 7V17" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Preview Image */}
                      {!isMobile && submission.previewUrl && (
                        <div
                          style={{
                            width: '160px',
                            height: '160px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            background: `url(${submission.previewUrl}) center/cover`,
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                          }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'discussion' && (
            <div
              style={{
                textAlign: 'center',
                padding: '80px 20px',
                maxWidth: '600px',
                margin: '0 auto',
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  margin: '0 auto 24px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#444"
                  strokeWidth="1.5"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3
                style={{
                  fontSize: '24px',
                  fontWeight: '300',
                  marginBottom: '12px',
                  color: '#999',
                }}
              >
                Discussion Coming Soon
              </h3>
              <p
                style={{
                  fontSize: '15px',
                  color: '#666',
                  lineHeight: '1.6',
                  marginBottom: '32px',
                }}
              >
                Connect with other participants, share ideas, and get feedback
                on your work.
              </p>

              <button
                style={{
                  padding: '12px 24px',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  color: '#666',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = quest.color;
                  e.currentTarget.style.color = quest.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor =
                    'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = '#666';
                }}
              >
                Get Notified
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setShowSubmitModal(false)}
        >
          <div
            style={{
              background: '#0a0a0a',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '40px',
              maxWidth: '600px',
              width: '100%',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowSubmitModal(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: '#666',
                fontSize: '24px',
                cursor: 'pointer',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.color = '#999';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none';
                e.currentTarget.style.color = '#666';
              }}
            >
              ×
            </button>

            <h2
              style={{
                fontSize: '24px',
                fontWeight: '300',
                marginBottom: '32px',
              }}
            >
              Submit Your Work
            </h2>

            <form
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
              }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    color: '#888',
                    marginBottom: '8px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Give your submission a descriptive title"
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    color: '#fff',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = quest.color;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      'rgba(255, 255, 255, 0.08)';
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    color: '#888',
                    marginBottom: '8px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Description
                </label>
                <textarea
                  placeholder="Describe your work and creative process..."
                  rows={4}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    color: '#fff',
                    fontSize: '15px',
                    outline: 'none',
                    resize: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = quest.color;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      'rgba(255, 255, 255, 0.08)';
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    color: '#888',
                    marginBottom: '8px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Files
                </label>
                <div
                  style={{
                    padding: '40px',
                    border: '2px dashed rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${quest.color}40`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor =
                      'rgba(255, 255, 255, 0.08)';
                  }}
                >
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#444"
                    strokeWidth="1.5"
                    style={{ margin: '0 auto 12px' }}
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <div
                    style={{
                      fontSize: '15px',
                      color: '#ccc',
                      marginBottom: '4px',
                    }}
                  >
                    Drag files here or click to browse
                  </div>
                  <div style={{ fontSize: '13px', color: '#666' }}>
                    PNG, JPG, PDF, ZIP (Max 50MB)
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '16px',
                  marginTop: '16px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'transparent',
                    color: '#999',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor =
                      'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.color = '#ccc';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor =
                      'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.color = '#999';
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={{
                    flex: 2,
                    padding: '12px',
                    background: quest.color,
                    color: '#000',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    setShowSubmitModal(false);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${quest.color}dd`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = quest.color;
                  }}
                >
                  Submit Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </div>
  );
}
