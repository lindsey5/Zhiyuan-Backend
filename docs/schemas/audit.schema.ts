/**
 * @swagger
 * components:
 *   schemas:
 *     AuditLog:
 *       type: object
 *       properties:
 *         id:
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
 *           type: object
 *           description: Associated user data
 */