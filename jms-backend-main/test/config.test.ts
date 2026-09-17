import assert from 'assert';
import { parseEnv } from '../src/config/env';

function testEnvValidation() {
  console.log('[TEST] Testing Environment Validation...');

  // 1. Valid Configuration Test
  const validEnv = {
    NODE_ENV: 'development',
    PORT: '5000',
    APP_NAME: 'Jewellery ERP Test',
    DATABASE_URL: 'postgresql://postgres:admin@localhost:5432/jewellery_erp',
    JWT_SECRET: 'test_jwt_secret',
    REFRESH_SECRET: 'test_refresh_secret',
    FRONTEND_URL: 'http://localhost:5173',
    LOG_LEVEL: 'debug',
    UPLOAD_PATH: 'uploads',
    MAX_FILE_SIZE: '5242880',
    SWAGGER_ENABLED: 'true',
  };

  const parsed = parseEnv(validEnv);
  assert.strictEqual(parsed.PORT, 5000);
  assert.strictEqual(parsed.NODE_ENV, 'development');
  assert.strictEqual(parsed.SWAGGER_ENABLED, true);
  console.log('[PASS] Positive test passed: Valid env parsed and coerced properly.');

  // 2. Missing DATABASE_URL Test
  try {
    const invalidEnv = { ...validEnv, DATABASE_URL: '' };
    parseEnv(invalidEnv);
    assert.fail('Should have thrown validation error for missing DATABASE_URL');
  } catch {
    console.log('[PASS] Negative test passed: Missing DATABASE_URL rejected.');
  }

  // 3. Missing JWT_SECRET Test
  try {
    const invalidEnv = { ...validEnv, JWT_SECRET: '' };
    parseEnv(invalidEnv);
    assert.fail('Should have thrown validation error for missing JWT_SECRET');
  } catch {
    console.log('[PASS] Negative test passed: Missing JWT_SECRET rejected.');
  }

  // 4. Invalid PORT Test
  try {
    const invalidEnv = { ...validEnv, PORT: 'invalid_port_string' };
    parseEnv(invalidEnv);
    assert.fail('Should have thrown validation error for invalid PORT');
  } catch {
    console.log('[PASS] Negative test passed: Invalid PORT rejected.');
  }

  console.log('[SUCCESS] All environment configuration tests passed successfully!');
}

testEnvValidation();
