import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address, Bytes } from "@graphprotocol/graph-ts"
import {
  CollaborationRequestCreated,
  Paused,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  TeamCreated,
  TeamDisbanded,
  TeamInviteAccepted,
  TeamInviteRejected,
  TeamInviteSent,
  TeamMemberAdded,
  TeamMemberRemoved,
  Unpaused
} from "../generated/CollaborationManager/CollaborationManager"

export function createCollaborationRequestCreatedEvent(
  requestId: BigInt,
  questId: BigInt,
  requester: Address
): CollaborationRequestCreated {
  let collaborationRequestCreatedEvent =
    changetype<CollaborationRequestCreated>(newMockEvent())

  collaborationRequestCreatedEvent.parameters = new Array()

  collaborationRequestCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "requestId",
      ethereum.Value.fromUnsignedBigInt(requestId)
    )
  )
  collaborationRequestCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "questId",
      ethereum.Value.fromUnsignedBigInt(questId)
    )
  )
  collaborationRequestCreatedEvent.parameters.push(
    new ethereum.EventParam("requester", ethereum.Value.fromAddress(requester))
  )

  return collaborationRequestCreatedEvent
}

export function createPausedEvent(account: Address): Paused {
  let pausedEvent = changetype<Paused>(newMockEvent())

  pausedEvent.parameters = new Array()

  pausedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )

  return pausedEvent
}

export function createRoleAdminChangedEvent(
  role: Bytes,
  previousAdminRole: Bytes,
  newAdminRole: Bytes
): RoleAdminChanged {
  let roleAdminChangedEvent = changetype<RoleAdminChanged>(newMockEvent())

  roleAdminChangedEvent.parameters = new Array()

  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "previousAdminRole",
      ethereum.Value.fromFixedBytes(previousAdminRole)
    )
  )
  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "newAdminRole",
      ethereum.Value.fromFixedBytes(newAdminRole)
    )
  )

  return roleAdminChangedEvent
}

export function createRoleGrantedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): RoleGranted {
  let roleGrantedEvent = changetype<RoleGranted>(newMockEvent())

  roleGrantedEvent.parameters = new Array()

  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )

  return roleGrantedEvent
}

export function createRoleRevokedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): RoleRevoked {
  let roleRevokedEvent = changetype<RoleRevoked>(newMockEvent())

  roleRevokedEvent.parameters = new Array()

  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )

  return roleRevokedEvent
}

export function createTeamCreatedEvent(
  teamId: BigInt,
  questId: BigInt,
  leader: Address,
  name: string
): TeamCreated {
  let teamCreatedEvent = changetype<TeamCreated>(newMockEvent())

  teamCreatedEvent.parameters = new Array()

  teamCreatedEvent.parameters.push(
    new ethereum.EventParam("teamId", ethereum.Value.fromUnsignedBigInt(teamId))
  )
  teamCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "questId",
      ethereum.Value.fromUnsignedBigInt(questId)
    )
  )
  teamCreatedEvent.parameters.push(
    new ethereum.EventParam("leader", ethereum.Value.fromAddress(leader))
  )
  teamCreatedEvent.parameters.push(
    new ethereum.EventParam("name", ethereum.Value.fromString(name))
  )

  return teamCreatedEvent
}

export function createTeamDisbandedEvent(teamId: BigInt): TeamDisbanded {
  let teamDisbandedEvent = changetype<TeamDisbanded>(newMockEvent())

  teamDisbandedEvent.parameters = new Array()

  teamDisbandedEvent.parameters.push(
    new ethereum.EventParam("teamId", ethereum.Value.fromUnsignedBigInt(teamId))
  )

  return teamDisbandedEvent
}

export function createTeamInviteAcceptedEvent(
  teamId: BigInt,
  invitee: Address
): TeamInviteAccepted {
  let teamInviteAcceptedEvent = changetype<TeamInviteAccepted>(newMockEvent())

  teamInviteAcceptedEvent.parameters = new Array()

  teamInviteAcceptedEvent.parameters.push(
    new ethereum.EventParam("teamId", ethereum.Value.fromUnsignedBigInt(teamId))
  )
  teamInviteAcceptedEvent.parameters.push(
    new ethereum.EventParam("invitee", ethereum.Value.fromAddress(invitee))
  )

  return teamInviteAcceptedEvent
}

export function createTeamInviteRejectedEvent(
  teamId: BigInt,
  invitee: Address
): TeamInviteRejected {
  let teamInviteRejectedEvent = changetype<TeamInviteRejected>(newMockEvent())

  teamInviteRejectedEvent.parameters = new Array()

  teamInviteRejectedEvent.parameters.push(
    new ethereum.EventParam("teamId", ethereum.Value.fromUnsignedBigInt(teamId))
  )
  teamInviteRejectedEvent.parameters.push(
    new ethereum.EventParam("invitee", ethereum.Value.fromAddress(invitee))
  )

  return teamInviteRejectedEvent
}

export function createTeamInviteSentEvent(
  teamId: BigInt,
  invitee: Address,
  inviter: Address
): TeamInviteSent {
  let teamInviteSentEvent = changetype<TeamInviteSent>(newMockEvent())

  teamInviteSentEvent.parameters = new Array()

  teamInviteSentEvent.parameters.push(
    new ethereum.EventParam("teamId", ethereum.Value.fromUnsignedBigInt(teamId))
  )
  teamInviteSentEvent.parameters.push(
    new ethereum.EventParam("invitee", ethereum.Value.fromAddress(invitee))
  )
  teamInviteSentEvent.parameters.push(
    new ethereum.EventParam("inviter", ethereum.Value.fromAddress(inviter))
  )

  return teamInviteSentEvent
}

export function createTeamMemberAddedEvent(
  teamId: BigInt,
  member: Address
): TeamMemberAdded {
  let teamMemberAddedEvent = changetype<TeamMemberAdded>(newMockEvent())

  teamMemberAddedEvent.parameters = new Array()

  teamMemberAddedEvent.parameters.push(
    new ethereum.EventParam("teamId", ethereum.Value.fromUnsignedBigInt(teamId))
  )
  teamMemberAddedEvent.parameters.push(
    new ethereum.EventParam("member", ethereum.Value.fromAddress(member))
  )

  return teamMemberAddedEvent
}

export function createTeamMemberRemovedEvent(
  teamId: BigInt,
  member: Address
): TeamMemberRemoved {
  let teamMemberRemovedEvent = changetype<TeamMemberRemoved>(newMockEvent())

  teamMemberRemovedEvent.parameters = new Array()

  teamMemberRemovedEvent.parameters.push(
    new ethereum.EventParam("teamId", ethereum.Value.fromUnsignedBigInt(teamId))
  )
  teamMemberRemovedEvent.parameters.push(
    new ethereum.EventParam("member", ethereum.Value.fromAddress(member))
  )

  return teamMemberRemovedEvent
}

export function createUnpausedEvent(account: Address): Unpaused {
  let unpausedEvent = changetype<Unpaused>(newMockEvent())

  unpausedEvent.parameters = new Array()

  unpausedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )

  return unpausedEvent
}
