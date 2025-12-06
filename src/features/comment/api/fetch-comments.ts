import type { Comment } from '@/features/comment/model';

interface FetchCommentsParams {
  pageParam: number;
  postId: string;
}

interface FetchCommentsResponse {
  comments: Comment[];
  nextPage: number | undefined;
}

export const fetchComments = async ({ pageParam, postId }: FetchCommentsParams): Promise<FetchCommentsResponse> => {
  const response = await fetch(`https://jsonplaceholder.typicode.com/comments?_page=${pageParam}&_limit=20`);
  const data = await response.json();

  const comments: Comment[] = data.map((item: { id: number; name: string; email: string; body: string }) => ({
    id: item.id.toString(),
    postId,
    userId: '1', // 더미 사용자 ID
    content: item.body,
    attachments: [],
    likesCount: Math.floor(Math.random() * 100),
    repliesCount: Math.floor(Math.random() * 10),
    isEdited: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: {
      id: '1',
      username: item.email.split('@')[0],
      fullName: item.name,
      avatarUrl: `https://i.pravatar.cc/150?img=${item.id % 70}`,
    },
    parentCommentId: Math.random() > 0.8 && pageParam > 1 ? '1' : null,
    replies: [],
  }));

  return {
    comments,
    nextPage: data.length === 20 ? pageParam + 1 : undefined,
  };
};
