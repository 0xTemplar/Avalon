// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./interfaces/ISubmissionManager.sol";
import "./interfaces/IQuestBoard.sol";
import "./interfaces/IUserProfile.sol";
import "./interfaces/ICollaborationManager.sol";
import "./interfaces/IRewardManager.sol";

/**
 * @title SubmissionManager
 * @dev Contract for managing creative submissions and reviews
 */
contract SubmissionManager is ISubmissionManager, AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant REVIEWER_ROLE = keccak256("REVIEWER_ROLE");

    // Storage
    mapping(uint256 => Submission) private _submissions;
    mapping(uint256 => Review[]) private _submissionReviews;
    mapping(uint256 => SubmissionMetrics) private _submissionMetrics;
    mapping(uint256 => uint256[]) private _questSubmissions;
    mapping(address => uint256[]) private _userSubmissions;
    mapping(uint256 => mapping(address => bool)) private _hasLiked;
    mapping(uint256 => mapping(address => bool)) private _hasReviewed;

    uint256 private _submissionCounter;
    uint256 private _minReviewScore = 0;
    uint256 private _maxReviewScore = 100;

    IQuestBoard public questBoard;
    IUserProfile public userProfile;
    ICollaborationManager public collaborationManager;
    IRewardManager public rewardManager;

    constructor(
        address _questBoard,
        address _userProfile,
        address _collaborationManager,
        address _rewardManager
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        
        questBoard = IQuestBoard(_questBoard);
        userProfile = IUserProfile(_userProfile);
        collaborationManager = ICollaborationManager(_collaborationManager);
        rewardManager = IRewardManager(_rewardManager);
    }

    modifier validSubmission(uint256 submissionId) {
        require(submissionId > 0 && submissionId <= _submissionCounter, "Invalid submission ID");
        _;
    }

    modifier onlySubmitter(uint256 submissionId) {
        require(_submissions[submissionId].submitter == msg.sender, "Not the submitter");
        _;
    }

    modifier canReview(uint256 submissionId) {
        require(canUserReview(submissionId, msg.sender), "Cannot review this submission");
        _;
    }

    function createSubmission(
        uint256 questId,
        string calldata title,
        string calldata description,
        string[] calldata fileHashes,
        string calldata metadataURI,
        address[] calldata collaborators
    ) external nonReentrant whenNotPaused returns (uint256 submissionId) {
        // Validate quest exists and is active
        IQuestBoard.Quest memory quest = questBoard.getQuest(questId);
        require(quest.status == IQuestBoard.QuestStatus.Active, "Quest not active");
        require(block.timestamp < quest.submissionDeadline, "Submission deadline passed");
        require(questBoard.isParticipant(questId, msg.sender), "Not a quest participant");
        require(bytes(title).length > 0, "Title cannot be empty");
        require(fileHashes.length > 0, "Must include at least one file");

        // Validate collaborators
        bool isTeamSubmission = collaborators.length > 0;
        if (isTeamSubmission) {
            require(collaborators.length <= quest.maxCollaborators, "Too many collaborators");
            for (uint256 i = 0; i < collaborators.length; i++) {
                require(questBoard.isParticipant(questId, collaborators[i]), "Collaborator not a participant");
                require(collaborators[i] != msg.sender, "Cannot collaborate with yourself");
            }
        }

        _submissionCounter++;
        submissionId = _submissionCounter;

        _submissions[submissionId] = Submission({
            id: submissionId,
            questId: questId,
            submitter: msg.sender,
            collaborators: collaborators,
            title: title,
            description: description,
            fileHashes: fileHashes,
            metadataURI: metadataURI,
            status: SubmissionStatus.Submitted,
            submittedAt: block.timestamp,
            reviewedAt: 0,
            score: 0,
            reviewComments: "",
            reviewer: address(0),
            isTeamSubmission: isTeamSubmission
        });

        _questSubmissions[questId].push(submissionId);
        _userSubmissions[msg.sender].push(submissionId);

        // Add to collaborators' submissions
        for (uint256 i = 0; i < collaborators.length; i++) {
            _userSubmissions[collaborators[i]].push(submissionId);
        }

        // Initialize metrics
        _submissionMetrics[submissionId] = SubmissionMetrics({
            totalViews: 0,
            totalLikes: 0,
            totalComments: 0,
            likedBy: new address[](0)
        });

        emit SubmissionCreated(submissionId, questId, msg.sender, isTeamSubmission);
    }

    function updateSubmission(
        uint256 submissionId,
        string calldata title,
        string calldata description,
        string[] calldata fileHashes,
        string calldata metadataURI
    ) external validSubmission(submissionId) onlySubmitter(submissionId) {
        Submission storage submission = _submissions[submissionId];
        require(submission.status == SubmissionStatus.Draft, "Cannot update submitted submission");
        
        submission.title = title;
        submission.description = description;
        submission.fileHashes = fileHashes;
        submission.metadataURI = metadataURI;

        emit SubmissionUpdated(submissionId, submission.status);
    }

    function submitForReview(uint256 submissionId) external validSubmission(submissionId) onlySubmitter(submissionId) {
        Submission storage submission = _submissions[submissionId];
        require(submission.status == SubmissionStatus.Draft, "Already submitted");
        
        IQuestBoard.Quest memory quest = questBoard.getQuest(submission.questId);
        require(block.timestamp < quest.submissionDeadline, "Submission deadline passed");
        
        submission.status = SubmissionStatus.Submitted;
        submission.submittedAt = block.timestamp;

        emit SubmissionUpdated(submissionId, SubmissionStatus.Submitted);
    }

    function withdrawSubmission(uint256 submissionId) external validSubmission(submissionId) onlySubmitter(submissionId) {
        Submission storage submission = _submissions[submissionId];
        require(submission.status == SubmissionStatus.Submitted || submission.status == SubmissionStatus.UnderReview, "Cannot withdraw");
        
        submission.status = SubmissionStatus.Draft;
        submission.submittedAt = 0;

        emit SubmissionUpdated(submissionId, SubmissionStatus.Draft);
    }

    function reviewSubmission(
        uint256 submissionId,
        uint256 score,
        string calldata comments,
        bool approved
    ) external validSubmission(submissionId) canReview(submissionId) {
        require(score >= _minReviewScore && score <= _maxReviewScore, "Invalid score range");
        require(!_hasReviewed[submissionId][msg.sender], "Already reviewed");
        
        Submission storage submission = _submissions[submissionId];
        require(submission.status == SubmissionStatus.Submitted || submission.status == SubmissionStatus.UnderReview, "Cannot review");
        
        IQuestBoard.Quest memory quest = questBoard.getQuest(submission.questId);
        require(block.timestamp < quest.reviewDeadline, "Review deadline passed");

        // Add review
        _submissionReviews[submissionId].push(Review({
            submissionId: submissionId,
            reviewer: msg.sender,
            score: score,
            comments: comments,
            reviewedAt: block.timestamp,
            approved: approved
        }));

        _hasReviewed[submissionId][msg.sender] = true;

        // Update submission status and aggregated score
        if (submission.status == SubmissionStatus.Submitted) {
            submission.status = SubmissionStatus.UnderReview;
        }

        // Calculate average score
        Review[] memory reviews = _submissionReviews[submissionId];
        uint256 totalScore = 0;
        for (uint256 i = 0; i < reviews.length; i++) {
            totalScore += reviews[i].score;
        }
        submission.score = totalScore / reviews.length;
        submission.reviewComments = comments;
        submission.reviewer = msg.sender;
        submission.reviewedAt = block.timestamp;

        // Update final status based on approval
        if (approved) {
            submission.status = SubmissionStatus.Approved;
        } else {
            submission.status = SubmissionStatus.Rejected;
        }

        emit SubmissionReviewed(submissionId, msg.sender, score, approved);

        // Update user reputation
        if (approved) {
            userProfile.updateReputation(submission.submitter, 10, "submission_approved", submission.questId);
            // Award reputation to collaborators too
            for (uint256 i = 0; i < submission.collaborators.length; i++) {
                userProfile.updateReputation(submission.collaborators[i], 5, "collaboration_approved", submission.questId);
            }
        }
    }

    function selectWinners(
        uint256 questId,
        uint256[] calldata submissionIds
    ) external {
        IQuestBoard.Quest memory quest = questBoard.getQuest(questId);
        require(quest.creator == msg.sender, "Only quest creator can select winners");
        require(quest.status == IQuestBoard.QuestStatus.Active, "Quest not active");
        // No timing constraints - quest creator can select winners anytime after submission

        // Prepare arrays for reward distribution
        address[] memory winners = new address[](submissionIds.length);
        uint256[] memory prizes = new uint256[](submissionIds.length);
        uint256 prizePerWinner = quest.bountyAmount / submissionIds.length;

        for (uint256 i = 0; i < submissionIds.length; i++) {
            uint256 submissionId = submissionIds[i];
            require(_submissions[submissionId].questId == questId, "Submission not for this quest");
            require(_submissions[submissionId].status == SubmissionStatus.Submitted, "Submission not submitted");
            
            _submissions[submissionId].status = SubmissionStatus.Winner;
            emit WinnerSelected(questId, submissionId);

            // Prepare winner data for reward distribution
            address submitter = _submissions[submissionId].submitter;
            winners[i] = submitter;
            prizes[i] = prizePerWinner;

            // Award reputation to winners (changed from 50 to 20)
            userProfile.updateReputation(submitter, 20, "quest_winner", questId);
            
            // Award to collaborators (changed from 25 to 10)
            for (uint256 j = 0; j < _submissions[submissionId].collaborators.length; j++) {
                userProfile.updateReputation(_submissions[submissionId].collaborators[j], 10, "collaboration_winner", questId);
            }
        }

        // Automatically distribute rewards to all winners
        if (submissionIds.length > 0 && quest.bountyAmount > 0) {
            rewardManager.distributeBounty(questId, winners, prizes);
        }
    }

    function likeSubmission(uint256 submissionId) external validSubmission(submissionId) {
        require(!_hasLiked[submissionId][msg.sender], "Already liked");
        require(_submissions[submissionId].submitter != msg.sender, "Cannot like own submission");
        
        _hasLiked[submissionId][msg.sender] = true;
        _submissionMetrics[submissionId].totalLikes++;
        _submissionMetrics[submissionId].likedBy.push(msg.sender);

        emit SubmissionLiked(submissionId, msg.sender);
    }

    function unlikeSubmission(uint256 submissionId) external validSubmission(submissionId) {
        require(_hasLiked[submissionId][msg.sender], "Not liked");
        
        _hasLiked[submissionId][msg.sender] = false;
        _submissionMetrics[submissionId].totalLikes--;
        
        // Remove from likedBy array
        address[] storage likedBy = _submissionMetrics[submissionId].likedBy;
        for (uint256 i = 0; i < likedBy.length; i++) {
            if (likedBy[i] == msg.sender) {
                likedBy[i] = likedBy[likedBy.length - 1];
                likedBy.pop();
                break;
            }
        }
    }

    function commentOnSubmission(uint256 submissionId, string calldata comment) external validSubmission(submissionId) {
        require(bytes(comment).length > 0, "Comment cannot be empty");
        
        _submissionMetrics[submissionId].totalComments++;
        emit SubmissionCommented(submissionId, msg.sender);
    }

    // View Functions
    function getSubmission(uint256 submissionId) external view validSubmission(submissionId) returns (Submission memory) {
        return _submissions[submissionId];
    }

    function getSubmissionReviews(uint256 submissionId) external view validSubmission(submissionId) returns (Review[] memory) {
        return _submissionReviews[submissionId];
    }

    function getSubmissionMetrics(uint256 submissionId) external view validSubmission(submissionId) returns (SubmissionMetrics memory) {
        return _submissionMetrics[submissionId];
    }

    function getQuestSubmissions(uint256 questId) external view returns (uint256[] memory) {
        return _questSubmissions[questId];
    }

    function getUserSubmissions(address user) external view returns (uint256[] memory) {
        return _userSubmissions[user];
    }

    function getTopSubmissions(uint256 questId, uint256 limit) external view returns (uint256[] memory) {
        uint256[] memory questSubmissions = _questSubmissions[questId];
        if (questSubmissions.length == 0) {
            return new uint256[](0);
        }

        // Sort by score (simple bubble sort for small arrays)
        uint256[] memory sortedIds = new uint256[](questSubmissions.length);
        uint256[] memory scores = new uint256[](questSubmissions.length);
        
        for (uint256 i = 0; i < questSubmissions.length; i++) {
            sortedIds[i] = questSubmissions[i];
            scores[i] = _submissions[questSubmissions[i]].score;
        }

        // Simple sorting
        for (uint256 i = 0; i < scores.length; i++) {
            for (uint256 j = i + 1; j < scores.length; j++) {
                if (scores[i] < scores[j]) {
                    // Swap scores
                    uint256 tempScore = scores[i];
                    scores[i] = scores[j];
                    scores[j] = tempScore;
                    
                    // Swap ids
                    uint256 tempId = sortedIds[i];
                    sortedIds[i] = sortedIds[j];
                    sortedIds[j] = tempId;
                }
            }
        }

        // Return top 'limit' submissions
        uint256 returnLength = limit > sortedIds.length ? sortedIds.length : limit;
        uint256[] memory topSubmissions = new uint256[](returnLength);
        for (uint256 i = 0; i < returnLength; i++) {
            topSubmissions[i] = sortedIds[i];
        }

        return topSubmissions;
    }

    function getTotalSubmissions() external view returns (uint256) {
        return _submissionCounter;
    }

    function canUserReview(uint256 submissionId, address user) public view validSubmission(submissionId) returns (bool) {
        Submission memory submission = _submissions[submissionId];
        
        // Cannot review own submission
        if (submission.submitter == user) return false;
        
        // Cannot review if already reviewed
        if (_hasReviewed[submissionId][user]) return false;
        
        // Cannot review if collaborator
        for (uint256 i = 0; i < submission.collaborators.length; i++) {
            if (submission.collaborators[i] == user) return false;
        }

        IQuestBoard.Quest memory quest = questBoard.getQuest(submission.questId);
        
        // Quest creator can always review
        if (quest.creator == user) return true;
        
        // Users with REVIEWER_ROLE can review
        if (hasRole(REVIEWER_ROLE, user)) return true;
        
        // Other quest participants can review
        if (questBoard.isParticipant(submission.questId, user)) return true;
        
        return false;
    }

    // Admin Functions
    function setReviewScoreRange(uint256 minScore, uint256 maxScore) external onlyRole(ADMIN_ROLE) {
        require(minScore < maxScore, "Invalid score range");
        _minReviewScore = minScore;
        _maxReviewScore = maxScore;
    }

    function grantReviewerRole(address user) external onlyRole(ADMIN_ROLE) {
        _grantRole(REVIEWER_ROLE, user);
    }

    function revokeReviewerRole(address user) external onlyRole(ADMIN_ROLE) {
        _revokeRole(REVIEWER_ROLE, user);
    }

    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
} 