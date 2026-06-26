const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8081;
const PUBLIC_DIR = 'c:/AFOLU_Copernicus/visor_limpio';

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.geojson': 'application/geo+json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
    // API endpoint para listar archivos de la carpeta principal de datos (data/)
    if (req.url === '/api/capas') {
        const targetDir = path.join(PUBLIC_DIR, 'data');
        fs.readdir(targetDir, (err, files) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                res.end(JSON.stringify({ error: err.message }));
            } else {
                const geojsonFiles = files.filter(f => f.endsWith('.geojson') || f.endsWith('.json'));
                res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                res.end(JSON.stringify({ files: geojsonFiles }));
            }
        });
        return;
    }

    // Decodificar la URL para manejar espacios y caracteres especiales
    let filePath = path.join(PUBLIC_DIR, decodeURIComponent(req.url.split('?')[0]));
    if (req.url === '/' || req.url.startsWith('/?')) {
        filePath = path.join(PUBLIC_DIR, 'index.html');
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code == 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end('<h1>404 No Encontrado</h1>', 'utf-8');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end(`Error del servidor: ${error.code}\n`);
            }
        } else {
            res.writeHead(200, { 
                'Content-Type': contentType, 
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-store' // Evitar caché para desarrollo
            });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(` Geovisor Limpio corriendo localmente en:`);
    console.log(` http://localhost:${PORT}/`);
    console.log(`\n Sirviendo archivos desde:`);
    console.log(` ${PUBLIC_DIR}`);
    console.log(`==================================================\n`);
});
