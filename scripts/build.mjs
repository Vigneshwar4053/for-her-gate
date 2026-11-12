import {rm,mkdir,cp,readdir} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});await mkdir('dist',{recursive:true});
for(const name of await readdir('.'))if(name.endsWith('.html')||['js','css','data','assets'].includes(name))await cp(name,'dist/'+name,{recursive:true});
await cp('.nojekyll','dist/.nojekyll');console.log('Static GitHub Pages artifact prepared in dist/.');
