# 🔄 Contract Address Update Guide

## Overview

This guide explains how to update contract addresses in your Aryza subgraph when deploying to new networks, upgrading contracts, or moving between environments.

## 📋 Prerequisites

Before updating addresses, ensure you have:

- New contract deployment addresses
- Block numbers where contracts were deployed
- Updated ABIs (if contracts changed)
- Access to The Graph Studio or deployment platform

## 🎯 Step-by-Step Process

### **Step 1: Get New Contract Addresses**

First, get your new deployment addresses. They should be in this format:

```json
{
  "DeployModule#RewardManager": "0xNEW_REWARD_MANAGER_ADDRESS",
  "DeployModule#UserProfile": "0xNEW_USER_PROFILE_ADDRESS",
  "DeployModule#QuestBoard": "0xNEW_QUEST_BOARD_ADDRESS",
  "DeployModule#CollaborationManager": "0xNEW_COLLABORATION_MANAGER_ADDRESS",
  "DeployModule#SubmissionManager": "0xNEW_SUBMISSION_MANAGER_ADDRESS"
}
```

### **Step 2: Update `subgraph.yaml`**

Edit the `subgraph.yaml` file to update addresses and start blocks:

```yaml
dataSources:
  - kind: ethereum
    name: QuestBoard
    network: etherlink-testnet # or your target network
    source:
      address: '0xNEW_QUEST_BOARD_ADDRESS' # ← Update this
      abi: QuestBoard
      startBlock: NEW_START_BLOCK # ← Update this
    # ... rest of mapping stays the same

  - kind: ethereum
    name: SubmissionManager
    network: etherlink-testnet
    source:
      address: '0xNEW_SUBMISSION_MANAGER_ADDRESS' # ← Update this
      abi: SubmissionManager
      startBlock: NEW_START_BLOCK # ← Update this
    # ... rest of mapping stays the same

  # Repeat for all 5 contracts...
```

### **Step 3: Get Start Blocks**

You need the block number where each contract was deployed. You can get this by:

#### **Option A: From Deployment Transaction**

```bash
# If you have the deployment transaction hash
cast receipt 0xTRANSACTION_HASH --rpc-url YOUR_RPC_URL
```

#### **Option B: Use Block Explorer**

Look up the contract creation transaction on your network's block explorer.

#### **Option C: Use Current Block (Less Efficient)**

```bash
# Get current block number (will sync from this point forward)
cast block-number --rpc-url YOUR_RPC_URL
```

### **Step 4: Update ABIs (If Needed)**

If your contracts changed, update the ABI files:

```bash
# Copy new ABIs from your contracts project
cp ../contracts/artifacts/contracts/QuestBoard.sol/QuestBoard.json ./abis/
cp ../contracts/artifacts/contracts/SubmissionManager.sol/SubmissionManager.json ./abis/
cp ../contracts/artifacts/contracts/RewardManager.sol/RewardManager.json ./abis/
cp ../contracts/artifacts/contracts/UserProfile.sol/UserProfile.json ./abis/
cp ../contracts/artifacts/contracts/CollaborationManager.sol/CollaborationManager.json ./abis/
```

### **Step 5: Update Network Configuration**

If deploying to a different network, update the network name:

```yaml
# For mainnet
network: etherlink-mainnet

# For different testnet
network: polygon-mumbai

# For local development
network: localhost
```

### **Step 6: Rebuild and Deploy**

```bash
# Generate types with new contracts
graph codegen

# Build the subgraph
graph build

# Deploy with new version
graph deploy YOUR_SUBGRAPH_NAME --version-label v1.0.0
```

## 🛠️ **Automated Update Script**

Here's a script to automate the address update process:

