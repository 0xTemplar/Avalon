# Aryza Subgraph API Documentation

## 🔗 Endpoint

```
https://api.studio.thegraph.com/query/117682/first/v0.0.3
```

## 📖 Overview

This subgraph indexes data from the Aryza platform, which includes 5 smart contracts:

- **QuestBoard**: Quest creation and management
- **SubmissionManager**: Submission handling and reviews
- **RewardManager**: Reward distribution
- **UserProfile**: User profiles and achievements
- **CollaborationManager**: Team formation and collaboration

## 🏗️ Schema Entities

### 👤 Core User Entity

#### `User`

Represents platform users with their profiles and statistics.

**Fields:**

- `id: Bytes!` - User's wallet address
- `username: String` - Display name
- `profileCreatedAt: BigInt` - Profile creation timestamp
- `profileUpdatedAt: BigInt` - Last profile update
- `reputation: BigInt!` - User reputation score
- `skills: [String!]!` - Array of user skills
- `totalQuestsCreated: BigInt!` - Number of quests created
- `totalQuestsCompleted: BigInt!` - Number of quests completed
- `totalRewardsEarned: BigInt!` - Total rewards earned
- `totalSubmissions: BigInt!` - Total submissions made

**Relationships:**

- `createdQuests: [Quest!]!` - Quests created by user
- `questParticipations: [QuestParticipant!]!` - Quest participations
- `submissions: [Submission!]!` - Submissions made
- `rewards: [Reward!]!` - Rewards received
- `teamMemberships: [TeamMember!]!` - Team memberships
- `achievementsEarned: [UserAchievement!]!` - Achievements earned

### 🎯 Quest Entities

#### `Quest`

Main quest entity with comprehensive quest information.

**Fields:**

- `id: Bytes!` - Quest ID as Bytes
- `questId: BigInt!` - Original quest ID as BigInt
- `creator: User!` - Quest creator
- `title: String!` - Quest title
- `description: String` - Quest description
- `bountyAmount: BigInt!` - Bounty amount
- `bountyToken: Bytes!` - Token address
- `status: QuestStatus!` - Current status
- `createdAt: BigInt!` - Creation timestamp
- `updatedAt: BigInt` - Last update
- `completedAt: BigInt` - Completion timestamp
- `cancelledAt: BigInt` - Cancellation timestamp
- `participantCount: BigInt!` - Number of participants
- `submissionCount: BigInt!` - Number of submissions
- `isCompleted: Boolean!` - Completion status
- `isCancelled: Boolean!` - Cancellation status
- `winners: [Bytes!]!` - Winner addresses
- `creationTxHash: Bytes!` - Creation transaction hash
- `creationBlockNumber: BigInt!` - Creation block number

**Enums:**

```graphql
enum QuestStatus {
  CREATED
  ACTIVE
  COMPLETED
  CANCELLED
}
```

#### `QuestParticipant`

Tracks user participation in quests.

**Fields:**

- `id: Bytes!` - Composite ID (questId + participant address)
- `quest: Quest!` - Associated quest
- `user: User!` - Participant user
- `joinedAt: BigInt!` - Join timestamp
- `leftAt: BigInt` - Leave timestamp (if applicable)
- `isActive: Boolean!` - Active participation status
- `joinTxHash: Bytes!` - Join transaction hash
- `leftTxHash: Bytes` - Leave transaction hash

### 📝 Submission Entities

#### `Submission`

Represents quest submissions with engagement data.

**Fields:**

- `id: Bytes!` - Submission ID as Bytes
- `submissionId: BigInt!` - Original submission ID
- `quest: Quest!` - Associated quest
- `submitter: User!` - Submitter
- `isTeamSubmission: Boolean!` - Team submission flag
- `team: Team` - Associated team (if team submission)
- `status: SubmissionStatus!` - Current status
- `score: BigInt` - Review score
- `isApproved: Boolean` - Approval status
- `isWinner: Boolean!` - Winner status
- `createdAt: BigInt!` - Creation timestamp
- `updatedAt: BigInt` - Last update
- `reviewedAt: BigInt` - Review timestamp
- `likeCount: BigInt!` - Number of likes
- `commentCount: BigInt!` - Number of comments
- `creationTxHash: Bytes!` - Creation transaction hash
- `creationBlockNumber: BigInt!` - Creation block number

**Enums:**

```graphql
enum SubmissionStatus {
  CREATED
  UNDER_REVIEW
  APPROVED
  REJECTED
  WINNER
}
```

#### `SubmissionLike`

