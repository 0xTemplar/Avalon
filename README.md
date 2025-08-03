# Avalon
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/your-org/avalon/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)](https://github.com/your-org/avalon/releases)


![avalon promo](https://github.com/user-attachments/assets/0412d1f5-894a-4ca0-86c8-091048491333)
**The Decentralized Creative Economy Platform**

## Overview
Avalon is an Etherlink-powered platform that revolutionizes how creative professionals collaborate, compete, and get compensated for their work. Built on Etherlink (Tezos Layer 2), Avalon connects creators, clients, and collaborators in a trustless, transparent ecosystem where creative challenges become opportunities for earning and growth.

## Table of Contents

- [The Problem](#the-problem)
- [Our Solution](#our-solution)
- [Use Cases](#use-cases)
- [Technical Architecture](#technical-architecture)
  - [Smart Contract Layer](#smart-contract-layer)
  - [Frontend Application](#frontend-application)
  - [Indexing Layer](#indexing-layer)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Quick Start](#quick-start)
  - [Demo Scripts](#demo-scripts)
- [Contributing](#contributing)

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

- **🎯 Quest-Based Creative Economy**: 
Transform creative projects into structured "quests" with clear requirements, deadlines, and bounties. Whether you need a logo design, video editing, or complex collaborative projects, Avalon provides the infrastructure to manage it all.

- **🤝 Seamless Collaboration**
Built-in team formation and management tools allow creators to find partners, form teams, and split rewards automatically. Our collaboration manager handles everything from initial invitations to final compensation distribution.

- **💎 Transparent Reputation System**
Every interaction, submission, and collaboration is recorded on-chain, building immutable reputation profiles that help creators showcase their skills and reliability while helping clients make informed decisions.

- **⚡ Instant, Fair Compensation**
Smart contracts automate payment distribution based on predefined rules. No more waiting for payments or disputes over compensation - everything is transparent and executed automatically.

## Use Cases

### Real-World Example: [Etherlink Liquidity Campaign](https://avalon-etherlink-3yg7.vercel.app/quest/ma9fGWiboHVRWNGDg4bX)

**Scenario**: Design quest for Etherlink liquidity provision campaign on AppleFarm
- **Quest Type**: Creative competition for promotional materials
- **Bounty**: 100 XTZ distributed among top submissions
- **Participants**: Designers from the Avalon community
- **Deliverables**: Banner designs, social media graphics, and promotional materials
- **Results**: High-quality designs delivered within 72 hours

**Featured Submissions:**
- [Explore Defi On Etherlink](https://gateway.pinata.cloud/ipfs/bafkreiab6xdhakzqckl7s37q6glch6ihuufgtjry2jgnviwu47tbecczuy) - Modern gradient design with animated elements
- [AppleFarm Liquidity Campaign](https://gateway.pinata.cloud/ipfs/bafkreiadt37wn6d5oi7yaa6rpfu22iyndai3ds7cvxd5c6uiq2jkdprebu) - Campaign promotion design

This real campaign demonstrated Avalon's ability to rapidly mobilize creative talent for time-sensitive marketing needs while ensuring fair compensation and quality outcomes.


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

# Complete end-to-end scenarios
npm run demo:solo-creator
npm run demo:multi-creator
```

### Individual Freelancers
**Scenario**: A graphic designer looking for consistent work
- **Discovery**: Browse design quests matching their skills
- **Participation**: Submit proposals and compete for projects
- **Execution**: Complete work with transparent milestone tracking
- **Growth**: Build on-chain reputation for future opportunities

## Contributing

We welcome contributions from the community! Here's how you can get involved:

### Development
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


---

**Built with ❤️ by creators, for creators, on Etherlink**
