// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IQuestBoard.sol";
import "./interfaces/IUserProfile.sol";
import "./interfaces/IRewardManager.sol";

/**
 * @title QuestBoard
 * @dev Main contract for the Creative Quest Board system
 */
contract QuestBoard is IQuestBoard, AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");

    // Storage
    mapping(uint256 => Quest) private _quests;
    mapping(uint256 => QuestRequirements) private _questRequirements;
    mapping(uint256 => address[]) private _questParticipants;
    mapping(uint256 => mapping(address => bool)) private _isParticipant;
    mapping(uint256 => mapping(address => bool)) private _pendingApprovals;
    mapping(address => uint256[]) private _creatorQuests;
    mapping(string => uint256[]) private _tagQuests;

    uint256 private _questCounter;
    uint256 private _platformFeePercentage = 250; // 2.5% in basis points
    address private _platformFeeRecipient;

    IUserProfile public userProfile;
    IRewardManager public rewardManager;

    // Events (additional to interface)
    event PlatformFeeUpdated(uint256 newFeePercentage);
    event PlatformFeeRecipientUpdated(address newRecipient);

    constructor(
        address _userProfile,
        address _rewardManager,
        address platformFeeRecipient_
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        
        userProfile = IUserProfile(_userProfile);
        rewardManager = IRewardManager(_rewardManager);
        _platformFeeRecipient = platformFeeRecipient_;
    }

    modifier validQuest(uint256 questId) {
        require(questId > 0 && questId <= _questCounter, "Invalid quest ID");
        _;
    }

    modifier onlyQuestCreator(uint256 questId) {
        require(_quests[questId].creator == msg.sender, "Not the quest creator");
        _;
    }

    modifier questActive(uint256 questId) {
        require(_quests[questId].status == QuestStatus.Active, "Quest not active");
        _;
    }

    function createQuest(
        string calldata title,
        string calldata description,
        string calldata metadataURI,
        QuestType questType,
        uint256 bountyAmount,
        address bountyToken,
        uint256 maxParticipants,
        uint256 maxCollaborators,
        uint256 submissionDeadline,
        uint256 reviewDeadline,
        bool requiresApproval,
        string[] calldata tags,
        QuestRequirements calldata requirements
    ) external payable nonReentrant whenNotPaused returns (uint256 questId) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(submissionDeadline > block.timestamp, "Invalid submission deadline");
        require(reviewDeadline > submissionDeadline, "Invalid review deadline");
        require(maxParticipants > 0, "Max participants must be > 0");
        require(userProfile.hasProfile(msg.sender), "Creator must have a profile");

        _questCounter++;
        questId = _questCounter;

        if (bountyAmount > 0) {
            if (bountyToken == address(0)) {
                require(msg.value == bountyAmount, "Incorrect ETH amount");
                // Escrow ETH bounty to RewardManager
                rewardManager.escrowBounty{value: bountyAmount}(questId, bountyAmount, bountyToken, msg.sender);
            } else {
                require(msg.value == 0, "ETH not accepted for token bounties");
                IERC20(bountyToken).safeTransferFrom(msg.sender, address(this), bountyAmount);
                // For token bounties, transfer to RewardManager first, then escrow
                IERC20(bountyToken).safeTransfer(address(rewardManager), bountyAmount);
                rewardManager.escrowBounty(questId, bountyAmount, bountyToken, msg.sender);
            }
        }

        _quests[questId] = Quest({
            id: questId,
            creator: msg.sender,
            title: title,
            description: description,
            metadataURI: metadataURI,
            questType: questType,
            status: QuestStatus.Active,
            bountyAmount: bountyAmount,
            bountyToken: bountyToken,
            maxParticipants: maxParticipants,
            currentParticipants: 0,
            maxCollaborators: maxCollaborators,
            submissionDeadline: submissionDeadline,
            reviewDeadline: reviewDeadline,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            requiresApproval: requiresApproval,
            tags: tags
        });

        _questRequirements[questId] = requirements;
        _creatorQuests[msg.sender].push(questId);

        // Add to tag mappings
        for (uint256 i = 0; i < tags.length; i++) {
            _tagQuests[tags[i]].push(questId);
        }



        emit QuestCreated(questId, msg.sender, title, bountyAmount, bountyToken);
    }

    function updateQuest(
        uint256 questId,
        string calldata title,
        string calldata description,
        string calldata metadataURI
    ) external validQuest(questId) onlyQuestCreator(questId) {
        Quest storage quest = _quests[questId];
        require(quest.status == QuestStatus.Draft || quest.status == QuestStatus.Active, "Cannot update quest in current status");
        
        quest.title = title;
        quest.description = description;
        quest.metadataURI = metadataURI;
        quest.updatedAt = block.timestamp;

        emit QuestUpdated(questId, quest.status);
    }

    function updateQuestStatus(uint256 questId, QuestStatus status) external validQuest(questId) onlyQuestCreator(questId) {
        Quest storage quest = _quests[questId];
        require(quest.status != QuestStatus.Completed && quest.status != QuestStatus.Cancelled, "Quest is finalized");
        
        quest.status = status;
        quest.updatedAt = block.timestamp;

        emit QuestUpdated(questId, status);
    }

    function pauseQuest(uint256 questId) external validQuest(questId) onlyQuestCreator(questId) {
        _quests[questId].status = QuestStatus.Paused;
        _quests[questId].updatedAt = block.timestamp;
        emit QuestUpdated(questId, QuestStatus.Paused);
    }

    function resumeQuest(uint256 questId) external validQuest(questId) onlyQuestCreator(questId) {
        require(_quests[questId].status == QuestStatus.Paused, "Quest not paused");
        _quests[questId].status = QuestStatus.Active;
        _quests[questId].updatedAt = block.timestamp;
        emit QuestUpdated(questId, QuestStatus.Active);
    }

    function cancelQuest(uint256 questId, string calldata reason) external validQuest(questId) onlyQuestCreator(questId) {
        Quest storage quest = _quests[questId];
        require(quest.status == QuestStatus.Active || quest.status == QuestStatus.Paused, "Cannot cancel quest");
        
        quest.status = QuestStatus.Cancelled;
        quest.updatedAt = block.timestamp;

        // Refund bounty if escrowed
        if (quest.bountyAmount > 0 && rewardManager.isQuestBountyEscrowed(questId)) {
            rewardManager.refundBounty(questId);
        }

        emit QuestCancelled(questId, reason);
    }

    function joinQuest(uint256 questId) external validQuest(questId) questActive(questId) {
        Quest storage quest = _quests[questId];
        require(!_isParticipant[questId][msg.sender], "Already a participant");
        require(quest.currentParticipants < quest.maxParticipants, "Quest is full");
        require(block.timestamp < quest.submissionDeadline, "Submission deadline passed");
        require(userProfile.hasProfile(msg.sender), "Must have a profile");

        QuestRequirements memory requirements = _questRequirements[questId];
        if (requirements.minReputation > 0) {
            require(userProfile.getUserReputation(msg.sender) >= requirements.minReputation, "Insufficient reputation");
        }

        if (quest.requiresApproval) {
            _pendingApprovals[questId][msg.sender] = true;
        } else {
            _addParticipant(questId, msg.sender);
        }

        emit ParticipantJoined(questId, msg.sender);
    }

    function leaveQuest(uint256 questId) external validQuest(questId) {
        require(_isParticipant[questId][msg.sender], "Not a participant");
        
        _removeParticipant(questId, msg.sender);
        emit ParticipantLeft(questId, msg.sender);
    }

    function approveParticipant(uint256 questId, address participant) external validQuest(questId) onlyQuestCreator(questId) {
        require(_pendingApprovals[questId][participant], "No pending approval");
        require(_quests[questId].currentParticipants < _quests[questId].maxParticipants, "Quest is full");
        
        _pendingApprovals[questId][participant] = false;
        _addParticipant(questId, participant);
    }

    function rejectParticipant(uint256 questId, address participant) external validQuest(questId) onlyQuestCreator(questId) {
        require(_pendingApprovals[questId][participant], "No pending approval");
        _pendingApprovals[questId][participant] = false;
    }

    function _addParticipant(uint256 questId, address participant) internal {
        _questParticipants[questId].push(participant);
        _isParticipant[questId][participant] = true;
        _quests[questId].currentParticipants++;
    }

    function _removeParticipant(uint256 questId, address participant) internal {
        address[] storage participants = _questParticipants[questId];
        for (uint256 i = 0; i < participants.length; i++) {
            if (participants[i] == participant) {
                participants[i] = participants[participants.length - 1];
                participants.pop();
                break;
            }
        }
        _isParticipant[questId][participant] = false;
        _quests[questId].currentParticipants--;
    }

    // View Functions
    function getQuest(uint256 questId) external view validQuest(questId) returns (Quest memory) {
        return _quests[questId];
    }

    function getQuestRequirements(uint256 questId) external view validQuest(questId) returns (QuestRequirements memory) {
        return _questRequirements[questId];
    }

    function getQuestParticipants(uint256 questId) external view validQuest(questId) returns (address[] memory) {
        return _questParticipants[questId];
    }

    function isParticipant(uint256 questId, address user) external view validQuest(questId) returns (bool) {
        return _isParticipant[questId][user];
    }

    function getActiveQuests() external view returns (uint256[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 1; i <= _questCounter; i++) {
            if (_quests[i].status == QuestStatus.Active) {
                activeCount++;
            }
        }

        uint256[] memory activeQuests = new uint256[](activeCount);
        uint256 index = 0;
        for (uint256 i = 1; i <= _questCounter; i++) {
            if (_quests[i].status == QuestStatus.Active) {
                activeQuests[index] = i;
                index++;
            }
        }
        return activeQuests;
    }

    function getQuestsByCreator(address creator) external view returns (uint256[] memory) {
        return _creatorQuests[creator];
    }

    function getQuestsByTag(string calldata tag) external view returns (uint256[] memory) {
        return _tagQuests[tag];
    }

    function getTotalQuests() external view returns (uint256) {
        return _questCounter;
    }

    // Admin Functions
    function setPlatformFee(uint256 feePercentage) external onlyRole(ADMIN_ROLE) {
        require(feePercentage <= 1000, "Fee cannot exceed 10%"); // Max 10%
        _platformFeePercentage = feePercentage;
        emit PlatformFeeUpdated(feePercentage);
    }

    function setPlatformFeeRecipient(address recipient) external onlyRole(ADMIN_ROLE) {
        require(recipient != address(0), "Invalid recipient");
        _platformFeeRecipient = recipient;
        emit PlatformFeeRecipientUpdated(recipient);
    }

    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    function emergencyWithdraw(address token, uint256 amount) external onlyRole(ADMIN_ROLE) {
        if (token == address(0)) {
            payable(_platformFeeRecipient).transfer(amount);
        } else {
            IERC20(token).safeTransfer(_platformFeeRecipient, amount);
        }
    }
} 