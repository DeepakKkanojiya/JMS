/**
 * @swagger
 * tags:
 *   name: Branches
 *   description: Store Showroom & Branch Master Management APIs
 */

/**
 * @swagger
 * /api/v1/branches:
 *   post:
 *     summary: Create a new branch showroom
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - companyId
 *               - branchCode
 *               - name
 *             properties:
 *               companyId:
 *                 type: string
 *                 format: uuid
 *                 example: a1b2c3d4-e5f6-7890-1234-567890abcdef
 *               branchCode:
 *                 type: string
 *                 example: BR-DEL-01
 *               name:
 *                 type: string
 *                 example: Connaught Place Flagship Store
 *               email:
 *                 type: string
 *                 example: cp.delhi@royaljewellers.com
 *               phone:
 *                 type: string
 *                 example: +911123456789
 *               addressLine1:
 *                 type: string
 *                 example: Block C, Connaught Place
 *               city:
 *                 type: string
 *                 example: New Delhi
 *               state:
 *                 type: string
 *                 example: Delhi
 *               pincode:
 *                 type: string
 *                 example: 110001
 *               isMainBranch:
 *                 type: boolean
 *                 example: true
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Branch created successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Company not found
 *       409:
 *         description: Duplicate branch code
 *
 *   get:
 *     summary: Get paginated branch list
 *     tags: [Branches]
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
 *         description: Search by branch name, code, city, or state
 *       - in: query
 *         name: companyId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter branches by company ID
 *     responses:
 *       200:
 *         description: List of branches retrieved successfully
 */

/**
 * @swagger
 * /api/v1/branches/{id}:
 *   get:
 *     summary: Get branch profile by ID
 *     tags: [Branches]
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
 *         description: Branch details retrieved successfully
 *       404:
 *         description: Branch not found
 *
 *   put:
 *     summary: Update branch profile
 *     tags: [Branches]
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
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               addressLine1:
 *                 type: string
 *               city:
 *                 type: string
 *               isMainBranch:
 *                 type: boolean
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Branch updated successfully
 *       404:
 *         description: Branch or Company not found
 *
 *   delete:
 *     summary: Delete branch profile
 *     tags: [Branches]
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
 *         description: Branch deleted successfully
 *       400:
 *         description: Cannot delete branch with active staff, customers, or vendors
 *       404:
 *         description: Branch not found
 */
