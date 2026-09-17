import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.dirname(fileURLToPath(import.meta.url));
const read=name=>readFileSync(path.join(root,name),'utf8');
const app=read('app.js').split('\n').slice(1).join('\n');
const html=read('index.html').replace('<link rel="stylesheet" href="style.css">','<style>'+read('style.css')+'</style>').replace('<script type="module" src="app.js"></script>','<script type="module">'+read('model.js')+'\n'+app+'</script>');
mkdirSync(path.join(root,'dist'),{recursive:true});writeFileSync(path.join(root,'dist/index.html'),html,'utf8');
console.log('Built dist/index.html for static Vercel deployment.');
