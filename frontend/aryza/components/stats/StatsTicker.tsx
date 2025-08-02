import React from 'react';

interface StatsTickerProps {
  isMobile: boolean;
}

export default function StatsTicker({ isMobile }: StatsTickerProps) {
  return (
    <section
      style={{
        borderTop: '1px solid #222',
        borderBottom: '1px solid #222',
        padding: '20px 0',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: !isMobile ? '60px' : '40px',
          animation: 'scroll 20s linear infinite',
          whiteSpace: 'nowrap',
        }}
      >
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: !isMobile ? '60px' : '40px',
            }}
          >
            <span
              style={{
                color: '#666',
                fontSize: !isMobile ? '14px' : '12px',
              }}
            >
              ACTIVE QUESTS{' '}
              <span style={{ color: '#00ff88', marginLeft: '10px' }}>
                1,234
              </span>
            </span>
            <span
              style={{
                color: '#666',
                fontSize: !isMobile ? '14px' : '12px',
              }}
            >
              TOTAL REWARDS{' '}
              <span style={{ color: '#00ff88', marginLeft: '10px' }}>
                892 ETH
              </span>
            </span>
            <span
              style={{
                color: '#666',
                fontSize: !isMobile ? '14px' : '12px',
              }}
            >
              CREATORS{' '}
              <span style={{ color: '#00ff88', marginLeft: '10px' }}>
                5,678
              </span>
            </span>
            <span
              style={{
                color: '#666',
                fontSize: !isMobile ? '14px' : '12px',
              }}
            >
              COMPLETED{' '}
              <span style={{ color: '#00ff88', marginLeft: '10px' }}>
                3,456
              </span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
