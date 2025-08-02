import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address, Bytes } from "@graphprotocol/graph-ts"
import {
  BountyEscrowed,
  BountyRefunded,
  EmergencyWithdraw,
  Paused,
  PaymentSplitUpdated,
  RewardDistributed,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  Unpaused
} from "../generated/RewardManager/RewardManager"

export function createBountyEscrowedEvent(
  questId: BigInt,
  creator: Address,
  amount: BigInt,
  token: Address
): BountyEscrowed {
  let bountyEscrowedEvent = changetype<BountyEscrowed>(newMockEvent())

  bountyEscrowedEvent.parameters = new Array()

  bountyEscrowedEvent.parameters.push(
    new ethereum.EventParam(
      "questId",
      ethereum.Value.fromUnsignedBigInt(questId)
    )
  )
  bountyEscrowedEvent.parameters.push(
    new ethereum.EventParam("creator", ethereum.Value.fromAddress(creator))
  )
  bountyEscrowedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )
  bountyEscrowedEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )

  return bountyEscrowedEvent
}

export function createBountyRefundedEvent(
  questId: BigInt,
  creator: Address,
  amount: BigInt
): BountyRefunded {
  let bountyRefundedEvent = changetype<BountyRefunded>(newMockEvent())

  bountyRefundedEvent.parameters = new Array()

  bountyRefundedEvent.parameters.push(
    new ethereum.EventParam(
      "questId",
      ethereum.Value.fromUnsignedBigInt(questId)
    )
  )
  bountyRefundedEvent.parameters.push(
    new ethereum.EventParam("creator", ethereum.Value.fromAddress(creator))
  )
  bountyRefundedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return bountyRefundedEvent
}

export function createEmergencyWithdrawEvent(
  token: Address,
  amount: BigInt,
  recipient: Address
): EmergencyWithdraw {
  let emergencyWithdrawEvent = changetype<EmergencyWithdraw>(newMockEvent())

  emergencyWithdrawEvent.parameters = new Array()

  emergencyWithdrawEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  emergencyWithdrawEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )
  emergencyWithdrawEvent.parameters.push(
    new ethereum.EventParam("recipient", ethereum.Value.fromAddress(recipient))
  )

  return emergencyWithdrawEvent
}

export function createPausedEvent(account: Address): Paused {
  let pausedEvent = changetype<Paused>(newMockEvent())

  pausedEvent.parameters = new Array()

  pausedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )

  return pausedEvent
}

export function createPaymentSplitUpdatedEvent(
  questId: BigInt,
  splits: Array<ethereum.Tuple>
): PaymentSplitUpdated {
  let paymentSplitUpdatedEvent = changetype<PaymentSplitUpdated>(newMockEvent())

  paymentSplitUpdatedEvent.parameters = new Array()

  paymentSplitUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "questId",
      ethereum.Value.fromUnsignedBigInt(questId)
    )
  )
  paymentSplitUpdatedEvent.parameters.push(
    new ethereum.EventParam("splits", ethereum.Value.fromTupleArray(splits))
  )

  return paymentSplitUpdatedEvent
}

export function createRewardDistributedEvent(
  rewardId: BigInt,
  questId: BigInt,
  recipient: Address,
  amount: BigInt,
  token: Address,
  rewardType: i32
): RewardDistributed {
  let rewardDistributedEvent = changetype<RewardDistributed>(newMockEvent())

  rewardDistributedEvent.parameters = new Array()

  rewardDistributedEvent.parameters.push(
    new ethereum.EventParam(
      "rewardId",
      ethereum.Value.fromUnsignedBigInt(rewardId)
    )
  )
  rewardDistributedEvent.parameters.push(
    new ethereum.EventParam(
      "questId",
      ethereum.Value.fromUnsignedBigInt(questId)
    )
  )
  rewardDistributedEvent.parameters.push(
    new ethereum.EventParam("recipient", ethereum.Value.fromAddress(recipient))
  )
  rewardDistributedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )
  rewardDistributedEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  rewardDistributedEvent.parameters.push(
    new ethereum.EventParam(
      "rewardType",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(rewardType))
    )
  )

  return rewardDistributedEvent
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
