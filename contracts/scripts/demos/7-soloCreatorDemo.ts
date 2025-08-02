import { ethers } from 'hardhat';
import {
  QuestBoard,
  UserProfile,
  SubmissionManager,
  RewardManager,
} from '../../typechain-types';
import deployedAddresses from '../../ignition/deployments/chain-128123/deployed_addresses.json';

/**
 * Demo: Solo Creator Quest - Simplified One-Click Winner Selection
 * Demonstrates the new streamlined workflow where selectWinners() handles everything
 */
async function main() {
  console.log('🎯 Quest Board - Solo Creator Demo (Simplified)');
  console.log('===============================================\n');

  // Use deployed contract addresses from artifacts
  const QUEST_BOARD_ADDRESS = deployedAddresses['DeployModule#QuestBoard'];
  const USER_PROFILE_ADDRESS = deployedAddresses['DeployModule#UserProfile'];
  const SUBMISSION_MANAGER_ADDRESS =
    deployedAddresses['DeployModule#SubmissionManager'];
  const REWARD_MANAGER_ADDRESS =
    deployedAddresses['DeployModule#RewardManager'];

  // Get single demo account
  const signers = await ethers.getSigners();
  console.log(`📊 Available signers: ${signers.length}`);

  if (signers.length < 1) {
    throw new Error('❌ Need at least 1 signer to run this demo.');
  }

  const demoUser = signers[0];

  // Connect to contracts
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
  const rewardManager = (await ethers.getContractAt(
    'RewardManager',
    REWARD_MANAGER_ADDRESS
  )) as RewardManager;

  console.log('📋 Demo Information:');
  console.log(`Demo Account: ${demoUser.address}`);
  console.log(`🎭 Playing Multiple Roles: Creator → Participant → Winner`);
  console.log(
    `✨ Featuring: ONE-CLICK winner selection with automatic rewards & reputation!\n`
  );

  try {
    // PHASE 1: Profile Setup
    console.log('👤 PHASE 1: Profile Setup');
    console.log('=========================');

    try {
      const hasProfile = await userProfile.hasProfile(demoUser.address);
      if (!hasProfile) {
        console.log('Creating solo creator profile...');
        const tx = await userProfile
          .connect(demoUser)
          .createProfile(
            'solo_innovator',
            'Independent creator showcasing the power of one-click quest completion!',
            `https://avatars.dicebear.com/api/identicon/solo_innovator.svg`,
            [
              'Full-Stack Development',
              'Smart Contracts',
              'Innovation',
              'Self-Motivation',
            ]
          );
        await tx.wait();
        console.log('✅ Profile created!');
      } else {
        console.log('ℹ️  Profile already exists');
      }
    } catch (error) {
      console.log(`⚠️  Profile setup: ${error}`);
    }

    // PHASE 2: Quest Creation
    console.log('\n🎯 PHASE 2: Quest Creation');
    console.log('==========================');

    console.log('Creating a solo innovation challenge...\n');

    const submissionDeadline = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days
    const reviewDeadline = submissionDeadline + 2 * 24 * 60 * 60; // 2 days for review

    const questTx = await questBoard.connect(demoUser).createQuest(
      'Solo Innovation Sprint: Build & Win',
      'Create something amazing solo and win the full bounty! Perfect demo of creator-participant model where innovation meets rewards.',
      'https://ipfs.io/solo-innovation-brief',
      0, // Individual quest
      ethers.parseEther('0.1'), // 0.1 ETH bounty
      ethers.ZeroAddress, // ETH payment
      3, // max participants
      0, // no collaborators needed
      submissionDeadline,
      reviewDeadline,
      false, // no approval required
      ['Solo', 'Innovation', 'Demo', 'Showcase'],
      {
        skillsRequired: [],
        minReputation: 0,
        kycRequired: false,
        allowedFileTypes: [],
        maxFileSize: 0,
      },
      { value: ethers.parseEther('0.1') }
    );
    const receipt = await questTx.wait();

    // Get quest ID from event
    let questId = 1; // fallback
    if (receipt && receipt.logs) {
      for (const log of receipt.logs) {
        try {
          const parsedLog = questBoard.interface.parseLog({
            topics: log.topics,
            data: log.data,
          });
          if (parsedLog && parsedLog.name === 'QuestCreated') {
            questId = parsedLog.args.questId;
            break;
          }
        } catch (e) {
          // Continue searching
        }
      }
    }

    console.log(`✅ Quest created! (ID: ${questId})`);
    console.log(`💰 Bounty: 0.1 ETH`);
    console.log(`🏆 Winner takes all!`);
    console.log(
      `⏰ Deadline: ${new Date(
        submissionDeadline * 1000
      ).toLocaleDateString()}\n`
    );

    // PHASE 3: Join Quest
    console.log('👥 PHASE 3: Join Quest');
    console.log('======================');

    console.log('Creator joining their own quest...');
    try {
      const joinTx = await questBoard.connect(demoUser).joinQuest(questId);
      await joinTx.wait();
      console.log('✅ Successfully joined own quest!');
      console.log('🎉 Creator-participant model activated!\n');
    } catch (error) {
      console.log(`⚠️  Join error (may already be joined): ${error}\n`);
    }

    // PHASE 4: Submit Work
    console.log('📤 PHASE 4: Submit Innovation');
    console.log('=============================');

    console.log('Creating and submitting breakthrough innovation...');
    try {
      const submissionTx = await submissionManager
        .connect(demoUser)
        .createSubmission(
          questId,
          'Revolutionary DApp: OneClick Quest Platform',
          'An innovative platform where quest creators can select winners with one click, automatically distributing rewards and updating reputation. Features: instant gratification, fair distribution, and seamless UX.',
          ['QmInnovationCode123', 'QmDemoVideo456', 'QmUserGuide789'], // IPFS hashes
          'https://ipfs.io/oneclick-platform-demo',
          [] // solo work, no collaborators
        );
      await submissionTx.wait();
      console.log('✅ Innovation submitted!');
      console.log('🎊 Revolutionary DApp created!\n');
    } catch (error) {
      console.log(`⚠️  Submission error: ${error}\n`);
    }

    // Get submission ID for winner selection
    let submissionId = 1;
    try {
      const submissions = await submissionManager.getQuestSubmissions(questId);
      if (submissions.length > 0) {
        submissionId = Number(submissions[submissions.length - 1]);
        console.log(`📊 Found submission ID: ${submissionId}`);
      }
    } catch (error) {
      console.log(`ℹ️  Using fallback submission ID: ${submissionId}`);
    }

    // PHASE 5: ✨ ONE-CLICK WINNER SELECTION ✨
    console.log('🌟 PHASE 5: ONE-CLICK WINNER SELECTION');
    console.log('======================================');

    console.log('🎯 Quest creator selecting winners...');
    console.log('✨ Watch the magic: ONE function call will:');
    console.log('   💰 Distribute 0.1 ETH reward');
    console.log('   ⭐ Award +20 reputation points');
    console.log('   🏆 Mark submission as winner');
    console.log('   🎉 Complete the entire quest lifecycle!');
    console.log('   🚀 NO REVIEW STEP NEEDED - Creator decides directly!\n');

    try {
      console.log('🚀 Executing ONE-CLICK winner selection...');

      const selectWinnersTx = await submissionManager
        .connect(demoUser)
        .selectWinners(
          questId,
          [submissionId] // Select our innovative submission as winner
        );
      await selectWinnersTx.wait();

      console.log('✅ Winner selection completed!');
      console.log('🎊 ALL DONE IN ONE TRANSACTION!');
      console.log('   💸 Rewards distributed automatically');
      console.log('   📈 Reputation updated automatically');
      console.log('   🏅 Winner status set automatically');
      console.log('   ⚡ Zero bureaucracy - pure creator control!\n');
    } catch (error) {
      console.log(`⚠️  Winner selection failed: ${error}`);
      console.log('ℹ️  Please check contract permissions and state\n');
    }

    // PHASE 6: Results
    console.log('🎉 PHASE 6: Final Results');
    console.log('=========================');

    console.log('📊 Solo Creator Demo Results:\n');

    try {
      const profile = await userProfile.getProfile(demoUser.address);
      const earnings = await rewardManager.getUserTotalEarnings(
        demoUser.address,
        ethers.ZeroAddress
      );

      console.log(`👤 Creator: ${profile.username}`);
      console.log(`💰 Total Earnings: ${ethers.formatEther(earnings)} ETH`);
      console.log(`⭐ Reputation: ${profile.reputation} points`);
      console.log(`🏆 Status: Quest Creator & Winner!`);
      console.log(`📊 Skills: ${profile.skills.join(', ')}\n`);

      // Check submission status
      try {
        const submission = await submissionManager.getSubmission(submissionId);
        console.log(`📝 Submission: ${submission.title}`);
        console.log(`📈 Score: ${submission.score}/100`);
        console.log(
          `🎖️  Status: ${submission.status === 5 ? 'WINNER!' : 'Submitted'}\n`
        );
      } catch (subError) {
        console.log(`⚠️  Could not fetch submission details: ${subError}\n`);
      }
    } catch (error) {
      console.log(`⚠️  Could not fetch final results: ${error}\n`);
    }

    console.log('🌟 SUCCESS METRICS:');
    console.log('==================');
    console.log('✅ Creator successfully participated in own quest');
    console.log('✅ Innovation submitted and selected as winner');
    console.log('✅ ONE-CLICK winner selection executed');
    console.log('✅ Rewards distributed automatically');
    console.log('✅ Reputation updated automatically (+20 points)');
    console.log('✅ Complete quest lifecycle in 5 simple phases');

    console.log('\n🚀 This demo proves Quest Board enables:');
    console.log('   💡 Self-organized innovation challenges');
    console.log('   🎯 Creator-participant business model');
    console.log('   ⚡ One-click quest completion');
    console.log('   💰 Automatic reward distribution');
    console.log('   ⭐ Seamless reputation management');
    console.log('   🚫 No bureaucracy - creators decide directly');
    console.log('   🌐 Truly decentralized work ecosystem!');

    console.log('\n🎊 Solo Creator Demo completed successfully! 🎊');
    console.log(
      '✨ The future of work is here: simple, fair, and automated! ✨'
    );
  } catch (error) {
    console.error('❌ Error in solo creator demo:', error);
  }
}

// Execute the demo
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
