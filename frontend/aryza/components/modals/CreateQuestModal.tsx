import React from 'react';

interface CreateQuestModalProps {
  showCreateModal: boolean;
  setShowCreateModal: (show: boolean) => void;
}

export default function CreateQuestModal({
  showCreateModal,
  setShowCreateModal,
}: CreateQuestModalProps) {
  if (!showCreateModal) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.9)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: '#0a0a0a',
          border: '1px solid #333',
          padding: '40px',
          maxWidth: '600px',
          width: '100%',
          position: 'relative',
        }}
      >
        <button
          onClick={() => setShowCreateModal(false)}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'transparent',
            border: 'none',
            color: '#666',
            fontSize: '24px',
            cursor: 'pointer',
          }}
        >
          ×
        </button>

        <h2
          style={{
            fontSize: '24px',
            fontWeight: '300',
            marginBottom: '32px',
            fontFamily: 'var(--font-space-grotesk)',
          }}
        >
          CREATE NEW QUEST
        </h2>

        <form style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <input
            type="text"
            placeholder="QUEST TITLE"
            style={{
              background: 'transparent',
              border: '1px solid #333',
              padding: '16px',
              color: '#fff',
              fontSize: '14px',
              letterSpacing: '0.1em',
            }}
          />
          <textarea
            placeholder="QUEST DESCRIPTION"
            rows={4}
            style={{
              background: 'transparent',
              border: '1px solid #333',
              padding: '16px',
              color: '#fff',
              fontSize: '14px',
              letterSpacing: '0.1em',
              resize: 'none',
            }}
          />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
            }}
          >
            <select
              style={{
                background: 'transparent',
                border: '1px solid #333',
                padding: '16px',
                color: '#fff',
                fontSize: '14px',
                letterSpacing: '0.1em',
              }}
            >
              <option value="" style={{ background: '#000' }}>
                SELECT CATEGORY
              </option>
              <option value="Design" style={{ background: '#000' }}>
                DESIGN
              </option>
              <option value="Writing" style={{ background: '#000' }}>
                WRITING
              </option>
              <option value="Music" style={{ background: '#000' }}>
                MUSIC
              </option>
              <option value="Animation" style={{ background: '#000' }}>
                ANIMATION
              </option>
              <option value="NFT" style={{ background: '#000' }}>
                NFT
              </option>
            </select>
            <select
              style={{
                background: 'transparent',
                border: '1px solid #333',
                padding: '16px',
                color: '#fff',
                fontSize: '14px',
                letterSpacing: '0.1em',
              }}
            >
              <option value="" style={{ background: '#000' }}>
                SELECT DIFFICULTY
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
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
            }}
          >
            <input
              type="text"
              placeholder="REWARD (ETH)"
              style={{
                background: 'transparent',
                border: '1px solid #333',
                padding: '16px',
                color: '#fff',
                fontSize: '14px',
                letterSpacing: '0.1em',
              }}
            />
            <input
              type="text"
              placeholder="DEADLINE (DAYS)"
              style={{
                background: 'transparent',
                border: '1px solid #333',
                padding: '16px',
                color: '#fff',
                fontSize: '14px',
                letterSpacing: '0.1em',
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: '16px',
              background: '#00ff88',
              color: '#000',
              border: 'none',
              fontSize: '14px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontWeight: '600',
              cursor: 'pointer',
              marginTop: '16px',
            }}
            onClick={(e) => {
              e.preventDefault();
              setShowCreateModal(false);
            }}
          >
            CREATE QUEST →
          </button>
        </form>
      </div>
    </div>
  );
}
