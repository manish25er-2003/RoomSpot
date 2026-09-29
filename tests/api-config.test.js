import test from 'node:test'
import assert from 'node:assert/strict'

import { getApiBaseCandidates } from '../src/lib/apiConfig.js'

test('prefers the standard local API port before fallback ports', () => {
  const candidates = getApiBaseCandidates({
    hostname: 'localhost',
    protocol: 'http:',
    env: {},
  })

  assert.deepEqual(candidates, [
    'http://localhost:5000/api',
    'http://localhost:5001/api',
    'http://localhost:5002/api',
    'http://localhost:5003/api',
    'http://localhost:5004/api',
    'http://localhost:5005/api',
  ])
})

test('uses the configured VITE_API_URL when provided', () => {
  const candidates = getApiBaseCandidates({
    hostname: 'localhost',
    protocol: 'http:',
    env: { VITE_API_URL: 'https://api.example.com/api' },
  })

  assert.deepEqual(candidates, ['https://api.example.com/api'])
})
