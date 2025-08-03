# Quest Board Demo Scripts 🚀

This directory contains comprehensive demonstration scripts showcasing the complete Quest Board ecosystem deployed on Etherlink Testnet.

## 📋 Demo Overview

Each demo script demonstrates different aspects of the Quest Board platform:

### 1. User Profile Management (`1-userProfileDemo.ts`)

**Duration**: ~5 minutes  
**Features Demonstrated**:

- Creating user profiles with skills and bio
- Updating profiles and adding new skills
- Reputation management system
- Achievement creation and awards
- Profile statistics and leaderboards

**Key Highlights**:

- 👤 Profile creation for different user types (designers, developers, writers)
- ⭐ Reputation scoring system
- 🏆 Achievement unlocking mechanics

### 2. Quest Management (`2-questManagementDemo.ts`)

**Duration**: ~7 minutes  
**Features Demonstrated**:

- Creating different types of quests (individual vs collaborative)
- Managing quest participants and approvals
- Quest lifecycle management (pause, resume, update)
- Bounty escrow system
- Quest discovery and filtering

**Key Highlights**:

- 🎯 Multiple quest types with different requirements
- 💰 ETH bounty escrow and management
- 👥 Participant approval workflow

### 3. Collaboration & Teams (`3-collaborationDemo.ts`)

**Duration**: ~8 minutes  
**Features Demonstrated**:

- Team creation and management
- Role assignment within teams
- Team proposal and voting system
- Multi-member collaboration workflows
- Team statistics and analytics

**Key Highlights**:

- 🤝 Team formation for collaborative projects
- 👑 Role-based team management
- 🗳️ Democratic decision-making through proposals

### 4. Submission Management (`4-submissionDemo.ts`)

**Duration**: ~10 minutes  
**Features Demonstrated**:

- Creating and submitting project work
- Peer review system with scoring
- Revision request and resubmission workflow
- Quality assessment criteria
- Submission analytics

**Key Highlights**:

- 📤 Comprehensive submission system
- 👥 Multi-reviewer evaluation process
- 🔄 Revision and improvement cycles

### 5. Reward Distribution (`5-rewardDistributionDemo.ts`)

**Duration**: ~6 minutes  
**Features Demonstrated**:

- Bounty distribution algorithms
- Multi-winner reward sharing
- Automatic payment processing
- Platform fee calculation
- Earnings tracking and analytics

**Key Highlights**:

- 💰 Fair reward distribution (70/20/10 model)
- 🏦 Automatic ETH transfers
- 📊 Comprehensive earnings analytics

### 6. Complete End-to-End (`6-endToEndDemo.ts`)

**Duration**: ~15 minutes  
**Features Demonstrated**:

- Complete quest lifecycle from creation to completion
- Multi-user collaboration workflow
- Real-world project simulation (DeFi platform development)
- All systems working together seamlessly

**Key Highlights**:

- 🌟 Complete platform experience
- 👥 Dream team assembly and collaboration
- 🏆 Grand finale with substantial rewards

### 7. Solo Creator Challenge (`7-soloCreatorDemo.ts`) ⭐ **FEATURED**

**Duration**: ~8 minutes  
**Features Demonstrated**:

- Creator participating in their own quest
- Multiple solo submissions competing
- Merit-based prize distribution (50/30/20 split)
- Reputation points for successful submissions (+20 each)
- Self-organized innovation challenges

**Key Highlights**:

- 🎯 Creator-participant model (creator joins own quest)
- 🏃‍♂️ Solo builder sprint competition
- 🏆 Top 3 submissions share ETH bounty
- ⭐ +20 reputation points per successful submission
- 💡 Perfect for hackathons and innovation challenges

### 8. Team Collaboration (`8-multiCreatorDemo.ts`)

**Duration**: ~10 minutes  
**Features Demonstrated**:

- Two creators collaborating as a team on one quest
- Combined skill sets for full-stack development
- Shared submission with collaborator system
- Team-based reward distribution
- Collaborative workflow and planning

**Key Highlights**:

- 🤝 Frontend Wizard + Blockchain Ninja team collaboration
- 👥 Two creators working on one shared submission
- 🎯 Full-stack development combining frontend + smart contracts
- 💰 Shared reward distribution among team members
- ⭐ Team-based reputation building

## 🚀 Running the Demos

### Prerequisites

- Deployed contracts on Etherlink Testnet
- Funded wallet addresses for testing
- Node.js and Hardhat setup

### Quick Start

