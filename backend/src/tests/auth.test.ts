import assert from 'assert';
import fetch from 'node-fetch';

// NOTE: This is a lightweight integration smoke test placeholder.
// Run backend (and database migrated + seeded) before executing with: node --test

const BASE = process.env.TEST_BASE || 'http://localhost:4000';

async function post(path: string, body: any) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

// Basic login flow test
async function run() {
  const { status, json } = await post('/auth/login', { email: 'admin@onruf.local', password: 'ChangeMe123!' });
  assert.strictEqual(status, 200, 'login should succeed');
  assert.ok(json.access, 'access token missing');
  assert.ok(json.refresh, 'refresh token missing');

  // Test org list with access token
  const orgRes = await fetch(`${BASE}/organizations`, { headers: { Authorization: `Bearer ${json.access}` } });
  assert.ok(orgRes.status !== 401, 'should be authorized for org list as admin');

  // Test refresh rotation
  const refreshRes = await post('/auth/refresh', { refresh: json.refresh });
  assert.strictEqual(refreshRes.status, 200, 'refresh should succeed');
  assert.ok(refreshRes.json.access !== json.access, 'new access token expected');
}

run();
