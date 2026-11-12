# FOR HER ♡ — GATE 2027 ECE study space

A static, personal preparation platform built with HTML, CSS and native JavaScript modules. It combines a focused CBT-style examination interface with learning, revision, local progress, Hearts and encouragement. No account, backend, database service or AI API is required.

**This is a working application with an initial content batch, not the completed 150-exam question bank.**

## Actual content milestone

| Category | Catalogue slots | Playable tests | Published question slots |
|---|---:|---:|---:|
| Historical EC papers, 2007–2026 | 20 | 0 | 0 |
| Topic practice | 80 | 24 | 288 |
| Subject practice | 40 | 9 | 108 |
| Mixed revision | 10 | 10 | 120 |
| **Total** | **150** | **43** | **516** |

**The 130-test original bank is not complete:** 56 topic tests and 31 subject tests remain, requiring 1,044 original questions. All 10 mixed tests are complete. All 20 PYQs remain intentionally locked under the user’s instruction until authentic documents, keys, diagrams, original solutions and reproduction rights are verified. Including PYQ targets, 2,344 planned slots remain unfilled.

The first three banks and their IDs are preserved. Eight subsequent 5-test batches add 480 distinct original questions. Questions are not reused to pad multiple ready tests. Every ready test has 12 questions, worked solutions, hints and executable verification evidence. Difficulty labels are author estimates, not empirically calibrated GATE difficulty ratings.

**Verification is automatic calculation/property checking plus same-system explanation review. No independent external or human expert review is claimed.** Numerical checks include elimination, direct multiplication, quadrature, contour integration, IVP integration, root finding and exhaustive truth/state enumeration. Qualitative questions record their law/property review method rather than pretending a human reviewer checked them.

The computed status and remaining IDs are in [CONTENT_PROGRESS.md](CONTENT_PROGRESS.md) and [data/validation-report.json](data/validation-report.json). Pending tests remain unavailable even if their URL is entered manually.

## Official sources and syllabus reconciliation

