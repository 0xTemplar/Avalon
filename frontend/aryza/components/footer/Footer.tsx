import React from 'react';

interface FooterProps {
  isMobile: boolean;
}

export default function Footer({ isMobile }: FooterProps) {
  return (
    <footer
      style={{
        borderTop: '1px solid #222',
        padding: !isMobile ? '60px 40px' : '40px 20px',
        display: 'flex',
        flexDirection: !isMobile ? 'row' : 'column',
        justifyContent: 'space-between',
        alignItems: !isMobile ? 'flex-end' : 'flex-start',
        gap: '40px',
      }}
    >
      <div>
        <h3
          style={{
            fontSize: !isMobile ? '48px' : '36px',
            fontWeight: '900',
            color: '#111',
            marginBottom: '20px',
            fontFamily: 'var(--font-space-grotesk)',
          }}
        >
          READY?
        </h3>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Join the revolution. Create your first quest today.
        </p>
      </div>
      <div style={{ textAlign: !isMobile ? 'right' : 'left' }}>
        <div style={{ color: '#444', fontSize: '12px', marginBottom: '10px' }}>
          © 2024 QUEST/BOARD
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            justifyContent: !isMobile ? 'flex-end' : 'flex-start',
          }}
        >
          <span
            style={{
              color: '#333',
              fontSize: '11px',
              letterSpacing: '0.1em',
            }}
          >
            BUILT ON
          </span>
          <img
            src="/etherlink.svg"
            alt="Etherlink"
            style={{
              height: '20px',
              filter: 'brightness(0.6)',
              transition: 'filter 0.3s',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = 'brightness(1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = 'brightness(0.6)';
            }}
          />
        </div>
      </div>
    </footer>
  );
}
