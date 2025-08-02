import React, { useState } from 'react';
import { ethers } from 'ethers';
import {
  useQuestBoard,
  QuestType,
  CreateQuestParams,
} from '../../hooks/useQuestBoard';
import { usePinata } from '../../hooks/usePinata';
import { usePrivy } from '@privy-io/react-auth';

interface CreateQuestModalProps {
  showCreateModal: boolean;
  setShowCreateModal: (show: boolean) => void;
}

const QUEST_CATEGORIES = [
  'Design',
  'Development',
  'Writing',
  'Music',
  'Animation',
  'NFT',
  'Marketing',
  'Research',
  'Art',
  'Gaming',
];

const SKILL_OPTIONS = [
  'Frontend Development',
  'Backend Development',
  'Smart Contracts',
  'UI/UX Design',
  'Graphic Design',
  'Content Writing',
  'Technical Writing',
  'Music Production',
  'Video Editing',
  'Animation',
  'Game Development',
  'Data Analysis',
  'Marketing',
  'Community Management',
  'Research',
  'Project Management',
];

export default function CreateQuestModal({
  showCreateModal,
  setShowCreateModal,
}: CreateQuestModalProps) {
  const { createQuest, loading } = useQuestBoard();
  const { uploadToIPFS, uploading } = usePinata();
  const { user } = usePrivy();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    questType: QuestType.Individual,
    bountyAmount: '',
    maxParticipants: 1,
    maxCollaborators: 0,
    submissionDays: 7,
    reviewDays: 3,
    requiresApproval: false,
    tags: [] as string[],
    skillsRequired: [] as string[],
    minReputation: 0,
    kycRequired: false,
    allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'png', 'zip'],
    maxFileSize: 10, // MB
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(1); // Multi-step form

  if (!showCreateModal) return null;

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!formData.title.trim()) {
        newErrors.title = 'Title is required';
      } else if (formData.title.length < 5) {
        newErrors.title = 'Title must be at least 5 characters';
      } else if (formData.title.length > 100) {
        newErrors.title = 'Title must be less than 100 characters';
      }

      if (!formData.description.trim()) {
        newErrors.description = 'Description is required';
      } else if (formData.description.length < 20) {
        newErrors.description = 'Description must be at least 20 characters';
      } else if (formData.description.length > 1000) {
        newErrors.description = 'Description must be less than 1000 characters';
      }

      if (formData.tags.length === 0) {
        newErrors.tags = 'Please select at least one category';
      }
    }

    if (stepNumber === 2) {
      if (!formData.bountyAmount || parseFloat(formData.bountyAmount) <= 0) {
        newErrors.bountyAmount = 'Bounty amount must be greater than 0';
      }

      if (formData.maxParticipants < 1) {
        newErrors.maxParticipants = 'Must allow at least 1 participant';
      }

      if (formData.submissionDays < 1) {
        newErrors.submissionDays = 'Submission deadline must be at least 1 day';
      }

      if (formData.reviewDays < 1) {
        newErrors.reviewDays = 'Review period must be at least 1 day';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setErrors({});
  };

  const toggleTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const toggleSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skillsRequired: prev.skillsRequired.includes(skill)
        ? prev.skillsRequired.filter((s) => s !== skill)
        : [...prev.skillsRequired, skill],
    }));
  };

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!validateStep(step)) return;

    try {
      // Calculate timestamps
      const now = Math.floor(Date.now() / 1000);
      const submissionDeadline = now + formData.submissionDays * 24 * 60 * 60;
      const reviewDeadline =
        submissionDeadline + formData.reviewDays * 24 * 60 * 60;

      // Get creator's wallet address
      const creatorAddress = user?.wallet?.address || 'Unknown';

      // Prepare metadata for IPFS
      const metadata = {
        title: formData.title,
        description: formData.description,
        requirements: {
          skillsRequired: formData.skillsRequired,
          minReputation: formData.minReputation,
          kycRequired: formData.kycRequired,
          allowedFileTypes: formData.allowedFileTypes,
          maxFileSize: formData.maxFileSize * 1024 * 1024, // Convert to bytes
        },
        tags: formData.tags,
        questType: QuestType[formData.questType],
        createdAt: new Date().toISOString(),
        creator: creatorAddress,
        additionalInfo: {
          submissionDeadline: submissionDeadline,
          reviewDeadline: reviewDeadline,
          maxParticipants: formData.maxParticipants,
          maxCollaborators: formData.maxCollaborators,
        },
      };

      // Upload metadata to IPFS
      const metadataURI = await uploadToIPFS(metadata);

      // Prepare quest parameters
      const questParams: CreateQuestParams = {
        title: formData.title,
        description: formData.description,
        metadataURI: metadataURI,
        questType: formData.questType,
        bountyAmount: formData.bountyAmount,
        bountyToken: ethers.ZeroAddress, // ETH
        maxParticipants: formData.maxParticipants,
        maxCollaborators: formData.maxCollaborators,
        submissionDeadline: submissionDeadline,
        reviewDeadline: reviewDeadline,
        requiresApproval: formData.requiresApproval,
        tags: formData.tags,
        requirements: {
          skillsRequired: formData.skillsRequired,
          minReputation: formData.minReputation,
          kycRequired: formData.kycRequired,
          allowedFileTypes: formData.allowedFileTypes,
          maxFileSize: formData.maxFileSize * 1024 * 1024, // Convert to bytes
        },
      };

      // Create quest on blockchain
      await createQuest(questParams);

      // Reset form and close modal
      setFormData({
        title: '',
        description: '',
        questType: QuestType.Individual,
        bountyAmount: '',
        maxParticipants: 1,
        maxCollaborators: 0,
        submissionDays: 7,
        reviewDays: 3,
        requiresApproval: false,
        tags: [],
        skillsRequired: [],
        minReputation: 0,
        kycRequired: false,
        allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'png', 'zip'],
        maxFileSize: 10,
      });
      setStep(1);
      setErrors({});
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create quest:', error);
    }
  };

  const isProcessing = loading || uploading;

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
      onClick={(e) => {
        if (e.target === e.currentTarget) setShowCreateModal(false);
      }}
    >
      <div
        style={{
          background: '#0a0a0a',
          border: '1px solid #333',
          padding: '40px',
          maxWidth: '700px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 100%, 20px 100%)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px',
          }}
        >
          <div>
            <h2
              style={{
                fontSize: '24px',
                color: '#00ff88',
                fontFamily: 'var(--font-space-grotesk)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                margin: 0,
                marginBottom: '8px',
              }}
            >
              Create Quest
            </h2>
            <div
              style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
              }}
            >
              {[1, 2, 3].map((stepNum) => (
                <div
                  key={stepNum}
                  style={{
                    width: '8px',
                    height: '8px',
                    background: step >= stepNum ? '#00ff88' : '#333',
                    clipPath:
                      'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
                  }}
                />
              ))}
              <span
                style={{
                  fontSize: '12px',
                  color: '#666',
                  marginLeft: '8px',
                }}
              >
                Step {step} of 3
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(false)}
            disabled={isProcessing}
            style={{
              background: 'transparent',
              border: '1px solid #666',
              color: '#666',
              width: '40px',
              height: '40px',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              fontSize: '20px',
              opacity: isProcessing ? 0.5 : 1,
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
            >
              <h3
                style={{
                  fontSize: '16px',
                  color: '#00ff88',
                  marginBottom: '16px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                Quest Details
              </h3>

              {/* Title */}
              <div>
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
                  Quest Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Enter quest title..."
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: `1px solid ${errors.title ? '#ff0088' : '#333'}`,
                    padding: '16px',
                    color: '#fff',
                    fontSize: '14px',
                    letterSpacing: '0.1em',
                  }}
                />
                {errors.title && (
                  <p
                    style={{
                      color: '#ff0088',
                      fontSize: '12px',
                      marginTop: '4px',
                      margin: 0,
                    }}
                  >
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
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
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe what participants need to do..."
                  rows={4}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: `1px solid ${
                      errors.description ? '#ff0088' : '#333'
                    }`,
                    padding: '16px',
                    color: '#fff',
                    fontSize: '14px',
                    letterSpacing: '0.1em',
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
                  {errors.description && (
                    <p
                      style={{ color: '#ff0088', fontSize: '12px', margin: 0 }}
                    >
                      {errors.description}
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
                    {formData.description.length}/1000
                  </p>
                </div>
              </div>

              {/* Categories */}
              <div>
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
                  Categories * ({formData.tags.length} selected)
                </label>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginBottom: '8px',
                  }}
                >
                  {QUEST_CATEGORIES.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => toggleTag(category)}
                      style={{
                        padding: '8px 16px',
                        background: formData.tags.includes(category)
                          ? 'rgba(0,255,136,0.2)'
                          : 'rgba(255,255,255,0.05)',
                        border: formData.tags.includes(category)
                          ? '1px solid #00ff88'
                          : '1px solid #333',
                        color: formData.tags.includes(category)
                          ? '#00ff88'
                          : '#fff',
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                      }}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                {errors.tags && (
                  <p style={{ color: '#ff0088', fontSize: '12px', margin: 0 }}>
                    {errors.tags}
                  </p>
                )}
              </div>

              {/* Quest Type */}
              <div>
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
                  Quest Type
                </label>
                <select
                  value={formData.questType}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      questType: Number(e.target.value) as QuestType,
                    }))
                  }
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: '1px solid #333',
                    padding: '16px',
                    color: '#fff',
                    fontSize: '14px',
                    letterSpacing: '0.1em',
                  }}
                >
                  <option
                    value={QuestType.Individual}
                    style={{ background: '#000' }}
                  >
                    Individual
                  </option>
                  <option
                    value={QuestType.Collaborative}
                    style={{ background: '#000' }}
                  >
                    Collaborative
                  </option>
                  <option
                    value={QuestType.Competition}
                    style={{ background: '#000' }}
                  >
                    Competition
                  </option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Rewards & Timing */}
          {step === 2 && (
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
            >
              <h3
                style={{
                  fontSize: '16px',
                  color: '#00ff88',
                  marginBottom: '16px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                Rewards & Timeline
              </h3>

              {/* Bounty Amount */}
              <div>
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
                  Bounty Amount (ETH) *
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={formData.bountyAmount}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      bountyAmount: e.target.value,
                    }))
                  }
                  placeholder="0.1"
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: `1px solid ${
                      errors.bountyAmount ? '#ff0088' : '#333'
                    }`,
                    padding: '16px',
                    color: '#fff',
                    fontSize: '14px',
                    letterSpacing: '0.1em',
                  }}
                />
                {errors.bountyAmount && (
                  <p
                    style={{
                      color: '#ff0088',
                      fontSize: '12px',
                      marginTop: '4px',
                      margin: 0,
                    }}
                  >
                    {errors.bountyAmount}
                  </p>
                )}
              </div>

              {/* Participants & Collaborators */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                }}
              >
                <div>
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
                    Max Participants
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.maxParticipants}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        maxParticipants: Number(e.target.value),
                      }))
                    }
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: `1px solid ${
                        errors.maxParticipants ? '#ff0088' : '#333'
                      }`,
                      padding: '16px',
                      color: '#fff',
                      fontSize: '14px',
                      letterSpacing: '0.1em',
                    }}
                  />
                </div>
                <div>
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
                    Max Collaborators
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.maxCollaborators}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        maxCollaborators: Number(e.target.value),
                      }))
                    }
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: '1px solid #333',
                      padding: '16px',
                      color: '#fff',
                      fontSize: '14px',
                      letterSpacing: '0.1em',
                    }}
                  />
                </div>
              </div>

              {/* Deadlines */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                }}
              >
                <div>
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
                    Submission Days
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={formData.submissionDays}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        submissionDays: Number(e.target.value),
                      }))
                    }
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: `1px solid ${
                        errors.submissionDays ? '#ff0088' : '#333'
                      }`,
                      padding: '16px',
                      color: '#fff',
                      fontSize: '14px',
                      letterSpacing: '0.1em',
                    }}
                  />
                </div>
                <div>
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
                    Review Days
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={formData.reviewDays}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        reviewDays: Number(e.target.value),
                      }))
                    }
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: `1px solid ${
                        errors.reviewDays ? '#ff0088' : '#333'
                      }`,
                      padding: '16px',
                      color: '#fff',
                      fontSize: '14px',
                      letterSpacing: '0.1em',
                    }}
                  />
                </div>
              </div>

              {/* Requires Approval */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  border: '1px solid #333',
                }}
              >
                <input
                  type="checkbox"
                  id="requiresApproval"
                  checked={formData.requiresApproval}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      requiresApproval: e.target.checked,
                    }))
                  }
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: '#00ff88',
                  }}
                />
                <label
                  htmlFor="requiresApproval"
                  style={{
                    fontSize: '14px',
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  Require approval for participants to join
                </label>
              </div>
            </div>
          )}

          {/* Step 3: Requirements */}
          {step === 3 && (
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
            >
              <h3
                style={{
                  fontSize: '16px',
                  color: '#00ff88',
                  marginBottom: '16px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                Requirements & Skills
              </h3>

              {/* Required Skills */}
              <div>
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
                  Required Skills ({formData.skillsRequired.length} selected)
                </label>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginBottom: '8px',
                  }}
                >
                  {SKILL_OPTIONS.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      style={{
                        padding: '8px 16px',
                        background: formData.skillsRequired.includes(skill)
                          ? 'rgba(0,255,136,0.2)'
                          : 'rgba(255,255,255,0.05)',
                        border: formData.skillsRequired.includes(skill)
                          ? '1px solid #00ff88'
                          : '1px solid #333',
                        color: formData.skillsRequired.includes(skill)
                          ? '#00ff88'
                          : '#fff',
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                      }}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Min Reputation */}
              <div>
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
                  Minimum Reputation
                </label>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={formData.minReputation}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      minReputation: Number(e.target.value),
                    }))
                  }
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: '1px solid #333',
                    padding: '16px',
                    color: '#fff',
                    fontSize: '14px',
                    letterSpacing: '0.1em',
                  }}
                />
              </div>

              {/* File Upload Settings */}
              <div>
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
                  Max File Size (MB)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.maxFileSize}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      maxFileSize: Number(e.target.value),
                    }))
                  }
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: '1px solid #333',
                    padding: '16px',
                    color: '#fff',
                    fontSize: '14px',
                    letterSpacing: '0.1em',
                  }}
                />
              </div>

              {/* KYC Required */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  border: '1px solid #333',
                }}
              >
                <input
                  type="checkbox"
                  id="kycRequired"
                  checked={formData.kycRequired}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      kycRequired: e.target.checked,
                    }))
                  }
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: '#00ff88',
                  }}
                />
                <label
                  htmlFor="kycRequired"
                  style={{
                    fontSize: '14px',
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  Require KYC verification for participants
                </label>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '32px',
              paddingTop: '24px',
              borderTop: '1px solid #333',
            }}
          >
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={isProcessing}
                style={{
                  padding: '12px 24px',
                  background: 'transparent',
                  border: '1px solid #666',
                  color: '#666',
                  fontSize: '12px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  opacity: isProcessing ? 0.5 : 1,
                }}
              >
                ← Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                style={{
                  padding: '12px 24px',
                  background: '#00ff88',
                  color: '#000',
                  border: 'none',
                  fontSize: '12px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontWeight: '600',
                  cursor: 'pointer',
                  clipPath:
                    'polygon(0 0, calc(100% - 10px) 0, 100% 100%, 10px 100%)',
                }}
              >
                Next →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isProcessing}
                style={{
                  padding: '12px 24px',
                  background: isProcessing ? '#333' : '#00ff88',
                  color: isProcessing ? '#666' : '#000',
                  border: 'none',
                  fontSize: '12px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontWeight: '600',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  clipPath:
                    'polygon(0 0, calc(100% - 10px) 0, 100% 100%, 10px 100%)',
                }}
              >
                {isProcessing ? 'Creating Quest...' : 'Create Quest →'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
