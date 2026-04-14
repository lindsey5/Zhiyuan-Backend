
/**
 * @swagger
 * components:
 *  schemas:
 *      Distributor:
 *          type: object
 *          properties:
 *              _id:
 *                  type: string
 *              distributor_id:
 *                  type: string
 *              parent_distributor_id:
 *                  type: string
 *              parent_distributor:
 *                  type: object
 *                  $ref: '#/components/Distributor'
 *              distributor_name:
 *                  type: string
 *              commission_rate:
 *                  type: integer;
 *              waller_balance:
 *                  type: float
 *              email:
 *                  type:string
 *              status: 
 *                  type: string
 *                  enum: [active, deleted]
 *              total_stocks:
 *                  type: integer
 *              createdAt: 
 *                  type: string
 *      
 *       
 */