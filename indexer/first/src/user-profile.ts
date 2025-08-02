import {
  AchievementEarned as AchievementEarnedEvent,
  ProfileCreated as ProfileCreatedEvent,
  ProfileUpdated as ProfileUpdatedEvent,
  ReputationUpdated as ReputationUpdatedEvent,
  RoleAdminChanged as RoleAdminChangedEvent,
  RoleGranted as RoleGrantedEvent,
  RoleRevoked as RoleRevokedEvent,
  SkillAdded as SkillAddedEvent,
  SkillRemoved as SkillRemovedEvent,
} from '../generated/UserProfile/UserProfile';
import {
  User,
  UserAchievement,
  PlatformStats,
  RoleEvent,
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

export function handleProfileCreated(event: ProfileCreatedEvent): void {
  // Get or create user
  let user = getOrCreateUser(event.params.user);

  // Update user profile info
  user.username = event.params.username;
  user.profileCreatedAt = event.block.timestamp;
  user.profileUpdatedAt = event.block.timestamp;
  user.save();
}

export function handleProfileUpdated(event: ProfileUpdatedEvent): void {
  // Get or create user
  let user = getOrCreateUser(event.params.user);

  // Update profile timestamp
  user.profileUpdatedAt = event.block.timestamp;
  user.save();
}

export function handleReputationUpdated(event: ReputationUpdatedEvent): void {
  // Get or create user
  let user = getOrCreateUser(event.params.user);

  // Update reputation
  user.reputation = event.params.newReputation;
  user.save();
}

export function handleSkillAdded(event: SkillAddedEvent): void {
  // Get or create user
  let user = getOrCreateUser(event.params.user);

  // Add skill to user's skills array if not already present
  let skills = user.skills;
  let skillExists = false;

  for (let i = 0; i < skills.length; i++) {
    if (skills[i] == event.params.skill) {
      skillExists = true;
      break;
    }
  }

  if (!skillExists) {
    skills.push(event.params.skill);
    user.skills = skills;
    user.save();
  }
}

export function handleSkillRemoved(event: SkillRemovedEvent): void {
  // Get or create user
  let user = getOrCreateUser(event.params.user);

  // Remove skill from user's skills array
  let skills = user.skills;
  let newSkills: string[] = [];

  for (let i = 0; i < skills.length; i++) {
    if (skills[i] != event.params.skill) {
      newSkills.push(skills[i]);
    }
  }

  user.skills = newSkills;
  user.save();
}

export function handleAchievementEarned(event: AchievementEarnedEvent): void {
  // Get or create user
  let user = getOrCreateUser(event.params.user);

  // Create UserAchievement entity
  let achievementId = changetype<Bytes>(
    event.params.user.concat(
      changetype<Bytes>(Bytes.fromBigInt(event.params.achievementId))
    )
  );
  let achievement = new UserAchievement(achievementId);
  achievement.user = event.params.user;
  achievement.achievementId = event.params.achievementId;
  achievement.earnedAt = event.block.timestamp;
  achievement.txHash = event.transaction.hash;
  achievement.save();
}

// Handle role events with consolidated entity
export function handleRoleAdminChanged(event: RoleAdminChangedEvent): void {
  let entity = new RoleEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.contract = 'UserProfile';
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
  entity.contract = 'UserProfile';
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
  entity.contract = 'UserProfile';
  entity.role = event.params.role;
  entity.account = event.params.account;
  entity.eventType = 'REVOKED';
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}
