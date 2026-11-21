# V4.14.0 — Product Firebase project (Job 5)

## What this does
- **One codebase, two Firebase projects.** `FIREBASE_PROJECTS` in `index.html` (and the same block in `sign.html`) holds:
  - `lindsay` — Lindsay's existing project `teacher-dashboard-b4441`. Values are byte-for-byte the same as before.
  - `product` — a **separate** project for other teachers. Placeholder values until the project exists.
- **How a page picks its project (`TD_BUILD`):**
  - `product` only when the product config is filled in **and** the page is served from the product's own address
    (`<product-id>.web.app`, `<product-id>.firebaseapp.com`, or a host added to `PRODUCT_HOSTS`).
  - `product` on `localhost` / `127.0.0.1` with `?build=product` (emulator testing only).
  - Everything else, including Lindsay's GitHub Pages address (even with `?build=product`), is `lindsay`.
- **Product build behavior:** every dashboard is a new-teacher (`profile:"teacher"`) dashboard; none of Lindsay's seeds,
  migrations, Google Classroom client, or AI service are used (Classroom and AI reading say "not available in this version yet").
- **Sample Class (new teachers only, never on Lindsay's dashboard):** a checkbox on the welcome wizard's last step and a
  Settings card add a practice class with 10 made-up students, a reminder and 3 lessons. Live Class shows
  "🧪 Try the Sample Class here" when no class is on, so a teacher can tap Quick Buttons on it. Every sample id starts with
  `sample_`; "Remove sample class" deletes exactly those items (and any practice events/notes on them).

## Security rules (`firebase-product/firestore.rules`)
- `users/{uid}/dashboards/main` and `users/{uid}/dashboards/calcScan_*`: only the signed-in teacher whose uid matches
  can read, list, write or delete. Writes must carry `ownerUid == uid` and only the app's known fields.
- No teacher can read, list, query (including collection-group queries) or write another teacher's data.
- Signed-out visitors get nothing, except one calculator contract by its exact 32+ character secret link (`calcAcks`),
  which a parent can sign once (same design as `rules/calcAcks.rules`).
- Everything else is denied.
- Tests: `firebase-product/test/rules.test.mjs` (38 checks, Firestore emulator, project `demo-tdp`, port 8285).
  Run: `cd firebase-product && firebase emulators:start --project demo-tdp` then `cd test && npm i && npm test`.
- **Do not deploy these rules to Lindsay's project.** Her rules stay as they are.

## What Lindsay needs to do (needs her Google sign-in)
1. Open https://console.firebase.google.com signed in to the Google account that should own the teacher product.
   Click **Add project**, name it (for example "Teacher Dashboard App"), Google Analytics off. Note the **project ID**.
2. **Build → Authentication → Get started → Sign-in method → Google → Enable** (pick her email as support email) → Save.
3. **Build → Firestore Database → Create database → Start in production mode**, location `nam5 (United States)` → Enable.
4. **Firestore Database → Rules tab:** replace everything with the contents of `firebase-product/firestore.rules` → **Publish**.
5. **Project settings (gear) → General → Your apps → Web (`</>`)**, nickname "Teacher Dashboard", tick
   **Also set up Firebase Hosting** → Register. Copy the six `firebaseConfig` values (apiKey, authDomain, projectId,
   storageBucket, messagingSenderId, appId) and send them over. These values are not passwords; they are meant to be in the web page.
6. Stay on the free Spark plan for now.

Then (bot): paste the values into `FIREBASE_PROJECTS.product` in `index.html` and `sign.html`, set the project ID in
`firebase-product/.firebaserc`, re-run the emulator tests, and publish the product copy to the product's Hosting address
(`<project-id>.web.app`), which Lindsay approves before it goes live.
