import React, { useState } from 'react';
import Image from 'next/image';
import {
  useUserProfile,
  CreateProfileParams,
} from '../../hooks/useUserProfile';

interface UserRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PREDEFINED_SKILLS = [
  'Frontend Development',
  'Backend Development',
  'Smart Contracts',
  'UI/UX Design',
  'Data Science',
  'DevOps',
  'Mobile Development',
  'Game Development',
  'Blockchain',
  'AI/ML',
  'Security',
  'Testing',
  'Project Management',
  'Content Creation',
  'Marketing',
  'Community Management',
];

const AVATAR_OPTIONS = [
  'https://avatars.dicebear.com/api/identicon/adventurer.svg',
  'https://avatars.dicebear.com/api/identicon/explorer.svg',
  'https://avatars.dicebear.com/api/identicon/creator.svg',
  'https://avatars.dicebear.com/api/identicon/innovator.svg',
  'https://avatars.dicebear.com/api/identicon/builder.svg',
  'https://avatars.dicebear.com/api/identicon/pioneer.svg',
];

export default function UserRegistrationModal({
  isOpen,
  onClose,
  onSuccess,
}: UserRegistrationModalProps) {
  const { createProfile, loading } = useUserProfile();
  const [formData, setFormData] = useState<CreateProfileParams>({
    username: '',
    bio: '',
    avatarURI: AVATAR_OPTIONS[0],
    skills: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (formData.username.length > 20) {
      newErrors.username = 'Username must be less than 20 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username =
        'Username can only contain letters, numbers, and underscores';
    }

    if (!formData.bio.trim()) {
      newErrors.bio = 'Bio is required';
    } else if (formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }

    if (formData.skills.length === 0) {
      newErrors.skills = 'Please select at least one skill';
    } else if (formData.skills.length > 10) {
      newErrors.skills = 'Please select no more than 10 skills';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await createProfile(formData);
      onSuccess?.();
      onClose();
    } catch (error) {
      // Error is handled in the hook with toast
      console.error('Registration failed:', error);
    }
  };

  const toggleSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.9)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: '#0a0a0a',
          border: '1px solid #333',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 100%, 20px 100%)',
          padding: '40px',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <h2
              style={{
                fontSize: '24px',
                color: '#00ff88',
                fontFamily: 'var(--font-space-grotesk)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                margin: 0,
              }}
            >
              Create Profile
            </h2>
            <button
              onClick={onClose}
              disabled={loading}
              style={{
                background: 'transparent',
                border: '1px solid #666',
                color: '#666',
                width: '40px',
                height: '40px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '20px',
                opacity: loading ? 0.5 : 1,
              }}
            >
              ×
            </button>
          </div>
          <p
            style={{
              color: '#999',
              fontSize: '14px',
              lineHeight: '1.5',
              margin: 0,
            }}
          >
            Join the Quest Board ecosystem by creating your profile. This will
            be stored on the blockchain.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Avatar Selection */}
          <div style={{ marginBottom: '30px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                color: '#00ff88',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '12px',
              }}
            >
              Choose Avatar
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))',
                gap: '12px',
                marginBottom: '8px',
              }}
            >
              {AVATAR_OPTIONS.map((avatar, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, avatarURI: avatar }))
                  }
                  style={{
                    width: '60px',
                    height: '60px',
                    border:
                      formData.avatarURI === avatar
                        ? '2px solid #00ff88'
                        : '1px solid #333',
                    background:
                      formData.avatarURI === avatar
                        ? 'rgba(0,255,136,0.1)'
                        : 'transparent',
                    cursor: 'pointer',
                    padding: '8px',
                    transition: 'all 0.3s',
                  }}
                >
                  <Image
                    src={avatar}
                    alt={`Avatar ${index + 1}`}
                    width={44}
                    height={44}
                    style={{
                      objectFit: 'cover',
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Username */}
          <div style={{ marginBottom: '24px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                color: '#00ff88',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              Username *
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, username: e.target.value }))
              }
              placeholder="Enter username..."
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${errors.username ? '#ff0088' : '#333'}`,
                color: '#fff',
                fontSize: '14px',
                fontFamily: 'var(--font-inter)',
              }}
            />
            {errors.username && (
              <p
                style={{
                  color: '#ff0088',
                  fontSize: '12px',
                  marginTop: '4px',
                  margin: 0,
                }}
              >
                {errors.username}
              </p>
            )}
          </div>

          {/* Bio */}
          <div style={{ marginBottom: '24px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                color: '#00ff88',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              Bio *
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, bio: e.target.value }))
              }
              placeholder="Tell us about yourself..."
              rows={4}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${errors.bio ? '#ff0088' : '#333'}`,
                color: '#fff',
                fontSize: '14px',
                fontFamily: 'var(--font-inter)',
                resize: 'vertical',
              }}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '4px',
              }}
            >
              {errors.bio && (
                <p style={{ color: '#ff0088', fontSize: '12px', margin: 0 }}>
                  {errors.bio}
                </p>
              )}
              <p
                style={{
                  color: '#666',
                  fontSize: '12px',
                  margin: 0,
                  marginLeft: 'auto',
                }}
              >
                {formData.bio.length}/500
              </p>
            </div>
          </div>

          {/* Skills */}
          <div style={{ marginBottom: '30px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                color: '#00ff88',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              Skills * ({formData.skills.length}/10)
            </label>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '8px',
              }}
            >
              {PREDEFINED_SKILLS.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  style={{
                    padding: '8px 16px',
                    background: formData.skills.includes(skill)
                      ? 'rgba(0,255,136,0.2)'
                      : 'rgba(255,255,255,0.05)',
                    border: formData.skills.includes(skill)
                      ? '1px solid #00ff88'
                      : '1px solid #333',
                    color: formData.skills.includes(skill) ? '#00ff88' : '#fff',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                >
                  {skill}
                </button>
              ))}
            </div>
            {errors.skills && (
              <p style={{ color: '#ff0088', fontSize: '12px', margin: 0 }}>
                {errors.skills}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              background: loading ? '#333' : '#00ff88',
              color: loading ? '#666' : '#000',
              border: 'none',
              fontSize: '14px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              clipPath:
                'polygon(0 0, calc(100% - 10px) 0, 100% 100%, 10px 100%)',
              transition: 'all 0.3s',
              fontFamily: 'var(--font-space-grotesk)',
            }}
          >
            {loading ? 'Creating Profile...' : 'Create Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
