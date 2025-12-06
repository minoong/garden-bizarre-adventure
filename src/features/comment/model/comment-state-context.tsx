'use client';

import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface CommentStateContextValue {
  likedComments: Set<string>;
  repliesVisibility: Map<string, boolean>;
  replyingTo: Set<string>;
  toggleLike: (commentId: string) => void;
  toggleRepliesVisibility: (commentId: string) => void;
  toggleReplying: (commentId: string) => void;
  isLiked: (commentId: string) => boolean;
  showReplies: (commentId: string) => boolean;
  isReplying: (commentId: string) => boolean;
}

const CommentStateContext = createContext<CommentStateContextValue | null>(null);

export function CommentStateProvider({ children }: { children: ReactNode }) {
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [repliesVisibility, setRepliesVisibility] = useState<Map<string, boolean>>(new Map());
  const [replyingTo, setReplyingTo] = useState<Set<string>>(new Set());

  const toggleLike = (commentId: string) => {
    setLikedComments((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  };

  const toggleRepliesVisibility = (commentId: string) => {
    setRepliesVisibility((prev) => {
      const next = new Map(prev);
      next.set(commentId, !(prev.get(commentId) ?? true));
      return next;
    });
  };

  const toggleReplying = (commentId: string) => {
    setReplyingTo((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  };

  const isLiked = (commentId: string) => likedComments.has(commentId);
  const showReplies = (commentId: string) => repliesVisibility.get(commentId) ?? true;
  const isReplying = (commentId: string) => replyingTo.has(commentId);

  return (
    <CommentStateContext.Provider
      value={{
        likedComments,
        repliesVisibility,
        replyingTo,
        toggleLike,
        toggleRepliesVisibility,
        toggleReplying,
        isLiked,
        showReplies,
        isReplying,
      }}
    >
      {children}
    </CommentStateContext.Provider>
  );
}

export function useCommentState() {
  const context = useContext(CommentStateContext);
  if (!context) {
    throw new Error('useCommentState must be used within CommentStateProvider');
  }
  return context;
}
