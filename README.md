# Team 2 Year 2 Winter Decision Tool

A dependency-free browser application for comparing winter strategies in the Pork and Garlic Ice Cream classroom game. Deploy the repository through Vercel using the Other framework preset, `node build.js` as build command, and `dist` as output directory.

## Source audit

Read-only sources: `Team 2 Winter Accounting.xlsx`, `Pork and Garlic Ice Cream Year 1 Participant Rules - Visual Revised.docx`, and `day-1-home-assignment-year-2-decision-tool.docx`.

The workbook has seven sheets. `Decisions!B6` is 1. `C6:E6` are blank. Spring, summer and autumn results in Accounts and Summary are blank. `Summary!F10` is `SUM(B10:E10)` and represents Year 1 to date, not a completed annual profit. `Summary!E12:E15` and `Machines!AA6` have no autumn values. The loan register has no entered loan commitments, but that is not evidence of an autumn debt position. The application therefore opens with missing cash, tax losses, annual profit, machine accumulated depreciation and remaining life, an unconfirmed autumn machine roster, and an unknown autumn loan position. It never carries winter cash into Year 2 automatically.

The workbook's only real season is verified separately: Machine 5, Premise D, 2 tons of milk, 40,000 produced/requested/sold, Sh 1,000 marketing, Sh 1,296 net profit and Sh 76,796 closing cash. The handout's fictional worked example is a different company using Premise B.

## Use

1. Enter and confirm the actual autumn position in Starting position. Each machine copy is separate. Each outstanding loan has its outstanding balance, equal principal installment and remaining schedule.
2. Update Rules & estimates when Year 2 rules arrive. All Year 1 prices and rates remain estimates until explicitly checked. The whole-market forecast is 410,000 units for six teams; it is not an individual sales guarantee. No ranking formula is assumed.
3. Edit A and B, including premise rents, transport rates, slots, production, installation/idle state, purchases, milk, requests, marketing and borrowing timing. All machine maintenance and depreciation apply during idle ownership. New depreciation is cost divided by the entered life.
4. Test lower actual allocations. Committed costs remain fixed. Compare net profit, closing cash, debt, unsold production and milk spoilage. Select a provisional strategy and record its key assumption.

Missing numbers do not default to zero. Financial results are withheld when required calculation inputs are missing. Invalid plans show their errors beside any computed projection. Annual profit is reference information; its absence keeps the starting-position status incomplete. Unknown storage is reported as unknown, with no assumed benefit. Year 1 full milk-cost accounting is the default financial reference. Explicit storage needs user-entered capacities and retention; optional weighted-average inventory costing is clearly described as an estimate. Retained ice cream receives no invented P&L credit.

Posted monetary lines use whole-shekel rounding with halves away from zero. Subtotals use posted lines. Transport allocates sales by production, rounds units, sends residual to the last producing premise in order, then rounds total cost. Loan schedules use rounded equal payments and a final residual adjustment to settle the balance. Year 2 new terms are 1–8 seasons, ending by Year 3 autumn. Principal and machine purchases affect cash only; depreciation and interest affect profit. Tax losses offset later positive taxable profit, and losses increase the carried pool.

Inputs and selection are saved to this browser's local storage. No server database, analytics, external submissions or shared spreadsheet edits. The raw source documents and workbook are not published.

## Verification

Run `npm test` (or `node model.test.js`) for accounting, lower sales, changed inputs, carried losses, borrowing and funding timing, existing loans, multiple premises, rounding residuals, idle/expired machines, missing data, validation and storage. Run `npm start` for a local preview at http://127.0.0.1:4173. Run `npm run build` to reproduce the single-file `dist/index.html` bundle. The live site is a Vercel Drop to Deploy upload of that bundle. The GitHub repository holds the source and tests; automatic Git-based deployments are not connected. Future Git imports can use the included vercel.json.
