import {sample,pack,inspect} from '/core.mjs';
const $ = id => document.getElementById(id);
let bundle;
function el(tag,text,cls) { const node=document.createElement(tag);node.textContent=text;if(cls)node.className=cls;return node; }
async function show(value) {
  const report=await inspect(value);bundle=value;
  $('error').textContent='';$('summary').replaceChildren(el('h2',report.status),el('p',`${report.presentDeclared} / ${report.declared} declared records present · ${report.uniqueContents} distinct content objects`),el('p',`${report.logicalPayloadBytes} logical payload bytes → ${report.storedPayloadBytes} stored payload bytes. Full bundle: ${report.bundleBytes} bytes including metadata.`));
  for(const message of [...report.errors,...report.missing.map(id=>'Missing evidence: '+id)]) $('summary').append(el('p',message,'issue'));
  $('chain').replaceChildren();
  for(const id of [...new Set([...value.expectedIds,...value.records.map(r=>r.id)])]) {
    const button=el('button',id);button.className=value.records.some(r=>r.id===id)?'record':'record absent';button.addEventListener('click',()=>detail(id));$('chain').append(button);
  }
  detail(value.expectedIds.at(-1));
}
function detail(id) {
  const r=bundle.records.find(r=>r.id===id);$('detail').replaceChildren(el('h2',r?r.title:'Missing step '+id));
  if(!r){$('detail').append(el('p','This declared record is unavailable. Its content and provenance cannot be inspected.'));return;}
  $('detail').append(el('p','Record '+r.id+' · '+r.visibility),el('pre',bundle.blobs[r.blob]??'Content unavailable'),el('p','SHA-256 '+r.blob,'hash'),el('h3','Depends on'));
  if(!r.parents.length)$('detail').append(el('p','No parents declared. This does not prove an original source.'));
  for(const parent of r.parents){const b=el('button','Inspect '+parent);b.addEventListener('click',()=>detail(parent));$('detail').append(b);}
  if(r.source)$('detail').append(el('p','Declared source: '+r.source));
}
async function run(fn){try{await fn();}catch(e){$('error').textContent=e.message;}}
$('complete').onclick=()=>run(async()=>show(await sample()));
$('missing').onclick=()=>run(async()=>{const b=await sample();await show(await pack(b.records.filter(r=>r.id!=='Q').map(r=>({...r,content:b.blobs[r.blob]})),b.expectedIds));});
$('tampered').onclick=()=>run(async()=>{const b=await sample();b.blobs[b.records[12].blob]='Altered evidence';await show(b);});
$('upload').onchange=event=>run(async()=>{const file=event.target.files[0];if(!file)return;if(file.size>2000000)throw Error('Bundle exceeds 2 MB.');await show(JSON.parse(await file.text()));});
await run(async()=>show(await sample()));
