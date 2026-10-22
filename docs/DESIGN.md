# Design and trust boundaries

Each record has a stable ID, title, explicit visibility, dependency IDs, optional declared source URL, and content digest. The blob dictionary stores exact text once per SHA-256. Distinct records can point at the same blob. The manifest digest covers the whole bundle, including scope and metadata, using recursively sorted object keys and preserved array order.

This format is versioned `memory-window/v1`. It is a prototype format, not a recognized signing or archival standard. No digital signatures, identity verification, external source verification, semantic deduplication, or permanent archival guarantees are implemented.

Verification distinguishes invalid integrity, incomplete evidence, and completeness within declared scope. A malicious author can omit evidence and declare a smaller scope. A trusted external manifest digest detects changes relative to that digest; it does not establish factual truth or how that digest became trusted.

The browser uses text nodes rather than interpreting imported HTML. The loopback server serves only four allowlisted assets and does not accept uploads. Input is limited to 2 MB and 500 records. Browser file reads stay local. The server is for local development, not a production internet deployment.

Public export selects only explicitly public records and their content. It replaces nonpublic dependencies and scope IDs with neutral missing-record IDs. Public content can still quote private material, and record count/topology can reveal information. Human review remains necessary before distribution.

The whole bundle currently lives in memory. At larger scale, use a content object store with retention rules and access controls, plus references; keep proofs and indexes small. That infrastructure is not part of this prototype.
