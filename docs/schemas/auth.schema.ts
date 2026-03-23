/**
 * @swagger
 * components:
 *   schemas:
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         user:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               example: string
 *             firstname:
 *               type: string
 *               example: string
 *             lastname:
 *               type: string
 *               example: string
 *             role:
 *               type: string
 *               example: string
 *         token:
 *           type: object
 *           properties:
 *             accessToken:
 *               type: string
 *               example: string
 *             refreshToken:
 *               type: string
 *               example: string
 */