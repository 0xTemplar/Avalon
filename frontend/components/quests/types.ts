export interface Quest {
  id: string;
  title: string;
  description: string;
  category: string;
  reward: string;
  creator: {
    address: string;
    username: string;
    avatar: string;
  };
  participants: number;
  deadline: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  status: 'Active' | 'Completed' | 'Expired';
  tags: string[];
  color: string;
}
