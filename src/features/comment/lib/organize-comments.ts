import type { Comment } from '@/features/comment/model';

export function organizeComments(allComments: Comment[]): Comment[] {
  const commentMap = new Map<string, Comment>();
  const rootComments: Comment[] = [];

  allComments.forEach((comment) => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  allComments.forEach((comment) => {
    const commentWithReplies = commentMap.get(comment.id)!;

    if (comment.parentCommentId) {
      const parent = commentMap.get(comment.parentCommentId);
      if (parent) {
        parent.replies!.push(commentWithReplies);
      } else {
        rootComments.push(commentWithReplies);
      }
    } else {
      rootComments.push(commentWithReplies);
    }
  });

  return rootComments;
}
