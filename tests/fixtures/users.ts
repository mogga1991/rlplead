/**
 * Test user fixtures
 */

export const testUsers = {
  admin: {
    id: 'test-user-admin',
    email: 'admin@test.com',
    name: 'Test Admin',
    password: 'password123',
    role: 'admin',
  },

  sales: {
    id: 'test-user-sales',
    email: 'sales@test.com',
    name: 'Test Sales',
    password: 'password123',
    role: 'sales',
  },

  viewer: {
    id: 'test-user-viewer',
    email: 'viewer@test.com',
    name: 'Test Viewer',
    password: 'password123',
    role: 'viewer',
  },
};

export function createTestUser(overrides = {}) {
  return {
    id: `test-user-${Date.now()}`,
    email: `test-${Date.now()}@example.com`,
    name: 'Test User',
    password: 'password123',
    role: 'sales',
    ...overrides,
  };
}
