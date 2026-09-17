/**
 * @swagger
 * tags:
 *   name: Customer Addresses
 *   description: Customer Multi-Address Management APIs
 */

/**
 * @swagger
 * /api/v1/customers/{customerId}/addresses:
 *   post:
 *     summary: Add a new address to customer profile
 *     tags: [Customer Addresses]
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
 *               - addressLine1
 *               - city
 *               - state
 *               - pincode
 *             properties:
 *               addressType:
 *                 type: string
 *                 enum: [HOME, WORK, BILLING, SHIPPING, OTHER]
 *                 example: BILLING
 *               addressLine1:
 *                 type: string
 *                 example: Flat 402, Royal Palms Apartments
 *               addressLine2:
 *                 type: string
 *                 example: MG Road
 *               city:
 *                 type: string
 *                 example: New Delhi
 *               state:
 *                 type: string
 *                 example: Delhi
 *               pincode:
 *                 type: string
 *                 example: 110001
 *               isDefault:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Customer address added successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Customer not found
 *
 *   get:
 *     summary: Get all addresses for a customer
 *     tags: [Customer Addresses]
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
 *         description: List of customer addresses retrieved successfully
 */

/**
 * @swagger
 * /api/v1/customers/{customerId}/addresses/{addressId}:
 *   get:
 *     summary: Get customer address profile by ID
 *     tags: [Customer Addresses]
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
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Address details retrieved successfully
 *       404:
 *         description: Address or Customer not found
 *
 *   put:
 *     summary: Update customer address profile
 *     tags: [Customer Addresses]
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
 *         name: addressId
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
 *               addressLine1:
 *                 type: string
 *               city:
 *                 type: string
 *               pincode:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Address updated successfully
 *       404:
 *         description: Address or Customer not found
 *
 *   delete:
 *     summary: Delete customer address
 *     tags: [Customer Addresses]
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
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Address deleted successfully
 *       404:
 *         description: Address or Customer not found
 */
