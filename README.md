# Minimal Forum

A minimal, anonymous forum built with Next.js 14 and MongoDB.

## Features

- **Anonymous Posting**: No account system required.
- **Cursor-based Pagination**: Efficient loading of posts.
- **Trans Flag Theme**: Beautiful gradient and alternating card colors.
- **Vercel Ready**: Optimized for serverless deployment.

## Deployment (Vercel)

This project is designed for one-click deployment to Vercel.

1. **Push to GitHub**: Upload this project to your GitHub repository.
2. **Import to Vercel**: Create a new project on Vercel and import your repository.
3. **Configure Environment Variables**:
   Add the following environment variable in the Vercel dashboard:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
4. **Deploy**: Click "Deploy" and you're done!

## Local Development

1. Clone the repository.
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Create a `.env.local` file and add your `MONGODB_URI`.
4. Run the development server:
   ```bash
   pnpm dev
   ```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB (Official Driver)
'''
