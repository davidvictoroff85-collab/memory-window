#!/usr/bin/env node
import {readFile, writeFile} from 'node:fs/promises';
import {pack, inspect, sample, exportPublic} from './core.mjs';
import {serve} from './server.mjs';
try {
  const [command, path, output] = process.argv.slice(2);
  if (command === 'serve') { await serve(); }
  else if (command === 'sample') { if (!path) throw Error('Usage: node cli.mjs sample output.json'); await writeFile(path, JSON.stringify(await sample(),null,2)+'\n',{flag:'wx'}); }
  else if (['pack','verify','export-public'].includes(command)) {
    if (!path) throw Error('An input JSON file is required.');
    const raw = await readFile(path);
    if (raw.length > 2000000) throw Error('Input exceeds 2 MB.');
    const input = JSON.parse(raw);
    if (command === 'verify') {
      const report = await inspect(input,output);
      console.log(JSON.stringify(report,null,2));
      if (report.errors.length || report.missing.length) process.exitCode = 1;
    } else {
      if (!output) throw Error('An output file is required. Existing files are never overwritten.');
      const bundle = command === 'pack' ? await pack(input.records,input.expectedIds) : await exportPublic(input);
      await writeFile(output,JSON.stringify(bundle,null,2)+'\n',{flag:'wx'});
    }
  } else throw Error('Commands: serve | sample OUTPUT | pack INPUT OUTPUT | verify BUNDLE [TRUSTED_HASH] | export-public INPUT OUTPUT');
} catch(error) { console.error('Memory Window: ' + error.message); process.exitCode = 1; }
