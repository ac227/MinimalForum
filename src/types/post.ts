import { ObjectId } from 'mongodb';

export interface Comment {
  _id: string | ObjectId;
  content: string;
  authorName: string;
  authorEmail?: string;
  createdAt: Date;
}

export interface Post {
  _id: string | ObjectId;
  title: string;
  content: string;
  authorName: string;
  authorEmail?: string;
  createdAt: Date;
  likes?: number;
  comments?: Comment[];
}

export interface PostResponse {
  posts: Post[];
  nextCursor: string | null;
}
