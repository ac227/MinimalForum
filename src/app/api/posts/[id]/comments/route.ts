import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId, type UpdateFilter, type Document } from 'mongodb';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { content, authorName, authorEmail } = await request.json();

    if (!content || !authorName) {
      return NextResponse.json({ error: 'Content and nickname are required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('posts');

    const newComment = {
      _id: new ObjectId(),
      content,
      authorName,
      authorEmail: authorEmail || null,
      createdAt: new Date(),
    };

    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $push: { comments: newComment } } as unknown as UpdateFilter<Document>
    );

    return NextResponse.json({ success: true, comment: newComment });
  } catch (error) {
    console.error('Comment Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
