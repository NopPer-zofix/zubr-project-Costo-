import type { Dictionary } from "./ru";

export const en: Dictionary = {
  brand: "Costo",
  home: {
    title: "Pay less for your ingredients",
    subtitle:
      "Costo reads your KSeF invoices and shows how much your restaurant overpays suppliers.",
    cta: "Save money?",
    chartTitle: "How much you overpay",
    chartSample: "Example on sample data",
    legendFair: "Best price",
    legendOver: "Overpayment",
    chartTotal: "You could save per month",
  },
  language: {
    label: "Language",
    ru: "RU",
    en: "EN",
  },
  common: {
    loading: "Loading",
    logout: "Log out",
    exportNav: "Export",
    back: "Back to savings",
    perUnit: { kg: "kg", l: "l" },
  },
  connect: {
    title: "Connect KSeF",
    subtitle:
      "Enter your restaurant details and we will show how much you can save on purchases.",
    nipLabel: "Restaurant NIP",
    nipPlaceholder: "1234567890",
    tokenLabel: "KSeF token",
    tokenPlaceholder: "Paste your authorization token",
    tokenHint:
      "You create the token in your KSeF account, in the tokens section. Your account password is not needed.",
    demoNote:
      "Demo mode: nothing is sent anywhere and the token is not stored. Sample invoices are shown.",
    submit: "Show my savings",
    demoFill: "Fill with demo data",
    back: "Back to home",
    errors: {
      nipEmpty: "Enter the NIP",
      nipFormat: "NIP has 10 digits",
      nipChecksum: "NIP checksum does not match, please check the digits",
      tokenShort: "The token is too short",
    },
  },
  dashboard: {
    title: "Your potential savings",
    nipChip: (nip: string) => `NIP ${nip}`,
    periodNote: "Based on purchases from the last 30 days (sample data)",
    savingsPerMonth: "You could save per month",
    savingsPerYear: (amount: string) => `About ${amount} per year`,
    spent: "Purchased in 30 days",
    percent: "Savings share",
    tableTitle: "Where you overpay",
    colProduct: "Product",
    colYouPay: "You pay",
    colBest: "Best offer",
    colSavings: "Savings",
    alreadyBest: "Already the best price",
    qty: (qty: number, unit: string) => `${qty} ${unit} per month`,
  },
  exportPage: {
    title: "Export for your accountant",
    subtitle:
      "Costo builds documents from your KSeF invoices for the chosen month in one click.",
    draftNote:
      "This is a draft built from sample data. Costo does not send anything to the tax office: your accountant checks and files the document.",
    month: "Month",
    invoices: "Invoices this month",
    noInvoices: "No invoices for this month",
    colNumber: "Number",
    colDate: "Date",
    colSupplier: "Supplier",
    colNet: "Net",
    colVat: "VAT",
    colGross: "Gross",
    total: "Total",
    jpkTitle: "JPK_V7M (XML)",
    jpkText:
      "Purchase register for the tax office: one row per invoice and input VAT.",
    invoicesXmlTitle: "Invoices with line items (XML)",
    invoicesXmlText:
      "Full invoice data: seller, buyer, line items, totals per VAT rate. For parsing and reconciliation.",
    csvTitle: "Purchase register (CSV)",
    csvText:
      "One row per invoice, amounts split by VAT rate. Opens in Excel.",
    linesCsvTitle: "Invoice line items (CSV)",
    linesCsvText:
      "One row per product: quantity, price, rate. Links to the register by invoice number.",
    colItems: "Items",
    colQty: "Qty",
    colPrice: "Net price",
    download: "Download",
    done: "Done",
  },
  notifications: {
    title: "Notifications",
    open: "Open notifications",
    close: "Close",
    tabAll: "All",
    tabFollowing: "Mine",
    emptyAll: "Nothing new yet",
    emptyFollowing:
      "Pick suppliers or products below and their price changes will show up here",
    markAllRead: "Mark all read",
    trackTitle: "Track prices",
    trackSuppliers: "Suppliers",
    trackProducts: "Products",
    simulate: "Demo: simulate a price change",
    news: "News",
    priceUp: (supplier: string, product: string) =>
      `${supplier} raised the price: ${product}`,
    priceDown: (supplier: string, product: string) =>
      `${supplier} lowered the price: ${product}`,
  },
};
