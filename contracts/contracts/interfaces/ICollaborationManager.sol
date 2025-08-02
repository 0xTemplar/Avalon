// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title ICollaborationManager
 * @dev Interface for managing team collaboration and partnerships
 */
interface ICollaborationManager {
    enum TeamStatus {
        Forming,
        Active,
        Disbanded,
        Completed
    }

    enum InviteStatus {
        Pending,
        Accepted,
        Rejected,
        Expired
    }

    struct Team {
        uint256 id;
        uint256 questId;
        string name;
        address leader;
        address[] members;
        TeamStatus status;
        uint256 maxMembers;
        uint256 createdAt;
        string description;
        string[] skillsNeeded;
        bool isOpen; // Open for public joining
    }

    struct TeamInvite {
        uint256 teamId;
        address invitee;
        address inviter;
        InviteStatus status;
        uint256 createdAt;
        uint256 expiresAt;
        string message;
    }

    struct CollaborationRequest {
        uint256 id;
        uint256 questId;
        address requester;
        address[] targetCollaborators;
        string proposal;
        string skillsOffering;
        uint256 createdAt;
        bool isActive;
    }

    // Events
    event TeamCreated(
        uint256 indexed teamId,
        uint256 indexed questId,
        address indexed leader,
        string name
    );
    
    event TeamMemberAdded(uint256 indexed teamId, address indexed member);
    event TeamMemberRemoved(uint256 indexed teamId, address indexed member);
    event TeamInviteSent(uint256 indexed teamId, address indexed invitee, address indexed inviter);
    event TeamInviteAccepted(uint256 indexed teamId, address indexed invitee);
    event TeamInviteRejected(uint256 indexed teamId, address indexed invitee);
    event TeamDisbanded(uint256 indexed teamId);
    event CollaborationRequestCreated(uint256 indexed requestId, uint256 indexed questId, address indexed requester);

    // Team Management Functions
    function createTeam(
        uint256 questId,
        string memory name,
        string memory description,
        uint256 maxMembers,
        string[] memory skillsNeeded,
        bool isOpen
    ) external returns (uint256 teamId);

    function joinTeam(uint256 teamId) external;
    function leaveTeam(uint256 teamId) external;
    function removeTeamMember(uint256 teamId, address member) external;
    function disbandTeam(uint256 teamId) external;
    function updateTeamInfo(
        uint256 teamId,
        string memory name,
        string memory description,
        string[] memory skillsNeeded
    ) external;

    // Invitation Functions
    function inviteToTeam(
        uint256 teamId,
        address invitee,
        string memory message
    ) external;

    function acceptTeamInvite(uint256 teamId) external;
    function rejectTeamInvite(uint256 teamId) external;
    function cancelTeamInvite(uint256 teamId, address invitee) external;

    // Collaboration Request Functions
    function createCollaborationRequest(
        uint256 questId,
        address[] memory targetCollaborators,
        string memory proposal,
        string memory skillsOffering
    ) external returns (uint256 requestId);

    function respondToCollaborationRequest(uint256 requestId, bool accept) external;
    function cancelCollaborationRequest(uint256 requestId) external;

    // View Functions
    function getTeam(uint256 teamId) external view returns (Team memory);
    function getTeamMembers(uint256 teamId) external view returns (address[] memory);
    function getTeamInvites(uint256 teamId) external view returns (TeamInvite[] memory);
    function getUserTeams(address user) external view returns (uint256[] memory);
    function getQuestTeams(uint256 questId) external view returns (uint256[] memory);
    function getUserInvites(address user) external view returns (TeamInvite[] memory);
    function getCollaborationRequest(uint256 requestId) external view returns (CollaborationRequest memory);
    function getUserCollaborationRequests(address user) external view returns (uint256[] memory);
    function getQuestCollaborationRequests(uint256 questId) external view returns (uint256[] memory);
    function isTeamMember(uint256 teamId, address user) external view returns (bool);
    function isTeamLeader(uint256 teamId, address user) external view returns (bool);
    function canJoinTeam(uint256 teamId, address user) external view returns (bool);
} 