The official [EC 2027 syllabus PDF](https://gate2027.iitm.ac.in/static/doc/GATE2027_Syllabus/EC_GATE2027_Syllabus.pdf) became accessible on continuation. Both pages were inspected, and all eight technical sections were reconciled into `data/topics.json` and `data/syllabus.json`. Existing subject/topic IDs remain stable; missing areas such as vector analysis, two-port networks, discrete transforms/filter design, MOS capacitors, optoelectronics, memories, computer organization, compensation, coding, waveguides and fibers were added. Topics store the official source URL, section and page. Overlapping app topics are cross-mappings, not invented extra official sections. Empty repeated topic slots were reassigned to previously missing syllabus areas. General Aptitude remains an additional ninth category.

Earlier HTTP 503 access failures are retained in the source history, not presented as the current syllabus status. Shell PDF downloads still fail DNS resolution in this environment; source inspection used the web tool. The syllabus mapping is complete at the topic-hierarchy level; this does not imply complete question coverage or expert review.

The [2027 paper pattern](https://gate2027.iitm.ac.in/question_paper_pattern) was inspected: current practice uses 1/2-mark questions, one-third MCQ penalties, exact-set MSQ scoring without partial credit, and inclusive NAT ranges without penalties.

The [official schedule](https://gate2027.iitm.ac.in/) listed February 6, 7, 13, 14, 20 and 21, 2027. The dashboard explicitly counts down to the opening of this general examination window. No EC-specific date is asserted. Set `examDate` in personalization only after verifying the EC schedule.

The [official archive](https://gate2027.iitm.ac.in/download) links to 2007–2026 papers. Direct official EC PDF and key targets are recorded for 2021–2026; older cards link to the archive rather than guessing URLs. Some PDF requests timed out, and the 2026 paper exceeded the web extraction limit. An accessible source or answer key alone is not enough to release a paper. No official question text or diagrams have been copied or redistributed. Rights remain unresolved. See `data/sources.json` for access findings.

## Implemented features

- Nine navigable HTML pages with responsive navigation, light/dark/system appearance, keyboard focus, screen-reader labels and reduced-motion support.
- Dashboard with actual statistics, activity calendar, subject summaries, recommendations, level progress, achievements, configurable countdown and session continuation.
- Searchable practice/PYQ catalogues with subject, category, difficulty and availability filters. Pending content is visibly locked.
- MCQ, MSQ and NAT input; negative numbers, decimals and scientific notation; saved responses; previous/next navigation; separate reviewed-with-answer and reviewed-without-answer states.
- Absolute-deadline timers, autosave, refresh recovery and expiry submission on the active page. An expired test opened later submits using its original deadline. No background server runs when the browser is closed.
- Timed-mode solution/hint suppression. Learning mode provides progressive hints, immediate feedback and structured JSON solutions with KaTeX.
- Results with marks, penalties, accuracy, unattempted answers, bookmarks and worked solutions.
- Mistake notebook with subject/topic/status filters, retries, improvement tracking, revision markers and bookmarks. Retries reuse the bank and scoring logic; they do not complete full tests.
- Deterministically derived reward ledger, unique question/test rewards, percentage-based 80% bonuses, milestone awards, six levels, eight badges and personal notes.
- Chart.js accuracy/score trends, subject performance, topic/time tables, daily heatmap, weekly questions, cumulative Hearts and PYQ trends. Data filters and accessible chart summaries/data fallbacks. No dummy production statistics.
- Versioned, validated localStorage; guarded writes and cross-tab revision conflicts; JSON export/import with merge or confirmed replacement; imported scores recalculated and rewards rebuilt.
- Content validation with SHA-256 evidence hashes, duplicate ID/prompt detection, ready-content checks and GitHub Pages build/workflow.

## Technology and files

No npm runtime dependencies are installed. Node 24 is used for checks; Python 3 is a convenient local development server and is used only by the optional authoring scripts.

```text
index.html, practice.html, pyqs.html, exam.html, results.html,
progress.html, rewards.html, mistakes.html, settings.html
css/global.css                     design system, layouts, responsive styles
js/app.js                          configuration, navigation, page bootstrap
js/ui.js, charts.js                 accessible presentation and math rendering
js/exam-engine.js, exam-timer.js    input/navigation/session and deadline logic
js/exam-page.js                     CBT UI and submission orchestration
js/scoring-engine.js               reusable current/historical scoring
js/solution-viewer.js               structured explanation rendering
js/storage.js, backup.js            versioned persistence and validated imports
js/rewards-engine.js, achievements.js
js/analytics.js, mistakes.js        persisted activity derivation
js/*-page.js, dashboard.js, library.js, progress.js, settings.js
js/content-validation.js, question-loader.js

data/tests.json                    exactly 150 definitions referencing IDs
 data/questions/{mathematics,digital,networks}.json
 data/subjects.json, topics.json, syllabus.json
 data/rewards.json, achievements.json, messages.json, personalization.json
 data/sources.json, batch-verification.json, validation-report.json
 data/question.schema.json          authoring schema
scripts/                           content verification, validation, build
 tests/                            Node unit and workflow regression tests
.github/workflows/pages.yml        check, package, deploy static artifact
```

Question banks load only when a test/revision/result needs them. Dashboard startup fetches catalogue/configuration, not the entire bank. Charts load their library on demand when there is data to plot.

KaTeX 0.16.11, Chart.js 4.4.8 and Lucide 0.468.0 load from jsDelivr. Inter loads from Google Fonts. No API key is needed. If unavailable, labels remain readable, formulas remain visible as TeX, and chart data renders in a table. Full offline typesetting/charts are **not** included; vendor these libraries and their licenses locally before requiring offline availability.

## Run and verify

```sh
# No npm install is required. Use Node 24 or later.
npm run dev
# Open http://localhost:4173/

npm test
npm run validate
npm run check
npm run build
```

Serve over HTTP; do not open the files directly with `file://`. `npm run build` copies the deployment files to `dist/`, with no bundler or production Node process.

`npm test` covers current and custom historical penalties, all question types, input validation, timer expiry/cleanup, saved sessions, hidden exam solutions, rewards/deduplication, achievements, levels, analytics, mistakes, storage failure/conflicts and a start→answer→refresh→score→save→export→import workflow. `npm run check` verifies JavaScript syntax, module imports, nine HTML entry points and local asset references; it is not a browser test.

During this workspace run, preview server startup was blocked with `PermissionError: Operation not permitted` when creating a socket. Browser layout and interaction QA, real CDN loading and GitHub-hosted subpath behavior have **not** been verified in a live browser. Perform the manual checks below before sharing the gift.

## Question authoring and verification

1. Use the inspected EC 2027 syllabus mapping. Confirm each new problem maps to a recorded subject/topic/subtopic; preserve existing identifiers and source metadata.
2. Work in small batches. Store original questions in a new `data/questions/<batch>.json`, with stable globally unique IDs. Do not regenerate or overwrite existing published banks casually.
3. Use `data/question.schema.json` and the existing bank as the shape. Include given values, target quantity, governing concept, formula, at least three meaningful reasoning steps, substitutions/calculations, final answer, explanation and common mistakes. MCQ/MSQ options must be meaningful. NAT supports a finite inclusive `acceptedRange: [min,max]` or `acceptedRanges: [[min1,max1],[min2,max2]]`. Explicit `acceptedRanges` is authoritative; malformed unions never silently fall back to the old field. Gaps remain incorrect, endpoints are inclusive, and roundoff tolerance is local to each endpoint.
4. Initially set `verified: false` and `verification.status: "draft"`. A correct-looking answer is not verification. Check each answer independently with calculations, proof, simulation or an appropriate specialist. Check that the stated assumptions, units, prompt, options, formulas and solution match each other.
5. Record a reproducible review artifact and question content hash. `scripts/verify-batch.mjs` is the first batch's independently written checking fixture; extend or create a new checker for each new mathematical family. It checks actual content instead of generating thousands of parameter substitutions. New batches use `scripts/content/checks-NNN.mjs` and `data/content-reviews/batch-NNN.json`. The release helper performs checks before writing readiness; the validator reruns computations and verifies content hashes.
6. For simple original material, the initial release distinguishes `computationally-checked` from `expert-reviewed`. Use the latter only after a real expert review. Record reviewer/date/evidence and preserve that distinction in all claims.
7. In a ready test, every referenced question must pass `validateQuestion`. The CLI additionally validates evidence hashes and diagram files. Use `npm run validate` after every change; it fails if ready content is invalid.

The optional Python `scripts/create-catalogue.py` and `scripts/create-batch.py` are initial authoring fixtures. **Do not run them over an edited bank**: they regenerate the initial allocations/drafts. `node scripts/verify-batch.mjs` reruns checks for the first 36-question batch and releases its three tests; subsequent batches should have their own explicit review/release steps.

The validator detects identical normalized prompts and duplicate IDs. It does not automatically detect paraphrased duplicates, verify semantic correctness or prove copyright clearance. Those require review.

## Fill existing test slots

Do not append extra catalogue definitions: the total must stay exactly 150. Select an existing pending slot, add `questionIds` and `questionFiles`, and set `coveredTopics` for recommendations. Regular tests require 12 distinct, validated questions. Topic tests require one declared topic; subject tests require one declared subject. Set duration, difficulty and scoring, then change `status` to `ready` only when validation passes. This separate status gate is enforced again in the browser.

All initial regular tests use current practice scoring. Practice tests with mixed marks are scored against their own maximum; a 12-question score is never labeled as marks out of 100.

## Add an authentic historical PYQ

1. Open the exact official EC paper/session and official final answer key. Record working original URLs, original count, total marks, section rules, question numbering, types and original scoring. Never guess an older paper's format or force it to have 65 questions.
2. Record source/reuse permission status. If permission is unresolved, keep the interactive test pending and retain the official source link. An archive link is not a redistribution license.
3. Transcribe the full paper with all original options, units, diagrams and tables. Store diagrams in `assets/diagrams/` with descriptive alt text. Use stable IDs and local asset paths. Preserve session identity.
4. Each question needs `sourceType: "pyq"`, `sourceUrl`, `sourceYear`, `originalQuestionNumber`, `originalType`, verified `originalMarking`, answer verification, an expert-reviewed original solution and cleared reuse status.
5. Set `historical.actualQuestionCount` and `actualMarks` to verified originals, even if different from the catalogue target of 65/100. Keep the discrepancy in `historical.note`. Runtime validation and session creation support the actual count.
6. The current historical scorer supports explicit per-question incorrect penalties through `originalMarking.incorrectPenalty` with `scoring: {"mode":"historical","verified":true}`. Multiple disjoint NAT intervals are supported, including the form required by the 2026 key’s question 64. More elaborate historical rules (linked-answer dependencies, special marks-to-all awards, etc.) still need explicit implementation and regression tests before that paper can be released. Do not declare unsupported rules verified.
7. Complete source verification and rights fields, rerun checks, and only then publish as ready. No interactive PYQ is currently ready.

## Personalize the gift

Edit `data/personalization.json` for display name, website title, welcome, accent, special note and configurable target date. Edit daily and milestone notes in `data/messages.json`. The browser's Settings page can override display name/theme/accent locally. No personal name is committed by default. Messages are kept out of timed examination UI.

Configure Heart amounts and level thresholds in `data/rewards.json` and badge conditions in `data/achievements.json`. Earned Hearts are not spendable. Event IDs such as `question:<id>`, `test:<id>` and `score80:<id>` prevent repeat grants. Distinct test counts exclude revision-only attempts. Scores use marks/maximum marks for the 80% bonus.

An intentionally submitted, available full test with at least one response is eligible; questions may be unattempted in a legitimate GATE attempt. Empty, invalid or incomplete-content submissions earn nothing. Retries can earn the first-correct unique question reward, but cannot earn full-test or test-count awards. Streaks require actual answered-question activity on consecutive local dates, with yesterday allowed for the current streak. Milestone notes have stable IDs/timestamps and remain in Rewards.

Changing reward configuration intentionally recomputes derived Hearts from the immutable attempt history; establish final amounts before giving the application to its user.

## Progress, privacy and backups

All user progress is in this browser under `for-her.profile.v1`. Profile data includes preferences, immutable-ID attempts, answers, per-question time, sessions/deadlines, bookmarks and revised IDs; Hearts and achievements are derived and persisted. It is not synchronized. Clearing site data, using a different browser, or moving from a localhost origin to GitHub Pages does not carry progress automatically.

Use **Settings → Export my progress** regularly. On another device/origin, import the JSON backup. Merge preserves current preferences and active sessions where keys conflict, merges distinct attempts, and deduplicates bookmarks. A duplicate attempt ID with changed immutable input is rejected; derived-score differences are recalculated. Replace requires explicit confirmation and replaces preferences/history as well. Imported answers are checked against the available content and rescored; supplied reward balances are discarded. Never edit an exported backup to invent progress.

Corrupt and unsupported data are not overwritten automatically; the failure screen offers a raw recovery download. Unknown schema versions require an explicit migration in `js/storage.js`. Quota/write errors are surfaced and stale cross-tab writes are rejected. Browser-local timestamps are suitable for a personal application, not tamper-resistant examination proctoring. A static question bank necessarily contains answer data even when the timed UI hides it.

Question timing measures foreground dwell time on the question page. It excludes closed-browser intervals and is not a precise measure of active thought. Timed examination duration uses wall-clock deadlines; changing the device clock can affect it. Use one exam tab at a time.

The present bank/history fits localStorage. Large histories approaching browser quotas need IndexedDB migration; that is not implemented. Export before quota exhaustion. No Service Worker is installed, so a stale worker cannot mix content versions. Session content version is checked before recovery.

## GitHub Pages deployment

1. Create a GitHub repository and push these source files to its `main` branch. No secrets or environment variables are needed.
2. In repository **Settings → Pages**, select **GitHub Actions** as the source.
3. Run/push the included `.github/workflows/pages.yml`. It runs tests, validates content, checks paths, builds `dist/`, uploads the static artifact and deploys it.
4. Open `https://USERNAME.github.io/REPOSITORY/`. HTML links are relative and data loading uses `import.meta.url`, preserving repository prefixes. `.nojekyll` is included.
5. Configure the personal notes, verify the official syllabus/EC date, complete browser QA and import any localhost progress backup on the hosted origin.

The application has been packaged locally; no repository was created or pushed and no deployment has been performed.

## Manual release checks and remaining work

- Complete the remaining 87 original tests (56 topic, 31 subject) and retain the PYQ locks: see `CONTENT_PROGRESS.md`. The technical hierarchy has been reconciled to the official PDF.
- Obtain independent expert review of the first batch. The published subset is not complete GATE preparation coverage.
- Run desktop and mobile browsers: all nine pages, keyboard navigation, light/dark mode, math overflow, NAT signs/exponents, all palette states, refresh/resume, timeout submission, hints and result navigation.
- Complete a real test, retry a mistake, bookmark/revise it, inspect rewards and analytics, then export/merge/replace a backup. Verify repeated submission/import cannot duplicate Hearts.
- Check CDN/library availability and actual KaTeX rendering. Vendor assets and fonts if offline operation or avoiding external requests is required.
- Confirm all official links on the live hosted origin. Exercise GitHub Pages under a non-root repository URL.
- Full browser QA, offline/PWA support, IndexedDB migration and full historical edge-case scoring remain unfinished. These limitations are not disguised as complete features.

## Continue the original-content workflow

The current continuation priority is original practice, not PYQ transcription. Keep the 20 historical slots locked. Do not regenerate the catalogue or overwrite released banks to make counts look complete.

1. Select 3–5 pending original IDs from `CONTENT_PROGRESS.md`. Author distinct questions in a new `scripts/content/batch-NNN.py` using `author.py`, or write the JSON directly. Published banks cannot be overwritten by the helper.
2. Supply `scripts/content/batch-NNN.json` and separately implemented `checks-NNN.mjs`. Do not return an untested literal key as if that were numerical verification; record actual algorithms and distinguish conceptual source review from numerical checks.
3. Run `npm run content:release -- NNN`. It checks all 12 questions per test, answer results, ranges, solutions, diagrams and subject/mixed breadth, then writes evidence and updates those catalogue entries automatically.
4. Run `npm test`, `npm run validate`, `npm run check`, `npm run build`, then `npm run content:progress`. Use a shell with `set -e` so a failed command stops the batch. Resolve failures before distribution.
5. Inspect diagrams and browser behavior when browser access is available. The Node suite exercises every published bank through load → session → refresh → scoring → rewards → analytics → storage/backup. This is not live-browser verification.

A published inverse load-power question (`mixed-01`) exercises two disjoint positive NAT solution ranges. Tests check both solutions, rejection of the gap, and backup rescoring. Legacy `acceptedRange` questions and profile schema v1 remain supported without a storage migration.

Git metadata investigation is in `GIT_DIAGNOSIS.md`. The exposed read-only `.git` directory has no visible repository metadata, so no commit was made. Nothing was deleted or reinitialized. Authorized future local paper inputs belong under `source-input/`, which the static build does not publish.
