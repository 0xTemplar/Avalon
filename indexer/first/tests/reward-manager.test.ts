import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address, Bytes } from "@graphprotocol/graph-ts"
import { BountyEscrowed } from "../generated/schema"
import { BountyEscrowed as BountyEscrowedEvent } from "../generated/RewardManager/RewardManager"
import { handleBountyEscrowed } from "../src/reward-manager"
import { createBountyEscrowedEvent } from "./reward-manager-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#tests-structure

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let questId = BigInt.fromI32(234)
    let creator = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let amount = BigInt.fromI32(234)
    let token = Address.fromString("0x0000000000000000000000000000000000000001")
    let newBountyEscrowedEvent = createBountyEscrowedEvent(
      questId,
      creator,
      amount,
      token
    )
    handleBountyEscrowed(newBountyEscrowedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#write-a-unit-test

  test("BountyEscrowed created and stored", () => {
    assert.entityCount("BountyEscrowed", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "BountyEscrowed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "questId",
      "234"
    )
    assert.fieldEquals(
      "BountyEscrowed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "creator",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "BountyEscrowed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "amount",
      "234"
    )
    assert.fieldEquals(
      "BountyEscrowed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "token",
      "0x0000000000000000000000000000000000000001"
    )

    // More assert options:
    // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#asserts
  })
})
