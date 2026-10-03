/**
 * ProfitPulse — Simple E-commerce P&L Calculator
 * Fast, single-page, manual-entry P&L calculator. Zero APIs, 100% offline.
 */

(function () {
  'use strict';

  // --- STORAGE & STATE ---
  const STORAGE_KEY = 'simple_pnl_records_v1';
  const CURRENCY_KEY = 'simple_pnl_currency_v1';

  let currency = {
    code: 'PKR',
    symbol: 'Rs '
  };

  let records = [];
  let editingId = null;

  // Load saved currency and records
  function loadData() {
    try {
      const savedCurr = localStorage.getItem(CURRENCY_KEY);
      if (savedCurr) {
        currency = JSON.parse(savedCurr);
      }
      const savedRecs = localStorage.getItem(STORAGE_KEY);
      if (savedRecs) {
        records = JSON.parse(savedRecs);
      }
    } catch (e) {
      console.warn('Storage read error', e);
    }

    // If records are empty, pre-populate 3 clean realistic sample rows
    if (!records || records.length === 0) {
      seedInitialRecords();
    }
  }

  function saveData() {
    try {
      localStorage.setItem(CURRENCY_KEY, JSON.stringify(currency));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('Storage save error', e);
    }
  }

  function seedInitialRecords() {
    const today = new Date();
    records = [
      {
        id: 'rec_1',
        date: new Date(today.getTime() - 2 * 86400000).toISOString().split('T')[0],
        store: 'Shopify Store',
        ordersPlaced: 48,
        ordersDelivered: 42,
        grossSales: 216000,
        returnsDiscounts: 11000,
        netSales: 205000,
        productCogs: 42000,
        courierCost: 12500,
        packagingCost: 3100,
        returnShippingCost: 800,
        adSpend: 48000,
        agencyInfluencer: 4800,
        otherExpenses: 5000,
        totalCosts: 108200,
        netProfit: 96800,
        margin: 47.2,
        roas: 4.27,
        cpa: 1000,
        notes: 'Advantage+ campaign testing'
      },
      {
        id: 'rec_2',
        date: new Date(today.getTime() - 1 * 86400000).toISOString().split('T')[0],
        store: 'Shopify Store',
        ordersPlaced: 62,
        ordersDelivered: 54,
        grossSales: 279000,
        returnsDiscounts: 14000,
        netSales: 265000,
        productCogs: 54000,
        courierCost: 16200,
        packagingCost: 4000,
        returnShippingCost: 1100,
        adSpend: 62000,
        agencyInfluencer: 6200,
        otherExpenses: 6000,
        totalCosts: 143500,
        netProfit: 121500,
        margin: 45.8,
        roas: 4.27,
        cpa: 1000,
        notes: 'Influencer viral reel spike'
      }
    ];
    saveData();
  }

  // --- CURRENCY FORMATTER ---
  function formatMoney(amount, showSign = false) {
    const num = Number(amount) || 0;
    const isNeg = num < 0;
    const absVal = Math.abs(num).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
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

  // --- LIVE CALCULATION ENGINE ---
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

  // Update Right-Hand Result Card
  function updateLiveSummary() {
    const v = getFormValues();

    // Top Profit Card
    const card = document.getElementById('profitHighlightCard');
    const statusLabel = document.getElementById('profitStatusLabel');
    const profitVal = document.getElementById('liveNetProfit');
    const marginBadge = document.getElementById('liveProfitMargin');

    card.classList.remove('is-profit', 'is-loss', 'is-neutral');

    if (v.grossSales === 0 && v.totalCosts === 0) {
      card.classList.add('is-neutral');
      statusLabel.textContent = 'Enter Daily Numbers';
      profitVal.textContent = formatMoney(0);
      marginBadge.textContent = 'Margin: 0.0%';
    } else if (v.netProfit >= 0) {
      card.classList.add('is-profit');
      statusLabel.textContent = 'Profitable Today';
      profitVal.textContent = formatMoney(v.netProfit, true);
      marginBadge.textContent = `Profit Margin: ${formatPercent(v.margin)}`;
    } else {
      card.classList.add('is-loss');
      statusLabel.textContent = 'Operating at Loss';
      profitVal.textContent = formatMoney(v.netProfit);
      marginBadge.textContent = `Negative Margin: ${formatPercent(v.margin)}`;
    }

    // Visual Breakdown Bar (Proportions of Net Sales)
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

    const costsRatio = v.netSales > 0 ? (v.totalCosts / v.netSales) * 100 : 0;
    document.getElementById('costsPercentageLabel').textContent = `${formatPercent(costsRatio)} Costs`;

    // 6 Metrics Box
    document.getElementById('liveNetSales').textContent = formatMoney(v.netSales);
    document.getElementById('liveGrossSub').textContent = `Gross: ${formatMoney(v.grossSales)}`;

    document.getElementById('liveTotalCosts').textContent = formatMoney(v.totalCosts);
    document.getElementById('liveCostsSub').textContent = `${formatPercent(costsRatio)} of sales`;

    document.getElementById('liveAdSpend').textContent = formatMoney(v.adSpend);
    const adRatio = v.netSales > 0 ? (v.adSpend / v.netSales) * 100 : 0;
    document.getElementById('liveAdShare').textContent = `${formatPercent(adRatio)} of sales`;

    document.getElementById('liveRoas').textContent = `${v.roas.toFixed(2)}x`;
    document.getElementById('liveCpa').textContent = formatMoney(v.cpa);

    document.getElementById('liveDeliveryRate').textContent = formatPercent(v.deliveryRate);
    document.getElementById('liveDeliveredCount').textContent = `${v.ordersDelivered} of ${v.ordersPlaced} delivered`;
  }

  // --- FORM SUBMIT & RECORD SAVING ---
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
      showToast('Please enter at least sales or cost figures', 'error');
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
      document.getElementById('saveBtnText').textContent = "Save Today's Numbers";
      showToast(`Updated record for ${dateInput}`, 'success');
    } else {
      records.unshift(record);
      showToast(`Saved P&L record for ${dateInput}!`, 'success');
    }

    saveData();
    renderHistoryTable();
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

    updateLiveSummary();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`Loaded ${rec.date} for editing`, 'info');
  }

  function cancelEdit() {
    editingId = null;
    document.getElementById('editEntryId').value = '';
    document.getElementById('cancelEditBtn').classList.add('hidden');
    document.getElementById('saveBtnText').textContent = "Save Today's Numbers";
    clearInputs();
  }

  function deleteRecord(id) {
    const rec = records.find((r) => r.id === id);
    if (!rec) return;

    if (confirm(`Delete record for ${rec.date}?`)) {
      records = records.filter((r) => r.id !== id);
      saveData();
      renderHistoryTable();
      showToast('Record deleted', 'info');
    }
  }

  function clearInputs() {
    document.getElementById('pnlForm').reset();
    document.getElementById('inputDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('inputStore').value = 'Shopify Store';
    updateLiveSummary();
  }

  // --- LOAD DEMO SAMPLE ---
  function loadSampleNumbers() {
    document.getElementById('inputDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('inputStore').value = 'Shopify Store';

    // Realistic PKR or proportional scale
    const isPkr = currency.code === 'PKR';
    const mult = isPkr ? 1 : 0.0036; // scale if other currency

    document.getElementById('grossSales').value = (245000 * mult).toFixed(isPkr ? 0 : 2);
    document.getElementById('returnsDiscounts').value = (12000 * mult).toFixed(isPkr ? 0 : 2);
    document.getElementById('ordersPlaced').value = 54;
    document.getElementById('ordersDelivered').value = 47;

    document.getElementById('productCogs').value = (48000 * mult).toFixed(isPkr ? 0 : 2);
    document.getElementById('courierCost').value = (14500 * mult).toFixed(isPkr ? 0 : 2);
    document.getElementById('packagingCost').value = (3500 * mult).toFixed(isPkr ? 0 : 2);
    document.getElementById('returnShippingCost').value = (900 * mult).toFixed(isPkr ? 0 : 2);

    document.getElementById('adSpend').value = (52000 * mult).toFixed(isPkr ? 0 : 2);
    document.getElementById('agencyInfluencer').value = (5200 * mult).toFixed(isPkr ? 0 : 2);
    document.getElementById('otherExpenses').value = (6000 * mult).toFixed(isPkr ? 0 : 2);
    document.getElementById('entryNotes').value = 'Scaling Broad ABO + TikTok UGC';

    updateLiveSummary();
    showToast('Loaded realistic sample numbers!', 'success');
  }

  // --- RENDER SAVED HISTORY TABLE ---
  function renderHistoryTable() {
    const tbody = document.getElementById('historyTableBody');
    tbody.innerHTML = '';

    if (!records || records.length === 0) {
      tbody.innerHTML = `<tr><td colspan="10" class="text-center text-muted" style="padding: 2rem;">No records saved yet. Enter numbers above and click "Save Today's Numbers".</td></tr>`;
      return;
    }

    records.forEach((r) => {
      const tr = document.createElement('tr');
      const isProfit = r.netProfit >= 0;
      const profitBadge = isProfit ? 'badge-profit' : 'badge-loss';
      const profitTextClass = isProfit ? 'text-mint' : 'text-coral';

      const directCosts = (r.productCogs || 0) + (r.courierCost || 0) + (r.packagingCost || 0) + (r.returnShippingCost || 0);

      tr.innerHTML = `
        <td><strong>${r.date}</strong></td>
        <td><span style="font-size:11px; background:var(--bg-subtle); padding:2px 6px; border-radius:4px;">${r.store || 'Store'}</span></td>
        <td class="text-right font-mono">${r.ordersPlaced || 0}</td>
        <td class="text-right font-mono font-bold">${formatMoney(r.netSales)}</td>
        <td class="text-right font-mono text-coral">${formatMoney(r.adSpend)}</td>
        <td class="text-right font-mono text-muted">${formatMoney(directCosts)}</td>
        <td class="text-right font-mono text-amber">${formatMoney(r.totalCosts)}</td>
        <td class="text-right font-mono font-bold ${profitTextClass}">${formatMoney(r.netProfit, true)}</td>
        <td class="text-right"><span class="${profitBadge}">${formatPercent(r.margin)}</span></td>
        <td class="text-center">
          <button type="button" class="btn btn-secondary btn-sm" style="padding: 2px 7px; font-size: 11px;" onclick="app.editRecord('${r.id}')">Edit</button>
          <button type="button" class="btn btn-outline btn-sm text-red" style="padding: 2px 7px; font-size: 11px;" onclick="app.deleteRecord('${r.id}')">&times;</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // --- CURRENCY LOGIC ---
  function applyCurrency(code, symbol) {
    currency = { code, symbol: symbol.endsWith(' ') ? symbol : `${symbol} ` };
    saveData();

    // Update all prefix spans in inputs
    document.querySelectorAll('.currency-prefix').forEach((el) => {
      el.textContent = currency.symbol;
    });

    // Make sure dropdown reflects it
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

    updateLiveSummary();
    renderHistoryTable();
    showToast(`Currency changed to ${code} (${currency.symbol.trim()})`, 'info');
  }

  // --- CSV EXPORTER ---
  function exportCsv() {
    if (!records || records.length === 0) {
      showToast('No saved records to export', 'error');
      return;
    }

    const headers = [
      'Date',
      'Store',
      'Orders Placed',
      'Orders Delivered',
      'Gross Sales',
      'Returns & Discounts',
      'Net Sales',
      'Product Cost (COGS)',
      'Courier Cost',
      'Packaging Cost',
      'Return Shipping Cost',
      'Ad Spend',
      'Agency & Influencer',
      'Other Expenses',
      'Total Costs',
      'Net Profit',
      'Profit Margin %',
      'ROAS',
      'CPA',
      'Notes'
    ];

    const rows = records.map((r) => [
      r.date,
      `"${r.store || ''}"`,
      r.ordersPlaced || 0,
      r.ordersDelivered || 0,
      r.grossSales || 0,
      r.returnsDiscounts || 0,
      r.netSales || 0,
      r.productCogs || 0,
      r.courierCost || 0,
      r.packagingCost || 0,
      r.returnShippingCost || 0,
      r.adSpend || 0,
      r.agencyInfluencer || 0,
      r.otherExpenses || 0,
      r.totalCosts || 0,
      r.netProfit || 0,
      `${(r.margin || 0).toFixed(1)}%`,
      (r.roas || 0).toFixed(2),
      r.cpa || 0,
      `"${(r.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Ecommerce_PnL_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported P&L CSV successfully!', 'success');
  }

  // --- MODAL UTILITIES ---
  function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
  }

  function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  }

  // --- TOASTS ---
  function showToast(msg, type = 'info') {
    const box = document.getElementById('toastContainer');
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = msg;
    box.appendChild(t);
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transform = 'translateY(10px)';
      t.style.transition = 'all 0.25s ease';
      setTimeout(() => t.remove(), 250);
    }, 2800);
  }

  // --- INITIALIZATION ---
  function init() {
    loadData();

    // Set default date to today
    document.getElementById('inputDate').value = new Date().toISOString().split('T')[0];

    // Apply currency prefixes
    applyCurrency(currency.code, currency.symbol);

    // Live update listeners
    document.getElementById('pnlForm').addEventListener('input', updateLiveSummary);
    document.getElementById('pnlForm').addEventListener('submit', handleFormSubmit);

    // Buttons
    document.getElementById('loadDemoBtn').addEventListener('click', loadSampleNumbers);
    document.getElementById('clearFormBtn').addEventListener('click', clearInputs);
    document.getElementById('cancelEditBtn').addEventListener('click', cancelEdit);
    document.getElementById('exportCsvBtn').addEventListener('click', exportCsv);

    document.getElementById('clearAllHistoryBtn').addEventListener('click', () => {
      if (confirm('Clear all saved daily history?')) {
        records = [];
        saveData();
        renderHistoryTable();
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

    // Initial render
    updateLiveSummary();
    renderHistoryTable();
  }

  // Global app methods for inline onclick
  window.app = {
    editRecord,
    deleteRecord,
    closeModal
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
