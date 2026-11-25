# Website Testing and Debugging Report — YojanaSetu

## A. Project Overview
- **Application Name:** YojanaSetu (`योजनासेतु`)
- **Purpose:** Privacy-first, client-side public welfare scheme discovery app with document scan simulation, guided voice Q&A, profile verification, and entitlement dashboard.
- **Technology Stack:**
  - **Frontend:** React 18 (`react`, `react-dom`), Vite 5.4.19, Tailwind CSS 3.4.17, PostCSS, Autoprefixer
  - **Linting:** ESLint 9 (`eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`)
  - **Routing & State:** Client-side state machine router in `app.jsx` (`landing` -> `scan` / `voice` -> `profile` -> `dashboard`)
  - **Backend / Database / Auth:** None (100% client-side SPA; `localStorage` used for language preference persistence; external links open official government portals and WhatsApp share URLs).
- **Screens / Views:**
  1. `LandingScreen` (Home: Scan Document, Speak in Voice, Sample Personas: Farmer / Widow / Student)
  2. `ScanScreen` (Document upload, preview, validation, and 3-step scan progress)
  3. `VoiceScreen` (3-question guided voice & 1-tap option flow with Web Speech API `speechSynthesis`)
  4. `ProfileScreen` (Editable 4-field citizen profile verification)
  5. `DashboardScreen` (Annual benefit summary, category filters, scheme cards, and application modal)

---

## B. Testing Coverage
- **Execution Environment:** Real headless Google Chrome (`playwright-core` against `http://localhost:5173`) + ESLint + Vite production build (`npm run build`).
- **Screens Tested:** 5 / 5 (`LandingScreen`, `ScanScreen`, `VoiceScreen`, `ProfileScreen`, `DashboardScreen`)
- **Functional Assertions Run:** 13 end-to-end assertions (initial run caught 3 bugs; regression run passed 13 / 13)
- **Responsive Viewports Tested:** 8 / 8 (`1920x1080`, `1440x900`, `1366x768`, `1024x768`, `768x1024`, `430x932`, `390x844`, `360x800`)

---

## C. Bugs Discovered

| Bug ID | Description | Affected Page / Component | Root Cause | Severity | Fix Applied | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-01** | Edited profile fields reverted to default persona values upon clicking `Save` | `ProfileScreen` (`app.jsx`) | `<input defaultValue={r.value} />` was uncontrolled and never saved edits back to React state | **High** | Added `profileEdits` state in `App`, controlled `draft` state in `ProfileScreen`, empty-field validation, and `onSaveProfile` callback | **Fixed & Verified** |
| **BUG-02** | Application details modal did not close when pressing the `Escape` key | `DashboardScreen` (`app.jsx`) | Modal lacked a `keydown` `Escape` listener and ARIA dialog semantics | **Medium** | Added `Escape` keydown listener, `role="dialog" aria-modal="true"`, and close-button focus handling | **Fixed & Verified** |
| **BUG-03** | Browser console logged `404 (Not Found)` on page load | `index.html` | Missing `<link rel="icon">` caused Chrome to request `/favicon.ico` (404) | **Low** | Added inline SVG data-URI favicon matching YojanaSetu branding | **Fixed & Verified** |
| **BUG-04** | Mid-scan `Back` navigation left `setTimeout` timers running, causing delayed jump to `ProfileScreen` | `ScanScreen` (`app.jsx`) | `startScan` timeouts were not tracked or cleared on component unmount | **Medium** | Tracked timer IDs in `timersRef` and cleared them in `useEffect` cleanup; added 10 MB size limit and `event.target.value = ''` reset | **Fixed & Verified** |
| **BUG-05** | `speechSynthesis` audio could keep playing after navigating away from `VoiceScreen` | `VoiceScreen` (`app.jsx`) | Missing `window.speechSynthesis.cancel()` and mic timer cleanup on unmount/answer | **Low** | Added unmount cleanup for `micTimerRef` and `speechSynthesis.cancel()` on answer and unmount | **Fixed & Verified** |
| **BUG-06** | Language selection reset to Hindi on page reload and `html[lang]` did not update | `App` (`app.jsx`) | `lang` state was not persisted to `localStorage` or synced to `document.documentElement.lang` | **Low** | Persisted `lang` in `localStorage` (`yojanasetu_lang`) and synced `document.documentElement.lang` | **Fixed & Verified** |

