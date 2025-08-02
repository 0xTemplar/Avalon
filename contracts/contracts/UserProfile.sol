// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IUserProfile.sol";

/**
 * @title UserProfile
 * @dev Simplified implementation of IUserProfile for initial deployment
 */
contract UserProfile is IUserProfile, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant QUEST_BOARD_ROLE = keccak256("QUEST_BOARD_ROLE");
    
    // Storage
    mapping(address => UserProfile) private _profiles;
    mapping(string => address) private _usernameToAddress;
    mapping(address => mapping(string => bool)) private _userSkills;
    mapping(address => string[]) private _userSkillsList;
    mapping(address => ReputationAction[]) private _reputationHistory;
    mapping(uint256 => Achievement) private _achievements;
    mapping(address => UserAchievement[]) private _userAchievements;
    
    uint256 private _profileCounter;
    uint256 private _achievementCounter;
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }
    
    function createProfile(
        string calldata username,
        string calldata bio,
        string calldata avatarURI,
        string[] calldata skills
    ) external override {
        require(!hasProfile(msg.sender), "Profile already exists");
        require(bytes(username).length > 0, "Username cannot be empty");
        require(_usernameToAddress[username] == address(0), "Username already taken");
        
        _profileCounter++;
        
        _profiles[msg.sender] = UserProfile({
            userAddress: msg.sender,
            username: username,
            bio: bio,
            avatarURI: avatarURI,
            skills: skills,
            reputation: 0,
            totalEarnings: 0,
            completedQuests: 0,
            successfulSubmissions: 0,
            joinedAt: block.timestamp,
            isVerified: false,
            isActive: true
        });
        
        _usernameToAddress[username] = msg.sender;
        
        // Store skills
        for (uint256 i = 0; i < skills.length; i++) {
            _userSkills[msg.sender][skills[i]] = true;
            _userSkillsList[msg.sender].push(skills[i]);
        }
        
        emit ProfileCreated(msg.sender, username);
    }
    
    function updateProfile(
        string calldata username,
        string calldata bio,
        string calldata avatarURI
    ) external override {
        require(hasProfile(msg.sender), "Profile does not exist");
        
        UserProfile storage profile = _profiles[msg.sender];
        
        // Update username if changed
        if (keccak256(bytes(username)) != keccak256(bytes(profile.username))) {
            require(_usernameToAddress[username] == address(0), "Username already taken");
            delete _usernameToAddress[profile.username];
            _usernameToAddress[username] = msg.sender;
            profile.username = username;
        }
        
        profile.bio = bio;
        profile.avatarURI = avatarURI;
        
        emit ProfileUpdated(msg.sender);
    }
    
    function addSkill(string calldata skill) external override {
        require(hasProfile(msg.sender), "Profile does not exist");
        require(!_userSkills[msg.sender][skill], "Skill already exists");
        
        _userSkills[msg.sender][skill] = true;
        _userSkillsList[msg.sender].push(skill);
        _profiles[msg.sender].skills = _userSkillsList[msg.sender];
        
        emit SkillAdded(msg.sender, skill);
    }
    
    function removeSkill(string calldata skill) external override {
        require(hasProfile(msg.sender), "Profile does not exist");
        require(_userSkills[msg.sender][skill], "Skill does not exist");
        
        _userSkills[msg.sender][skill] = false;
        
        // Remove from skills list
        string[] storage skills = _userSkillsList[msg.sender];
        for (uint256 i = 0; i < skills.length; i++) {
            if (keccak256(bytes(skills[i])) == keccak256(bytes(skill))) {
                skills[i] = skills[skills.length - 1];
                skills.pop();
                break;
            }
        }
        _profiles[msg.sender].skills = skills;
        
        emit SkillRemoved(msg.sender, skill);
    }
    
    function verifyUser(address user) external override onlyRole(ADMIN_ROLE) {
        require(hasProfile(user), "Profile does not exist");
        _profiles[user].isVerified = true;
    }
    
    function deactivateUser(address user) external override onlyRole(ADMIN_ROLE) {
        require(hasProfile(user), "Profile does not exist");
        _profiles[user].isActive = false;
    }
    
    function updateReputation(
        address user,
        uint256 points,
        string calldata action,
        uint256 questId
    ) external override onlyRole(QUEST_BOARD_ROLE) {
        require(hasProfile(user), "Profile does not exist");
        
        _profiles[user].reputation += points;
        
        _reputationHistory[user].push(ReputationAction({
            user: user,
            action: action,
            questId: questId,
            points: points,
            timestamp: block.timestamp
        }));
        
        emit ReputationUpdated(user, _profiles[user].reputation, action);
        
        // Check for achievements
        checkAndAwardAchievements(user);
    }
    
    function batchUpdateReputation(
        address[] calldata users,
        uint256[] calldata points,
        string calldata action,
        uint256 questId
    ) external override onlyRole(QUEST_BOARD_ROLE) {
        require(users.length == points.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < users.length; i++) {
            if (hasProfile(users[i])) {
                _profiles[users[i]].reputation += points[i];
                
                _reputationHistory[users[i]].push(ReputationAction({
                    user: users[i],
                    action: action,
                    questId: questId,
                    points: points[i],
                    timestamp: block.timestamp
                }));
                
                emit ReputationUpdated(users[i], _profiles[users[i]].reputation, action);
            }
        }
    }
    
    function createAchievement(
        string calldata name,
        string calldata description,
        string calldata iconURI,
        uint256 pointsRequired
    ) external override onlyRole(ADMIN_ROLE) returns (uint256 achievementId) {
        _achievementCounter++;
        achievementId = _achievementCounter;
        
        _achievements[achievementId] = Achievement({
            id: achievementId,
            name: name,
            description: description,
            iconURI: iconURI,
            pointsRequired: pointsRequired,
            isActive: true
        });
        
        return achievementId;
    }
    
    function awardAchievement(address user, uint256 achievementId) external override onlyRole(ADMIN_ROLE) {
        require(hasProfile(user), "Profile does not exist");
        require(_achievements[achievementId].isActive, "Achievement not active");
        
        // Check if already awarded
        UserAchievement[] memory userAchievements = _userAchievements[user];
        for (uint256 i = 0; i < userAchievements.length; i++) {
            if (userAchievements[i].achievementId == achievementId) {
                return; // Already has this achievement
            }
        }
        
        _userAchievements[user].push(UserAchievement({
            achievementId: achievementId,
            user: user,
            earnedAt: block.timestamp
        }));
        
        emit AchievementEarned(user, achievementId);
    }
    
    function checkAndAwardAchievements(address user) public override {
        if (!hasProfile(user)) return;
        
        uint256 userReputation = _profiles[user].reputation;
        
        // Check all achievements
        for (uint256 i = 1; i <= _achievementCounter; i++) {
            if (_achievements[i].isActive && userReputation >= _achievements[i].pointsRequired) {
                // Check if not already awarded
                bool hasAchievement = false;
                UserAchievement[] memory userAchievements = _userAchievements[user];
                for (uint256 j = 0; j < userAchievements.length; j++) {
                    if (userAchievements[j].achievementId == i) {
                        hasAchievement = true;
                        break;
                    }
                }
                
                if (!hasAchievement) {
                    _userAchievements[user].push(UserAchievement({
                        achievementId: i,
                        user: user,
                        earnedAt: block.timestamp
                    }));
                    emit AchievementEarned(user, i);
                }
            }
        }
    }
    
    // View functions
    function getProfile(address user) external view override returns (UserProfile memory) {
        require(hasProfile(user), "Profile does not exist");
        return _profiles[user];
    }
    
    function getProfileByUsername(string calldata username) external view override returns (UserProfile memory) {
        address user = _usernameToAddress[username];
        require(user != address(0), "Username not found");
        return _profiles[user];
    }
    
    function getUserReputation(address user) external view override returns (uint256) {
        return hasProfile(user) ? _profiles[user].reputation : 0;
    }
    
    function getUserAchievements(address user) external view override returns (UserAchievement[] memory) {
        return _userAchievements[user];
    }
    
    function getReputationHistory(address user) external view override returns (ReputationAction[] memory) {
        return _reputationHistory[user];
    }
    
    function getAchievement(uint256 achievementId) external view override returns (Achievement memory) {
        return _achievements[achievementId];
    }
    
    function getAllAchievements() external view override returns (Achievement[] memory) {
        Achievement[] memory achievements = new Achievement[](_achievementCounter);
        for (uint256 i = 1; i <= _achievementCounter; i++) {
            achievements[i - 1] = _achievements[i];
        }
        return achievements;
    }
    
    function isUsernameAvailable(string calldata username) external view override returns (bool) {
        return _usernameToAddress[username] == address(0);
    }
    
    function hasProfile(address user) public view override returns (bool) {
        return _profiles[user].userAddress != address(0);
    }
    
    function isUserVerified(address user) external view override returns (bool) {
        return hasProfile(user) && _profiles[user].isVerified;
    }
    
    function getUsersBySkill(string calldata skill) external view override returns (address[] memory) {
        // This would need an additional mapping to be efficient in production
        // For now, returning empty array
        return new address[](0);
    }
    
    function getTopUsers(uint256 limit) external view override returns (address[] memory) {
        // This would need a sorted data structure in production
        // For now, returning empty array
        return new address[](0);
    }
    
    // Additional admin functions
    function grantQuestBoardRole(address questBoard) external onlyRole(ADMIN_ROLE) {
        grantRole(QUEST_BOARD_ROLE, questBoard);
    }
    
    function updateQuestStats(address user, bool completed) external onlyRole(QUEST_BOARD_ROLE) {
        if (hasProfile(user)) {
            if (completed) {
                _profiles[user].completedQuests++;
            }
        }
    }
    
    function updateEarnings(address user, uint256 amount) external onlyRole(QUEST_BOARD_ROLE) {
        if (hasProfile(user)) {
            _profiles[user].totalEarnings += amount;
        }
    }
}