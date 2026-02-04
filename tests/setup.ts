import '@testing-library/jest-dom';
import { beforeAll, afterAll, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables for tests
beforeAll(() => {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/fedleads_test';
  process.env.NEXTAUTH_SECRET = 'test-secret-key-for-testing-only';
  process.env.NEXTAUTH_URL = 'http://localhost:3000';
});

export {};
