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
  Unpaused as UnpausedEvent
} from "../generated/QuestBoard/QuestBoard"
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
} from "../generated/schema"
import { Bytes } from "@graphprotocol/graph-ts"

export function handleParticipantJoined(event: ParticipantJoinedEvent): void {
  let entity = new ParticipantJoined(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.questId = event.params.questId
  entity.participant = event.params.participant

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleParticipantLeft(event: ParticipantLeftEvent): void {
  let entity = new ParticipantLeft(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.questId = event.params.questId
  entity.participant = event.params.participant

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePaused(event: PausedEvent): void {
  let entity = new Paused(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.account = event.params.account

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePlatformFeeRecipientUpdated(
  event: PlatformFeeRecipientUpdatedEvent
): void {
  let entity = new PlatformFeeRecipientUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.newRecipient = event.params.newRecipient

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePlatformFeeUpdated(event: PlatformFeeUpdatedEvent): void {
  let entity = new PlatformFeeUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.newFeePercentage = event.params.newFeePercentage

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleQuestCancelled(event: QuestCancelledEvent): void {
  let entity = new QuestCancelled(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.questId = event.params.questId
  entity.reason = event.params.reason

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleQuestCompleted(event: QuestCompletedEvent): void {
  let entity = new QuestCompleted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.questId = event.params.questId
  entity.winners = changetype<Bytes[]>(event.params.winners)

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleQuestCreated(event: QuestCreatedEvent): void {
  let entity = new QuestCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.questId = event.params.questId
  entity.creator = event.params.creator
  entity.title = event.params.title
  entity.bountyAmount = event.params.bountyAmount
  entity.bountyToken = event.params.bountyToken

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleQuestUpdated(event: QuestUpdatedEvent): void {
  let entity = new QuestUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.questId = event.params.questId
  entity.status = event.params.status

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleAdminChanged(event: RoleAdminChangedEvent): void {
  let entity = new RoleAdminChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.role = event.params.role
  entity.previousAdminRole = event.params.previousAdminRole
  entity.newAdminRole = event.params.newAdminRole

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleGranted(event: RoleGrantedEvent): void {
  let entity = new RoleGranted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.role = event.params.role
  entity.account = event.params.account
  entity.sender = event.params.sender

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleRevoked(event: RoleRevokedEvent): void {
  let entity = new RoleRevoked(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.role = event.params.role
  entity.account = event.params.account
  entity.sender = event.params.sender

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleUnpaused(event: UnpausedEvent): void {
  let entity = new Unpaused(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.account = event.params.account

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
