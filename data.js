/* Rosy Books prototype: ALL DATA BELOW IS FICTIONAL EXAMPLE DATA. */
"use strict";
window.RB_DATA = (function () {
  const LV = {
    1: { name: "Private", line: "Everything stays on this computer", leaves: "Nothing, unless you export a file" },
    2: { name: "Connected", line: "Your bank sends transactions in", leaves: "Only the bank link. Your books stay here" },
    3: { name: "Cloud AI", line: "Your own AI helps, item by item", leaves: "Only what you approve, each time, logged" },
  };
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
  const CIN = [12100, 13200, 13400, 12900, 14100, 13700, 13300, 13600, 14700, 9800];
  const COUT = [4900, 5100, 5600, 5200, 5700, 5300, 5600, 5400, 5450, 3900];
  // v: [FY2025, FY2024, YTD 2026 (Jan-Sep), YTD 2025 (Jan-Sep)]
  const SVC = [
    { p: "Design services", a: "4000 Service revenue", g: "inc", v: [148200, 131500, 118400, 109900] },
    { p: "Expenses billed back", a: "4100 Reimbursed expenses", g: "inc", v: [3400, 2900, 2600, 2450] },
    { p: "Rent", a: "6000 Rent expense", g: "exp", v: [18000, 16800, 14400, 13500] },
    { p: "Software", a: "6100 Software and subscriptions", g: "exp", v: [4860, 4120, 4020, 3610] },
    { p: "Contractors", a: "6500 Contract labor", g: "exp", v: [22500, 18000, 19800, 16700] },
    { p: "Insurance", a: "6400 Insurance expense", g: "exp", v: [2940, 2760, 2280, 2200] },
    { p: "Travel", a: "6200 Travel expense", g: "exp", v: [3180, 4050, 1940, 2610] },
    { p: "Accountant and legal", a: "6300 Professional fees", g: "exp", v: [2400, 2250, 1800, 1750] },
    { p: "Office supplies", a: "6700 Office supplies", g: "exp", v: [1210, 1390, 860, 940] },
    { p: "Advertising", a: "6600 Advertising and marketing", g: "exp", v: [3600, 2100, 3150, 2600] },
  ];
  const PRD = [
    { p: "Pottery sales", a: "4000 Product sales", g: "inc", v: [96400, 88200, 74900, 70100] },
    { p: "Shipping charged", a: "4100 Shipping income", g: "inc", v: [4100, 3700, 3200, 2950] },
    { p: "Discounts given", a: "4200 Sales discounts", g: "inc", v: [-2300, -1900, -1700, -1500] },
    { p: "Clay and glaze bought", a: "5000 Purchases", g: "cogs", v: [31200, 29800, 24100, 23300] },
    { p: "Shipping to me", a: "5100 Freight in", g: "cogs", v: [2450, 2300, 1880, 1760] },
    { p: "Stock count changes", a: "5200 Inventory adjustments", g: "cogs", v: [600, 450, 300, 250] },
    { p: "Rent", a: "6000 Rent expense", g: "exp", v: [12000, 11400, 9000, 8550] },
    { p: "Utilities and kiln power", a: "6050 Utilities", g: "exp", v: [3900, 3650, 2950, 2800] },
    { p: "Card processing fees", a: "6800 Merchant fees", g: "exp", v: [2890, 2640, 2250, 2090] },
    { p: "Packaging", a: "6900 Packaging supplies", g: "exp", v: [1750, 1520, 1320, 1180] },
    { p: "Advertising", a: "6600 Advertising and marketing", g: "exp", v: [2400, 2100, 1900, 1650] },
    { p: "Insurance", a: "6400 Insurance expense", g: "exp", v: [1600, 1520, 1200, 1140] },
  ];
  const PAYEES = {
    "Design services": ["Northside Bakery", "Summit Law Group", "Pine & Oak Realty", "Lakeview Dental"],
    "Software": ["Cloudnest Hosting", "Pixelworks Software", "Cloudnest Hosting", "Fontcraft Library"],
    "Contractors": ["Ana Ruiz", "Ben Okafor", "Ana Ruiz", "Lumen Copywriting"],
    "Advertising": ["Lumen Ads", "Springfield Weekly", "Lumen Ads", "Brightline Print Co."],
    "Rent": ["Maple Street Properties", "Maple Street Properties", "Maple Street Properties", "Maple Street Properties"],
    "Pottery sales": ["Market stall sales", "Online shop payout", "Gallery 9 consignment", "Holiday fair"],
    "Clay and glaze bought": ["Riverclay Supply", "Glazeworks", "Riverclay Supply", "Kiln & Co."],
  };
  const REG = [
    { d: "Sep 22", no: "", p: "Northside Bakery", c: "Design services", m: "Invoice 1031", pay: 0, dep: 2400, cl: true },
    { d: "Sep 23", no: "1047", p: "Brightline Print Co.", c: "Office supplies", m: "Brochures", pay: 315, dep: 0, cl: true },
    { d: "Sep 25", no: "", p: "Cloudnest Hosting", c: "Software", m: "Monthly plan", pay: 180, dep: 0, cl: true },
    { d: "Sep 26", no: "1048", p: "Ana Ruiz", c: "Contractors", m: "Sept illustration", pay: 1650, dep: 0, cl: true },
    { d: "Sep 29", no: "", p: "Pine & Oak Realty", c: "Design services", m: "Invoice 1029", pay: 0, dep: 1850, cl: false },
    { d: "Sep 30", no: "", p: "Transfer to savings", c: "Transfer", m: "", pay: 1000, dep: 0, cl: false },
  ];
  const CARD = [
    { d: "Sep 3", p: "Pixelworks Software", c: "Software", ch: 54, py: 0 },
    { d: "Sep 9", p: "Metro Office Supply", c: "Office supplies", ch: 128.45, py: 0 },
    { d: "Sep 14", p: "Sky Rail", c: "Travel", ch: 386.2, py: 0 },
    { d: "Sep 20", p: "Payment from checking", c: "Transfer", ch: 0, py: 1200 },
    { d: "Sep 27", p: "Lumen Ads", c: "Advertising", ch: 450, py: 0 },
  ];
  const FEED = [
    { d: "Oct 2", raw: "METRO OFFICE SUP #221", p: "Metro Office Supply", amt: -64.2, c: "Office supplies", why: "You chose this 8 times for this payee" },
    { d: "Oct 3", raw: "DEP RIVERBEND YOGA", p: "Riverbend Yoga", amt: 950, c: "Design services", why: "Amount and name match open invoice 1022" },
    { d: "Oct 5", raw: "SKYRAIL TKT 88213", p: "Sky Rail", amt: -212.4, c: "Travel", why: "You chose this 5 times for this payee" },
  ];
  const AR = [
    { c: "Northside Bakery", b: [2400, 0, 0, 0, 0] },
    { c: "Summit Law Group", b: [2250, 0, 0, 0, 800] },
    { c: "Pine & Oak Realty", b: [0, 1850, 0, 0, 0] },
    { c: "Lakeview Dental", b: [0, 0, 1200, 0, 0] },
    { c: "Riverbend Yoga", b: [0, 0, 0, 950, 0] },
  ];
  const BUCKETS = ["Not due yet", "1–30 days late", "31–60 days late", "61–90 days late", "Over 90 days late"];
  const INVOICES = [
    { n: "1034", c: "Northside Bakery", amt: 2065, due: "Nov 27", st: "Draft" },
    { n: "1033", c: "Northside Bakery", amt: 2400, due: "Oct 22", st: "Sent" },
    { n: "1032", c: "Summit Law Group", amt: 2250, due: "Oct 30", st: "Sent" },
    { n: "1029", c: "Pine & Oak Realty", amt: 1850, due: "Sep 15", st: "Late" },
    { n: "1027", c: "Lakeview Dental", amt: 1200, due: "Aug 30", st: "Late" },
    { n: "1022", c: "Riverbend Yoga", amt: 950, due: "Jul 30", st: "Late" },
    { n: "1011", c: "Summit Law Group", amt: 800, due: "May 31", st: "Late" },
  ];
  const BILLS = [
    { v: "Cloudnest Hosting", n: "CN-8831", due: "Oct 30", amt: 180, soon: true },
    { v: "Brightline Print Co.", n: "BP-2291", due: "Nov 2", amt: 420, soon: false },
    { v: "Harbor Insurance", n: "HI-0457", due: "Nov 15", amt: 720, soon: false },
  ];
  const AP_AGING = [
    { v: "Cloudnest Hosting", b: [180, 0, 0, 0, 0] },
    { v: "Brightline Print Co.", b: [420, 0, 0, 0, 0] },
    { v: "Harbor Insurance", b: [720, 0, 0, 0, 0] },
  ];
  const RECON = {
    bank: { t: "Business checking ··4410 · September 2026", a: "Money in (deposits)", b: "Money out (payments)", c: "Bank statement says", v: [21340, 14250, 10730] },
    ar: { t: "All customers · September 2026", a: "New invoices (additions)", b: "Payments received (collections)", c: "Money owed to me in the books", v: [8700, 12350, 11600] },
    ap: { t: "All vendors · September 2026", a: "New bills (additions)", b: "Bills paid (payments)", c: "Bills I owe in the books", v: [980, 2940, 2600] },
  };
  const COA = {
    service: [
      { g: "What you own", t: "Assets", a: [["1000", "Business checking", "Checking"], ["1010", "Savings", "Savings"], ["1200", "Money owed to me", "Accounts receivable"], ["1500", "Equipment", "Fixed assets"], ["1510", "Equipment wear", "Accumulated depreciation"]] },
      { g: "What you owe", t: "Liabilities", a: [["2000", "Bills I owe", "Accounts payable"], ["2100", "Business credit card", "Credit card payable"], ["2200", "Loans", "Notes payable"], ["2300", "Payroll owed", "Payroll liabilities"]] },
      { g: "Money in", t: "Income", a: [["4000", "Services I sell", "Service revenue"], ["4100", "Expenses billed back", "Reimbursed expenses"]] },
      { g: "Money out", t: "Expenses", a: [["6000", "Rent", "Rent expense"], ["6100", "Software", "Software and subscriptions"], ["6200", "Travel", "Travel expense"], ["6300", "Accountant and legal", "Professional fees"], ["6400", "Insurance", "Insurance expense"], ["6500", "Contractors", "Contract labor"]] },
    ],
    product: [
      { g: "What you own", t: "Assets", a: [["1000", "Business checking", "Checking"], ["1200", "Money owed to me", "Accounts receivable"], ["1300", "Products on hand", "Inventory"], ["1500", "Equipment", "Fixed assets"]] },
      { g: "What you owe", t: "Liabilities", a: [["2000", "Bills I owe", "Accounts payable"], ["2100", "Business credit card", "Credit card payable"], ["2400", "Sales tax collected", "Sales tax payable"], ["2200", "Loans", "Notes payable"]] },
      { g: "Money in", t: "Income", a: [["4000", "Products I sell", "Product sales"], ["4100", "Shipping charged", "Shipping income"], ["4200", "Discounts given", "Sales discounts"]] },
      { g: "Cost of what you sold", t: "Cost of goods sold", a: [["5000", "Materials bought", "Purchases"], ["5100", "Shipping to me", "Freight in"], ["5200", "Stock count changes", "Inventory adjustments"]] },
      { g: "Money out", t: "Expenses", a: [["6000", "Rent", "Rent expense"], ["6800", "Card processing fees", "Merchant fees"], ["6900", "Packaging", "Packaging supplies"], ["6600", "Advertising", "Advertising"]] },
    ],
  };
  const EQUITY = {
    sole: [["3000", "Money I put in", "Owner's capital"], ["3100", "Money I took out", "Owner's draws"], ["3900", "Starting balances", "Opening balance equity"]],
    partner: [["3000", "Partner A put in", "Partner A capital"], ["3010", "Partner A took out", "Partner A draws"], ["3100", "Partner B put in", "Partner B capital"], ["3110", "Partner B took out", "Partner B draws"], ["3900", "Starting balances", "Opening balance equity"]],
    ccorp: [["3000", "Shares issued", "Common stock"], ["3100", "Extra paid for shares", "Additional paid-in capital"], ["3200", "Profits kept in the business", "Retained earnings"], ["3300", "Dividends paid", "Dividends paid"]],
    scorp: [["3000", "Shares issued", "Common stock"], ["3100", "Extra paid for shares", "Additional paid-in capital"], ["3200", "Profits kept in the business", "Retained earnings"], ["3300", "Paid out to owners", "Shareholder distributions"]],
  };
  const FEAT = [
    { k: "feeds", name: "Bank transactions", opts: [{ l: "I import files", need: 1 }, { l: "Automatic from my bank", need: 2 }] },
    { k: "read", name: "Reading receipts", opts: [{ l: "On this computer", need: 1 }, { l: "Cloud AI for hard ones", need: 3 }] },
    { k: "cat", name: "Sorting into categories", opts: [{ l: "Rules and helper here", need: 1 }, { l: "Cloud AI suggests", need: 3 }] },
    { k: "ask", name: "Questions about my books", opts: [{ l: "Helper on this computer", need: 1 }, { l: "Cloud AI, totals only", need: 3 }] },
    { k: "inv", name: "Sending invoices", opts: [{ l: "PDF or my mail app", need: 1 }, { l: "Send from Rosy Books", need: 2 }] },
    { k: "bak", name: "Backups", opts: [{ l: "This computer or USB", need: 1 }, { l: "Also my cloud folder", need: 2 }] },
    { k: "upd", name: "App updates", opts: [{ l: "I check by hand", need: 1 }, { l: "Automatic", need: 2 }] },
    { k: "acct", name: "Accountant hand-off", opts: [{ l: "Encrypted file", need: 1 }, { l: "Shared folder", need: 2 }] },
  ];
  const LOG = [
    { t: "Oct 27, 9:41 AM", k: "ai", need: 3, who: "Claude (example)", what: "12 category totals for Jul–Sep 2026. Customer names hidden.", why: "You asked how this quarter compared" },
    { t: "Oct 27, 9:12 AM", k: "bank", need: 2, who: "Bank connection partner", what: "Asked for new transactions on 2 accounts. Nothing from your books was sent.", why: "Daily update" },
    { t: "Oct 26, 4:05 PM", k: "app", need: 1, who: "Rosy Books updates", what: "App version 1.4.2 and system type.", why: "You clicked Check for updates" },
    { t: "Oct 24, 11:30 AM", k: "ai", need: 3, who: "Grok (example)", what: "1 receipt image with card digits blurred.", why: "Helper could not read the total; you approved" },
    { t: "Oct 20, 2:15 PM", k: "bank", need: 2, who: "Bank connection partner", what: "Linked Business checking, read-only.", why: "You added an account" },
  ];
  const RECEIPTS = [
    { f: "metro-office-receipt.jpg", s: "done", v: "Metro Office Supply", d: "Oct 2", t: "$64.20", c: "Office supplies" },
    { f: "cloudnest-invoice-oct.pdf", s: "done", v: "Cloudnest Hosting", d: "Oct 1", t: "$180.00", c: "Software" },
    { f: "gas-station-faded.jpg", s: "check", v: "Corner Fuel", d: "Oct 4", t: "$4?.18", c: "Travel" },
  ];
  const SAMPLE_RECEIPTS = [
    { f: "sample-skyrail-ticket.pdf", v: "Sky Rail", d: "Oct 5", t: "$212.40", c: "Travel" },
    { f: "sample-lumen-ads-invoice.pdf", v: "Lumen Ads", d: "Oct 6", t: "$450.00", c: "Advertising" },
    { f: "sample-coffee-meeting.jpg", v: "Bean There Cafe", d: "Oct 7", t: "$18.75", c: "Meals" },
  ];
  const HELPER_TASKS = [
    { k: "cat", name: "Sort entries into categories", kind: "book" },
    { k: "read", name: "Read receipts and bills", kind: "book" },
    { k: "match", name: "Match entries when reconciling", kind: "book" },
    { k: "inv", name: "Draft invoices (never sends them)", kind: "book" },
    { k: "ask", name: "Answer questions about my books", kind: "book" },
    { k: "pay", name: "Pay bills, write or print checks", kind: "money", lock: "Always asks you · can't be changed" },
    { k: "send", name: "Send invoices, reminders or anything outside", kind: "out", lock: "Always asks you · can't be changed" },
  ];
  const HABITS = [
    { id: "h1", text: "Cloudnest Hosting → Software", src: "You chose this 8 times", on: true },
    { id: "h2", text: "Sky Rail → Travel", src: "You chose this 5 times", on: true },
    { id: "h3", text: "Receipts from Metro Office Supply → Office supplies, tax read from receipt", src: "You fixed this 3 times", on: true },
    { id: "h4", text: "Deposits that match an open invoice → mark that invoice paid (asks first)", src: "You approved this 6 times", on: false },
  ];
  const PROVIDERS = ["Claude", "Grok", "OpenAI", "Muse"];
  return { LV, MONTHS, CIN, COUT, SVC, PRD, PAYEES, REG, CARD, FEED, AR, BUCKETS, INVOICES, BILLS, AP_AGING, RECON, COA, EQUITY, FEAT, LOG, RECEIPTS, SAMPLE_RECEIPTS, HELPER_TASKS, HABITS, PROVIDERS };
})();
