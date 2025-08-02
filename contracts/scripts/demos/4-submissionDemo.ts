import { ethers } from 'hardhat';
import {
  SubmissionManager,
  QuestBoard,
  UserProfile,
} from '../../typechain-types';

/**
 * Demo: Submission Management
 * Demonstrates submitting work, peer review, and submission lifecycle
 */
async function main() {
  console.log('📝 Quest Board - Submission Management Demo');
  console.log('==========================================\n');

  // Deployed contract addresses
  const SUBMISSION_MANAGER_ADDRESS =
    '0xbc5502C2086235E1A1Ab7B5A397cE4B327035e97';
  const QUEST_BOARD_ADDRESS = '0x72D11a8ccd35366ee4021a1D55a7930ab1f00f27';
  const USER_PROFILE_ADDRESS = '0xC6816eBE0a22B1C2de557bEF30852fa8968D2296';

  // Get signers
  const [deployer, creator, alice, bob, charlie, diana, reviewer1, reviewer2] =
    await ethers.getSigners();

  // Connect to contracts
  const submissionManager = (await ethers.getContractAt(
    'SubmissionManager',
    SUBMISSION_MANAGER_ADDRESS
  )) as SubmissionManager;
  const questBoard = (await ethers.getContractAt(
    'QuestBoard',
    QUEST_BOARD_ADDRESS
  )) as QuestBoard;
  const userProfile = (await ethers.getContractAt(
    'UserProfile',
    USER_PROFILE_ADDRESS
  )) as UserProfile;

  console.log('📋 Contract Information:');
  console.log(`SubmissionManager: ${SUBMISSION_MANAGER_ADDRESS}`);
  console.log(`Alice (Submitter): ${alice.address}`);
  console.log(`Bob (Submitter): ${bob.address}`);
  console.log(`Charlie (Submitter): ${charlie.address}`);
  console.log(`Reviewer1: ${reviewer1.address}\n`);

  try {
    // Setup: Ensure users have profiles and create a quest
    console.log('🔧 Setup: Preparing Environment');
    console.log('==============================');

    const profiles = [
      {
        signer: creator,
        username: 'quest_creator',
        bio: 'Quest creator and reviewer',
        skills: ['Management', 'Review'],
      },
      {
        signer: alice,
        username: 'alice_dev',
        bio: 'Full-stack developer',
        skills: ['React', 'Node.js', 'Solidity'],
      },
      {
        signer: bob,
        username: 'bob_designer',
        bio: 'UI/UX Designer',
        skills: ['Figma', 'Design', 'Prototyping'],
      },
      {
        signer: charlie,
        username: 'charlie_writer',
        bio: 'Technical writer',
        skills: ['Writing', 'Documentation'],
      },
      {
        signer: reviewer1,
        username: 'reviewer_expert',
        bio: 'Senior code reviewer',
        skills: ['Code Review', 'Quality Assurance'],
      },
    ];

    // Create profiles if they don't exist
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

    // Create a quest for submissions
    console.log('\nCreating a quest for submissions...');
    const submissionDeadline = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days
    const reviewDeadline = submissionDeadline + 3 * 24 * 60 * 60; // 3 days after

    try {
      const questTx = await questBoard.connect(creator).createQuest(
        'Build a Token Calculator DApp',
        'Create a simple DApp that calculates token prices and conversions with a clean UI',
        'https://ipfs.io/quest-calculator-brief',
        0, // Individual quest
        ethers.parseEther('0.2'),
        ethers.ZeroAddress,
        5, // max participants
        0, // no collaborators for individual quest
        submissionDeadline,
        reviewDeadline,
        false, // no approval required
        ['React', 'DApp', 'Calculator', 'UI'],
        {
          minReputation: 0,
          requiredSkills: [],
          experienceLevel: 2,
          estimatedDuration: 120,
        },
        { value: ethers.parseEther('0.2') }
      );
      await questTx.wait();
      console.log('✅ Quest created for submissions (Quest ID: 5)');
    } catch (error) {
      console.log('ℹ️  Quest may already exist or using existing quest');
    }

    // Users join the quest
    console.log('\nParticipants joining the quest...');
    try {
      await questBoard.connect(alice).joinQuest(5);
      console.log('✅ Alice joined quest');
    } catch {
      console.log('ℹ️  Alice already in quest');
    }

    try {
      await questBoard.connect(bob).joinQuest(5);
      console.log('✅ Bob joined quest');
    } catch {
      console.log('ℹ️  Bob already in quest');
    }

    try {
      await questBoard.connect(charlie).joinQuest(5);
      console.log('✅ Charlie joined quest');
    } catch {
      console.log('ℹ️  Charlie already in quest');
    }

    console.log();

    // Demo 1: Create submissions
    console.log('📤 Demo 1: Creating Submissions');
    console.log('==============================');

    // Alice submits her solution
    console.log('Alice submitting her token calculator solution...');
    const aliceSubmissionTx = await submissionManager
      .connect(alice)
      .createSubmission(
        5, // questId
        'Token Calculator DApp - React Solution',
        'A responsive token calculator built with React and Web3.js. Features real-time price fetching and multiple token support.',
        'https://github.com/alice/token-calculator',
        'https://ipfs.io/alice-demo-video',
        0, // Individual submission
        [], // No team members for individual
        ['React', 'Web3.js', 'Responsive Design']
      );
    await aliceSubmissionTx.wait();
    console.log('✅ Alice submission created (Submission ID: 1)');

    // Bob submits his solution
    console.log('Bob submitting his design-focused solution...');
    const bobSubmissionTx = await submissionManager
      .connect(bob)
      .createSubmission(
        5,
        'Token Calculator - Premium UI Design',
        'A beautifully designed token calculator with advanced animations and intuitive user experience.',
        'https://github.com/bob/premium-calculator',
        'https://ipfs.io/bob-demo-video',
        0, // Individual submission
        [],
        ['UI/UX Design', 'CSS Animations', 'User Experience']
      );
    await bobSubmissionTx.wait();
    console.log('✅ Bob submission created (Submission ID: 2)');

    // Charlie submits his solution
    console.log('Charlie submitting his comprehensive solution...');
    const charlieSubmissionTx = await submissionManager
      .connect(charlie)
      .createSubmission(
        5,
        'Token Calculator with Documentation',
        'Complete token calculator solution with extensive documentation, API integration guides, and user tutorials.',
        'https://github.com/charlie/documented-calculator',
        'https://ipfs.io/charlie-demo-video',
        0, // Individual submission
        [],
        ['Documentation', 'API Integration', 'Technical Writing']
      );
    await charlieSubmissionTx.wait();
    console.log('✅ Charlie submission created (Submission ID: 3)\n');

    // Demo 2: View submissions
    console.log('👀 Demo 2: Viewing Submissions');
    console.log('=============================');

    const questSubmissions = await submissionManager.getQuestSubmissions(5);
    console.log(`Found ${questSubmissions.length} submissions for Quest 5:\n`);

    for (let i = 0; i < questSubmissions.length; i++) {
      const submissionId = questSubmissions[i];
      const submission = await submissionManager.getSubmission(submissionId);

      try {
        const submitterProfile = await userProfile.getProfile(
          submission.submitter
        );
        console.log(`Submission ${submissionId}: ${submission.title}`);
        console.log(
          `  Submitter: ${
            submitterProfile.username
          } (${submission.submitter.slice(0, 8)}...)`
        );
        console.log(`  Description: ${submission.description}`);
        console.log(`  Repository: ${submission.repositoryLink}`);
        console.log(
          `  Status: ${
            submission.status === 0
              ? 'Pending'
              : submission.status === 1
              ? 'Under Review'
              : submission.status === 2
              ? 'Approved'
              : submission.status === 3
              ? 'Rejected'
              : 'Revision Required'
          }`
        );
        console.log(
          `  Submitted: ${new Date(
            Number(submission.submittedAt) * 1000
          ).toLocaleDateString()}`
        );
        console.log(`  Technologies: ${submission.technologies.join(', ')}\n`);
      } catch (error) {
        console.log(`Submission ${submissionId}: Error retrieving details\n`);
      }
    }

    // Demo 3: Peer review system
    console.log('👥 Demo 3: Peer Review System');
    console.log('============================');

    // Set up reviewer role
    console.log('Setting up reviewer permissions...');
    try {
      const reviewerRole = await submissionManager.REVIEWER_ROLE();
      await submissionManager
        .connect(deployer)
        .grantRole(reviewerRole, reviewer1.address);
      await submissionManager
        .connect(deployer)
        .grantRole(reviewerRole, creator.address);
      console.log('✅ Reviewer roles granted');
    } catch (error) {
      console.log('ℹ️  Reviewer roles may already be set');
    }

    // Creator reviews Alice's submission
    console.log("\nCreator reviewing Alice's submission...");
    const aliceReviewTx = await submissionManager
      .connect(creator)
      .reviewSubmission(
        1, // Alice's submission
        true, // approved
        85, // score out of 100
        'Excellent implementation with clean code and good functionality. Minor improvements could be made to error handling.',
        ['Code Quality', 'Functionality', 'User Interface']
      );
    await aliceReviewTx.wait();
    console.log('✅ Alice submission reviewed and approved');

    // Reviewer1 reviews Bob's submission
    console.log("Expert reviewer reviewing Bob's submission...");
    const bobReviewTx = await submissionManager
      .connect(reviewer1)
      .reviewSubmission(
        2, // Bob's submission
        true, // approved
        92, // score out of 100
        'Outstanding design work with exceptional attention to detail. The animations and UX are top-notch.',
        ['Design Excellence', 'User Experience', 'Innovation']
      );
    await bobReviewTx.wait();
    console.log('✅ Bob submission reviewed and approved');

    // Creator reviews Charlie's submission but requests revision
    console.log("Creator reviewing Charlie's submission...");
    const charlieReviewTx = await submissionManager
      .connect(creator)
      .reviewSubmission(
        3, // Charlie's submission
        false, // not approved yet
        75, // score out of 100
        'Good documentation but the calculator functionality needs improvement. Please add more calculation features.',
        ['Documentation Quality', 'Feature Completeness']
      );
    await charlieReviewTx.wait();
    console.log('✅ Charlie submission reviewed - revision requested\n');

    // Demo 4: View review details
    console.log('📊 Demo 4: Review Details and Scores');
    console.log('===================================');

    for (let submissionId = 1; submissionId <= 3; submissionId++) {
      console.log(`Reviews for Submission ${submissionId}:`);

      try {
        const reviews = await submissionManager.getSubmissionReviews(
          submissionId
        );

        if (reviews.length === 0) {
          console.log('  No reviews yet\n');
          continue;
        }

        for (let j = 0; j < reviews.length; j++) {
          const review = reviews[j];
          try {
            const reviewerProfile = await userProfile.getProfile(
              review.reviewer
            );
            console.log(`  Review ${j + 1} by ${reviewerProfile.username}:`);
          } catch {
            console.log(
              `  Review ${j + 1} by ${review.reviewer.slice(0, 8)}...:`
            );
          }

          console.log(`    Score: ${review.score}/100`);
          console.log(`    Approved: ${review.approved ? 'Yes' : 'No'}`);
          console.log(`    Feedback: ${review.feedback}`);
          console.log(`    Criteria: ${review.criteria.join(', ')}`);
          console.log(
            `    Date: ${new Date(
              Number(review.reviewedAt) * 1000
            ).toLocaleDateString()}`
          );
        }
        console.log();
      } catch (error) {
        console.log('  Error retrieving reviews\n');
      }
    }

    // Demo 5: Charlie submits revision
    console.log('🔄 Demo 5: Submission Revision');
    console.log('=============================');

    console.log('Charlie submitting a revision based on feedback...');
    const charlieRevisionTx = await submissionManager
      .connect(charlie)
      .submitRevision(
        3, // his submission ID
        'Enhanced Token Calculator with Advanced Features',
        'Updated calculator with multiple token support, price history charts, and portfolio tracking features.',
        'https://github.com/charlie/enhanced-calculator-v2',
        'https://ipfs.io/charlie-demo-video-v2',
        ['Advanced Calculations', 'Portfolio Tracking', 'Price Charts']
      );
    await charlieRevisionTx.wait();
    console.log('✅ Charlie revision submitted');

    // Creator reviews the revision
    console.log("Creator reviewing Charlie's revision...");
    const charlieRevisionReviewTx = await submissionManager
      .connect(creator)
      .reviewSubmission(
        3,
        true, // approved this time
        88, // improved score
        'Excellent revision! The additional features really enhance the calculator. Great job addressing the feedback.',
        ['Feature Implementation', 'Code Quality', 'Responsiveness to Feedback']
      );
    await charlieRevisionReviewTx.wait();
    console.log('✅ Charlie revision approved\n');

    // Demo 6: Submission statistics
    console.log('📈 Demo 6: Submission Statistics');
    console.log('===============================');

    console.log('Final Submission Summary:');

    for (let submissionId = 1; submissionId <= 3; submissionId++) {
      const submission = await submissionManager.getSubmission(submissionId);
      const reviews = await submissionManager.getSubmissionReviews(
        submissionId
      );

      // Calculate average score
      let totalScore = 0;
      let reviewCount = 0;
      for (const review of reviews) {
        totalScore += Number(review.score);
        reviewCount++;
      }
      const averageScore =
        reviewCount > 0 ? (totalScore / reviewCount).toFixed(1) : 'No reviews';

      try {
        const submitterProfile = await userProfile.getProfile(
          submission.submitter
        );
        console.log(
          `\nSubmission ${submissionId} by ${submitterProfile.username}:`
        );
      } catch {
        console.log(`\nSubmission ${submissionId}:`);
      }

      console.log(`  Title: ${submission.title}`);
      console.log(
        `  Status: ${
          submission.status === 2
            ? '✅ Approved'
            : submission.status === 3
            ? '❌ Rejected'
            : submission.status === 4
            ? '🔄 Revision Required'
            : '⏳ Pending'
        }`
      );
      console.log(
        `  Average Score: ${averageScore}${reviewCount > 0 ? '/100' : ''}`
      );
      console.log(`  Reviews: ${reviews.length}`);
      console.log(
        `  Last Updated: ${new Date(
          Number(submission.lastUpdated) * 1000
        ).toLocaleDateString()}`
      );
    }

    // Quest-level statistics
    console.log('\nQuest 5 Statistics:');
    const approvedSubmissions = await submissionManager.getApprovedSubmissions(
      5
    );
    console.log(`  Total Submissions: ${questSubmissions.length}`);
    console.log(`  Approved Submissions: ${approvedSubmissions.length}`);
    console.log(
      `  Approval Rate: ${(
        (approvedSubmissions.length / questSubmissions.length) *
        100
      ).toFixed(1)}%`
    );

    // User statistics
    console.log('\nUser Submission Statistics:');
    const aliceSubmissions = await submissionManager.getUserSubmissions(
      alice.address
    );
    const bobSubmissions = await submissionManager.getUserSubmissions(
      bob.address
    );
    const charlieSubmissions = await submissionManager.getUserSubmissions(
      charlie.address
    );

    console.log(`  Alice: ${aliceSubmissions.length} submission(s)`);
    console.log(`  Bob: ${bobSubmissions.length} submission(s)`);
    console.log(`  Charlie: ${charlieSubmissions.length} submission(s)\n`);

    console.log('🎉 Submission Management Demo completed successfully!');
    console.log('Demonstrated the complete submission lifecycle:');
    console.log('✅ Submission creation');
    console.log('✅ Peer review process');
    console.log('✅ Revision and re-review');
    console.log('✅ Quality scoring system');
    console.log(
      '\nAll three participants have approved submissions ready for rewards! 🏆'
    );
  } catch (error) {
    console.error('❌ Error in submission demo:', error);
  }
}

// Execute the demo
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
