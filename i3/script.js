(() => {
  'use strict';

  const STORAGE_KEY = 'learnpro-campaign-planner-v1';
  const BUDGET_ITEMS = [
    { key: 'google', label: 'Google Search Ads', color: '#6957dc', share: 50 },
    { key: 'awareness', label: 'Meta Awareness Ads', color: '#4778e5', share: 20 },
    { key: 'leads', label: 'Meta Lead Generation Ads', color: '#d65d9a', share: 20 },
    { key: 'retargeting', label: 'Retargeting Ads', color: '#20a17d', share: 10 }
  ];
  const SAMPLE_CAMPAIGNS = [
    { id: 'lp-01', name: 'Digital Marketing Course — Search', platform: 'Google Ads', objective: 'Course enquiries', budget: 7500, start: '2026-11-01', end: '2026-11-30', status: 'Planned', kpi: 'Qualified leads', notes: 'High-intent search; India' },
    { id: 'lp-02', name: 'Data Analytics Course — Search', platform: 'Google Ads', objective: 'Course enquiries', budget: 7500, start: '2026-11-01', end: '2026-11-30', status: 'Planned', kpi: 'Qualified leads', notes: 'Skill-intent search; India' },
    { id: 'lp-03', name: 'LearnPro Course Discovery', platform: 'Meta Ads', objective: 'Course awareness', budget: 6000, start: '2026-11-01', end: '2026-11-30', status: 'In review', kpi: 'Reach / video views', notes: 'Reels and feed image' },
    { id: 'lp-04', name: 'Course Enquiry Form', platform: 'Meta Ads', objective: 'Lead generation', budget: 6000, start: '2026-11-01', end: '2026-11-30', status: 'Planned', kpi: 'Qualified leads', notes: 'Consent-aware enquiry form' },
    { id: 'lp-05', name: 'Google Course-Page Return Concept', platform: 'Google Ads', objective: 'Permitted retargeting', budget: 1500, start: '2026-11-01', end: '2026-11-30', status: 'In review', kpi: 'Incremental enquiries', notes: 'Only with consent and eligibility' },
    { id: 'lp-06', name: 'Meta Engaged Audience Concept', platform: 'Meta Ads', objective: 'Permitted retargeting', budget: 1500, start: '2026-11-01', end: '2026-11-30', status: 'In review', kpi: 'Incremental enquiries', notes: 'Subject to consent and platform policies' }
  ];

  const byId = (id) => document.getElementById(id);
  const money = (value, decimals = 0) => new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', minimumFractionDigits: decimals, maximumFractionDigits: decimals
  }).format(Number.isFinite(value) ? value : 0);
  const number = (value) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Number.isFinite(value) ? value : 0);
  const percent = (value) => `${(Number.isFinite(value) ? value : 0).toFixed(2)}%`;
  const safeNumber = (input) => Math.max(0, Number.parseFloat(input?.value) || 0);
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const readCampaigns = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (Array.isArray(parsed) && parsed.every((item) => item && typeof item.id === 'string')) return parsed;
    } catch (error) {
      console.warn('Could not read saved campaign plan; using sample rows.', error);
    }
    return SAMPLE_CAMPAIGNS.map((campaign) => ({ ...campaign }));
  };

  let campaigns = readCampaigns();
  let sortKey = 'start';
  let sortDirection = 1;
  let budgetChart;
  let funnelChart;
  const modalElement = byId('campaignModal');
  const campaignModal = window.bootstrap ? new bootstrap.Modal(modalElement) : null;

  function saveCampaigns() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
    } catch (error) {
      console.warn('Could not save campaign plan to localStorage.', error);
      window.alert('The campaign could not be saved in this browser. Check localStorage availability.');
    }
  }

  function initBudgetTable() {
    byId('budgetRows').innerHTML = BUDGET_ITEMS.map((item) => `
      <tr><td><span class="budget-color" style="--swatch:${item.color}"></span>${escapeHtml(item.label)}</td>
      <td class="text-end"><label class="visually-hidden" for="share-${item.key}">${escapeHtml(item.label)} percentage</label>
      <input class="form-control form-control-sm budget-percent" id="share-${item.key}" type="number" min="0" max="100" step="1" value="${item.share}"></td>
      <td class="text-end fw-semibold" id="amount-${item.key}">${money(0)}</td></tr>`).join('');
    BUDGET_ITEMS.forEach((item) => byId(`share-${item.key}`).addEventListener('input', updateBudget));
    byId('totalBudgetInput').addEventListener('input', updateBudget);
    updateBudget();
  }

  function updateBudget() {
    const total = safeNumber(byId('totalBudgetInput'));
    const shares = BUDGET_ITEMS.map((item) => safeNumber(byId(`share-${item.key}`)));
    const shareTotal = shares.reduce((sum, share) => sum + share, 0);
    const effectiveShares = shareTotal === 0 ? shares.map(() => 1) : shares;
    const denominator = effectiveShares.reduce((sum, share) => sum + share, 0);
    let distributed = 0;
    const amounts = effectiveShares.map((share, index) => {
      if (index === effectiveShares.length - 1) return Math.max(0, total - distributed);
      const amount = Math.round(total * share / denominator);
      distributed += amount;
      return amount;
    });
    amounts.forEach((amount, index) => { byId(`amount-${BUDGET_ITEMS[index].key}`).textContent = money(amount); });
    byId('allocationPercentTotal').textContent = `${shareTotal}%`;
    byId('allocationAmountTotal').textContent = money(amounts.reduce((sum, amount) => sum + amount, 0));
    const validation = byId('budgetValidation');
    validation.classList.toggle('warning', shareTotal !== 100);
    validation.textContent = shareTotal === 100
      ? 'Percentages total 100%; planned amounts match the selected total.'
      : shareTotal === 0
        ? 'All shares are zero; an equal split is shown until you enter percentages.'
        : `Shares total ${shareTotal}%; amounts are proportionally normalized to ${money(total)}.`;

    const googleBudget = amounts[0];
    const metaBudget = amounts[1] + amounts[2];
    byId('summaryTotalBudget').textContent = money(total);
    byId('summaryGoogleBudget').textContent = money(googleBudget);
    byId('summaryMetaBudget').textContent = money(metaBudget);

    const digitalShare = googleBudget / 2;
    const analyticsShare = googleBudget - digitalShare;
    setText('digitalCampaignAllocation', `${money(digitalShare)} planned`);
    setText('analyticsCampaignAllocation', `${money(analyticsShare)} planned`);
    setText('digitalCampaignTotal', money(digitalShare));
    setText('analyticsCampaignTotal', money(analyticsShare));
    setText('digitalCampaignDaily', `${money(digitalShare / 30)}/day`);
    setText('analyticsCampaignDaily', `${money(analyticsShare / 30)}/day`);
    setBudgetDetail('#metaAwareness', amounts[1]);
    setBudgetDetail('#metaLeads', amounts[2]);
    setBudgetDetail('#metaRetarget', amounts[3]);

    if (budgetChart) {
      budgetChart.data.datasets[0].data = amounts;
      budgetChart.update();
    }
  }

  function setText(id, text) {
    const element = byId(id);
    if (element) element.textContent = text;
  }

  function setBudgetDetail(sectionSelector, amount) {
    const section = document.querySelector(sectionSelector);
    const heading = document.querySelector(`[data-bs-target="${sectionSelector}"] .campaign-allocation`);
    if (heading) heading.textContent = `${money(amount)} planned`;
    const detail = section && [...section.querySelectorAll('.campaign-detail-grid > div')]
      .find((item) => item.querySelector('b')?.textContent.startsWith('Budget'));
    if (!detail) return;
    const paragraph = detail.querySelector('p');
    if (sectionSelector === '#metaAwareness') paragraph.textContent = `${money(amount / 30)}/day · ${money(amount)} total · Primary KPI: reach and video-view rate; use landing-page visits as a secondary signal.`;
    if (sectionSelector === '#metaLeads') paragraph.textContent = `${money(amount / 30)}/day · ${money(amount)} total · Primary KPI: qualified leads and CPL; also monitor form completion and lead quality.`;
    if (sectionSelector === '#metaRetarget') paragraph.textContent = `Illustrative share: ${money(amount)} total (about ${money(amount / 30)}/day) within the retargeting pool · Primary KPI: incremental qualified enquiries, subject to audience-size and consent checks.`;
  }

  function createBudgetChart() {
    const canvas = byId('budgetChart');
    if (!canvas || !window.Chart) return;
    budgetChart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: BUDGET_ITEMS.map((item) => item.label),
        datasets: [{ data: BUDGET_ITEMS.map(() => 0), backgroundColor: BUDGET_ITEMS.map((item) => item.color), borderWidth: 0, hoverOffset: 8 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '70%',
        plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, pointStyle: 'circle', padding: 14, boxWidth: 7, font: { family: 'DM Sans', size: 9 } } },
          tooltip: { callbacks: { label: (context) => ` ${context.label}: ${money(Number(context.raw))}` } } }
      }
    });
  }

  function initForecast() {
    const forecastInputs = ['spendInput', 'impressionsInput', 'clicksInput', 'leadsInput', 'enrolmentsInput'];
    forecastInputs.forEach((id) => byId(id).addEventListener('input', updateForecast));
    const canvas = byId('funnelChart');
    if (canvas && window.Chart) {
      funnelChart = new Chart(canvas, {
        type: 'bar',
        data: { labels: ['Impressions', 'Clicks', 'Leads', 'Enrolments'], datasets: [{ data: [], backgroundColor: ['#a89af3', '#6e5bdc', '#4f82e8', '#25a27e'], borderRadius: 6, maxBarThickness: 48 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (context) => ` ${number(Number(context.raw))}` } } },
          scales: { x: { grid: { display: false }, ticks: { color: '#8992a5', font: { family: 'DM Sans', size: 9 } } }, y: { beginAtZero: true, grid: { color: '#eef0f5' }, ticks: { color: '#8992a5', font: { family: 'DM Sans', size: 9 }, callback: (value) => new Intl.NumberFormat('en-IN', { notation: 'compact' }).format(value) } } } }
      });
    }
    updateForecast();
  }

  function updateForecast() {
    const spend = safeNumber(byId('spendInput'));
    const impressions = safeNumber(byId('impressionsInput'));
    const clicks = safeNumber(byId('clicksInput'));
    const leads = safeNumber(byId('leadsInput'));
    const enrolments = safeNumber(byId('enrolmentsInput'));
    const ctr = impressions ? clicks / impressions * 100 : 0;
    const cpc = clicks ? spend / clicks : 0;
    const cpl = leads ? spend / leads : 0;
    const leadCvr = clicks ? leads / clicks * 100 : 0;
    const enrolCvr = leads ? enrolments / leads * 100 : 0;

    setText('forecastCtr', percent(ctr));
    setText('forecastCpc', money(cpc, 2));
    setText('forecastCpl', money(cpl, 2));
    setText('forecastLeadCvr', percent(leadCvr));
    setText('forecastEnrolCvr', percent(enrolCvr));
    setText('forecastImpressions', number(impressions));
    setText('forecastClicks', number(clicks));
    setText('summaryClicks', number(clicks));
    setText('summaryEnrolments', number(enrolments));
    setText('reportImpressions', number(impressions));
    setText('reportClicks', number(clicks));
    setText('reportLeads', number(leads));
    setText('reportEnrolments', number(enrolments));
    if (funnelChart) {
      funnelChart.data.datasets[0].data = [impressions, clicks, leads, enrolments];
      funnelChart.update();
    }
  }

  function dateDisplay(value) {
    if (!value) return '—';
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }).format(date);
  }

  function renderCampaigns() {
    const query = byId('campaignSearch').value.trim().toLowerCase();
    const platform = byId('platformFilter').value;
    const status = byId('statusFilter').value;
    const rows = campaigns.filter((campaign) => {
      const matchesQuery = Object.values(campaign).some((value) => String(value).toLowerCase().includes(query));
      return matchesQuery && (!platform || campaign.platform === platform) && (!status || campaign.status === status);
    }).sort((a, b) => {
      const first = a[sortKey];
      const second = b[sortKey];
      const comparison = typeof first === 'number' && typeof second === 'number'
        ? first - second
        : String(first ?? '').localeCompare(String(second ?? ''), 'en', { numeric: true, sensitivity: 'base' });
      return comparison * sortDirection;
    });
    const tbody = byId('campaignTableBody');
    tbody.innerHTML = rows.map((campaign) => {
      const statusClass = campaign.status === 'Planned' ? 'status-planned' : campaign.status === 'In review' ? 'status-in-review' : 'status-paused';
      return `<tr><td>${escapeHtml(campaign.name)}</td><td>${escapeHtml(campaign.platform)}</td><td>${escapeHtml(campaign.objective)}</td><td>${money(Number(campaign.budget) || 0)}</td><td>${dateDisplay(campaign.start)}</td><td>${dateDisplay(campaign.end)}</td><td><span class="status-pill ${statusClass}">${escapeHtml(campaign.status)}</span></td><td>${escapeHtml(campaign.kpi)}</td><td>${escapeHtml(campaign.notes || '—')}</td><td><div class="action-buttons"><button type="button" class="action-btn" data-action="edit" data-id="${escapeHtml(campaign.id)}" aria-label="Edit ${escapeHtml(campaign.name)}">Edit</button><button type="button" class="action-btn delete" data-action="delete" data-id="${escapeHtml(campaign.id)}" aria-label="Delete ${escapeHtml(campaign.name)}">Delete</button></div></td></tr>`;
    }).join('');
    byId('emptyState').classList.toggle('d-none', rows.length > 0);
    byId('campaignCount').textContent = `${rows.length} ${rows.length === 1 ? 'campaign' : 'campaigns'} shown · ${campaigns.length} saved`;
  }

  function openCampaignForm(campaign = null) {
    byId('campaignForm').reset();
    byId('campaignId').value = campaign?.id || '';
    byId('campaignModalTitle').textContent = campaign ? 'Edit campaign' : 'Add campaign';
    if (campaign) {
      byId('campaignName').value = campaign.name || '';
      byId('campaignPlatform').value = campaign.platform || 'Google Ads';
      byId('campaignObjective').value = campaign.objective || '';
      byId('campaignBudget').value = Number(campaign.budget) || 0;
      byId('campaignStart').value = campaign.start || '';
      byId('campaignEnd').value = campaign.end || '';
      byId('campaignStatus').value = campaign.status || 'Planned';
      byId('campaignKpi').value = campaign.kpi || '';
      byId('campaignNotes').value = campaign.notes || '';
    }
    campaignModal?.show();
  }

  function handleCampaignSubmit(event) {
    event.preventDefault();
    const start = byId('campaignStart').value;
    const end = byId('campaignEnd').value;
    if (end < start) {
      byId('campaignEnd').setCustomValidity('End date must be on or after the start date.');
      byId('campaignEnd').reportValidity();
      byId('campaignEnd').setCustomValidity('');
      return;
    }
    const id = byId('campaignId').value || `lp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const campaign = {
      id,
      name: byId('campaignName').value.trim(),
      platform: byId('campaignPlatform').value,
      objective: byId('campaignObjective').value.trim(),
      budget: safeNumber(byId('campaignBudget')),
      start,
      end,
      status: byId('campaignStatus').value,
      kpi: byId('campaignKpi').value.trim(),
      notes: byId('campaignNotes').value.trim()
    };
    const existingIndex = campaigns.findIndex((item) => item.id === id);
    if (existingIndex >= 0) campaigns[existingIndex] = campaign;
    else campaigns.unshift(campaign);
    saveCampaigns();
    renderCampaigns();
    campaignModal?.hide();
  }

  function handleCampaignTableClick(event) {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const campaign = campaigns.find((item) => item.id === button.dataset.id);
    if (!campaign) return;
    if (button.dataset.action === 'edit') openCampaignForm(campaign);
    if (button.dataset.action === 'delete' && window.confirm(`Delete “${campaign.name}” from this browser's plan?`)) {
      campaigns = campaigns.filter((item) => item.id !== campaign.id);
      saveCampaigns();
      renderCampaigns();
    }
  }

  function csvCell(value) {
    const text = String(value ?? '');
    return `"${text.replace(/"/g, '""')}"`;
  }

  function exportCsv() {
    const headers = ['Campaign name', 'Platform', 'Objective', 'Budget INR', 'Start date', 'End date', 'Status', 'KPI', 'Notes'];
    const lines = [headers, ...campaigns.map((campaign) => [campaign.name, campaign.platform, campaign.objective, Number(campaign.budget) || 0, campaign.start, campaign.end, campaign.status, campaign.kpi, campaign.notes])]
      .map((row) => row.map(csvCell).join(','));
    const blob = new Blob(['\uFEFF', lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'learnpro-campaign-plan.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function initManagement() {
    ['campaignSearch', 'platformFilter', 'statusFilter'].forEach((id) => byId(id).addEventListener(id === 'campaignSearch' ? 'input' : 'change', renderCampaigns));
    document.querySelectorAll('.sort-button').forEach((button) => button.addEventListener('click', () => {
      const nextKey = button.dataset.sort;
      sortDirection = sortKey === nextKey ? sortDirection * -1 : 1;
      sortKey = nextKey;
      renderCampaigns();
    }));
    byId('campaignTableBody').addEventListener('click', handleCampaignTableClick);
    byId('addCampaignBtn').addEventListener('click', () => openCampaignForm());
    byId('campaignForm').addEventListener('submit', handleCampaignSubmit);
    byId('resetCampaignsBtn').addEventListener('click', () => {
      if (!window.confirm('Replace the saved campaign table with the original sample campaign rows?')) return;
      campaigns = SAMPLE_CAMPAIGNS.map((campaign) => ({ ...campaign }));
      saveCampaigns();
      byId('campaignSearch').value = '';
      byId('platformFilter').value = '';
      byId('statusFilter').value = '';
      renderCampaigns();
    });
    byId('exportCsvBtn').addEventListener('click', exportCsv);
    byId('printReportBtn').addEventListener('click', () => window.print());
    renderCampaigns();
  }

  initBudgetTable();
  createBudgetChart();
  updateBudget();
  initForecast();
  initManagement();
})();
