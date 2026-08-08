# M-Touch Ventures

A mobile app for a prepaid electricity (ECG) vendor in Ghana to track daily
purchases, sales, commission, and float balance.

Built with Expo (React Native) + TypeScript. No login, no backend — a single
local user, with everything stored on-device.

## Running

```bash
npm install
npm start        # then press i / a, or scan the QR code with Expo Go
npm run web      # or run it in a browser

npm test         # unit tests for the calculation, date and currency logic
npm run typecheck
```

## Data model

Each **entry** is one day:

| Field | Notes |
| --- | --- |
| `id` | unique |
| `date` | `YYYY-MM-DD`, one entry per date |
| `purchase` | electricity credit/float bought that day, GHS |
| `sales` | sold to customers that day, GHS |

Saving on a date that already has an entry updates it rather than creating a
duplicate.

**Settings** are stored separately and are editable in-app: `businessName`
(default "M-Touch Ventures"), `openingBalance` (default 0), and
`lowBalanceThreshold` (default 200).

## Calculations

Derived values are never stored — they are recomputed from entries and settings
whenever either changes (`src/utils/calculations.ts`).

Per entry:

```
commission    = purchase × 0.025
wht           = commission × 0.10
netCommission = commission − wht
balance       = previous entry's balance + purchase − sales
```

The running balance starts from `openingBalance` for the earliest entry and
accumulates in date order.

Per calendar month: `totalPurchase`, `totalSales`, `totalCommission`,
`totalWht`, and `totalNetCommission` are sums over that month's entries;
`closingBalance` is the balance of the month's last entry by date.

Money is formatted as `GH₵ 1,240.50` throughout. Computed figures and
displayed figures both round through `round2` (`src/utils/number.ts`), which
corrects for binary floating point, so the ledger and the screen never
disagree about a pesewa.

## Screens

1. **Dashboard** — current float balance, low-balance warning banner, today's
   sales and net commission, this month's totals, last 7 days vs. the prior 7
   with percentage change, and three charts: daily sales vs. purchases (30d),
   float balance trend (30d), and monthly commission broken into gross / WHT /
   net. Shows an empty state until at least two entries exist.
2. **Daily Entry** — date picker defaulting to today and refusing future dates,
   purchase and sales inputs, and a live preview of gross commission, WHT, net
   commission, and the resulting projected balance. Warns when saving will
   update an existing entry. Saving navigates to Transactions.
3. **Transactions** — all entries, most recent first, filterable by month, with
   edit and delete (delete asks for confirmation) per row.
4. **Monthly Summary** — one row per calendar month, most recent first. The
   running month is included and tagged "in progress", so its totals and
   closing balance read as a snapshot rather than a final figure.
5. **Settings** — business name, opening balance, low-balance threshold, and a
   "Reset all data" action behind a confirmation step.

## Persistence

Entries and settings are written to AsyncStorage under `@mtouch/entries` and
`@mtouch/settings`, so state survives app restarts.

## Branding

The header band and tab bar carry ECG's blue-and-gold livery; the screens
themselves stay on a neutral background so figures keep their contrast and the
green/red-brown coding for balances and WHT keeps its meaning.

> **The ECG hex values in `src/theme/theme.ts` (`ecg.blue`, `ecg.gold`) are an
> approximation, not values from an official ECG brand sheet.** Replace them
> with the exact colours when you have them — they are defined in one place and
> nothing else needs to change.

This is a private bookkeeping tool for a vendor who resells ECG credit; it is
not an ECG product and does not claim to be one.

## Building

`app.json` carries the release identity: bundle identifier and Android package
`com.mtouchventures.app`, the `mtouchventures` URL scheme, portrait lock, and
the app icon / adaptive icon / splash screen (a bolt struck through a ledger
rule, in the accent green). Icons live in `assets/`.

```bash
npx expo prebuild        # generate native projects
npx eas build -p android # or -p ios, once you have an EAS account
```

## Layout

```
src/
  components/     shared UI (cards, form fields, date picker, modals)
    charts/       SVG chart primitives and axis scaling
  context/        DataContext — loads, mutates, and derives all app state
  navigation/     bottom tab navigator
  screens/        the five screens above
  storage/        AsyncStorage read/write
  theme/          colors, spacing, tabular-numeral text styles
  types/          Entry, Settings, DerivedEntry, MonthlySummary
  utils/          calculations, date helpers, currency formatting
    __tests__/    unit tests for the above
```

## Tests

`npm test` covers the parts where a quiet mistake would corrupt the books:
commission and WHT derivation, the running balance across entries (including
out-of-order input and negative balances), monthly rollups and closing
balances, the forward-filled chart series, currency formatting and rounding,
and the date helpers around month, year and leap-day boundaries.
