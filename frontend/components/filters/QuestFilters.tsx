import React from 'react';

interface QuestFiltersProps {
  isMobile: boolean;
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedDifficulty: string;
  setSelectedDifficulty: (difficulty: string) => void;
  sortBy: 'reward' | 'deadline' | 'participants';
  setSortBy: (sort: 'reward' | 'deadline' | 'participants') => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
}

export default function QuestFilters({
  isMobile,
  categories,
  selectedCategory,
  setSelectedCategory,
  selectedDifficulty,
  setSelectedDifficulty,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
}: QuestFiltersProps) {
  return (
    <section
      style={{
        padding: !isMobile ? '40px' : '20px',
        borderBottom: '1px solid #222',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Category Filter - Horizontal on mobile */}
        <div
          style={{
            display: 'flex',
            gap: !isMobile ? '20px' : '10px',
            overflowX: 'auto',
            flex: 1,
          }}
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                padding: '8px 16px',
                background:
                  selectedCategory === category ? '#00ff88' : 'transparent',
                border: `1px solid ${
                  selectedCategory === category ? '#00ff88' : '#333'
                }`,
                color: selectedCategory === category ? '#000' : '#666',
                fontSize: '12px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.3s',
                whiteSpace: 'nowrap',
              }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Additional Filters */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            style={{
              background: 'transparent',
              border: '1px solid #333',
              color: '#fff',
              padding: '8px 16px',
              fontSize: '12px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            <option value="All" style={{ background: '#000' }}>
              ALL LEVELS
            </option>
            <option value="Easy" style={{ background: '#000' }}>
              EASY
            </option>
            <option value="Medium" style={{ background: '#000' }}>
              MEDIUM
            </option>
            <option value="Hard" style={{ background: '#000' }}>
              HARD
            </option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(
                e.target.value as 'reward' | 'deadline' | 'participants'
              )
            }
            style={{
              background: 'transparent',
              border: '1px solid #333',
              color: '#fff',
              padding: '8px 16px',
              fontSize: '12px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            <option value="reward" style={{ background: '#000' }}>
              HIGHEST REWARD
            </option>
            <option value="deadline" style={{ background: '#000' }}>
              ENDING SOON
            </option>
            <option value="participants" style={{ background: '#000' }}>
              MOST POPULAR
            </option>
          </select>

          {/* View Toggle */}
          <div style={{ display: 'flex', border: '1px solid #333' }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '8px 12px',
                background: viewMode === 'grid' ? '#00ff88' : 'transparent',
                color: viewMode === 'grid' ? '#000' : '#666',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
              }}
            >
              ⊞
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '8px 12px',
                background: viewMode === 'list' ? '#00ff88' : 'transparent',
                color: viewMode === 'list' ? '#000' : '#666',
                border: 'none',
                borderLeft: '1px solid #333',
                cursor: 'pointer',
                fontSize: '16px',
              }}
            >
              ☰
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
