/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetCategoriesResponse'
 *
 *   post:
 *     summary: Create new category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Billiard Stick
 *     responses:
 *       201:
 *         description: Category successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateCategoryResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *
 * /api/categories/{id}:
 *   put:
 *     summary: Update category by ID
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Billiard Stick
 *     responses:
 *       200:
 *         description: Category successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoryResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *
 *   delete:
 *     summary: Delete category by ID
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Category successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Category successfully deleted
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server Error
 */