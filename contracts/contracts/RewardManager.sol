// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IRewardManager.sol";

/**
 * @title RewardManager
 * @dev Simplified implementation of IRewardManager for initial deployment
 */
contract RewardManager is IRewardManager, AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant QUEST_BOARD_ROLE = keccak256("QUEST_BOARD_ROLE");
    
    // Storage
    mapping(uint256 => QuestBounty) private _questBounties;
    mapping(uint256 => Reward) private _rewards;
    mapping(address => uint256[]) private _userRewards;
    mapping(uint256 => uint256[]) private _questRewards;
    mapping(address => mapping(address => uint256)) private _userTotalEarnings;
    
    uint256 private _rewardCounter;
    uint256 private _platformFeePercentage = 250; // 2.5% in basis points
    address private _platformFeeRecipient;
    
    constructor(address platformFeeRecipient_) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _platformFeeRecipient = platformFeeRecipient_;
    }
    
    modifier onlyQuestBoard() {
        require(hasRole(QUEST_BOARD_ROLE, msg.sender), "Not authorized");
        _;
    }
    
    function escrowBounty(
        uint256 questId,
        uint256 amount,
        address token,
        address creator
    ) external payable override onlyQuestBoard nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(!_questBounties[questId].isEscrowed, "Bounty already escrowed");
        
        if (token == address(0)) {
            require(msg.value == amount, "Incorrect ETH amount");
        } else {
            require(msg.value == 0, "ETH not accepted for token bounties");
            // Token transfer should be handled by QuestBoard before calling this
        }
        
        // Initialize empty payment splits array
        PaymentSplit[] memory emptySplits = new PaymentSplit[](0);
        
        _questBounties[questId] = QuestBounty({
            questId: questId,
            totalAmount: amount,
            token: token,
            creator: creator,
            escrowedAt: block.timestamp,
            splits: emptySplits,
            isEscrowed: true,
            isDistributed: false
        });
        
        emit BountyEscrowed(questId, creator, amount, token);
    }
    
    function updatePaymentSplits(
        uint256 questId,
        PaymentSplit[] memory splits
    ) external override onlyQuestBoard {
        require(_questBounties[questId].isEscrowed, "No bounty escrowed");
        require(!_questBounties[questId].isDistributed, "Bounty already distributed");
        
        // Clear existing splits
        delete _questBounties[questId].splits;
        
        // Add new splits
        for (uint256 i = 0; i < splits.length; i++) {
            _questBounties[questId].splits.push(splits[i]);
        }
        
        emit PaymentSplitUpdated(questId, splits);
    }
    
    function distributeBounty(
        uint256 questId,
        address[] memory winners,
        uint256[] memory amounts
    ) external override onlyQuestBoard nonReentrant {
        require(_questBounties[questId].isEscrowed, "No bounty escrowed");
        require(!_questBounties[questId].isDistributed, "Bounty already distributed");
        require(winners.length == amounts.length, "Arrays length mismatch");
        
        QuestBounty storage bounty = _questBounties[questId];
        uint256 totalDistribution = 0;
        
        // Calculate total distribution
        for (uint256 i = 0; i < amounts.length; i++) {
            totalDistribution += amounts[i];
        }
        
        require(totalDistribution <= bounty.totalAmount, "Distribution exceeds bounty");
        
        // Create rewards for winners
        for (uint256 i = 0; i < winners.length; i++) {
            if (amounts[i] > 0) {
                _rewardCounter++;
                uint256 rewardId = _rewardCounter;
                
                _rewards[rewardId] = Reward({
                    id: rewardId,
                    questId: questId,
                    recipient: winners[i],
                    amount: amounts[i],
                    token: bounty.token,
                    rewardType: RewardType.QuestBounty,
                    status: PaymentStatus.Completed,
                    createdAt: block.timestamp,
                    paidAt: block.timestamp,
                    description: "Quest bounty reward",
                    submissionId: 0
                });
                
                _userRewards[winners[i]].push(rewardId);
                _questRewards[questId].push(rewardId);
                _userTotalEarnings[winners[i]][bounty.token] += amounts[i];
                
                // Transfer reward
                if (bounty.token == address(0)) {
                    payable(winners[i]).transfer(amounts[i]);
                } else {
                    IERC20(bounty.token).safeTransfer(winners[i], amounts[i]);
                }
                
                emit RewardDistributed(
                    rewardId,
                    questId,
                    winners[i],
                    amounts[i],
                    bounty.token,
                    RewardType.QuestBounty
                );
            }
        }
        
        bounty.isDistributed = true;
    }
    
    function refundBounty(uint256 questId) external override onlyQuestBoard nonReentrant {
        require(_questBounties[questId].isEscrowed, "No bounty escrowed");
        require(!_questBounties[questId].isDistributed, "Bounty already distributed");
        
        QuestBounty memory bounty = _questBounties[questId];
        delete _questBounties[questId];
        
        // Refund to quest board (which will forward to creator)
        if (bounty.token == address(0)) {
            payable(msg.sender).transfer(bounty.totalAmount);
        } else {
            IERC20(bounty.token).safeTransfer(msg.sender, bounty.totalAmount);
        }
        
        emit BountyRefunded(questId, bounty.creator, bounty.totalAmount);
    }
    
    function createReward(
        uint256 questId,
        address recipient,
        uint256 amount,
        address token,
        RewardType rewardType,
        string memory description,
        uint256 submissionId
    ) external override onlyQuestBoard returns (uint256 rewardId) {
        _rewardCounter++;
        rewardId = _rewardCounter;
        
        _rewards[rewardId] = Reward({
            id: rewardId,
            questId: questId,
            recipient: recipient,
            amount: amount,
            token: token,
            rewardType: rewardType,
            status: PaymentStatus.Pending,
            createdAt: block.timestamp,
            paidAt: 0,
            description: description,
            submissionId: submissionId
        });
        
        _userRewards[recipient].push(rewardId);
        _questRewards[questId].push(rewardId);
        
        return rewardId;
    }
    
    function processReward(uint256 rewardId) external override onlyQuestBoard nonReentrant {
        Reward storage reward = _rewards[rewardId];
        require(reward.status == PaymentStatus.Pending, "Reward not pending");
        
        reward.status = PaymentStatus.Processing;
        
        // Transfer reward
        if (reward.token == address(0)) {
            payable(reward.recipient).transfer(reward.amount);
        } else {
            IERC20(reward.token).safeTransfer(reward.recipient, reward.amount);
        }
        
        reward.status = PaymentStatus.Completed;
        reward.paidAt = block.timestamp;
        _userTotalEarnings[reward.recipient][reward.token] += reward.amount;
        
        emit RewardDistributed(
            rewardId,
            reward.questId,
            reward.recipient,
            reward.amount,
            reward.token,
            reward.rewardType
        );
    }
    
    function batchProcessRewards(uint256[] memory rewardIds) external override onlyQuestBoard {
        for (uint256 i = 0; i < rewardIds.length; i++) {
            this.processReward(rewardIds[i]);
        }
    }
    
    function distributeTeamReward(
        uint256 questId,
        uint256 teamId,
        uint256 totalAmount,
        address token,
        PaymentSplit[] memory customSplits
    ) external override onlyQuestBoard {
        // Simplified implementation - would need CollaborationManager integration
        revert("Not implemented");
    }
    
    // Emergency functions
    function emergencyPause() external override onlyRole(ADMIN_ROLE) {
        _pause();
    }
    
    function emergencyUnpause() external override onlyRole(ADMIN_ROLE) {
        _unpause();
    }
    
    function emergencyWithdraw(address token, uint256 amount) external override onlyRole(ADMIN_ROLE) {
        if (token == address(0)) {
            payable(_platformFeeRecipient).transfer(amount);
        } else {
            IERC20(token).safeTransfer(_platformFeeRecipient, amount);
        }
        emit EmergencyWithdraw(token, amount, _platformFeeRecipient);
    }
    
    // View functions
    function getQuestBounty(uint256 questId) external view override returns (QuestBounty memory) {
        return _questBounties[questId];
    }
    
    function getReward(uint256 rewardId) external view override returns (Reward memory) {
        return _rewards[rewardId];
    }
    
    function getUserRewards(address user) external view override returns (uint256[] memory) {
        return _userRewards[user];
    }
    
    function getQuestRewards(uint256 questId) external view override returns (uint256[] memory) {
        return _questRewards[questId];
    }
    
    function getPendingRewards(address user) external view override returns (uint256[] memory) {
        uint256[] memory userRewardIds = _userRewards[user];
        uint256 pendingCount = 0;
        
        // Count pending rewards
        for (uint256 i = 0; i < userRewardIds.length; i++) {
            if (_rewards[userRewardIds[i]].status == PaymentStatus.Pending) {
                pendingCount++;
            }
        }
        
        // Collect pending reward IDs
        uint256[] memory pendingRewards = new uint256[](pendingCount);
        uint256 index = 0;
        for (uint256 i = 0; i < userRewardIds.length; i++) {
            if (_rewards[userRewardIds[i]].status == PaymentStatus.Pending) {
                pendingRewards[index] = userRewardIds[i];
                index++;
            }
        }
        
        return pendingRewards;
    }
    
    function getTotalEscrowedAmount(address token) external view override returns (uint256) {
        // Would need to track this separately in production
        return 0;
    }
    
    function getTotalRewardsDistributed(address token) external view override returns (uint256) {
        // Would need to track this separately in production
        return 0;
    }
    
    function getUserTotalEarnings(address user, address token) external view override returns (uint256) {
        return _userTotalEarnings[user][token];
    }
    
    function isQuestBountyEscrowed(uint256 questId) external view override returns (bool) {
        return _questBounties[questId].isEscrowed;
    }
    
    function canRefundBounty(uint256 questId) external view override returns (bool) {
        return _questBounties[questId].isEscrowed && !_questBounties[questId].isDistributed;
    }
    
    function getDefaultPaymentSplits() external view override returns (PaymentSplit[] memory) {
        // Return empty array for now
        return new PaymentSplit[](0);
    }
    
    // Admin function to grant quest board role
    function grantQuestBoardRole(address questBoard) external onlyRole(ADMIN_ROLE) {
        grantRole(QUEST_BOARD_ROLE, questBoard);
    }
}