import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fs.realpathSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist'));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8' };
function inside(target) {
  const relative = path.relative(root, target);
  return relative !== '..' && !relative.startsWith('..' + path.sep) && !path.isAbsolute(relative);
}
const server = http.createServer(async (request, response) => {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Referrer-Policy', 'same-origin');
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' }); response.end('Method not allowed'); return;
  }
  let filename;
  try {
    let pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
    if (pathname.includes('\0') || pathname.split(/[\\/]/).some(part => part.startsWith('.'))) {
      response.writeHead(403); response.end('Forbidden'); return;
    }
    if (pathname.endsWith('/')) pathname += 'index.html';
    filename = path.resolve(root, '.' + pathname);
    if (!inside(filename)) { response.writeHead(403); response.end('Forbidden'); return; }
  } catch { response.writeHead(400); response.end('Bad request'); return; }
  try {
    filename = await fs.promises.realpath(filename);
    if (!inside(filename)) { response.writeHead(403); response.end('Forbidden'); return; }
    const stat = await fs.promises.stat(filename);
    if (!stat.isFile()) { response.writeHead(404); response.end('Not found'); return; }
    const data = await fs.promises.readFile(filename);
    response.writeHead(200, { 'Content-Type': types[path.extname(filename).toLowerCase()] || 'application/octet-stream', 'Content-Length': data.length });
    response.end(request.method === 'HEAD' ? undefined : data);
  } catch { response.writeHead(404); response.end('Not found'); }
});
server.on('error', error => {
  console.error(error.code === 'EADDRINUSE' ? 'Port 4317 is already in use. Stop the earlier local preview, then try again.' : 'The local preview could not start.');
  process.exitCode = 1;
});
server.listen(4317, '127.0.0.1', () => console.log('Bandora is ready: http://127.0.0.1:4317/ — press Ctrl+C to stop'));
