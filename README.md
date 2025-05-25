# Blog Platform API

A RESTful API for a blog platform built with Node.js, Express, TypeScript, and MongoDB.

## Features

- User authentication with JWT
- Role-based access control (admin/author)
- Post management (create, edit, delete, publish/draft)
- Comment system
- Search and pagination
- Input validation
- Error handling

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Yarn package manager

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd blog-platform
```

2. Install dependencies:
```bash
yarn install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/blog_platform
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
```

4. Build the project:
```bash
yarn build
```

5. Start the server:
```bash
yarn start
```

For development:
```bash
yarn dev
```

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- POST /api/auth/refresh - Refresh access token

### Posts
- GET /api/posts - Get all published posts
- GET /api/posts/my - Get user's posts (authenticated)
- POST /api/posts - Create a new post (authenticated)
- PUT /api/posts/:id - Update a post (owner/admin only)
- DELETE /api/posts/:id - Delete a post (owner/admin only)
- PATCH /api/posts/:id/status - Update post status (owner/admin only)

### Comments
- GET /api/posts/:postId/comments - Get post comments
- POST /api/posts/:postId/comments - Add a comment (authenticated)

## Development

- Run linter:
```bash
yarn lint
```

- Fix linting issues:
```bash
yarn lint:fix
```

## License

MIT