import { newMockEvent } from "matchstick-as"
import { ethereum, Address, Bytes, BigInt } from "@graphprotocol/graph-ts"
import {
  Paused,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  SubmissionCommented,
  SubmissionCreated,
  SubmissionLiked,
  SubmissionReviewed,
  SubmissionUpdated,
  Unpaused,
  WinnerSelected
} from "../generated/SubmissionManager/SubmissionManager"

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

export function createSubmissionCommentedEvent(
  submissionId: BigInt,
  commenter: Address
): SubmissionCommented {
  let submissionCommentedEvent = changetype<SubmissionCommented>(newMockEvent())

  submissionCommentedEvent.parameters = new Array()

  submissionCommentedEvent.parameters.push(
    new ethereum.EventParam(
      "submissionId",
      ethereum.Value.fromUnsignedBigInt(submissionId)
    )
  )
  submissionCommentedEvent.parameters.push(
    new ethereum.EventParam("commenter", ethereum.Value.fromAddress(commenter))
  )

  return submissionCommentedEvent
}

export function createSubmissionCreatedEvent(
  submissionId: BigInt,
  questId: BigInt,
  submitter: Address,
  isTeamSubmission: boolean
): SubmissionCreated {
  let submissionCreatedEvent = changetype<SubmissionCreated>(newMockEvent())

  submissionCreatedEvent.parameters = new Array()

  submissionCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "submissionId",
      ethereum.Value.fromUnsignedBigInt(submissionId)
    )
  )
  submissionCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "questId",
      ethereum.Value.fromUnsignedBigInt(questId)
    )
  )
  submissionCreatedEvent.parameters.push(
    new ethereum.EventParam("submitter", ethereum.Value.fromAddress(submitter))
  )
  submissionCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "isTeamSubmission",
      ethereum.Value.fromBoolean(isTeamSubmission)
    )
  )

  return submissionCreatedEvent
}

export function createSubmissionLikedEvent(
  submissionId: BigInt,
  user: Address
): SubmissionLiked {
  let submissionLikedEvent = changetype<SubmissionLiked>(newMockEvent())

  submissionLikedEvent.parameters = new Array()

  submissionLikedEvent.parameters.push(
    new ethereum.EventParam(
      "submissionId",
      ethereum.Value.fromUnsignedBigInt(submissionId)
    )
  )
  submissionLikedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )

  return submissionLikedEvent
}

export function createSubmissionReviewedEvent(
  submissionId: BigInt,
  reviewer: Address,
  score: BigInt,
  approved: boolean
): SubmissionReviewed {
  let submissionReviewedEvent = changetype<SubmissionReviewed>(newMockEvent())

  submissionReviewedEvent.parameters = new Array()

  submissionReviewedEvent.parameters.push(
    new ethereum.EventParam(
      "submissionId",
      ethereum.Value.fromUnsignedBigInt(submissionId)
    )
  )
  submissionReviewedEvent.parameters.push(
    new ethereum.EventParam("reviewer", ethereum.Value.fromAddress(reviewer))
  )
  submissionReviewedEvent.parameters.push(
    new ethereum.EventParam("score", ethereum.Value.fromUnsignedBigInt(score))
  )
  submissionReviewedEvent.parameters.push(
    new ethereum.EventParam("approved", ethereum.Value.fromBoolean(approved))
  )

  return submissionReviewedEvent
}

export function createSubmissionUpdatedEvent(
  submissionId: BigInt,
  status: i32
): SubmissionUpdated {
  let submissionUpdatedEvent = changetype<SubmissionUpdated>(newMockEvent())

  submissionUpdatedEvent.parameters = new Array()

  submissionUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "submissionId",
      ethereum.Value.fromUnsignedBigInt(submissionId)
    )
  )
  submissionUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "status",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(status))
    )
  )

  return submissionUpdatedEvent
}

export function createUnpausedEvent(account: Address): Unpaused {
  let unpausedEvent = changetype<Unpaused>(newMockEvent())

  unpausedEvent.parameters = new Array()

  unpausedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )

  return unpausedEvent
}

export function createWinnerSelectedEvent(
  questId: BigInt,
  submissionId: BigInt
): WinnerSelected {
  let winnerSelectedEvent = changetype<WinnerSelected>(newMockEvent())

  winnerSelectedEvent.parameters = new Array()

  winnerSelectedEvent.parameters.push(
    new ethereum.EventParam(
      "questId",
      ethereum.Value.fromUnsignedBigInt(questId)
    )
  )
  winnerSelectedEvent.parameters.push(
    new ethereum.EventParam(
      "submissionId",
      ethereum.Value.fromUnsignedBigInt(submissionId)
    )
  )

  return winnerSelectedEvent
}
