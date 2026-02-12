'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Post } from '@/types/post';

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
      const url = currentCursor 
        ? `/api/posts?cursor=${currentCursor}` 
        : '/api/posts';
      const res = await fetch(url);
      const data = await res.json();
      
      if (currentCursor) {
        setPosts(prev => [...prev, ...data.posts]);
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
          authorEmail: authorEmail || undefined 
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
        setPosts(posts.map(p => 
          p._id.toString() === id ? { ...p, likes: (p.likes || 0) + 1 } : p
        ));
      }
    } catch (error) {
      console.error('Failed to like:', error);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-gradient-to-r from-trans-blue via-trans-pink to-trans-white py-8 shadow-md mb-8">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Minimal Forum
        </h1>
      </header>

      <div className="max-w-2xl mx-auto px-4">
        {/* Post Form */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-trans-pink">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Create a Post</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nickname (Required)"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-trans-blue"
                required
              />
              <input
                type="email"
                placeholder="Email (Optional, Private)"
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-trans-blue"
              />
            </div>
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-trans-blue"
              required
            />
            <textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl h-32 focus:outline-none focus:ring-2 focus:ring-trans-blue"
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-trans-blue text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? 'Posting...' : 'Post Anonymously'}
            </button>
          </form>
        </div>

        {/* Post List */}
        <div className="space-y-4">
          {posts.map((post, index) => (
            <Link 
              key={post._id.toString()} 
              href={`/posts/${post._id.toString()}`}
              className={`block p-6 rounded-2xl shadow-sm border transition-all hover:shadow-md group ${
                index % 2 === 0 
                  ? 'bg-blue-50 border-trans-blue/20' 
                  : 'bg-pink-50 border-trans-pink/20'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-trans-blue transition-colors">
                  {post.title}
                </h3>
                <span className="text-xs font-medium px-2 py-1 bg-white/50 rounded-full text-gray-500">
                  @{post.authorName || 'Anonymous'}
                </span>
              </div>
              <p className="text-gray-600 whitespace-pre-wrap mb-4 line-clamp-3">
                {post.content}
              </p>
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-400">
                  {new Date(post.createdAt).toLocaleString()}
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={(e) => handleLike(e, post._id.toString())}
                    className="flex items-center space-x-1 text-trans-pink hover:scale-110 transition-transform"
                  >
                    <span>♥</span>
                    <span className="font-bold">{post.likes || 0}</span>
                  </button>
                  <div className="flex items-center space-x-1 text-gray-400">
                    <span>💬</span>
                    <span className="font-bold">{post.comments?.length || 0}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Load More */}
        {cursor && (
          <div className="mt-8 text-center">
            <button
              onClick={() => fetchPosts(cursor)}
              disabled={loading}
              className="px-8 py-3 bg-white border-2 border-trans-pink text-trans-pink font-bold rounded-full hover:bg-trans-pink hover:text-white transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}

        {!loading && posts.length === 0 && (
          <p className="text-center text-gray-400 mt-12">No posts yet. Be the first!</p>
        )}
      </div>
    </main>
  );
}
