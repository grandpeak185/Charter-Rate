/* ====================================================================
 * 集装箱船期租租金行情看板 - 前端逻辑
 * 数据源: data/time_series.json, data/fixtures.json, data/last_update.json
 * ==================================================================== */

const COLORS = {
    vhbs: '#2b6cb0',
    alphaliner: '#6b46c1',
    clarkson: '#3182ce',
    braemar: '#dd6b20',
    success: '#38a169',
    warning: '#d69e2e',
    danger: '#e53e3e',
    muted: '#a0aec0',
};

const SHIP_TYPE_COLORS = {
    '1100': '#dd6b20',
    '1700': '#805ad5',
    '1800': '#9f7aea',
    '2500': '#38a169',
    '2700': '#d69e2e',
    '3500': '#2b6cb0',
    '4250': '#e53e3e',
    '5700': '#319795',
    '6500': '#b83280',
    '8500': '#2d3748',
};

const PERIOD_LABELS = {
    '6m': '6个月期',
    '12m': '12个月期',
    '24m': '24个月期',
};

const PERIOD_COLORS = {
    '6m': '#9f7aea',
    '12m': '#38a169',
    '24m': '#e53e3e',
};

let state = {
    timeSeries: null,
    fixtures: null,
    meta: null,
    selectedTypes: new Set(),
    selectedPeriods: new Set(),
    contexChart: null,
    ratesChart: null,
};

function fmt(num, decimals = 0) {
    if (num === null || num === undefined || isNaN(num)) return '—';
    return Number(num).toLocaleString('en-US', { maximumFractionDigits: decimals });
}

function fmtDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function daysBetween(d1, d2) {
    return Math.round((new Date(d2) - new Date(d1)) / 86400000);
}

async function loadData() {
    const tsResp = await fetch('data/time_series.json');
    const fxResp = await fetch('data/fixtures.json');
    const metaResp = await fetch('data/last_update.json');
    state.timeSeries = await tsResp.json();
    state.fixtures = await fxResp.json();
    state.meta = await metaResp.json();
}

function renderUpdateInfo() {
    const el = document.getElementById('updateInfo');
    const m = state.meta;
    const status = m.fetch_status || {};
    const vhbsStatus = status.vhbs_newcontex || {};
    const fetched = vhbsStatus.fetched || 0;

    el.innerHTML = `
        <div class="update-time">⏱ ${m.last_update_bjt}</div>
        <div class="update-source">
            抓取状态: VHBS ${vhbsStatus.status || '—'} (${fetched}期)
            ${fetched > 0 ? '✓' : '⚠'}
        </div>
    `;
}

function renderOverview() {
    const grid = document.getElementById('overviewGrid');
    const ts = state.timeSeries;

    const contexData = ts.contex_index.filter(d => d.index !== null);
    const latestContex = contexData[contexData.length - 1];
    const prevContex = contexData[contexData.length - 2];
    const contexChange = (latestContex && prevContex)
        ? latestContex.index - prevContex.index : null;
    const contexChangePct = (contexChange !== null && prevContex.index)
        ? (contexChange / prevContex.index * 100) : null;

    const latestRates = ts.rates_by_type[ts.rates_by_type.length - 1];

    const alphaLatest = ts.alphaliner_assessments.find(a => a.teu === 8500);
    const alphaMid = ts.alphaliner_assessments.find(a => a.teu === 5600);

    const clarkLatest = ts.clarksons_reference.find(c => c.rate !== null && c.desc.includes('1年期'));

    const cards = [];

    if (latestContex) {
        const changeClass = contexChange > 0 ? 'up' : contexChange < 0 ? 'down' : 'flat';
        const changeIcon = contexChange > 0 ? '▲' : contexChange < 0 ? '▼' : '—';
        cards.push({
            cls: 'vhbs',
            label: 'New ConTex 指数 (最新)',
            value: latestContex.index,
            sub: `${fmtDate(latestContex.date)} · ${latestContex.source}`,
            change: contexChange !== null
                ? `<div class="card-change ${changeClass}">${changeIcon} ${contexChange > 0 ? '+' : ''}${contexChange} (${contexChangePct > 0 ? '+' : ''}${contexChangePct.toFixed(1)}%)</div>`
                : ''
        });
    }

    const midRate = latestRates && latestRates.rates['3500_12m'];
    if (midRate) {
        cards.push({
            cls: 'vhbs',
            label: '3500 TEU 12月期租',
            value: '$' + fmt(midRate),
            sub: `${fmtDate(latestRates.date)} · ${latestRates.source}`,
            change: '<div class="card-change flat">主力船型基准</div>'
        });
    }

    if (alphaLatest) {
        cards.push({
            cls: 'alphaliner',
            label: 'Alphaliner 8500 TEU 12月期租',
            value: '$' + fmt(alphaLatest.rate),
            sub: `${fmtDate(alphaLatest.date)} · ${alphaLatest.source.split('(')[0].trim()}`,
            change: '<div class="card-change up">大型船基准</div>'
        });
    }

    if (clarkLatest) {
        cards.push({
            cls: 'clarkson',
            label: '1年期TC混合参考价',
            value: '$' + fmt(clarkLatest.rate),
            sub: `${fmtDate(clarkLatest.date)} · ${clarkLatest.source.split('(')[0].trim()}`,
            change: '<div class="card-change up">10年均值2.35万 → 当前高位</div>'
        });
    }

    if (state.fixtures) {
        const recent = state.fixtures.filter(f =>
            daysBetween(f.date, '2026-07-24') <= 90
        );
        cards.push({
            cls: 'braemar',
            label: '近3个月成交案例',
            value: fmt(recent.length) + ' 笔',
            sub: '可点击下方"成交案例"查看明细',
            change: '<div class="card-change flat">租船谈判参考</div>'
        });
    }

    grid.innerHTML = cards.map(c => `
        <div class="card ${c.cls}">
            <div class="card-label">${c.label}</div>
            <div class="card-value">${c.value}</div>
            <div class="card-sub">${c.sub}</div>
            ${c.change}
        </div>
    `).join('');
}

