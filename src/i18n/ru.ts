export const ru = {
  brand: "Costo",
  home: {
    title: "Платите за продукты меньше",
    subtitle:
      "Costo читает счета из KSeF и показывает, сколько ресторан переплачивает поставщикам.",
    cta: "Сэкономить?",
  },
  language: {
    label: "Язык",
    ru: "RU",
    en: "EN",
  },
  common: {
    loading: "Загрузка",
    logout: "Выйти",
    exportNav: "Экспорт",
    back: "К экономии",
    perUnit: { kg: "кг", l: "л" },
  },
  connect: {
    title: "Подключите KSeF",
    subtitle:
      "Введите данные ресторана, и мы покажем, сколько можно сэкономить на закупках.",
    nipLabel: "NIP ресторана",
    nipPlaceholder: "1234567890",
    tokenLabel: "Токен KSeF",
    tokenPlaceholder: "Вставьте токен авторизации",
    tokenHint:
      "Токен создаётся в личном кабинете KSeF, в разделе токенов. Пароль от кабинета не нужен.",
    demoNote:
      "Демо-режим: данные никуда не отправляются, токен не сохраняется. Показаны тестовые счета.",
    submit: "Показать экономию",
    demoFill: "Заполнить демо-данными",
    back: "На главную",
    errors: {
      nipEmpty: "Введите NIP",
      nipFormat: "NIP состоит из 10 цифр",
      nipChecksum: "Контрольная сумма NIP не сходится, проверьте цифры",
      tokenShort: "Токен слишком короткий",
    },
  },
  dashboard: {
    title: "Ваша возможная экономия",
    nipChip: (nip: string) => `NIP ${nip}`,
    periodNote: "По закупкам за последние 30 дней (тестовые данные)",
    savingsPerMonth: "Можно сэкономить в месяц",
    savingsPerYear: (amount: string) => `Примерно ${amount} в год`,
    spent: "Закуплено за 30 дней",
    percent: "Доля экономии",
    tableTitle: "Где переплачиваете",
    colProduct: "Товар",
    colYouPay: "Вы платите",
    colBest: "Лучшее предложение",
    colSavings: "Экономия",
    alreadyBest: "Уже лучшая цена",
    qty: (qty: number, unit: string) => `${qty} ${unit} за месяц`,
  },
  exportPage: {
    title: "Экспорт для бухгалтерии",
    subtitle:
      "Costo собирает документы из ваших счетов KSeF за выбранный месяц одним нажатием.",
    draftNote:
      "Это черновик на тестовых данных. Costo ничего не отправляет в налоговую: файл проверяет и подаёт бухгалтер.",
    month: "Месяц",
    invoices: "Счета за месяц",
    noInvoices: "За этот месяц нет счетов",
    colNumber: "Номер",
    colDate: "Дата",
    colSupplier: "Поставщик",
    colNet: "Нетто",
    colVat: "VAT",
    colGross: "Брутто",
    total: "Итого",
    jpkTitle: "JPK_V7M (XML)",
    jpkText:
      "Реестр закупок для налоговой: одна строка на счёт и налог к вычету.",
    invoicesXmlTitle: "Счета с позициями (XML)",
    invoicesXmlText:
      "Полные данные счетов: продавец, покупатель, позиции, суммы по ставкам VAT. Для разбора и сверки.",
    csvTitle: "Реестр закупок (CSV)",
    csvText:
      "Одна строка на счёт, суммы отдельно по ставкам VAT. Открывается в Excel.",
    linesCsvTitle: "Позиции счетов (CSV)",
    linesCsvText:
      "Одна строка на товар: количество, цена, ставка. Связывается с реестром по номеру счёта.",
    colItems: "Позиций",
    colQty: "Кол-во",
    colPrice: "Цена нетто",
    download: "Скачать",
  },
  notifications: {
    title: "Уведомления",
    open: "Открыть уведомления",
    close: "Закрыть",
    tabAll: "Все",
    tabFollowing: "Мои",
    emptyAll: "Пока ничего нового",
    emptyFollowing:
      "Выберите поставщиков или товары ниже, и их изменения цен появятся здесь",
    markAllRead: "Прочитать все",
    trackTitle: "Следить за ценами",
    trackSuppliers: "Поставщики",
    trackProducts: "Товары",
    simulate: "Демо: имитировать изменение цены",
    news: "Новости",
    priceUp: (supplier: string, product: string) =>
      `${supplier} повысил цену: ${product}`,
    priceDown: (supplier: string, product: string) =>
      `${supplier} снизил цену: ${product}`,
  },
};

export type Dictionary = typeof ru;
