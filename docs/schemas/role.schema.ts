/**
 * @swagger
 * components:
 *   schemas:
 *     PermissionAction:
 *       type: string
 *       example:
 *         - dashboard:view
 *         - audit:view:all
 *         - user:create
 *         - user:read
 *         - user:read:all
 *         - user:update
 *         - user:delete
 *         - role:create
 *         - role:read
 *         - role:read:all
 *         - role:update
 *         - role:delete
 *         - product:create
 *         - product:update
 *         - product:delete
 *         - order:read:all
 *         - order:read
 *         - order:updated
 *         - category:create
 *         - category:update
 *         - category:delete
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
 *
 *     RoleWithPermissions:
 *       allOf:
 *         - $ref: '#/components/schemas/Role'
 *         - type: object
 *           properties:
 *             permissions:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Permission'
 *
 *     CreateRoleRequest:
 *       type: object
 *       required:
 *         - name
 *         - permissions
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         permissions:
 *           type: array
 *           items:
 *              $ref: '#/components/schemas/PermissionAction'
 *
 *     CreateRoleResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Role successfully created
 *         role:
 *           $ref: '#/components/schemas/Role'
 *         permissions:
 *           type: array
 *           items:
 *             type: string
 *
 *     UpdateRoleRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         permissions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PermissionAction'
 *
 *     UpdateRoleResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Role successfully updated
 *         role:
 *           $ref: '#/components/schemas/RoleWithPermissions'
 *
 *     RoleResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         role:
 *           $ref: '#/components/schemas/RoleWithPermissions'
 *
 *     RolesResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         roles:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/RoleWithPermissions'
 *
 *     DeleteRoleResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Role successfully deleted.
 *
 *     RoleNotFoundResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: Role not found.
 *
 *     InvalidPermissionResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: Some permissions are invalid
 *         invalid:
 *           type: array
 *           items:
 *             type: string
 *         allowed:
 *           type: array
 *           items:
 *             type: string
 *
 *     RoleEmptyPermissionsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: Role must have at least one permission.
 */