function renderContexChart() {
    const ctx = document.getElementById('contexChart').getContext('2d');
    const data = state.timeSeries.contex_index.filter(d => d.index !== null);

    const estimatedPoints = [];
    const actualPoints = [];

    data.forEach(d => {
        const point = { x: d.date, y: d.index };
        if (d.source && d.source.includes('估算')) {
            estimatedPoints.push(point);
        } else {
            actualPoints.push(point);
        }
    });

    state.contexChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: '实际报道数据',
                    data: actualPoints,
                    borderColor: COLORS.vhbs,
                    backgroundColor: COLORS.vhbs + '20',
                    borderWidth: 2.5,
                    fill: true,
                    tension: 0.25,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: COLORS.vhbs,
                },
                {
                    label: '估算数据点(基于趋势)',
                    data: estimatedPoints,
                    borderColor: COLORS.muted,
                    borderWidth: 1.5,
                    borderDash: [4, 4],
                    fill: false,
                    tension: 0.25,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    pointBackgroundColor: COLORS.muted,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    position: 'top',
                    labels: { font: { size: 12 }, usePointStyle: true }
                },
                tooltip: {
                    callbacks: {
                        title: (items) => fmtDate(items[0].parsed.x),
                        label: (ctx) => {
                            const d = data.find(x => x.date === ctx.parsed.x);
                            return [`ConTex 指数: ${ctx.parsed.y}`, `来源: ${d ? d.source : '—'}`];
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: { unit: 'week', displayFormats: { week: 'MM/dd' } },
                    title: { display: true, text: '日期' }
                },
                y: {
                    title: { display: true, text: '指数点' },
                    min: 1450
                }
            }
        }
    });
}

function renderCombinationFilters() {
    const allTypes = ['1100', '1700', '1800', '2500', '2700', '3500', '4250', '5700', '6500'];
    const allPeriods = ['6m', '12m', '24m'];

    const typeContainer = document.getElementById('shipTypeFilters');
    const periodContainer = document.getElementById('periodFilters');

    typeContainer.innerHTML = allTypes.map(t => {
        const color = SHIP_TYPE_COLORS[t] || COLORS.muted;
        const isActive = state.selectedTypes.has(t);
        return `
            <div class="ship-type-chip ${isActive ? 'active' : ''}" data-type="${t}">
                <span class="color-dot" style="background:${color}"></span>
                ${t} TEU
            </div>
        `;
    }).join('');

    periodContainer.innerHTML = allPeriods.map(p => {
        const color = PERIOD_COLORS[p];
        const isActive = state.selectedPeriods.has(p);
        return `
            <div class="period-chip ${isActive ? 'active' : ''}" data-period="${p}" style="--period-color:${color}">
                ${PERIOD_LABELS[p]}
            </div>
        `;
    }).join('');

    typeContainer.querySelectorAll('.ship-type-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const teu = chip.dataset.type;
            if (state.selectedTypes.has(teu)) {
                state.selectedTypes.delete(teu);
                chip.classList.remove('active');
            } else {
                state.selectedTypes.add(teu);
                chip.classList.add('active');
            }
            updateFilterUI();
            renderRatesChart();
        });
    });

    periodContainer.querySelectorAll('.period-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const p = chip.dataset.period;
            if (state.selectedPeriods.has(p)) {
                state.selectedPeriods.delete(p);
                chip.classList.remove('active');
            } else {
                state.selectedPeriods.add(p);
                chip.classList.add('active');
            }
            updateFilterUI();
            renderRatesChart();
        });
    });

    const clearBtn = document.getElementById('clearFilters');
    clearBtn.addEventListener('click', () => {
        state.selectedTypes.clear();
        state.selectedPeriods.clear();
        updateFilterUI();
        renderRatesChart();
    });

    function updateFilterUI() {
        typeContainer.querySelectorAll('.ship-type-chip').forEach(chip => {
            const teu = chip.dataset.type;
            chip.classList.toggle('active', state.selectedTypes.has(teu));
        });

        periodContainer.querySelectorAll('.period-chip').forEach(chip => {
            const p = chip.dataset.period;
            chip.classList.toggle('active', state.selectedPeriods.has(p));
        });

        const selectedCount = state.selectedTypes.size * state.selectedPeriods.size;
        clearBtn.style.display = selectedCount > 0 ? 'inline-block' : 'none';
    }
}