```bash
# Navigate to contracts directory
cd contracts

# Run individual demos
npm run demo:profiles          # User profile management
npm run demo:quests           # Quest creation and management
npm run demo:collaboration    # Team formation and collaboration
npm run demo:submissions      # Work submission and review
npm run demo:rewards          # Reward distribution
npm run demo:end-to-end       # Complete workflow
npm run demo:solo-creator     # Featured: Solo creator challenge
npm run demo:multi-creator    # Team collaboration

# Quick commands
npm run demo:featured         # Run the featured solo creator demo
npm run demo:quick           # Run complete end-to-end demo
npm run demo:all             # Run all core demos (excluding featured)
```

### Recommended Order

**For Newcomers:**

1. **Featured Solo Creator** (`npm run demo:featured`) - ⭐ **START HERE** - Best intro to the platform
2. **User Profiles** - Understand the foundation
3. **Quest Management** - Learn how quests work

**For Deep Dive:** 4. **Collaboration** - Understand team dynamics 5. **Submissions** - See the work submission process 6. **Rewards** - Experience the payment system 7. **End-to-End** - See everything working together

## 📊 Demo Data

### Deployed Contract Addresses (Etherlink Testnet)

- **UserProfile**: `0xC6816eBE0a22B1C2de557bEF30852fa8968D2296`
- **QuestBoard**: `0x72D11a8ccd35366ee4021a1D55a7930ab1f00f27`
- **CollaborationManager**: `0xa281E6a50006bD377A9A0601AAb76DFBc9D6d0e7`
- **SubmissionManager**: `0xbc5502C2086235E1A1Ab7B5A397cE4B327035e97`
- **RewardManager**: `0x194E19AF9bfe69aDA8de9df3eAfAebbe60d0bC74`

### Test Characters

Each demo uses different personas to showcase realistic scenarios:

- 🎯 **Quest Creators**: Experienced project managers and entrepreneurs
- 👑 **Team Leaders**: Skilled coordinators and project managers
- 💻 **Developers**: Technical contributors specializing in blockchain
- 🎨 **Designers**: Creative professionals focusing on UI/UX
- ✍️ **Writers**: Content creators and technical writers
- 👁️ **Reviewers**: Quality assessors and code auditors

## 🎯 What You'll Learn

### Platform Mechanics

- How users onboard and build profiles
- Quest creation and bounty management
- Team formation and collaboration
- Work submission and review processes
- Fair reward distribution algorithms

### Smart Contract Interactions

- Multi-contract system architecture
- Role-based access control
- ETH handling and escrow systems
- Event emission and listening
- Gas optimization strategies

### Web3 UX Patterns

- Profile-based identity systems
- Reputation and achievement mechanics
- Collaborative workflow management
- Transparent reward distribution
- Community-driven quality control

## 🔧 Customization

### Modifying Demo Parameters

```typescript
// Adjust bounty amounts
const bountyAmount = ethers.parseEther('0.5'); // Change bounty size

// Modify deadlines
const submissionDeadline = Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60; // 14 days

// Update reward distribution
const winnerShare = (bountyAmount * 70n) / 100n; // 70% to winner
```

### Adding New Scenarios

1. Copy an existing demo file
2. Modify the quest parameters and user personas
3. Adjust the workflow to match your use case
4. Update the README with your new demo

## 🐛 Troubleshooting

### Common Issues

- **"User already has profile"**: Normal for repeated runs
- **"Quest not found"**: May need to adjust quest IDs
- **"Insufficient funds"**: Ensure test wallets have ETH
- **"Role not granted"**: Admin permissions may need setup

### Debug Mode

Add `console.log` statements to track execution:

```typescript
console.log('Current step:', stepName);
console.log('Transaction hash:', tx.hash);
```

## 🌟 Next Steps

After running the demos:

1. **Frontend Integration**: Connect these contracts to a React frontend
2. **Mobile App**: Build mobile interfaces for the platform
3. **Analytics Dashboard**: Create data visualization tools
4. **API Layer**: Develop REST APIs for easier integration
5. **Community Features**: Add social elements and messaging

## 🎉 Conclusion

These demos showcase a complete decentralized work platform where:

- ✅ Anyone can create meaningful quests
- ✅ Teams collaborate effectively
- ✅ Quality work is rewarded fairly
- ✅ Reputation builds over time
- ✅ The community thrives

Welcome to the future of work! 🚀

---

_Built with ❤️ on Etherlink • Powered by Quest Board_
