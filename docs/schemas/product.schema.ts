/**
 * @swagger
 * components:
 *   schemas:
 *     Variant:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         variant_name:
 *           type: string
 *         price:
 *           type: number
 *         stock:
 *           type: integer
 *         sku:
 *           type: string
 *
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         product_name:
 *           type: string
 *         description:
 *           type: string
 *         category:
 *           type: string
 *         thumbnail_url:
 *           type: string
 *         variants:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Variant'
 */