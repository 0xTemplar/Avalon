import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/router';
import Navigation from '../components/navigation/Navigation';
import Footer from '../components/footer/Footer';
import BackgroundElements from '../components/ui/BackgroundElements';
import GlobalStyles from '../components/ui/GlobalStyles';
import { useSubgraphUserProfile } from '../hooks/useSubgraphUserProfile';
import Avvvatars from 'avvvatars-react';

export default function Profile() {
  const { authenticated, user } = usePrivy();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [notifications] = useState([
    { id: 1, text: 'Profile updated successfully', time: '5m ago' },
  ]);

  // Get user address
  const walletAddress =
    user?.wallet?.address ||
    user?.linkedAccounts?.find((account) => account.type === 'wallet')?.address;

  // Fetch user profile data from subgraph
  const {
    data: profileData,
    isLoading,
    error,
  } = useSubgraphUserProfile(walletAddress);

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    if (!authenticated) {
      router.push('/');
    }
  }, [authenticated, router]);

  if (!authenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div style={{ background: '#000', minHeight: '100vh', color: 'white' }}>
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
          setShowCreateModal={() => {}}
        />

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '80vh',
            padding: '0 20px',
          }}
        >
          <div
            style={{
              background: 'rgba(23, 23, 23, 0.9)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '60px',
              borderRadius: '0',
              textAlign: 'center',
              clipPath:
                'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                border: '2px solid #00ff88',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                margin: '0 auto 30px',
                animation: 'spin 1s linear infinite',
              }}
            />
            <p
              style={{
                fontFamily: 'var(--font-space-grotesk)',
                fontSize: '14px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#888',
              }}
            >
              Loading Profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{ background: '#0c0c0c', minHeight: '100vh', color: 'white' }}
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
          setShowCreateModal={() => {}}
        />

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '80vh',
            padding: '0 20px',
          }}
        >
          <div
            style={{
              background: 'rgba(23, 23, 23, 0.9)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 0, 136, 0.3)',
              padding: '60px',
              borderRadius: '0',
              textAlign: 'center',
              clipPath:
                'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-space-grotesk)',
                fontSize: '14px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#ff0088',
                marginBottom: '20px',
              }}
            >
              Error Loading Profile
            </p>
            <p style={{ color: '#888', fontSize: '12px' }}>
              Unable to fetch profile data from subgraph
            </p>
          </div>
        </div>
      </div>
    );
  }

  const formatBountyAmount = (amount: string) => {
    const eth = parseFloat(amount) / 1e18;
    return `${eth.toFixed(2)} ETH`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return '#00ff88';
      case 'COMPLETED':
        return '#00ccff';
      case 'CANCELLED':
        return '#ff0088';
      default:
        return '#ffa500';
    }
  };

  const getReputationLevel = (rep: string) => {
    const reputation = parseInt(rep);
    if (reputation >= 1000) return { level: 'LEGENDARY', color: '#FFD700' };
    if (reputation >= 500) return { level: 'EXPERT', color: '#ff0088' };
    if (reputation >= 200) return { level: 'ADVANCED', color: '#00ccff' };
    if (reputation >= 50) return { level: 'INTERMEDIATE', color: '#00ff88' };
    return { level: 'BEGINNER', color: '#888' };
  };

  const repLevel = getReputationLevel(profileData?.reputation || '0');

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: 'white' }}>
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
        setShowCreateModal={() => {}}
      />

      <div style={{ paddingTop: '73px' }}>
        {/* Profile Header with Banner */}
        <div
          style={{
            position: 'relative',
            height: isMobile ? '280px' : '320px',
            background: `linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 204, 255, 0.1) 50%, rgba(255, 0, 136, 0.1) 100%)`,
            overflow: 'hidden',
          }}
        >
          {/* Animated gradient overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 255, 136, 0.15) 0%, transparent 40%)`,
              pointerEvents: 'none',
            }}
          />

          {/* Geometric patterns */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '100px',
              height: '100px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transform: 'rotate(45deg)',
              animation: 'float 6s ease-in-out infinite',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              left: '40px',
              width: '60px',
              height: '60px',
              border: '1px solid rgba(0, 255, 136, 0.2)',
              transform: 'rotate(15deg)',
              animation: 'float 8s ease-in-out infinite reverse',
            }}
          />

          {/* Grid pattern */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
            }}
          />

          {/* Profile info container */}
          <div
            style={{
              position: 'absolute',
              bottom: '-10px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              maxWidth: '1200px',
              padding: isMobile ? '0 20px' : '0 60px',
              display: 'flex',
              alignItems: 'flex-end',
              gap: isMobile ? '20px' : '40px',
              flexDirection: isMobile ? 'column' : 'row',
            }}
          >
            {/* Avatar with level indicator */}
            <div
              style={{
                position: 'relative',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: isMobile ? '120px' : '160px',
                  height: isMobile ? '120px' : '160px',
                  borderRadius: '50%',
                  background:
                    'linear-gradient(135deg, #00ff88 0%, #00ccff 50%, #ff0088 100%)',
                  padding: '3px',
                  animation: 'pulse-green 4s ease-in-out infinite',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: '#0c0c0c',
                    padding: '4px',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    <Avvvatars
                      value={walletAddress || ''}
                      size={isMobile ? 106 : 146}
                    />
                  </div>
                </div>
              </div>

              {/* Level badge */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  right: '10px',
                  background: repLevel.color,
                  color: '#000',
                  padding: '6px 12px',
                  fontSize: '10px',
                  fontWeight: '700',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-space-grotesk)',
                  clipPath:
                    'polygon(0 0, calc(100% - 8px) 0, 100% 100%, 8px 100%)',
                }}
              >
                {repLevel.level}
              </div>
            </div>

            {/* User info */}
            <div
              style={{
                flex: 1,
                paddingBottom: '20px',
              }}
            >
              <h1
                style={{
                  fontSize: isMobile ? '36px' : '48px',
                  fontWeight: '700',
                  marginBottom: '8px',
                  background: profileData?.username
                    ? 'linear-gradient(135deg, #fff 0%, #aaa 100%)'
                    : 'linear-gradient(135deg, #666 0%, #444 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  lineHeight: 1,
                }}
              >
                {profileData?.username || ''}
              </h1>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  marginBottom: '20px',
                }}
              >
                <p
                  style={{
                    color: '#666',
                    fontSize: '14px',
                    letterSpacing: '0.05em',
                    fontFamily: 'monospace',
                  }}
                >
                  {walletAddress?.slice(0, 8)}...{walletAddress?.slice(-6)}
                </p>

                <button
                  onClick={() => {
                    if (walletAddress) {
                      navigator.clipboard.writeText(walletAddress);
                    }
                  }}
                  style={{
                    background: 'transparent',
                    border: '1px solid #333',
                    color: '#666',
                    padding: '4px 8px',
                    fontSize: '10px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#00ff88';
                    e.currentTarget.style.color = '#00ff88';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#333';
                    e.currentTarget.style.color = '#666';
                  }}
                >
                  Copy
                </button>
              </div>

              {/* Skills */}
              {profileData?.skills && profileData.skills.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {profileData.skills.map((skill, index) => (
                    <span
                      key={index}
                      style={{
                        background: 'rgba(0, 255, 136, 0.1)',
                        border: '1px solid rgba(0, 255, 136, 0.3)',
                        color: '#00ff88',
                        padding: '6px 14px',
                        fontSize: '11px',
                        fontFamily: 'var(--font-space-grotesk)',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        clipPath:
                          'polygon(0 0, calc(100% - 6px) 0, 100% 100%, 6px 100%)',
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: isMobile ? '140px 20px 80px' : '160px 60px 80px',
          }}
        >
          {/* Stats Section */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
              gap: '20px',
              marginBottom: '60px',
            }}
          >
            {/* Reputation Card */}
            <div
              onMouseEnter={() => setHoveredCard('reputation')}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                background:
                  hoveredCard === 'reputation'
                    ? 'linear-gradient(135deg, rgba(0, 255, 136, 0.15) 0%, rgba(0, 255, 136, 0.05) 100%)'
                    : 'rgba(23, 23, 23, 0.6)',
                backdropFilter: 'blur(12px)',
                border: `1px solid ${
                  hoveredCard === 'reputation'
                    ? '#00ff88'
                    : 'rgba(255, 255, 255, 0.05)'
                }`,
                padding: '30px',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                transform:
                  hoveredCard === 'reputation'
                    ? 'translateY(-4px)'
                    : 'translateY(0)',
                cursor: 'pointer',
                clipPath:
                  'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-50%',
                  right: '-50%',
                  width: '200%',
                  height: '200%',
                  background:
                    'radial-gradient(circle, rgba(0, 255, 136, 0.1) 0%, transparent 70%)',
                  transform: 'rotate(45deg)',
                  opacity: hoveredCard === 'reputation' ? 1 : 0,
                  transition: 'opacity 0.3s ease',
                }}
              />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#00ff88',
                    marginBottom: '8px',
                    fontFamily: 'var(--font-space-grotesk)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span style={{ fontSize: '16px' }}>⬢</span> Reputation
                </div>
                <h3
                  style={{
                    fontSize: '36px',
                    fontWeight: '700',
                    color: '#fff',
                    marginBottom: '4px',
                    lineHeight: 1,
                  }}
                >
                  {profileData?.formattedReputation || '0'}
                </h3>
                <p
                  style={{
                    fontSize: '11px',
                    color: '#666',
                    fontFamily: 'var(--font-space-grotesk)',
                    letterSpacing: '0.05em',
                  }}
                >
                  {repLevel.level} LEVEL
                </p>
              </div>
            </div>

            {/* Quests Created Card */}
            <div
              onMouseEnter={() => setHoveredCard('created')}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                background:
                  hoveredCard === 'created'
                    ? 'linear-gradient(135deg, rgba(0, 204, 255, 0.15) 0%, rgba(0, 204, 255, 0.05) 100%)'
                    : 'rgba(23, 23, 23, 0.6)',
                backdropFilter: 'blur(12px)',
                border: `1px solid ${
                  hoveredCard === 'created'
                    ? '#00ccff'
                    : 'rgba(255, 255, 255, 0.05)'
                }`,
                padding: '30px',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                transform:
                  hoveredCard === 'created'
                    ? 'translateY(-4px)'
                    : 'translateY(0)',
                cursor: 'pointer',
                clipPath:
                  'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-50%',
                  right: '-50%',
                  width: '200%',
                  height: '200%',
                  background:
                    'radial-gradient(circle, rgba(0, 204, 255, 0.1) 0%, transparent 70%)',
                  transform: 'rotate(45deg)',
                  opacity: hoveredCard === 'created' ? 1 : 0,
                  transition: 'opacity 0.3s ease',
                }}
              />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#00ccff',
                    marginBottom: '8px',
                    fontFamily: 'var(--font-space-grotesk)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span style={{ fontSize: '16px' }}>◆</span> Created
                </div>
                <h3
                  style={{
                    fontSize: '36px',
                    fontWeight: '700',
                    color: '#fff',
                    marginBottom: '4px',
                    lineHeight: 1,
                  }}
                >
                  {profileData?.totalQuestsCreated || '0'}
                </h3>
                <p
                  style={{
                    fontSize: '11px',
                    color: '#666',
                    fontFamily: 'var(--font-space-grotesk)',
                    letterSpacing: '0.05em',
                  }}
                >
                  QUESTS LAUNCHED
                </p>
              </div>
            </div>

            {/* Quests Completed Card */}
            <div
              onMouseEnter={() => setHoveredCard('completed')}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                background:
                  hoveredCard === 'completed'
                    ? 'linear-gradient(135deg, rgba(255, 165, 0, 0.15) 0%, rgba(255, 165, 0, 0.05) 100%)'
                    : 'rgba(23, 23, 23, 0.6)',
                backdropFilter: 'blur(12px)',
                border: `1px solid ${
                  hoveredCard === 'completed'
                    ? '#ffa500'
                    : 'rgba(255, 255, 255, 0.05)'
                }`,
                padding: '30px',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                transform:
                  hoveredCard === 'completed'
                    ? 'translateY(-4px)'
                    : 'translateY(0)',
                cursor: 'pointer',
                clipPath:
                  'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-50%',
                  right: '-50%',
                  width: '200%',
                  height: '200%',
                  background:
                    'radial-gradient(circle, rgba(255, 165, 0, 0.1) 0%, transparent 70%)',
                  transform: 'rotate(45deg)',
                  opacity: hoveredCard === 'completed' ? 1 : 0,
                  transition: 'opacity 0.3s ease',
                }}
              />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#ffa500',
                    marginBottom: '8px',
                    fontFamily: 'var(--font-space-grotesk)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span style={{ fontSize: '16px' }}>▲</span> Completed
                </div>
                <h3
                  style={{
                    fontSize: '36px',
                    fontWeight: '700',
                    color: '#fff',
                    marginBottom: '4px',
                    lineHeight: 1,
                  }}
                >
                  {profileData?.totalQuestsCompleted || '0'}
                </h3>
                <p
                  style={{
                    fontSize: '11px',
                    color: '#666',
                    fontFamily: 'var(--font-space-grotesk)',
                    letterSpacing: '0.05em',
                  }}
                >
                  CHALLENGES WON
                </p>
              </div>
            </div>

            {/* Total Rewards Card */}
            <div
              onMouseEnter={() => setHoveredCard('rewards')}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                background:
                  hoveredCard === 'rewards'
                    ? 'linear-gradient(135deg, rgba(255, 0, 136, 0.15) 0%, rgba(255, 0, 136, 0.05) 100%)'
                    : 'rgba(23, 23, 23, 0.6)',
                backdropFilter: 'blur(12px)',
                border: `1px solid ${
                  hoveredCard === 'rewards'
                    ? '#ff0088'
                    : 'rgba(255, 255, 255, 0.05)'
                }`,
                padding: '30px',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                transform:
                  hoveredCard === 'rewards'
                    ? 'translateY(-4px)'
                    : 'translateY(0)',
                cursor: 'pointer',
                clipPath:
                  'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-50%',
                  right: '-50%',
                  width: '200%',
                  height: '200%',
                  background:
                    'radial-gradient(circle, rgba(255, 0, 136, 0.1) 0%, transparent 70%)',
                  transform: 'rotate(45deg)',
                  opacity: hoveredCard === 'rewards' ? 1 : 0,
                  transition: 'opacity 0.3s ease',
                }}
              />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#ff0088',
                    marginBottom: '8px',
                    fontFamily: 'var(--font-space-grotesk)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span style={{ fontSize: '16px' }}>◈</span> Earnings
                </div>
                <h3
                  style={{
                    fontSize: '36px',
                    fontWeight: '700',
                    color: '#fff',
                    marginBottom: '4px',
                    lineHeight: 1,
                  }}
                >
                  {profileData?.formattedTotalRewards || '0.00 ETH'}
                </h3>
                <p
                  style={{
                    fontSize: '11px',
                    color: '#666',
                    fontFamily: 'var(--font-space-grotesk)',
                    letterSpacing: '0.05em',
                  }}
                >
                  TOTAL REWARDS
                </p>
              </div>
            </div>
          </div>

          {/* Created Quests Section */}
          {profileData?.createdQuests &&
            profileData.createdQuests.length > 0 && (
              <div style={{ marginBottom: '60px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '40px',
                    gap: '20px',
                  }}
                >
                  <h2
                    style={{
                      fontSize: isMobile ? '24px' : '32px',
                      fontWeight: '700',
                      color: '#fff',
                      position: 'relative',
                    }}
                  >
                    Quest Portfolio
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '-8px',
                        left: 0,
                        width: '60px',
                        height: '3px',
                        background:
                          'linear-gradient(90deg, #00ff88 0%, transparent 100%)',
                      }}
                    />
                  </h2>

                  <div
                    style={{
                      flex: 1,
                      height: '1px',
                      background:
                        'linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%)',
                    }}
                  />

                  <span
                    style={{
                      fontSize: '14px',
                      color: '#666',
                      fontFamily: 'var(--font-space-grotesk)',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {profileData.createdQuests.length} ACTIVE
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile
                      ? '1fr'
                      : 'repeat(auto-fill, minmax(380px, 1fr))',
                    gap: '24px',
                  }}
                >
                  {profileData.createdQuests.map((quest, index) => (
                    <div
                      key={index}
                      onMouseEnter={() => setHoveredCard(`quest-${index}`)}
                      onMouseLeave={() => setHoveredCard(null)}
                      style={{
                        background:
                          hoveredCard === `quest-${index}`
                            ? 'rgba(23, 23, 23, 0.9)'
                            : 'rgba(23, 23, 23, 0.6)',
                        backdropFilter: 'blur(12px)',
                        border: `1px solid ${
                          hoveredCard === `quest-${index}`
                            ? getStatusColor(quest.status)
                            : 'rgba(255, 255, 255, 0.05)'
                        }`,
                        padding: '32px',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden',
                        transform:
                          hoveredCard === `quest-${index}`
                            ? 'translateY(-4px) scale(1.01)'
                            : 'translateY(0) scale(1)',
                        clipPath:
                          'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))',
                      }}
                    >
                      {/* Hover gradient effect */}
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: `radial-gradient(circle at 50% 50%, ${getStatusColor(
                            quest.status
                          )}20 0%, transparent 70%)`,
                          opacity: hoveredCard === `quest-${index}` ? 1 : 0,
                          transition: 'opacity 0.3s ease',
                        }}
                      />

                      {/* Content */}
                      <div style={{ position: 'relative', zIndex: 1 }}>
                        {/* Status badge */}
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginBottom: '16px',
                          }}
                        >
                          <div
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: getStatusColor(quest.status),
                              boxShadow: `0 0 10px ${getStatusColor(
                                quest.status
                              )}`,
                            }}
                          />
                          <span
                            style={{
                              fontSize: '11px',
                              color: getStatusColor(quest.status),
                              letterSpacing: '0.1em',
                              textTransform: 'uppercase',
                              fontFamily: 'var(--font-space-grotesk)',
                            }}
                          >
                            {quest.status}
                          </span>
                        </div>

                        <h3
                          style={{
                            fontSize: '20px',
                            fontWeight: '600',
                            color: '#fff',
                            marginBottom: '24px',
                            lineHeight: '1.4',
                          }}
                        >
                          {quest.title}
                        </h3>

                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-end',
                          }}
                        >
                          <div>
                            <p
                              style={{
                                fontSize: '11px',
                                color: '#666',
                                marginBottom: '4px',
                                letterSpacing: '0.05em',
                                textTransform: 'uppercase',
                                fontFamily: 'var(--font-space-grotesk)',
                              }}
                            >
                              Bounty Pool
                            </p>
                            <p
                              style={{
                                fontSize: '20px',
                                fontWeight: '700',
                                color: '#00ff88',
                              }}
                            >
                              {formatBountyAmount(quest.bountyAmount)}
                            </p>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <p
                              style={{
                                fontSize: '11px',
                                color: '#666',
                                marginBottom: '4px',
                                letterSpacing: '0.05em',
                                textTransform: 'uppercase',
                                fontFamily: 'var(--font-space-grotesk)',
                              }}
                            >
                              Participants
                            </p>
                            <p
                              style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#fff',
                              }}
                            >
                              {quest.participantCount}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Corner accent */}
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          width: '20px',
                          height: '20px',
                          background:
                            hoveredCard === `quest-${index}`
                              ? getStatusColor(quest.status)
                              : 'transparent',
                          clipPath: 'polygon(0 0, 100% 0, 100% 100%)',
                          transition: 'all 0.3s ease',
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Empty state */}
          {(!profileData?.createdQuests ||
            profileData.createdQuests.length === 0) && (
            <div
              style={{
                background: 'rgba(23, 23, 23, 0.6)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                padding: '100px 40px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                clipPath:
                  'polygon(0 0, calc(100% - 30px) 0, 100% 30px, 100% 100%, 30px 100%, 0 calc(100% - 30px))',
              }}
            >
              {/* Grid pattern */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
                                   linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)`,
                  backgroundSize: '50px 50px',
                }}
              />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div
                  style={{
                    width: '100px',
                    height: '100px',
                    margin: '0 auto 30px',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      border: '2px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '50%',
                      animation: 'pulse-green 3s ease-in-out infinite',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: '20px',
                      border: '2px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '50%',
                      animation: 'pulse-green 3s ease-in-out infinite 0.5s',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '36px',
                      color: '#333',
                    }}
                  >
                    +
                  </div>
                </div>

                <h3
                  style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    color: '#666',
                    marginBottom: '16px',
                  }}
                >
                  Your Quest Journey Begins Here
                </h3>

                <p
                  style={{
                    color: '#555',
                    fontSize: '14px',
                    maxWidth: '400px',
                    margin: '0 auto 32px',
                    lineHeight: '1.6',
                  }}
                >
                  Create your first quest to showcase your vision, attract
                  collaborators, and build your reputation in the community.
                </p>

                <button
                  onClick={() => router.push('/')}
                  style={{
                    background: '#00ff88',
                    color: '#000',
                    border: 'none',
                    padding: '14px 32px',
                    fontSize: '14px',
                    fontWeight: '600',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    clipPath:
                      'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 12px 100%)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow =
                      '0 10px 30px rgba(0, 255, 136, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Create First Quest
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer isMobile={isMobile} />
    </div>
  );
}
