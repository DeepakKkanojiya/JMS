/**
 * @swagger
 * tags:
 *   name: Product Categories
 *   description: Product Category Catalog Management APIs
 */

/**
 * @swagger
 * /api/v1/product-categories:
 *   post:
 *     summary: Create a new product category
 *     tags: [Product Categories]
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
 *               - code
 *             properties:
 *               name:
 *                 type: string
 *                 example: Gold Jewellery
 *               code:
 *                 type: string
 *                 example: CAT-GOLD
 *               description:
 *                 type: string
 *                 example: 22K & 18K Hallmarked Gold Ornaments
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Product category created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Category code or name already exists
 *
 *   get:
 *     summary: Get paginated product category list
 *     tags: [Product Categories]
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
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Product category list retrieved successfully
 */

/**
 * @swagger
 * /api/v1/product-categories/{id}:
 *   get:
 *     summary: Get product category profile by ID
 *     tags: [Product Categories]
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
 *         description: Product category details retrieved successfully
 *       404:
 *         description: Product category not found
 *
 *   put:
 *     summary: Update product category profile
 *     tags: [Product Categories]
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
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Product category updated successfully
 *       404:
 *         description: Product category not found
 *       409:
 *         description: Duplicate code or name
 *
 *   delete:
 *     summary: Delete product category
 *     tags: [Product Categories]
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
 *         description: Product category deleted successfully
 *       404:
 *         description: Product category not found
 */
