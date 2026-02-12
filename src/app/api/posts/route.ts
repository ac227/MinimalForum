import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('posts');

    let query = {};
    if (cursor) {
      query = { _id: { $lt: new ObjectId(cursor) } };
    }

    const posts = await collection
      .find(query)
      .sort({ _id: -1 })
      .limit(limit)
      .toArray();

    let nextCursor = null;
    if (posts.length === limit) {
      nextCursor = posts[posts.length - 1]._id.toString();
    }

    return NextResponse.json({ posts, nextCursor });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, authorName, authorEmail } = body;

    if (!title || !content || !authorName) {
      return NextResponse.json({ error: 'Title, content and nickname are required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('posts');

    const result = await collection.insertOne({
      title,
      content,
      authorName,
      authorEmail: authorEmail || null,
      createdAt: new Date(),
      likes: 0,
      comments: [],
    });

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error: any) {
    console.error('Detailed Database Error:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: error.message 
    }, { status: 500 });
  }
}
