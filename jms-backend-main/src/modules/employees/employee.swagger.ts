/**
 * @swagger
 * tags:
 *   name: Employees
 *   description: Staff & Employee Master Management APIs
 */

/**
 * @swagger
 * /api/v1/employees:
 *   post:
 *     summary: Create a new employee record
 *     tags: [Employees]
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
 *               - employeeCode
 *               - firstName
 *               - mobile
 *             properties:
 *               branchId:
 *                 type: string
 *                 format: uuid
 *                 example: a1b2c3d4-e5f6-7890-1234-567890abcdef
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 description: Optional 1-to-1 link to Phase 1 IAM User
 *                 example: b2c3d4e5-f6a7-8901-2345-678901abcdef
 *               employeeCode:
 *                 type: string
 *                 example: EMP-DEL-001
 *               firstName:
 *                 type: string
 *                 example: Aarav
 *               lastName:
 *                 type: string
 *                 example: Sharma
 *               email:
 *                 type: string
 *                 example: aarav.sharma@jewelleryerp.com
 *               mobile:
 *                 type: string
 *                 example: +919876543210
 *               designation:
 *                 type: string
 *                 example: Store Manager
 *               joiningDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-01-15
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Employee created successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Branch or User not found
 *       409:
 *         description: Duplicate employee code, mobile, email, or user assignment
 *
 *   get:
 *     summary: Get paginated employee list
 *     tags: [Employees]
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
 *         description: Search by employee name, code, mobile, or email
 *       - in: query
 *         name: branchId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter employees by branch ID
 *       - in: query
 *         name: designation
 *         schema:
 *           type: string
 *         description: Filter employees by designation
 *     responses:
 *       200:
 *         description: List of employees retrieved successfully
 */

/**
 * @swagger
 * /api/v1/employees/{id}:
 *   get:
 *     summary: Get employee profile by ID
 *     tags: [Employees]
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
 *         description: Employee details retrieved successfully
 *       404:
 *         description: Employee not found
 *
 *   put:
 *     summary: Update employee profile
 *     tags: [Employees]
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
 *               designation:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Employee updated successfully
 *       404:
 *         description: Employee or Branch not found
 *
 *   delete:
 *     summary: Delete employee record
 *     tags: [Employees]
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
 *         description: Employee deleted successfully
 *       404:
 *         description: Employee not found
 */
