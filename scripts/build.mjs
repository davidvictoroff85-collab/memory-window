import {mkdir,copyFile,writeFile} from 'node:fs/promises';
import {decisionExample} from '../examples.mjs';
import {sample} from '../core.mjs';
await mkdir('dist',{recursive:true});
for (const [src,dst] of [['demo/index.html','index.html'],['demo/app.mjs','app.mjs'],['demo/style.css','style.css'],['core.mjs','core.mjs'],['examples.mjs','examples.mjs']]) await copyFile(src,'dist/'+dst);
await writeFile('dist/.nojekyll','');
await mkdir('release-samples',{recursive:true});
for (const [name,bundle] of [['ai-decision',await decisionExample()],['ai-decision-missing-evidence',await decisionExample(true)],['alphabet',await sample()]]) await writeFile('release-samples/'+name+'.json',JSON.stringify(bundle,null,2)+'\n');
