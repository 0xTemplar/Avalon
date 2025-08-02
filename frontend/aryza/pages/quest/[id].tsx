import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface Submission {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  votes: number;
  status: 'pending' | 'approved' | 'rejected';
  previewUrl?: string;
}

interface QuestDetail {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  category: string;
  reward: string;
  creator: string;
  creatorAvatar?: string;
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
}

const mockQuest: QuestDetail = {
  id: '1',
  title: 'Design a Cyberpunk Album Cover',
  description:
    'Create an original album cover for an electronic music artist. Must incorporate neon aesthetics and futuristic elements.',
  longDescription: `We're looking for a visionary designer to create an album cover that captures the essence of cyberpunk aesthetics. The cover should blend neon-soaked cityscapes with futuristic elements, creating a visual narrative that complements electronic music.

The ideal submission will demonstrate mastery of color theory, particularly in the use of vibrant neons against dark backgrounds. Typography should be bold and futuristic, while maintaining readability. Consider incorporating elements like holographic effects, glitch art, or retrofuturistic motifs.

This is an opportunity to showcase your creativity and push the boundaries of digital art. The winning design will be featured on all major streaming platforms and physical releases.`,
  category: 'Design',
  reward: '0.5 ETH',
  creator: '0x742d35Cc6634C0532925a3b844Bc454e9c5f8c',
  participants: 12,
  maxParticipants: 50,
  deadline: '3 days left',
  createdAt: '2024-01-15',
  difficulty: 'Medium',
  status: 'Active',
  tags: ['Design', 'Music', 'Digital Art', 'Cyberpunk', 'Album Art'],
  color: '#00ff88',
  requirements: [
    'Minimum resolution: 3000x3000px',
    'Format: PNG or JPG with source files',
    'Must include artist name and album title',
    'Original work only - no stock images',
    'Deliverable within 72 hours',
  ],
  deliverables: [
    'High-resolution album cover (3000x3000px)',
    'Social media versions (1080x1080px, 1920x1080px)',
    'Source files (PSD, AI, or equivalent)',
    'Brief design rationale (200 words)',
  ],
  submissions: [
    {
      id: '1',
      author: '0x8f3a...2d1e',
      content: 'Neon cityscape with holographic elements',
      timestamp: '2 hours ago',
      votes: 24,
      status: 'pending',
      previewUrl: 'https://via.placeholder.com/400x400/1a1a1a/00ff88?text=Preview+1',
    },
    {
      id: '2',
      author: '0x1a9b...7c3d',
      content: 'Glitch art interpretation with typography focus',
      timestamp: '5 hours ago',
      votes: 18,
      status: 'pending',
      previewUrl: 'https://via.placeholder.com/400x400/1a1a1a/ff0088?text=Preview+2',
    },
  ],
};

