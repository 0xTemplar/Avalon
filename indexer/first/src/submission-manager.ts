import {
  Paused as PausedEvent,
  RoleAdminChanged as RoleAdminChangedEvent,
  RoleGranted as RoleGrantedEvent,
  RoleRevoked as RoleRevokedEvent,
  SubmissionCommented as SubmissionCommentedEvent,
  SubmissionCreated as SubmissionCreatedEvent,
  SubmissionLiked as SubmissionLikedEvent,
  SubmissionReviewed as SubmissionReviewedEvent,
  SubmissionUpdated as SubmissionUpdatedEvent,
  Unpaused as UnpausedEvent,
  WinnerSelected as WinnerSelectedEvent,
} from '../generated/SubmissionManager/SubmissionManager';
import {
  User,
  Quest,
  Submission,
  SubmissionLike,
  SubmissionComment,
  SubmissionReview,
  PlatformStats,
  RoleEvent,
  PauseEvent,
} from '../generated/schema';
import { BigInt, Bytes, Address } from '@graphprotocol/graph-ts';

// Helper function to get or create a User entity
function getOrCreateUser(address: Address): User {
  let user = User.load(address);
  if (user == null) {
    user = new User(address);
    user.username = null;
    user.profileCreatedAt = null;
    user.profileUpdatedAt = null;
    user.reputation = BigInt.fromI32(0);
    user.skills = [];
    user.totalQuestsCreated = BigInt.fromI32(0);
    user.totalQuestsCompleted = BigInt.fromI32(0);
    user.totalRewardsEarned = BigInt.fromI32(0);
    user.totalSubmissions = BigInt.fromI32(0);
    user.save();

    // Update platform stats
    updatePlatformStats('USER_CREATED');
  }
  return user;
}

// Helper function to get platform stats
function getOrCreatePlatformStats(): PlatformStats {
  let stats = PlatformStats.load(Bytes.fromUTF8('PLATFORM_STATS'));
  if (stats == null) {
    stats = new PlatformStats(Bytes.fromUTF8('PLATFORM_STATS'));
    stats.totalUsers = BigInt.fromI32(0);
    stats.totalQuests = BigInt.fromI32(0);
    stats.totalSubmissions = BigInt.fromI32(0);
    stats.totalRewardsDistributed = BigInt.fromI32(0);
    stats.totalValueLocked = BigInt.fromI32(0);
    stats.platformFeePercentage = BigInt.fromI32(0);
    stats.platformFeeRecipient = Address.zero();
    stats.save();
  }
  return stats;
}

// Helper function to update platform stats
function updatePlatformStats(action: string): void {
  let stats = getOrCreatePlatformStats();

  if (action == 'USER_CREATED') {
    stats.totalUsers = stats.totalUsers.plus(BigInt.fromI32(1));
  } else if (action == 'SUBMISSION_CREATED') {
    stats.totalSubmissions = stats.totalSubmissions.plus(BigInt.fromI32(1));
  }

  stats.save();
}

export function handleSubmissionCreated(event: SubmissionCreatedEvent): void {
  // Get or create user
  let submitter = getOrCreateUser(event.params.submitter);

  // Get quest
  let questId = changetype<Bytes>(Bytes.fromBigInt(event.params.questId));
  let quest = Quest.load(questId);
  if (quest == null) {
    // Quest should exist, but if not, skip this event
    return;
  }

  // Create Submission entity
  let submissionId = changetype<Bytes>(
    Bytes.fromBigInt(event.params.submissionId)
  );
  let submission = new Submission(submissionId);
  submission.submissionId = event.params.submissionId;
  submission.quest = questId;
  submission.submitter = event.params.submitter;
  submission.isTeamSubmission = event.params.isTeamSubmission;
  submission.team = null; // Will be set by collaboration manager if needed

  // Status and scoring
  submission.status = 'CREATED';
  submission.score = null;
  submission.isApproved = false;
  submission.isWinner = false;

  // Timestamps
  submission.createdAt = event.block.timestamp;
  submission.updatedAt = null;
  submission.reviewedAt = null;

  // Stats
  submission.likeCount = BigInt.fromI32(0);
  submission.commentCount = BigInt.fromI32(0);

  // Transaction info
  submission.creationTxHash = event.transaction.hash;
  submission.creationBlockNumber = event.block.number;

  submission.save();

  // Update quest submission count
  quest.submissionCount = quest.submissionCount.plus(BigInt.fromI32(1));
  quest.save();

  // Update submitter stats
  submitter.totalSubmissions = submitter.totalSubmissions.plus(
    BigInt.fromI32(1)
  );
  submitter.save();

  // Update platform stats
  updatePlatformStats('SUBMISSION_CREATED');
}

export function handleSubmissionUpdated(event: SubmissionUpdatedEvent): void {
  let submissionId = changetype<Bytes>(
    Bytes.fromBigInt(event.params.submissionId)
  );
  let submission = Submission.load(submissionId);

  if (submission != null) {
    submission.updatedAt = event.block.timestamp;

    // Update status based on the status parameter
    if (event.params.status == 0) {
      submission.status = 'CREATED';
    } else if (event.params.status == 1) {
      submission.status = 'UNDER_REVIEW';
    } else if (event.params.status == 2) {
      submission.status = 'APPROVED';
      submission.isApproved = true;
    } else if (event.params.status == 3) {
      submission.status = 'REJECTED';
      submission.isApproved = false;
    } else if (event.params.status == 4) {
      submission.status = 'WINNER';
      submission.isWinner = true;
      submission.isApproved = true;
    }

    submission.save();
  }
}

