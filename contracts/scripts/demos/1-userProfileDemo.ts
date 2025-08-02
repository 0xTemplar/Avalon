import { ethers } from 'hardhat';
import { UserProfile } from '../../typechain-types';

/**
 * Demo: User Profile Management
 * Demonstrates creating user profiles, updating them, and managing reputation
 */
async function main() {
  console.log('🔥 Quest Board - User Profile Demo');
  console.log('=====================================\n');

  // Get deployed contract address from the deployment
  const USER_PROFILE_ADDRESS = '0xC6816eBE0a22B1C2de557bEF30852fa8968D2296';

  // Get signers (test accounts)
  const [deployer, alice, bob, charlie] = await ethers.getSigners();

  // Connect to deployed UserProfile contract
  const userProfile = (await ethers.getContractAt(
    'UserProfile',
    USER_PROFILE_ADDRESS
  )) as UserProfile;

  console.log('📋 Contract Information:');
  console.log(`UserProfile Address: ${USER_PROFILE_ADDRESS}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Alice: ${alice.address}`);
  console.log(`Bob: ${bob.address}`);
  console.log(`Charlie: ${charlie.address}\n`);

  try {
    // Demo 1: Create user profiles
    console.log('👤 Demo 1: Creating User Profiles');
    console.log('=================================');

    // Alice creates a profile as a designer
    console.log('Creating profile for Alice (Designer)...');
    const tx1 = await userProfile
      .connect(alice)
      .createProfile(
        'alice_designer',
        'Creative designer specializing in UI/UX and brand identity',
        'https://ipfs.io/alice-avatar',
        [
          'UI/UX Design',
          'Graphic Design',
          'Branding',
          'Figma',
          'Adobe Creative Suite',
        ]
      );
    await tx1.wait();
    console.log('✅ Alice profile created!');

    // Bob creates a profile as a developer
    console.log('Creating profile for Bob (Developer)...');
    const tx2 = await userProfile
      .connect(bob)
      .createProfile(
        'bob_dev',
        'Full-stack developer with expertise in React, Node.js, and smart contracts',
        'https://ipfs.io/bob-avatar',
        ['React', 'Node.js', 'TypeScript', 'Solidity', 'Python', 'AWS']
      );
    await tx2.wait();
    console.log('✅ Bob profile created!');

    // Charlie creates a profile as a content creator
    console.log('Creating profile for Charlie (Content Creator)...');
    const tx3 = await userProfile
      .connect(charlie)
      .createProfile(
        'charlie_content',
        'Content creator and marketing specialist with focus on Web3 communities',
        'https://ipfs.io/charlie-avatar',
        [
          'Content Writing',
          'Social Media',
          'Community Management',
          'Video Editing',
          'SEO',
        ]
      );
    await tx3.wait();
    console.log('✅ Charlie profile created!\n');

    // Demo 2: Display created profiles
    console.log('📊 Demo 2: Displaying User Profiles');
    console.log('===================================');

    const aliceProfile = await userProfile.getProfile(alice.address);
    console.log('Alice Profile:');
    console.log(`  Username: ${aliceProfile.username}`);
    console.log(`  Bio: ${aliceProfile.bio}`);
    console.log(`  Skills: ${aliceProfile.skills.join(', ')}`);
    console.log(`  Reputation: ${aliceProfile.reputation}`);
    console.log(
      `  Joined: ${new Date(
        Number(aliceProfile.joinedAt) * 1000
      ).toLocaleDateString()}\n`
    );

    const bobProfile = await userProfile.getProfile(bob.address);
    console.log('Bob Profile:');
    console.log(`  Username: ${bobProfile.username}`);
    console.log(`  Bio: ${bobProfile.bio}`);
    console.log(`  Skills: ${bobProfile.skills.join(', ')}`);
    console.log(`  Reputation: ${bobProfile.reputation}`);
    console.log(
      `  Joined: ${new Date(
        Number(bobProfile.joinedAt) * 1000
      ).toLocaleDateString()}\n`
    );

    // Demo 3: Update profiles
    console.log('✏️  Demo 3: Updating User Profiles');
    console.log('=================================');

    // Alice adds a new skill
    console.log('Alice adding new skill: Photoshop...');
    const tx4 = await userProfile.connect(alice).addSkill('Photoshop');
    await tx4.wait();
    console.log('✅ Skill added!');

    // Bob updates his profile
    console.log('Bob updating his profile...');
    const tx5 = await userProfile
      .connect(bob)
      .updateProfile(
        'bob_dev',
        'Senior full-stack developer and blockchain expert. Building the future of Web3!',
        'https://ipfs.io/bob-avatar-updated'
      );
    await tx5.wait();
    console.log('✅ Profile updated!\n');

    // Demo 4: Reputation management (admin only)
    console.log('⭐ Demo 4: Reputation Management');
    console.log('===============================');

    // Grant quest board role to deployer for demo purposes
    const questBoardRole = await userProfile.QUEST_BOARD_ROLE();
    console.log('Granting quest board role to deployer for demo...');
    const tx6 = await userProfile
      .connect(deployer)
      .grantRole(questBoardRole, deployer.address);
    await tx6.wait();

    // Award reputation points
    console.log('Awarding reputation points:');
    console.log('- Alice: +50 points for excellent design work');
    const tx7 = await userProfile
      .connect(deployer)
      .updateReputation(alice.address, 50, 'quest_completed', 1);
    await tx7.wait();

    console.log('- Bob: +75 points for outstanding development');
    const tx8 = await userProfile
      .connect(deployer)
      .updateReputation(bob.address, 75, 'quest_completed', 2);
    await tx8.wait();

    console.log('- Charlie: +30 points for great content creation');
    const tx9 = await userProfile
      .connect(deployer)
      .updateReputation(charlie.address, 30, 'quest_completed', 3);
    await tx9.wait();
    console.log('✅ Reputation points awarded!\n');

    // Demo 5: Display updated profiles with reputation
    console.log('📈 Demo 5: Updated Profiles with Reputation');
    console.log('==========================================');

    const updatedAlice = await userProfile.getProfile(alice.address);
    const updatedBob = await userProfile.getProfile(bob.address);
    const updatedCharlie = await userProfile.getProfile(charlie.address);

    console.log('Updated Reputation Scores:');
    console.log(
      `Alice (@${updatedAlice.username}): ${updatedAlice.reputation} points`
    );
    console.log(
      `Bob (@${updatedBob.username}): ${updatedBob.reputation} points`
    );
    console.log(
      `Charlie (@${updatedCharlie.username}): ${updatedCharlie.reputation} points\n`
    );

    // Demo 6: Create and award achievements
    console.log('🏆 Demo 6: Creating and Awarding Achievements');
    console.log('=============================================');

    // Create achievements
    console.log('Creating achievements...');
    const tx10 = await userProfile
      .connect(deployer)
      .createAchievement(
        'First Quest Completed',
        'Complete your first quest on the platform',
        'https://ipfs.io/achievement-first-quest',
        10
      );
    await tx10.wait();

    const tx11 = await userProfile
      .connect(deployer)
      .createAchievement(
        'Reputation Builder',
        'Earn 50 or more reputation points',
        'https://ipfs.io/achievement-reputation',
        50
      );
    await tx11.wait();

    console.log('✅ Achievements created!');

    // Check and award achievements automatically
    console.log('Checking for automatic achievement awards...');
    await userProfile.checkAndAwardAchievements(alice.address);
    await userProfile.checkAndAwardAchievements(bob.address);
    await userProfile.checkAndAwardAchievements(charlie.address);
    console.log('✅ Achievements checked and awarded!\n');

    // Demo 7: Display final stats
    console.log('📊 Demo 7: Final User Statistics');
    console.log('===============================');

    const totalProfiles = await userProfile.getTotalProfiles();
    console.log(`Total Profiles Created: ${totalProfiles}`);

    console.log('\nUser Achievements:');
    const aliceAchievements = await userProfile.getUserAchievements(
      alice.address
    );
    const bobAchievements = await userProfile.getUserAchievements(bob.address);

    console.log(`Alice has earned ${aliceAchievements.length} achievement(s)`);
    console.log(`Bob has earned ${bobAchievements.length} achievement(s)`);

    if (aliceAchievements.length > 0) {
      for (let i = 0; i < aliceAchievements.length; i++) {
        const achievement = await userProfile.getAchievement(
          aliceAchievements[i].achievementId
        );
        console.log(`  - ${achievement.name}: ${achievement.description}`);
      }
    }

    console.log('\n🎉 User Profile Demo completed successfully!');
    console.log(
      'Users can now create profiles, build reputation, and earn achievements!'
    );
  } catch (error) {
    console.error('❌ Error in user profile demo:', error);
  }
}

// Execute the demo
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