function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    toast.style.cssText = 'position:fixed;top:20px;right:20px;padding:12px 24px;background:#2d3748;color:white;border-radius:8px;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.3);animation:slideIn 0.3s ease;';
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

function renderRatesChart() {
    const ctx = document.getElementById('ratesChart').getContext('2d');
    const allSnapshots = state.timeSeries.rates_by_type;

    const combinations = [];
    state.selectedTypes.forEach(teu => {
        state.selectedPeriods.forEach(p => {
            combinations.push(`${teu}_${p}`);
        });
    });

    if (combinations.length === 0) {
        if (state.ratesChart) {
            state.ratesChart.destroy();
            state.ratesChart = null;
        }
        const chartContainer = document.querySelector('#ratesChart').parentElement;
        let hint = chartContainer.querySelector('.no-data-hint');
        if (!hint) {
            hint = document.createElement('div');
            hint.className = 'no-data-hint';
            hint.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#718096;font-size:14px;text-align:center;';
            chartContainer.style.position = 'relative';
            chartContainer.appendChild(hint);
        }
        hint.innerHTML = '👆 请选择船型和期限的组合';
        return;
    }

    const chartContainer = document.querySelector('#ratesChart').parentElement;
    const existingHint = chartContainer.querySelector('.no-data-hint');
    if (existingHint) existingHint.remove();

    const datasets = combinations.map(combo => {
        const [teu, period] = combo.split('_');
        const baseColor = SHIP_TYPE_COLORS[teu] || COLORS.muted;
        const color = period === '6m' ? baseColor + 'CC' : period === '12m' ? baseColor : baseColor + '88';

        const label = `${teu} TEU · ${PERIOD_LABELS[period]}`;

        const data = [];
        allSnapshots.forEach(snap => {
            const r = snap.rates[combo];
            if (r !== undefined && r !== null) {
                data.push({ x: snap.date, y: r, source: snap.source });
            }
        });

        return {
            label,
            data,
            borderColor: color,
            backgroundColor: color + '20',
            borderWidth: period === '12m' ? 3 : 2,
            borderDash: period === '6m' ? [6, 4] : [],
            fill: false,
            tension: 0.3,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: color,
            spanGaps: true,
        };
    }).filter(d => d.data.length > 0);

    if (state.ratesChart) state.ratesChart.destroy();

    state.ratesChart = new Chart(ctx, {
        type: 'line',
        data: { datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    position: 'top',
                    labels: { font: { size: 12 }, usePointStyle: true, boxWidth: 10 }
                },
                tooltip: {
                    callbacks: {
                        title: (items) => fmtDate(items[0].parsed.x),
                        label: (ctx) => {
                            const d = ctx.dataset.data[ctx.dataIndex];
                            return [`${ctx.dataset.label}: $${fmt(ctx.parsed.y)}/天`, `来源: ${d.source}`];
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: { unit: 'month', displayFormats: { month: 'yyyy-MM' } },
                    title: { display: true, text: '日期' }
                },
                y: {
                    title: { display: true, text: 'USD/天' },
                    ticks: {
                        callback: (v) => '$' + fmt(v)
                    }
                }
            }
        }
    });
}

function renderAlphalinerTable() {
    const tbody = document.querySelector('#alphalinerTable tbody');
    const rows = state.timeSeries.alphaliner_assessments;

    tbody.innerHTML = rows.map(r => `
        <tr>
            <td>${fmtDate(r.date)}</td>
            <td><strong>${fmt(r.teu)} TEU</strong></td>
            <td>${PERIOD_LABELS[r.period] || r.period}</td>
            <td class="num">$${fmt(r.rate)}/天</td>
            <td class="source-cell">${r.source}</td>
        </tr>
    `).join('');
}

