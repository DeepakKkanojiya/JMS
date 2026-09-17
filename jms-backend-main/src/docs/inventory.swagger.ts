import { commonResponses } from './common.responses';

export const inventoryPaths = {
  '/inventory': {
    get: {
      summary: 'Get Inventory Items List (Staff & Admin)',
      description: 'Allowed Roles: ADMIN, OWNER, STAFF. Retrieves RFID inventory list.',
      tags: ['Inventory'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10, maximum: 100 } },
      ],
      responses: {
        200: {
          description: 'Inventory list retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'i1' },
                        name: { type: 'string', example: '24K Gold Ring 10g' },
                        category: { type: 'string', example: 'Jewellery' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        401: commonResponses[401],
        403: commonResponses[403],
        500: commonResponses[500],
      },
    },
  },
};
