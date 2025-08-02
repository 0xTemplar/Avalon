// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title IUserProfile
 * @dev Interface for managing user profiles and reputation system
 */
interface IUserProfile {
    struct UserProfile {
        address userAddress;
        string username;
        string bio;
        string avatarURI;
        string[] skills;
        uint256 reputation;
        uint256 totalEarnings;
        uint256 completedQuests;
        uint256 successfulSubmissions;
        uint256 joinedAt;
        bool isVerified;
        bool isActive;
    }

    struct ReputationAction {
        address user;
        string action; // "quest_completed", "submission_approved", "review_submitted", etc.
        uint256 questId;
        uint256 points;
        uint256 timestamp;
    }

    struct Achievement {
        uint256 id;
        string name;
        string description;
        string iconURI;
        uint256 pointsRequired;
        bool isActive;
    }

    struct UserAchievement {
        uint256 achievementId;
        address user;
        uint256 earnedAt;
    }

    // Events
    event ProfileCreated(address indexed user, string username);
    event ProfileUpdated(address indexed user);
    event ReputationUpdated(address indexed user, uint256 newReputation, string action);
    event AchievementEarned(address indexed user, uint256 indexed achievementId);
    event SkillAdded(address indexed user, string skill);
    event SkillRemoved(address indexed user, string skill);

    // Profile Management Functions
    function createProfile(
        string calldata username,
        string calldata bio,
        string calldata avatarURI,
        string[] calldata skills
    ) external;

    function updateProfile(
        string calldata username,
        string calldata bio,
        string calldata avatarURI
    ) external;

    function addSkill(string calldata skill) external;
    function removeSkill(string calldata skill) external;
    function verifyUser(address user) external;
    function deactivateUser(address user) external;

    // Reputation Functions
    function updateReputation(
        address user,
        uint256 points,
        string calldata action,
        uint256 questId
    ) external;

    function batchUpdateReputation(
        address[] calldata users,
        uint256[] calldata points,
        string calldata action,
        uint256 questId
    ) external;

    // Achievement Functions
    function createAchievement(
        string calldata name,
        string calldata description,
        string calldata iconURI,
        uint256 pointsRequired
    ) external returns (uint256 achievementId);

    function awardAchievement(address user, uint256 achievementId) external;
    function checkAndAwardAchievements(address user) external;

    // View Functions
    function getProfile(address user) external view returns (UserProfile memory);
    function getProfileByUsername(string calldata username) external view returns (UserProfile memory);
    function getUserReputation(address user) external view returns (uint256);
    function getUserAchievements(address user) external view returns (UserAchievement[] memory);
    function getReputationHistory(address user) external view returns (ReputationAction[] memory);
    function getAchievement(uint256 achievementId) external view returns (Achievement memory);
    function getAllAchievements() external view returns (Achievement[] memory);
    function isUsernameAvailable(string calldata username) external view returns (bool);
    function hasProfile(address user) external view returns (bool);
    function isUserVerified(address user) external view returns (bool);
    function getUsersBySkill(string calldata skill) external view returns (address[] memory);
    function getTopUsers(uint256 limit) external view returns (address[] memory);
} 