User likes on submissions.

**Fields:**

- `id: Bytes!` - Composite ID (submissionId + user address)
- `submission: Submission!` - Liked submission
- `user: User!` - User who liked
- `likedAt: BigInt!` - Like timestamp
- `txHash: Bytes!` - Transaction hash

#### `SubmissionComment`

Comments on submissions.

**Fields:**

- `id: Bytes!` - Composite ID (submissionId + commenter + timestamp)
- `submission: Submission!` - Commented submission
- `commenter: User!` - User who commented
- `commentedAt: BigInt!` - Comment timestamp
- `txHash: Bytes!` - Transaction hash

#### `SubmissionReview`

Reviews and scoring of submissions.

**Fields:**

- `id: Bytes!` - Composite ID (submissionId + reviewer + timestamp)
- `submission: Submission!` - Reviewed submission
- `reviewer: User!` - Reviewer
- `score: BigInt!` - Review score
- `approved: Boolean!` - Approval decision
- `reviewedAt: BigInt!` - Review timestamp
- `txHash: Bytes!` - Transaction hash

### 🎁 Reward Entities

#### `Reward`

Tracks reward distributions.

**Fields:**

- `id: Bytes!` - Reward ID as Bytes
- `rewardId: BigInt!` - Original reward ID
- `quest: Quest!` - Associated quest
- `recipient: User!` - Reward recipient
- `amount: BigInt!` - Reward amount
- `token: Bytes!` - Token address
- `rewardType: RewardType!` - Type of reward
- `distributedAt: BigInt!` - Distribution timestamp
- `txHash: Bytes!` - Transaction hash
- `blockNumber: BigInt!` - Block number

**Enums:**

```graphql
enum RewardType {
  WINNER_REWARD
  PARTICIPATION_REWARD
  BONUS_REWARD
  PLATFORM_FEE
}
```

### 🤝 Collaboration Entities

#### `Team`

Team entities for collaborative quests.

**Fields:**

- `id: Bytes!` - Team ID as Bytes
- `teamId: BigInt!` - Original team ID
- `quest: Quest!` - Associated quest
- `leader: User!` - Team leader
- `name: String!` - Team name
- `isActive: Boolean!` - Active status
- `createdAt: BigInt!` - Creation timestamp
- `disbandedAt: BigInt` - Disbandment timestamp
- `memberCount: BigInt!` - Number of members
- `creationTxHash: Bytes!` - Creation transaction hash

#### `TeamMember`

Individual team memberships.

**Fields:**

- `id: Bytes!` - Composite ID (teamId + user address)
- `team: Team!` - Associated team
- `user: User!` - Team member
- `joinedAt: BigInt!` - Join timestamp
- `removedAt: BigInt` - Removal timestamp
- `isActive: Boolean!` - Active membership status
- `joinTxHash: Bytes!` - Join transaction hash
- `removeTxHash: Bytes` - Removal transaction hash

#### `TeamInvite`

Team invitation system.

**Fields:**

- `id: Bytes!` - Composite ID (teamId + invitee address)
- `team: Team!` - Associated team
- `invitee: User!` - Invited user
- `inviter: User!` - User who sent invite
- `status: InviteStatus!` - Invite status
- `sentAt: BigInt!` - Sent timestamp
- `respondedAt: BigInt` - Response timestamp
- `sentTxHash: Bytes!` - Sent transaction hash
- `responseTxHash: Bytes` - Response transaction hash

**Enums:**

```graphql
enum InviteStatus {
  PENDING
  ACCEPTED
  REJECTED
}
```

#### `CollaborationRequest`

Collaboration requests between users.

**Fields:**

- `id: Bytes!` - Request ID as Bytes
- `requestId: BigInt!` - Original request ID
- `quest: Quest!` - Associated quest
- `requester: User!` - User making request
- `createdAt: BigInt!` - Creation timestamp
- `txHash: Bytes!` - Transaction hash

### 🏆 Achievement Entities

#### `UserAchievement`

User achievements and milestones.

**Fields:**

- `id: Bytes!` - Composite ID (user + achievementId)
- `user: User!` - User who earned achievement
- `achievementId: BigInt!` - Achievement identifier
- `earnedAt: BigInt!` - Earned timestamp
- `txHash: Bytes!` - Transaction hash

### 📊 Platform Entities

#### `PlatformStats`

Global platform statistics.

**Fields:**

