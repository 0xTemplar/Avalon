import { ethers } from 'hardhat';
import {
  CollaborationManager,
  QuestBoard,
  UserProfile,
} from '../../typechain-types';

/**
 * Demo: Collaboration and Team Management
 * Demonstrates creating teams, managing members, and collaborative workflows
 */
async function main() {
  console.log('🤝 Quest Board - Collaboration Demo');
  console.log('===================================\n');

  // Deployed contract addresses
  const COLLABORATION_MANAGER_ADDRESS =
    '0xa281E6a50006bD377A9A0601AAb76DFBc9D6d0e7';
  const QUEST_BOARD_ADDRESS = '0x72D11a8ccd35366ee4021a1D55a7930ab1f00f27';
  const USER_PROFILE_ADDRESS = '0xC6816eBE0a22B1C2de557bEF30852fa8968D2296';

  // Get signers
  const [deployer, creator, alice, bob, charlie, diana] =
    await ethers.getSigners();

  // Connect to contracts
  const collaborationManager = (await ethers.getContractAt(
    'CollaborationManager',
    COLLABORATION_MANAGER_ADDRESS
  )) as CollaborationManager;
  const questBoard = (await ethers.getContractAt(
    'QuestBoard',
    QUEST_BOARD_ADDRESS
  )) as QuestBoard;
  const userProfile = (await ethers.getContractAt(
    'UserProfile',
    USER_PROFILE_ADDRESS
  )) as UserProfile;

  console.log('📋 Contract Information:');
  console.log(`CollaborationManager: ${COLLABORATION_MANAGER_ADDRESS}`);
  console.log(`Alice (Team Leader): ${alice.address}`);
  console.log(`Bob (Developer): ${bob.address}`);
  console.log(`Charlie (Designer): ${charlie.address}`);
  console.log(`Diana (Writer): ${diana.address}\n`);

  try {
    // Setup: Ensure users have profiles
    console.log('🔧 Setup: Creating User Profiles');
    console.log('===============================');

    const profiles = [
      {
        signer: creator,
        username: 'quest_creator',
        bio: 'Project manager creating collaborative quests',
        skills: ['Management', 'Strategy'],
      },
      {
        signer: alice,
        username: 'alice_leader',
        bio: 'Experienced team leader and project coordinator',
        skills: ['Leadership', 'Project Management', 'Strategy'],
      },
      {
        signer: bob,
        username: 'bob_dev',
        bio: 'Senior full-stack developer',
        skills: ['React', 'Node.js', 'Solidity', 'MongoDB'],
      },
      {
        signer: charlie,
        username: 'charlie_design',
        bio: 'Creative UI/UX designer',
        skills: ['UI/UX', 'Figma', 'Prototyping', 'Design Systems'],
      },
      {
        signer: diana,
        username: 'diana_writer',
        bio: 'Technical writer and content strategist',
        skills: ['Technical Writing', 'Content Strategy', 'Documentation'],
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
        console.log(`⚠️  Could not create profile for ${profile.username}`);
      }
    }
    console.log();

    // Demo 1: Create a collaborative quest
    console.log('🎯 Demo 1: Creating a Collaborative Quest');
    console.log('========================================');

    console.log('Creating a multi-disciplinary quest...');
    const submissionDeadline =
      Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60; // 14 days
    const reviewDeadline = submissionDeadline + 3 * 24 * 60 * 60; // 3 days after

    const collaborativeQuestTx = await questBoard.connect(creator).createQuest(
      'Complete Web3 DApp Development',
      'Build a complete Web3 DApp including smart contracts, frontend, and documentation. This is a team effort requiring multiple skills.',
      'https://ipfs.io/quest-dapp-brief',
      1, // QuestType.Collaborative
      ethers.parseEther('0.5'), // 0.5 ETH bounty
      ethers.ZeroAddress, // ETH
      6, // max participants
      4, // max collaborators per team
      submissionDeadline,
      reviewDeadline,
      true, // requires approval
      ['Web3', 'DApp', 'Solidity', 'React', 'Collaboration'],
      {
        minReputation: 0,
        requiredSkills: [],
        experienceLevel: 2, // Intermediate
        estimatedDuration: 336, // 14 days
      },
      { value: ethers.parseEther('0.5') }
    );
    await collaborativeQuestTx.wait();
    console.log('✅ Collaborative quest created (Quest ID: 4)\n');

    // Demo 2: Create teams for the quest
    console.log('👥 Demo 2: Creating Teams');
    console.log('========================');

    // Alice creates Team Alpha
    console.log('Alice creating Team Alpha...');
    const teamAlphaTx = await collaborationManager.connect(alice).createTeam(
      4, // questId
      'Team Alpha',
      'Experienced team focused on quality and innovation',
      4, // maxMembers
      ['React', 'Solidity', 'UI/UX'], // required skills
      true // isOpen
    );
    await teamAlphaTx.wait();
    console.log('✅ Team Alpha created (Team ID: 1)');

    // Bob creates Team Beta (even though he'll join Alpha later)
    console.log('Bob creating Team Beta...');
    const teamBetaTx = await collaborationManager.connect(bob).createTeam(
      4, // questId
      'Team Beta',
      'Agile development team with rapid prototyping focus',
      3, // maxMembers
      ['Node.js', 'MongoDB'], // required skills
      true // isOpen
    );
    await teamBetaTx.wait();
    console.log('✅ Team Beta created (Team ID: 2)\n');

    // Demo 3: Join teams
    console.log('🔗 Demo 3: Joining Teams');
    console.log('=======================');

    // Charlie joins Team Alpha
    console.log('Charlie joining Team Alpha...');
    const charlieJoinTx = await collaborationManager
      .connect(charlie)
      .joinTeam(1);
    await charlieJoinTx.wait();
    console.log('✅ Charlie joined Team Alpha');

    // Diana joins Team Alpha
    console.log('Diana joining Team Alpha...');
    const dianaJoinTx = await collaborationManager.connect(diana).joinTeam(1);
    await dianaJoinTx.wait();
    console.log('✅ Diana joined Team Alpha');

    // Bob leaves his own team and joins Team Alpha
    console.log('Bob leaving Team Beta and joining Team Alpha...');
    const bobLeaveTx = await collaborationManager.connect(bob).leaveTeam(2);
    await bobLeaveTx.wait();
    const bobJoinTx = await collaborationManager.connect(bob).joinTeam(1);
    await bobJoinTx.wait();
    console.log('✅ Bob joined Team Alpha\n');

    // Demo 4: Display team information
    console.log('📊 Demo 4: Team Information');
    console.log('==========================');

    for (let teamId = 1; teamId <= 2; teamId++) {
      try {
        const team = await collaborationManager.getTeam(teamId);
        const members = await collaborationManager.getTeamMembers(teamId);

        console.log(`Team ${teamId}: ${team.name}`);
        console.log(`  Description: ${team.description}`);
        console.log(`  Leader: ${team.leader.slice(0, 8)}...`);
        console.log(`  Members: ${members.length}/${team.maxMembers}`);
        console.log(
          `  Status: ${
            team.status === 0
              ? 'Forming'
              : team.status === 1
              ? 'Active'
              : team.status === 2
              ? 'Completed'
              : 'Disbanded'
          }`
        );
        console.log(`  Is Open: ${team.isOpen}`);
        console.log(`  Required Skills: ${team.requiredSkills.join(', ')}`);

        console.log('  Team Members:');
        for (const member of members) {
          try {
            const profile = await userProfile.getProfile(member);
            console.log(`    - ${profile.username} (${member.slice(0, 8)}...)`);
          } catch {
            console.log(`    - ${member.slice(0, 8)}... (no profile)`);
          }
        }
        console.log();
      } catch (error) {
        console.log(`Team ${teamId}: Not found or disbanded\n`);
      }
    }

    // Demo 5: Team management operations
    console.log('⚙️  Demo 5: Team Management');
    console.log('==========================');

    // Alice (team leader) updates team description
    console.log('Alice updating Team Alpha description...');
    const updateTeamTx = await collaborationManager
      .connect(alice)
      .updateTeam(
        1,
        'Team Alpha - Elite Squad',
        'Premier development team with proven track record in Web3 projects'
      );
    await updateTeamTx.wait();
    console.log('✅ Team Alpha updated');

    // Alice assigns roles to team members
    console.log('Alice assigning roles to team members...');

    // Assign Bob as Lead Developer
    const assignBobTx = await collaborationManager.connect(alice).assignRole(
      1, // teamId
      bob.address,
      'Lead Developer',
      'Responsible for smart contract development and architecture'
    );
    await assignBobTx.wait();
    console.log('✅ Bob assigned as Lead Developer');

    // Assign Charlie as UI/UX Lead
    const assignCharlieTx = await collaborationManager
      .connect(alice)
      .assignRole(
        1,
        charlie.address,
        'UI/UX Lead',
        'Responsible for user interface design and user experience'
      );
    await assignCharlieTx.wait();
    console.log('✅ Charlie assigned as UI/UX Lead');

    // Assign Diana as Documentation Lead
    const assignDianaTx = await collaborationManager
      .connect(alice)
      .assignRole(
        1,
        diana.address,
        'Documentation Lead',
        'Responsible for technical documentation and user guides'
      );
    await assignDianaTx.wait();
    console.log('✅ Diana assigned as Documentation Lead\n');

    // Demo 6: View team roles
    console.log('👑 Demo 6: Team Roles and Responsibilities');
    console.log('========================================');

    const teamMembers = await collaborationManager.getTeamMembers(1);
    console.log('Team Alpha Role Assignments:');

    for (const member of teamMembers) {
      try {
        const role = await collaborationManager.getMemberRole(1, member);
        const profile = await userProfile.getProfile(member);

        console.log(`${profile.username}:`);
        console.log(`  Role: ${role.title || 'Team Member'}`);
        console.log(
          `  Responsibilities: ${role.description || 'General team member'}`
        );
        console.log(
          `  Assigned: ${
            role.assignedAt > 0
              ? new Date(Number(role.assignedAt) * 1000).toLocaleDateString()
              : 'Not assigned'
          }\n`
        );
      } catch (error) {
        console.log(
          `Member ${member.slice(0, 8)}...: Role information not available\n`
        );
      }
    }

    // Demo 7: Create team proposals
    console.log('💡 Demo 7: Team Proposals and Voting');
    console.log('===================================');

    // Alice creates a proposal for team decision
    console.log('Alice creating a team proposal...');
    const proposalTx = await collaborationManager.connect(alice).createProposal(
      1, // teamId
      'Technology Stack Decision',
      'Proposal to use React + TypeScript for frontend and Hardhat for smart contract development',
      ['React', 'TypeScript', 'Hardhat', 'Ethers.js']
    );
    await proposalTx.wait();
    console.log('✅ Team proposal created (Proposal ID: 1)');

    // Team members vote on the proposal
    console.log('\nTeam members voting on proposal...');

    // Alice votes yes (as proposer)
    const aliceVoteTx = await collaborationManager
      .connect(alice)
      .voteOnProposal(1, true);
    await aliceVoteTx.wait();
    console.log('✅ Alice voted: Yes');

    // Bob votes yes
    const bobVoteTx = await collaborationManager
      .connect(bob)
      .voteOnProposal(1, true);
    await bobVoteTx.wait();
    console.log('✅ Bob voted: Yes');

    // Charlie votes yes
    const charlieVoteTx = await collaborationManager
      .connect(charlie)
      .voteOnProposal(1, true);
    await charlieVoteTx.wait();
    console.log('✅ Charlie voted: Yes');

    // Diana votes yes
    const dianaVoteTx = await collaborationManager
      .connect(diana)
      .voteOnProposal(1, true);
    await dianaVoteTx.wait();
    console.log('✅ Diana voted: Yes\n');

    // Demo 8: Check proposal results
    console.log('📊 Demo 8: Proposal Results');
    console.log('==========================');

    const proposal = await collaborationManager.getProposal(1);
    const votes = await collaborationManager.getProposalVotes(1);

    console.log('Proposal Details:');
    console.log(`  Title: ${proposal.title}`);
    console.log(`  Description: ${proposal.description}`);
    console.log(
      `  Created: ${new Date(
        Number(proposal.createdAt) * 1000
      ).toLocaleDateString()}`
    );
    console.log(
      `  Status: ${
        proposal.status === 0
          ? 'Pending'
          : proposal.status === 1
          ? 'Approved'
          : 'Rejected'
      }`
    );

    console.log('\nVoting Results:');
    console.log(`  Yes votes: ${votes.yesVotes}`);
    console.log(`  No votes: ${votes.noVotes}`);
    console.log(`  Total eligible voters: ${teamMembers.length}`);
    console.log(
      `  Participation: ${(
        ((Number(votes.yesVotes) + Number(votes.noVotes)) /
          teamMembers.length) *
        100
      ).toFixed(1)}%\n`
    );

    // Demo 9: Team statistics and summary
    console.log('📈 Demo 9: Team Statistics');
    console.log('=========================');

    const questTeams = await collaborationManager.getQuestTeams(4);
    const userTeams = await collaborationManager.getUserTeams(alice.address);

    console.log(`Quest 4 has ${questTeams.length} team(s)`);
    console.log(`Alice is in ${userTeams.length} team(s)`);

    // Check if team can submit (has enough active members)
    const teamAlpha = await collaborationManager.getTeam(1);
    console.log(
      `Team Alpha status: ${
        teamAlpha.status === 1 ? 'Active and ready to submit' : 'Still forming'
      }`
    );

    console.log('\nFinal Team Alpha Summary:');
    console.log(`  Name: ${teamAlpha.name}`);
    console.log(`  Members: ${teamMembers.length}/${teamAlpha.maxMembers}`);
    console.log(`  Quest: Complete Web3 DApp Development`);
    console.log(`  Status: Ready for collaboration! 🚀\n`);

    console.log('🎉 Collaboration Demo completed successfully!');
    console.log(
      'Created teams, assigned roles, made decisions through voting!'
    );
    console.log('Team Alpha is now ready to work together on the quest! 🤝');
  } catch (error) {
    console.error('❌ Error in collaboration demo:', error);
  }
}

// Execute the demo
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
