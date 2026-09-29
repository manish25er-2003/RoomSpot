const LOCAL_API_PORTS = [5000, 5001, 5002, 5003, 5004, 5005]

export function getApiBaseCandidates({
  hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost',
  protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:',
  env = typeof import.meta !== 'undefined' ? import.meta.env : {},
} = {}) {
  const configuredBase = env.VITE_API_URL || env.VITE_API_BASE_URL
  if (configuredBase) {
    return [String(configuredBase).replace(/\/$/, '')]
  }

  if (['localhost', '127.0.0.1', '0.0.0.0'].includes(hostname)) {
    return LOCAL_API_PORTS.map((port) => `${protocol}//${hostname}:${port}/api`)
  }

  return ['/api']
}

export function getApiBase(options = {}) {
  return getApiBaseCandidates(options)[0]
}
