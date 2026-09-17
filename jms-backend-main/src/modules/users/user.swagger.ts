/**
 * @openapi
 * components:
 *   schemas:
 *     CreateUserRequest:
 *       type: object
 *       required:
 *         - roleId
 *         - firstName
 *         - email
 *         - password
 *       properties:
 *         roleId:
 *           type: string
 *           format: uuid
 *         firstName:
 *           type: string
 *           example: Rahul
 *         lastName:
 *           type: string
 *           example: Sharma
 *         email:
 *           type: string
 *           format: email
 *           example: rahul@erp.com
 *         mobile:
 *           type: string
 *           example: "9876543210"
 *         password:
 *           type: string
 *           example: Admin@123
 *     UpdateUserRequest:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *         mobile:
 *           type: string
 *         roleId:
 *           type: string
 *         status:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, SUSPENDED]
 */

/**
 * @openapi
 * /api/v1/users:
 *   post:
 *     summary: Create a new ERP user
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email or mobile already exists
 *   get:
 *     summary: List ERP users with search, role/status filters, and pagination
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User list with pagination metadata
 */
