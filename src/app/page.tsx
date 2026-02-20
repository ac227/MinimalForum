'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Post } from '@/types/post';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');

  const fetchPosts = async (currentCursor: string | null = null) => {
    setLoading(true);
    try {
      const url = currentCursor ? `/api/posts?cursor=${currentCursor}` : '/api/posts';
      const res = await fetch(url);
      const data = await res.json();

      if (currentCursor) {
        setPosts((prev) => [...prev, ...data.posts]);
      } else {
        setPosts(data.posts || []);
      }
      setCursor(data.nextCursor);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !authorName) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          authorName,
          authorEmail: authorEmail || undefined,
        }),
      });

      if (res.ok) {
        setTitle('');
        setContent('');
        fetchPosts();
      } else {
        const errorData = await res.json();
        alert(`Failed to post: ${errorData.details || errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to post:', error);
      alert('Failed to post: Network error or server is down');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch(`/api/posts/${id}/like`, { method: 'POST' });
      if (res.ok) {
        setPosts(posts.map((p) => (p._id.toString() === id ? { ...p, likes: (p.likes || 0) + 1 } : p)));
      }
    } catch (error) {
      console.error('Failed to like:', error);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-100 pb-12">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-4">
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900">Minimal Forum</h1>
          <Badge variant="outline">Anonymous</Badge>
        </div>
      </header>

      <div className="mx-auto mt-8 w-full max-w-3xl space-y-6 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Create a post</CardTitle>
            <CardDescription>Only nickname is required. Keep your email private.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  type="text"
                  placeholder="Nickname (required)"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  required
                />
                <Input
                  type="email"
                  placeholder="Email (optional, private)"
                  value={authorEmail}
                  onChange={(e) => setAuthorEmail(e.target.value)}
                />
              </div>
              <Input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              <Textarea
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-32"
                required
              />
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? 'Posting...' : 'Post anonymously'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {posts.map((post) => (
            <Link
              key={post._id.toString()}
              href={`/posts/${post._id.toString()}`}
              className="block rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow"
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold text-zinc-900">{post.title}</h3>
                <Badge variant="secondary">@{post.authorName || 'Anonymous'}</Badge>
              </div>
              <p className="mb-4 line-clamp-3 whitespace-pre-wrap text-sm text-zinc-700">{post.content}</p>
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>{new Date(post.createdAt).toLocaleString()}</span>
                <div className="flex items-center gap-4">
                  <button
                    onClick={(e) => handleLike(e, post._id.toString())}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-zinc-700 transition hover:bg-zinc-100"
                  >
                    <span aria-hidden="true">♡</span>
                    <span>{post.likes || 0}</span>
                  </button>
                  <div className="inline-flex items-center gap-1">
                    <span aria-hidden="true">💬</span>
                    <span>{post.comments?.length || 0}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {cursor && (
          <div className="text-center">
            <Button onClick={() => fetchPosts(cursor)} disabled={loading} variant="outline">
              {loading ? 'Loading...' : 'Load more'}
            </Button>
          </div>
        )}

        {!loading && posts.length === 0 && <p className="py-10 text-center text-zinc-500">No posts yet. Be the first.</p>}
      </div>
    </main>
  );
}
