# Verification milestone — 13 November 2026 (Asia/Kolkata)

- `npm test`: **102 passed, 0 failed**, Node 24 built-in runner.
- `npm run validate`: passed with **0 errors**. Warnings distinguish computational checking from independent/human review and retain all PYQ release gates.
- `npm run check`: passed for 9 HTML entry points, local assets, recursive JavaScript/module checks and repository-relative path checks.
- `npm run build`: passed; deployable static files copied to `dist/`.
- `npm run content:progress`: computes `CONTENT_PROGRESS.md` from the catalogue and report.

The regression suite exercises **every one of the 43 playable banks** through real JSON loading, MCQ/MSQ/NAT answers, saved session refresh, hidden timed solutions, submission scoring, results/solutions, rewards, achievements, analytics, persistence, export/import and duplicate-safe merge. These are Node integration tests with file-backed fetch, not browser clicks. Test activity stays in memory; no production progress is seeded or modified.

NAT tests cover both disjoint intervals, inclusive endpoints, rejection of the internal gap and external values, exact-point intervals, negative/scientific notation, malformed unions, endpoint-local floating-point tolerance, backward-compatible single ranges and a published two-positive-root load-power question. The latter is also rescored correctly through export/import. Explicit `acceptedRanges` takes precedence over legacy `acceptedRange`.

Eight new 5-test batches (`002` through `009`) add **480 original questions in 40 tests**. Existing original bank IDs and contents remain preserved under their original evidence hashes. All published original question IDs are used exactly once across ready tests. Subject tests cover multiple topics and mixed tests cover at least five subjects. New numerical/property fixtures are rerun by validation; SHA-256 content hashes detect post-review drift. Diagrams have file/alt/title checks and source-level topology review; visual rendering was not verified.

The official EC 2027 PDF was successfully inspected in this continuation and the complete technical hierarchy reconciled while preserving existing IDs. Source access history and university references are in `data/sources.json`. Automatic calculation/property checks and same-system solution review are distinguished from independent external or human review: **0 questions are claimed as independently or human expert-reviewed**.

Browser preview: **not verified**. `npm run dev` was attempted again; the environment rejected socket creation with `PermissionError: [Errno 1] Operation not permitted`. No live desktop/mobile interaction, real CDN typesetting or rendered diagram QA is claimed. Repository-prefix resolution is tested as a path property, not as a deployed-browser result.

Git: **no commit performed**. The exposed `.git` directory is empty/read-only and lacks visible metadata. Read-only investigation is recorded in `GIT_DIAGNOSIS.md`; no removal or reinitialization occurred.

Content: exactly **150 catalogue slots**. **43 original tests / 516 checked questions** are playable: 24 topic, 9 subject, all 10 mixed. **87 original tests / 1,044 original question slots remain**. All 20 PYQs stay locked. Including PYQ targets, 107 tests and 2,344 planned question slots remain unavailable. No official question statements, diagrams or third-party worked solutions have been redistributed.

No frontend redesign, color changes, storage-schema replacement or engine rewrite was performed. Application changes are the targeted NAT range support, corresponding labels/validation, and factual source-status text. No hosting deployment has been performed.
