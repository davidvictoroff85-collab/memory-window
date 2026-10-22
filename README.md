# Memory Window

**See A through Z. Know what is missing.**

A small, local-first evidence inspector. Follow a record to its dependencies, detect missing steps and altered content, and store repeated text once while preserving each separate record.

**Status: working prototype, v0.2.0.** Synthetic demo included. No accounts, application telemetry, or runtime dependencies. Licensed under [Apache License 2.0](LICENSE). You may use, modify, and distribute this tool, including commercially, subject to the license terms.

## Try it

**[Open the browser demo](https://davidvictoroff85-collab.github.io/memory-window/)** — no installation. Start with the missing-evidence AI decision example, inspect the decision and its dependencies, then compare with the complete example. All example records are fictional. Imported files stay in your browser; the hosting provider receives normal page requests.

[Download a versioned release and sample bundles](https://github.com/davidvictoroff85-collab/memory-window/releases).

### Run locally

Requires Node.js 24 or newer.

```sh
git clone https://github.com/davidvictoroff85-collab/memory-window.git
cd memory-window
npm start
```

Open http://127.0.0.1:4173. Click any of the 26 declared steps. Try **Remove Q**, then **Tamper with evidence**. You can open a local JSON bundle; its contents stay in the browser.

## What it does

- Shows every declared record, including missing steps.
- Lets you follow dependencies and inspect exact text and content digests.
- Deduplicates identical UTF-8 payloads without merging attribution records.
- Detects content and manifest changes relative to their included hashes.
- Exports explicitly public records, replacing withheld references with neutral gap IDs.
- Verifies against an independently obtained manifest digest when supplied.

A self-contained hash can be recomputed by an attacker. It establishes consistency, not authorship or truth. Completeness is limited to the declared scope. Public text may itself contain sensitive material: review exports before sharing. The app does not classify secrets or redact text automatically.

## Command line

```sh
node cli.mjs sample example.local.json
node cli.mjs verify example.local.json
node cli.mjs verify example.local.json INDEPENDENTLY_TRUSTED_SHA256
node cli.mjs pack input.local.json bundle.local.json
node cli.mjs export-public bundle.local.json public.local.json
```

Output paths must not already exist. Verification exits with status 1 for incomplete or invalid bundles. `pack` expects:

```json
{"expectedIds":["A","B"],"records":[
  {"id":"A","title":"Original observation","content":"Example only","parents":[],"visibility":"private"},
  {"id":"B","title":"Decision","content":"Example decision","parents":["A"],"visibility":"public"}
]}
```

`source` is an optional HTTP(S) URL, recorded as supplied, never fetched. IDs are unique ASCII letters, digits, underscores or hyphens. Maximum 500 records and 2 MB per bundle. Use new IDs for revisions and retain their predecessors as dependencies; this prototype does not enforce revision semantics.

## Development

```sh
npm run check
npm test
```

Native JavaScript modules; no installation step required. The tests cover integrity, declared gaps, cycles, private exports, byte accounting, CLI behavior and the loopback server. Browser assets are plain HTML/CSS/JS.

## Storage accounting

The interface separately reports logical payload bytes, unique stored payload bytes, and total serialized bundle bytes. Metadata costs space: small bundles can be larger than their original text. This is exact-content deduplication, not semantic compression. Exports across multiple files do not share a global object store.

## What comes next

See [the roadmap](docs/ROADMAP.md) and [design boundaries](docs/DESIGN.md). Report a reproducible problem using Issues. No private conversations, customer records, or credentials belong in public examples.

Built by [davidvictoroff85-collab](https://github.com/davidvictoroff85-collab). Related platform: [Victoroff OS](https://github.com/davidvictoroff85-collab/victoroff-os).
