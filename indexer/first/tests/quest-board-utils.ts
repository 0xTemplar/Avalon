import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address, Bytes } from "@graphprotocol/graph-ts"
import {
  ParticipantJoined,
  ParticipantLeft,
  Paused,
  PlatformFeeRecipientUpdated,
  PlatformFeeUpdated,
  QuestCancelled,
  QuestCompleted,
  QuestCreated,
  QuestUpdated,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  Unpaused
} from "../generated/QuestBoard/QuestBoard"

export function createParticipantJoinedEvent(
  questId: BigInt,
  participant: Address
): ParticipantJoined {
  let participantJoinedEvent = changetype<ParticipantJoined>(newMockEvent())

  participantJoinedEvent.parameters = new Array()

  participantJoinedEvent.parameters.push(
    new ethereum.EventParam(
      "questId",
      ethereum.Value.fromUnsignedBigInt(questId)
    )
  )
  participantJoinedEvent.parameters.push(
    new ethereum.EventParam(
      "participant",
      ethereum.Value.fromAddress(participant)
    )
  )

  return participantJoinedEvent
}

export function createParticipantLeftEvent(
  questId: BigInt,
  participant: Address
): ParticipantLeft {
  let participantLeftEvent = changetype<ParticipantLeft>(newMockEvent())

  participantLeftEvent.parameters = new Array()

  participantLeftEvent.parameters.push(
    new ethereum.EventParam(
      "questId",
      ethereum.Value.fromUnsignedBigInt(questId)
    )
  )
  participantLeftEvent.parameters.push(
    new ethereum.EventParam(
      "participant",
      ethereum.Value.fromAddress(participant)
    )
  )

  return participantLeftEvent
}

export function createPausedEvent(account: Address): Paused {
  let pausedEvent = changetype<Paused>(newMockEvent())

  pausedEvent.parameters = new Array()

  pausedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )

  return pausedEvent
}

export function createPlatformFeeRecipientUpdatedEvent(
  newRecipient: Address
): PlatformFeeRecipientUpdated {
  let platformFeeRecipientUpdatedEvent =
    changetype<PlatformFeeRecipientUpdated>(newMockEvent())

  platformFeeRecipientUpdatedEvent.parameters = new Array()

  platformFeeRecipientUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "newRecipient",
      ethereum.Value.fromAddress(newRecipient)
    )
  )

  return platformFeeRecipientUpdatedEvent
}

export function createPlatformFeeUpdatedEvent(
  newFeePercentage: BigInt
): PlatformFeeUpdated {
  let platformFeeUpdatedEvent = changetype<PlatformFeeUpdated>(newMockEvent())

  platformFeeUpdatedEvent.parameters = new Array()

  platformFeeUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "newFeePercentage",
      ethereum.Value.fromUnsignedBigInt(newFeePercentage)
    )
  )

  return platformFeeUpdatedEvent
}

export function createQuestCancelledEvent(
  questId: BigInt,
  reason: string
): QuestCancelled {
  let questCancelledEvent = changetype<QuestCancelled>(newMockEvent())

  questCancelledEvent.parameters = new Array()

  questCancelledEvent.parameters.push(
    new ethereum.EventParam(
      "questId",
      ethereum.Value.fromUnsignedBigInt(questId)
    )
  )
  questCancelledEvent.parameters.push(
    new ethereum.EventParam("reason", ethereum.Value.fromString(reason))
  )

  return questCancelledEvent
}

export function createQuestCompletedEvent(
  questId: BigInt,
  winners: Array<Address>
): QuestCompleted {
  let questCompletedEvent = changetype<QuestCompleted>(newMockEvent())

  questCompletedEvent.parameters = new Array()

  questCompletedEvent.parameters.push(
    new ethereum.EventParam(
      "questId",
      ethereum.Value.fromUnsignedBigInt(questId)
    )
  )
  questCompletedEvent.parameters.push(
    new ethereum.EventParam("winners", ethereum.Value.fromAddressArray(winners))
  )

  return questCompletedEvent
}

export function createQuestCreatedEvent(
  questId: BigInt,
  creator: Address,
  title: string,
  bountyAmount: BigInt,
  bountyToken: Address
): QuestCreated {
  let questCreatedEvent = changetype<QuestCreated>(newMockEvent())

  questCreatedEvent.parameters = new Array()

  questCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "questId",
      ethereum.Value.fromUnsignedBigInt(questId)
    )
  )
  questCreatedEvent.parameters.push(
    new ethereum.EventParam("creator", ethereum.Value.fromAddress(creator))
  )
  questCreatedEvent.parameters.push(
    new ethereum.EventParam("title", ethereum.Value.fromString(title))
  )
  questCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "bountyAmount",
      ethereum.Value.fromUnsignedBigInt(bountyAmount)
    )
  )
  questCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "bountyToken",
      ethereum.Value.fromAddress(bountyToken)
    )
  )

  return questCreatedEvent
}

export function createQuestUpdatedEvent(
  questId: BigInt,
  status: i32
): QuestUpdated {
  let questUpdatedEvent = changetype<QuestUpdated>(newMockEvent())

  questUpdatedEvent.parameters = new Array()

  questUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "questId",
      ethereum.Value.fromUnsignedBigInt(questId)
    )
  )
  questUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "status",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(status))
    )
  )

  return questUpdatedEvent
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

export function createUnpausedEvent(account: Address): Unpaused {
  let unpausedEvent = changetype<Unpaused>(newMockEvent())

  unpausedEvent.parameters = new Array()

  unpausedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )

  return unpausedEvent
}