- `id: Bytes!` - Static ID ("PLATFORM_STATS" as hex)
- `totalUsers: BigInt!` - Total registered users
- `totalQuests: BigInt!` - Total quests created
- `totalSubmissions: BigInt!` - Total submissions made
- `totalRewardsDistributed: BigInt!` - Total rewards distributed
- `totalValueLocked: BigInt!` - Total value locked in platform
- `platformFeePercentage: BigInt!` - Platform fee percentage
- `platformFeeRecipient: Bytes!` - Fee recipient address

### 🔧 Administrative Entities

#### `RoleEvent`

Role management events for debugging.

**Fields:**

- `id: Bytes!` - Event ID
- `contract: String!` - Contract that emitted event
- `role: Bytes!` - Role identifier
- `account: Bytes!` - Account address
- `eventType: String!` - Event type (GRANTED, REVOKED, ADMIN_CHANGED)
- `blockNumber: BigInt!` - Block number
- `blockTimestamp: BigInt!` - Block timestamp
- `transactionHash: Bytes!` - Transaction hash

#### `PauseEvent`

Contract pause/unpause events.

**Fields:**

- `id: Bytes!` - Event ID
- `contract: String!` - Contract that was paused/unpaused
- `account: Bytes!` - Account that triggered pause
- `isPaused: Boolean!` - Pause status
- `blockNumber: BigInt!` - Block number
- `blockTimestamp: BigInt!` - Block timestamp
- `transactionHash: Bytes!` - Transaction hash

## 📋 Example Queries

### 🔍 Basic Queries

#### Get All Users

```graphql
{
  users(first: 10) {
    id
    username
    reputation
    totalQuestsCreated
    totalSubmissions
    skills
  }
}
```

#### Get User by Address

```graphql
{
  user(id: "0x742d35Cc6634C0532925a3b8D091Aa19D26ff1f7") {
    id
    username
    reputation
    totalQuestsCreated
    totalQuestsCompleted
    totalRewardsEarned
    skills
    createdQuests(first: 5) {
      title
      bountyAmount
      status
      participantCount
    }
  }
}
```

#### Get Recent Quests

```graphql
{
  quests(first: 10, orderBy: createdAt, orderDirection: desc) {
    questId
    title
    bountyAmount
    status
    participantCount
    submissionCount
    creator {
      username
      reputation
    }
    createdAt
  }
}
```

#### Get Quest with Full Details

```graphql
{
  quest(id: "0x01") {
    questId
    title
    description
    bountyAmount
    status
    creator {
      username
      reputation
    }
    participants(first: 10) {
      user {
        username
      }
      joinedAt
      isActive
    }
    submissions(first: 5) {
      submitter {
        username
      }
      status
      isWinner
      likeCount
      commentCount
    }
    winners
  }
}
```

### 🎯 Advanced Queries

#### Get Platform Overview

```graphql
{
  platformStats(id: "0x504c4154464f524d5f5354415453") {
    totalUsers
    totalQuests
    totalSubmissions
    totalRewardsDistributed
    totalValueLocked
    platformFeePercentage
  }
}
```

#### Get Active Quests with High Bounties

```graphql
{
  quests(
    where: { status: ACTIVE, bountyAmount_gt: "1000000000000000000" }
    orderBy: bountyAmount
    orderDirection: desc
    first: 10
  ) {
    questId
    title
    bountyAmount
    participantCount
    submissionCount
    creator {
      username
    }
  }
}
```

#### Get User's Complete Activity

```graphql
{
  user(id: "0x742d35Cc6634C0532925a3b8D091Aa19D26ff1f7") {
    username
    reputation

    # Created quests
    createdQuests(first: 5, orderBy: createdAt, orderDirection: desc) {
      title
      bountyAmount
      status
      participantCount
    }

    # Participations
    questParticipations(first: 5, orderBy: joinedAt, orderDirection: desc) {
      quest {
        title
        status
      }
      joinedAt
      isActive
    }

    # Submissions
    submissions(first: 5, orderBy: createdAt, orderDirection: desc) {
      quest {
        title
      }
      status
      isWinner
      likeCount
    }

    # Rewards
    rewards(first: 5, orderBy: distributedAt, orderDirection: desc) {
      amount
      rewardType
      quest {
        title
      }
      distributedAt
    }

    # Team memberships
    teamMemberships(where: { isActive: true }) {
      team {
        name
        quest {
          title
        }
      }
      joinedAt
    }
  }
}
```

#### Get Team Details with Members

```graphql
{
  teams(first: 10, where: { isActive: true }) {
    teamId
    name
    leader {
      username
    }
    quest {
      title
      status
    }
    memberCount
    members(where: { isActive: true }) {
      user {
        username
        reputation
      }
      joinedAt
    }
    invites {
      invitee {
        username
      }
      status
      sentAt
    }
  }
}
```

