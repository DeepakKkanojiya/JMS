/**
 * @swagger
 * tags:
 *   name: Product Sub-Categories
 *   description: Product Sub-Category Catalog Management APIs
 */

/**
 * @swagger
 * /api/v1/product-sub-categories:
 *   post:
 *     summary: Create a new product sub-category
 *     tags: [Product Sub-Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryId
 *               - name
 *               - code
 *             properties:
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *                 example: Gold Rings
 *               code:
 *                 type: string
 *                 example: SUB-RING
 *               description:
 *                 type: string
 *                 example: 22K Ladies & Mens Gold Rings
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Product sub-category created successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Parent product category not found
 *       409:
 *         description: Sub-category code already exists
 *
 *   get:
 *     summary: Get paginated product sub-category list
 *     tags: [Product Sub-Categories]
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
 *         name: categoryId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Product sub-category list retrieved successfully
 */

/**
 * @swagger
 * /api/v1/product-sub-categories/{id}:
 *   get:
 *     summary: Get product sub-category details by ID
 *     tags: [Product Sub-Categories]
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
 *         description: Product sub-category details retrieved successfully
 *       404:
 *         description: Product sub-category not found
 *
 *   put:
 *     summary: Update product sub-category details
 *     tags: [Product Sub-Categories]
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
 *         description: Product sub-category updated successfully
 *       404:
 *         description: Product sub-category not found
 *       409:
 *         description: Duplicate code
 *
 *   delete:
 *     summary: Delete product sub-category
 *     tags: [Product Sub-Categories]
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
 *         description: Product sub-category deleted successfully
 *       404:
 *         description: Product sub-category not found
 */
