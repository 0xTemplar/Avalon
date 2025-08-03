// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title IQuestBoard
 * @dev Interface for the Creative Quest Board system
 */
interface IQuestBoard {
    enum QuestStatus {
        Draft,
        Active,
        Paused,
        Completed,
        Cancelled
    }

    enum QuestType {
        Individual,
        Collaborative,
        Competition
    }

    struct Quest {
        uint256 id;
        string externalId; // Frontend-controlled unique identifier
        address creator;
        string title;
        string description;
        string metadataURI; // IPFS hash with detailed requirements
        QuestType questType;
        QuestStatus status;
        uint256 bountyAmount;
        address bountyToken; // address(0) for ETH
        uint256 maxParticipants;
        uint256 currentParticipants;
        uint256 maxCollaborators;
        uint256 submissionDeadline;
        uint256 reviewDeadline;
        uint256 createdAt;
        uint256 updatedAt;
        bool requiresApproval;
        string[] tags;
    }

    struct QuestRequirements {
        string[] skillsRequired;
        uint256 minReputation;
        bool kycRequired;
        string[] allowedFileTypes;
        uint256 maxFileSize;
    }

    // Events
    event QuestCreated(
        uint256 indexed questId,
        string indexed externalId,
        address indexed creator,
        string title,
        string description,
        string metadataURI,
        QuestType questType,
        uint256 bountyAmount,
        address bountyToken,
        uint256 maxParticipants,
        uint256 maxCollaborators,
        uint256 submissionDeadline,
        uint256 reviewDeadline,
        bool requiresApproval,
        string[] tags,
        QuestRequirements requirements
    );
    
    event QuestUpdated(uint256 indexed questId, QuestStatus status);
    event QuestCompleted(uint256 indexed questId, address[] winners);
    event QuestCancelled(uint256 indexed questId, string reason);
    event ParticipantJoined(uint256 indexed questId, address indexed participant);
    event ParticipantLeft(uint256 indexed questId, address indexed participant);

    // Quest Management Functions
    function createQuest(
        string calldata externalId,
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
    ) external payable returns (uint256 questId);

    function updateQuest(
        uint256 questId,
        string calldata title,
        string calldata description,
        string calldata metadataURI
    ) external;

    function updateQuestStatus(uint256 questId, QuestStatus status) external;
    function pauseQuest(uint256 questId) external;
    function resumeQuest(uint256 questId) external;
    function cancelQuest(uint256 questId, string calldata reason) external;

    // Participation Functions
    function joinQuest(uint256 questId) external;
    function leaveQuest(uint256 questId) external;
    function approveParticipant(uint256 questId, address participant) external;
    function rejectParticipant(uint256 questId, address participant) external;

    // View Functions
    function getQuest(uint256 questId) external view returns (Quest memory);
    function getQuestRequirements(uint256 questId) external view returns (QuestRequirements memory);
    function getQuestParticipants(uint256 questId) external view returns (address[] memory);
    function isParticipant(uint256 questId, address user) external view returns (bool);
    function getActiveQuests() external view returns (uint256[] memory);
    function getQuestsByCreator(address creator) external view returns (uint256[] memory);
    function getQuestsByTag(string calldata tag) external view returns (uint256[] memory);
    function getTotalQuests() external view returns (uint256);
    
    // External ID lookup functions
    function getQuestIdByExternalId(string calldata externalId) external view returns (uint256);
    function getExternalIdByQuestId(uint256 questId) external view returns (string memory);
    function getQuestByExternalId(string calldata externalId) external view returns (Quest memory);
} 