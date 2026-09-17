/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: Retail & Wholesale Customer Master Management APIs
 */

/**
 * @swagger
 * /api/v1/customers:
 *   post:
 *     summary: Create a new customer profile
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - branchId
 *               - customerCode
 *               - firstName
 *               - mobile
 *             properties:
 *               branchId:
 *                 type: string
 *                 format: uuid
 *                 example: a1b2c3d4-e5f6-7890-1234-567890abcdef
 *               customerCode:
 *                 type: string
 *                 example: CUST-DEL-001
 *               firstName:
 *                 type: string
 *                 example: Rajesh
 *               lastName:
 *                 type: string
 *                 example: Verma
 *               email:
 *                 type: string
 *                 example: rajesh.verma@example.com
 *               mobile:
 *                 type: string
 *                 example: +919811223344
 *               panNumber:
 *                 type: string
 *                 example: ABCDE1234F
 *               gstNumber:
 *                 type: string
 *                 example: 07ABCDE1234F1Z5
 *               customerType:
 *                 type: string
 *                 enum: [RETAIL, WHOLESALE, VIP]
 *                 example: RETAIL
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Customer created successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Branch not found
 *       409:
 *         description: Duplicate customer code, mobile, email, PAN, or GSTIN
 *
 *   get:
 *     summary: Get paginated customer list
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by customer name, code, mobile, email, PAN, or GSTIN
 *       - in: query
 *         name: branchId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter customers by branch ID
 *       - in: query
 *         name: customerType
 *         schema:
 *           type: string
 *           enum: [RETAIL, WHOLESALE, VIP]
 *         description: Filter by customer type
 *     responses:
 *       200:
 *         description: List of customers retrieved successfully
 */

/**
 * @swagger
 * /api/v1/customers/search:
 *   get:
 *     summary: Quick search customer by mobile, code, or name for billing/POS
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Quick search string (mobile, code, or name)
 *       - in: query
 *         name: branchId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Optional branch filter
 *     responses:
 *       200:
 *         description: Matching customer search results
 */

/**
 * @swagger
 * /api/v1/customers/{id}:
 *   get:
 *     summary: Get customer profile by ID
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Customer profile details retrieved successfully
 *       404:
 *         description: Customer not found
 *
 *   put:
 *     summary: Update customer profile
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               mobile:
 *                 type: string
 *               customerType:
 *                 type: string
 *                 enum: [RETAIL, WHOLESALE, VIP]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Customer updated successfully
 *       404:
 *         description: Customer or Branch not found
 *
 *   delete:
 *     summary: Delete customer profile
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Customer deleted successfully
 *       404:
 *         description: Customer not found
 */
