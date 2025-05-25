import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import {
  getPosts,
  getMyPosts,
  createPost,
  updatePost,
  deletePost,
  updatePostStatus,
  publishPost,
  unpublishPost,
  getPost
} from '../controllers/postController';
import { auth, checkRole, checkPostOwnership } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new post (Admin only)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *                 description: Post status (defaults to draft if not provided)
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 content:
 *                   type: string
 *                 author:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                 status:
 *                   type: string
 *                   enum: [draft, published]
 *                 publishedAt:
 *                   type: string
 *                   format: date-time
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid input or status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post(
  '/',
  auth,
  checkRole(['admin']),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
    body('status').optional().isIn(['draft', 'published']).withMessage('Status must be either draft or published')
  ],
  async (req: AuthRequest, res: Response) => {
    await createPost(req, res);
  }
);

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Get all posts with optional filtering
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published]
 *         description: Filter posts by status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search posts by title or content
 *     responses:
 *       200:
 *         description: List of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       content:
 *                         type: string
 *                       author:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                       status:
 *                         type: string
 *                         enum: [draft, published]
 *                       publishedAt:
 *                         type: string
 *                         format: date-time
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalPosts:
 *                   type: integer
 *       400:
 *         description: Invalid status parameter
 *       500:
 *         description: Server error
 */
router.get('/', async (req: Request, res: Response) => {
  await getPosts(req, res);
});

// Protected routes
router.get('/my', auth, getMyPosts);

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Get a post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post details
 *       404:
 *         description: Post not found
 */
router.get('/:id', async (req: Request, res: Response) => {
  await getPost(req, res);
});

/**
 * @swagger
 * /api/posts/{id}:
 *   put:
 *     summary: Update a post (Admin only)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Post not found
 */
router.put(
  '/:id',
  auth,
  checkRole(['admin']),
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('content').optional().trim().notEmpty().withMessage('Content cannot be empty')
  ],
  async (req: AuthRequest, res: Response) => {
    await updatePost(req, res);
  }
);

/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     summary: Delete a post (Admin only)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Post not found
 */
router.delete('/:id', auth, checkRole(['admin']), async (req: AuthRequest, res: Response) => {
  await deletePost(req, res);
});

router.patch(
  '/:id/status',
  auth,
  checkPostOwnership,
  [
    body('status')
      .isIn(['draft', 'published'])
      .withMessage('Status must be either draft or published')
  ],
  updatePostStatus
);

/**
 * @swagger
 * /api/posts/{id}/publish:
 *   post:
 *     summary: Publish a post (Admin only)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post published successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Post not found
 */
router.post('/:id/publish', auth, checkRole(['admin']), async (req: AuthRequest, res: Response) => {
  await publishPost(req, res);
});

/**
 * @swagger
 * /api/posts/{id}/unpublish:
 *   post:
 *     summary: Unpublish a post (Admin only)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post unpublished successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Post not found
 */
router.post('/:id/unpublish', auth, checkRole(['admin']), async (req: AuthRequest, res: Response) => {
  await unpublishPost(req, res);
});

export default router; 