#!/bin/bash

# 🔄 Avalon Subgraph Address Update Script
# This script updates contract addresses in subgraph.yaml

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 Avalon Subgraph Address Update Script${NC}"
echo "=========================================="

# Function to validate Ethereum address
validate_address() {
    local addr=$1
    if [[ ! $addr =~ ^0x[a-fA-F0-9]{40}$ ]]; then
        echo -e "${RED}❌ Invalid address format: $addr${NC}"
        echo -e "${YELLOW}   Expected format: 0x1234567890123456789012345678901234567890${NC}"
        exit 1
    fi
}

# Function to validate block number
validate_block() {
    local block=$1
    if [[ ! $block =~ ^[0-9]+$ ]]; then
        echo -e "${RED}❌ Invalid block number: $block${NC}"
        echo -e "${YELLOW}   Expected format: 123456789${NC}"
        exit 1
    fi
}

# Get current addresses from subgraph.yaml
echo -e "${BLUE}📋 Current Configuration:${NC}"
echo "Current QuestBoard:        $(grep -A2 'name: QuestBoard' subgraph.yaml | grep 'address:' | cut -d'"' -f2)"
echo "Current SubmissionManager: $(grep -A2 'name: SubmissionManager' subgraph.yaml | grep 'address:' | cut -d'"' -f2)"
echo "Current RewardManager:     $(grep -A2 'name: RewardManager' subgraph.yaml | grep 'address:' | cut -d'"' -f2)"
echo "Current UserProfile:       $(grep -A2 'name: UserProfile' subgraph.yaml | grep 'address:' | cut -d'"' -f2)"
echo "Current CollaborationManager: $(grep -A2 'name: CollaborationManager' subgraph.yaml | grep 'address:' | cut -d'"' -f2)"
echo

