import type { Metadata } from 'next';

import { AdminPostForm } from '@/features/admin-post-form';

export const metadata: Metadata = {
  title: '새 포스트',
  description: '새로운 포스트 작성',
};

export default function AdminNewPostPage() {
  return <AdminPostForm />;
}
