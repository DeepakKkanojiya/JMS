/**
 * @swagger
 * tags:
 *   name: Vendors
 *   description: Vendor Profile & Supplier Management APIs
 */

/**
 * @swagger
 * /api/v1/vendors:
 *   post:
 *     summary: Create a new vendor profile
 *     tags: [Vendors]
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
 *               - vendorCode
 *               - companyName
 *               - mobile
 *             properties:
 *               branchId:
 *                 type: string
 *                 format: uuid
 *               vendorCode:
 *                 type: string
 *                 example: VEND-001
 *               companyName:
 *                 type: string
 *                 example: Malabar Gold Suppliers Ltd
 *               contactPerson:
 *                 type: string
 *                 example: Ramesh Agarwal
 *               email:
 *                 type: string
 *                 example: ramesh@malabargold.com
 *               mobile:
 *                 type: string
 *                 example: 9876543210
 *               gstNumber:
 *                 type: string
 *                 example: 07AAAAA0000A1Z5
 *               panNumber:
 *                 type: string
 *                 example: ABCDE1234F
 *               addressLine1:
 *                 type: string
 *                 example: 101 Zaveri Bazaar
 *               city:
 *                 type: string
 *                 example: Mumbai
 *               state:
 *                 type: string
 *                 example: Maharashtra
 *               pincode:
 *                 type: string
 *                 example: 400002
 *               vendorType:
 *                 type: string
 *                 enum: [JEWELLERY, BULLION, GEMSTONE, PACKAGING, SERVICE, OTHER]
 *                 example: JEWELLERY
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Vendor created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Vendor code or GSTIN already exists
 *
 *   get:
 *     summary: Get paginated vendor list with search filter
 *     tags: [Vendors]
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
 *         name: branchId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Vendor list retrieved successfully
 */

/**
 * @swagger
 * /api/v1/vendors/{id}:
 *   get:
 *     summary: Get vendor profile details by ID
 *     tags: [Vendors]
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
 *         description: Vendor details retrieved successfully
 *       404:
 *         description: Vendor not found
 *
 *   put:
 *     summary: Update vendor profile details
 *     tags: [Vendors]
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
 *               companyName:
 *                 type: string
 *               contactPerson:
 *                 type: string
 *               email:
 *                 type: string
 *               mobile:
 *                 type: string
 *               gstNumber:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Vendor updated successfully
 *       404:
 *         description: Vendor not found
 *       409:
 *         description: Duplicate GSTIN
 *
 *   delete:
 *     summary: Delete vendor profile
 *     tags: [Vendors]
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
 *         description: Vendor deleted successfully
 *       404:
 *         description: Vendor not found
 */
