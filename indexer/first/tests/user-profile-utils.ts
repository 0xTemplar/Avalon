import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  AchievementEarned,
  ProfileCreated,
  ProfileUpdated,
  ReputationUpdated,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  SkillAdded,
  SkillRemoved
} from "../generated/UserProfile/UserProfile"

export function createAchievementEarnedEvent(
  user: Address,
  achievementId: BigInt
): AchievementEarned {
  let achievementEarnedEvent = changetype<AchievementEarned>(newMockEvent())

  achievementEarnedEvent.parameters = new Array()

  achievementEarnedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  achievementEarnedEvent.parameters.push(
    new ethereum.EventParam(
      "achievementId",
      ethereum.Value.fromUnsignedBigInt(achievementId)
    )
  )

  return achievementEarnedEvent
}

export function createProfileCreatedEvent(
  user: Address,
  username: string
): ProfileCreated {
  let profileCreatedEvent = changetype<ProfileCreated>(newMockEvent())

  profileCreatedEvent.parameters = new Array()

  profileCreatedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  profileCreatedEvent.parameters.push(
    new ethereum.EventParam("username", ethereum.Value.fromString(username))
  )

  return profileCreatedEvent
}

export function createProfileUpdatedEvent(user: Address): ProfileUpdated {
  let profileUpdatedEvent = changetype<ProfileUpdated>(newMockEvent())

  profileUpdatedEvent.parameters = new Array()

  profileUpdatedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )

  return profileUpdatedEvent
}

export function createReputationUpdatedEvent(
  user: Address,
  newReputation: BigInt,
  action: string
): ReputationUpdated {
  let reputationUpdatedEvent = changetype<ReputationUpdated>(newMockEvent())

  reputationUpdatedEvent.parameters = new Array()

  reputationUpdatedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  reputationUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "newReputation",
      ethereum.Value.fromUnsignedBigInt(newReputation)
    )
  )
  reputationUpdatedEvent.parameters.push(
    new ethereum.EventParam("action", ethereum.Value.fromString(action))
  )

  return reputationUpdatedEvent
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

export function createSkillAddedEvent(
  user: Address,
  skill: string
): SkillAdded {
  let skillAddedEvent = changetype<SkillAdded>(newMockEvent())

  skillAddedEvent.parameters = new Array()

  skillAddedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  skillAddedEvent.parameters.push(
    new ethereum.EventParam("skill", ethereum.Value.fromString(skill))
  )

  return skillAddedEvent
}

export function createSkillRemovedEvent(
  user: Address,
  skill: string
): SkillRemoved {
  let skillRemovedEvent = changetype<SkillRemoved>(newMockEvent())

  skillRemovedEvent.parameters = new Array()

  skillRemovedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  skillRemovedEvent.parameters.push(
    new ethereum.EventParam("skill", ethereum.Value.fromString(skill))
  )

  return skillRemovedEvent
}
