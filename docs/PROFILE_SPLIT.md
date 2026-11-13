# V4.13.0 — Lindsay profile split

## How it decides
- A dashboard **without** `data.profile` is the original (Lindsay) dashboard. Nothing new is written to it, so her data and screens stay exactly as they were.
- A brand-new account (no cloud record and no copy on this device) starts with `teacherSeed()`: `profile:"teacher"`, no classes, no students, one empty Regular bell schedule, no Master Schedule years. A 4-step welcome wizard opens: You → School year → Classes (period, times, code, color) → Import.

## Inventory of what was tied to Lindsay (now `LINDSAY_PROFILE` or gated by `isLindsayDashboard`)
| Item | Where | New teacher gets |
|---|---|---|
| Footer "© 2026 Lindsay Shay" | footer | "Teacher Dashboard" |
| Student Calendar teacher "Mrs. Shay" | scSettings default | wizard display name |
| Calculator letter: name, "Mrs. Lindsay Shay", "Mathematics Teacher", $150 fee | calcSettings defaults | wizard name/title, $0 |
| Her school's bell schedules (6th Period MS Lunch/PLT, Pep Rally, delays, early dismissals) | seed | one empty Regular schedule built from wizard times |
| Sample class and students | seed | none |
| 2025-26 Master Schedule seed (Algebra, AP Calc, Precalc, MS Electives) + AP Calc/Precalc corrections + 2026-27 plan (GATE, Stock Market, Engineering, Crochet, Math Puzzles) | MS_SEED_*, MS_PLAN_2026_27 | no years |
| Class code/color rules by name (Algebra pink, Precalc purple, Calc blue) | classCalDefaults | wizard code/color, else initials + palette |
| PLT row → 6th period migration | lesson plan migration | skipped |
| Modules PVAAS, Accommodations, Calculator sign-out | PROFILES | off (same as V4.6.0 "product" profile) |

Not changed (shared infrastructure, see open questions): Firebase project config, Google Classroom OAuth client, AI worker endpoint, icons/manifest, "JM #" calculator label wording.
No school name, district name, or email addresses were found in the code.
