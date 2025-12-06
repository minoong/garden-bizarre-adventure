export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  attachments: string[];
  likesCount: number;
  repliesCount: number;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  parentCommentId: string | null;
  replies?: Comment[];
  user: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl: string | null;
  };
}
