/**
 * @swagger
 * components:
 *   schemas:
 *     Variant:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         variant_name:
 *           type: string
 *         price:
 *           type: number
 *         stock:
 *           type: integer
 *         sku:
 *           type: string
 *         image_url:
 *           type: string
 *
 *     Product:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
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
 *
 *     CreateProductResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Product created successfully
 *         product:
 *           $ref: '#/components/schemas/Product'
 *
 *     GetProductsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         page:
 *           type: integer
 *           example: 1
 *         limit:
 *           type: integer
 *           example: 10
 *         totalPages:
 *           type: integer
 *           example: 5
 *         products:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Product'
 *
 *     GetProductByIdResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         product:
 *           $ref: '#/components/schemas/Product'
 *
 *     DeleteProductResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Product successfully deleted.
 *
 *     NotFoundResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: Product not found.
 *
 *     UpdateVariantInput:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Present if updating existing variant
 *         variant_name:
 *           type: string
 *         price:
 *           type: number
 *         stock:
 *           type: integer
 *         sku:
 *           type: string
 *         image_url:
 *           type: string
 *           description: URL or base64 string (data:image/...)
 *
 *     UpdateProductRequest:
 *       type: object
 *       required:
 *         - product_name
 *         - description
 *         - category
 *         - variants
 *       properties:
 *         product_name:
 *           type: string
 *         description:
 *           type: string
 *         category:
 *           type: string
 *         thumbnail_url:
 *           type: string
 *           description: URL or base64 string (data:image/...)
 *         variants:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/UpdateVariantInput'
 *
 *     UpdateProductResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Product updated successfully
 *         product:
 *           $ref: '#/components/schemas/Product'
 */