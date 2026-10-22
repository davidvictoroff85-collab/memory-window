import test from 'node:test';
import assert from 'node:assert/strict';
import {sample,pack,inspect,exportPublic} from '../core.mjs';
import {serve} from '../server.mjs';
import {spawnSync} from 'node:child_process';
import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const row=(id,content='same',parents=[],visibility='public')=>({id,title:id,content,parents,visibility});
test('A–Z scope and exact content deduplication',async()=>{const b=await sample(),r=await inspect(b);assert.equal(r.status,'complete within declared scope');assert.equal(r.records,26);assert.equal(r.uniqueContents,8);assert.ok(r.bundleBytes>r.storedPayloadBytes);});
test('missing declared and referenced evidence is explicit',async()=>{const r=await inspect(await pack([row('B','b',['A'])],['A','B','C']));assert.deepEqual(r.missing,['A','C']);assert.equal(r.status,'incomplete');});
test('tampered text and metadata fail verification',async()=>{const b=await sample();b.blobs[b.records[0].blob]='tamper';b.records[0].title='changed';const r=await inspect(b);assert.ok(r.errors.some(e=>e.includes('Manifest')));assert.ok(r.errors.some(e=>e.includes('Content')));});
test('trusted external digest mismatch fails',async()=>{assert.ok((await inspect(await sample(),'0'.repeat(64))).errors.some(e=>e.includes('Independent')));});
test('cycles, duplicate IDs and unsafe source URLs rejected',async()=>{assert.equal((await inspect(await pack([row('A','a',['B']),row('B','b',['A'])]))).status,'invalid');await assert.rejects(()=>pack([row('A'),row('A')]));await assert.rejects(()=>pack([{...row('A'),source:'javascript:alert(1)'}]));});
test('public export excludes private content and identifiers, preserves a gap',async()=>{const b=await pack([row('secret_patient','private data',[],'private'),row('B','public',['secret_patient']),row('withheld-1')]);const exported=await exportPublic(b);const text=JSON.stringify(exported);assert.ok(!text.includes('secret_patient'));assert.ok(!text.includes('private data'));assert.equal((await inspect(exported)).status,'incomplete');assert.ok((await inspect(exported)).missing.includes('withheld-1-gap'));});
test('exact whitespace and multibyte contents remain distinct',async()=>{const b=await pack([row('A','é'),row('B','é '),row('C','é')]);const r=await inspect(b);assert.equal(r.uniqueContents,2);assert.equal(r.logicalPayloadBytes,7);assert.equal(r.storedPayloadBytes,5);});
test('loopback server allows only demo assets',async()=>{const server=await serve(0);try{const root='http://127.0.0.1:'+server.address().port;assert.equal((await fetch(root)).status,200);assert.equal((await fetch(root+'/package.json')).status,404);assert.equal((await fetch(root,{method:'POST'})).status,404);assert.match((await fetch(root)).headers.get('content-security-policy'),/connect-src 'none'/);}finally{await new Promise(resolve=>server.close(resolve));}});
test('CLI protects output and reports invalid bundles with nonzero status',async()=>{const dir=await mkdtemp(join(tmpdir(),'mw-test-'));try{const path=join(dir,'bundle.json');const cli=new URL('../cli.mjs',import.meta.url).pathname;let r=spawnSync(process.execPath,[cli,'sample',path]);assert.equal(r.status,0);r=spawnSync(process.execPath,[cli,'sample',path]);assert.equal(r.status,1);const b=JSON.parse(await readFile(path,'utf8'));b.records.pop();await writeFile(path,JSON.stringify(b));r=spawnSync(process.execPath,[cli,'verify',path]);assert.equal(r.status,1);}finally{await rm(dir,{recursive:true,force:true});}});

 test('AI decision example exposes missing approval evidence',async()=>{
  const {decisionExample}=await import('../examples.mjs');
  assert.equal((await inspect(await decisionExample())).status,'complete within declared scope');
  const bundle=await decisionExample(true), report=await inspect(bundle);
  assert.deepEqual(report.missing,['EVIDENCE']);
  assert.ok(bundle.records.find(r=>r.id==='DECISION').parents.includes('EVIDENCE'));
  assert.match(bundle.blobs[bundle.records.find(r=>r.id==='MODEL').blob],/not a recorded model execution/);
 });
