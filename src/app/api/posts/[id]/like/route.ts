import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('posts');

    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { likes: 1 } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Like Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
