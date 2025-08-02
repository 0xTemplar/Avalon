# Hardhat Ignition Deployment

This directory contains the Hardhat Ignition deployment module for the Aryza Quest Board contracts.

## Deployment Order

The contracts are deployed in the following order to satisfy dependencies:

1. **UserProfile** - Manages user profiles and reputation
2. **RewardManager** - Handles bounty escrow and reward distribution
3. **QuestBoard** - Main quest management contract
4. **CollaborationManager** - Manages team collaboration
5. **SubmissionManager** - Handles quest submissions

## Deployment Commands

### Local Deployment (Hardhat Network)

```bash
npx hardhat ignition deploy ignition/modules/Deploy.ts --network localhost
```

### Testnet Deployment (e.g., Sepolia)

```bash
npx hardhat ignition deploy ignition/modules/Deploy.ts --network sepolia
```

### With Custom Parameters

```bash
npx hardhat ignition deploy ignition/modules/Deploy.ts --parameters ignition/parameters.json --network sepolia
```

## Verification

To verify contracts after deployment:

```bash
npx hardhat ignition verify deployed
```

## Configuration

Edit `parameters.json` to customize deployment parameters:

- `platformFeeRecipient`: Address that receives platform fees
- `platformFeePercentage`: Platform fee in basis points (250 = 2.5%)

## Post-Deployment Steps

After deployment, the script automatically:

1. Grants QUEST_BOARD_ROLE to QuestBoard in RewardManager
2. Grants ADMIN_ROLE to QuestBoard in UserProfile
3. Grants MODERATOR_ROLE to platform fee recipient in QuestBoard

## Deployed Addresses

After deployment, the addresses will be saved in:

- `ignition/deployments/<chain-id>/deployed_addresses.json`

## Testing the Deployment

To test the deployment locally:

```bash
# Start local node
npx hardhat node

# In another terminal, deploy
npx hardhat ignition deploy ignition/modules/Deploy.ts --network localhost
```
