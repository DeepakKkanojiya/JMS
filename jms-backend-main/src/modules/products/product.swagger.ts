/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product Master Inventory APIs
 */

/**
 * @swagger
 * /api/v1/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subCategoryId
 *               - sku
 *               - name
 *             properties:
 *               subCategoryId:
 *                 type: string
 *                 format: uuid
 *               sku:
 *                 type: string
 *                 example: SKU-RING-001
 *               name:
 *                 type: string
 *                 example: 22K Designer Gold Ring
 *               description:
 *                 type: string
 *                 example: Floral Design 22K Hallmarked Gold Ring
 *               metalType:
 *                 type: string
 *                 example: GOLD
 *               purity:
 *                 type: string
 *                 example: 22K
 *               grossWeight:
 *                 type: number
 *                 example: 5.500
 *               netWeight:
 *                 type: number
 *                 example: 5.200
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Parent product sub-category not found
 *       409:
 *         description: Product SKU already exists
 *
 *   get:
 *     summary: Get paginated product list
 *     tags: [Products]
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
 *       - in: query
 *         name: subCategoryId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: metalType
 *         schema:
 *           type: string
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Product list retrieved successfully
 */

/**
 * @swagger
 * /api/v1/products/{id}:
 *   get:
 *     summary: Get product details by ID
 *     tags: [Products]
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
 *         description: Product details retrieved successfully
 *       404:
 *         description: Product not found
 *
 *   put:
 *     summary: Update product details
 *     tags: [Products]
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
 *               description:
 *                 type: string
 *               grossWeight:
 *                 type: number
 *               netWeight:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 *       409:
 *         description: Duplicate SKU
 *
 *   delete:
 *     summary: Delete product
 *     tags: [Products]
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
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */
