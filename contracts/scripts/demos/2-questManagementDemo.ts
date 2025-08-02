import { ethers } from 'hardhat';
import { QuestBoard, UserProfile } from '../../typechain-types';

/**
 * Demo: Quest Creation and Management
 * Demonstrates creating quests, managing participants, and quest lifecycle
 */
async function main() {
  console.log('🎯 Quest Board - Quest Management Demo');
  console.log('=====================================\n');

  // Deployed contract addresses
  const QUEST_BOARD_ADDRESS = '0x72D11a8ccd35366ee4021a1D55a7930ab1f00f27';
  const USER_PROFILE_ADDRESS = '0xC6816eBE0a22B1C2de557bEF30852fa8968D2296';

  // Get signers
  const [deployer, creator, alice, bob, charlie] = await ethers.getSigners();

  // Connect to contracts
  const questBoard = (await ethers.getContractAt(
    'QuestBoard',
    QUEST_BOARD_ADDRESS
  )) as QuestBoard;
  const userProfile = (await ethers.getContractAt(
    'UserProfile',
    USER_PROFILE_ADDRESS
  )) as UserProfile;

  console.log('📋 Contract Information:');
  console.log(`QuestBoard Address: ${QUEST_BOARD_ADDRESS}`);
  console.log(`Creator: ${creator.address}`);
  console.log(`Alice: ${alice.address}`);
  console.log(`Bob: ${bob.address}\n`);

  try {
    // Setup: Ensure users have profiles
    console.log('🔧 Setup: Creating User Profiles');
    console.log('===============================');

    const profiles = [
      {
        signer: creator,
        username: 'quest_creator',
        bio: 'Experienced project manager and quest creator',
        skills: ['Project Management', 'Strategy', 'Leadership'],
      },
      {
        signer: alice,
        username: 'alice_designer',
        bio: 'UI/UX Designer',
        skills: ['Design', 'Figma', 'Prototyping'],
      },
      {
        signer: bob,
        username: 'bob_developer',
        bio: 'Full-stack Developer',
        skills: ['React', 'Node.js', 'Solidity'],
      },
      {
        signer: charlie,
        username: 'charlie_writer',
        bio: 'Technical Writer',
        skills: ['Writing', 'Documentation', 'Research'],
      },
    ];

    for (const profile of profiles) {
      try {
        const hasProfile = await userProfile.hasProfile(profile.signer.address);
        if (!hasProfile) {
          console.log(`Creating profile for ${profile.username}...`);
          const tx = await userProfile
            .connect(profile.signer)
            .createProfile(
              profile.username,
              profile.bio,
              `https://ipfs.io/${profile.username}-avatar`,
              profile.skills
            );
          await tx.wait();
          console.log(`✅ Profile created for ${profile.username}`);
        } else {
          console.log(`ℹ️  Profile already exists for ${profile.username}`);
        }
      } catch (error) {
        console.log(
          `⚠️  Could not create profile for ${profile.username}:`,
          error.message
        );
      }
    }
    console.log();

    // Demo 1: Create different types of quests
    console.log('🎯 Demo 1: Creating Different Types of Quests');
    console.log('============================================');

    // Quest 1: Design Quest (ETH bounty)
    console.log('Creating Design Quest with ETH bounty...');
    const bountyAmount = ethers.parseEther('0.1'); // 0.1 ETH
    const submissionDeadline = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days
    const reviewDeadline = submissionDeadline + 3 * 24 * 60 * 60; // 3 days after submission

    const designQuestTx = await questBoard.connect(creator).createQuest(
      'Modern Website Redesign',
      'Redesign our company website with a modern, clean interface. Should include homepage, about, and contact pages.',
      'https://ipfs.io/quest-design-brief',
      0, // QuestType.Individual
      bountyAmount,
      ethers.ZeroAddress, // ETH
      5, // max participants
      0, // max collaborators (individual quest)
      submissionDeadline,
      reviewDeadline,
      true, // requires approval
      ['Design', 'UI/UX', 'Website', 'Figma'],
      {
        minReputation: 0,
        requiredSkills: ['Design'],
        experienceLevel: 1, // Beginner
        estimatedDuration: 168, // 7 days in hours
      },
      { value: bountyAmount }
    );
    await designQuestTx.wait();
    console.log('✅ Design quest created (Quest ID: 1)');

    // Quest 2: Development Quest
    console.log('Creating Development Quest...');
    const devQuestTx = await questBoard.connect(creator).createQuest(
      'Smart Contract Audit',
      'Conduct a security audit of our DeFi smart contracts. Should include vulnerability assessment and recommendations.',
      'https://ipfs.io/quest-audit-brief',
      1, // QuestType.Collaborative
      ethers.parseEther('0.2'),
      ethers.ZeroAddress,
      3, // max participants
      2, // max collaborators
      submissionDeadline,
      reviewDeadline,
      true,
      ['Solidity', 'Security', 'Audit', 'DeFi'],
      {
        minReputation: 50,
        requiredSkills: ['Solidity'],
        experienceLevel: 3, // Expert
        estimatedDuration: 240, // 10 days
      },
      { value: ethers.parseEther('0.2') }
    );
    await devQuestTx.wait();
    console.log('✅ Development quest created (Quest ID: 2)');

    // Quest 3: Content Creation Quest
    console.log('Creating Content Creation Quest...');
    const contentQuestTx = await questBoard.connect(creator).createQuest(
      'Technical Documentation',
      'Write comprehensive technical documentation for our API. Should include examples, tutorials, and best practices.',
      'https://ipfs.io/quest-docs-brief',
      0, // Individual
      ethers.parseEther('0.05'),
      ethers.ZeroAddress,
      10, // max participants
      0,
      submissionDeadline,
      reviewDeadline,
      false, // no approval required
      ['Writing', 'Documentation', 'Technical', 'API'],
      {
        minReputation: 0,
        requiredSkills: ['Writing'],
        experienceLevel: 2, // Intermediate
        estimatedDuration: 120, // 5 days
      },
      { value: ethers.parseEther('0.05') }
    );
    await contentQuestTx.wait();
    console.log('✅ Content creation quest created (Quest ID: 3)\n');

    // Demo 2: Display active quests
    console.log('📊 Demo 2: Viewing Active Quests');
    console.log('===============================');

    const activeQuests = await questBoard.getActiveQuests();
    console.log(`Found ${activeQuests.length} active quests:`);

    for (let i = 0; i < activeQuests.length; i++) {
      const questId = activeQuests[i];
      const quest = await questBoard.getQuest(questId);
      const requirements = await questBoard.getQuestRequirements(questId);

      console.log(`\nQuest ${questId}: ${quest.title}`);
      console.log(`  Description: ${quest.description}`);
      console.log(`  Bounty: ${ethers.formatEther(quest.bountyAmount)} ETH`);
      console.log(
        `  Participants: ${quest.currentParticipants}/${quest.maxParticipants}`
      );
      console.log(`  Min Reputation: ${requirements.minReputation}`);
      console.log(`  Requires Approval: ${quest.requiresApproval}`);
      console.log(
        `  Deadline: ${new Date(
          Number(quest.submissionDeadline) * 1000
        ).toLocaleDateString()}`
      );
      console.log(`  Tags: ${quest.tags.join(', ')}`);
    }
    console.log();

    // Demo 3: Join quests
    console.log('👥 Demo 3: Joining Quests');
    console.log('========================');

    // Alice joins the design quest (requires approval)
    console.log('Alice joining Design Quest (requires approval)...');
    const aliceJoinTx = await questBoard.connect(alice).joinQuest(1);
    await aliceJoinTx.wait();
    console.log('✅ Alice requested to join Quest 1');

    // Bob joins the development quest (requires approval)
    console.log('Bob joining Development Quest (requires approval)...');
    const bobJoinTx = await questBoard.connect(bob).joinQuest(2);
    await bobJoinTx.wait();
    console.log('✅ Bob requested to join Quest 2');

    // Charlie joins the content quest (no approval required)
    console.log('Charlie joining Content Quest (no approval required)...');
    const charlieJoinTx = await questBoard.connect(charlie).joinQuest(3);
    await charlieJoinTx.wait();
    console.log('✅ Charlie joined Quest 3 automatically\n');

    // Demo 4: Approve participants
    console.log('✅ Demo 4: Approving Quest Participants');
    console.log('======================================');

    // Creator approves Alice for design quest
    console.log('Creator approving Alice for Design Quest...');
    const approveAliceTx = await questBoard
      .connect(creator)
      .approveParticipant(1, alice.address);
    await approveAliceTx.wait();
    console.log('✅ Alice approved for Quest 1');

    // Creator approves Bob for development quest
    console.log('Creator approving Bob for Development Quest...');
    const approveBobTx = await questBoard
      .connect(creator)
      .approveParticipant(2, bob.address);
    await approveBobTx.wait();
    console.log('✅ Bob approved for Quest 2\n');

    // Demo 5: Check quest participants
    console.log('👥 Demo 5: Current Quest Participants');
    console.log('====================================');

    for (let questId = 1; questId <= 3; questId++) {
      const participants = await questBoard.getQuestParticipants(questId);
      const quest = await questBoard.getQuest(questId);

      console.log(`Quest ${questId} (${quest.title}):`);
      console.log(
        `  Participants (${participants.length}/${quest.maxParticipants}):`
      );

      for (const participant of participants) {
        try {
          const profile = await userProfile.getProfile(participant);
          console.log(
            `    - ${profile.username} (${participant.slice(0, 8)}...)`
          );
        } catch {
          console.log(`    - ${participant.slice(0, 8)}... (no profile)`);
        }
      }
      console.log();
    }

    // Demo 6: Quest management operations
    console.log('⚙️  Demo 6: Quest Management Operations');
    console.log('====================================');

    // Update quest description
    console.log('Updating Quest 1 description...');
    const updateTx = await questBoard
      .connect(creator)
      .updateQuest(
        1,
        'Modern Website Redesign - Updated',
        'Redesign our company website with a modern, clean interface. UPDATED: Please include mobile-first design approach.',
        'https://ipfs.io/quest-design-brief-updated'
      );
    await updateTx.wait();
    console.log('✅ Quest 1 updated');

    // Pause a quest
    console.log('Pausing Quest 2 temporarily...');
    const pauseTx = await questBoard.connect(creator).pauseQuest(2);
    await pauseTx.wait();
    console.log('✅ Quest 2 paused');

    // Resume the quest
    console.log('Resuming Quest 2...');
    const resumeTx = await questBoard.connect(creator).resumeQuest(2);
    await resumeTx.wait();
    console.log('✅ Quest 2 resumed\n');

    // Demo 7: Query quests by creator and tags
    console.log('🔍 Demo 7: Querying Quests');
    console.log('=========================');

    // Get quests by creator
    const creatorQuests = await questBoard.getQuestsByCreator(creator.address);
    console.log(`Creator has created ${creatorQuests.length} quests`);

    // Get quests by tag
    const designQuests = await questBoard.getQuestsByTag('Design');
    console.log(`Found ${designQuests.length} quests with 'Design' tag`);

    const devQuests = await questBoard.getQuestsByTag('Solidity');
    console.log(`Found ${devQuests.length} quests with 'Solidity' tag`);

    // Total quests
    const totalQuests = await questBoard.getTotalQuests();
    console.log(`Total quests created: ${totalQuests}\n`);

    // Demo 8: Final quest status
    console.log('📊 Demo 8: Final Quest Status Summary');
    console.log('====================================');

    for (let questId = 1; questId <= 3; questId++) {
      const quest = await questBoard.getQuest(questId);
      const participants = await questBoard.getQuestParticipants(questId);

      console.log(`Quest ${questId}: ${quest.title}`);
      console.log(
        `  Status: ${
          quest.status === 0
            ? 'Draft'
            : quest.status === 1
            ? 'Active'
            : quest.status === 2
            ? 'Paused'
            : quest.status === 3
            ? 'Completed'
            : 'Cancelled'
        }`
      );
      console.log(`  Bounty: ${ethers.formatEther(quest.bountyAmount)} ETH`);
      console.log(
        `  Participants: ${participants.length}/${quest.maxParticipants}`
      );
      console.log(
        `  Created: ${new Date(
          Number(quest.createdAt) * 1000
        ).toLocaleDateString()}`
      );
      console.log(
        `  Deadline: ${new Date(
          Number(quest.submissionDeadline) * 1000
        ).toLocaleDateString()}\n`
      );
    }

    console.log('🎉 Quest Management Demo completed successfully!');
    console.log(
      'Created 3 quests, managed participants, and demonstrated quest lifecycle!'
    );
  } catch (error) {
    console.error('❌ Error in quest management demo:', error);
  }
}

// Execute the demo
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
