import {readFile,readdir,stat} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
const pages=['index','practice','pyqs','exam','results','progress','rewards','mistakes','settings'];
for(const page of pages){const html=await readFile(page+'.html','utf8');assert.ok(html.includes(`data-page="${page}"`));assert.ok(html.includes('id="main"'));for(const [,url] of html.matchAll(/(?:src|href)="(\.\/[^"?#]+)(?:[?#][^"]*)?"/g))await stat(url);}
async function* sourceFiles(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const path=`${dir}/${entry.name}`;if(entry.isDirectory()&&entry.name!=='__pycache__')yield* sourceFiles(path);else if(/\.(m?js)$/.test(entry.name))yield path;}}
for(const dir of ['js','scripts','tests'])for await(const path of sourceFiles(dir)){const r=spawnSync(process.execPath,['--check',path],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);const code=await readFile(path,'utf8');for(const [,spec] of code.matchAll(/(?:from\s*|import\s*)['"]([^'"]+)['"]/g)){if(spec.startsWith('.'))await stat(new URL('../'+path.replace(/[^/]+$/,'')+spec,import.meta.url));}}
console.log('9 HTML entry points, local assets, module imports and JavaScript syntax checked. Paths are relative for repository-subpath hosting. Browser interaction tests were not run by this check.');
