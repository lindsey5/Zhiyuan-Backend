/**
 * @swagger
 * components:
 *   schemas:
 *     AuditLog:
 *       type: object
 *       properties:
 *         _id:
 *           type: integer
 *         action:
 *           type: string
 *         description:
 *           type: string
 *         ip_address:
 *           type: string
 *         role:
 *           type: string
 *         severity:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH]
 *         user_agent:
 *           type: string
 *         user_id:
 *           type: integer
 *         old_values:
 *           type: object
 *           nullable: true
 *         new_values:
 *           type: object
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         user:
 *           $ref: '#/components/schemas/User'
 *           description: Associated user data
 *     GetAuditLogsResponse:
 *          type: object
 *          properties:
 *              success:
 *                  type: boolean
 *                  example: true
 *              page:
 *                  type: integer
 *                  example: 1
 *              limit:
 *                  type: integer
 *                  example: 10
 *              totalPages:
 *                  type: integer
 *                  example: 5
 *              auditLogs:
 *                  type: array
 *                  items:
 *                      $ref: '#/components/schemas/AuditLog' 
 */