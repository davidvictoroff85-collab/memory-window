import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
const routes = {'/':'demo/index.html','/app.mjs':'demo/app.mjs','/style.css':'demo/style.css','/core.mjs':'core.mjs'};
export async function serve(port=4173) {
  const server = createServer(async(req,res)=>{
    const file = routes[req.url];
    if (req.method !== 'GET' || !Object.hasOwn(routes,req.url)) {res.writeHead(404);res.end('Not found');return;}
    try {
      const body = await readFile(new URL(file,import.meta.url));
      res.writeHead(200,{'Content-Type':file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.css')?'text/css':'text/javascript','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",'X-Content-Type-Options':'nosniff','Cache-Control':'no-store'});
      res.end(body);
    } catch {res.writeHead(500);res.end('Unable to load asset');}
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});
  console.log('Memory Window: http://127.0.0.1:' + server.address().port);
  return server;
}
