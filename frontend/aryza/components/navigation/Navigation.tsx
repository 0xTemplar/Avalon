import React from 'react';

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
  isWalletConnected,
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
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: '#00ff88',
                clipPath:
                  'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
                animation: 'pulse-green 3s infinite',
              }}
            ></div>
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
            <span style={{ color: '#00ff88' }}>Quest</span>
            <span style={{ color: '#666', margin: '0 8px' }}>/</span>
            <span style={{ color: '#fff' }}>Board</span>
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
              onClick={() => setShowCreateModal(true)}
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

            <button
              onClick={() => setIsWalletConnected(!isWalletConnected)}
              style={{
                width: '40px',
                height: '40px',
                border: `1px solid ${isWalletConnected ? '#00ff88' : '#333'}`,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                background: isWalletConnected
                  ? 'rgba(0,255,136,0.1)'
                  : 'transparent',
                color: isWalletConnected ? '#00ff88' : '#fff',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'rotate(90deg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'rotate(0)';
              }}
            >
              <span style={{ fontSize: '20px' }}>
                {isWalletConnected ? '◉' : '⊕'}
              </span>
            </button>
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
              setShowCreateModal(true);
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

          <button
            onClick={() => {
              setIsWalletConnected(!isWalletConnected);
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
            {isWalletConnected ? 'Disconnect Wallet' : 'Connect Wallet'}
          </button>

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
    </>
  );
}
