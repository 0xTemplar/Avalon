import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address, Bytes } from "@graphprotocol/graph-ts"
import { ParticipantJoined } from "../generated/schema"
import { ParticipantJoined as ParticipantJoinedEvent } from "../generated/QuestBoard/QuestBoard"
import { handleParticipantJoined } from "../src/quest-board"
import { createParticipantJoinedEvent } from "./quest-board-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#tests-structure

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let questId = BigInt.fromI32(234)
    let participant = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let newParticipantJoinedEvent = createParticipantJoinedEvent(
      questId,
      participant
    )
    handleParticipantJoined(newParticipantJoinedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#write-a-unit-test

  test("ParticipantJoined created and stored", () => {
    assert.entityCount("ParticipantJoined", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "ParticipantJoined",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "questId",
      "234"
    )
    assert.fieldEquals(
      "ParticipantJoined",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "participant",
      "0x0000000000000000000000000000000000000001"
    )

    // More assert options:
    // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#asserts
  })
})
