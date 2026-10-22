export const schema = 'memory-window/v1';
export async function digest(text) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, '0')).join('');
}
function canonical(value) {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + canonical(value[k])).join(',') + '}';
  return JSON.stringify(value);
}
const idPattern = /^[A-Za-z0-9_-]{1,80}$/;
function validate(records, expectedIds) {
  if (!Array.isArray(records) || records.length > 500 || !Array.isArray(expectedIds) || expectedIds.length > 1000) throw Error('Expected at most 500 records and 1000 declared IDs.');
  const ids = new Set();
  for (const r of records) {
    if (!r || !idPattern.test(r.id) || ids.has(r.id)) throw Error('Record IDs must be unique letters, numbers, underscores or hyphens.');
    ids.add(r.id);
    if (typeof r.title !== 'string' || r.title.length > 300 || !['public', 'private'].includes(r.visibility)) throw Error('Every record needs a title and explicit public/private visibility.');
    if (!Array.isArray(r.parents) || r.parents.length > 500 || r.parents.some(x => typeof x !== 'string' || !idPattern.test(x)) || new Set(r.parents).size !== r.parents.length) throw Error('Parents must be distinct valid IDs.');
    if (r.source && (typeof r.source !== 'string' || !/^https?:\/\//.test(r.source) || r.source.length > 2000)) throw Error('Source must be an HTTP(S) URL.');
  }
  if (expectedIds.some(x => typeof x !== 'string' || !idPattern.test(x)) || new Set(expectedIds).size !== expectedIds.length) throw Error('Declared IDs must be unique valid IDs.');
}
export async function pack(input, expectedIds = input.map(r => r.id)) {
  validate(input, expectedIds);
  const blobs = Object.create(null), records = [];
  for (const r of input) {
    if (typeof r.content !== 'string' || r.content.length > 100000) throw Error('Each content value must be text of at most 100000 characters.');
    const blob = await digest(r.content);
    blobs[blob] = r.content;
    records.push({id:r.id, title:r.title, visibility:r.visibility, parents:[...r.parents], source:r.source || '', blob});
  }
  const body = {schema, expectedIds:[...expectedIds], records, blobs};
  const bundle = {...body, manifestHash:await digest(canonical(body))};
  if (new TextEncoder().encode(JSON.stringify(bundle)).length > 2000000) throw Error('Bundle exceeds 2 MB.');
  return bundle;
}
export async function inspect(bundle, trustedHash) {
  if (!bundle || bundle.schema !== schema || !bundle.blobs || typeof bundle.blobs !== 'object' || Array.isArray(bundle.blobs)) throw Error('Unsupported bundle format.');
  if (new TextEncoder().encode(JSON.stringify(bundle)).length > 2000000) throw Error('Bundle exceeds 2 MB.');
  validate(bundle.records, bundle.expectedIds);
  const errors = [], missing = new Set(), ids = new Map(bundle.records.map(r => [r.id,r]));
  const {manifestHash, ...body} = bundle;
  if (manifestHash !== await digest(canonical(body))) errors.push('Manifest digest mismatch');
  if (trustedHash && trustedHash !== manifestHash) errors.push('Independent trusted digest mismatch');
  for (const [hash, content] of Object.entries(bundle.blobs)) {
    if (typeof content !== 'string' || await digest(content) !== hash) errors.push('Content digest mismatch: ' + hash);
  }
  for (const r of bundle.records) {
    if (!Object.hasOwn(bundle.blobs,r.blob)) errors.push('Missing content: ' + r.id);
    for (const parent of r.parents) if (!ids.has(parent)) missing.add(parent);
  }
  for (const id of bundle.expectedIds) if (!ids.has(id)) missing.add(id);
  const active = new Set(), done = new Set();
  function visit(id) {
    if (active.has(id)) { errors.push('Cycle at ' + id); return; }
    if (done.has(id) || !ids.has(id)) return;
    active.add(id);
    for (const parent of ids.get(id).parents) visit(parent);
    active.delete(id); done.add(id);
  }
  for (const id of ids.keys()) visit(id);
  const bytes = s => new TextEncoder().encode(s).length;
  return {status:errors.length?'invalid':missing.size?'incomplete':'complete within declared scope', errors:[...new Set(errors)], missing:[...missing], records:ids.size, declared:bundle.expectedIds.length, presentDeclared:bundle.expectedIds.filter(id=>ids.has(id)).length, uniqueContents:Object.keys(bundle.blobs).length, logicalPayloadBytes:bundle.records.reduce((n,r)=>n+bytes(bundle.blobs[r.blob] || ''),0), storedPayloadBytes:Object.values(bundle.blobs).reduce((n,s)=>n+(typeof s==='string'?bytes(s):0),0), bundleBytes:bytes(JSON.stringify(bundle))};
}
export async function exportPublic(bundle) {
  const report = await inspect(bundle);
  if (report.errors.length) throw Error('Cannot export an invalid bundle.');
  const visible = new Set(bundle.records.filter(r=>r.visibility==='public').map(r=>r.id));
  const replacements = new Map();
  function reference(id) {
    if (visible.has(id)) return id;
    if (!replacements.has(id)) {
      let name = 'withheld-' + (replacements.size + 1);
      while (visible.has(name) || [...replacements.values()].includes(name)) name += '-gap';
      replacements.set(id,name);
    }
    return replacements.get(id);
  }
  return pack(bundle.records.filter(r=>visible.has(r.id)).map(r=>({...r,parents:r.parents.map(reference),content:bundle.blobs[r.blob]})),bundle.expectedIds.map(reference));
}
export async function sample() {
  const ids = Array.from({length:26},(_,i)=>String.fromCharCode(65+i));
  return pack(ids.map((id,i)=>({id,title:'Step ' + id,visibility:'public',parents:i?[ids[i-1]]:[],content:'Synthetic evidence payload ' + (i % 8) + '. Reuse preserves each distinct record.'})),ids);
}
