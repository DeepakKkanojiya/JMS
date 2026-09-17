/**
 * @swagger
 * tags:
 *   name: Companies
 *   description: Enterprise Company Master Management APIs
 */

/**
 * @swagger
 * /api/v1/companies:
 *   post:
 *     summary: Create a new company profile
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Royal Jewellers India Pvt Ltd
 *               legalName:
 *                 type: string
 *                 example: Royal Jewellers Enterprises Ltd
 *               gstNumber:
 *                 type: string
 *                 example: 07AAAAC1234A1Z5
 *               panNumber:
 *                 type: string
 *                 example: AAAAC1234A
 *               email:
 *                 type: string
 *                 example: info@royaljewellers.com
 *               phone:
 *                 type: string
 *                 example: +919876543210
 *               website:
 *                 type: string
 *                 example: https://www.royaljewellers.com
 *               logoUrl:
 *                 type: string
 *                 example: https://storage.jewelleryerp.com/logos/royal.png
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Company created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Requires company.create permission)
 *       409:
 *         description: Conflict (Duplicate GSTIN or PAN)
 *
 *   get:
 *     summary: Get paginated company list
 *     tags: [Companies]
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
 *         description: Search by company name, GSTIN, or PAN
 *     responses:
 *       200:
 *         description: List of companies retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Requires company.read permission)
 */

/**
 * @swagger
 * /api/v1/companies/{id}:
 *   get:
 *     summary: Get company profile by ID
 *     tags: [Companies]
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
 *         description: Company profile details
 *       404:
 *         description: Company not found
 *
 *   put:
 *     summary: Update company profile
 *     tags: [Companies]
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
 *               legalName:
 *                 type: string
 *               gstNumber:
 *                 type: string
 *               panNumber:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               website:
 *                 type: string
 *               logoUrl:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Company updated successfully
 *       404:
 *         description: Company not found
 *
 *   delete:
 *     summary: Delete company profile
 *     tags: [Companies]
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
 *         description: Company deleted successfully
 *       400:
 *         description: Cannot delete company with active branches
 *       404:
 *         description: Company not found
 */
