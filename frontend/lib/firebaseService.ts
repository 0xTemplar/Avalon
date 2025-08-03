import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  DocumentReference,
} from 'firebase/firestore';
import { db } from './firebase';

// Firebase data structures that mirror subgraph entities
export interface FirebaseQuest {
  id?: string; // Firestore document ID
  questId: string; // Blockchain quest ID
  externalQuestId: string; // External quest ID for frontend reference
  title: string;
  description: string;
  category: string;
  reward: string;
  creator: {
    address: string;
    username: string;
    avatar: string;
    reputation: number;
  };
  participants: number;
  maxParticipants: number;
  deadline: string;
  createdAt: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  status: 'Active' | 'Completed' | 'Expired';
  tags: string[];
  color: string;
  requirements: string[];
  deliverables: string[];
  hasWinners: boolean;
  winners: string[];
  // Firebase-specific fields
  createdAtTimestamp: Timestamp;
  updatedAtTimestamp: Timestamp;
  txHash?: string; // Transaction hash for verification
}

export interface FirebaseSubmission {
  id?: string; // Firestore document ID
  questId: string; // Reference to quest
  submissionId: string; // Blockchain submission ID
  author: {
    address: string;
    username: string;
    avatar: string;
  };
  content: string;
  description: string;
  timestamp: string;
  votes: number;
  status: 'pending' | 'approved' | 'rejected' | 'winner';
  previewUrl?: string;
  // Firebase-specific fields
  createdAtTimestamp: Timestamp;
  updatedAtTimestamp: Timestamp;
  txHash?: string;
}

class FirebaseService {
  // Quest operations
  async createQuest(
    quest: Omit<
      FirebaseQuest,
      'id' | 'createdAtTimestamp' | 'updatedAtTimestamp'
    >
  ): Promise<string> {
    try {
      const now = Timestamp.now();
      const questData: Omit<FirebaseQuest, 'id'> = {
        ...quest,
        createdAtTimestamp: now,
        updatedAtTimestamp: now,
      };

      const docRef = await addDoc(collection(db, 'quests'), questData);
      console.log('Quest added to Firebase with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding quest to Firebase:', error);
      throw error;
    }
  }

  async updateQuest(
    questId: string,
    updates: Partial<FirebaseQuest>
  ): Promise<void> {
    try {
      const questRef = doc(db, 'quests', questId);
      await updateDoc(questRef, {
        ...updates,
        updatedAtTimestamp: Timestamp.now(),
      });
      console.log('Quest updated in Firebase:', questId);
    } catch (error) {
      console.error('Error updating quest in Firebase:', error);
      throw error;
    }
  }

  async getQuest(questId: string): Promise<FirebaseQuest | null> {
    try {
      const questRef = doc(db, 'quests', questId);
      const questSnap = await getDoc(questRef);

      if (questSnap.exists()) {
        return { id: questSnap.id, ...questSnap.data() } as FirebaseQuest;
      }
      return null;
    } catch (error) {
      console.error('Error getting quest from Firebase:', error);
      throw error;
    }
  }

  async getQuestByBlockchainId(
    blockchainQuestId: string
  ): Promise<FirebaseQuest | null> {
    try {
      const q = query(
        collection(db, 'quests'),
        where('questId', '==', blockchainQuestId),
        limit(1)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as FirebaseQuest;
      }
      return null;
    } catch (error) {
      console.error('Error getting quest by blockchain ID:', error);
      throw error;
    }
  }

  async getQuests(
    limitCount: number = 20,
    category?: string,
    difficulty?: string,
    searchQuery?: string
  ): Promise<FirebaseQuest[]> {
    try {
      let q;

      if (category && category !== 'All') {
        // Simple query with category filter only (no orderBy to avoid composite index)
        q = query(
          collection(db, 'quests'),
          where('category', '==', category),
          limit(limitCount * 2) // Get more docs to account for client-side sorting
        );
      } else {
        // Simple query without any compound constraints
        q = query(collection(db, 'quests'), limit(limitCount * 2));
      }

      const querySnapshot = await getDocs(q);
      let quests = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as FirebaseQuest[];

      // Sort on client side by createdAtTimestamp (most recent first)
      quests = quests.sort(
        (a, b) =>
          b.createdAtTimestamp.toMillis() - a.createdAtTimestamp.toMillis()
      );

      // Apply limit after sorting
      quests = quests.slice(0, limitCount);

      // Client-side filtering for difficulty and search
      if (difficulty && difficulty !== 'All') {
        quests = quests.filter((quest) => quest.difficulty === difficulty);
      }

      if (searchQuery) {
        const search = searchQuery.toLowerCase();
        quests = quests.filter(
          (quest) =>
            quest.title.toLowerCase().includes(search) ||
            quest.description.toLowerCase().includes(search) ||
            quest.tags.some((tag) => tag.toLowerCase().includes(search))
        );
      }

      return quests;
    } catch (error) {
      console.error('Error getting quests from Firebase:', error);
      throw error;
    }
  }