export default function QuestDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [quest] = useState<QuestDetail>(mockQuest);
  const [activeTab, setActiveTab] = useState<
    'details' | 'submissions' | 'discussion'
  >('details');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [copied, setCopied] = useState(false);
  const [isParticipating, setIsParticipating] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const [hoveredSubmission, setHoveredSubmission] = useState<string | null>(null);

  // Helper function for SSR-safe window checks
  const getWindowWidth = () => {
    if (typeof window !== 'undefined') {
      return window.innerWidth;
    }
    return 769; // Default to desktop size for SSR
  };

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

  const copyAddress = () => {
    navigator.clipboard.writeText(quest.creator);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const progressPercentage = (quest.participants / quest.maxParticipants) * 100;

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#000',
        cursor: !isMobile ? 'crosshair' : 'default',
        position: 'relative',
      }}
    >
      {/* Noise texture overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          opacity: 0.03,
          pointerEvents: 'none',
          background: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' /%3E%3C/svg%3E")`,
        }}
      ></div>

      {/* Gradient overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: `radial-gradient(ellipse at top, ${quest.color}10 0%, transparent 50%),
                       radial-gradient(ellipse at bottom, transparent 50%, ${quest.color}05 100%)`,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      ></div>

      {/* Dynamic cursor follower - desktop only */}
      {!isMobile && (
        <div
          style={{
            position: 'fixed',
            left: mousePos.x - 200,
            top: mousePos.y - 200,
            width: '400px',
            height: '400px',
            background: `radial-gradient(circle, ${quest.color}20 0%, transparent 70%)`,
            pointerEvents: 'none',
            zIndex: 100,
            transition: 'all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67)',
            filter: 'blur(40px)',
          }}
        ></div>
      )}

      {/* Navigation */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          padding: !isMobile ? '20px 40px' : '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: !isMobile ? '40px' : '20px',
          }}
        >
          <button
            onClick={() => router.push('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              border: 'none',
              color: '#666',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontWeight: '500',
              letterSpacing: '0.05em',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = quest.color;
              e.currentTarget.style.transform = 'translateX(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#666';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            ← BACK TO QUESTS
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span
            style={{
              padding: '8px 20px',
              background: `linear-gradient(135deg, ${quest.color}20, ${quest.color}10)`,
              color: quest.color,
              fontSize: '12px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              borderRadius: '24px',
              border: `1px solid ${quest.color}40`,
              fontWeight: '600',
              boxShadow: `0 0 20px ${quest.color}20`,
            }}
          >
            {quest.status} ●
          </span>
        </div>
      </nav>

      {/* Hero Section with Quest Info */}
      <section
        style={{
          position: 'relative',
          padding: !isMobile ? '80px 40px' : '40px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          overflow: 'hidden',
        }}
      >
        {/* Background Pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.03,
            background: `repeating-linear-gradient(
            45deg,
            ${quest.color},
            ${quest.color} 10px,
            transparent 10px,
            transparent 20px
          )`,
            pointerEvents: 'none',
          }}
        ></div>

        {/* Animated background shapes */}
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '600px',
            height: '600px',
            background: `radial-gradient(circle, ${quest.color}10 0%, transparent 70%)`,
            borderRadius: '50%',
            filter: 'blur(100px)',
            animation: 'float 20s ease-in-out infinite',
          }}
        ></div>

        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            position: 'relative',
            zIndex: 10,
          }}
        >
          {/* Quest Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: !isMobile ? '1fr auto' : '1fr',
              gap: '60px',
              alignItems: 'start',
            }}
          >
            <div>
              {/* Category and Difficulty */}
              <div
                style={{
                  display: 'flex',
                  gap: '16px',
                  marginBottom: '32px',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    color: quest.color,
                    fontSize: '13px',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    fontWeight: '600',
                    padding: '6px 16px',
                    background: `${quest.color}10`,
                    borderRadius: '20px',
                    border: `1px solid ${quest.color}30`,
                  }}
                >
                  {quest.category}
                </span>
                <span
                  style={{
                    color: getDifficultyColor(quest.difficulty),
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 16px',
                    background: `${getDifficultyColor(quest.difficulty)}10`,
                    borderRadius: '20px',
                    border: `1px solid ${getDifficultyColor(quest.difficulty)}30`,
                  }}
                >
                  {getDifficultySymbol(quest.difficulty)} {quest.difficulty}
                </span>
                <span
                  style={{
                    color: '#666',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                  }}
                >
                  QUEST #{quest.id.padStart(4, '0')}
                </span>
              </div>

              {/* Title */}
              <h1
                style={{
                  fontSize: !isMobile ? '56px' : '36px',
                  fontWeight: '200',
                  lineHeight: '1.1',
                  marginBottom: '32px',
                  fontFamily: 'var(--font-space-grotesk)',
                  background: `linear-gradient(135deg, #fff 0%, ${quest.color} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em',
                }}
              >
                {quest.title}
              </h1>

              {/* Description */}
              <p
                style={{
                  fontSize: '18px',
                  color: '#aaa',
                  lineHeight: '1.7',
                  maxWidth: '800px',
                  marginBottom: '32px',
                }}
              >
                {quest.description}
              </p>

              {/* Tags */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                {quest.tags.map((tag, index) => (
                  <span
                    key={index}
                    style={{
                      padding: '8px 16px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      fontSize: '12px',
                      letterSpacing: '0.05em',
                      transition: 'all 0.3s',
                      cursor: 'pointer',
                      borderRadius: '20px',
                      backdropFilter: 'blur(10px)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = quest.color;
                      e.currentTarget.style.color = quest.color;
                      e.currentTarget.style.background = `${quest.color}10`;
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                      e.currentTarget.style.color = '#fff';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Reward Box */}
            <div
              style={{
                background: `linear-gradient(135deg, ${quest.color}05, ${quest.color}10)`,
                border: '1px solid ' + quest.color + '40',
                padding: '40px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '16px',
                backdropFilter: 'blur(10px)',
                boxShadow: `0 0 40px ${quest.color}20`,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-50%',
                  right: '-50%',
                  width: '200%',
                  height: '200%',
                  background: `conic-gradient(from 0deg, transparent, ${quest.color}20, transparent)`,
                  animation: 'rotate 10s linear infinite',
                }}
              ></div>

              <div style={{ position: 'relative', zIndex: 10 }}>
                <div
                  style={{
                    fontSize: '13px',
                    color: '#888',
                    marginBottom: '12px',
                    letterSpacing: '0.15em',
                    fontWeight: '600',
                  }}
                >
                  REWARD POOL
                </div>
                <div
                  style={{
                    fontSize: '42px',
                    fontWeight: '200',
                    color: quest.color,
                    marginBottom: '20px',
                    textShadow: `0 0 30px ${quest.color}60`,
                  }}
                >
                  {quest.reward}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#999',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <span style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    background: quest.color,
                    animation: 'pulse 2s infinite',
                  }}></span>
                  {quest.deadline.toUpperCase()}
                </div>
              </div>
            </div>
          </div>

          {/* Creator Info */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              marginTop: '48px',
              paddingTop: '48px',
              borderTop: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                background: `linear-gradient(135deg, ${quest.color}40, ${quest.color}20)`,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px solid ${quest.color}30`,
                boxShadow: `0 0 20px ${quest.color}20`,
              }}
            >
              <span style={{ fontSize: '24px' }}>👤</span>
            </div>
            <div>
              <div
                style={{
                  fontSize: '12px',
                  color: '#888',
                  marginBottom: '6px',
                  letterSpacing: '0.1em',
                  fontWeight: '600',
                }}
              >
                QUEST CREATOR
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <span
                  style={{
                    fontSize: '16px',
                    fontFamily: 'monospace',
                    color: '#ddd',
                  }}
                >
                  {quest.creator.slice(0, 6)}...{quest.creator.slice(-4)}
                </span>
                <button
                  onClick={copyAddress}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    color: '#888',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = quest.color;
                    e.currentTarget.style.color = quest.color;
                    e.currentTarget.style.background = `${quest.color}10`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.color = '#888';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  }}
                >
                  {copied ? '✓ Copied' : '⧉ Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Bar */}
      <section
        style={{
          padding: !isMobile ? '48px 40px' : '32px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(0,0,0,0.5)',
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
              marginBottom: '24px',
              flexWrap: 'wrap',
              gap: '20px',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '28px',
                  fontWeight: '200',
                  color: quest.color,
                }}
              >
                {quest.participants}
              </span>
              <span
                style={{
                  fontSize: '16px',
                  color: '#888',
                  marginLeft: '8px',
                }}
              >
                / {quest.maxParticipants} participants
              </span>
            </div>
            <button
              onClick={() => setIsParticipating(!isParticipating)}
              style={{
                padding: '14px 40px',
                background: isParticipating ? 'transparent' : `linear-gradient(135deg, ${quest.color}, ${quest.color}cc)`,
                color: isParticipating ? quest.color : '#000',
                border: `2px solid ${quest.color}`,
                fontSize: '13px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '8px',
                boxShadow: isParticipating ? 'none' : `0 4px 20px ${quest.color}40`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow = `0 8px 30px ${quest.color}60`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = isParticipating ? 'none' : `0 4px 20px ${quest.color}40`;
              }}
            >
              <span style={{ position: 'relative', zIndex: 10 }}>
                {isParticipating ? '✓ PARTICIPATING' : 'JOIN QUEST →'}
              </span>
            </button>
          </div>

          {/* Progress Bar */}
          <div
            style={{
              width: '100%',
              height: '12px',
              background: 'rgba(255,255,255,0.05)',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div
              style={{
                width: `${progressPercentage}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${quest.color}cc, ${quest.color})`,
                transition: 'width 0.5s ease',
                position: 'relative',
                boxShadow: `0 0 20px ${quest.color}60`,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  width: '100px',
                  height: '100%',
                  background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3))`,
                  animation: 'shimmer 2s infinite',
                }}
              ></div>
            </div>
          </div>

          {/* Stats */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              marginTop: '32px',
            }}
          >
            {[
              { label: 'Time Remaining', value: quest.deadline, icon: '⏱' },
              { label: 'Submissions', value: quest.submissions.length.toString(), icon: '📤' },
              { label: 'Reward Pool', value: quest.reward, icon: '💎' },
              { label: 'Difficulty', value: quest.difficulty, icon: '⚡' },
            ].map((stat, index) => (
              <div
                key={index}
                style={{
                  padding: '20px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  transition: 'all 0.3s',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${quest.color}40`;
                  e.currentTarget.style.background = `${quest.color}05`;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span style={{ fontSize: '24px', opacity: 0.8 }}>{stat.icon}</span>
                <div>
                  <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px', letterSpacing: '0.1em' }}>
                    {stat.label.toUpperCase()}
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '300', color: stat.label === 'Difficulty' ? getDifficultyColor(stat.value) : '#fff' }}>
                    {stat.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section
        style={{
          position: 'sticky',
          top: !isMobile ? '77px' : '69px',
          background: 'rgba(0,0,0,0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          zIndex: 40,
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            gap: '0',
            padding: '0 40px',
          }}
        >
          {['details', 'submissions', 'discussion'].map((tab) => (
            <button
              key={tab}
              onClick={() =>
                setActiveTab(tab as 'details' | 'submissions' | 'discussion')
              }
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === tab ? quest.color : '#666',
                fontSize: '14px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '24px 32px',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.3s',
                fontWeight: activeTab === tab ? '600' : '500',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab) {
                  e.currentTarget.style.color = '#ccc';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab) {
                  e.currentTarget.style.color = '#666';
                  e.currentTarget.style.background = 'none';
                }
              }}
            >
              {tab}
              {tab === 'submissions' && (
                <span
                  style={{
                    marginLeft: '8px',
                    padding: '2px 8px',
                    background: activeTab === tab ? quest.color : '#333',
                    color: activeTab === tab ? '#000' : '#999',
                    fontSize: '11px',
                    borderRadius: '10px',
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
                    left: '10%',
                    right: '10%',
                    height: '3px',
                    background: quest.color,
                    borderRadius: '3px 3px 0 0',
                    boxShadow: `0 0 10px ${quest.color}60`,
                  }}
                ></div>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Tab Content */}
      <section
        style={{
          padding: !isMobile ? '80px 40px' : '40px 20px',
          minHeight: '600px',
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
          }}
        >
          {activeTab === 'details' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: !isMobile ? '2fr 1fr' : '1fr',
                gap: '60px',
              }}
            >
              {/* Left Column - Description */}
              <div>
                <h2
                  style={{
                    fontSize: '32px',
                    fontWeight: '200',
                    marginBottom: '40px',
                    fontFamily: 'var(--font-space-grotesk)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                  }}
                >
                  <span
                    style={{
                      width: '40px',
                      height: '2px',
                      background: quest.color,
                    }}
                  ></span>
                  QUEST DETAILS
                </h2>

                <div
                  style={{
                    fontSize: '17px',
                    color: '#ccc',
                    lineHeight: '1.9',
                    whiteSpace: 'pre-wrap',
                    marginBottom: '60px',
                  }}
                >
                  {quest.longDescription}
                </div>

                {/* Requirements */}
                <div
                  style={{
                    padding: '40px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    backdropFilter: 'blur(10px)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '2px',
                      background: `linear-gradient(90deg, transparent, ${quest.color}, transparent)`,
                      animation: 'slideRight 3s linear infinite',
                    }}
                  ></div>
                  
                  <h3
                    style={{
                      fontSize: '20px',
                      fontWeight: '400',
                      marginBottom: '32px',
                      color: quest.color,
                      letterSpacing: '0.05em',
                    }}
                  >
                    📋 REQUIREMENTS
                  </h3>
                  <ul style={{ listStyle: 'none' }}>
                    {quest.requirements.map((req, index) => (
                      <li
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '16px',
                          marginBottom: '20px',
                          color: '#aaa',
                          fontSize: '15px',
                          lineHeight: '1.6',
                        }}
                      >
                        <span 
                          style={{ 
                            color: quest.color,
                            fontSize: '20px',
                            marginTop: '-2px',
                          }}
                        >
                          ▸
                        </span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Column - Deliverables */}
              <div>
                <div
                  style={{
                    position: 'sticky',
                    top: '200px',
                  }}
                >
                  <div
                    style={{
                      padding: '40px',
                      background: `linear-gradient(135deg, ${quest.color}05, ${quest.color}10)`,
                      border: '1px solid ' + quest.color + '30',
                      borderRadius: '16px',
                      backdropFilter: 'blur(10px)',
                      boxShadow: `0 8px 32px ${quest.color}15`,
                    }}
                  >
                    <h3
                      style={{
                        fontSize: '20px',
                        fontWeight: '400',
                        marginBottom: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                    >
                      <span style={{ fontSize: '24px' }}>📦</span>
                      DELIVERABLES
                    </h3>
                    <ul style={{ listStyle: 'none' }}>
                      {quest.deliverables.map((del, index) => (
                        <li
                          key={index}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '14px',
                            marginBottom: '20px',
                            fontSize: '15px',
                            color: '#ddd',
                            padding: '12px 16px',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.05)',
                            transition: 'all 0.3s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = `${quest.color}40`;
                            e.currentTarget.style.transform = 'translateX(4px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                            e.currentTarget.style.transform = 'translateX(0)';
                          }}
                        >
                          <span
                            style={{
                              color: quest.color,
                              fontSize: '18px',
                              marginTop: '-2px',
                            }}
                          >
                            ✓
                          </span>
                          <span>{del}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => setShowSubmitModal(true)}
                      style={{
                        width: '100%',
                        padding: '18px',
                        background: `linear-gradient(135deg, ${quest.color}, ${quest.color}dd)`,
                        color: '#000',
                        border: 'none',
                        fontSize: '14px',
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        fontWeight: '700',
                        cursor: 'pointer',
                        marginTop: '40px',
                        transition: 'all 0.3s',
                        borderRadius: '8px',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: `0 4px 20px ${quest.color}40`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.02)';
                        e.currentTarget.style.boxShadow = `0 8px 30px ${quest.color}60`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = `0 4px 20px ${quest.color}40`;
                      }}
                    >
                      <span
                        style={{
                          position: 'relative',
                          zIndex: 10,
                        }}
                      >
                        SUBMIT YOUR WORK →
                      </span>
                    </button>

                    <p
                      style={{
                        fontSize: '12px',
                        color: '#888',
                        textAlign: 'center',
                        marginTop: '16px',
                        lineHeight: '1.6',
                      }}
                    >
                      Make sure to meet all requirements before submitting
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'submissions' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '48px',
                  flexWrap: 'wrap',
                  gap: '20px',
                }}
              >
                <h2
                  style={{
                    fontSize: '32px',
                    fontWeight: '200',
                    fontFamily: 'var(--font-space-grotesk)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                  }}
                >
                  <span
                    style={{
                      width: '40px',
                      height: '2px',
                      background: quest.color,
                    }}
                  ></span>
                  SUBMISSIONS
                  <span
                    style={{
                      fontSize: '18px',
                      color: '#666',
                      fontWeight: '400',
                    }}
                  >
                    ({quest.submissions.length})
                  </span>
                </h2>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <select
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      padding: '10px 16px',
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
              </div>

              <div
                style={{
                  display: 'grid',
                  gap: '24px',
                }}
              >
                {quest.submissions.map((submission, index) => (
                  <div
                    key={submission.id}
                    style={{
                      padding: '40px',
                      background: hoveredSubmission === submission.id 
                        ? 'rgba(255,255,255,0.03)' 
                        : 'rgba(255,255,255,0.01)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '16px',
                      transition: 'all 0.3s',
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      setHoveredSubmission(submission.id);
                      e.currentTarget.style.borderColor = `${quest.color}40`;
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = `0 8px 32px ${quest.color}20`;
                    }}
                    onMouseLeave={(e) => {
                      setHoveredSubmission(null);
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* Animated border gradient */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '-2px',
                        left: '-2px',
                        right: '-2px',
                        bottom: '-2px',
                        background: `linear-gradient(45deg, transparent, ${quest.color}40, transparent)`,
                        borderRadius: '16px',
                        opacity: hoveredSubmission === submission.id ? 1 : 0,
                        transition: 'opacity 0.3s',
                        animation: hoveredSubmission === submission.id ? 'borderRotate 3s linear infinite' : 'none',
                      }}
                    ></div>

                    {/* Submission Number */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '40px',
                        right: '40px',
                        fontSize: '72px',
                        fontWeight: '900',
                        color: 'rgba(255,255,255,0.03)',
                        fontFamily: 'var(--font-space-grotesk)',
                        lineHeight: '1',
                      }}
                    >
                      {(index + 1).toString().padStart(2, '0')}
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: !isMobile && submission.previewUrl ? '1fr auto' : '1fr',
                        gap: '40px',
                        alignItems: 'start',
                        position: 'relative',
                        zIndex: 10,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '20px',
                            marginBottom: '24px',
                          }}
                        >
                          {/* Author avatar */}
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              background: `linear-gradient(135deg, ${quest.color}40, ${quest.color}20)`,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '18px',
                            }}
                          >
                            👤
                          </div>
                          
                          <div>
                            <span
                              style={{
                                fontSize: '16px',
                                fontFamily: 'monospace',
                                color: '#ddd',
                              }}
                            >
                              {submission.author}
                            </span>
                            <div
                              style={{
                                fontSize: '13px',
                                color: '#666',
                                marginTop: '2px',
                              }}
                            >
                              {submission.timestamp}
                            </div>
                          </div>

                          {/* Status badge */}
                          <span
                            style={{
                              marginLeft: 'auto',
                              padding: '6px 16px',
                              background: submission.status === 'approved' 
                                ? 'rgba(0,255,136,0.1)' 
                                : 'rgba(255,255,255,0.05)',
                              color: submission.status === 'approved'
                                ? '#00ff88'
                                : '#888',
                              fontSize: '12px',
                              borderRadius: '20px',
                              border: `1px solid ${submission.status === 'approved' ? 'rgba(0,255,136,0.3)' : 'rgba(255,255,255,0.1)'}`,
                              textTransform: 'uppercase',
                              letterSpacing: '0.1em',
                              fontWeight: '600',
                            }}
                          >
                            {submission.status}
                          </span>
                        </div>

                        <h3
                          style={{
                            fontSize: '20px',
                            color: '#fff',
                            marginBottom: '16px',
                            fontWeight: '400',
                          }}
                        >
                          {submission.content}
                        </h3>

                        <p
                          style={{
                            fontSize: '15px',
                            color: '#999',
                            lineHeight: '1.7',
                            marginBottom: '24px',
                          }}
                        >
                          Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                          Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        </p>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '24px',
                          }}
                        >
                          <button
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '8px',
                              padding: '10px 20px',
                              color: '#aaa',
                              fontSize: '14px',
                              cursor: 'pointer',
                              transition: 'all 0.3s',
                              fontWeight: '500',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = quest.color;
                              e.currentTarget.style.color = quest.color;
                              e.currentTarget.style.background = `${quest.color}10`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                              e.currentTarget.style.color = '#aaa';
                              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                            }}
                          >
                            <span style={{ fontSize: '16px' }}>▲</span>
                            <span>{submission.votes} votes</span>
                          </button>

                          <button
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#888',
                              fontSize: '14px',
                              cursor: 'pointer',
                              letterSpacing: '0.05em',
                              transition: 'color 0.3s',
                              fontWeight: '500',
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.color = quest.color)
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.color = '#888')
                            }
                          >
                            VIEW FULL SUBMISSION →
                          </button>
                        </div>
                      </div>

                      {/* Preview image */}
                      {!isMobile && submission.previewUrl && (
                        <div
                          style={{
                            width: '200px',
                            height: '200px',
                            background: `url(${submission.previewUrl}) center/cover`,
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            position: 'relative',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              background: 'linear-gradient(135deg, transparent, rgba(0,0,0,0.5))',
                            }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Load more button */}
              <div
                style={{
                  textAlign: 'center',
                  marginTop: '60px',
                }}
              >
                <button
                  style={{
                    padding: '14px 40px',
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: '#888',
                    fontSize: '14px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = quest.color;
                    e.currentTarget.style.color = quest.color;
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                    e.currentTarget.style.color = '#888';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  LOAD MORE SUBMISSIONS
                </button>
              </div>
            </div>
          )}

          {activeTab === 'discussion' && (
            <div
              style={{
                textAlign: 'center',
                padding: '120px 20px',
                color: '#666',
              }}
            >
              <div
                style={{
                  fontSize: '64px',
                  marginBottom: '24px',
                  opacity: 0.1,
                  filter: 'grayscale(1)',
                }}
              >
                💬
              </div>
              <h3
                style={{
                  fontSize: '28px',
                  fontWeight: '300',
                  marginBottom: '16px',
                  color: '#999',
                }}
              >
                DISCUSSION COMING SOON
              </h3>
              <p style={{
                fontSize: '16px',
                color: '#666',
                maxWidth: '400px',
                margin: '0 auto',
                lineHeight: '1.6',
              }}>
                Connect with other participants, share ideas, and get feedback on your work
              </p>
              
              <button
                style={{
                  marginTop: '32px',
                  padding: '12px 32px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#666',
                  fontSize: '13px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = quest.color;
                  e.currentTarget.style.color = quest.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
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
            background: 'rgba(0,0,0,0.9)',
            backdropFilter: 'blur(10px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.3s ease',
          }}
          onClick={() => setShowSubmitModal(false)}
        >
          <div
            style={{
              background: '#0a0a0a',
              border: '1px solid ' + quest.color + '40',
              borderRadius: '20px',
              padding: '48px',
              maxWidth: '600px',
              width: '100%',
              position: 'relative',
              boxShadow: `0 20px 60px ${quest.color}20`,
              animation: 'slideUp 0.3s ease',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowSubmitModal(false)}
              style={{
                position: 'absolute',
                top: '24px',
                right: '24px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                color: '#666',
                fontSize: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = quest.color;
                e.currentTarget.style.color = quest.color;
                e.currentTarget.style.transform = 'rotate(90deg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.color = '#666';
                e.currentTarget.style.transform = 'rotate(0deg)';
              }}
            >
              ×
            </button>

            <h2
              style={{
                fontSize: '28px',
                fontWeight: '300',
                marginBottom: '40px',
                fontFamily: 'var(--font-space-grotesk)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <span style={{ fontSize: '32px' }}>📤</span>
              SUBMIT YOUR WORK
            </h2>

            <form
              style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    color: '#888',
                    marginBottom: '8px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  Submission Title
                </label>
                <input
                  type="text"
                  placeholder="Give your submission a descriptive title"
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    padding: '16px',
                    color: '#fff',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'all 0.3s',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = quest.color;
                    e.currentTarget.style.background = `${quest.color}05`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    color: '#888',
                    marginBottom: '8px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  Description
                </label>
                <textarea
                  placeholder="Describe your work and creative process..."
                  rows={6}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    padding: '16px',
                    color: '#fff',
                    fontSize: '15px',
                    outline: 'none',
                    resize: 'none',
                    transition: 'all 0.3s',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = quest.color;
                    e.currentTarget.style.background = `${quest.color}05`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    color: '#888',
                    marginBottom: '8px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  Upload Files
                </label>
                <div
                  style={{
                    padding: '48px',
                    border: '2px dashed rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    background: 'rgba(255,255,255,0.01)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = quest.color + '60';
                    e.currentTarget.style.background = quest.color + '05';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.01)';
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.8 }}>📎</div>
                  <div style={{ fontSize: '15px', color: '#ddd', marginBottom: '8px' }}>
                    Drag files here or click to browse
                  </div>
                  <div style={{ fontSize: '13px', color: '#666' }}>
                    Supports: PNG, JPG, PDF, ZIP (Max 50MB)
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '16px',
                  marginTop: '24px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  style={{
                    flex: 1,
                    padding: '16px',
                    background: 'transparent',
                    color: '#888',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    fontSize: '14px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                    e.currentTarget.style.color = '#ccc';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.color = '#888';
                  }}
                >
                  CANCEL
                </button>
                
                <button
                  type="submit"
                  style={{
                    flex: 2,
                    padding: '16px',
                    background: `linear-gradient(135deg, ${quest.color}, ${quest.color}dd)`,
                    color: '#000',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    boxShadow: `0 4px 20px ${quest.color}40`,
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    setShowSubmitModal(false);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = `0 8px 30px ${quest.color}60`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = `0 4px 20px ${quest.color}40`;
                  }}
                >
                  SUBMIT ENTRY →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-20px) scale(1.05);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes slideRight {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes borderRotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
