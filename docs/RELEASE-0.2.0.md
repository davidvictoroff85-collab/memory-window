# Memory Window 0.2.0 — prototype

Browser demo: https://davidvictoroff85-collab.github.io/memory-window/

New: installation-free static browser demo; a fictional AI-assisted refund decision with source, prompt, model, output, evidence, human decision and audit records; complete and deliberately incomplete sample bundles; reproducible static build.

Try the default missing-evidence example. Open DECISION, then inspect EVIDENCE. Compare with the complete AI decision example. Try the A–Z and tampered-content cases. Import a bundled JSON example locally.

Download memory-window-0.2.0.zip for source, or sample-bundles-0.2.0.zip for three JSON examples. SHA256SUMS covers both downloads. Checksums detect differences relative to the published values; they are not an independent identity proof.

Requirements for local CLI: Node 24+. Run npm run check and npm test; npm start serves the local demo. npm run build produces dist and release-samples. No dependency installation required.

Limits: prototype, 500 records and 2 MB bundles; exact-text deduplication only; no authenticated authorship, truth verification, automatic redaction, signatures or change-impact analysis. Completeness is within declared scope. Example model runs and decisions are synthetic. Hosted demo imports remain in-browser; ordinary hosting request logs are controlled by the host. Apache-2.0 licensed.
