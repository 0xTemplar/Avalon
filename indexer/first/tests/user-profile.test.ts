import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import { AchievementEarned } from "../generated/schema"
import { AchievementEarned as AchievementEarnedEvent } from "../generated/UserProfile/UserProfile"
import { handleAchievementEarned } from "../src/user-profile"
import { createAchievementEarnedEvent } from "./user-profile-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#tests-structure

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let user = Address.fromString("0x0000000000000000000000000000000000000001")
    let achievementId = BigInt.fromI32(234)
    let newAchievementEarnedEvent = createAchievementEarnedEvent(
      user,
      achievementId
    )
    handleAchievementEarned(newAchievementEarnedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#write-a-unit-test

  test("AchievementEarned created and stored", () => {
    assert.entityCount("AchievementEarned", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "AchievementEarned",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "user",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "AchievementEarned",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "achievementId",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#asserts
  })
})