#### Get Submission Engagement

```graphql
{
  submissions(
    first: 10
    orderBy: likeCount
    orderDirection: desc
    where: { status_in: [APPROVED, WINNER] }
  ) {
    submissionId
    submitter {
      username
    }
    quest {
      title
    }
    status
    likeCount
    commentCount
    likes(first: 5) {
      user {
        username
      }
      likedAt
    }
    comments(first: 3) {
      commenter {
        username
      }
      commentedAt
    }
    reviews {
      reviewer {
        username
      }
      score
      approved
    }
  }
}
```

#### Get Recent Activity Feed

```graphql
{
  # Recent quests
  recentQuests: quests(first: 5, orderBy: createdAt, orderDirection: desc) {
    title
    creator {
      username
    }
    bountyAmount
    createdAt
  }

  # Recent submissions
  recentSubmissions: submissions(
    first: 5
    orderBy: createdAt
    orderDirection: desc
  ) {
    submitter {
      username
    }
    quest {
      title
    }
    status
    createdAt
  }

  # Recent rewards
  recentRewards: rewards(
    first: 5
    orderBy: distributedAt
    orderDirection: desc
    where: { rewardType_not: PLATFORM_FEE }
  ) {
    recipient {
      username
    }
    amount
    rewardType
    quest {
      title
    }
    distributedAt
  }
}
```

### 🔍 Filtering and Sorting

#### Common Filter Examples

```graphql
# Filter by status
quests(where: { status: ACTIVE })

# Filter by amount range
quests(where: {
  bountyAmount_gte: "100000000000000000",
  bountyAmount_lte: "1000000000000000000"
})

# Filter by creator
quests(where: { creator: "0x742d35Cc6634C0532925a3b8D091Aa19D26ff1f7" })

# Filter by multiple statuses
submissions(where: { status_in: [APPROVED, WINNER] })

# Filter by date range
quests(where: {
  createdAt_gte: "1640995200",
  createdAt_lte: "1672531200"
})

# Text search in title (contains)
quests(where: { title_contains: "Development" })

# Filter active participants
questParticipants(where: { isActive: true })
```

#### Common Sorting Examples

```graphql
# Sort by creation date (newest first)
quests(orderBy: createdAt, orderDirection: desc)

# Sort by bounty amount (highest first)
quests(orderBy: bountyAmount, orderDirection: desc)

# Sort by reputation (highest first)
users(orderBy: reputation, orderDirection: desc)

# Sort by like count (most liked first)
submissions(orderBy: likeCount, orderDirection: desc)
```

#### Pagination Examples

```graphql
# First 10 items
quests(first: 10)

# Skip first 10, get next 10
quests(first: 10, skip: 10)

# Get items after a specific ID
quests(first: 10, where: { id_gt: "0x05" })
```

## 🔑 Important Notes

### Bytes vs String IDs

Most entity IDs are of type `Bytes!` and need to be queried using hexadecimal format:

- User ID: `"0x742d35Cc6634C0532925a3b8D091Aa19D26ff1f7"`
- Platform Stats ID: `"0x504c4154464f524d5f5354415453"` (hex of "PLATFORM_STATS")

### BigInt Fields

All numeric fields are `BigInt!` and should be treated as strings in queries:

- Amounts: `"1000000000000000000"` (1 ETH in wei)
- Timestamps: `"1640995200"` (Unix timestamp)

### Relationship Queries

Use `@derivedFrom` relationships to efficiently query related data:

```graphql
user {
  createdQuests { ... }     # All quests created by user
  submissions { ... }       # All submissions by user
  rewards { ... }          # All rewards received by user
}
```

### Query Limits

- Maximum `first` parameter: 1000
- For larger datasets, use pagination with `skip`
- Use specific filtering to reduce result sets

## 🚀 Getting Started

1. **Open The Graph Playground**: [The Graph Studio](https://thegraph.com/studio/)
2. **Navigate to your subgraph**: "first"
3. **Click "Playground"**
4. **Paste any query** from the examples above
5. **Explore the schema** using the right sidebar

## 📚 Additional Resources

- [The Graph Docs](https://thegraph.com/docs/)
- [GraphQL Query Language](https://graphql.org/learn/queries/)
- [Subgraph Studio](https://thegraph.com/studio/)

---

**Endpoint**: `https://api.studio.thegraph.com/query/117682/first/v0.0.3`