export function handleSubmissionLiked(event: SubmissionLikedEvent): void {
  // Get or create user
  let user = getOrCreateUser(event.params.user);

  // Create SubmissionLike entity
  let submissionId = changetype<Bytes>(
    Bytes.fromBigInt(event.params.submissionId)
  );
  let likeId = changetype<Bytes>(submissionId.concat(event.params.user));
  let like = new SubmissionLike(likeId);
  like.submission = submissionId;
  like.user = event.params.user;
  like.likedAt = event.block.timestamp;
  like.txHash = event.transaction.hash;
  like.save();

  // Update submission like count
  let submission = Submission.load(submissionId);
  if (submission != null) {
    submission.likeCount = submission.likeCount.plus(BigInt.fromI32(1));
    submission.save();
  }
}

export function handleSubmissionCommented(
  event: SubmissionCommentedEvent
): void {
  // Get or create user
  let commenter = getOrCreateUser(event.params.commenter);

  // Create SubmissionComment entity
  let submissionId = changetype<Bytes>(
    Bytes.fromBigInt(event.params.submissionId)
  );
  let commentId = changetype<Bytes>(
    submissionId
      .concat(event.params.commenter)
      .concat(changetype<Bytes>(Bytes.fromBigInt(event.block.timestamp)))
  );
  let comment = new SubmissionComment(commentId);
  comment.submission = submissionId;
  comment.commenter = event.params.commenter;
  comment.commentedAt = event.block.timestamp;
  comment.txHash = event.transaction.hash;
  comment.save();

  // Update submission comment count
  let submission = Submission.load(submissionId);
  if (submission != null) {
    submission.commentCount = submission.commentCount.plus(BigInt.fromI32(1));
    submission.save();
  }
}

export function handleSubmissionReviewed(event: SubmissionReviewedEvent): void {
  // Get or create user
  let reviewer = getOrCreateUser(event.params.reviewer);

  // Create SubmissionReview entity
  let submissionId = changetype<Bytes>(
    Bytes.fromBigInt(event.params.submissionId)
  );
  let reviewId = changetype<Bytes>(
    submissionId
      .concat(event.params.reviewer)
      .concat(changetype<Bytes>(Bytes.fromBigInt(event.block.timestamp)))
  );
  let review = new SubmissionReview(reviewId);
  review.submission = submissionId;
  review.reviewer = event.params.reviewer;
  review.score = event.params.score;
  review.approved = event.params.approved;
  review.reviewedAt = event.block.timestamp;
  review.txHash = event.transaction.hash;
  review.save();

  // Update submission with review info
  let submission = Submission.load(submissionId);
  if (submission != null) {
    submission.score = event.params.score;
    submission.isApproved = event.params.approved;
    submission.reviewedAt = event.block.timestamp;

    if (event.params.approved) {
      submission.status = 'APPROVED';
    } else {
      submission.status = 'REJECTED';
    }

    submission.save();
  }
}

export function handleWinnerSelected(event: WinnerSelectedEvent): void {
  let submissionId = changetype<Bytes>(
    Bytes.fromBigInt(event.params.submissionId)
  );
  let submission = Submission.load(submissionId);

  if (submission != null) {
    submission.isWinner = true;
    submission.status = 'WINNER';
    submission.save();

    // Update quest with winner info
    let questId = changetype<Bytes>(Bytes.fromBigInt(event.params.questId));
    let quest = Quest.load(questId);
    if (quest != null) {
      let winners = quest.winners;
      let submitterAddress = submission.submitter;

      // Add winner to quest winners array if not already there
      let isAlreadyWinner = false;
      for (let i = 0; i < winners.length; i++) {
        if (winners[i].equals(submitterAddress)) {
          isAlreadyWinner = true;
          break;
        }
      }

      if (!isAlreadyWinner) {
        winners.push(submitterAddress);
        quest.winners = winners;
        quest.save();
      }
    }

    // Update submitter stats
    let submitter = User.load(submission.submitter);
    if (submitter != null) {
      submitter.totalQuestsCompleted = submitter.totalQuestsCompleted.plus(
        BigInt.fromI32(1)
      );
      submitter.save();
    }
  }
}

// Handle role events with consolidated entity
export function handleRoleAdminChanged(event: RoleAdminChangedEvent): void {
  let entity = new RoleEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.contract = 'SubmissionManager';
  entity.role = event.params.role;
  entity.account = event.params.newAdminRole;
  entity.eventType = 'ADMIN_CHANGED';
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}

export function handleRoleGranted(event: RoleGrantedEvent): void {
  let entity = new RoleEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.contract = 'SubmissionManager';
  entity.role = event.params.role;
  entity.account = event.params.account;
  entity.eventType = 'GRANTED';
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}

export function handleRoleRevoked(event: RoleRevokedEvent): void {
  let entity = new RoleEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.contract = 'SubmissionManager';
  entity.role = event.params.role;
  entity.account = event.params.account;
  entity.eventType = 'REVOKED';
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}

export function handlePaused(event: PausedEvent): void {
  let entity = new PauseEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.contract = 'SubmissionManager';
  entity.account = event.params.account;
  entity.isPaused = true;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}

export function handleUnpaused(event: UnpausedEvent): void {
  let entity = new PauseEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.contract = 'SubmissionManager';
  entity.account = event.params.account;
  entity.isPaused = false;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}
