import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address, Bytes } from "@graphprotocol/graph-ts"
import { CollaborationRequestCreated } from "../generated/schema"
import { CollaborationRequestCreated as CollaborationRequestCreatedEvent } from "../generated/CollaborationManager/CollaborationManager"
import { handleCollaborationRequestCreated } from "../src/collaboration-manager"
import { createCollaborationRequestCreatedEvent } from "./collaboration-manager-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#tests-structure

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let requestId = BigInt.fromI32(234)
    let questId = BigInt.fromI32(234)
    let requester = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let newCollaborationRequestCreatedEvent =
      createCollaborationRequestCreatedEvent(requestId, questId, requester)
    handleCollaborationRequestCreated(newCollaborationRequestCreatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#write-a-unit-test

  test("CollaborationRequestCreated created and stored", () => {
    assert.entityCount("CollaborationRequestCreated", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "CollaborationRequestCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "requestId",
      "234"
    )
    assert.fieldEquals(
      "CollaborationRequestCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "questId",
      "234"
    )
    assert.fieldEquals(
      "CollaborationRequestCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "requester",
      "0x0000000000000000000000000000000000000001"
    )

    // More assert options:
    // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#asserts
  })
})
