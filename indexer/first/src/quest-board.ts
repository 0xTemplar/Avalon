import {
  ParticipantJoined as ParticipantJoinedEvent,
  ParticipantLeft as ParticipantLeftEvent,
  Paused as PausedEvent,
  PlatformFeeRecipientUpdated as PlatformFeeRecipientUpdatedEvent,
  PlatformFeeUpdated as PlatformFeeUpdatedEvent,
  QuestCancelled as QuestCancelledEvent,
  QuestCompleted as QuestCompletedEvent,
  QuestCreated as QuestCreatedEvent,
  QuestUpdated as QuestUpdatedEvent,
  RoleAdminChanged as RoleAdminChangedEvent,
  RoleGranted as RoleGrantedEvent,
  RoleRevoked as RoleRevokedEvent,
  Unpaused as UnpausedEvent,
} from '../generated/QuestBoard/QuestBoard';
import {
  User,
  Quest,
  QuestParticipant,
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

// Helper function to get or create platform stats
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
  } else if (action == 'QUEST_CREATED') {
    stats.totalQuests = stats.totalQuests.plus(BigInt.fromI32(1));
  }

  stats.save();
}

export function handleParticipantJoined(event: ParticipantJoinedEvent): void {
  // Get or create user
  let user = getOrCreateUser(event.params.participant);

  // Get quest
  let questId = changetype<Bytes>(Bytes.fromBigInt(event.params.questId));
  let quest = Quest.load(questId);
  if (quest == null) {
    // Quest should exist, but if not, skip this event
    return;
  }

  // Create QuestParticipant entity
  let participantId = changetype<Bytes>(
    questId.concat(event.params.participant)
  );
  let participant = new QuestParticipant(participantId);
  participant.quest = questId;
  participant.user = event.params.participant;
  participant.joinedAt = event.block.timestamp;
  participant.leftAt = null;
  participant.isActive = true;
  participant.joinTxHash = event.transaction.hash;
  participant.leftTxHash = null;
  participant.save();

  // Update quest participant count
  quest.participantCount = quest.participantCount.plus(BigInt.fromI32(1));
  quest.save();
}

export function handleParticipantLeft(event: ParticipantLeftEvent): void {
  let questId = changetype<Bytes>(Bytes.fromBigInt(event.params.questId));
  let participantId = changetype<Bytes>(
    questId.concat(event.params.participant)
  );
  let participant = QuestParticipant.load(participantId);

  if (participant != null) {
    participant.leftAt = event.block.timestamp;
    participant.isActive = false;
    participant.leftTxHash = event.transaction.hash;
    participant.save();

    // Update quest participant count
    let quest = Quest.load(questId);
    if (quest != null) {
      quest.participantCount = quest.participantCount.minus(BigInt.fromI32(1));
      quest.save();
    }
  }
}

export function handleQuestCreated(event: QuestCreatedEvent): void {
  // Get or create user
  let creator = getOrCreateUser(event.params.creator);

  // Create Quest entity
  let questId = changetype<Bytes>(Bytes.fromBigInt(event.params.questId));
  let quest = new Quest(questId);
  quest.questId = event.params.questId;
  quest.creator = event.params.creator;
  quest.title = event.params.title;
  quest.description = event.params.description;
  quest.metadataURI = event.params.metadataURI;
  // Convert questType enum from contract (0,1,2) to schema strings
  if (event.params.questType == 0) {
    quest.questType = 'INDIVIDUAL';
  } else if (event.params.questType == 1) {
    quest.questType = 'COLLABORATIVE';
  } else if (event.params.questType == 2) {
    quest.questType = 'COMPETITION';
  } else {
    quest.questType = 'INDIVIDUAL'; // default fallback
  }
  quest.bountyAmount = event.params.bountyAmount;
  quest.bountyToken = event.params.bountyToken;
  quest.maxParticipants = event.params.maxParticipants;
  quest.maxCollaborators = event.params.maxCollaborators;
  quest.submissionDeadline = event.params.submissionDeadline;
  quest.reviewDeadline = event.params.reviewDeadline;
  quest.requiresApproval = event.params.requiresApproval;
  quest.tags = event.params.tags;
  quest.skillsRequired = event.params.requirements.skillsRequired;
  quest.minReputation = event.params.requirements.minReputation;
  quest.kycRequired = event.params.requirements.kycRequired;
  quest.allowedFileTypes = event.params.requirements.allowedFileTypes;
  quest.maxFileSize = event.params.requirements.maxFileSize;
  quest.status = 'CREATED';

  // Timestamps
  quest.createdAt = event.block.timestamp;
  quest.updatedAt = null;
  quest.completedAt = null;
  quest.cancelledAt = null;

  // Computed fields
  quest.participantCount = BigInt.fromI32(0);
  quest.submissionCount = BigInt.fromI32(0);
  quest.isCompleted = false;
  quest.isCancelled = false;
  quest.winners = [];

  // Transaction info
  quest.creationTxHash = event.transaction.hash;
  quest.creationBlockNumber = event.block.number;

  quest.save();

  // Update creator stats
  creator.totalQuestsCreated = creator.totalQuestsCreated.plus(
    BigInt.fromI32(1)
  );
  creator.save();

  // Update platform stats
  updatePlatformStats('QUEST_CREATED');
}

export function handleQuestUpdated(event: QuestUpdatedEvent): void {
  let questId = changetype<Bytes>(Bytes.fromBigInt(event.params.questId));
  let quest = Quest.load(questId);

  if (quest != null) {
    quest.updatedAt = event.block.timestamp;

    // Update status based on the status parameter
    if (event.params.status == 0) {
      quest.status = 'CREATED';
    } else if (event.params.status == 1) {
      quest.status = 'ACTIVE';
    } else if (event.params.status == 2) {
      quest.status = 'COMPLETED';
    } else if (event.params.status == 3) {
      quest.status = 'CANCELLED';
    }

    quest.save();
  }
}

export function handleQuestCompleted(event: QuestCompletedEvent): void {
  let questId = changetype<Bytes>(Bytes.fromBigInt(event.params.questId));
  let quest = Quest.load(questId);

  if (quest != null) {
    quest.status = 'COMPLETED';
    quest.isCompleted = true;
    quest.completedAt = event.block.timestamp;
    quest.winners = changetype<Bytes[]>(event.params.winners);
    quest.save();
  }
}

export function handleQuestCancelled(event: QuestCancelledEvent): void {
  let questId = changetype<Bytes>(Bytes.fromBigInt(event.params.questId));
  let quest = Quest.load(questId);

  if (quest != null) {
    quest.status = 'CANCELLED';
    quest.isCancelled = true;
    quest.cancelledAt = event.block.timestamp;
    quest.save();
  }
}

export function handlePlatformFeeUpdated(event: PlatformFeeUpdatedEvent): void {
  let stats = getOrCreatePlatformStats();
  stats.platformFeePercentage = event.params.newFeePercentage;
  stats.save();
}

export function handlePlatformFeeRecipientUpdated(
  event: PlatformFeeRecipientUpdatedEvent
): void {
  let stats = getOrCreatePlatformStats();
  stats.platformFeeRecipient = event.params.newRecipient;
  stats.save();
}

// Handle role events with consolidated entity
export function handleRoleAdminChanged(event: RoleAdminChangedEvent): void {
  let entity = new RoleEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.contract = 'QuestBoard';
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
  entity.contract = 'QuestBoard';
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
  entity.contract = 'QuestBoard';
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
  entity.contract = 'QuestBoard';
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
  entity.contract = 'QuestBoard';
  entity.account = event.params.account;
  entity.isPaused = false;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}
