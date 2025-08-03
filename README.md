# Avalon

**The Decentralized Creative Economy Platform**

Avalon is a blockchain-powered platform that revolutionizes how creative professionals collaborate, compete, and get compensated for their work. Built on Etherlink (Tezos Layer 2), Avalon connects creators, clients, and collaborators in a trustless, transparent ecosystem where creative challenges become opportunities for earning and growth.

## Table of Contents

- [The Problem](#the-problem)
- [Our Solution](#our-solution)
- [Why Etherlink?](#why-etherlink)
- [Technical Architecture](#technical-architecture)
  - [Smart Contract Layer](#smart-contract-layer)
  - [Frontend Application](#frontend-application)
  - [Indexing Layer](#indexing-layer)
- [Key Features](#key-features)
  - [For Quest Creators (Clients)](#for-quest-creators-clients)
  - [For Creators](#for-creators)
  - [For Teams](#for-teams)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Quick Start](#quick-start)
  - [Demo Scripts](#demo-scripts)
- [Use Cases](#use-cases)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Security](#security)
- [License](#license)
- [Community & Support](#community--support)
- [Acknowledgments](#acknowledgments)

## The Problem

The creative industry faces fundamental challenges that limit both creators and those seeking creative work:

**For Creators:**
- Inconsistent payment structures and delayed compensation
- Limited discovery and networking opportunities
- Lack of transparent reputation systems
- Difficulty finding collaborative partners with complementary skills
- Platform monopolies taking excessive fees

**For Clients/Quest Creators:**
- Hard to find and vet quality creative talent
- Complex project management across distributed teams
- No standardized way to manage creative competitions
- Limited transparency in the submission and review process

## Our Solution

Avalon addresses these challenges through a comprehensive decentralized platform that leverages blockchain technology to create trust, transparency, and fair compensation across the creative economy.

### Core Value Propositions

**🎯 Quest-Based Creative Economy**
Transform creative projects into structured "quests" with clear requirements, deadlines, and bounties. Whether you need a logo design, video editing, or complex collaborative projects, Avalon provides the infrastructure to manage it all.

**🤝 Seamless Collaboration**
Built-in team formation and management tools allow creators to find partners, form teams, and split rewards automatically. Our collaboration manager handles everything from initial invitations to final compensation distribution.

**💎 Transparent Reputation System**
Every interaction, submission, and collaboration is recorded on-chain, building immutable reputation profiles that help creators showcase their skills and reliability while helping clients make informed decisions.

**⚡ Instant, Fair Compensation**
Smart contracts automate payment distribution based on predefined rules. No more waiting for payments or disputes over compensation - everything is transparent and executed automatically.

## Why Etherlink?

Avalon is built on **Etherlink**, Tezos's EVM-compatible Layer 2 solution, providing unique advantages for the creative economy:

- **Low Transaction Costs**: Creators can participate in quests without worrying about prohibitive gas fees
- **Fast Finality**: Quick transaction confirmation enables smooth user experiences
- **Ethereum Compatibility**: Full EVM compatibility allows us to leverage existing Ethereum tooling and infrastructure
- **Energy Efficiency**: Tezos's proof-of-stake consensus aligns with the environmental consciousness of many creative professionals
- **Institutional Adoption**: Tezos's growing adoption in the arts and culture space makes it a natural fit for creative applications

## Technical Architecture

### Smart Contract Layer

Avalon consists of five interconnected smart contracts deployed on Etherlink:

| Contract | Purpose | Key Features |
|----------|---------|-------------|
| **QuestBoard** | Core Quest Management | • Create and manage creative quests with detailed requirements<br>• Support for individual, collaborative, and competition-style quests<br>• Flexible bounty structures (ETH or ERC20 tokens)<br>• Comprehensive quest lifecycle management |
| **UserProfile** | Identity and Reputation | • On-chain user profiles with skills and expertise tracking<br>• Reputation scoring based on completed quests and peer feedback<br>• KYC integration for verified professional profiles<br>• Portfolio and achievement tracking |
| **CollaborationManager** | Team Formation | • Dynamic team creation and management<br>• Invitation system with role-based permissions<br>• Automated collaboration agreements<br>• Team-based quest participation |
| **SubmissionManager** | Work and Review Process | • Structured submission workflows with file and metadata handling<br>• Multi-stage review processes<br>• Peer review and rating systems<br>• Version control for iterative improvements |
| **RewardManager** | Compensation Distribution | • Automated reward distribution based on quest outcomes<br>• Support for milestone-based payments<br>• Platform fee management (2.5% default)<br>• Multi-token reward systems |

### Frontend Application

Built with **Next.js** and **React**, the Avalon frontend provides:

- **Intuitive Quest Discovery**: Advanced filtering and search capabilities
- **Seamless Wallet Integration**: Support for MetaMask and WalletConnect
- **Real-time Updates**: Live quest status and collaboration updates
- **Mobile-Optimized Design**: Responsive interface for creators on the go
- **IPFS Integration**: Decentralized file storage for submissions and metadata

### Indexing Layer

A custom **subgraph** provides efficient data querying:

- Real-time event indexing from all smart contracts
- Complex query support for filtering and sorting
- Performance optimization for large datasets
- GraphQL API for frontend integration

## Key Features

### For Quest Creators (Clients)

**🎯 Flexible Quest Types**
- **Individual Quests**: Traditional freelance-style projects
- **Collaborative Quests**: Multi-person team projects
- **Competitions**: Creative contests with multiple submissions

**⚙️ Advanced Configuration**
- Custom skill requirements and minimum reputation thresholds
- File type and size restrictions
- Approval workflows for participant selection
- Deadline management with automatic enforcement

**📊 Comprehensive Analytics**
Track quest performance, participant engagement, and submission quality through detailed on-chain analytics.

### For Creators

**🔍 Smart Discovery**
Find quests that match your skills through AI-powered recommendations and advanced filtering options.

**👥 Team Building**
Form teams with complementary skills, manage collaboration agreements, and automatically split rewards.

**📈 Reputation Building**
Build verifiable, portable reputation across all your creative work that follows you across platforms.

**💰 Fair Compensation**
Get paid immediately upon quest completion with transparent, automated smart contract execution.

### For Teams

**🤝 Collaboration Tools**
- Real-time team formation and invitation systems
- Role-based permissions and responsibility management
- Integrated communication and file sharing
- Automated reward distribution based on contribution

**📋 Project Management**
- Milestone tracking and progress monitoring
- Version control for collaborative submissions
- Conflict resolution mechanisms

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MetaMask or compatible Web3 wallet
- Etherlink testnet ETH for transactions

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/avalon.git
   cd avalon
   ```

2. **Install dependencies**
   ```bash
   # Install contract dependencies
   cd contracts && npm install
   
   # Install frontend dependencies
   cd ../frontend && npm install
   
   # Install indexer dependencies
   cd ../indexer/first && npm install
   ```

3. **Set up environment variables**
   ```bash
   # In contracts/
   cp .env.example .env
   # Add your private key and API keys
   
   # In frontend/
   cp .env.local.example .env.local
   # Add your configuration
   ```

4. **Deploy contracts (optional - already deployed to testnet)**
   ```bash
   cd contracts
   npx hardhat run scripts/deploy.ts --network etherlinkTestnet
   ```

5. **Start the development environment**
   ```bash
   # Start the frontend
   cd frontend && npm run dev
   
   # In another terminal, start the indexer
   cd indexer/first && npm run dev
   ```

6. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) and connect your wallet to start creating or participating in quests.

### Demo Scripts

Explore the platform functionality through our comprehensive demo scripts:

```bash
cd contracts

# Basic user flows
npm run demo:user-profile
npm run demo:quest-management
npm run demo:collaboration
npm run demo:submissions
npm run demo:rewards

# Complete end-to-end scenarios
npm run demo:end-to-end
npm run demo:solo-creator
npm run demo:multi-creator
```

## Use Cases

### Individual Freelancers
**Scenario**: A graphic designer looking for consistent work
- **Discovery**: Browse design quests matching their skills
- **Participation**: Submit proposals and compete for projects
- **Execution**: Complete work with transparent milestone tracking
- **Growth**: Build on-chain reputation for future opportunities

### Creative Teams
**Scenario**: A video production team tackling complex projects
- **Formation**: Find complementary team members through the platform
- **Collaboration**: Manage multi-role projects with automated agreements
- **Compensation**: Automatic reward splitting based on predefined contributions
- **Portfolio**: Showcase successful collaborative projects

### Creative Agencies
**Scenario**: An agency distributing work to their network
- **Quest Creation**: Post complex, multi-phase creative projects
- **Team Management**: Organize and oversee distributed creative teams
- **Quality Control**: Implement structured review and feedback processes
- **Payment Automation**: Streamline compensation for all participants

### Creative Competitions
**Scenario**: A brand running a logo design contest
- **Setup**: Create competition-style quests with multiple winners
- **Participation**: Enable broad community participation
- **Judging**: Implement transparent, community-driven evaluation
- **Recognition**: Provide on-chain recognition and rewards

## Roadmap

### Phase 1: Foundation (Current)
- ✅ Core smart contract deployment
- ✅ Basic frontend interface
- ✅ Etherlink integration
- ✅ Team collaboration features

### Phase 2: Enhancement (Q2 2024)
- 🔄 Advanced reputation algorithms
- 🔄 Mobile application
- 🔄 Enhanced file storage with Filecoin
- 🔄 Cross-chain bridge integration

### Phase 3: Ecosystem (Q3 2024)
- 📅 DAO governance implementation
- 📅 Creative NFT marketplace integration
- 📅 AI-powered quest matching
- 📅 Enterprise partnership tools

### Phase 4: Scale (Q4 2024)
- 📅 Multi-language support
- 📅 Advanced analytics dashboard
- 📅 Integration with major creative platforms
- 📅 Educational partnership programs

## Contributing

We welcome contributions from the community! Here's how you can get involved:

### Development
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Bug Reports
Please use GitHub Issues to report bugs. Include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

### Feature Requests
We love hearing about new ideas! Please use GitHub Discussions to:
- Propose new features
- Discuss implementation approaches
- Share use cases and requirements

## Security

Security is paramount in handling creative work and compensation. Our approach includes:

- **Smart Contract Audits**: All contracts undergo rigorous security audits
- **Multi-signature Controls**: Critical functions require multiple confirmations
- **Emergency Pause Mechanisms**: Ability to pause contracts in case of issues
- **Gradual Rollout**: New features are tested extensively before mainnet deployment

### Bug Bounty Program
We run an ongoing bug bounty program. Security researchers can report vulnerabilities through our responsible disclosure process. Contact security@avalon.dev for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Community & Support

- **Website**: [avalon.dev](https://avalon.dev)
- **Discord**: [Join our community](https://discord.gg/avalon)
- **Twitter**: [@AvalonQuests](https://twitter.com/AvalonQuests)
- **Documentation**: [docs.avalon.dev](https://docs.avalon.dev)
- **Support**: support@avalon.dev

## Acknowledgments

- **Etherlink Team**: For providing the infrastructure that makes Avalon possible
- **Tezos Foundation**: For supporting innovative applications in the creative space
- **OpenZeppelin**: For battle-tested smart contract libraries
- **The Graph**: For efficient blockchain data indexing
- **IPFS/Filecoin**: For decentralized storage solutions

---

**Built with ❤️ by creators, for creators, on Etherlink**
