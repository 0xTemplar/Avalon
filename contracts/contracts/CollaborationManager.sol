// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./interfaces/ICollaborationManager.sol";
import "./interfaces/IQuestBoard.sol";
import "./interfaces/IUserProfile.sol";

/**
 * @title CollaborationManager
 * @dev Contract for managing team collaboration and partnerships
 */
contract CollaborationManager is ICollaborationManager, AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // Storage
    mapping(uint256 => Team) private _teams;
    mapping(uint256 => TeamInvite[]) private _teamInvites;
    mapping(address => uint256[]) private _userTeams;
    mapping(uint256 => uint256[]) private _questTeams;
    mapping(address => TeamInvite[]) private _userInvites;
    mapping(uint256 => mapping(address => bool)) private _isTeamMember;
    mapping(uint256 => mapping(address => bool)) private _hasPendingInvite;
    
    mapping(uint256 => CollaborationRequest) private _collaborationRequests;
    mapping(address => uint256[]) private _userCollaborationRequests;
    mapping(uint256 => uint256[]) private _questCollaborationRequests;

    uint256 private _teamCounter;
    uint256 private _collaborationRequestCounter;
    uint256 private _inviteExpiryDuration = 7 days;

    IQuestBoard public questBoard;
    IUserProfile public userProfile;

    constructor(
        address _questBoard,
        address _userProfile
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        
        questBoard = IQuestBoard(_questBoard);
        userProfile = IUserProfile(_userProfile);
    }

    modifier validTeam(uint256 teamId) {
        require(teamId > 0 && teamId <= _teamCounter, "Invalid team ID");
        _;
    }

    modifier onlyTeamLeader(uint256 teamId) {
        require(_teams[teamId].leader == msg.sender, "Not the team leader");
        _;
    }

    modifier validCollaborationRequest(uint256 requestId) {
        require(requestId > 0 && requestId <= _collaborationRequestCounter, "Invalid request ID");
        _;
    }

    function createTeam(
        uint256 questId,
        string calldata name,
        string calldata description,
        uint256 maxMembers,
        string[] calldata skillsNeeded,
        bool isOpen
    ) external nonReentrant whenNotPaused returns (uint256 teamId) {
        IQuestBoard.Quest memory quest = questBoard.getQuest(questId);
        require(quest.status == IQuestBoard.QuestStatus.Active, "Quest not active");
        require(questBoard.isParticipant(questId, msg.sender), "Not a quest participant");
        require(bytes(name).length > 0, "Team name cannot be empty");
        require(maxMembers >= 2, "Team must allow at least 2 members");
        require(maxMembers <= quest.maxCollaborators + 1, "Exceeds quest collaboration limit");

        _teamCounter++;
        teamId = _teamCounter;

        address[] memory initialMembers = new address[](1);
        initialMembers[0] = msg.sender;

        _teams[teamId] = Team({
            id: teamId,
            questId: questId,
            name: name,
            leader: msg.sender,
            members: initialMembers,
            status: TeamStatus.Forming,
            maxMembers: maxMembers,
            createdAt: block.timestamp,
            description: description,
            skillsNeeded: skillsNeeded,
            isOpen: isOpen
        });

        _userTeams[msg.sender].push(teamId);
        _questTeams[questId].push(teamId);
        _isTeamMember[teamId][msg.sender] = true;

        emit TeamCreated(teamId, questId, msg.sender, name);
    }

    function joinTeam(uint256 teamId) external validTeam(teamId) nonReentrant {
        require(this.canJoinTeam(teamId, msg.sender), "Cannot join team");
        
        Team storage team = _teams[teamId];
        require(team.isOpen, "Team is not open for joining");
        require(team.members.length < team.maxMembers, "Team is full");
        
        team.members.push(msg.sender);
        _userTeams[msg.sender].push(teamId);
        _isTeamMember[teamId][msg.sender] = true;

        if (team.members.length >= 2 && team.status == TeamStatus.Forming) {
            team.status = TeamStatus.Active;
        }

        emit TeamMemberAdded(teamId, msg.sender);
    }

    function leaveTeam(uint256 teamId) external validTeam(teamId) {
        require(_isTeamMember[teamId][msg.sender], "Not a team member");
        
        Team storage team = _teams[teamId];
        require(team.leader != msg.sender, "Leader cannot leave team");
        
        _removeTeamMember(teamId, msg.sender);
        emit TeamMemberRemoved(teamId, msg.sender);
    }

    function removeTeamMember(uint256 teamId, address member) external validTeam(teamId) onlyTeamLeader(teamId) {
        require(_isTeamMember[teamId][member], "Not a team member");
        require(member != msg.sender, "Cannot remove yourself");
        
        _removeTeamMember(teamId, member);
        emit TeamMemberRemoved(teamId, member);
    }

    function disbandTeam(uint256 teamId) external validTeam(teamId) onlyTeamLeader(teamId) {
        Team storage team = _teams[teamId];
        require(team.status != TeamStatus.Completed, "Cannot disband completed team");
        
        team.status = TeamStatus.Disbanded;
        
        // Remove all members from tracking
        for (uint256 i = 0; i < team.members.length; i++) {
            _isTeamMember[teamId][team.members[i]] = false;
        }

        emit TeamDisbanded(teamId);
    }

    function updateTeamInfo(
        uint256 teamId,
        string calldata name,
        string calldata description,
        string[] calldata skillsNeeded
    ) external validTeam(teamId) onlyTeamLeader(teamId) {
        Team storage team = _teams[teamId];
        require(team.status == TeamStatus.Forming || team.status == TeamStatus.Active, "Cannot update team");
        
        team.name = name;
        team.description = description;
        team.skillsNeeded = skillsNeeded;
    }

    function inviteToTeam(
        uint256 teamId,
        address invitee,
        string calldata message
    ) external validTeam(teamId) onlyTeamLeader(teamId) {
        Team storage team = _teams[teamId];
        require(team.status == TeamStatus.Forming || team.status == TeamStatus.Active, "Cannot send invites");
        require(team.members.length < team.maxMembers, "Team is full");
        require(!_isTeamMember[teamId][invitee], "Already a team member");
        require(!_hasPendingInvite[teamId][invitee], "Invite already pending");
        require(questBoard.isParticipant(team.questId, invitee), "Invitee not a quest participant");

        TeamInvite memory invite = TeamInvite({
            teamId: teamId,
            invitee: invitee,
            inviter: msg.sender,
            status: InviteStatus.Pending,
            createdAt: block.timestamp,
            expiresAt: block.timestamp + _inviteExpiryDuration,
            message: message
        });

        _teamInvites[teamId].push(invite);
        _userInvites[invitee].push(invite);
        _hasPendingInvite[teamId][invitee] = true;

        emit TeamInviteSent(teamId, invitee, msg.sender);
    }

    function acceptTeamInvite(uint256 teamId) external validTeam(teamId) {
        require(_hasPendingInvite[teamId][msg.sender], "No pending invite");
        
        Team storage team = _teams[teamId];
        require(team.members.length < team.maxMembers, "Team is full");
        require(team.status == TeamStatus.Forming || team.status == TeamStatus.Active, "Cannot join team");

        // Update invite status
        _updateInviteStatus(teamId, msg.sender, InviteStatus.Accepted);
        _hasPendingInvite[teamId][msg.sender] = false;

        // Add to team
        team.members.push(msg.sender);
        _userTeams[msg.sender].push(teamId);
        _isTeamMember[teamId][msg.sender] = true;

        if (team.members.length >= 2 && team.status == TeamStatus.Forming) {
            team.status = TeamStatus.Active;
        }

        emit TeamInviteAccepted(teamId, msg.sender);
        emit TeamMemberAdded(teamId, msg.sender);
    }

    function rejectTeamInvite(uint256 teamId) external validTeam(teamId) {
        require(_hasPendingInvite[teamId][msg.sender], "No pending invite");
        
        _updateInviteStatus(teamId, msg.sender, InviteStatus.Rejected);
        _hasPendingInvite[teamId][msg.sender] = false;

        emit TeamInviteRejected(teamId, msg.sender);
    }

    function cancelTeamInvite(uint256 teamId, address invitee) external validTeam(teamId) onlyTeamLeader(teamId) {
        require(_hasPendingInvite[teamId][invitee], "No pending invite");
        
        _updateInviteStatus(teamId, invitee, InviteStatus.Expired);
        _hasPendingInvite[teamId][invitee] = false;
    }

    function createCollaborationRequest(
        uint256 questId,
        address[] calldata targetCollaborators,
        string calldata proposal,
        string calldata skillsOffering
    ) external nonReentrant whenNotPaused returns (uint256 requestId) {
        IQuestBoard.Quest memory quest = questBoard.getQuest(questId);
        require(quest.status == IQuestBoard.QuestStatus.Active, "Quest not active");
        require(questBoard.isParticipant(questId, msg.sender), "Not a quest participant");
        require(targetCollaborators.length > 0, "Must specify collaborators");
        require(bytes(proposal).length > 0, "Proposal cannot be empty");

        // Validate all target collaborators are quest participants
        for (uint256 i = 0; i < targetCollaborators.length; i++) {
            require(questBoard.isParticipant(questId, targetCollaborators[i]), "Target not a participant");
            require(targetCollaborators[i] != msg.sender, "Cannot collaborate with yourself");
        }

        _collaborationRequestCounter++;
        requestId = _collaborationRequestCounter;

        _collaborationRequests[requestId] = CollaborationRequest({
            id: requestId,
            questId: questId,
            requester: msg.sender,
            targetCollaborators: targetCollaborators,
            proposal: proposal,
            skillsOffering: skillsOffering,
            createdAt: block.timestamp,
            isActive: true
        });

        _userCollaborationRequests[msg.sender].push(requestId);
        _questCollaborationRequests[questId].push(requestId);

        emit CollaborationRequestCreated(requestId, questId, msg.sender);
    }

    function respondToCollaborationRequest(uint256 requestId, bool accept) external validCollaborationRequest(requestId) {
        CollaborationRequest storage request = _collaborationRequests[requestId];
        require(request.isActive, "Request not active");
        
        bool isTargetCollaborator = false;
        for (uint256 i = 0; i < request.targetCollaborators.length; i++) {
            if (request.targetCollaborators[i] == msg.sender) {
                isTargetCollaborator = true;
                break;
            }
        }
        require(isTargetCollaborator, "Not a target collaborator");

        if (accept) {
            // Here you could automatically create a team or facilitate the collaboration
            // For now, we just mark the request as handled
            userProfile.updateReputation(request.requester, 5, "collaboration_accepted", request.questId);
            userProfile.updateReputation(msg.sender, 5, "collaboration_response", request.questId);
        }
        
        request.isActive = false;
    }

    function cancelCollaborationRequest(uint256 requestId) external validCollaborationRequest(requestId) {
        CollaborationRequest storage request = _collaborationRequests[requestId];
        require(request.requester == msg.sender, "Not the requester");
        require(request.isActive, "Request not active");
        
        request.isActive = false;
    }

    function _removeTeamMember(uint256 teamId, address member) internal {
        Team storage team = _teams[teamId];
        
        // Remove from members array
        for (uint256 i = 0; i < team.members.length; i++) {
            if (team.members[i] == member) {
                team.members[i] = team.members[team.members.length - 1];
                team.members.pop();
                break;
            }
        }
        
        // Remove from user teams
        uint256[] storage userTeams = _userTeams[member];
        for (uint256 i = 0; i < userTeams.length; i++) {
            if (userTeams[i] == teamId) {
                userTeams[i] = userTeams[userTeams.length - 1];
                userTeams.pop();
                break;
            }
        }
        
        _isTeamMember[teamId][member] = false;
    }

    function _updateInviteStatus(uint256 teamId, address invitee, InviteStatus status) internal {
        TeamInvite[] storage teamInvites = _teamInvites[teamId];
        for (uint256 i = 0; i < teamInvites.length; i++) {
            if (teamInvites[i].invitee == invitee && teamInvites[i].status == InviteStatus.Pending) {
                teamInvites[i].status = status;
                break;
            }
        }

        TeamInvite[] storage userInvites = _userInvites[invitee];
        for (uint256 i = 0; i < userInvites.length; i++) {
            if (userInvites[i].teamId == teamId && userInvites[i].status == InviteStatus.Pending) {
                userInvites[i].status = status;
                break;
            }
        }
    }

    // View Functions
    function getTeam(uint256 teamId) external view validTeam(teamId) returns (Team memory) {
        return _teams[teamId];
    }

    function getTeamMembers(uint256 teamId) external view validTeam(teamId) returns (address[] memory) {
        return _teams[teamId].members;
    }

    function getTeamInvites(uint256 teamId) external view validTeam(teamId) returns (TeamInvite[] memory) {
        return _teamInvites[teamId];
    }

    function getUserTeams(address user) external view returns (uint256[] memory) {
        return _userTeams[user];
    }

    function getQuestTeams(uint256 questId) external view returns (uint256[] memory) {
        return _questTeams[questId];
    }

    function getUserInvites(address user) external view returns (TeamInvite[] memory) {
        return _userInvites[user];
    }

    function getCollaborationRequest(uint256 requestId) external view validCollaborationRequest(requestId) returns (CollaborationRequest memory) {
        return _collaborationRequests[requestId];
    }

    function getUserCollaborationRequests(address user) external view returns (uint256[] memory) {
        return _userCollaborationRequests[user];
    }

    function getQuestCollaborationRequests(uint256 questId) external view returns (uint256[] memory) {
        return _questCollaborationRequests[questId];
    }

    function isTeamMember(uint256 teamId, address user) external view validTeam(teamId) returns (bool) {
        return _isTeamMember[teamId][user];
    }

    function isTeamLeader(uint256 teamId, address user) external view validTeam(teamId) returns (bool) {
        return _teams[teamId].leader == user;
    }

    function canJoinTeam(uint256 teamId, address user) external view validTeam(teamId) returns (bool) {
        Team memory team = _teams[teamId];
        
        if (_isTeamMember[teamId][user]) return false;
        if (team.members.length >= team.maxMembers) return false;
        if (team.status != TeamStatus.Forming && team.status != TeamStatus.Active) return false;
        if (!questBoard.isParticipant(team.questId, user)) return false;
        
        return true;
    }

    // Admin Functions
    function setInviteExpiryDuration(uint256 duration) external onlyRole(ADMIN_ROLE) {
        require(duration >= 1 hours && duration <= 30 days, "Invalid duration");
        _inviteExpiryDuration = duration;
    }

    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
} 