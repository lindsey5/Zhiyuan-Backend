/**
 * @swagger
 * components:
 *   schemas:
 *     Permission:
 *       type: object
 *       properties:
 *         _id:
 *           type: integer
 *         action:
 *           type: string
 *         role_id:
 *           type: integer
 *
 *     Role:
 *       type: object
 *       properties:
 *         _id:
 *           type: integer
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         permissions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Permission'
 *
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: integer
 *         firstname:
 *           type: string
 *         lastname:
 *           type: string
 *         email:
 *           type: string
 *         role_id:
 *           type: integer
 *
 *     UserWithRole:
 *       allOf:
 *         - $ref: '#/components/schemas/User'
 *         - type: object
 *           properties:
 *             role:
 *               $ref: '#/components/schemas/Role'
 *
 *     CreateUserRequest:
 *       type: object
 *       required:
 *         - firstname
 *         - lastname
 *         - email
 *         - password
 *         - role_id
 *       properties:
 *         firstname:
 *           type: string
 *           example: John
 *         lastname:
 *           type: string
 *           example: Doe
 *         email:
 *           type: string
 *           example: john@example.com
 *         password:
 *           type: string
 *           example: password123
 *         role_id:
 *           type: integer
 *           example: 1
 *
 *     CreateUserResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: User successfully created
 *         user:
 *           $ref: '#/components/schemas/User'
 *
 *     GetUsersResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         users:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/UserWithRole'
 *
 *     UpdateUserRequest:
 *       type: object
 *       properties:
 *         firstname:
 *           type: string
 *         lastname:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         role_id:
 *           type: integer
 *
 *     UpdateUserResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: User successfully updated
 *         updatedUser:
 *           $ref: '#/components/schemas/User'
 *
 *     GetUserByIdResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         user:
 *           $ref: '#/components/schemas/User'
 *
 *     GetMeResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         user:
 *           $ref: '#/components/schemas/UserWithRole'
 *
 *     UpdateOwnUserRequest:
 *       type: object
 *       properties:
 *         firstname:
 *           type: string
 *         lastname:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *
 *     UpdateOwnUserResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Successfully Updated
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             firstname:
 *               type: string
 *             lastname:
 *               type: string
 *             email:
 *               type: string
 *             role:
 *               type: string
 *
 *     DeleteUserResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: User successfully deleted.
 *
 *     EmailConflictResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: This email is already registered.
 *
 *     RoleNotFoundResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: Role id not found or exist.
 *
 *     UserNotFoundResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: User not found.
 */