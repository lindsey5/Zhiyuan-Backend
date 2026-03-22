/**
 * @swagger
 * /api/audits:
 *   get:
 *     summary: Get all audit logs
 *     description: Retrieve all audit logs with associated user information.
 *     tags: [Audit Logs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 auditLogs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AuditLog'
 *       500:
 *         description: Server error
 */