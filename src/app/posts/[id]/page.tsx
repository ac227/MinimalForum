'use client';

import { useState, useEffect, use, useCallback } from 'react';
import Link from 'next/link';
import { Post, Comment } from '@/types/post';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PostDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState('');
  const [commentAuthorName, setCommentAuthorName] = useState('');
  const [commentAuthorEmail, setCommentAuthorEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPost = useCallback(async () => {
    try {
      const res = await fetch(`/api/posts/${id}`);
      if (res.ok) {
        const data = await res.json();
        setPost(data);
      }
    } catch (error) {
      console.error('Failed to fetch post:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleLike = async () => {
    if (!post) return;
    try {
      const res = await fetch(`/api/posts/${id}/like`, { method: 'POST' });
      if (res.ok) {
        setPost({ ...post, likes: (post.likes || 0) + 1 });
      }
    } catch (error) {
      console.error('Failed to like:', error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent || !post || !commentAuthorName) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: commentContent,
          authorName: commentAuthorName,
          authorEmail: commentAuthorEmail || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPost({
          ...post,
          comments: [...(post.comments || []), data.comment],
        });
        setCommentContent('');
      }
    } catch (error) {
      console.error('Failed to comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-100">
        <p className="animate-pulse font-medium text-zinc-600">Loading...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-100">
        <p className="text-zinc-600">Post not found</p>
        <Link href="/" className="text-zinc-900 underline underline-offset-4">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-100 pb-12">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center px-4">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-zinc-700 hover:text-zinc-950">
            ← Back
          </Link>
          <h1 className="flex-1 text-center text-base font-semibold text-zinc-900">Post details</h1>
          <div className="w-12" />
        </div>
      </header>

      <div className="mx-auto mt-8 w-full max-w-3xl space-y-6 px-4">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <CardTitle className="text-2xl">{post.title}</CardTitle>
              <Badge variant="secondary">@{post.authorName || 'Anonymous'}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-6 whitespace-pre-wrap text-zinc-700">{post.content}</p>
            <div className="flex items-center justify-between text-sm text-zinc-500">
              <span>{new Date(post.createdAt).toLocaleString()}</span>
              <button
                onClick={handleLike}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-zinc-700 transition hover:bg-zinc-100"
              >
                <span aria-hidden="true">♡</span>
                <span>{post.likes || 0}</span>
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add a comment</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCommentSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  type="text"
                  placeholder="Nickname (required)"
                  value={commentAuthorName}
                  onChange={(e) => setCommentAuthorName(e.target.value)}
                  required
                />
                <Input
                  type="email"
                  placeholder="Email (optional, private)"
                  value={commentAuthorEmail}
                  onChange={(e) => setCommentAuthorEmail(e.target.value)}
                />
              </div>
              <Textarea
                placeholder="Write a comment..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                className="min-h-24"
                required
              />
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? 'Posting...' : 'Comment'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <section className="space-y-3">
          <h3 className="px-1 text-lg font-semibold text-zinc-800">Comments ({post.comments?.length || 0})</h3>
          {post.comments && post.comments.length > 0 ? (
            post.comments.map((comment: Comment) => (
              <Card key={comment._id.toString()} className="bg-zinc-50">
                <CardContent className="px-5 pb-4 pt-5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-zinc-800">@{comment.authorName || 'Anonymous'}</span>
                    <span className="text-xs text-zinc-500">{new Date(comment.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-zinc-700">{comment.content}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="py-8 text-center text-sm text-zinc-500">No comments yet.</p>
          )}
        </section>
      </div>
    </main>
  );
}