  // Real-time quest listening
  onQuestsUpdate(
    callback: (quests: FirebaseQuest[]) => void,
    limitCount: number = 20
  ): () => void {
    const q = query(
      collection(db, 'quests'),
      orderBy('createdAtTimestamp', 'desc'),
      limit(limitCount)
    );

    return onSnapshot(q, (querySnapshot) => {
      const quests = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as FirebaseQuest[];
      callback(quests);
    });
  }

  // Submission operations
  async createSubmission(
    submission: Omit<
      FirebaseSubmission,
      'id' | 'createdAtTimestamp' | 'updatedAtTimestamp'
    >
  ): Promise<string> {
    try {
      const now = Timestamp.now();
      const submissionData: Omit<FirebaseSubmission, 'id'> = {
        ...submission,
        createdAtTimestamp: now,
        updatedAtTimestamp: now,
      };

      const docRef = await addDoc(
        collection(db, 'submissions'),
        submissionData
      );
      console.log('Submission added to Firebase with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding submission to Firebase:', error);
      throw error;
    }
  }

  async getSubmissionsByQuest(questId: string): Promise<FirebaseSubmission[]> {
    try {
      // Simple query without orderBy to avoid composite index requirement
      const q = query(
        collection(db, 'submissions'),
        where('questId', '==', questId)
      );

      const querySnapshot = await getDocs(q);
      const submissions = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as FirebaseSubmission[];

      // Sort on client side by createdAtTimestamp (most recent first)
      return submissions.sort(
        (a, b) =>
          b.createdAtTimestamp.toMillis() - a.createdAtTimestamp.toMillis()
      );
    } catch (error) {
      console.error('Error getting submissions from Firebase:', error);
      throw error;
    }
  }

  async getAllSubmissions(): Promise<FirebaseSubmission[]> {
    try {
      const q = query(collection(db, 'submissions'));
      const querySnapshot = await getDocs(q);
      const submissions = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as FirebaseSubmission[];

      // Sort on client side by createdAtTimestamp (most recent first)
      return submissions.sort(
        (a, b) =>
          b.createdAtTimestamp.toMillis() - a.createdAtTimestamp.toMillis()
      );
    } catch (error) {
      console.error('Error getting all submissions from Firebase:', error);
      throw error;
    }
  }

  async updateSubmission(
    submissionId: string,
    updates: Partial<FirebaseSubmission>
  ): Promise<void> {
    try {
      const submissionRef = doc(db, 'submissions', submissionId);
      await updateDoc(submissionRef, {
        ...updates,
        updatedAtTimestamp: Timestamp.now(),
      });
      console.log('Submission updated in Firebase:', submissionId);
    } catch (error) {
      console.error('Error updating submission in Firebase:', error);
      throw error;
    }
  }

  // Utility functions
  async deleteQuest(questId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'quests', questId));
      console.log('Quest deleted from Firebase:', questId);
    } catch (error) {
      console.error('Error deleting quest from Firebase:', error);
      throw error;
    }
  }

  // Sync with blockchain data
  async syncQuestFromBlockchain(
    blockchainQuest: any,
    txHash?: string
  ): Promise<void> {
    try {
      const existingQuest = await this.getQuestByBlockchainId(
        blockchainQuest.questId
      );

      if (existingQuest) {
        // Update existing quest
        await this.updateQuest(existingQuest.id!, {
          ...blockchainQuest,
          txHash,
        });
      } else {
        // Create new quest
        await this.createQuest({
          ...blockchainQuest,
          txHash,
        });
      }
    } catch (error) {
      console.error('Error syncing quest from blockchain:', error);
      throw error;
    }
  }
}

export const firebaseService = new FirebaseService();
export default firebaseService;
