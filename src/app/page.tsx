'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Post } from '@/types/post';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeControls } from '@/components/theme-controls';
import { cn } from '@/lib/utils';

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
    <main className="min-h-screen bg-background pb-12">
      <header className="site-header sticky top-0 z-10 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between gap-3 px-4">
          <h1 className="text-xl font-semibold tracking-tight">Minimal Forum</h1>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="max-sm:hidden">Anonymous</Badge>
            <ThemeControls />
          </div>
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
          {posts.map((post, index) => (
            <Link
              key={post._id.toString()}
              href={`/posts/${post._id.toString()}`}
              className={cn(
                'group block rounded-card border border-border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow',
                index % 2 === 0 ? 'bg-tint-a' : 'bg-tint-b'
              )}
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold text-foreground transition-colors pastel:group-hover:text-primary">
                  {post.title}
                </h3>
                <Badge variant="secondary">@{post.authorName || 'Anonymous'}</Badge>
              </div>
              <p className="mb-4 line-clamp-3 whitespace-pre-wrap text-sm text-foreground/80">{post.content}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{new Date(post.createdAt).toLocaleString()}</span>
                <div className="flex items-center gap-4">
                  <button
                    onClick={(e) => handleLike(e, post._id.toString())}
                    aria-label={`Like this post (${post.likes || 0} likes)`}
                    className="inline-flex items-center gap-1 rounded-control px-2 py-1 transition hover:bg-accent pastel:hover:scale-110 pastel:hover:bg-transparent"
                  >
                    <span aria-hidden="true" className="text-like pastel:hidden">♡</span>
                    <span aria-hidden="true" className="hidden text-like pastel:inline">♥</span>
                    <span className="text-muted-foreground">{post.likes || 0}</span>
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

        {!loading && posts.length === 0 && (
          <p className="py-10 text-center text-muted-foreground">No posts yet. Be the first.</p>
        )}
      </div>
    </main>
  );
}
