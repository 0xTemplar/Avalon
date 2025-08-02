// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title ISubmissionManager
 * @dev Interface for managing creative submissions and reviews
 */
interface ISubmissionManager {
    enum SubmissionStatus {
        Draft,
        Submitted,
        UnderReview,
        Approved,
        Rejected,
        Winner
    }

    struct Submission {
        uint256 id;
        uint256 questId;
        address submitter;
        address[] collaborators;
        string title;
        string description;
        string[] fileHashes; // IPFS hashes of submitted files
        string metadataURI; // Additional metadata
        SubmissionStatus status;
        uint256 submittedAt;
        uint256 reviewedAt;
        uint256 score;
        string reviewComments;
        address reviewer;
        bool isTeamSubmission;
    }

    struct Review {
        uint256 submissionId;
        address reviewer;
        uint256 score; // 0-100
        string comments;
        uint256 reviewedAt;
        bool approved;
    }

    struct SubmissionMetrics {
        uint256 totalViews;
        uint256 totalLikes;
        uint256 totalComments;
        address[] likedBy;
    }

    // Events
    event SubmissionCreated(
        uint256 indexed submissionId,
        uint256 indexed questId,
        address indexed submitter,
        bool isTeamSubmission
    );
    
    event SubmissionUpdated(uint256 indexed submissionId, SubmissionStatus status);
    event SubmissionReviewed(
        uint256 indexed submissionId,
        address indexed reviewer,
        uint256 score,
        bool approved
    );
    event SubmissionLiked(uint256 indexed submissionId, address indexed user);
    event SubmissionCommented(uint256 indexed submissionId, address indexed commenter);
    event WinnerSelected(uint256 indexed questId, uint256 indexed submissionId);

    // Submission Functions
    function createSubmission(
        uint256 questId,
        string calldata title,
        string calldata description,
        string[] calldata fileHashes,
        string calldata metadataURI,
        address[] calldata collaborators
    ) external returns (uint256 submissionId);

    function updateSubmission(
        uint256 submissionId,
        string calldata title,
        string calldata description,
        string[] calldata fileHashes,
        string calldata metadataURI
    ) external;

    function submitForReview(uint256 submissionId) external;
    function withdrawSubmission(uint256 submissionId) external;

    // Review Functions
    function reviewSubmission(
        uint256 submissionId,
        uint256 score,
        string calldata comments,
        bool approved
    ) external;

    function selectWinners(
        uint256 questId,
        uint256[] calldata submissionIds
    ) external;

    // Interaction Functions
    function likeSubmission(uint256 submissionId) external;
    function unlikeSubmission(uint256 submissionId) external;
    function commentOnSubmission(uint256 submissionId, string calldata comment) external;

    // View Functions
    function getSubmission(uint256 submissionId) external view returns (Submission memory);
    function getSubmissionReviews(uint256 submissionId) external view returns (Review[] memory);
    function getSubmissionMetrics(uint256 submissionId) external view returns (SubmissionMetrics memory);
    function getQuestSubmissions(uint256 questId) external view returns (uint256[] memory);
    function getUserSubmissions(address user) external view returns (uint256[] memory);
    function getTopSubmissions(uint256 questId, uint256 limit) external view returns (uint256[] memory);
    function getTotalSubmissions() external view returns (uint256);
    function canUserReview(uint256 submissionId, address user) external view returns (bool);
} 