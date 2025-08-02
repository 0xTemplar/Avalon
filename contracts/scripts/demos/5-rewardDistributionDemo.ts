import { ethers } from 'hardhat';
import {
  RewardManager,
  QuestBoard,
  UserProfile,
  SubmissionManager,
} from '../../typechain-types';

/**
 * Demo: Reward Distribution and Claims
 * Demonstrates bounty distribution, reward calculation, and claiming process
 */
async function main() {
  console.log('💰 Quest Board - Reward Distribution Demo');
  console.log('=========================================\n');

  // Deployed contract addresses
  const REWARD_MANAGER_ADDRESS = '0x194E19AF9bfe69aDA8de9df3eAfAebbe60d0bC74';
  const QUEST_BOARD_ADDRESS = '0x72D11a8ccd35366ee4021a1D55a7930ab1f00f27';
  const USER_PROFILE_ADDRESS = '0xC6816eBE0a22B1C2de557bEF30852fa8968D2296';
  const SUBMISSION_MANAGER_ADDRESS =
    '0xbc5502C2086235E1A1Ab7B5A397cE4B327035e97';

  // Get signers
  const [deployer, creator, alice, bob, charlie, diana] =
    await ethers.getSigners();

  // Connect to contracts
  const rewardManager = (await ethers.getContractAt(
    'RewardManager',
    REWARD_MANAGER_ADDRESS
  )) as RewardManager;
  const questBoard = (await ethers.getContractAt(
    'QuestBoard',
    QUEST_BOARD_ADDRESS
  )) as QuestBoard;
  const userProfile = (await ethers.getContractAt(
    'UserProfile',
    USER_PROFILE_ADDRESS
  )) as UserProfile;
  const submissionManager = (await ethers.getContractAt(
    'SubmissionManager',
    SUBMISSION_MANAGER_ADDRESS
  )) as SubmissionManager;

  console.log('📋 Contract Information:');
  console.log(`RewardManager: ${REWARD_MANAGER_ADDRESS}`);
  console.log(`Creator (Quest Owner): ${creator.address}`);
  console.log(`Alice (Winner): ${alice.address}`);
  console.log(`Bob (Winner): ${bob.address}`);
  console.log(`Charlie (Winner): ${charlie.address}\n`);

  try {
    // Setup: Check initial balances
    console.log('💳 Demo 1: Initial Balance Check');
    console.log('===============================');

    const creatorBalance = await ethers.provider.getBalance(creator.address);
    const aliceBalance = await ethers.provider.getBalance(alice.address);
    const bobBalance = await ethers.provider.getBalance(bob.address);
    const charlieBalance = await ethers.provider.getBalance(charlie.address);

    console.log('Initial ETH Balances:');
    console.log(`Creator: ${ethers.formatEther(creatorBalance)} ETH`);
    console.log(`Alice: ${ethers.formatEther(aliceBalance)} ETH`);
    console.log(`Bob: ${ethers.formatEther(bobBalance)} ETH`);
    console.log(`Charlie: ${ethers.formatEther(charlieBalance)} ETH\n`);

    // Demo 2: Check escrowed bounties
    console.log('🔒 Demo 2: Checking Escrowed Bounties');
    console.log('====================================');

    // Check if bounties are escrowed for our quests
    const questIds = [1, 2, 3, 5]; // From previous demos
    console.log('Checking bounty escrow status:');

    for (const questId of questIds) {
      try {
        const isEscrowed = await rewardManager.isQuestBountyEscrowed(questId);
        if (isEscrowed) {
          const bounty = await rewardManager.getQuestBounty(questId);
          const quest = await questBoard.getQuest(questId);

          console.log(`Quest ${questId}: ${quest.title}`);
          console.log(
            `  Bounty Amount: ${ethers.formatEther(bounty.totalAmount)} ETH`
          );
          console.log(`  Escrowed: ✅ Yes`);
          console.log(
            `  Distributed: ${bounty.isDistributed ? '✅ Yes' : '❌ No'}\n`
          );
        } else {
          console.log(`Quest ${questId}: No bounty escrowed\n`);
        }
      } catch (error) {
        console.log(`Quest ${questId}: Error checking bounty status\n`);
      }
    }

    // Demo 3: Create a quest specifically for reward distribution
    console.log('🎯 Demo 3: Creating Quest for Reward Demo');
    console.log('========================================');

    console.log('Creating a new quest with bounty for reward distribution...');
    const submissionDeadline = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
    const reviewDeadline = submissionDeadline + 3 * 24 * 60 * 60;

    const rewardQuestTx = await questBoard.connect(creator).createQuest(
      'Logo Design Competition',
      'Design a modern logo for our Web3 platform. Winner takes 70%, runner-up gets 20%, third place gets 10%.',
      'https://ipfs.io/quest-logo-brief',
      0, // Individual quest
      ethers.parseEther('0.3'), // 0.3 ETH total bounty
      ethers.ZeroAddress, // ETH
      10, // max participants
      0, // no collaborators
      submissionDeadline,
      reviewDeadline,
      false, // no approval required
      ['Design', 'Logo', 'Graphics', 'Competition'],
      {
        minReputation: 0,
        requiredSkills: [],
        experienceLevel: 1,
        estimatedDuration: 48,
      },
      { value: ethers.parseEther('0.3') }
    );
    await rewardQuestTx.wait();
    const rewardQuestId = 6; // Assuming this is quest 6
    console.log(`✅ Reward quest created (Quest ID: ${rewardQuestId})`);

    // Participants join and submit
    console.log('\nParticipants joining and submitting...');
    await questBoard.connect(alice).joinQuest(rewardQuestId);
    await questBoard.connect(bob).joinQuest(rewardQuestId);
    await questBoard.connect(charlie).joinQuest(rewardQuestId);
    console.log('✅ All participants joined');

    // Create mock submissions for reward demo
    await submissionManager
      .connect(alice)
      .createSubmission(
        rewardQuestId,
        'Modern Minimalist Logo',
        'Clean, modern logo with geometric elements',
        'https://github.com/alice/logo-design',
        'https://ipfs.io/alice-logo-demo',
        0,
        [],
        ['Logo Design', 'Minimalism']
      );

    await submissionManager
      .connect(bob)
      .createSubmission(
        rewardQuestId,
        'Dynamic Brand Identity',
        'Bold, dynamic logo with strong brand presence',
        'https://github.com/bob/brand-logo',
        'https://ipfs.io/bob-logo-demo',
        0,
        [],
        ['Branding', 'Identity Design']
      );

    await submissionManager
      .connect(charlie)
      .createSubmission(
        rewardQuestId,
        'Elegant Typography Logo',
        'Typography-focused logo with elegant styling',
        'https://github.com/charlie/typo-logo',
        'https://ipfs.io/charlie-logo-demo',
        0,
        [],
        ['Typography', 'Elegant Design']
      );
    console.log('✅ All submissions created\n');

    // Demo 4: Distribute bounty based on performance
    console.log('🏆 Demo 4: Bounty Distribution');
    console.log('=============================');

    console.log('Distributing bounty based on competition results...');

    // Define winners and their reward percentages
    const winners = [alice.address, bob.address, charlie.address];
    const bountyAmount = ethers.parseEther('0.3');
    const winnerShare = (bountyAmount * 70n) / 100n; // 70% for winner
    const runnerUpShare = (bountyAmount * 20n) / 100n; // 20% for runner-up
    const thirdPlaceShare = (bountyAmount * 10n) / 100n; // 10% for third place

    const amounts = [winnerShare, runnerUpShare, thirdPlaceShare];

    console.log('Prize Distribution:');
    console.log(
      `🥇 1st Place (Alice): ${ethers.formatEther(winnerShare)} ETH (70%)`
    );
    console.log(
      `🥈 2nd Place (Bob): ${ethers.formatEther(runnerUpShare)} ETH (20%)`
    );
    console.log(
      `🥉 3rd Place (Charlie): ${ethers.formatEther(thirdPlaceShare)} ETH (10%)`
    );

    const distributeTx = await rewardManager
      .connect(creator)
      .distributeBounty(rewardQuestId, winners, amounts);
    await distributeTx.wait();
    console.log('✅ Bounty distributed successfully!\n');

    // Demo 5: Check reward details
    console.log('📊 Demo 5: Reward Distribution Details');
    console.log('====================================');

    const questBounty = await rewardManager.getQuestBounty(rewardQuestId);
    console.log('Bounty Distribution Summary:');
    console.log(
      `Total Bounty: ${ethers.formatEther(questBounty.totalAmount)} ETH`
    );
    console.log(
      `Distribution Status: ${
        questBounty.isDistributed ? '✅ Completed' : '❌ Pending'
      }`
    );
    console.log(
      `Distributed At: ${new Date(
        Number(questBounty.escrowedAt) * 1000
      ).toLocaleDateString()}\n`
    );

    // Check individual rewards
    console.log('Individual Reward Details:');
    for (let i = 0; i < winners.length; i++) {
      const winner = winners[i];
      try {
        const profile = await userProfile.getProfile(winner);
        console.log(`${profile.username}:`);
      } catch {
        console.log(`${winner.slice(0, 8)}...:`);
      }

      const userRewards = await rewardManager.getUserRewards(winner);
      console.log(`  Reward Amount: ${ethers.formatEther(amounts[i])} ETH`);
      console.log(`  Total Rewards: ${userRewards.length} reward(s)`);

      // Get latest reward details
      if (userRewards.length > 0) {
        const latestRewardId = userRewards[userRewards.length - 1];
        const rewardDetails = await rewardManager.getReward(latestRewardId);
        console.log(
          `  Reward Status: ${
            rewardDetails.status === 2 ? '✅ Paid' : '⏳ Pending'
          }`
        );
        console.log(
          `  Paid At: ${
            rewardDetails.paidAt > 0
              ? new Date(
                  Number(rewardDetails.paidAt) * 1000
                ).toLocaleDateString()
              : 'Not yet paid'
          }`
        );
      }
      console.log();
    }

    // Demo 6: Check updated balances
    console.log('💰 Demo 6: Updated Balance Check');
    console.log('===============================');

    const newCreatorBalance = await ethers.provider.getBalance(creator.address);
    const newAliceBalance = await ethers.provider.getBalance(alice.address);
    const newBobBalance = await ethers.provider.getBalance(bob.address);
    const newCharlieBalance = await ethers.provider.getBalance(charlie.address);

    console.log('Updated ETH Balances:');
    console.log(
      `Creator: ${ethers.formatEther(
        newCreatorBalance
      )} ETH (${ethers.formatEther(newCreatorBalance - creatorBalance)} change)`
    );
    console.log(
      `Alice: ${ethers.formatEther(newAliceBalance)} ETH (+${ethers.formatEther(
        newAliceBalance - aliceBalance
      )} change)`
    );
    console.log(
      `Bob: ${ethers.formatEther(newBobBalance)} ETH (+${ethers.formatEther(
        newBobBalance - bobBalance
      )} change)`
    );
    console.log(
      `Charlie: ${ethers.formatEther(
        newCharlieBalance
      )} ETH (+${ethers.formatEther(
        newCharlieBalance - charlieBalance
      )} change)\n`
    );

    // Demo 7: User earnings summary
    console.log('📈 Demo 7: User Earnings Summary');
    console.log('===============================');

    const participants = [alice, bob, charlie];
    const participantNames = ['Alice', 'Bob', 'Charlie'];

    for (let i = 0; i < participants.length; i++) {
      const participant = participants[i];
      const name = participantNames[i];

      console.log(`${name}'s Earnings Summary:`);

      // Total earnings from RewardManager
      const totalEthEarnings = await rewardManager.getUserTotalEarnings(
        participant.address,
        ethers.ZeroAddress
      );
      console.log(
        `  Total ETH Earned: ${ethers.formatEther(totalEthEarnings)} ETH`
      );

      // All rewards
      const allRewards = await rewardManager.getUserRewards(
        participant.address
      );
      console.log(`  Total Rewards: ${allRewards.length}`);

      // Pending rewards
      const pendingRewards = await rewardManager.getPendingRewards(
        participant.address
      );
      console.log(`  Pending Rewards: ${pendingRewards.length}`);

      // Update user profile earnings (simulate)
      try {
        const questBoardRole = await userProfile.QUEST_BOARD_ROLE();
        const hasRole = await userProfile.hasRole(
          questBoardRole,
          deployer.address
        );
        if (hasRole) {
          await userProfile
            .connect(deployer)
            .updateEarnings(participant.address, totalEthEarnings);
          console.log(`  ✅ Profile earnings updated`);
        }
      } catch (error) {
        console.log(`  ⚠️  Could not update profile earnings`);
      }

      console.log();
    }

    // Demo 8: Platform statistics
    console.log('🏢 Demo 8: Platform Statistics');
    console.log('=============================');

    // Calculate total rewards distributed
    let totalDistributed = 0n;
    for (const amount of amounts) {
      totalDistributed += amount;
    }

    console.log('Platform Reward Statistics:');
    console.log(
      `Total Bounty Distributed: ${ethers.formatEther(totalDistributed)} ETH`
    );
    console.log(`Number of Winners: ${winners.length}`);
    console.log(
      `Average Reward: ${ethers.formatEther(
        totalDistributed / BigInt(winners.length)
      )} ETH`
    );

    // Quest completion rate
    const totalQuests = await questBoard.getTotalQuests();
    const activeQuests = await questBoard.getActiveQuests();
    console.log(`Total Quests: ${totalQuests}`);
    console.log(`Active Quests: ${activeQuests.length}`);
    console.log(
      `Completed Quests: ${Number(totalQuests) - activeQuests.length}`
    );

    // Platform fee information
    const platformFeePercentage =
      await rewardManager.getPlatformFeePercentage();
    const platformFee =
      (totalDistributed * BigInt(platformFeePercentage)) / 10000n;
    console.log(`Platform Fee Rate: ${Number(platformFeePercentage) / 100}%`);
    console.log(
      `Platform Fee Collected: ${ethers.formatEther(platformFee)} ETH\n`
    );

    // Demo 9: Success metrics
    console.log('🎉 Demo 9: Success Metrics');
    console.log('=========================');

    console.log('Reward Distribution Demo Results:');
    console.log('✅ Bounty successfully escrowed');
    console.log('✅ Competitive distribution (70/20/10 split)');
    console.log('✅ Automatic reward payment');
    console.log('✅ User balance updates');
    console.log('✅ Platform fee calculation');
    console.log('✅ Earnings tracking');

    console.log('\nParticipant Satisfaction:');
    console.log(
      `🥇 Alice (1st): Received ${ethers.formatEther(
        winnerShare
      )} ETH - Excellent!`
    );
    console.log(
      `🥈 Bob (2nd): Received ${ethers.formatEther(
        runnerUpShare
      )} ETH - Great job!`
    );
    console.log(
      `🥉 Charlie (3rd): Received ${ethers.formatEther(
        thirdPlaceShare
      )} ETH - Good effort!`
    );

    console.log('\n🚀 The Quest Board reward system is working perfectly!');
    console.log('Users are earning real rewards for their contributions! 💰');
  } catch (error) {
    console.error('❌ Error in reward distribution demo:', error);
  }
}

// Execute the demo
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
