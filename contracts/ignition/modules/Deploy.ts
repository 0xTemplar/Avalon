import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const DeployModule = buildModule('DeployModule', (m) => {
  // Deploy parameters
  const platformFeeRecipient = m.getAccount(0); // Using deployer as fee recipient

  // Step 1: Deploy UserProfile
  const userProfile = m.contract('UserProfile', []);

  // Step 2: Deploy RewardManager
  const rewardManager = m.contract('RewardManager', [platformFeeRecipient]);

  // Step 3: Deploy QuestBoard
  const questBoard = m.contract('QuestBoard', [
    userProfile,
    rewardManager,
    platformFeeRecipient,
  ]);

  // Step 4: Deploy CollaborationManager
  const collaborationManager = m.contract('CollaborationManager', [
    questBoard,
    userProfile,
  ]);

  // Step 5: Deploy SubmissionManager
  const submissionManager = m.contract('SubmissionManager', [
    questBoard,
    userProfile,
    collaborationManager,
    rewardManager,
  ]);

  // Step 6: Set up contract relationships and permissions

  // Grant QUEST_BOARD_ROLE to QuestBoard in RewardManager
  m.call(rewardManager, 'grantQuestBoardRole', [questBoard]);

  // Grant QUEST_BOARD_ROLE to SubmissionManager for bounty distribution
  m.call(rewardManager, 'grantQuestBoardRole', [submissionManager], {
    id: 'grantQuestBoardRoleToSubmissionManager',
  });

  // Grant ADMIN_ROLE to QuestBoard in UserProfile for updating user stats
  const adminRole = m.staticCall(userProfile, 'ADMIN_ROLE');
  m.call(userProfile, 'grantRole', [adminRole, questBoard]);

  // Grant QUEST_BOARD_ROLE to SubmissionManager in UserProfile for reputation updates
  const questBoardRole = m.staticCall(userProfile, 'QUEST_BOARD_ROLE');
  m.call(userProfile, 'grantRole', [questBoardRole, submissionManager], {
    id: 'grantQuestBoardRoleToSubmissionManagerInUserProfile',
  });

  // Optional: Grant MODERATOR_ROLE to platform fee recipient in QuestBoard
  const moderatorRole = m.staticCall(questBoard, 'MODERATOR_ROLE');
  m.call(questBoard, 'grantRole', [moderatorRole, platformFeeRecipient]);

  // Note: REVIEWER_ROLE no longer needed - quest creators can select winners directly

  // Return deployed contracts
  return {
    userProfile,
    rewardManager,
    questBoard,
    collaborationManager,
    submissionManager,
  };
});

export default DeployModule;
