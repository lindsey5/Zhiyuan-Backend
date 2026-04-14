/**
 * @swagger
 * components:
 *      schemas:
 *          Category:
 *              type: object
 *              properties:
 *                  _id:
 *                      type: string
 *                  name:
 *                      type: string
 *                  createdAt:
 *                      type: string
 *                      format: date-time
 *                  status:
 *                      type: string
 *                      enum: [active]
 *          GetCategoriesResponse:
 *              type: object
 *              properties:
 *                  success:
 *                      type: boolean
 *                      example: true
 *                  categories:
 *                      type: array
 *                      items:
 *                          $ref: '#/components/schemas/Category'
 *          CategoryResponse:
 *              type: object
 *              properties:
 *                  success:
 *                      type: boolean
 *                      example: true
 *                  message: 
 *                      type: string
 *                  category:
 *                      $ref: '#/components/schemas/Category'
 *                  
 *          
 */