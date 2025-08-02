import {
  BountyEscrowed as BountyEscrowedEvent,
  BountyRefunded as BountyRefundedEvent,
  EmergencyWithdraw as EmergencyWithdrawEvent,
  Paused as PausedEvent,
  PaymentSplitUpdated as PaymentSplitUpdatedEvent,
  RewardDistributed as RewardDistributedEvent,
  RoleAdminChanged as RoleAdminChangedEvent,
  RoleGranted as RoleGrantedEvent,
  RoleRevoked as RoleRevokedEvent,
  Unpaused as UnpausedEvent,
} from '../generated/RewardManager/RewardManager';
import {
  User,
  Quest,
  Reward,
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
  }

  stats.save();
}

export function handleRewardDistributed(event: RewardDistributedEvent): void {
  // Get or create user
  let recipient = getOrCreateUser(event.params.recipient);

  // Get quest
  let questId = changetype<Bytes>(Bytes.fromBigInt(event.params.questId));
  let quest = Quest.load(questId);
  if (quest == null) {
    // Quest should exist, but if not, skip this event
    return;
  }

  // Create Reward entity
  let rewardId = changetype<Bytes>(Bytes.fromBigInt(event.params.rewardId));
  let reward = new Reward(rewardId);
  reward.rewardId = event.params.rewardId;
  reward.quest = questId;
  reward.recipient = event.params.recipient;
  reward.amount = event.params.amount;
  reward.token = event.params.token;

  // Map reward type from uint8 to enum
  if (event.params.rewardType == 0) {
    reward.rewardType = 'WINNER_REWARD';
  } else if (event.params.rewardType == 1) {
    reward.rewardType = 'PARTICIPATION_REWARD';
  } else if (event.params.rewardType == 2) {
    reward.rewardType = 'BONUS_REWARD';
  } else if (event.params.rewardType == 3) {
    reward.rewardType = 'PLATFORM_FEE';
  } else {
    reward.rewardType = 'WINNER_REWARD'; // default
  }

  // Timestamps
  reward.distributedAt = event.block.timestamp;

  // Transaction info
  reward.txHash = event.transaction.hash;
  reward.blockNumber = event.block.number;

  reward.save();

  // Update recipient stats (only for non-platform-fee rewards)
  if (reward.rewardType != 'PLATFORM_FEE') {
    recipient.totalRewardsEarned = recipient.totalRewardsEarned.plus(
      event.params.amount
    );
    recipient.save();
  }

  // Update platform stats
  let stats = getOrCreatePlatformStats();
  stats.totalRewardsDistributed = stats.totalRewardsDistributed.plus(
    event.params.amount
  );
  stats.save();
}

export function handleBountyEscrowed(event: BountyEscrowedEvent): void {
  // Update platform stats - add to total value locked
  let stats = getOrCreatePlatformStats();
  stats.totalValueLocked = stats.totalValueLocked.plus(event.params.amount);
  stats.save();

  // Get or create creator user
  let creator = getOrCreateUser(event.params.creator);
}

export function handleBountyRefunded(event: BountyRefundedEvent): void {
  // Update platform stats - remove from total value locked
  let stats = getOrCreatePlatformStats();
  stats.totalValueLocked = stats.totalValueLocked.minus(event.params.amount);
  stats.save();

  // Get or create creator user
  let creator = getOrCreateUser(event.params.creator);
}

export function handleEmergencyWithdraw(event: EmergencyWithdrawEvent): void {
  // Get or create recipient user
  let recipient = getOrCreateUser(event.params.recipient);

  // Update platform stats - remove from total value locked
  let stats = getOrCreatePlatformStats();
  stats.totalValueLocked = stats.totalValueLocked.minus(event.params.amount);
  stats.save();
}

export function handlePaymentSplitUpdated(
  event: PaymentSplitUpdatedEvent
): void {
  // This event indicates that payment splits for a quest have been updated
  // We could store this information if needed, but for now we'll just acknowledge it
  let questId = changetype<Bytes>(Bytes.fromBigInt(event.params.questId));
  let quest = Quest.load(questId);

  if (quest != null) {
    quest.updatedAt = event.block.timestamp;
    quest.save();
  }
}

// Handle role events with consolidated entity
export function handleRoleAdminChanged(event: RoleAdminChangedEvent): void {
  let entity = new RoleEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.contract = 'RewardManager';
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
  entity.contract = 'RewardManager';
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
  entity.contract = 'RewardManager';
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
  entity.contract = 'RewardManager';
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
  entity.contract = 'RewardManager';
  entity.account = event.params.account;
  entity.isPaused = false;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}
