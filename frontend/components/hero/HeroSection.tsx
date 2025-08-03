import React from 'react';

interface HeroSectionProps {
  isMobile: boolean;
  setShowCreateModal: (show: boolean) => void;
}

export default function HeroSection({
  isMobile,
  setShowCreateModal,
}: HeroSectionProps) {
  return (
    <section
      style={{
        position: 'relative',
        padding: !isMobile ? '60px 40px 100px' : '40px 20px 60px',
        maxWidth: '1400px',
        margin: '0 auto',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: !isMobile ? 'grid' : 'flex',
          gridTemplateColumns: '1.5fr 1fr',
          gap: '40px',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        <div style={{ paddingLeft: !isMobile ? '80px' : '0' }}>
          <h2
            style={{
              fontSize: !isMobile ? '72px' : '48px',
              fontWeight: '900',
              lineHeight: '0.9',
              marginBottom: '30px',
              fontFamily: 'var(--font-space-grotesk)',
              letterSpacing: '-0.02em',
            }}
          >
            <span style={{ color: '#fff' }}>CREATE</span>
            <br />
            <span
              style={{
                color: 'transparent',
                WebkitTextStroke: !isMobile ? '2px #00ff88' : '1px #00ff88',
                marginLeft: !isMobile ? '60px' : '30px',
                display: 'inline-block',
              }}
            >
              COLLAB
            </span>
            <br />
            <span style={{ color: '#00ff88' }}>COLLECT</span>
          </h2>
          <p
            style={{
              fontSize: !isMobile ? '16px' : '14px',
              color: '#999',
              maxWidth: '400px',
              lineHeight: '1.8',
              marginBottom: '40px',
            }}
          >
            The decentralized creative economy starts here. Post quests,
            complete challenges, earn rewards.
          </p>

          {/* Subtle Etherlink badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px',
              opacity: 0.6,
              transition: 'opacity 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0.6';
            }}
          >
            <div
              style={{
                width: '20px',
                height: '1px',
                background: '#333',
              }}
            ></div>
            <span
              style={{
                fontSize: '10px',
                color: '#666',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              Secured by
            </span>
            <img
              src="/etherlink.svg"
              alt="Etherlink"
              style={{
                height: '16px',
                filter: 'brightness(0.7)',
                transition: 'filter 0.3s',
              }}
            />
            <div
              style={{
                width: '20px',
                height: '1px',
                background: '#333',
              }}
            ></div>
          </div>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <button
              style={{
                padding: !isMobile ? '16px 40px' : '14px 30px',
                background: '#00ff88',
                color: '#000',
                border: 'none',
                fontSize: !isMobile ? '14px' : '12px',
                fontWeight: '600',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.3s',
                transform: 'skewX(-10deg)',
              }}
              onClick={() => setShowCreateModal(true)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform =
                  'skewX(-10deg) translateX(5px)';
                e.currentTarget.style.background = '#00ff00';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'skewX(-10deg)';
                e.currentTarget.style.background = '#00ff88';
              }}
            >
              <span
                style={{ display: 'inline-block', transform: 'skewX(10deg)' }}
              >
                Start Now →
              </span>
            </button>
          </div>
        </div>

        {/* Hero image extending left - Hide on mobile */}
        {!isMobile && (
          <div style={{ position: 'relative', height: '400px', width: '100%' }}>
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: '-200px',
                width: 'calc(100% + 200px)',
                height: '100%',
                backgroundImage: 'url(/bg-hero.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '20px',
                opacity: 0.7,
                zIndex: 1,
              }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