function renderClarksonsTable() {
    const tbody = document.querySelector('#clarksonsTable tbody');
    const rows = state.timeSeries.clarksons_reference;

    tbody.innerHTML = rows.map(r => `
        <tr>
            <td>${fmtDate(r.date)}</td>
            <td>${r.desc}</td>
            <td>${r.period === 'avg' ? '历史均值' : PERIOD_LABELS[r.period] || r.period}</td>
            <td class="num">${r.rate !== null ? '$' + fmt(r.rate) + '/天' : '— (历史最高,非疫情期间)'}</td>
            <td class="source-cell">${r.source}</td>
        </tr>
    `).join('');
}

function renderFixturesTable() {
    const tbody = document.querySelector('#fixturesTable tbody');
    let rows = [...state.fixtures];

    const q = document.getElementById('fixtureSearch').value.trim().toLowerCase();
    if (q) {
        rows = rows.filter(f =>
            (f.vessel || '').toLowerCase().includes(q) ||
            (f.charterer || '').toLowerCase().includes(q) ||
            String(f.teu || '').includes(q)
        );
    }

    const sortBy = document.getElementById('fixtureSort').value;
    rows.sort((a, b) => {
        switch (sortBy) {
            case 'date-desc': return b.date.localeCompare(a.date);
            case 'date-asc': return a.date.localeCompare(b.date);
            case 'rate-desc': return (b.rate || 0) - (a.rate || 0);
            case 'rate-asc': return (a.rate || 0) - (b.rate || 0);
            case 'teu-desc': return (b.teu || 0) - (a.teu || 0);
            default: return 0;
        }
    });

    if (rows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:24px">未找到匹配记录</td></tr>';
        return;
    }

    tbody.innerHTML = rows.map(f => {
        let rowClass = '';
        if (f.vessel && f.vessel.includes('新造船')) rowClass = 'row-newbuild';
        else if (f.built && f.built >= 2015) rowClass = 'row-modern';
        else if (f.built && f.built < 2010) rowClass = 'row-old';

        return `
            <tr class="${rowClass}">
                <td>${fmtDate(f.date)}</td>
                <td><strong>${f.vessel || '—'}</strong></td>
                <td>${f.teu ? fmt(f.teu) + ' TEU' : '—'}</td>
                <td>${f.built || '—'}</td>
                <td>${f.charterer || '—'}</td>
                <td>${f.period || '—'}</td>
                <td class="num">$${fmt(f.rate)}/天</td>
                <td class="source-cell">${f.source}</td>
            </tr>
        `;
    }).join('');
}

function renderTimeline() {
    const container = document.getElementById('timeline');
    const events = state.timeSeries.market_events || [];

    container.innerHTML = events.map(e => `
        <div class="timeline-item">
            <div class="tl-date">${fmtDate(e.date)}</div>
            <div class="tl-text"><strong>${e.title}</strong>: ${e.desc}</div>
        </div>
    `).join('');
}

function renderSourcesTable() {
    const tbody = document.querySelector('#sourcesTable tbody');
    const sources = state.meta.data_sources || [];

    function tierClass(auth) {
        if (auth.includes('★★★★★')) return 'tier1';
        if (auth.includes('★★★★')) return 'tier2';
        return 'tier3';
    }

    tbody.innerHTML = sources.map(s => `
        <tr>
            <td><strong>${s.name}</strong><br><span class="source-cell">${s.full_name}</span></td>
            <td>${s.type}</td>
            <td>${s.frequency}</td>
            <td>${s.access}<br><a href="${s.url}" target="_blank" rel="noopener" class="source-cell">访问 ↗</a></td>
            <td class="auth ${tierClass(s.authority)}">${s.authority}</td>
            <td class="source-cell">${s.note}</td>
        </tr>
    `).join('');
}

async function init() {
    try {
        await loadData();
        renderUpdateInfo();
        renderOverview();
        renderContexChart();
        renderCombinationFilters();
        renderRatesChart();
        renderAlphalinerTable();
        renderClarksonsTable();
        renderFixturesTable();
        renderTimeline();
        renderSourcesTable();

        document.getElementById('fixtureSearch').addEventListener('input', renderFixturesTable);
        document.getElementById('fixtureSort').addEventListener('change', renderFixturesTable);
    } catch (err) {
        console.error('初始化失败:', err);
        document.querySelector('.loading-card').innerHTML = `❌ 数据加载失败: ${err.message}`;
    }
}

document.addEventListener('DOMContentLoaded', init);
