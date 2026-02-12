'use client';

import { useState, useEffect, use } from 'react';
import { Post, Comment } from '@/types/post';
import Link from 'next/link';

export default function PostDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState('');
  const [commentAuthorName, setCommentAuthorName] = useState('');
  const [commentAuthorEmail, setCommentAuthorEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPost = async () => {
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
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

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
          authorEmail: commentAuthorEmail || undefined
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPost({
          ...post,
          comments: [...(post.comments || []), data.comment],
        });
        setCommentContent('');
        // Keep author name for convenience
      }
    } catch (error) {
      console.error('Failed to comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-trans-pink font-bold animate-pulse">Loading...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">Post not found</p>
        <Link href="/" className="text-trans-blue font-bold hover:underline">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-12">
      <header className="bg-gradient-to-r from-trans-blue via-trans-pink to-trans-white py-6 shadow-md mb-8">
        <div className="max-w-2xl mx-auto px-4 flex items-center">
          <Link href="/" className="text-gray-700 hover:text-gray-900 mr-4">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 flex-1 text-center">
            Post Details
          </h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4">
        {/* Post Content */}
        <div className="bg-white rounded-2xl shadow-md p-8 mb-8 border border-trans-blue/20">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">{post.title}</h2>
            <span className="text-sm font-medium px-3 py-1 bg-blue-50 rounded-full text-trans-blue border border-trans-blue/10">
              @{post.authorName || 'Anonymous'}
            </span>
          </div>
          <p className="text-gray-600 text-lg whitespace-pre-wrap mb-6">
            {post.content}
          </p>
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>{new Date(post.createdAt).toLocaleString()}</span>
            <button
              onClick={handleLike}
              className="flex items-center space-x-2 text-trans-pink hover:scale-110 transition-transform"
            >
              <span className="text-xl">♥</span>
              <span className="font-bold">{post.likes || 0}</span>
            </button>
          </div>
        </div>

        {/* Comment Form */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-trans-pink/20">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Add a Comment</h3>
          <form onSubmit={handleCommentSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nickname (Required)"
                value={commentAuthorName}
                onChange={(e) => setCommentAuthorName(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-trans-pink"
                required
              />
              <input
                type="email"
                placeholder="Email (Optional, Private)"
                value={commentAuthorEmail}
                onChange={(e) => setCommentAuthorEmail(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-trans-pink"
              />
            </div>
            <textarea
              placeholder="Write a comment..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl h-24 focus:outline-none focus:ring-2 focus:ring-trans-pink"
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-trans-pink text-white font-bold py-2 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? 'Posting...' : 'Comment'}
            </button>
          </form>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-700 px-2">
            Comments ({post.comments?.length || 0})
          </h3>
          {post.comments && post.comments.length > 0 ? (
            post.comments.map((comment: any, index: number) => (
              <div
                key={comment._id}
                className="p-4 bg-white rounded-xl shadow-sm border border-gray-100"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-gray-700">
                    @{comment.authorName || 'Anonymous'}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-600">{comment.content}</p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 py-8">No comments yet.</p>
          )}
        </div>
      </div>
    </main>
  );
}