# Option 1: Interactive mode
if [[ $# -eq 0 ]]; then
    echo -e "${YELLOW}🔧 Interactive Mode${NC}"
    echo "Enter new contract addresses (or press Enter to keep current):"
    echo

    read -p "QuestBoard address: " QUEST_BOARD
    read -p "SubmissionManager address: " SUBMISSION_MANAGER
    read -p "RewardManager address: " REWARD_MANAGER
    read -p "UserProfile address: " USER_PROFILE
    read -p "CollaborationManager address: " COLLABORATION_MANAGER
    read -p "Start block number: " START_BLOCK

# Option 2: Command line arguments
elif [[ $# -eq 6 ]]; then
    echo -e "${YELLOW}📝 Command Line Mode${NC}"
    QUEST_BOARD=$1
    SUBMISSION_MANAGER=$2
    REWARD_MANAGER=$3
    USER_PROFILE=$4
    COLLABORATION_MANAGER=$5
    START_BLOCK=$6

# Option 3: Load from deployment file
elif [[ $# -eq 1 && $1 == "--from-deployment" ]]; then
    echo -e "${YELLOW}📁 Loading from deployment file...${NC}"
    
    # Check if deployment file exists
    DEPLOYMENT_FILE="../contracts/ignition/deployments/chain-128123/deployed_addresses.json"
    if [[ ! -f $DEPLOYMENT_FILE ]]; then
        echo -e "${RED}❌ Deployment file not found: $DEPLOYMENT_FILE${NC}"
        exit 1
    fi
    
    # Extract addresses from deployment file
    QUEST_BOARD=$(jq -r '.["DeployModule#QuestBoard"]' $DEPLOYMENT_FILE)
    SUBMISSION_MANAGER=$(jq -r '.["DeployModule#SubmissionManager"]' $DEPLOYMENT_FILE)
    REWARD_MANAGER=$(jq -r '.["DeployModule#RewardManager"]' $DEPLOYMENT_FILE)
    USER_PROFILE=$(jq -r '.["DeployModule#UserProfile"]' $DEPLOYMENT_FILE)
    COLLABORATION_MANAGER=$(jq -r '.["DeployModule#CollaborationManager"]' $DEPLOYMENT_FILE)
    
    read -p "Start block number: " START_BLOCK

else
    echo -e "${RED}❌ Invalid arguments${NC}"
    echo
    echo -e "${YELLOW}Usage:${NC}"
    echo "  $0                                    # Interactive mode"
    echo "  $0 --from-deployment                  # Load addresses from deployment file"
    echo "  $0 <quest> <submission> <reward> <profile> <collaboration> <block>"
    echo
    echo -e "${YELLOW}Example:${NC}"
    echo "  $0 0x123...abc 0x456...def 0x789...ghi 0x012...jkl 0x345...mno 20867286"
    exit 1
fi

# Validate all addresses if provided
[[ -n $QUEST_BOARD ]] && validate_address $QUEST_BOARD
[[ -n $SUBMISSION_MANAGER ]] && validate_address $SUBMISSION_MANAGER
[[ -n $REWARD_MANAGER ]] && validate_address $REWARD_MANAGER
[[ -n $USER_PROFILE ]] && validate_address $USER_PROFILE
[[ -n $COLLABORATION_MANAGER ]] && validate_address $COLLABORATION_MANAGER
[[ -n $START_BLOCK ]] && validate_block $START_BLOCK

echo
echo -e "${BLUE}🔄 Updating Configuration:${NC}"

# Create backup
cp subgraph.yaml subgraph.yaml.backup
echo -e "${GREEN}✅ Backup created: subgraph.yaml.backup${NC}"

# Update addresses and start blocks
if [[ -n $QUEST_BOARD ]]; then
    sed -i.tmp "/name: QuestBoard/,/startBlock:/ s/address: \".*\"/address: \"$QUEST_BOARD\"/" subgraph.yaml
    echo -e "${GREEN}✅ Updated QuestBoard: $QUEST_BOARD${NC}"
fi

if [[ -n $SUBMISSION_MANAGER ]]; then
    sed -i.tmp "/name: SubmissionManager/,/startBlock:/ s/address: \".*\"/address: \"$SUBMISSION_MANAGER\"/" subgraph.yaml
    echo -e "${GREEN}✅ Updated SubmissionManager: $SUBMISSION_MANAGER${NC}"
fi

if [[ -n $REWARD_MANAGER ]]; then
    sed -i.tmp "/name: RewardManager/,/startBlock:/ s/address: \".*\"/address: \"$REWARD_MANAGER\"/" subgraph.yaml
    echo -e "${GREEN}✅ Updated RewardManager: $REWARD_MANAGER${NC}"
fi

if [[ -n $USER_PROFILE ]]; then
    sed -i.tmp "/name: UserProfile/,/startBlock:/ s/address: \".*\"/address: \"$USER_PROFILE\"/" subgraph.yaml
    echo -e "${GREEN}✅ Updated UserProfile: $USER_PROFILE${NC}"
fi

if [[ -n $COLLABORATION_MANAGER ]]; then
    sed -i.tmp "/name: CollaborationManager/,/startBlock:/ s/address: \".*\"/address: \"$COLLABORATION_MANAGER\"/" subgraph.yaml
    echo -e "${GREEN}✅ Updated CollaborationManager: $COLLABORATION_MANAGER${NC}"
fi

if [[ -n $START_BLOCK ]]; then
    sed -i.tmp "s/startBlock: [0-9]*/startBlock: $START_BLOCK/g" subgraph.yaml
    echo -e "${GREEN}✅ Updated start blocks: $START_BLOCK${NC}"
fi

# Clean up temporary files
rm -f subgraph.yaml.tmp

echo
echo -e "${BLUE}🎯 Next Steps:${NC}"
echo "1. Run: ${YELLOW}graph codegen${NC}"
echo "2. Run: ${YELLOW}graph build${NC}" 
echo "3. Run: ${YELLOW}graph deploy first --version-label v1.0.1${NC}"
echo
echo -e "${BLUE}🔍 To verify changes:${NC}"
echo "   ${YELLOW}diff subgraph.yaml.backup subgraph.yaml${NC}"
echo
echo -e "${GREEN}✨ Address update complete!${NC}"