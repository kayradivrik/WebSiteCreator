import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import http from 'node:http'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const pkg = JSON.parse(
  readFileSync(fileURLToPath(new URL('./package.json', import.meta.url)), 'utf8')
)

function createApiProxyMiddleware(port) {
  return (req, res, next) => {
    const url = req.url || ''
    if (!url.startsWith('/api')) return next()

    const headers = { ...req.headers }
    headers.host = `127.0.0.1:${port}`
    delete headers.connection

    const proxyReq = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path: url,
        method: req.method,
        headers,
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 502, proxyRes.headers)
        proxyRes.pipe(res)
      }
    )
    proxyReq.on('error', (err) => {
      if (res.headersSent) return
      res.statusCode = 502
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.end(
        JSON.stringify({
          error: 'API sunucusuna ulaşılamıyor',
          hint: `Backend 127.0.0.1:${port} çalışıyor mu?`,
          detail: err.message,
        })
      )
    })
    req.pipe(proxyReq)
  }
}

const apiPort = Number(process.env.VITE_API_PROXY_PORT || process.env.API_PORT || 5000)

/** Yerleşik proxy + preview: /api → Node ile backend */
function apiProxyPlugin() {
  return {
    name: 'api-proxy',
    enforce: 'pre',
    configureServer(server) {
      server.middlewares.use(createApiProxyMiddleware(apiPort))
    },
    configurePreviewServer(server) {
      server.middlewares.use(createApiProxyMiddleware(apiPort))
    },
  }
}

const proxyTarget = `http://127.0.0.1:${apiPort}`

// https://vite.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version || '1.0.0'),
  },
  plugins: [apiProxyPlugin(), react()],
  // vite preview için de aynı hedef (middleware bazen yetmez; çift güvence)
  preview: {
    port: 4173,
    proxy: {
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
