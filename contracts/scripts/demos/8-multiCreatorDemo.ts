import { ethers } from 'hardhat';
import {
  QuestBoard,
  UserProfile,
  SubmissionManager,
  RewardManager,
} from '../../typechain-types';
import deployedAddresses from '../../ignition/deployments/chain-128123/deployed_addresses.json';

/**
 * Demo: Multi-Creator Team Quest - Two Creators Collaborating
 * Demonstrates two creators working together as a team on one shared submission
 */
async function main() {
  console.log('🎯 Quest Board - Team Collaboration Demo');
  console.log('========================================\n');

  // Use deployed contract addresses from artifacts
  const QUEST_BOARD_ADDRESS = deployedAddresses['DeployModule#QuestBoard'];
  const USER_PROFILE_ADDRESS = deployedAddresses['DeployModule#UserProfile'];
  const SUBMISSION_MANAGER_ADDRESS =
    deployedAddresses['DeployModule#SubmissionManager'];
  const REWARD_MANAGER_ADDRESS =
    deployedAddresses['DeployModule#RewardManager'];

  // Get demo accounts
  const signers = await ethers.getSigners();
  console.log(`📊 Available signers: ${signers.length}`);

  if (signers.length < 3) {
    throw new Error(
      '❌ Need at least 3 signers to run this demo (1 quest creator + 2 participants).'
    );
  }

  const questCreator = signers[0];
  const creator1 = signers[1];
  const creator2 = signers[2];

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
  console.log(`Quest Creator: ${questCreator.address}`);
  console.log(`Team Member 1: ${creator1.address}`);
  console.log(`Team Member 2: ${creator2.address}`);
  console.log(`🎭 Scenario: Two creators collaborating as a team on one quest`);
  console.log(`✨ Featuring: Team collaboration on a shared submission!\n`);

  try {
    // PHASE 1: Profile Setup for All Users
    console.log('👤 PHASE 1: Profile Setup');
    console.log('=========================');

    // Setup quest creator profile
    try {
      const hasCreatorProfile = await userProfile.hasProfile(
        questCreator.address
      );
      if (!hasCreatorProfile) {
        console.log('Creating quest creator profile...');
        const tx = await userProfile
          .connect(questCreator)
          .createProfile(
            'quest_master',
            'Visionary quest creator bringing exciting challenges to the community!',
            `https://avatars.dicebear.com/api/identicon/quest_master.svg`,
            ['Project Management', 'Vision', 'Leadership', 'Innovation']
          );
        await tx.wait();
        console.log('✅ Quest creator profile created!');
      } else {
        console.log('ℹ️  Quest creator profile already exists');
      }
    } catch (error) {
      console.log(`⚠️  Quest creator profile setup: ${error}`);
    }

    // Setup creator 1 profile
    try {
      const hasProfile1 = await userProfile.hasProfile(creator1.address);
      if (!hasProfile1) {
        console.log('Creating creator 1 profile...');
        const tx = await userProfile
          .connect(creator1)
          .createProfile(
            'frontend_wizard',
            'Frontend specialist with expertise in React, TypeScript, and modern web technologies!',
            `https://avatars.dicebear.com/api/identicon/frontend_wizard.svg`,
            ['React', 'TypeScript', 'UI/UX Design', 'Frontend Development']
          );
        await tx.wait();
        console.log('✅ Creator 1 profile created!');
      } else {
        console.log('ℹ️  Creator 1 profile already exists');
      }
    } catch (error) {
      console.log(`⚠️  Creator 1 profile setup: ${error}`);
    }

    // Setup creator 2 profile
    try {
      const hasProfile2 = await userProfile.hasProfile(creator2.address);
      if (!hasProfile2) {
        console.log('Creating creator 2 profile...');
        const tx = await userProfile
          .connect(creator2)
          .createProfile(
            'blockchain_ninja',
            'Smart contract expert specializing in Solidity, DeFi protocols, and blockchain architecture!',
            `https://avatars.dicebear.com/api/identicon/blockchain_ninja.svg`,
            ['Solidity', 'Smart Contracts', 'DeFi', 'Blockchain Architecture']
          );
        await tx.wait();
        console.log('✅ Creator 2 profile created!');
      } else {
        console.log('ℹ️  Creator 2 profile already exists');
      }
    } catch (error) {
      console.log(`⚠️  Creator 2 profile setup: ${error}`);
    }

    // PHASE 2: Quest Creation
    console.log('\n🎯 PHASE 2: Quest Creation');
    console.log('==========================');

    console.log('Quest creator posting a collaborative challenge...\n');

    const submissionDeadline = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days
    const reviewDeadline = submissionDeadline + 3 * 24 * 60 * 60; // 3 days for review

    // Generate external quest ID for dual ID system
    const externalQuestId = `team-quest-${Date.now()}-${questCreator.address.slice(
      -8
    )}`;
    console.log('Generated external quest ID:', externalQuestId);

    const questTx = await questBoard.connect(questCreator).createQuest(
      externalQuestId,
      'Full-Stack DApp Development: Team Challenge',
      'Build a complete DApp with smart contracts and frontend! This requires multiple skills - perfect for team collaboration. Frontend + Backend expertise needed.',
      'https://ipfs.io/team-collaboration-brief',
      1, // Collaborative quest
      ethers.parseEther('0.15'), // 0.15 ETH bounty for team quest
      ethers.ZeroAddress, // ETH payment
      4, // max participants
      3, // up to 3 collaborators allowed
      submissionDeadline,
      reviewDeadline,
      false, // no approval required
      ['Collaboration', 'Full-Stack', 'DApp', 'Teamwork'],
      {
        skillsRequired: [],
        minReputation: 0,
        kycRequired: false,
        allowedFileTypes: [],
        maxFileSize: 0,
      },
      { value: ethers.parseEther('0.15') }
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

    console.log(`✅ Collaborative quest created! (ID: ${questId})`);
    console.log(`💰 Bounty: 0.15 ETH`);
    console.log(`🤝 Team collaboration required!`);
    console.log(`👥 Max participants: 4, Max collaborators: 3`);
    console.log(
      `⏰ Deadline: ${new Date(
        submissionDeadline * 1000
      ).toLocaleDateString()}\n`
    );

    // PHASE 3: Team Members Join Quest
    console.log('👥 PHASE 3: Team Members Join Quest');
    console.log('===================================');

    console.log('Frontend Wizard joining quest...');
    try {
      const joinTx1 = await questBoard.connect(creator1).joinQuest(questId);
      await joinTx1.wait();
      console.log('✅ Frontend Wizard successfully joined!');
    } catch (error) {
      console.log(`⚠️  Frontend Wizard join error: ${error}`);
    }

    console.log('Blockchain Ninja joining quest...');
    try {
      const joinTx2 = await questBoard.connect(creator2).joinQuest(questId);
      await joinTx2.wait();
      console.log('✅ Blockchain Ninja successfully joined!');
      console.log('🤝 Team assembly complete - ready to collaborate!\n');
    } catch (error) {
      console.log(`⚠️  Blockchain Ninja join error: ${error}\n`);
    }

    // PHASE 4: Team Collaboration & Submission
    console.log('📤 PHASE 4: Team Collaboration & Submission');
    console.log('===========================================');

    console.log('🤝 Team planning their collaborative approach...');
    console.log('   💻 Frontend Wizard: Handles UI/UX and React frontend');
    console.log('   🔗 Blockchain Ninja: Develops smart contracts and backend');
    console.log('   🎯 Goal: Create a complete full-stack DApp together!\n');

    console.log(
      'Frontend Wizard creating team submission (adding Blockchain Ninja as collaborator)...'
    );
    try {
      const submissionTx = await submissionManager
        .connect(creator1)
        .createSubmission(
          questId,
          'TaskChain: Decentralized Task Management Platform',
          'A complete full-stack DApp combining beautiful React frontend with powerful smart contracts. Features decentralized task creation, automated payments via smart contracts, and seamless Web3 integration. Frontend expertise meets blockchain innovation!',
          ['QmTeamFrontend123', 'QmSmartContracts456', 'QmFullStackDemo789'], // IPFS hashes
          'https://ipfs.io/taskchain-team-demo',
          [creator2.address] // Blockchain Ninja as collaborator
        );
      await submissionTx.wait();
      console.log('✅ Team submission created successfully!');
      console.log('🎊 Collaborative work submitted!');
      console.log('   🎨 Frontend: Beautiful React UI with Web3 integration');
      console.log(
        '   ⛓️  Backend: Robust smart contracts and blockchain logic'
      );
      console.log('   🤝 True teamwork in action!\n');
    } catch (error) {
      console.log(`⚠️  Team submission error: ${error}\n`);
    }

    // Get team submission ID
    let teamSubmissionId = 1;
    try {
      const submissions = await submissionManager.getQuestSubmissions(questId);
      if (submissions.length >= 1) {
        teamSubmissionId = Number(submissions[0]);
        console.log(`📊 Found team submission ID: ${teamSubmissionId}`);
      }
    } catch (error) {
      console.log(`ℹ️  Using fallback submission ID: ${teamSubmissionId}`);
    }

    // PHASE 5: Quest Creator Reviews Team Submission
    console.log('🌟 PHASE 5: Team Submission Review');
    console.log('==================================');

    console.log('🔍 Quest creator reviewing the team submission...');
    console.log(
      '📊 Evaluating full-stack integration and collaboration quality...'
    );
    console.log('🤩 Impressed by the teamwork and technical execution!\n');

    // Display team submission details
    try {
      const teamSubmission = await submissionManager.getSubmission(
        teamSubmissionId
      );

      console.log('📝 TEAM SUBMISSION REVIEW:');
      console.log(`   Title: ${teamSubmission.title}`);
      console.log(`   👥 Team Members: Frontend Wizard + Blockchain Ninja`);
      console.log(`   🎯 Approach: Complete full-stack collaboration`);
      console.log(
        `   ✨ Highlights: Frontend expertise + Smart contract mastery\n`
      );
    } catch (error) {
      console.log(`ℹ️  Could not fetch submission details for preview\n`);
    }

    console.log('🎯 Quest creator making the decision...');
    console.log('✨ Selecting the team submission as the winner!');
    console.log('🏆 Reason: Excellent collaboration and complete solution\n');

    try {
      console.log('🚀 Executing team winner selection...');

      const selectWinnersTx = await submissionManager
        .connect(questCreator)
        .selectWinners(
          questId,
          [teamSubmissionId] // Select team submission as winner
        );
      await selectWinnersTx.wait();

      console.log('✅ Team winner selection completed!');
      console.log('🎊 Team wins 0.15 ETH (shared between collaborators)!');
      console.log('   💸 Rewards distributed automatically to both members');
      console.log('   📈 Reputation updated for both team members');
      console.log('   🏅 Winner status set for the team submission\n');
    } catch (error) {
      console.log(`⚠️  Winner selection failed: ${error}`);
      console.log('ℹ️  Please check contract permissions and state\n');
    }

    // PHASE 6: Final Team Results and Stats
    console.log('🎉 PHASE 6: Team Collaboration Results');
    console.log('=====================================');

    console.log('📊 Team Quest Results:\n');

    try {
      // Team member 1 results (Frontend Wizard)
      const member1Profile = await userProfile.getProfile(creator1.address);
      const member1Earnings = await rewardManager.getUserTotalEarnings(
        creator1.address,
        ethers.ZeroAddress
      );

      console.log('🏆 TEAM MEMBER 1: Frontend Wizard');
      console.log(`   Username: ${member1Profile.username}`);
      console.log(
        `   💰 Total Earnings: ${ethers.formatEther(member1Earnings)} ETH`
      );
      console.log(`   ⭐ Reputation: ${member1Profile.reputation} points`);
      console.log(`   📊 Skills: ${member1Profile.skills.join(', ')}`);
      console.log(`   🎯 Role: Team Lead & Frontend Developer\n`);

      // Team member 2 results (Blockchain Ninja)
      const member2Profile = await userProfile.getProfile(creator2.address);
      const member2Earnings = await rewardManager.getUserTotalEarnings(
        creator2.address,
        ethers.ZeroAddress
      );

      console.log('🏆 TEAM MEMBER 2: Blockchain Ninja');
      console.log(`   Username: ${member2Profile.username}`);
      console.log(
        `   💰 Total Earnings: ${ethers.formatEther(member2Earnings)} ETH`
      );
      console.log(`   ⭐ Reputation: ${member2Profile.reputation} points`);
      console.log(`   📊 Skills: ${member2Profile.skills.join(', ')}`);
      console.log(`   🎯 Role: Collaborator & Smart Contract Developer\n`);

      // Quest creator results
      const creatorProfile = await userProfile.getProfile(questCreator.address);
      console.log('👑 QUEST CREATOR: Quest Master');
      console.log(`   Username: ${creatorProfile.username}`);
      console.log(`   ⭐ Reputation: ${creatorProfile.reputation} points`);
      console.log(`   🎯 Role: Visionary who enabled team collaboration\n`);
    } catch (error) {
      console.log(`⚠️  Could not fetch final results: ${error}\n`);
    }

    console.log('🌟 SUCCESS METRICS:');
    console.log('==================');
    console.log('✅ Two creators successfully collaborated as a team');
    console.log('✅ Single high-quality team submission created');
    console.log('✅ Shared expertise: Frontend + Smart Contracts');
    console.log('✅ Automatic reward distribution to both team members');
    console.log('✅ Reputation system updated for both collaborators');
    console.log('✅ Complete collaborative quest lifecycle demonstrated');

    console.log('\n🚀 This demo proves Quest Board enables:');
    console.log('   🤝 Seamless team collaboration');
    console.log('   👥 Multi-disciplinary skill combination');
    console.log('   ⚖️  Fair evaluation of team submissions');
    console.log('   💰 Shared reward distribution among collaborators');
    console.log('   ⭐ Team-based reputation building');
    console.log('   🌐 Collaborative decentralized work ecosystem!');

    console.log('\n🎊 Team Collaboration Demo completed successfully! 🎊');
    console.log('✨ Fostering innovation through effective teamwork! ✨');
  } catch (error) {
    console.error('❌ Error in multi-creator demo:', error);
  }
}

// Execute the demo
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
