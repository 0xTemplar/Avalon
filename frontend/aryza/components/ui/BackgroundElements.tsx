import React from 'react';

interface BackgroundElementsProps {
  isMobile: boolean;
  mousePos: { x: number; y: number };
  hoveredCard: string | null;
}

export default function BackgroundElements({
  isMobile,
  mousePos,
  hoveredCard,
}: BackgroundElementsProps) {
  return (
    <>
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

      {/* Dynamic cursor follower - desktop only */}
      {!isMobile && (
        <div
          style={{
            position: 'fixed',
            left: mousePos.x - 200,
            top: mousePos.y - 200,
            width: '400px',
            height: '400px',
            background:
              'radial-gradient(circle, rgba(0,255,136,0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 100,
            transition: 'all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67)',
          }}
        ></div>
      )}

      {/* Floating geometric shapes - reduced on mobile */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: '5%',
            width: !isMobile ? '100px' : '60px',
            height: !isMobile ? '100px' : '60px',
            border: '2px solid rgba(0,255,136,0.2)',
            transform: 'rotate(45deg)',
            animation: 'float 8s ease-in-out infinite',
          }}
        ></div>
        {!isMobile && (
          <>
            <div
              style={{
                position: 'absolute',
                bottom: '20%',
                right: '10%',
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                border: '1px solid rgba(255,0,255,0.2)',
                animation: 'float 10s ease-in-out infinite reverse',
              }}
            ></div>
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '70%',
                width: '80px',
                height: '80px',
                border: '1px solid rgba(0,255,255,0.2)',
                transform: 'rotate(30deg)',
                animation: 'float 6s ease-in-out infinite',
              }}
            ></div>
          </>
        )}
      </div>

      {/* Floating Etherlink Badge */}
      <div
        style={{
          position: 'fixed',
          bottom: !isMobile ? '40px' : '20px',
          right: !isMobile ? '40px' : '20px',
          zIndex: 45,
          transform: hoveredCard ? 'translateX(150px)' : 'translateX(0)',
          transition: 'transform 0.5s cubic-bezier(0.17, 0.67, 0.83, 0.67)',
        }}
      >
        <a
          href="https://etherlink.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 20px',
            background: 'rgba(0, 0, 0, 0.9)',
            border: '1px solid #222',
            borderRadius: '50px',
            textDecoration: 'none',
            transition: 'all 0.3s',
            position: 'relative',
            overflow: 'hidden',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.border = '1px solid #00ff88';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,255,136,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.border = '1px solid #222';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background:
                'linear-gradient(45deg, transparent, rgba(0,255,136,0.1), transparent)',
              transform: 'rotate(45deg) translateX(-100%)',
              transition: 'transform 0.6s',
              pointerEvents: 'none',
            }}
            className="etherlink-shine"
          ></div>

          <span
            style={{
              color: '#666',
              fontSize: '11px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              transition: 'color 0.3s',
            }}
            className="etherlink-text"
          >
            POWERED BY
          </span>
          <img
            src="/etherlink.svg"
            alt="Etherlink"
            style={{
              height: '24px',
              filter: 'brightness(0.8)',
              transition: 'filter 0.3s',
            }}
            className="etherlink-logo"
          />
        </a>
      </div>
    </>
  );
}
