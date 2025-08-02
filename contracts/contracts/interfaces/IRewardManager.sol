// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title IRewardManager
 * @dev Interface for managing bounty payments and reward distribution
 */
interface IRewardManager {
    enum RewardType {
        QuestBounty,
        ParticipationReward,
        ReviewerReward,
        ReferralBonus,
        ReputationBonus
    }

    enum PaymentStatus {
        Pending,
        Processing,
        Completed,
        Failed,
        Refunded
    }

    struct Reward {
        uint256 id;
        uint256 questId;
        address recipient;
        uint256 amount;
        address token; // address(0) for ETH
        RewardType rewardType;
        PaymentStatus status;
        uint256 createdAt;
        uint256 paidAt;
        string description;
        uint256 submissionId; // Optional, for submission-based rewards
    }

    struct PaymentSplit {
        address recipient;
        uint256 percentage; // Basis points (10000 = 100%)
        string role; // "leader", "collaborator", etc.
    }

    struct QuestBounty {
        uint256 questId;
        uint256 totalAmount;
        address token;
        address creator;
        uint256 escrowedAt;
        PaymentSplit[] splits;
        bool isEscrowed;
        bool isDistributed;
    }

    // Events
    event BountyEscrowed(
        uint256 indexed questId,
        address indexed creator,
        uint256 amount,
        address token
    );
    
    event RewardDistributed(
        uint256 indexed rewardId,
        uint256 indexed questId,
        address indexed recipient,
        uint256 amount,
        address token,
        RewardType rewardType
    );
    
    event BountyRefunded(uint256 indexed questId, address indexed creator, uint256 amount);
    event PaymentSplitUpdated(uint256 indexed questId, PaymentSplit[] splits);
    event EmergencyWithdraw(address indexed token, uint256 amount, address indexed recipient);

    // Bounty Management Functions
    function escrowBounty(
        uint256 questId,
        uint256 amount,
        address token,
        address creator
    ) external payable;

    function updatePaymentSplits(
        uint256 questId,
        PaymentSplit[] memory splits
    ) external;

    function distributeBounty(
        uint256 questId,
        address[] memory winners,
        uint256[] memory amounts
    ) external;

    function refundBounty(uint256 questId) external;

    // Reward Functions
    function createReward(
        uint256 questId,
        address recipient,
        uint256 amount,
        address token,
        RewardType rewardType,
        string memory description,
        uint256 submissionId
    ) external returns (uint256 rewardId);

    function processReward(uint256 rewardId) external;
    function batchProcessRewards(uint256[] memory rewardIds) external;

    // Team Reward Functions
    function distributeTeamReward(
        uint256 questId,
        uint256 teamId,
        uint256 totalAmount,
        address token,
        PaymentSplit[] memory customSplits
    ) external;

    // Emergency Functions
    function emergencyPause() external;
    function emergencyUnpause() external;
    function emergencyWithdraw(address token, uint256 amount) external;

    // View Functions
    function getQuestBounty(uint256 questId) external view returns (QuestBounty memory);
    function getReward(uint256 rewardId) external view returns (Reward memory);
    function getUserRewards(address user) external view returns (uint256[] memory);
    function getQuestRewards(uint256 questId) external view returns (uint256[] memory);
    function getPendingRewards(address user) external view returns (uint256[] memory);
    function getTotalEscrowedAmount(address token) external view returns (uint256);
    function getTotalRewardsDistributed(address token) external view returns (uint256);
    function getUserTotalEarnings(address user, address token) external view returns (uint256);
    function isQuestBountyEscrowed(uint256 questId) external view returns (bool);
    function canRefundBounty(uint256 questId) external view returns (bool);
    function getDefaultPaymentSplits() external view returns (PaymentSplit[] memory);
} 