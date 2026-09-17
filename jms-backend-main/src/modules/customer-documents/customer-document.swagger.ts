/**
 * @swagger
 * tags:
 *   name: Customer Documents
 *   description: Customer KYC Document Management APIs
 */

/**
 * @swagger
 * /api/v1/customers/{customerId}/documents:
 *   post:
 *     summary: Add a new KYC document to customer profile
 *     tags: [Customer Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
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
 *             required:
 *               - documentType
 *             properties:
 *               documentType:
 *                 type: string
 *                 enum: [AADHAR, PAN, PASSPORT, VOTER_ID, DRIVING_LICENSE, GST_CERTIFICATE, OTHER]
 *                 example: AADHAR
 *               documentNumber:
 *                 type: string
 *                 example: 998877665544
 *               fileUrl:
 *                 type: string
 *                 example: https://storage.jewelleryerp.com/kyc/cust_123_aadhar.pdf
 *     responses:
 *       201:
 *         description: Customer document added successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Customer not found
 *
 *   get:
 *     summary: Get all KYC documents for a customer
 *     tags: [Customer Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of customer documents retrieved successfully
 */

/**
 * @swagger
 * /api/v1/customers/{customerId}/documents/{documentId}:
 *   get:
 *     summary: Get customer document details by ID
 *     tags: [Customer Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Document details retrieved successfully
 *       404:
 *         description: Document or Customer not found
 *
 *   put:
 *     summary: Update customer document details
 *     tags: [Customer Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: documentId
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
 *               documentNumber:
 *                 type: string
 *               fileUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Document updated successfully
 *       404:
 *         description: Document or Customer not found
 *
 *   delete:
 *     summary: Delete customer document record
 *     tags: [Customer Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Document deleted successfully
 *       404:
 *         description: Document or Customer not found
 */
