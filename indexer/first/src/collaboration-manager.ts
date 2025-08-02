import {
  CollaborationRequestCreated as CollaborationRequestCreatedEvent,
  Paused as PausedEvent,
  RoleAdminChanged as RoleAdminChangedEvent,
  RoleGranted as RoleGrantedEvent,
  RoleRevoked as RoleRevokedEvent,
  TeamCreated as TeamCreatedEvent,
  TeamDisbanded as TeamDisbandedEvent,
  TeamInviteAccepted as TeamInviteAcceptedEvent,
  TeamInviteRejected as TeamInviteRejectedEvent,
  TeamInviteSent as TeamInviteSentEvent,
  TeamMemberAdded as TeamMemberAddedEvent,
  TeamMemberRemoved as TeamMemberRemovedEvent,
  Unpaused as UnpausedEvent,
} from '../generated/CollaborationManager/CollaborationManager';
import {
  User,
  Quest,
  Team,
  TeamMember,
  TeamInvite,
  CollaborationRequest,
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

export function handleCollaborationRequestCreated(
  event: CollaborationRequestCreatedEvent
): void {
  // Get or create user
  let requester = getOrCreateUser(event.params.requester);

  // Get quest
  let questId = changetype<Bytes>(Bytes.fromBigInt(event.params.questId));
  let quest = Quest.load(questId);
  if (quest == null) {
    // Quest should exist, but if not, skip this event
    return;
  }

  // Create CollaborationRequest entity
  let requestId = changetype<Bytes>(Bytes.fromBigInt(event.params.requestId));
  let request = new CollaborationRequest(requestId);
  request.requestId = event.params.requestId;
  request.quest = questId;
  request.requester = event.params.requester;
  request.createdAt = event.block.timestamp;
  request.txHash = event.transaction.hash;
  request.save();
}

export function handleTeamCreated(event: TeamCreatedEvent): void {
  // Get or create users
  let leader = getOrCreateUser(event.params.leader);

  // Get quest
  let questId = changetype<Bytes>(Bytes.fromBigInt(event.params.questId));
  let quest = Quest.load(questId);
  if (quest == null) {
    // Quest should exist, but if not, skip this event
    return;
  }

  // Create Team entity
  let teamId = changetype<Bytes>(Bytes.fromBigInt(event.params.teamId));
  let team = new Team(teamId);
  team.teamId = event.params.teamId;
  team.quest = questId;
  team.leader = event.params.leader;
  team.name = event.params.name;
  team.isActive = true;
  team.createdAt = event.block.timestamp;
  team.disbandedAt = null;
  team.memberCount = BigInt.fromI32(1); // Leader is first member
  team.creationTxHash = event.transaction.hash;
  team.save();

  // Create TeamMember entity for the leader
  let leaderMemberId = changetype<Bytes>(teamId.concat(event.params.leader));
  let leaderMember = new TeamMember(leaderMemberId);
  leaderMember.team = teamId;
  leaderMember.user = event.params.leader;
  leaderMember.joinedAt = event.block.timestamp;
  leaderMember.removedAt = null;
  leaderMember.isActive = true;
  leaderMember.joinTxHash = event.transaction.hash;
  leaderMember.removeTxHash = null;
  leaderMember.save();
}

export function handleTeamDisbanded(event: TeamDisbandedEvent): void {
  let teamId = changetype<Bytes>(Bytes.fromBigInt(event.params.teamId));
  let team = Team.load(teamId);

  if (team != null) {
    team.isActive = false;
    team.disbandedAt = event.block.timestamp;
    team.save();

    // Mark all team members as inactive
    // Note: In a real implementation, you might want to query for all team members
    // and update them, but for now we'll just update the team status
  }
}

export function handleTeamInviteSent(event: TeamInviteSentEvent): void {
  // Get or create users
  let invitee = getOrCreateUser(event.params.invitee);
  let inviter = getOrCreateUser(event.params.inviter);

  // Get team
  let teamId = changetype<Bytes>(Bytes.fromBigInt(event.params.teamId));
  let team = Team.load(teamId);
  if (team == null) {
    // Team should exist, but if not, skip this event
    return;
  }

  // Create TeamInvite entity
  let inviteId = changetype<Bytes>(teamId.concat(event.params.invitee));
  let invite = new TeamInvite(inviteId);
  invite.team = teamId;
  invite.invitee = event.params.invitee;
  invite.inviter = event.params.inviter;
  invite.status = 'PENDING';
  invite.sentAt = event.block.timestamp;
  invite.respondedAt = null;
  invite.sentTxHash = event.transaction.hash;
  invite.responseTxHash = null;
  invite.save();
}

export function handleTeamInviteAccepted(event: TeamInviteAcceptedEvent): void {
  // Get or create user
  let invitee = getOrCreateUser(event.params.invitee);

  // Update TeamInvite entity
  let teamId = changetype<Bytes>(Bytes.fromBigInt(event.params.teamId));
  let inviteId = changetype<Bytes>(teamId.concat(event.params.invitee));
  let invite = TeamInvite.load(inviteId);

  if (invite != null) {
    invite.status = 'ACCEPTED';
    invite.respondedAt = event.block.timestamp;
    invite.responseTxHash = event.transaction.hash;
    invite.save();
  }

  // Create TeamMember entity
  let memberId = changetype<Bytes>(teamId.concat(event.params.invitee));
  let member = new TeamMember(memberId);
  member.team = teamId;
  member.user = event.params.invitee;
  member.joinedAt = event.block.timestamp;
  member.removedAt = null;
  member.isActive = true;
  member.joinTxHash = event.transaction.hash;
  member.removeTxHash = null;
  member.save();

  // Update team member count
  let team = Team.load(teamId);
  if (team != null) {
    team.memberCount = team.memberCount.plus(BigInt.fromI32(1));
    team.save();
  }
}

export function handleTeamInviteRejected(event: TeamInviteRejectedEvent): void {
  // Get or create user
  let invitee = getOrCreateUser(event.params.invitee);

  // Update TeamInvite entity
  let teamId = changetype<Bytes>(Bytes.fromBigInt(event.params.teamId));
  let inviteId = changetype<Bytes>(teamId.concat(event.params.invitee));
  let invite = TeamInvite.load(inviteId);

  if (invite != null) {
    invite.status = 'REJECTED';
    invite.respondedAt = event.block.timestamp;
    invite.responseTxHash = event.transaction.hash;
    invite.save();
  }
}

export function handleTeamMemberAdded(event: TeamMemberAddedEvent): void {
  let member = getOrCreateUser(event.params.member);

  let teamId = changetype<Bytes>(Bytes.fromBigInt(event.params.teamId));
  let memberId = changetype<Bytes>(teamId.concat(event.params.member));
  let teamMember = new TeamMember(memberId);
  teamMember.team = teamId;
  teamMember.user = event.params.member;
  teamMember.joinedAt = event.block.timestamp;
  teamMember.removedAt = null;
  teamMember.isActive = true;
  teamMember.joinTxHash = event.transaction.hash;
  teamMember.removeTxHash = null;
  teamMember.save();

  // Update team member count
  let team = Team.load(teamId);
  if (team != null) {
    team.memberCount = team.memberCount.plus(BigInt.fromI32(1));
    team.save();
  }
}

export function handleTeamMemberRemoved(event: TeamMemberRemovedEvent): void {
  // Get or create user
  let member = getOrCreateUser(event.params.member);

  // Update TeamMember entity
  let teamId = changetype<Bytes>(Bytes.fromBigInt(event.params.teamId));
  let memberId = changetype<Bytes>(teamId.concat(event.params.member));
  let teamMember = TeamMember.load(memberId);

  if (teamMember != null) {
    teamMember.removedAt = event.block.timestamp;
    teamMember.isActive = false;
    teamMember.removeTxHash = event.transaction.hash;
    teamMember.save();

    // Update team member count
    let team = Team.load(teamId);
    if (team != null) {
      team.memberCount = team.memberCount.minus(BigInt.fromI32(1));
      team.save();
    }
  }
}

// Handle role events with consolidated entity
export function handleRoleAdminChanged(event: RoleAdminChangedEvent): void {
  let entity = new RoleEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.contract = 'CollaborationManager';
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
  entity.contract = 'CollaborationManager';
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
  entity.contract = 'CollaborationManager';
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
  entity.contract = 'CollaborationManager';
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
  entity.contract = 'CollaborationManager';
  entity.account = event.params.account;
  entity.isPaused = false;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}