---

## D. Fixed Bugs
All 6 discovered bugs (**BUG-01** through **BUG-06**) were fixed in [app.jsx](file:///c:/Users/asus/OneDrive/Desktop/My%20All%20Repos/Yojna%20Setu/app.jsx) and [index.html](file:///c:/Users/asus/OneDrive/Desktop/My%20All%20Repos/Yojna%20Setu/index.html) and verified in headless Google Chrome after the final edit.

---

## E. Unresolved Issues
None observed in the client-side application. Note: External portals (`pmkisan.gov.in`, `pmayg.nic.in`, `wa.me`, etc.) are third-party government/messaging URLs opened in new tabs (`target="_blank"`) and were not modified.

---

## F. Database & Storage Verification
- **Backend Database:** Not applicable (no backend database in this project).
- **Client Storage (`localStorage`):** Verified `yojanasetu_lang` writes on language toggle and persists across `page.reload()` in Chrome.
- **In-Memory State:** Verified `profileEdits` persists across `ProfileScreen` -> `DashboardScreen` -> `Back`, and resets cleanly on starting a new check or selecting a different demo/scan/voice flow.

---

## G. API Verification
- **Backend APIs:** Not applicable (100% client-side application with no backend API endpoints).
- **Browser Web APIs:** Verified `URL.createObjectURL` / `URL.revokeObjectURL` for image preview and `window.speechSynthesis` invocation on `VoiceScreen`.

---

## H. Responsive Testing
Tested in real headless Google Chrome across 8 viewports checking `document.documentElement.scrollWidth > window.innerWidth` on Home, Profile, and Dashboard screens:
- **Desktop:** `1920x1080` — **PASS** (0 horizontal overflow)
- **Desktop:** `1440x900` — **PASS** (0 horizontal overflow)
- **Laptop:** `1366x768` — **PASS** (0 horizontal overflow)
- **Tablet:** `1024x768` — **PASS** (0 horizontal overflow)
- **Tablet:** `768x1024` — **PASS** (0 horizontal overflow)
- **Mobile:** `430x932` — **PASS** (0 horizontal overflow)
- **Mobile:** `390x844` — **PASS** (0 horizontal overflow)
- **Mobile:** `360x800` — **PASS** (0 horizontal overflow)

---

## I. Console & Network
- **Initial Run:** 1 console error (`404 (Not Found)` for `/favicon.ico`).
- **Final Regression Run:** `Console Errors: []`, `Page Errors: []`, `Failed Requests: []` (0 errors across all tested flows).

---

## J. Production Build & Lint
- **ESLint (`npm run lint`):** Passed (`eslint . --max-warnings=0`, 0 errors, 0 warnings).
- **Vite Production Build (`npm run build`):** Passed in `2.86s` (`dist/index.html` 1.46 kB, `dist/assets/index-M23Dl9wA.css` 24.16 kB, `dist/assets/index-CyxD8uUT.js` 183.43 kB).

---

## K. Final Scorecard

| Category | Total | Passed | Failed | Untested |
| :--- | :---: | :---: | :---: | :---: |
| Screens / Views | 5 | 5 | 0 | 0 |
| End-to-End Functional Assertions | 13 | 13 | 0 | 0 |
| Responsive Viewport Checks | 8 | 8 | 0 | 0 |
| Production Build & Lint Checks | 2 | 2 | 0 | 0 |
| Backend APIs / Database Operations | 0 | 0 | 0 | 0 *(N/A — client-side only)* |
| Authentication / Admin Features | 0 | 0 | 0 | 0 *(N/A — not in app)* |
