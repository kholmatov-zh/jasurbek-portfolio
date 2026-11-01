import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {networkInterfaces} from 'node:os';
const root=fileURLToPath(new URL('./dist/',import.meta.url));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg','.png':'image/png'};
const server=http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://127.0.0.1');const name=decodeURIComponent(url.pathname);const target=path.resolve(root,'.'+(name==='/'?'/index.html':name));if(!target.startsWith(root)||req.method!=='GET'){res.writeHead(404).end();return}const data=await readFile(target);res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store'}).end(data)}catch{res.writeHead(404).end('Not found')}});
server.on('error',e=>{console.error(e.message);process.exitCode=1});
server.listen(Number(process.env.PORT||4320),process.env.HOST||'0.0.0.0',()=>{
 const port=server.address().port;
 console.log('Portfolio: http://127.0.0.1:'+port);
 if(process.env.HOST==='127.0.0.1')return;
 for(const addresses of Object.values(networkInterfaces())){
  for(const address of addresses||[]){
   if(address.family==='IPv4'&&!address.internal)console.log('Phone / Wi-Fi: http://'+address.address+':'+port);
  }
 }
});
