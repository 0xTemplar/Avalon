import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import { useRouter } from 'next/router';
import { usePrivy } from '@privy-io/react-auth';
import { toast } from 'react-toastify';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useUsernameCache } from '../../hooks/useUsernameCache';
import UserRegistrationModal from '../modals/UserRegistrationModal';
import Image from 'next/image';

interface NavigationProps {
  isMobile: boolean;
  isWalletConnected: boolean;
  setIsWalletConnected: (connected: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  notifications: Array<{ id: number; text: string; time: string }>;
  showMobileMenu: boolean;
  setShowMobileMenu: (show: boolean) => void;
  setShowCreateModal: (show: boolean) => void;
}

export default function Navigation({
  isMobile,
  isWalletConnected: _isWalletConnected,
  setIsWalletConnected,
  searchQuery,
  setSearchQuery,
  showNotifications,
  setShowNotifications,
  notifications,
  showMobileMenu,
  setShowMobileMenu,
  setShowCreateModal,
}: NavigationProps) {
  const router = useRouter();
  const { login, logout, authenticated, user } = usePrivy();
  const { hasProfile, profile, isCheckingProfile } = useUserProfile();
  const { getCachedUsername, setCachedUsername } = useUsernameCache();
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowWalletDropdown(false);
      }
    };

    if (showWalletDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showWalletDropdown]);

  // Check for profile registration when user authenticates
  useEffect(() => {
    if (authenticated && hasProfile === false && !isCheckingProfile) {
      // User is authenticated but doesn't have a profile, show registration modal
      setShowRegistrationModal(true);
    }
  }, [authenticated, hasProfile, isCheckingProfile]);

  const handleAuth = () => {
    if (authenticated) {
      logout();
      setIsWalletConnected(false);
    } else {
      login();
      setIsWalletConnected(true);
    }
  };

  const walletAddress = useMemo(() => {
    if (user?.wallet?.address) {
      return user.wallet.address;
    }
    if (user?.linkedAccounts && user.linkedAccounts.length > 0) {
      const walletAccount = user.linkedAccounts.find(
        (account) => account.type === 'wallet'
      );
      return walletAccount?.address;
    }
    return null;
  }, [user?.wallet?.address, user?.linkedAccounts]);

  const truncateAddress = useCallback((address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, []);

  // Cache username when profile data is available
  useEffect(() => {
    if (profile?.username && walletAddress) {
      setCachedUsername(walletAddress, profile.username);
    }
  }, [profile?.username, setCachedUsername, walletAddress]);

  const displayName = useMemo(() => {
    // First check if we have fresh profile data
    if (profile?.username) {
      return profile.username;
    }

    // Fallback to cached username if available
    if (walletAddress) {
      const cachedUsername = getCachedUsername(walletAddress);
      if (cachedUsername) {
        return cachedUsername;
      }
      return truncateAddress(walletAddress);
    }

    return 'Connected';
  }, [profile?.username, walletAddress, getCachedUsername, truncateAddress]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Address copied to clipboard!', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        style: {
          background: '#0a0a0a',
          border: '1px solid #00ff88',
          color: '#fff',
          fontFamily: 'var(--font-space-grotesk)',
          fontSize: '12px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        },
      });
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast.error('Failed to copy address', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        style: {
          background: '#0a0a0a',
          border: '1px solid #ff0088',
          color: '#fff',
          fontFamily: 'var(--font-space-grotesk)',
          fontSize: '12px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        },
      });
    }
  };

  const handleCreateQuest = () => {
    if (!authenticated) {
      toast.warning('Please sign in to create a quest', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        style: {
          background: '#0a0a0a',
          border: '1px solid #ffa500',
          color: '#fff',
          fontFamily: 'var(--font-space-grotesk)',
          fontSize: '12px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        },
      });
      return;
    }
    setShowCreateModal(true);
  };

  return (
    <>
      {/* Navigation - Responsive */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          padding: !isMobile ? '20px 40px' : '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(0,0,0,0.9)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid #222',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: !isMobile ? '20px' : '12px',
          }}
        >
          {/* Custom logo with animation */}
          <div
            style={{
              width: !isMobile ? '40px' : '32px',
              height: !isMobile ? '40px' : '32px',
              position: 'relative',
              transform: 'rotate(-15deg)',
            }}
          >
            {/* <div
              style={{
                position: 'absolute',
                inset: 0,
                background: '#00ff88',
                clipPath:
                  'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
                animation: 'pulse-green 3s infinite',
              }}
            ></div> */}
          </div>
          <h1
            style={{
              fontSize: !isMobile ? '18px' : '16px',
              fontWeight: '300',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-space-grotesk)',
            }}
          >
            <Image
              src="/avalon-logo.png"
              alt="Quest Board"
              width={100}
              height={100}
            />
          </h1>
        </div>

        {/* Desktop Navigation */}
        {!isMobile ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
            {/* Search Bar */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <input
                type="text"
                placeholder="SEARCH QUESTS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid #333',
                  padding: '8px 16px',
                  color: '#fff',
                  fontSize: '12px',
                  letterSpacing: '0.1em',
                  width: '200px',
                  transition: 'all 0.3s',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#00ff88';
                  e.currentTarget.style.width = '250px';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#333';
                  e.currentTarget.style.width = '200px';
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  right: '16px',
                  color: '#666',
                  fontSize: '14px',
                }}
              >
                ⌕
              </span>
            </div>

            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  width: '40px',
                  height: '40px',
                  border: '1px solid #333',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  background: 'transparent',
                  color: '#fff',
                  position: 'relative',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#00ff88';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#333';
                }}
              >
                <span style={{ fontSize: '18px' }}>◔</span>
                <span
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    width: '10px',
                    height: '10px',
                    background: '#ff0088',
                    borderRadius: '50%',
                    border: '2px solid #000',
                  }}
                ></span>
              </button>

              {showNotifications && (
                <div
                  style={{
                    position: 'absolute',
                    top: '50px',
                    right: 0,
                    width: '300px',
                    background: '#0a0a0a',
                    border: '1px solid #333',
                    padding: '20px',
                    zIndex: 100,
                  }}
                >
                  <h3
                    style={{
                      fontSize: '14px',
                      marginBottom: '16px',
                      color: '#00ff88',
                    }}
                  >
                    NOTIFICATIONS
                  </h3>
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      style={{
                        padding: '12px 0',
                        borderBottom: '1px solid #222',
                      }}
                    >
                      <p
                        style={{
                          fontSize: '12px',
                          color: '#fff',
                          marginBottom: '4px',
                        }}
                      >
                        {notif.text}
                      </p>
                      <span style={{ fontSize: '10px', color: '#666' }}>
                        {notif.time}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleCreateQuest}
              style={{
                padding: '12px 30px',
                background: 'none',
                border: '1px solid #00ff88',
                color: '#00ff88',
                fontSize: '12px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s',
                clipPath:
                  'polygon(0 0, calc(100% - 10px) 0, 100% 100%, 10px 100%)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow =
                  '0 5px 20px rgba(0,255,136,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Create Quest
            </button>

            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button
                onClick={
                  authenticated
                    ? () => setShowWalletDropdown(!showWalletDropdown)
                    : handleAuth
                }
                style={{
                  padding: '12px 30px',
                  background: authenticated ? 'rgba(0,255,136,0.1)' : 'none',
                  border: `1px solid ${authenticated ? '#00ff88' : '#00ff88'}`,
                  color: authenticated ? '#00ff88' : '#00ff88',
                  fontSize: '12px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s',
                  clipPath:
                    'polygon(0 0, calc(100% - 10px) 0, 100% 100%, 10px 100%)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow =
                    '0 5px 20px rgba(0,255,136,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {authenticated ? displayName : 'Sign In'}
              </button>

              {showWalletDropdown && authenticated && (
                <div
                  style={{
                    position: 'absolute',
                    top: '50px',
                    right: 0,
                    width: '250px',
                    background: '#0a0a0a',
                    border: '1px solid #333',
                    padding: '20px',
                    zIndex: 100,
                    clipPath:
                      'polygon(0 0, calc(100% - 10px) 0, 100% 100%, 10px 100%)',
                  }}
                >
                  <h3
                    style={{
                      fontSize: '14px',
                      marginBottom: '16px',
                      color: '#00ff88',
                      letterSpacing: '0.1em',
                    }}
                  >
                    WALLET
                  </h3>

                  {/* Profile Info */}
                  <div
                    style={{
                      padding: '12px 0',
                      borderBottom: '1px solid #222',
                      marginBottom: '16px',
                    }}
                  >
                    {profile?.username && (
                      <>
                        <p
                          style={{
                            fontSize: '10px',
                            color: '#666',
                            marginBottom: '4px',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                          }}
                        >
                          Username
                        </p>
                        <p
                          style={{
                            fontSize: '14px',
                            color: '#00ff88',
                            marginBottom: '12px',
                            fontFamily: 'var(--font-space-grotesk)',
                          }}
                        >
                          {profile.username}
                        </p>
                      </>
                    )}
                    {walletAddress && (
                      <>
                        <p
                          style={{
                            fontSize: '10px',
                            color: '#666',
                            marginBottom: '4px',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                          }}
                        >
                          Address
                        </p>
                        <p
                          style={{
                            fontSize: '12px',
                            color: '#fff',
                            fontFamily: 'monospace',
                          }}
                        >
                          {truncateAddress(walletAddress)}
                        </p>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      router.push('/profile');
                      setShowWalletDropdown(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(0,204,255,0.1)',
                      border: '1px solid #00ccff',
                      color: '#00ccff',
                      fontSize: '12px',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      marginBottom: '12px',
                      transition: 'all 0.3s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(0,204,255,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(0,204,255,0.1)';
                    }}
                  >
                    View Profile
                  </button>

                  <button
                    onClick={() => {
                      if (walletAddress) {
                        copyToClipboard(walletAddress);
                        setShowWalletDropdown(false);
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(0,255,136,0.1)',
                      border: '1px solid #00ff88',
                      color: '#00ff88',
                      fontSize: '12px',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      marginBottom: '12px',
                      transition: 'all 0.3s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(0,255,136,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(0,255,136,0.1)';
                    }}
                  >
                    Copy Address
                  </button>

                  <button
                    onClick={() => {
                      handleAuth();
                      setShowWalletDropdown(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'transparent',
                      border: '1px solid #666',
                      color: '#666',
                      fontSize: '12px',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#ff0088';
                      e.currentTarget.style.color = '#ff0088';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#666';
                      e.currentTarget.style.color = '#666';
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Mobile Menu Button */
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            style={{
              width: '40px',
              height: '40px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '4px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                width: '24px',
                height: '2px',
                background: '#00ff88',
                transition: 'all 0.3s',
                transform: showMobileMenu
                  ? 'rotate(45deg) translateY(6px)'
                  : 'none',
              }}
            ></span>
            <span
              style={{
                width: '24px',
                height: '2px',
                background: '#00ff88',
                transition: 'all 0.3s',
                opacity: showMobileMenu ? 0 : 1,
              }}
            ></span>
            <span
              style={{
                width: '24px',
                height: '2px',
                background: '#00ff88',
                transition: 'all 0.3s',
                transform: showMobileMenu
                  ? 'rotate(-45deg) translateY(-6px)'
                  : 'none',
              }}
            ></span>
          </button>
        )}
      </nav>

      {/* Mobile Menu */}
      {showMobileMenu && isMobile && (
        <div
          style={{
            position: 'fixed',
            top: '73px',
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.98)',
            zIndex: 49,
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* Mobile Search */}
          <input
            type="text"
            placeholder="SEARCH QUESTS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid #333',
              padding: '12px 16px',
              color: '#fff',
              fontSize: '14px',
              letterSpacing: '0.1em',
              width: '100%',
            }}
          />

          {/* Mobile Actions */}
          <button
            onClick={() => {
              handleCreateQuest();
              setShowMobileMenu(false);
            }}
            style={{
              padding: '16px',
              background: '#00ff88',
              color: '#000',
              border: 'none',
              fontSize: '14px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontWeight: '600',
            }}
          >
            Create Quest
          </button>

          {authenticated ? (
            <div
              style={{
                border: '1px solid #333',
                padding: '16px',
                marginBottom: '12px',
              }}
            >
              <p
                style={{
                  fontSize: '10px',
                  color: '#666',
                  marginBottom: '8px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                Connected Wallet
              </p>
              <p
                style={{
                  fontSize: '14px',
                  color: '#00ff88',
                  fontFamily: 'monospace',
                  marginBottom: '16px',
                }}
              >
                {displayName}
              </p>

              <button
                onClick={() => {
                  router.push('/profile');
                  setShowMobileMenu(false);
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(0,204,255,0.1)',
                  border: '1px solid #00ccff',
                  color: '#00ccff',
                  fontSize: '12px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: '12px',
                }}
              >
                View Profile
              </button>

              <button
                onClick={() => {
                  if (walletAddress) {
                    copyToClipboard(walletAddress);
                  }
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(0,255,136,0.1)',
                  border: '1px solid #00ff88',
                  color: '#00ff88',
                  fontSize: '12px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: '12px',
                }}
              >
                Copy Address
              </button>

              <button
                onClick={() => {
                  handleAuth();
                  setShowMobileMenu(false);
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'transparent',
                  border: '1px solid #666',
                  color: '#666',
                  fontSize: '12px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                handleAuth();
                setShowMobileMenu(false);
              }}
              style={{
                padding: '16px',
                background: 'transparent',
                color: '#00ff88',
                border: '1px solid #00ff88',
                fontSize: '14px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              Sign In
            </button>
          )}

          {/* Notifications */}
          <div
            style={{
              borderTop: '1px solid #333',
              paddingTop: '20px',
            }}
          >
            <h3
              style={{
                fontSize: '14px',
                marginBottom: '16px',
                color: '#00ff88',
              }}
            >
              NOTIFICATIONS
            </h3>
            {notifications.map((notif) => (
              <div
                key={notif.id}
                style={{
                  padding: '12px 0',
                  borderBottom: '1px solid #222',
                }}
              >
                <p
                  style={{
                    fontSize: '12px',
                    color: '#fff',
                    marginBottom: '4px',
                  }}
                >
                  {notif.text}
                </p>
                <span style={{ fontSize: '10px', color: '#666' }}>
                  {notif.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <UserRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onSuccess={() => {
          setShowRegistrationModal(false);
          toast.success('Welcome to Quest Board!', {
            position: 'top-right',
            autoClose: 3000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: false,
            style: {
              background: '#0a0a0a',
              border: '1px solid #00ff88',
              color: '#fff',
              fontFamily: 'var(--font-space-grotesk)',
              fontSize: '12px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            },
          });
        }}
      />
    </>
  );
}