```bash
#!/bin/bash
# update-addresses.sh

# Set your new addresses
QUEST_BOARD="0xNEW_QUEST_BOARD_ADDRESS"
SUBMISSION_MANAGER="0xNEW_SUBMISSION_MANAGER_ADDRESS"
REWARD_MANAGER="0xNEW_REWARD_MANAGER_ADDRESS"
USER_PROFILE="0xNEW_USER_PROFILE_ADDRESS"
COLLABORATION_MANAGER="0xNEW_COLLABORATION_MANAGER_ADDRESS"
START_BLOCK="123456789"

# Update subgraph.yaml
sed -i "s/address: \"0x35b3fB8fb4D3614bd70Caa5A87B4F3dea2B1aCb3\"/address: \"$QUEST_BOARD\"/" subgraph.yaml
sed -i "s/address: \"0x09f9D548467709c7DD597A7fA9dAEac1ff594071\"/address: \"$SUBMISSION_MANAGER\"/" subgraph.yaml
sed -i "s/address: \"0xE71949E7C672dFd4Daf0e14b05b008EA91f9A0DF\"/address: \"$REWARD_MANAGER\"/" subgraph.yaml
sed -i "s/address: \"0x6ACF9CF21e950A157F4153700F33C26e7602DE8F\"/address: \"$USER_PROFILE\"/" subgraph.yaml
sed -i "s/address: \"0xA1C6680AfF4642e2B4119F9F3e3a5514d231BD72\"/address: \"$COLLABORATION_MANAGER\"/" subgraph.yaml

# Update start blocks
sed -i "s/startBlock: 20867286/startBlock: $START_BLOCK/" subgraph.yaml

echo "✅ Addresses updated successfully!"
echo "Next steps:"
echo "1. Run: graph codegen"
echo "2. Run: graph build"
echo "3. Run: graph deploy YOUR_SUBGRAPH_NAME --version-label vX.X.X"
```

Make it executable and run:

```bash
chmod +x update-addresses.sh
./update-addresses.sh
```

## 🌐 **Network-Specific Configurations**

### **Etherlink Mainnet**

```yaml
network: etherlink-mainnet
# Use production contract addresses
```

### **Polygon Mumbai**

```yaml
network: polygon-mumbai
# Use Mumbai testnet addresses
```

### **Local Development**

```yaml
network: localhost
# Use local ganache/hardhat addresses
```

## ⚠️ **Important Considerations**

### **1. Start Block Selection**

- **Exact Block**: Use the exact deployment block for full history
- **Current Block**: Use current block for faster sync (loses historical data)
- **Future Block**: Use a future block for scheduled deployments

### **2. Data Migration**

- **New Deployment**: Fresh start, no existing data
- **Contract Upgrade**: May need to migrate existing entity data
- **Network Change**: Completely separate deployment

### **3. Version Management**

- Always increment version labels: `v1.0.0` → `v1.1.0`
- Keep track of which version maps to which contract addresses
- Consider maintaining separate subgraphs for different networks

### **4. Testing**

```bash
# Test locally first
graph build

# Verify queries work
# Check that events are being indexed correctly
# Confirm all entity relationships work
```

## 🔍 **Verification Steps**

After updating and deploying:

### **1. Check Deployment Status**

```graphql
# In Graph Studio, verify all data sources are syncing
{
  _meta {
    deployment
    hasIndexingErrors
    block {
      number
      hash
    }
  }
}
```

### **2. Test Basic Queries**

```graphql
{
  users(first: 5) {
    id
    username
  }
  quests(first: 5) {
    id
    title
    creator {
      id
    }
  }
}
```

### **3. Verify Contract Events**

Check that new events from updated contracts are being indexed properly.

## 📝 **Deployment Checklist**

- [ ] ✅ New contract addresses obtained
- [ ] ✅ Start blocks identified
- [ ] ✅ ABIs updated (if contracts changed)
- [ ] ✅ Network configuration updated
- [ ] ✅ `subgraph.yaml` updated
- [ ] ✅ `graph codegen` completed successfully
- [ ] ✅ `graph build` completed successfully
- [ ] ✅ Subgraph deployed with new version
- [ ] ✅ Sync status verified
- [ ] ✅ Test queries executed successfully
- [ ] ✅ Documentation updated with new endpoint

## 🚨 **Troubleshooting**

### **Common Issues:**

**1. Start Block Too Early**

```
Error: failed to start subgraph, code doesn't exist
```

**Solution**: Increase start block number

**2. Wrong Network**

```
Error: network not supported
```

**Solution**: Check network name in subgraph.yaml

**3. ABI Mismatch**

```
Error: event signature doesn't match
```

**Solution**: Update ABI files

**4. Address Format**

```
Error: invalid address format
```

**Solution**: Ensure addresses are lowercase and properly formatted

## 📚 **Additional Resources**

- [The Graph Docs - Subgraph Manifest](https://thegraph.com/docs/developer/create-subgraph-hosted/#the-subgraph-manifest)
- [Supported Networks](https://thegraph.com/docs/developer/quick-start/#supported-networks)
- [Version Management](https://thegraph.com/docs/developer/deploy-subgraph-studio/#manage-your-api-keys-and-subgraphs)

---

**Remember**: Always test on a testnet first before updating mainnet deployments!
