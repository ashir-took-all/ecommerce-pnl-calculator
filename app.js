/**
 * ecomP&L — E-commerce Profitability Calculator & Dashboard
 * Preserves 100% of business logic, formulas and offline persistence.
 * Rebuilt to match reference design system, information hierarchy and styling.
 */

(function () {
  'use strict';

  // --- STORAGE KEYS & INITIAL STATE ---
  const STORAGE_KEY = 'simple_pnl_records_v1';
  const CURRENCY_KEY = 'simple_pnl_currency_v1';
  const BRAND_KEY = 'simple_pnl_brand_v1';
  const PRODUCTS_KEY = 'simple_pnl_products_v1';
  const CASH_TX_KEY = 'simple_cash_flow_v1';
  const CASH_SETTINGS_KEY = 'simple_cash_settings_v1';

  let currency = {
    code: 'PKR',
    symbol: 'Rs '
  };

  let brand = {
    name: 'Your Brand',
    timezone: 'Asia/Karachi'
  };

  let records = [];
  let products = [];
  let cashTransactions = [];
  let cashSettings = {
    openingCash: 250000,
    minBuffer: 100000,
    forecastHorizon: 30
  };
  let activeCashPeriod = 'all';
  let activeCashTableTab = 'daily';
  let editingCashTxId = null;

  let editingId = null;
  let activeChartRange = '30D';
  let currentView = 'dashboard';

  // --- DATA LOADING & PERSISTENCE ---
  function loadData() {
    try {
      const savedCurr = localStorage.getItem(CURRENCY_KEY);
      if (savedCurr) currency = JSON.parse(savedCurr);

      const savedBrand = localStorage.getItem(BRAND_KEY);
      if (savedBrand) brand = JSON.parse(savedBrand);

      const savedRecs = localStorage.getItem(STORAGE_KEY);
      if (savedRecs) records = JSON.parse(savedRecs);

      const savedProds = localStorage.getItem(PRODUCTS_KEY);
      if (savedProds) products = JSON.parse(savedProds);

      const savedCashTx = localStorage.getItem(CASH_TX_KEY);
      if (savedCashTx) cashTransactions = JSON.parse(savedCashTx);

      const savedCashSettings = localStorage.getItem(CASH_SETTINGS_KEY);
      if (savedCashSettings) cashSettings = JSON.parse(savedCashSettings);
    } catch (e) {
      console.warn('Storage read warning', e);
    }

    // If records are empty, seed realistic records matching reference values
    if (!records || records.length === 0) {
      seedInitialRecords();
    }

    // If products are empty, seed reference product catalog
    if (!products || products.length === 0) {
      seedInitialProducts();
    }

    // If cash transactions are empty, seed test example
    if (!cashTransactions || cashTransactions.length === 0) {
      seedInitialCashFlow();
    }
  }

  function saveData() {
    try {
      localStorage.setItem(CURRENCY_KEY, JSON.stringify(currency));
      localStorage.setItem(BRAND_KEY, JSON.stringify(brand));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
      localStorage.setItem(CASH_TX_KEY, JSON.stringify(cashTransactions));
      localStorage.setItem(CASH_SETTINGS_KEY, JSON.stringify(cashSettings));
    } catch (e) {
      console.error('Storage save error', e);
    }
  }

  function seedInitialRecords() {
    const today = new Date();
    // Reference mockup data snapshot values: Rs 482,650 gross / 138,420 profit / 28.7% margin / 243 orders
    records = [
      {
        id: 'rec_101',
        date: formatDate(today),
        store: 'Shopify Store',
        ordersPlaced: 243,
        ordersDelivered: 218,
        grossSales: 512000,
        returnsDiscounts: 29350,
        netSales: 482650,
        productCogs: 96230,
        courierCost: 41200,
        packagingCost: 20600,
        returnShippingCost: 17200,
        adSpend: 110150,
        agencyInfluencer: 25000,
        otherExpenses: 33850,
        totalCosts: 344230,
        netProfit: 138420,
        margin: 28.68,
        roas: 4.38,
        cpa: 453.29,
        notes: 'Top performing scale day across Meta & TikTok'
      },
      {
        id: 'rec_102',
        date: formatDate(new Date(today.getTime() - 1 * 86400000)),
        store: 'Shopify Store',
        ordersPlaced: 210,
        ordersDelivered: 190,
        grossSales: 489000,
        returnsDiscounts: 27770,
        netSales: 461230,
        productCogs: 91000,
        courierCost: 38500,
        packagingCost: 19000,
        returnShippingCost: 15400,
        adSpend: 104000,
        agencyInfluencer: 24000,
        otherExpenses: 29540,
        totalCosts: 321440,
        netProfit: 139790,
        margin: 30.31,
        roas: 4.43,
        cpa: 495.24,
        notes: 'Influencer viral reel launch'
      },
      {
        id: 'rec_103',
        date: formatDate(new Date(today.getTime() - 2 * 86400000)),
        store: 'Shopify Store',
        ordersPlaced: 185,
        ordersDelivered: 165,
        grossSales: 420000,
        returnsDiscounts: 21580,
        netSales: 398420,
        productCogs: 82000,
        courierCost: 35000,
        packagingCost: 17500,
        returnShippingCost: 14000,
        adSpend: 95000,
        agencyInfluencer: 22000,
        otherExpenses: 28620,
        totalCosts: 294120,
        netProfit: 104300,
        margin: 26.18,
        roas: 4.19,
        cpa: 513.51,
        notes: 'Steady baseline performance'
      },
      {
        id: 'rec_104',
        date: formatDate(new Date(today.getTime() - 3 * 86400000)),
        store: 'Shopify Store',
        ordersPlaced: 255,
        ordersDelivered: 230,
        grossSales: 545000,
        returnsDiscounts: 32240,
        netSales: 512760,
        productCogs: 104000,
        courierCost: 44000,
        packagingCost: 22000,
        returnShippingCost: 18000,
        adSpend: 118000,
        agencyInfluencer: 26000,
        otherExpenses: 30890,
        totalCosts: 362890,
        netProfit: 149870,
        margin: 29.23,
        roas: 4.35,
        cpa: 462.75,
        notes: 'Weekend flash promotion'
      },
      {
        id: 'rec_105',
        date: formatDate(new Date(today.getTime() - 4 * 86400000)),
        store: 'Shopify Store',
        ordersPlaced: 215,
        ordersDelivered: 195,
        grossSales: 472000,
        returnsDiscounts: 24680,
        netSales: 447320,
        productCogs: 92000,
        courierCost: 39000,
        packagingCost: 19000,
        returnShippingCost: 15000,
        adSpend: 102000,
        agencyInfluencer: 24000,
        otherExpenses: 27220,
        totalCosts: 318220,
        netProfit: 129100,
        margin: 28.86,
        roas: 4.39,
        cpa: 474.42,
        notes: 'Mid-week baseline'
      }
    ];
    saveData();
  }

  function seedInitialProducts() {
    // Matching bottom-right screen from reference image
    products = [
      { id: 'p1', name: 'Mattress Protector', icon: '🛏️', revenue: 182400, cogs: 56230, ads: 45120, profit: 39050, margin: 21.4 },
      { id: 'p2', name: 'Pillow Cover', icon: '☁️', revenue: 124650, cogs: 62340, ads: 28760, profit: 33550, margin: 26.9 },
      { id: 'p3', name: 'Bed Sheet', icon: '🧺', revenue: 96300, cogs: 48770, ads: 22410, profit: 25120, margin: 26.1 },
      { id: 'p4', name: 'Table Cover', icon: '🍽️', revenue: 58760, cogs: 29660, ads: 15230, profit: 13870, margin: 23.6 }
    ];
    saveData();
  }

  function formatDate(d) {
    return d.toISOString().split('T')[0];
  }

  // --- CURRENCY FORMATTER ---
  function formatMoney(amount, showSign = false, decimals = 0) {
    const num = Number(amount) || 0;
    const isNeg = num < 0;
    const absVal = Math.abs(num).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });

    const prefix = currency.symbol.endsWith(' ') ? currency.symbol : `${currency.symbol} `;
    if (isNeg) {
      return `-${prefix}${absVal}`;
    }
    if (showSign && num > 0) {
      return `+${prefix}${absVal}`;
    }
    return `${prefix}${absVal}`;
  }

  function formatPercent(val) {
    return (Number(val) || 0).toFixed(1) + '%';
  }

  // --- CALCULATION LOGIC (Preserving 100% of Business Logic) ---
  function getFormValues() {
    const grossSales = Number(document.getElementById('grossSales').value) || 0;
    const returnsDiscounts = Number(document.getElementById('returnsDiscounts').value) || 0;
    const ordersPlaced = Number(document.getElementById('ordersPlaced').value) || 0;
    const ordersDelivered = Number(document.getElementById('ordersDelivered').value) || 0;

    const productCogs = Number(document.getElementById('productCogs').value) || 0;
    const courierCost = Number(document.getElementById('courierCost').value) || 0;
    const packagingCost = Number(document.getElementById('packagingCost').value) || 0;
    const returnShippingCost = Number(document.getElementById('returnShippingCost').value) || 0;

    const adSpend = Number(document.getElementById('adSpend').value) || 0;
    const agencyInfluencer = Number(document.getElementById('agencyInfluencer').value) || 0;
    const otherExpenses = Number(document.getElementById('otherExpenses').value) || 0;

    const netSales = Math.max(grossSales - returnsDiscounts, 0);

    const deliveryTotal = courierCost + returnShippingCost;
    const fulfillmentTotal = productCogs + deliveryTotal + packagingCost;
    const marketingTotal = adSpend + agencyInfluencer;
    const totalCosts = fulfillmentTotal + marketingTotal + otherExpenses;

    const netProfit = netSales - totalCosts;
    const margin = netSales > 0 ? (netProfit / netSales) * 100 : 0;
    const roas = adSpend > 0 ? (netSales / adSpend) : 0;
    const cpa = ordersPlaced > 0 ? (adSpend / ordersPlaced) : 0;
    const deliveryRate = ordersPlaced > 0 ? (ordersDelivered / ordersPlaced) * 100 : 0;

    return {
      grossSales,
      returnsDiscounts,
      ordersPlaced,
      ordersDelivered,
      productCogs,
      courierCost,
      packagingCost,
      returnShippingCost,
      deliveryTotal,
      adSpend,
      agencyInfluencer,
      otherExpenses,
      netSales,
      totalCosts,
      netProfit,
      margin,
      roas,
      cpa,
      deliveryRate
    };
  }

  // --- UPDATE CALCULATOR LIVE SUMMARY BAR ---
  function updateLiveSummary() {
    const v = getFormValues();

    const profitVal = document.getElementById('liveNetProfit');
    const statusLabel = document.getElementById('profitStatusLabel');
    const marginVal = document.getElementById('liveProfitMargin');

    if (v.grossSales === 0 && v.totalCosts === 0) {
      statusLabel.textContent = 'Your Profit';
      profitVal.textContent = formatMoney(0);
      profitVal.className = 'summary-cell-val font-mono';
      marginVal.textContent = '0.0%';
      marginVal.className = 'summary-cell-val font-mono';
    } else if (v.netProfit >= 0) {
      statusLabel.textContent = 'Your Profit';
      profitVal.textContent = formatMoney(v.netProfit);
      profitVal.className = 'summary-cell-val font-mono text-mint';
      marginVal.textContent = formatPercent(v.margin);
      marginVal.className = 'summary-cell-val font-mono text-mint';
    } else {
      statusLabel.textContent = 'Operating Loss';
      profitVal.textContent = formatMoney(v.netProfit);
      profitVal.className = 'summary-cell-val font-mono text-coral';
      marginVal.textContent = formatPercent(v.margin);
      marginVal.className = 'summary-cell-val font-mono text-coral';
    }

    // Revenue & Costs
    document.getElementById('liveNetSales').textContent = formatMoney(v.netSales);
    document.getElementById('liveGrossSub').textContent = `Gross: ${formatMoney(v.grossSales)}`;
    document.getElementById('liveTotalCosts').textContent = formatMoney(v.totalCosts);

    const costRatio = v.netSales > 0 ? (v.totalCosts / v.netSales) * 100 : 0;
    document.getElementById('liveCostsSub').textContent = `${formatPercent(costRatio)} of sales`;

    // Secondary metrics
    document.getElementById('liveRoas').textContent = `${v.roas.toFixed(2)}x`;
    document.getElementById('liveCpa').textContent = formatMoney(v.cpa);
    document.getElementById('liveDeliveryRate').textContent = formatPercent(v.deliveryRate);

    // Visual breakdown bar
    const base = v.netSales > 0 ? v.netSales : (v.totalCosts || 1);
    const cogsPct = Math.min((v.productCogs / base) * 100, 100);
    const deliveryPct = Math.min((v.deliveryTotal / base) * 100, 100);
    const adsPct = Math.min((v.adSpend / base) * 100, 100);
    const otherPct = Math.min(((v.agencyInfluencer + v.otherExpenses + v.packagingCost) / base) * 100, 100);
    const profitPct = v.netProfit > 0 && v.netSales > 0 ? Math.min((v.netProfit / v.netSales) * 100, 100) : 0;

    document.getElementById('barCogs').style.width = `${cogsPct}%`;
    document.getElementById('barDelivery').style.width = `${deliveryPct}%`;
    document.getElementById('barAds').style.width = `${adsPct}%`;
    document.getElementById('barOther').style.width = `${otherPct}%`;
    document.getElementById('barProfit').style.width = `${profitPct}%`;
  }

  // --- FORM SUBMIT & SAVING ---
  function handleFormSubmit(e) {
    e.preventDefault();

    const v = getFormValues();
    const dateInput = document.getElementById('inputDate').value;
    const storeInput = document.getElementById('inputStore').value || 'Main Store';
    const notesInput = document.getElementById('entryNotes').value || '';

    if (!dateInput) {
      showToast('Please select a date', 'error');
      return;
    }

    if (v.grossSales === 0 && v.totalCosts === 0) {
      showToast('Please enter sales or cost numbers', 'error');
      return;
    }

    const record = {
      id: editingId || 'rec_' + Date.now(),
      date: dateInput,
      store: storeInput,
      ordersPlaced: v.ordersPlaced,
      ordersDelivered: v.ordersDelivered,
      grossSales: v.grossSales,
      returnsDiscounts: v.returnsDiscounts,
      netSales: v.netSales,
      productCogs: v.productCogs,
      courierCost: v.courierCost,
      packagingCost: v.packagingCost,
      returnShippingCost: v.returnShippingCost,
      adSpend: v.adSpend,
      agencyInfluencer: v.agencyInfluencer,
      otherExpenses: v.otherExpenses,
      totalCosts: v.totalCosts,
      netProfit: v.netProfit,
      margin: v.margin,
      roas: v.roas,
      cpa: v.cpa,
      notes: notesInput
    };

    if (editingId) {
      const idx = records.findIndex((r) => r.id === editingId);
      if (idx !== -1) records[idx] = record;
      editingId = null;
      document.getElementById('cancelEditBtn').classList.add('hidden');
      document.getElementById('saveBtnText').textContent = 'Calculate & Save Record';
      showToast(`Updated record for ${dateInput}`, 'success');
    } else {
      records.unshift(record);
      showToast(`Saved P&L record for ${dateInput}!`, 'success');
    }

    saveData();
    refreshAllViews();
    switchView('dashboard');
  }

  function editRecord(id) {
    const rec = records.find((r) => r.id === id);
    if (!rec) return;

    editingId = id;
    document.getElementById('editEntryId').value = rec.id;
    document.getElementById('inputDate').value = rec.date;
    document.getElementById('inputStore').value = rec.store || '';
    document.getElementById('grossSales').value = rec.grossSales || '';
    document.getElementById('returnsDiscounts').value = rec.returnsDiscounts || '';
    document.getElementById('ordersPlaced').value = rec.ordersPlaced || '';
    document.getElementById('ordersDelivered').value = rec.ordersDelivered || '';
    document.getElementById('productCogs').value = rec.productCogs || '';
    document.getElementById('courierCost').value = rec.courierCost || '';
    document.getElementById('packagingCost').value = rec.packagingCost || '';
    document.getElementById('returnShippingCost').value = rec.returnShippingCost || '';
    document.getElementById('adSpend').value = rec.adSpend || '';
    document.getElementById('agencyInfluencer').value = rec.agencyInfluencer || '';
    document.getElementById('otherExpenses').value = rec.otherExpenses || '';
    document.getElementById('entryNotes').value = rec.notes || '';

    document.getElementById('cancelEditBtn').classList.remove('hidden');
    document.getElementById('saveBtnText').textContent = 'Update Record';

    switchView('calculator');
    updateLiveSummary();
    showToast(`Loaded ${rec.date} into calculator`, 'info');
  }

  function cancelEdit() {
    editingId = null;
    document.getElementById('editEntryId').value = '';
    document.getElementById('cancelEditBtn').classList.add('hidden');
    document.getElementById('saveBtnText').textContent = 'Calculate & Save Record';
    clearInputs();
  }

  function deleteRecord(id) {
    const rec = records.find((r) => r.id === id);
    if (!rec) return;

    if (confirm(`Delete record for ${rec.date}?`)) {
      records = records.filter((r) => r.id !== id);
      saveData();
      refreshAllViews();
      showToast('Record deleted', 'info');
    }
  }

  function clearInputs() {
    document.getElementById('pnlForm').reset();
    document.getElementById('inputDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('inputStore').value = 'Shopify Store';
    updateLiveSummary();
  }

  function loadSampleNumbers() {
    const todayStr = new Date().toISOString().split('T')[0];
    document.getElementById('inputDate').value = todayStr;
    document.getElementById('inputStore').value = 'Shopify Store';

    // Proportional to selected currency
    const isPkr = currency.code === 'PKR';
    const mult = isPkr ? 1 : 0.0036;

    document.getElementById('grossSales').value = (512000 * mult).toFixed(isPkr ? 0 : 2);
    document.getElementById('returnsDiscounts').value = (29350 * mult).toFixed(isPkr ? 0 : 2);
    document.getElementById('ordersPlaced').value = 243;
    document.getElementById('ordersDelivered').value = 218;

    document.getElementById('productCogs').value = (96230 * mult).toFixed(isPkr ? 0 : 2);
    document.getElementById('courierCost').value = (41200 * mult).toFixed(isPkr ? 0 : 2);
    document.getElementById('packagingCost').value = (20600 * mult).toFixed(isPkr ? 0 : 2);
    document.getElementById('returnShippingCost').value = (17200 * mult).toFixed(isPkr ? 0 : 2);

    document.getElementById('adSpend').value = (110150 * mult).toFixed(isPkr ? 0 : 2);
    document.getElementById('agencyInfluencer').value = (25000 * mult).toFixed(isPkr ? 0 : 2);
    document.getElementById('otherExpenses').value = (33850 * mult).toFixed(isPkr ? 0 : 2);
    document.getElementById('entryNotes').value = 'Scaling Broad ABO + TikTok UGC';

    updateLiveSummary();
    showToast('Loaded reference sample numbers!', 'success');
  }

  // --- DASHBOARD KPIS & CHARTS REFRESH ---
  function updateDashboardView() {
    if (!records || records.length === 0) {
      document.getElementById('dashKpiRevenue').textContent = formatMoney(0);
      document.getElementById('dashKpiProfit').textContent = formatMoney(0);
      document.getElementById('dashKpiMargin').textContent = '0.0%';
      document.getElementById('dashKpiOrders').textContent = '0';
      return;
    }

    // Top primary record (most recent)
    const latest = records[0];
    const prev = records.length > 1 ? records[1] : null;

    document.getElementById('dashKpiRevenue').textContent = formatMoney(latest.netSales);
    document.getElementById('dashKpiProfit').textContent = formatMoney(latest.netProfit);
    document.getElementById('dashKpiMargin').textContent = formatPercent(latest.margin);
    document.getElementById('dashKpiOrders').textContent = (latest.ordersPlaced || 0).toLocaleString();

    // Trends vs yesterday / prev record
    if (prev) {
      calcTrendBadge('dashKpiRevenueTrend', 'dashKpiRevenuePct', latest.netSales, prev.netSales);
      calcTrendBadge('dashKpiProfitTrend', 'dashKpiProfitPct', latest.netProfit, prev.netProfit);
      calcTrendBadge('dashKpiMarginTrend', 'dashKpiMarginPct', latest.margin, prev.margin, true);
      calcTrendBadge('dashKpiOrdersTrend', 'dashKpiOrdersPct', latest.ordersPlaced, prev.ordersPlaced);
    }

    // Draw Line Chart & Donut Chart
    renderProfitTrendChart();
    renderExpenseDonutChart();
    renderRecentRecordsTable();
  }

  function calcTrendBadge(containerId, pctId, currVal, prevVal, isAbsDiff = false) {
    const container = document.getElementById(containerId);
    const pctEl = document.getElementById(pctId);
    if (!container || !pctEl) return;

    let pctChange = 0;
    if (isAbsDiff) {
      pctChange = currVal - prevVal;
    } else {
      pctChange = prevVal > 0 ? ((currVal - prevVal) / prevVal) * 100 : (currVal > 0 ? 100 : 0);
    }

    const isUp = pctChange >= 0;
    container.className = isUp ? 'kpi-trend trend-up' : 'kpi-trend trend-down';
    container.querySelector('.trend-arrow').innerHTML = isUp ? '&uarr;' : '&darr;';
    pctEl.textContent = `${Math.abs(pctChange).toFixed(1)}%`;
  }

  // --- RENDER PROFIT TREND LINE CHART (Crisp HTML5 Canvas) ---
  function renderProfitTrendChart() {
    const canvas = document.getElementById('profitTrendCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width > 0 ? rect.width : (canvas.parentElement ? canvas.parentElement.clientWidth : 320);
    canvas.width = w * dpr;
    canvas.height = 220 * dpr;
    ctx.scale(dpr, dpr);

    const h = 220;

    ctx.clearRect(0, 0, w, h);

    // Filter points based on range
    const count = activeChartRange === '7D' ? 7 : (activeChartRange === '30D' ? 14 : 20);
    const dataPoints = records.slice(0, count).reverse();

    if (dataPoints.length === 0) return;

    const profits = dataPoints.map((r) => r.netProfit || 0);
    const maxVal = Math.max(...profits, 100000) * 1.15;
    const minVal = 0;

    const padLeft = 45;
    const padRight = 20;
    const padTop = 20;
    const padBottom = 30;

    const chartW = w - padLeft - padRight;
    const chartH = h - padTop - padBottom;

    // Draw horizontal grid lines & Y-axis labels
    ctx.strokeStyle = '#f0ede6';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#8e8f94';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';

    const gridSteps = 4;
    for (let i = 0; i <= gridSteps; i++) {
      const yVal = minVal + ((maxVal - minVal) / gridSteps) * i;
      const y = padTop + chartH - (i / gridSteps) * chartH;

      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(w - padRight, y);
      ctx.stroke();

      const label = yVal >= 1000 ? `${Math.round(yVal / 1000)}k` : Math.round(yVal);
      ctx.fillText(label, padLeft - 8, y + 3);
    }

    // Coordinates of points
    const stepX = chartW / Math.max(dataPoints.length - 1, 1);
    const points = dataPoints.map((dp, idx) => {
      const x = padLeft + idx * stepX;
      const norm = (dp.netProfit - minVal) / (maxVal - minVal);
      const y = padTop + chartH - norm * chartH;
      return { x, y, date: dp.date, profit: dp.netProfit };
    });

    // Draw smooth bezier curve
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      ctx.bezierCurveTo(cpX, p0.y, cpX, p1.y, p1.x, p1.y);
    }

    // Gradient fill under curve
    const grad = ctx.createLinearGradient(0, padTop, 0, padTop + chartH);
    grad.addColorStop(0, 'rgba(27, 77, 62, 0.22)');
    grad.addColorStop(1, 'rgba(27, 77, 62, 0.01)');

    const linePath = new Path2D();
    linePath.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      linePath.bezierCurveTo(cpX, p0.y, cpX, p1.y, p1.x, p1.y);
    }

    // Fill
    ctx.save();
    const fillPath = new Path2D(linePath);
    fillPath.lineTo(points[points.length - 1].x, padTop + chartH);
    fillPath.lineTo(points[0].x, padTop + chartH);
    fillPath.closePath();
    ctx.fillStyle = grad;
    ctx.fill(fillPath);
    ctx.restore();

    // Stroke
    ctx.strokeStyle = '#1b4d3e';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke(linePath);

    // Draw X-axis date labels
    ctx.fillStyle = '#8e8f94';
    ctx.textAlign = 'center';
    const labelInterval = Math.max(1, Math.floor(points.length / 5));
    points.forEach((pt, idx) => {
      if (idx % labelInterval === 0 || idx === points.length - 1) {
        const parts = pt.date.split('-');
        const shortDate = `${parts[2]} ${getMonthName(parseInt(parts[1], 10))}`;
        ctx.fillText(shortDate, pt.x, h - 8);
      }
    });
  }

  function getMonthName(m) {
    const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[m] || '';
  }

  // --- RENDER EXPENSE BREAKDOWN DONUT CHART ---
  function renderExpenseDonutChart() {
    const canvas = document.getElementById('expenseDonutCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 170 * dpr;
    canvas.height = 170 * dpr;
    ctx.scale(dpr, dpr);

    const w = 170;
    const h = 170;
    const cx = w / 2;
    const cy = h / 2;
    const radius = 70;
    const innerRadius = 50;

    ctx.clearRect(0, 0, w, h);

    // Aggregate expenses across records (or latest record)
    let totalAd = 0;
    let totalCogs = 0;
    let totalCourier = 0;
    let totalPkg = 0;
    let totalReturns = 0;
    let totalOther = 0;

    const samplePool = records.slice(0, 7);
    samplePool.forEach((r) => {
      totalAd += r.adSpend || 0;
      totalCogs += r.productCogs || 0;
      totalCourier += r.courierCost || 0;
      totalPkg += r.packagingCost || 0;
      totalReturns += r.returnShippingCost || 0;
      totalOther += (r.agencyInfluencer || 0) + (r.otherExpenses || 0);
    });

    const grandTotal = totalAd + totalCogs + totalCourier + totalPkg + totalReturns + totalOther || 1;

    const categories = [
      { name: 'Ad Spend', val: totalAd, color: '#1b4d3e', el: 'legendAdSpend' },
      { name: 'COGS', val: totalCogs, color: '#d1b48c', el: 'legendCogs' },
      { name: 'Courier', val: totalCourier, color: '#b8a89a', el: 'legendCourier' },
      { name: 'Packaging', val: totalPkg, color: '#8f9499', el: 'legendPackaging' },
      { name: 'Returns', val: totalReturns, color: '#c86d51', el: 'legendReturns' },
      { name: 'Other', val: totalOther, color: '#374151', el: 'legendOther' }
    ];

    let startAngle = -Math.PI / 2;

    categories.forEach((cat) => {
      const sliceAngle = (cat.val / grandTotal) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.arc(cx, cy, innerRadius, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = cat.color;
      ctx.fill();

      startAngle = endAngle;

      // Update legend %
      const pct = Math.round((cat.val / grandTotal) * 100);
      const legendEl = document.getElementById(cat.el);
      if (legendEl) legendEl.textContent = `${pct}%`;
    });

    // Center total expenses text
    const latestRec = records[0];
    const displayTotal = latestRec ? latestRec.totalCosts : grandTotal;
    document.getElementById('donutCenterTotal').textContent = formatMoney(displayTotal);
  }

  // --- RENDER RECENT RECORDS TABLE (Dashboard) ---
  function renderRecentRecordsTable() {
    const tbody = document.getElementById('dashRecentRecordsBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const displayRows = records.slice(0, 5);
    if (displayRows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted" style="padding:1.5rem;">No records yet.</td></tr>';
      return;
    }

    displayRows.forEach((r) => {
      const tr = document.createElement('tr');
      const isProfit = r.netProfit >= 0;
      const profitClass = isProfit ? 'text-mint' : 'text-coral';

      // Pretty date e.g. "16 Apr 2025"
      const dateParts = r.date.split('-');
      const prettyDate = `${dateParts[2]} ${getMonthName(parseInt(dateParts[1], 10))} ${dateParts[0]}`;

      tr.innerHTML = `
        <td><strong>${prettyDate}</strong></td>
        <td class="text-right font-mono">${formatMoney(r.netSales)}</td>
        <td class="text-right font-mono">${formatMoney(r.totalCosts)}</td>
        <td class="text-right font-mono font-bold ${profitClass}">${formatMoney(r.netProfit)}</td>
        <td class="text-right font-mono">${formatPercent(r.margin)}</td>
        <td class="text-center"><span class="badge-status">Completed</span></td>
      `;
      tbody.appendChild(tr);
    });
  }

  // --- RENDER FULL DAILY RECORDS TABLE (Records View) ---
  function renderFullRecordsTable() {
    const tbody = document.getElementById('historyTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!records || records.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted" style="padding: 2.5rem;">No records saved yet. Switch to P&amp;L Calculator to add your first day.</td></tr>`;
      return;
    }

    records.forEach((r) => {
      const tr = document.createElement('tr');
      const isProfit = r.netProfit >= 0;
      const profitClass = isProfit ? 'text-mint' : 'text-coral';

      const dateParts = r.date.split('-');
      const prettyDate = `${dateParts[2]} ${getMonthName(parseInt(dateParts[1], 10))} ${dateParts[0]}`;

      tr.innerHTML = `
        <td><strong>${prettyDate}</strong></td>
        <td><span style="font-size:11px; background:#f4f0e8; padding:2px 8px; border-radius:4px;">${r.store || 'Shopify Store'}</span></td>
        <td class="text-right font-mono">${r.ordersPlaced || 0}</td>
        <td class="text-right font-mono font-bold">${formatMoney(r.netSales)}</td>
        <td class="text-right font-mono text-muted">${formatMoney(r.totalCosts)}</td>
        <td class="text-right font-mono font-bold ${profitClass}">${formatMoney(r.netProfit, true)}</td>
        <td class="text-right font-mono">${formatPercent(r.margin)}</td>
        <td class="text-center"><span class="badge-status">Completed</span></td>
        <td class="text-center">
          <button type="button" class="btn btn-outline btn-sm" style="padding: 2px 7px; font-size: 11px;" onclick="app.editRecord('${r.id}')">Edit</button>
          <button type="button" class="btn btn-outline btn-sm text-coral" style="padding: 2px 7px; font-size: 11px;" onclick="app.deleteRecord('${r.id}')">&times;</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    document.getElementById('paginationInfo').textContent = `Showing 1–${records.length} of ${records.length} records`;
  }

  // --- RENDER PRODUCTS VIEW ---
  function renderProductsView() {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const searchInput = document.getElementById('productSearchInput');
    const query = (searchInput ? searchInput.value : '').trim().toLowerCase();

    const filtered = products.filter((p) => {
      if (!query) return true;
      return (p.name || '').toLowerCase().includes(query) || (p.category || '').toLowerCase().includes(query);
    });

    const countBadge = document.getElementById('productCountBadge');
    if (countBadge) {
      countBadge.textContent = `${filtered.length} Product${filtered.length === 1 ? '' : 's'}`;
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center text-muted" style="padding: 2.5rem 1rem;">
            ${query ? `No products matching "${escapeHtml(query)}"` : 'No products added yet. Click <strong>+ Add Product</strong> or <strong>Bulk Add</strong> to add your SKUs.'}
          </td>
        </tr>
      `;
      document.getElementById('productsTotalRevenue').textContent = formatMoney(0);
      document.getElementById('productsTotalCogs').textContent = formatMoney(0);
      document.getElementById('productsTotalAds').textContent = formatMoney(0);
      document.getElementById('productsTotalProfit').textContent = formatMoney(0);
      document.getElementById('productsTotalMargin').textContent = '0.0%';
      return;
    }

    let totRev = 0;
    let totCogs = 0;
    let totAds = 0;
    let totProfit = 0;

    filtered.forEach((p) => {
      totRev += p.revenue || 0;
      totCogs += p.cogs || 0;
      totAds += p.ads || 0;
      totProfit += p.profit || 0;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div class="product-item-cell">
            <div class="product-thumb">${p.icon || '📦'}</div>
            <span class="product-name-txt">${escapeHtml(p.name)}</span>
          </div>
        </td>
        <td class="text-right font-mono font-bold">${formatMoney(p.revenue)}</td>
        <td class="text-right font-mono text-muted">${formatMoney(p.cogs)}</td>
        <td class="text-right font-mono text-muted">${formatMoney(p.ads)}</td>
        <td class="text-right font-mono font-bold ${p.profit >= 0 ? 'text-mint' : 'text-coral'}">${formatMoney(p.profit)}</td>
        <td class="text-right font-mono">${formatPercent(p.margin)}</td>
        <td class="text-center">
          <div class="row-actions-group">
            <button type="button" class="btn-row-action" title="Edit Product" onclick="app.openProductModal('${p.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button type="button" class="btn-row-action delete-action" title="Delete Product" onclick="app.deleteProduct('${p.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    const totMargin = totRev > 0 ? (totProfit / totRev) * 100 : 0;
    document.getElementById('productsTotalRevenue').textContent = formatMoney(totRev);
    document.getElementById('productsTotalCogs').textContent = formatMoney(totCogs);
    document.getElementById('productsTotalAds').textContent = formatMoney(totAds);
    document.getElementById('productsTotalProfit').textContent = formatMoney(totProfit);
    document.getElementById('productsTotalMargin').textContent = formatPercent(totMargin);
  }

  // --- RENDER EXPENSES VIEW ---
  function renderExpensesView() {
    let totAds = 0;
    let totCogs = 0;
    let totCourier = 0;
    let totOther = 0;

    records.forEach((r) => {
      totAds += r.adSpend || 0;
      totCogs += r.productCogs || 0;
      totCourier += (r.courierCost || 0) + (r.returnShippingCost || 0);
      totOther += (r.packagingCost || 0) + (r.agencyInfluencer || 0) + (r.otherExpenses || 0);
    });

    const grand = totAds + totCogs + totCourier + totOther || 1;

    document.getElementById('expTotalAds').textContent = formatMoney(totAds);
    document.getElementById('expTotalCogs').textContent = formatMoney(totCogs);
    document.getElementById('expTotalDelivery').textContent = formatMoney(totCourier);
    document.getElementById('expTotalOther').textContent = formatMoney(totOther);

    document.getElementById('expAdsShare').textContent = `${formatPercent((totAds / grand) * 100)} of total expenses`;
    document.getElementById('expCogsShare').textContent = `${formatPercent((totCogs / grand) * 100)} of total expenses`;
    document.getElementById('expDeliveryShare').textContent = `${formatPercent((totCourier / grand) * 100)} of total expenses`;
    document.getElementById('expOtherShare').textContent = `${formatPercent((totOther / grand) * 100)} of total expenses`;

    // Horizontal bars
    const list = document.getElementById('categoryBarsList');
    if (list) {
      list.innerHTML = `
        <div class="cat-bar-item">
          <div class="cat-bar-head"><span>Marketing &amp; Paid Ads</span><strong>${formatMoney(totAds)} (${formatPercent((totAds / grand) * 100)})</strong></div>
          <div class="cat-bar-track"><div class="cat-bar-fill" style="width:${(totAds / grand) * 100}%; background:#1b4d3e;"></div></div>
        </div>
        <div class="cat-bar-item">
          <div class="cat-bar-head"><span>Cost of Goods (Suppliers)</span><strong>${formatMoney(totCogs)} (${formatPercent((totCogs / grand) * 100)})</strong></div>
          <div class="cat-bar-track"><div class="cat-bar-fill" style="width:${(totCogs / grand) * 100}%; background:#d1b48c;"></div></div>
        </div>
        <div class="cat-bar-item">
          <div class="cat-bar-head"><span>Logistics &amp; Courier Fees</span><strong>${formatMoney(totCourier)} (${formatPercent((totCourier / grand) * 100)})</strong></div>
          <div class="cat-bar-track"><div class="cat-bar-fill" style="width:${(totCourier / grand) * 100}%; background:#b8a89a;"></div></div>
        </div>
        <div class="cat-bar-item">
          <div class="cat-bar-head"><span>Overheads, Packaging &amp; Agency</span><strong>${formatMoney(totOther)} (${formatPercent((totOther / grand) * 100)})</strong></div>
          <div class="cat-bar-track"><div class="cat-bar-fill" style="width:${(totOther / grand) * 100}%; background:#374151;"></div></div>
        </div>
      `;
    }
  }

  // --- RENDER REPORTS VIEW ---
  function renderReportsView() {
    let totRev = 0;
    let totProfit = 0;

    records.forEach((r) => {
      totRev += r.netSales || 0;
      totProfit += r.netProfit || 0;
    });

    const totMargin = totRev > 0 ? (totProfit / totRev) * 100 : 0;
    document.getElementById('repTotalRevenue').textContent = formatMoney(totRev);
    document.getElementById('repTotalProfit').textContent = formatMoney(totProfit);
    document.getElementById('repNetMargin').textContent = formatPercent(totMargin);

    renderMonthlyBarChart();
  }

  function renderMonthlyBarChart() {
    const canvas = document.getElementById('monthlyProfitCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width > 0 ? rect.width : (canvas.parentElement ? canvas.parentElement.clientWidth : 320);
    canvas.width = w * dpr;
    canvas.height = 240 * dpr;
    ctx.scale(dpr, dpr);

    const h = 240;

    ctx.clearRect(0, 0, w, h);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const barValues = [120, 180, 240, 310, 280, 390, 480, 520, 450, 490, 540, 580]; // Realistic growth scale
    const maxVal = 650;

    const padLeft = 40;
    const padRight = 20;
    const padTop = 20;
    const padBottom = 35;

    const chartW = w - padLeft - padRight;
    const chartH = h - padTop - padBottom;

    // Y Axis Grid
    ctx.strokeStyle = '#f0ede6';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#8e8f94';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';

    for (let i = 0; i <= 4; i++) {
      const y = padTop + chartH - (i / 4) * chartH;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(w - padRight, y);
      ctx.stroke();

      const label = `${Math.round((maxVal / 4) * i)}k`;
      ctx.fillText(label, padLeft - 6, y + 3);
    }

    // Bars
    const barWidth = Math.max(10, (chartW / months.length) * 0.45);
    const stepX = chartW / months.length;

    months.forEach((m, idx) => {
      const val = barValues[idx];
      const barH = (val / maxVal) * chartH;
      const x = padLeft + idx * stepX + (stepX - barWidth) / 2;
      const y = padTop + chartH - barH;

      ctx.fillStyle = idx === 3 ? '#1b4d3e' : '#496b5b'; // Highlight current month (Apr)
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(x, y, barWidth, barH, [4, 4, 0, 0]) : ctx.rect(x, y, barWidth, barH);
      ctx.fill();

      // Month Label
      ctx.fillStyle = '#8e8f94';
      ctx.font = '11px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(m, x + barWidth / 2, h - 10);
    });
  }

  // --- REFRESH ALL ACTIVE VIEWS ---
  function refreshAllViews() {
    updateDashboardView();
    updateLiveSummary();
    renderFullRecordsTable();
    renderProductsView();
    renderExpensesView();
    renderReportsView();
    updateCashFlowView();
  }

  // --- VIEW SWITCHING ---
  function switchView(viewName) {
    currentView = viewName;

    // Hide all view panels
    document.querySelectorAll('.view-panel').forEach((el) => el.classList.remove('active'));

    // Show target view panel
    const target = document.getElementById(`view-${viewName}`);
    if (target) target.classList.add('active');

    // Update Sidebar Navigation state
    document.querySelectorAll('.sidebar-nav .nav-item').forEach((el) => {
      el.classList.toggle('active', el.dataset.view === viewName);
    });

    // Update Mobile Bottom Navigation state
    document.querySelectorAll('.mobile-bottom-nav .mobile-nav-btn').forEach((el) => {
      el.classList.toggle('active', el.dataset.view === viewName);
    });

    // Close mobile drawer if open
    toggleMobileSidebar(false);

    // Refresh charts if entering dashboard, reports, or cashflow
    if (viewName === 'dashboard') {
      setTimeout(() => {
        renderProfitTrendChart();
        renderExpenseDonutChart();
      }, 50);
    } else if (viewName === 'reports') {
      setTimeout(() => renderMonthlyBarChart(), 50);
    } else if (viewName === 'cashflow') {
      setTimeout(() => {
        renderCashTrendChart();
        renderCashInVsOutChart();
      }, 50);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- CURRENCY LOGIC ---
  function applyCurrency(code, symbol) {
    currency = { code, symbol: symbol.endsWith(' ') ? symbol : `${symbol} ` };
    saveData();

    // Update input currency prefixes
    document.querySelectorAll('.currency-prefix').forEach((el) => {
      el.textContent = currency.symbol;
    });

    // Sync header dropdown
    const sel = document.getElementById('currencySelect');
    const val = `${code}|${currency.symbol}`;
    let exists = false;
    for (let i = 0; i < sel.options.length; i++) {
      if (sel.options[i].value === val) {
        exists = true;
        break;
      }
    }
    if (!exists) {
      const opt = document.createElement('option');
      opt.value = val;
      opt.textContent = `${code} (${currency.symbol.trim()})`;
      sel.insertBefore(opt, sel.lastElementChild);
    }
    sel.value = val;

    // Sync settings dropdown
    const setSel = document.getElementById('settingsCurrencySelect');
    if (setSel) setSel.value = val;

    refreshAllViews();
    showToast(`Currency changed to ${code} (${currency.symbol.trim()})`, 'info');
  }

  // --- CSV EXPORTER ---
  function exportCsv() {
    if (!records || records.length === 0) {
      showToast('No saved records to export', 'error');
      return;
    }

    const headers = [
      'Date', 'Store', 'Orders Placed', 'Orders Delivered', 'Gross Sales', 'Returns & Discounts',
      'Net Sales', 'Product Cost (COGS)', 'Courier Cost', 'Packaging Cost', 'Return Shipping Cost',
      'Ad Spend', 'Agency & Influencer', 'Other Expenses', 'Total Costs', 'Net Profit', 'Profit Margin %',
      'ROAS', 'CPA', 'Notes'
    ];

    const rows = records.map((r) => [
      r.date, `"${r.store || ''}"`, r.ordersPlaced || 0, r.ordersDelivered || 0, r.grossSales || 0,
      r.returnsDiscounts || 0, r.netSales || 0, r.productCogs || 0, r.courierCost || 0, r.packagingCost || 0,
      r.returnShippingCost || 0, r.adSpend || 0, r.agencyInfluencer || 0, r.otherExpenses || 0,
      r.totalCosts || 0, r.netProfit || 0, `${(r.margin || 0).toFixed(1)}%`, (r.roas || 0).toFixed(2),
      r.cpa || 0, `"${(r.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ecomPnL_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported CSV successfully!', 'success');
  }

  // --- BRAND SETTINGS ---
  function saveBrandSettings() {
    const name = document.getElementById('brandNameInput').value.trim() || 'Your Brand';
    const tz = document.getElementById('settingsTimezone').value;

    brand.name = name;
    brand.timezone = tz;
    saveData();

    document.getElementById('headerBrandName').textContent = name;
    document.getElementById('settingsBrandDisplay').textContent = name;
    const initial = name.charAt(0).toUpperCase();
    document.getElementById('headerAvatar').textContent = initial;
    document.getElementById('settingsAvatarLarge').textContent = initial;

    showToast('Brand settings updated!', 'success');
  }

  // --- TIME TABS (7D, 30D, 3M, 6M, 1Y) ---
  function setChartRange(range) {
    activeChartRange = range;
    document.querySelectorAll('.time-tab').forEach((tab) => {
      tab.classList.toggle('active', tab.dataset.range === range);
    });
    renderProfitTrendChart();
  }

  // --- MOBILE SIDEBAR DRAWER ---
  function toggleMobileSidebar(force) {
    const sidebar = document.getElementById('appSidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    const isOpen = typeof force === 'boolean' ? force : !sidebar.classList.contains('open');

    sidebar.classList.toggle('open', isOpen);
    backdrop.classList.toggle('active', isOpen);
  }

  // --- MODAL HELPERS ---
  function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
  }

  function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  }

  function openAuthModal() {
    openModal('authModal');
  }

  function handleAuthSubmit() {
    closeModal('authModal');
    showToast('Offline MVP mode active. Multi-user accounts will connect to Supabase!', 'info');
  }

  // =====================================================================
  // PRODUCT MANAGEMENT & BULK IMPORT SYSTEM
  // =====================================================================

  let editingProductId = null;
  let bulkParsedProducts = [];
  let activeBulkTab = 'paste';

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function cleanNumericInput(val) {
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    if (!val) return 0;
    const cleaned = String(val).replace(/[^0-9.-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }

  function guessProductIcon(name, category) {
    const text = (String(name) + ' ' + String(category)).toLowerCase();
    if (/shoe|sneaker|boot|footwear|sandal|heel|loafer/.test(text)) return '👟';
    if (/shirt|t-shirt|hoodie|pant|jean|jacket|dress|apparel|cloth|suit|top/.test(text)) return '👕';
    if (/watch|clock|strap/.test(text)) return '⌚';
    if (/ring|necklace|earring|jewel|bracelet|gold|silver/.test(text)) return '💍';
    if (/phone|audio|earbud|headphone|gadget|charger|cable|tech|laptop|screen|mouse/.test(text)) return '📱';
    if (/cream|serum|skincare|lotion|perfume|fragrance|shampoo|beauty|cosmetic|oil/.test(text)) return '🧴';
    if (/sheet|cushion|pillow|bed|duvet|blanket|curtain|decor|home|furniture|towel/.test(text)) return '🏠';
    if (/bag|wallet|backpack|purse|luggage|leather|briefcase/.test(text)) return '🎒';
    if (/tea|coffee|drink|juice|snack|food|protein|cookie|honey/.test(text)) return '☕';
    if (/gym|fitness|yoga|dumbbell|workout|sport|mat|band/.test(text)) return '🏋️';
    return '📦';
  }

  // --- MANUAL ADD / EDIT PRODUCT MODAL ---
  function openProductModal(id = null) {
    editingProductId = id;
    const titleEl = document.getElementById('productModalTitle');
    const editIdInput = document.getElementById('editProductId');
    const nameInput = document.getElementById('prodNameInput');
    const catSelect = document.getElementById('prodCategorySelect');
    const revInput = document.getElementById('prodRevenueInput');
    const cogsInput = document.getElementById('prodCogsInput');
    const adsInput = document.getElementById('prodAdsInput');

    // Update currency prefixes in modal
    document.querySelectorAll('#productModal .currency-symbol-label').forEach((el) => {
      el.textContent = currency.symbol + ' ';
    });

    if (id) {
      const prod = products.find((p) => p.id === id);
      if (!prod) return;
      if (titleEl) titleEl.textContent = 'Edit Product';
      if (editIdInput) editIdInput.value = prod.id;
      if (nameInput) nameInput.value = prod.name || '';
      if (catSelect) {
        const opt = Array.from(catSelect.options).find(o => o.value.includes(prod.category || ''));
        if (opt) catSelect.value = opt.value;
      }
      if (revInput) revInput.value = prod.revenue || '';
      if (cogsInput) cogsInput.value = prod.cogs || '';
      if (adsInput) adsInput.value = prod.ads || '';
    } else {
      if (titleEl) titleEl.textContent = 'Add New Product';
      if (editIdInput) editIdInput.value = '';
      if (nameInput) nameInput.value = '';
      if (catSelect) catSelect.selectedIndex = 0;
      if (revInput) revInput.value = '';
      if (cogsInput) cogsInput.value = '';
      if (adsInput) adsInput.value = '';
    }

    updateProdLivePreview();
    openModal('productModal');
    if (nameInput) nameInput.focus();
  }

  function showAddProductModal() {
    openProductModal();
  }

  function updateProdLivePreview() {
    const rev = Number(document.getElementById('prodRevenueInput')?.value) || 0;
    const cogs = Number(document.getElementById('prodCogsInput')?.value) || 0;
    const ads = Number(document.getElementById('prodAdsInput')?.value) || 0;
    const profit = rev - cogs - ads;
    const margin = rev > 0 ? (profit / rev) * 100 : 0;

    const profitEl = document.getElementById('prodPreviewProfit');
    const marginEl = document.getElementById('prodPreviewMargin');

    if (profitEl) {
      profitEl.textContent = formatMoney(profit);
      profitEl.className = `pvc-val font-mono ${profit >= 0 ? 'text-mint' : 'text-coral'}`;
    }
    if (marginEl) {
      marginEl.textContent = formatPercent(margin);
      marginEl.className = `pvc-val font-mono ${margin >= 0 ? 'text-mint' : 'text-coral'}`;
    }
  }

  function handleProductSubmit(e) {
    if (e) e.preventDefault();
    const id = document.getElementById('editProductId')?.value;
    const name = (document.getElementById('prodNameInput')?.value || '').trim();
    if (!name) {
      showToast('Please enter a product name', 'warning');
      return;
    }

    const catVal = document.getElementById('prodCategorySelect')?.value || '📦 General';
    const catParts = catVal.split(' ');
    const icon = catParts[0] || '📦';
    const category = catParts.slice(1).join(' ') || 'General';

    const revenue = Number(document.getElementById('prodRevenueInput')?.value) || 0;
    const cogs = Number(document.getElementById('prodCogsInput')?.value) || 0;
    const ads = Number(document.getElementById('prodAdsInput')?.value) || 0;
    const profit = revenue - cogs - ads;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    if (id) {
      const idx = products.findIndex((p) => p.id === id);
      if (idx !== -1) {
        products[idx] = {
          ...products[idx],
          name,
          icon: icon || products[idx].icon || '📦',
          category,
          revenue,
          cogs,
          ads,
          profit,
          margin
        };
        showToast(`Updated product "${name}"`, 'success');
      }
    } else {
      products.push({
        id: 'p_' + Date.now(),
        name,
        icon: icon || guessProductIcon(name, category),
        category,
        revenue,
        cogs,
        ads,
        profit,
        margin
      });
      showToast(`Added product "${name}"`, 'success');
    }

    saveData();
    renderProductsView();
    closeModal('productModal');
  }

  function deleteProduct(id) {
    const prod = products.find((p) => p.id === id);
    if (!prod) return;
    if (confirm(`Are you sure you want to delete "${prod.name}"?`)) {
      products = products.filter((p) => p.id !== id);
      saveData();
      renderProductsView();
      showToast(`Deleted "${prod.name}"`, 'info');
    }
  }

  function filterProductsList() {
    renderProductsView();
  }

  // --- EXPORT PRODUCTS CSV ---
  function exportProductsCsv() {
    if (!products || products.length === 0) {
      showToast('No products to export', 'warning');
      return;
    }
    const headers = ['Product Name', 'Category', 'Revenue', 'COGS', 'Ad Spend', 'Net Profit', 'Margin %'];
    const rows = products.map((p) => [
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${(p.category || 'General').replace(/"/g, '""')}"`,
      p.revenue || 0,
      p.cogs || 0,
      p.ads || 0,
      p.profit || 0,
      (p.margin || 0).toFixed(1)
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `products_profitability_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    showToast('Exported products to CSV', 'success');
  }

  // --- BULK PRODUCT ADD MODAL SYSTEM ---
  function openBulkProductModal() {
    activeBulkTab = 'paste';
    bulkParsedProducts = [];
    const textarea = document.getElementById('bulkPasteTextarea');
    if (textarea) textarea.value = '';
    const fileLabel = document.getElementById('fileSelectedName');
    if (fileLabel) fileLabel.textContent = 'No file selected';
    const fileInput = document.getElementById('csvFileInput');
    if (fileInput) fileInput.value = '';

    switchBulkTab('paste');
    initMultiRowsDefault();
    parseBulkInput();
    openModal('bulkProductModal');
  }

  function switchBulkTab(tabName) {
    activeBulkTab = tabName;
    document.querySelectorAll('.bulk-tab-btn').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.bulk-tab-content').forEach((c) => c.classList.remove('active'));

    const btn = document.getElementById(`tabBtn${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);
    const content = document.getElementById(`bulkTab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);
    if (btn) btn.classList.add('active');
    if (content) content.classList.add('active');

    parseBulkInput();
  }

  function loadSampleBulkData() {
    const textarea = document.getElementById('bulkPasteTextarea');
    if (!textarea) return;
    textarea.value = [
      'Wireless Noise-Cancelling Earbuds, 180000, 60000, 35000',
      'Premium Leather Minimalist Wallet, 95000, 28000, 18000',
      'Smart Fitness & Health Tracker Watch, 320000, 110000, 65000',
      'Egyptian Cotton Bed Sheet Set, 140000, 50000, 28000',
      'Organic Vitamin C Face Serum, 85000, 22000, 16000',
      'Stainless Steel Insulated Travel Tumbler, 62000, 19000, 11000'
    ].join('\n');
    parseBulkInput();
    showToast('Loaded 6 sample products', 'info');
  }

  function downloadProductTemplateCsv() {
    const sample = [
      'Product Name,Revenue,COGS,Ad Spend',
      'Sample T-Shirt,50000,18000,10000',
      'Sample Running Shoes,120000,45000,25000',
      'Sample Smart Watch,250000,95000,50000',
      'Sample Travel Backpack,85000,28000,16000'
    ].join('\n');

    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'ecommerce_products_bulk_template.csv';
    link.click();
    showToast('Downloaded template CSV', 'info');
  }

  function handleCsvFileUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const fileLabel = document.getElementById('fileSelectedName');
    if (fileLabel) fileLabel.textContent = `${file.name} (${Math.round(file.size / 1024)} KB)`;

    const reader = new FileReader();
    reader.onload = function(evt) {
      const text = evt.target.result;
      const textarea = document.getElementById('bulkPasteTextarea');
      if (textarea) textarea.value = text;
      switchBulkTab('paste');
      showToast(`Loaded ${file.name}!`, 'success');
    };
    reader.readAsText(file);
  }

  function initMultiRowsDefault() {
    const tbody = document.getElementById('multiRowTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    addMultiRowItem('Wireless Earbuds', '120000', '45000', '25000');
    addMultiRowItem('Leather Wallet', '85000', '26000', '16000');
    addMultiRowItem('', '', '', '');
  }

  function addMultiRowItem(name = '', rev = '', cogs = '', ads = '') {
    const tbody = document.getElementById('multiRowTableBody');
    if (!tbody) return;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="text" class="multi-row-input mr-name" placeholder="Product name" value="${escapeHtml(name)}" oninput="app.parseMultiRows()"></td>
      <td><input type="number" class="multi-row-input mr-rev" placeholder="Revenue" value="${rev}" min="0" step="any" oninput="app.parseMultiRows()"></td>
      <td><input type="number" class="multi-row-input mr-cogs" placeholder="COGS" value="${cogs}" min="0" step="any" oninput="app.parseMultiRows()"></td>
      <td><input type="number" class="multi-row-input mr-ads" placeholder="Ad spend" value="${ads}" min="0" step="any" oninput="app.parseMultiRows()"></td>
      <td class="text-center">
        <button type="button" class="btn-row-action delete-action" title="Remove Row" onclick="this.closest('tr').remove(); app.parseMultiRows();">
          &times;
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  }

  function parseMultiRows() {
    if (activeBulkTab === 'grid') {
      parseBulkInput();
    }
  }

  function clearMultiRows() {
    const tbody = document.getElementById('multiRowTableBody');
    if (tbody) tbody.innerHTML = '';
    addMultiRowItem();
    parseBulkInput();
  }

  function updateBulkSummaryUI(count, profit) {
    const countPill = document.getElementById('parsedCountPill');
    const profitPill = document.getElementById('parsedProfitPill');
    const confirmBtn = document.getElementById('btnConfirmBulkImport');

    if (countPill) countPill.textContent = `${count} Product${count === 1 ? '' : 's'} Ready`;
    if (profitPill) profitPill.textContent = `Est. Profit: ${formatMoney(profit)}`;
    if (confirmBtn) {
      confirmBtn.disabled = count === 0;
      confirmBtn.textContent = `Import ${count} Product${count === 1 ? '' : 's'}`;
    }
  }

  function parseBulkInput() {
    let rawText = '';
    if (activeBulkTab === 'grid') {
      const rows = document.querySelectorAll('#multiRowTableBody tr');
      const lines = [];
      rows.forEach((tr) => {
        const name = tr.querySelector('.mr-name')?.value.trim();
        const rev = tr.querySelector('.mr-rev')?.value.trim();
        const cogs = tr.querySelector('.mr-cogs')?.value.trim();
        const ads = tr.querySelector('.mr-ads')?.value.trim();
        if (name || rev || cogs || ads) {
          lines.push(`${name || ''},${rev || '0'},${cogs || '0'},${ads || '0'}`);
        }
      });
      rawText = lines.join('\n');
    } else {
      const textarea = document.getElementById('bulkPasteTextarea');
      rawText = textarea ? textarea.value : '';
    }

    bulkParsedProducts = [];
    const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const tbody = document.getElementById('bulkPreviewTableBody');
    if (!tbody) return;

    if (lines.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-3">Paste text or upload a CSV above to see a preview here.</td></tr>`;
      updateBulkSummaryUI(0, 0);
      return;
    }

    let totProfit = 0;
    const previewRows = [];

    lines.forEach((line, idx) => {
      let parts = [];
      if (line.includes('\t')) parts = line.split('\t');
      else if (line.includes(';')) parts = line.split(';');
      else parts = line.split(',');

      parts = parts.map(p => p.trim().replace(/^["']|["']$/g, ''));

      // Skip header if line 0 looks like a header
      if (idx === 0) {
        const first = (parts[0] || '').toLowerCase();
        if (first === 'product' || first === 'product name' || first === 'name' || first === 'sku' || first === 'item') {
          return;
        }
      }

      const name = parts[0] || `Product ${idx + 1}`;
      const rev = cleanNumericInput(parts[1]);
      const cogs = cleanNumericInput(parts[2]);
      const ads = cleanNumericInput(parts[3]);

      const isValid = name.length > 0 && (!isNaN(rev) && rev >= 0);
      const profit = (rev || 0) - (cogs || 0) - (ads || 0);
      const margin = rev > 0 ? (profit / rev) * 100 : 0;

      if (isValid) {
        totProfit += profit;
        bulkParsedProducts.push({
          id: 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          name,
          icon: guessProductIcon(name, ''),
          category: 'General',
          revenue: rev,
          cogs,
          ads,
          profit,
          margin
        });
      }

      previewRows.push(`
        <tr>
          <td><strong>${escapeHtml(name)}</strong></td>
          <td class="text-right font-mono">${formatMoney(rev)}</td>
          <td class="text-right font-mono text-muted">${formatMoney(cogs)}</td>
          <td class="text-right font-mono text-muted">${formatMoney(ads)}</td>
          <td class="text-right font-mono font-bold ${profit >= 0 ? 'text-mint' : 'text-coral'}">${formatMoney(profit)}</td>
          <td class="text-right font-mono">${formatPercent(margin)}</td>
          <td class="text-center">${isValid ? '<span class="badge-valid">Ready</span>' : '<span class="badge-invalid">Check</span>'}</td>
        </tr>
      `);
    });

    tbody.innerHTML = previewRows.join('');
    updateBulkSummaryUI(bulkParsedProducts.length, totProfit);
  }

  function confirmBulkImport() {
    if (!bulkParsedProducts || bulkParsedProducts.length === 0) {
      showToast('No valid products to import', 'warning');
      return;
    }

    const mode = document.querySelector('input[name="bulkImportMode"]:checked')?.value || 'append';
    const count = bulkParsedProducts.length;

    if (mode === 'replace') {
      products = [...bulkParsedProducts];
    } else {
      products = [...products, ...bulkParsedProducts];
    }

    saveData();
    renderProductsView();
    closeModal('bulkProductModal');
    showToast(`Successfully ${mode === 'replace' ? 'replaced list with' : 'added'} ${count} products!`, 'success');
  }

  // --- TOAST NOTIFICATIONS ---
  function showToast(msg, type = 'info') {
    const box = document.getElementById('toastContainer');
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<span>${msg}</span>`;
    box.appendChild(t);
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transform = 'translateY(10px)';
      t.style.transition = 'all 0.25s ease';
      setTimeout(() => t.remove(), 250);
    }, 2800);
  }

  // =====================================================================
  // CASH FLOW MANAGEMENT SYSTEM (Deterministic Calculations & Storage)
  // =====================================================================

  const INFLOW_CATEGORIES = [
    'COD Settlement',
    'Online Payment',
    'Bank Transfer',
    'Owner Investment',
    'Loan Received',
    'Other Inflow'
  ];

  const OUTFLOW_CATEGORIES = [
    'Inventory Purchase',
    'Ads Paid',
    'Courier Payment',
    'Packaging Purchase',
    'Salaries',
    'Rent',
    'Software',
    'Agency / Creative',
    'Loan Repayment',
    'Owner Withdrawal',
    'Equipment',
    'Other Outflow'
  ];

  function seedInitialCashFlow() {
    cashSettings = {
      openingCash: 250000,
      minBuffer: 100000,
      forecastHorizon: 30
    };

    const today = new Date();
    const dStr = formatDate(today);
    const yStr = formatDate(new Date(today.getTime() - 86400000));

    // Exact Test Case 1 matching user prompt specification:
    // Opening: Rs 250,000
    // Inflows: COD Rs 300,000 + Online Rs 100,000 = Rs 400,000
    // Outflows: Inventory Rs 180,000 + Ads Rs 60,000 + Courier Rs 30,000 + Packaging Rs 10,000 + Other Rs 20,000 = Rs 300,000
    // Net Cash Flow: Rs 100,000
    // Closing Cash: Rs 350,000
    cashTransactions = [
      {
        id: 'ctx_101',
        date: dStr,
        type: 'inflow',
        category: 'COD Settlement',
        description: 'PostEx weekly courier COD disbursement',
        amount: 300000,
        paymentStatus: 'cleared',
        notes: 'Batch #891'
      },
      {
        id: 'ctx_102',
        date: dStr,
        type: 'inflow',
        category: 'Online Payment',
        description: 'Shopify Payments / Card settlements',
        amount: 100000,
        paymentStatus: 'cleared',
        notes: 'Stripe payout'
      },
      {
        id: 'ctx_103',
        date: dStr,
        type: 'outflow',
        category: 'Inventory Purchase',
        description: 'Bulk raw fabric & manufacturing batch',
        amount: 180000,
        paymentStatus: 'cleared',
        notes: 'Paid via bank transfer (Does not re-hit P&L as cash)'
      },
      {
        id: 'ctx_104',
        date: dStr,
        type: 'outflow',
        category: 'Ads Paid',
        description: 'Meta Ads prepaid account reload',
        amount: 60000,
        paymentStatus: 'cleared',
        notes: 'Card charge'
      },
      {
        id: 'ctx_105',
        date: dStr,
        type: 'outflow',
        category: 'Courier Payment',
        description: 'Forward shipping invoice clearance',
        amount: 30000,
        paymentStatus: 'cleared',
        notes: 'Trax logistics'
      },
      {
        id: 'ctx_106',
        date: yStr,
        type: 'outflow',
        category: 'Packaging Purchase',
        description: 'Branded flyers and custom boxes restock',
        amount: 10000,
        paymentStatus: 'cleared',
        notes: 'Vendor payment'
      },
      {
        id: 'ctx_107',
        date: yStr,
        type: 'outflow',
        category: 'Other Outflow',
        description: 'Shopify monthly app subscriptions & utilities',
        amount: 20000,
        paymentStatus: 'cleared',
        notes: 'Operating software'
      }
    ];

    saveCashData();
  }

  function saveCashData() {
    try {
      localStorage.setItem(CASH_TX_KEY, JSON.stringify(cashTransactions));
      localStorage.setItem(CASH_SETTINGS_KEY, JSON.stringify(cashSettings));
    } catch (e) {
      console.error('Cash storage error', e);
    }
  }

  // --- FILTER TRANSACTIONS BY PERIOD ---
  function getFilteredCashTransactions() {
    const today = new Date();
    const todayStr = formatDate(today);

    return cashTransactions.filter((tx) => {
      if (activeCashPeriod === 'all') return true;
      if (activeCashPeriod === 'today') return tx.date === todayStr;

      const txDate = new Date(tx.date);
      if (activeCashPeriod === 'week') {
        const diffDays = (today.getTime() - txDate.getTime()) / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 7;
      }

      if (activeCashPeriod === 'month') {
        return txDate.getFullYear() === today.getFullYear() && txDate.getMonth() === today.getMonth();
      }

      if (activeCashPeriod === 'lastMonth') {
        const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        return txDate.getFullYear() === prevMonth.getFullYear() && txDate.getMonth() === prevMonth.getMonth();
      }

      return true;
    });
  }

  // --- UPDATE CASH FLOW VIEW & CALCULATIONS ---
  function updateCashFlowView() {
    const filteredTxs = getFilteredCashTransactions();

    // 1. Deterministic Calculation of Inflows and Outflows
    let totalIn = 0;
    let totalOut = 0;

    filteredTxs.forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      if (tx.paymentStatus === 'cleared') {
        if (tx.type === 'inflow') totalIn += amt;
        else if (tx.type === 'outflow') totalOut += amt;
      }
    });

    const netCash = totalIn - totalOut;
    const closingCash = cashSettings.openingCash + netCash;

    // 2. Render 5 Top KPI Cards
    const elOpening = document.getElementById('cfOpeningCash');
    const elTotalIn = document.getElementById('cfTotalIn');
    const elTotalOut = document.getElementById('cfTotalOut');
    const elNet = document.getElementById('cfNetCash');
    const elClosing = document.getElementById('cfClosingCash');
    const cardClosing = document.getElementById('cfClosingCard');

    if (elOpening) elOpening.textContent = formatMoney(cashSettings.openingCash);
    if (elTotalIn) elTotalIn.textContent = formatMoney(totalIn, true);
    if (elTotalOut) elTotalOut.textContent = formatMoney(totalOut > 0 ? -totalOut : 0);

    if (elNet) {
      elNet.textContent = formatMoney(netCash, true);
      elNet.className = netCash >= 0 ? 'kpi-value font-mono text-mint' : 'kpi-value font-mono text-coral';
    }

    if (elClosing) {
      elClosing.textContent = formatMoney(closingCash);
      elClosing.className = closingCash >= 0 ? 'kpi-value font-mono text-mint' : 'kpi-value font-mono text-coral';
    }

    if (cardClosing) {
      cardClosing.classList.toggle('is-negative', closingCash < 0);
    }

    // 3. Deterministic Cash Runway Calculation
    const elRunwayVal = document.getElementById('cfRunwayVal');
    const elRunwaySub = document.getElementById('cfRunwaySub');

    if (elRunwayVal && elRunwaySub) {
      if (netCash >= 0) {
        elRunwayVal.textContent = 'Positive Cash Flow';
        elRunwayVal.className = 'runway-val text-mint';
        elRunwaySub.textContent = 'Liquid cash reserves are growing';
      } else {
        const daysInPeriod = activeCashPeriod === 'today' ? 1 : (activeCashPeriod === 'week' ? 7 : 30);
        const dailyBurn = Math.abs(netCash) / daysInPeriod;

        if (closingCash <= 0) {
          elRunwayVal.textContent = '0 Days (Exhausted)';
          elRunwayVal.className = 'runway-val text-coral';
          elRunwaySub.textContent = 'Immediate liquidity injection required';
        } else {
          const daysLeft = Math.floor(closingCash / dailyBurn);
          elRunwayVal.textContent = `~${daysLeft} Days`;
          elRunwayVal.className = daysLeft < 15 ? 'runway-val text-coral' : 'runway-val text-amber';
          elRunwaySub.textContent = `At daily net burn of ${formatMoney(dailyBurn)}`;
        }
      }
    }

    // 4. Deterministic Forecast & Shortage Warning System
    const fcInEl = document.getElementById('fcExpectedIn');
    const fcOutEl = document.getElementById('fcExpectedOut');
    const expectedIn = fcInEl ? (Number(fcInEl.value) || 0) : 350000;
    const expectedOut = fcOutEl ? (Number(fcOutEl.value) || 0) : 280000;
    const projectedClosing = closingCash + expectedIn - expectedOut;

    const elProjected = document.getElementById('fcProjectedCash');
    const elWarnBadge = document.getElementById('fcWarningBadge');
    const elStatusBadge = document.getElementById('cfStatusBadge');
    const elStatusTitle = document.getElementById('cfStatusTitle');
    const elStatusDesc = document.getElementById('cfStatusDesc');

    if (elProjected) elProjected.textContent = formatMoney(projectedClosing);

    const minBuffer = cashSettings.minBuffer || 100000;
    const bufferInput = document.getElementById('cfMinBufferInput');
    if (bufferInput && document.activeElement !== bufferInput) {
      bufferInput.value = minBuffer;
    }

    if (elWarnBadge && elStatusBadge) {
      elStatusBadge.className = 'cf-alert-status-badge';
      elWarnBadge.className = 'forecast-badge';

      if (projectedClosing < 0) {
        // Critical Negative Cash
        elStatusBadge.classList.add('status-critical');
        if (elStatusTitle) elStatusTitle.textContent = 'Critical Shortage Warning';
        if (elStatusDesc) elStatusDesc.textContent = 'Projected cash balance is negative! An immediate cash injection or expense delay is needed to avoid insolvency.';
        elWarnBadge.classList.add('badge-critical');
        elWarnBadge.textContent = 'Projected Cash is Negative';
        if (elProjected) elProjected.className = 'forecast-big-val font-mono text-coral';
      } else if (projectedClosing < minBuffer) {
        // Warning: Below Buffer
        elStatusBadge.classList.add('status-warning');
        if (elStatusTitle) elStatusTitle.textContent = 'Buffer Depletion Warning';
        if (elStatusDesc) elStatusDesc.textContent = `Projected cash (${formatMoney(projectedClosing)}) is approaching your minimum cash buffer of ${formatMoney(minBuffer)}.`;
        elWarnBadge.classList.add('badge-warning');
        elWarnBadge.textContent = 'Below Safety Buffer';
        if (elProjected) elProjected.className = 'forecast-big-val font-mono text-amber';
      } else {
        // Healthy Liquidity
        elStatusBadge.classList.add('status-healthy');
        if (elStatusTitle) elStatusTitle.textContent = 'Healthy Liquidity';
        if (elStatusDesc) elStatusDesc.textContent = `Your projected cash balance remains comfortably above your minimum buffer of ${formatMoney(minBuffer)}.`;
        elWarnBadge.classList.add('badge-healthy');
        elWarnBadge.textContent = 'Comfortably Above Buffer';
        if (elProjected) elProjected.className = 'forecast-big-val font-mono text-mint';
      }
    }

    // 5. Profit vs Cash Comparison Card
    const latestPnlRecord = records && records.length > 0 ? records[0] : null;
    const netProfitVal = latestPnlRecord ? (latestPnlRecord.netProfit || 0) : 0;

    const elCompProfit = document.getElementById('cfCompNetProfit');
    const elCompCash = document.getElementById('cfCompNetCash');
    const elCompVar = document.getElementById('cfCompVariance');

    if (elCompProfit) elCompProfit.textContent = formatMoney(netProfitVal);
    if (elCompCash) elCompCash.textContent = formatMoney(netCash, true);
    if (elCompVar) elCompVar.textContent = formatMoney(Math.abs(netProfitVal - netCash));

    // 6. Render Tables
    renderCashDailySummaryTable(filteredTxs);
    renderCashLedgerTable(filteredTxs);

    // 7. Render Charts
    renderCashTrendChart(filteredTxs);
    renderCashInVsOutChart(filteredTxs);
  }

  // --- RENDER DATE-WISE DAILY SUMMARY TABLE (Prompt Section 8) ---
  function renderCashDailySummaryTable(txs) {
    const tbody = document.getElementById('cfDailySummaryBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!txs || txs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted" style="padding:2rem;">No cash movements in this period. Click "+ Log Cash Movement" above.</td></tr>';
      return;
    }

    // Group by Date
    const grouped = {};
    txs.forEach((tx) => {
      if (!grouped[tx.date]) {
        grouped[tx.date] = { date: tx.date, cashIn: 0, cashOut: 0 };
      }
      const amt = Number(tx.amount) || 0;
      if (tx.paymentStatus === 'cleared') {
        if (tx.type === 'inflow') grouped[tx.date].cashIn += amt;
        else if (tx.type === 'outflow') grouped[tx.date].cashOut += amt;
      }
    });

    const dates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));
    let progressiveBalance = cashSettings.openingCash;

    // Calculate progression from chronological order
    const chronDates = [...dates].reverse();
    const balanceMap = {};
    chronDates.forEach((d) => {
      const dayNet = grouped[d].cashIn - grouped[d].cashOut;
      progressiveBalance += dayNet;
      balanceMap[d] = progressiveBalance;
    });

    dates.forEach((d) => {
      const g = grouped[d];
      const net = g.cashIn - g.cashOut;
      const netClass = net >= 0 ? 'text-mint' : 'text-coral';
      const closBal = balanceMap[d];
      const closClass = closBal >= 0 ? 'font-bold' : 'font-bold text-coral';

      const parts = d.split('-');
      const prettyDate = `${parts[2]} ${getMonthName(parseInt(parts[1], 10))} ${parts[0]}`;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${prettyDate}</strong></td>
        <td class="text-right font-mono text-mint">+${formatMoney(g.cashIn)}</td>
        <td class="text-right font-mono text-coral">&minus;${formatMoney(g.cashOut)}</td>
        <td class="text-right font-mono ${netClass}">${formatMoney(net, true)}</td>
        <td class="text-right font-mono ${closClass}">${formatMoney(closBal)}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // --- RENDER ITEMIZED TRANSACTIONS LEDGER TABLE ---
  function renderCashLedgerTable(txs) {
    const tbody = document.getElementById('cfLedgerBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const searchInput = document.getElementById('cfSearchInput');
    const search = searchInput ? (searchInput.value || '').toLowerCase().trim() : '';
    const filtered = txs.filter((t) => {
      if (!search) return true;
      return (
        t.category.toLowerCase().includes(search) ||
        (t.description && t.description.toLowerCase().includes(search)) ||
        (t.notes && t.notes.toLowerCase().includes(search))
      );
    });

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted" style="padding:2rem;">No matching cash transactions found.</td></tr>';
      return;
    }

    filtered.forEach((tx) => {
      const tr = document.createElement('tr');
      const isInflow = tx.type === 'inflow';
      const typeBadge = isInflow ? '<span class="badge-inflow">+ Inflow</span>' : '<span class="badge-outflow">&minus; Outflow</span>';
      const amtClass = isInflow ? 'text-mint' : 'text-coral';
      const amtSign = isInflow ? '+' : '&minus;';

      const parts = tx.date.split('-');
      const prettyDate = `${parts[2]} ${getMonthName(parseInt(parts[1], 10))}`;

      tr.innerHTML = `
        <td><strong>${prettyDate}</strong></td>
        <td>${typeBadge}</td>
        <td><strong>${tx.category}</strong></td>
        <td><span style="font-size:12px; color:var(--text-body);">${tx.description || '&mdash;'}</span></td>
        <td class="text-right font-mono font-bold ${amtClass}">${amtSign}${formatMoney(tx.amount)}</td>
        <td class="text-center"><span class="badge-status">${tx.paymentStatus === 'cleared' ? 'Cleared' : 'Pending'}</span></td>
        <td class="text-center">
          <button type="button" class="btn btn-outline btn-sm" style="padding:2px 7px; font-size:11px;" onclick="app.editCashTx('${tx.id}')">Edit</button>
          <button type="button" class="btn btn-outline btn-sm text-coral" style="padding:2px 7px; font-size:11px;" onclick="app.deleteCashTx('${tx.id}')">&times;</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // --- RENDER CASH BALANCE TREND CHART (Canvas) ---
  function renderCashTrendChart(txs = null) {
    const canvas = document.getElementById('cashTrendCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width > 0 ? rect.width : (canvas.parentElement ? canvas.parentElement.clientWidth : 320);
    canvas.width = w * dpr;
    canvas.height = 220 * dpr;
    ctx.scale(dpr, dpr);

    const h = 220;

    ctx.clearRect(0, 0, w, h);

    const activeTxs = txs || getFilteredCashTransactions();

    // Group cash balance progression
    const grouped = {};
    activeTxs.forEach((tx) => {
      if (!grouped[tx.date]) grouped[tx.date] = 0;
      const amt = Number(tx.amount) || 0;
      if (tx.paymentStatus === 'cleared') {
        grouped[tx.date] += (tx.type === 'inflow' ? amt : -amt);
      }
    });

    const dates = Object.keys(grouped).sort((a, b) => new Date(a) - new Date(b));
    let bal = cashSettings.openingCash;
    const pointsData = [];

    // Include opening point
    pointsData.push({ date: 'Start', bal });
    dates.forEach((d) => {
      bal += grouped[d];
      pointsData.push({ date: d, bal });
    });

    const values = pointsData.map((p) => p.bal);
    const maxVal = Math.max(...values, cashSettings.minBuffer || 100000, 100000) * 1.15;
    const minVal = Math.min(...values, 0);

    const padLeft = 45;
    const padRight = 20;
    const padTop = 20;
    const padBottom = 30;

    const chartW = w - padLeft - padRight;
    const chartH = h - padTop - padBottom;

    // Grid lines
    ctx.strokeStyle = '#f0ede6';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#8e8f94';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';

    for (let i = 0; i <= 4; i++) {
      const yVal = minVal + ((maxVal - minVal) / 4) * i;
      const y = padTop + chartH - (i / 4) * chartH;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(w - padRight, y);
      ctx.stroke();

      const label = yVal >= 1000 ? `${Math.round(yVal / 1000)}k` : Math.round(yVal);
      ctx.fillText(label, padLeft - 6, y + 3);
    }

    // Minimum buffer guideline
    const bufY = padTop + chartH - ((cashSettings.minBuffer - minVal) / (maxVal - minVal || 1)) * chartH;
    if (bufY >= padTop && bufY <= padTop + chartH) {
      ctx.save();
      ctx.strokeStyle = 'rgba(217, 119, 6, 0.4)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(padLeft, bufY);
      ctx.lineTo(w - padRight, bufY);
      ctx.stroke();
      ctx.fillStyle = '#d97706';
      ctx.fillText('Buffer', w - padRight, bufY - 4);
      ctx.restore();
    }

    const stepX = chartW / Math.max(pointsData.length - 1, 1);
    const coords = pointsData.map((pt, idx) => {
      const x = padLeft + idx * stepX;
      const norm = (pt.bal - minVal) / (maxVal - minVal || 1);
      const y = padTop + chartH - norm * chartH;
      return { x, y, date: pt.date, bal: pt.bal };
    });

    if (coords.length > 1) {
      ctx.beginPath();
      ctx.moveTo(coords[0].x, coords[0].y);
      for (let i = 0; i < coords.length - 1; i++) {
        const p0 = coords[i];
        const p1 = coords[i + 1];
        const cpX = (p0.x + p1.x) / 2;
        ctx.bezierCurveTo(cpX, p0.y, cpX, p1.y, p1.x, p1.y);
      }

      ctx.strokeStyle = bal >= 0 ? '#1b4d3e' : '#e05252';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Points
      coords.forEach((c) => {
        ctx.beginPath();
        ctx.arc(c.x, c.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = c.bal >= 0 ? '#1b4d3e' : '#e05252';
        ctx.fill();
      });
    }

    // X Labels
    ctx.fillStyle = '#8e8f94';
    ctx.textAlign = 'center';
    coords.forEach((c, idx) => {
      if (idx === 0 || idx === coords.length - 1 || idx % Math.max(1, Math.floor(coords.length / 4)) === 0) {
        const lbl = c.date === 'Start' ? 'Start' : c.date.split('-')[2] || c.date;
        ctx.fillText(lbl, c.x, h - 8);
      }
    });
  }

  // --- RENDER CASH IN VS OUT BAR CHART (Canvas) ---
  function renderCashInVsOutChart(txs = null) {
    const canvas = document.getElementById('cashInVsOutCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width > 0 ? rect.width : (canvas.parentElement ? canvas.parentElement.clientWidth : 320);
    canvas.width = w * dpr;
    canvas.height = 220 * dpr;
    ctx.scale(dpr, dpr);

    const h = 220;

    ctx.clearRect(0, 0, w, h);

    const activeTxs = txs || getFilteredCashTransactions();
    let totIn = 0;
    let totOut = 0;
    activeTxs.forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      if (tx.paymentStatus === 'cleared') {
        if (tx.type === 'inflow') totIn += amt;
        else if (tx.type === 'outflow') totOut += amt;
      }
    });

    const maxVal = Math.max(totIn, totOut, 100000) * 1.2;

    const padLeft = 45;
    const padRight = 20;
    const padTop = 20;
    const padBottom = 30;
    const chartH = h - padTop - padBottom;

    // Grid lines
    ctx.strokeStyle = '#f0ede6';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#8e8f94';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';

    for (let i = 0; i <= 4; i++) {
      const yVal = (maxVal / 4) * i;
      const y = padTop + chartH - (i / 4) * chartH;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(w - padRight, y);
      ctx.stroke();

      const label = yVal >= 1000 ? `${Math.round(yVal / 1000)}k` : Math.round(yVal);
      ctx.fillText(label, padLeft - 6, y + 3);
    }

    // Inflow Bar vs Outflow Bar
    const barW = 55;
    const centerX = padLeft + (w - padLeft - padRight) / 2;

    // Inflow Bar
    const inH = (totIn / maxVal) * chartH;
    const inX = centerX - barW - 15;
    const inY = padTop + chartH - inH;

    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(inX, inY, barW, inH, [6, 6, 0, 0]) : ctx.rect(inX, inY, barW, inH);
    ctx.fill();

    // Outflow Bar
    const outH = (totOut / maxVal) * chartH;
    const outX = centerX + 15;
    const outY = padTop + chartH - outH;

    ctx.fillStyle = '#e05252';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(outX, outY, barW, outH, [6, 6, 0, 0]) : ctx.rect(outX, outY, barW, outH);
    ctx.fill();

    // Labels beneath bars
    ctx.fillStyle = '#111827';
    ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Cash In', inX + barW / 2, h - 10);
    ctx.fillText('Cash Out', outX + barW / 2, h - 10);

    // Value annotations on top of bars
    ctx.font = '700 11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#15803d';
    ctx.fillText(`+${formatMoney(totIn)}`, inX + barW / 2, Math.max(padTop + 12, inY - 6));
    ctx.fillStyle = '#b91c1c';
    ctx.fillText(`-${formatMoney(totOut)}`, outX + barW / 2, Math.max(padTop + 12, outY - 6));
  }

  // --- CASH FLOW MODAL & CRUD HANDLERS ---
  function updateCashCategoryOptions() {
    const radioInflow = document.getElementById('typeInflow');
    const isInflow = radioInflow ? radioInflow.checked : true;
    const sel = document.getElementById('cashTxCategory');
    if (!sel) return;

    sel.innerHTML = '';
    const cats = isInflow ? INFLOW_CATEGORIES : OUTFLOW_CATEGORIES;
    cats.forEach((c) => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      sel.appendChild(opt);
    });
  }

  function openCashModal(editId = null) {
    editingCashTxId = editId;
    const modalTitle = document.getElementById('cashModalTitle');

    if (editId) {
      const tx = cashTransactions.find((t) => t.id === editId);
      if (!tx) return;

      if (modalTitle) modalTitle.textContent = 'Edit Cash Movement';
      document.getElementById('cashTxId').value = tx.id;
      document.getElementById('cashTxDate').value = tx.date;
      document.getElementById(tx.type === 'inflow' ? 'typeInflow' : 'typeOutflow').checked = true;
      updateCashCategoryOptions();
      document.getElementById('cashTxCategory').value = tx.category;
      document.getElementById('cashTxAmount').value = tx.amount;
      document.getElementById('cashTxDesc').value = tx.description || '';
      document.getElementById('cashTxStatus').value = tx.paymentStatus || 'cleared';
      document.getElementById('cashTxNotes').value = tx.notes || '';
    } else {
      if (modalTitle) modalTitle.textContent = 'Log Cash Movement';
      document.getElementById('cashTxId').value = '';
      document.getElementById('cashTxDate').value = formatDate(new Date());
      document.getElementById('typeInflow').checked = true;
      updateCashCategoryOptions();
      document.getElementById('cashTxAmount').value = '';
      document.getElementById('cashTxDesc').value = '';
      document.getElementById('cashTxStatus').value = 'cleared';
      document.getElementById('cashTxNotes').value = '';
    }

    openModal('cashTransactionModal');
  }

  function handleCashTxSubmit(e) {
    e.preventDefault();

    const id = editingCashTxId || 'ctx_' + Date.now();
    const date = document.getElementById('cashTxDate').value;
    const type = document.getElementById('typeInflow').checked ? 'inflow' : 'outflow';
    const category = document.getElementById('cashTxCategory').value;
    const amount = Number(document.getElementById('cashTxAmount').value) || 0;
    const description = document.getElementById('cashTxDesc').value.trim();
    const paymentStatus = document.getElementById('cashTxStatus').value;
    const notes = document.getElementById('cashTxNotes').value.trim();

    if (!date) {
      showToast('Please select a date', 'error');
      return;
    }
    if (amount <= 0) {
      showToast('Please enter an amount greater than 0', 'error');
      return;
    }

    const txObj = {
      id,
      date,
      type,
      category,
      description,
      amount,
      paymentStatus,
      notes
    };

    if (editingCashTxId) {
      const idx = cashTransactions.findIndex((t) => t.id === editingCashTxId);
      if (idx !== -1) cashTransactions[idx] = txObj;
      editingCashTxId = null;
      showToast('Cash transaction updated', 'success');
    } else {
      cashTransactions.unshift(txObj);
      showToast(`Logged ${type === 'inflow' ? 'Cash In' : 'Cash Out'} of ${formatMoney(amount)}`, 'success');
    }

    saveCashData();
    closeModal('cashTransactionModal');
    updateCashFlowView();
  }

  function editCashTx(id) {
    openCashModal(id);
  }

  function deleteCashTx(id) {
    const tx = cashTransactions.find((t) => t.id === id);
    if (!tx) return;

    if (confirm(`Delete ${tx.type} record for ${formatMoney(tx.amount)}?`)) {
      cashTransactions = cashTransactions.filter((t) => t.id !== id);
      saveCashData();
      updateCashFlowView();
      showToast('Transaction deleted', 'info');
    }
  }

  // --- OPENING CASH MODAL ---
  function openOpeningCashModal() {
    document.getElementById('inputOpeningCashVal').value = cashSettings.openingCash;
    document.getElementById('inputMinBufferVal').value = cashSettings.minBuffer;
    openModal('openingCashModal');
  }

  function saveOpeningCashSettings() {
    const val = Number(document.getElementById('inputOpeningCashVal').value);
    const buf = Number(document.getElementById('inputMinBufferVal').value);

    cashSettings.openingCash = isNaN(val) ? 250000 : val;
    cashSettings.minBuffer = isNaN(buf) ? 100000 : buf;

    saveCashData();
    closeModal('openingCashModal');
    updateCashFlowView();
    showToast(`Updated opening cash balance to ${formatMoney(cashSettings.openingCash)}`, 'success');
  }

  // --- PRESET TEST SCENARIOS (Testing Prompt Requirements 20 & 21) ---
  function loadCashScenario(scenarioNum) {
    const today = formatDate(new Date());

    if (scenarioNum === 1) {
      // Test 1: Standard Flow (Opening Rs 250k, In Rs 400k, Out Rs 300k => Net Rs 100k, Closing Rs 350k)
      cashSettings.openingCash = 250000;
      cashSettings.minBuffer = 100000;
      cashTransactions = [
        { id: 'ctx_s1_1', date: today, type: 'inflow', category: 'COD Settlement', description: 'COD Settlements Received', amount: 300000, paymentStatus: 'cleared', notes: 'Prompt Test 1' },
        { id: 'ctx_s1_2', date: today, type: 'inflow', category: 'Online Payment', description: 'Card & Online Payments', amount: 100000, paymentStatus: 'cleared', notes: 'Prompt Test 1' },
        { id: 'ctx_s1_3', date: today, type: 'outflow', category: 'Inventory Purchase', description: 'Bulk Inventory Restock', amount: 180000, paymentStatus: 'cleared', notes: 'Prompt Test 1' },
        { id: 'ctx_s1_4', date: today, type: 'outflow', category: 'Ads Paid', description: 'Meta Ads Recharge', amount: 60000, paymentStatus: 'cleared', notes: 'Prompt Test 1' },
        { id: 'ctx_s1_5', date: today, type: 'outflow', category: 'Courier Payment', description: 'Courier Delivery Fees Paid', amount: 30000, paymentStatus: 'cleared', notes: 'Prompt Test 1' },
        { id: 'ctx_s1_6', date: today, type: 'outflow', category: 'Packaging Purchase', description: 'Boxes & Tape Restock', amount: 10000, paymentStatus: 'cleared', notes: 'Prompt Test 1' },
        { id: 'ctx_s1_7', date: today, type: 'outflow', category: 'Other Outflow', description: 'Store Overheads Paid', amount: 20000, paymentStatus: 'cleared', notes: 'Prompt Test 1' }
      ];
      saveCashData();
      updateCashFlowView();
      showToast('Loaded Test 1: Opening Rs 250k + In Rs 400k - Out Rs 300k = Closing Rs 350,000', 'success');
    } else if (scenarioNum === 2) {
      // Test 2: Negative Cash Flow (Opening Rs 200k, In Rs 100k, Out Rs 350k => Net -Rs 250k, Closing -Rs 50k)
      cashSettings.openingCash = 200000;
      cashSettings.minBuffer = 100000;
      cashTransactions = [
        { id: 'ctx_s2_1', date: today, type: 'inflow', category: 'COD Settlement', description: 'Customer Payments Received', amount: 100000, paymentStatus: 'cleared', notes: 'Prompt Test 2' },
        { id: 'ctx_s2_2', date: today, type: 'outflow', category: 'Inventory Purchase', description: 'Bulk Supplier Wire Payment', amount: 350000, paymentStatus: 'cleared', notes: 'Prompt Test 2' }
      ];
      saveCashData();
      updateCashFlowView();
      showToast('Loaded Test 2: Opening Rs 200k + In Rs 100k - Out Rs 350k = Closing -Rs 50,000 (Negative Alert!)', 'error');
    }
  }

  // --- PERIOD & TABLE SWITCHERS ---
  function setCashPeriod(p) {
    activeCashPeriod = p;
    document.querySelectorAll('.cf-period-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.period === p);
    });
    updateCashFlowView();
  }

  function setForecastHorizon(days) {
    cashSettings.forecastHorizon = days;
    document.querySelectorAll('#cfForecastTabs .time-tab').forEach((t) => {
      t.classList.toggle('active', Number(t.dataset.horizon) === days);
    });
    updateCashFlowView();
  }

  function switchCashTableTab(tab) {
    activeCashTableTab = tab;
    const tabSummaryBtn = document.getElementById('tabDailySummaryBtn');
    const tabLedgerBtn = document.getElementById('tabLedgerBtn');
    const containerSummary = document.getElementById('cfDailySummaryContainer');
    const containerLedger = document.getElementById('cfLedgerContainer');

    if (tabSummaryBtn) tabSummaryBtn.classList.toggle('active', tab === 'daily');
    if (tabLedgerBtn) tabLedgerBtn.classList.toggle('active', tab === 'ledger');
    if (containerSummary) containerSummary.classList.toggle('hidden', tab !== 'daily');
    if (containerLedger) containerLedger.classList.toggle('hidden', tab !== 'ledger');
  }

  function filterCashTransactions() {
    renderCashLedgerTable(getFilteredCashTransactions());
  }

  // --- EXPORT CASH FLOW CSV ---
  function exportCashFlowCsv() {
    if (!cashTransactions || cashTransactions.length === 0) {
      showToast('No cash transactions to export', 'error');
      return;
    }

    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Payment Status', 'Notes'];
    const rows = cashTransactions.map((t) => [
      t.date,
      t.type.toUpperCase(),
      `"${t.category}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.amount,
      t.paymentStatus,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ecomPnL_CashFlow_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported Cash Flow CSV successfully!', 'success');
  }

  // --- DYNAMIC GREETING ---
  function updateGreeting() {
    const hour = new Date().getHours();
    const el = document.getElementById('greetingText');
    if (el) {
      if (hour < 12) el.textContent = 'Good morning,';
      else if (hour < 17) el.textContent = 'Good afternoon,';
      else el.textContent = 'Good evening,';
    }

    const today = new Date();
    const dateParts = formatDate(today).split('-');
    const label = document.getElementById('currentDateLabel');
    if (label) {
      label.textContent = `Today, ${dateParts[2]} ${getMonthName(parseInt(dateParts[1], 10))} ${dateParts[0]}`;
    }
  }

  // --- INITIALIZATION ---
  function init() {
    loadData();
    updateGreeting();

    // Default input date
    document.getElementById('inputDate').value = formatDate(new Date());

    // Apply currency & brand
    applyCurrency(currency.code, currency.symbol);
    document.getElementById('brandNameInput').value = brand.name;
    document.getElementById('headerBrandName').textContent = brand.name;
    document.getElementById('settingsBrandDisplay').textContent = brand.name;
    const initial = brand.name.charAt(0).toUpperCase();
    document.getElementById('headerAvatar').textContent = initial;
    document.getElementById('settingsAvatarLarge').textContent = initial;

    // Form listeners
    document.getElementById('pnlForm').addEventListener('input', updateLiveSummary);
    document.getElementById('pnlForm').addEventListener('submit', handleFormSubmit);

    // Cash Flow Forecast input listeners
    const fcIn = document.getElementById('fcExpectedIn');
    const fcOut = document.getElementById('fcExpectedOut');
    if (fcIn) fcIn.addEventListener('input', updateCashFlowView);
    if (fcOut) fcOut.addEventListener('input', updateCashFlowView);

    const minBufInput = document.getElementById('cfMinBufferInput');
    if (minBufInput) {
      minBufInput.addEventListener('change', (e) => {
        const val = Number(e.target.value);
        if (!isNaN(val) && val >= 0) {
          cashSettings.minBuffer = val;
          saveCashData();
          updateCashFlowView();
          showToast(`Minimum cash buffer set to ${formatMoney(val)}`, 'info');
        }
      });
    }

    // Buttons
    document.getElementById('loadDemoBtn').addEventListener('click', loadSampleNumbers);
    document.getElementById('clearFormBtn').addEventListener('click', clearInputs);
    document.getElementById('cancelEditBtn').addEventListener('click', cancelEdit);
    document.getElementById('exportCsvBtn').addEventListener('click', exportCsv);
    document.getElementById('saveBrandSettingsBtn').addEventListener('click', saveBrandSettings);

    document.getElementById('clearAllHistoryBtn').addEventListener('click', () => {
      if (confirm('Clear all saved daily history?')) {
        records = [];
        saveData();
        refreshAllViews();
        showToast('History cleared', 'info');
      }
    });

    // Currency Dropdown
    document.getElementById('currencySelect').addEventListener('change', (e) => {
      const val = e.target.value;
      if (val === 'CUSTOM') {
        openModal('customCurrencyModal');
      } else {
        const parts = val.split('|');
        applyCurrency(parts[0], parts[1]);
      }
    });

    // Custom Currency Modal Save
    document.getElementById('saveCustomCurrencyBtn').addEventListener('click', () => {
      const code = (document.getElementById('customCode').value || 'CUSTOM').toUpperCase().trim();
      const sym = (document.getElementById('customSymbol').value || code).trim() + ' ';
      applyCurrency(code, sym);
      closeModal('customCurrencyModal');
    });

    // Window Resize listener to redraw charts smoothly
    window.addEventListener('resize', () => {
      if (currentView === 'dashboard') {
        renderProfitTrendChart();
        renderExpenseDonutChart();
      } else if (currentView === 'reports') {
        renderMonthlyBarChart();
      } else if (currentView === 'cashflow') {
        renderCashTrendChart();
        renderCashInVsOutChart();
      }
    });

    // --- ANTI-ZOOM SAFEGUARDS (Mobile & PC) ---
    // 1. Prevent accidental Ctrl + Mouse Wheel / Trackpad pinch zoom on PC
    window.addEventListener('wheel', (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    }, { passive: false });

    // 2. Prevent Safari gesture zooming (pinch-to-zoom on iOS/macOS Safari)
    ['gesturestart', 'gesturechange', 'gestureend'].forEach((evt) => {
      document.addEventListener(evt, (e) => {
        e.preventDefault();
      });
    });

    // 3. Prevent multi-finger pinch zoom on mobile touchscreens
    document.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });

    // 4. Close mobile sidebar on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        toggleMobileSidebar(false);
      }
    });

    // Initial render
    refreshAllViews();
  }

  // Expose global methods for inline event handlers
  window.app = {
    switchView,
    editRecord,
    deleteRecord,
    closeModal,
    openAuthModal,
    handleAuthSubmit,
    showAddProductModal,
    setChartRange,
    toggleMobileSidebar,
    exportCsv,
    // Product Management & Bulk methods
    openProductModal,
    updateProdLivePreview,
    handleProductSubmit,
    deleteProduct,
    filterProductsList,
    exportProductsCsv,
    openBulkProductModal,
    switchBulkTab,
    loadSampleBulkData,
    downloadProductTemplateCsv,
    handleCsvFileUpload,
    parseBulkInput,
    addMultiRowItem,
    parseMultiRows,
    clearMultiRows,
    confirmBulkImport,
    // Cash Flow methods
    openCashModal,
    handleCashTxSubmit,
    editCashTx,
    deleteCashTx,
    openOpeningCashModal,
    saveOpeningCashSettings,
    loadCashScenario,
    setCashPeriod,
    setForecastHorizon,
    switchCashTableTab,
    filterCashTransactions,
    exportCashFlowCsv,
    updateCashCategoryOptions
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
