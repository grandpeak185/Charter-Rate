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

// 船型颜色调色板(3500/4250 为主力船型,冷暖对比更明显)
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

// 全局状态
let state = {
    timeSeries: null,
    fixtures: null,
    meta: null,
    activeShipTypes: new Set(),  // 默认不选中，用户手动选择后才显示
    period: 'default',
    contexChart: null,
    ratesChart: null,
};

// ============ 工具函数 ============
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

// ============ 数据加载 ============
async function loadData() {
    const tsResp = await fetch('data/time_series.json');
    const fxResp = await fetch('data/fixtures.json');
    const metaResp = await fetch('data/last_update.json');
    state.timeSeries = await tsResp.json();
    state.fixtures = await fxResp.json();
    state.meta = await metaResp.json();
}

// ============ 更新信息 ============
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

// ============ 概览卡片 ============
function renderOverview() {
    const grid = document.getElementById('overviewGrid');
    const ts = state.timeSeries;

    // 最新 ConTex 指数
    const contexData = ts.contex_index.filter(d => d.index !== null);
    const latestContex = contexData[contexData.length - 1];
    const prevContex = contexData[contexData.length - 2];
    const contexChange = (latestContex && prevContex)
        ? latestContex.index - prevContex.index : null;
    const contexChangePct = (contexChange !== null && prevContex.index)
        ? (contexChange / prevContex.index * 100) : null;

    // 最新分船型数据
    const latestRates = ts.rates_by_type[ts.rates_by_type.length - 1];
    const midRate = latestRates && latestRates.rates['2700'];

    // Alphaliner 8500 TEU
    const alphaLatest = ts.alphaliner_assessments.find(a => a.teu === 8500);
    const alphaMid = ts.alphaliner_assessments.find(a => a.teu === 5600);

    // Clarksons 参考
    const clarkLatest = ts.clarksons_reference.find(c => c.rate !== null && c.desc.includes('1年期'));

    const cards = [];

    // 卡1: New ConTex 指数
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

    // 卡2: 2700 TEU 12月期租(中等船型代表)
    if (midRate) {
        cards.push({
            cls: 'vhbs',
            label: '2700 TEU 12月期租',
            value: '$' + fmt(midRate),
            sub: `${fmtDate(latestRates.date)} · ${latestRates.source}`,
            change: '<div class="card-change flat">中等船型基准</div>'
        });
    }

    // 卡3: Alphaliner 8500 TEU
    if (alphaLatest) {
        cards.push({
            cls: 'alphaliner',
            label: 'Alphaliner 8500 TEU 12月期租',
            value: '$' + fmt(alphaLatest.rate),
            sub: `${fmtDate(alphaLatest.date)} · ${alphaLatest.source.split('(')[0].trim()}`,
            change: '<div class="card-change up">大型船基准</div>'
        });
    }

    // 卡4: 1年期TC混合参考
    if (clarkLatest) {
        cards.push({
            cls: 'clarkson',
            label: '1年期TC混合参考价',
            value: '$' + fmt(clarkLatest.rate),
            sub: `${fmtDate(clarkLatest.date)} · ${clarkLatest.source.split('(')[0].trim()}`,
            change: '<div class="card-change up">10年均值2.35万 → 当前高位</div>'
        });
    }

    // 卡5: Fixtures 数量
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

// ============ New ConTex 指数图表 ============
function renderContexChart() {
    const ctx = document.getElementById('contexChart').getContext('2d');
    const data = state.timeSeries.contex_index.filter(d => d.index !== null);

    // 标注来源:估算 vs 实际
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

// ============ 船型筛选器 ============
function renderShipTypeFilters() {
    const container = document.getElementById('shipTypeFilters');
    const allTypes = ['1100', '1700', '1800', '2500', '2700', '3500', '4250', '5700', '6500'];

    container.innerHTML = allTypes.map(t => {
        const isActive = state.activeShipTypes.has(t);
        const color = SHIP_TYPE_COLORS[t] || COLORS.muted;
        return `
            <div class="ship-type-chip ${isActive ? 'active' : ''}" data-type="${t}">
                <span class="color-dot" style="background:${color}"></span>
                ${t} TEU
            </div>
        `;
    }).join('');

    container.querySelectorAll('.ship-type-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const t = chip.dataset.type;
            if (state.activeShipTypes.has(t)) {
                state.activeShipTypes.delete(t);
                chip.classList.remove('active');
            } else {
                state.activeShipTypes.add(t);
                chip.classList.add('active');
            }
            renderRatesChart();
        });
    });

    document.getElementById('periodSelect').addEventListener('change', (e) => {
        state.period = e.target.value;
        renderRatesChart();
    });
}

// ============ 分船型日租金图表 ============
function renderRatesChart() {
    const ctx = document.getElementById('ratesChart').getContext('2d');
    const allSnapshots = state.timeSeries.rates_by_type;

    // 确定要显示的船型(根据期限筛选)
    let typesToShow;
    if (state.period === '6m') {
        // 6个月期：固定显示1100/1800
        typesToShow = ['1100', '1800'];
    } else if (state.period === '12m') {
        // 12个月期：固定显示2500/2700/3500/4250
        typesToShow = ['2500', '2700', '3500', '4250'];
    } else if (state.period === '24m') {
        // 24个月期：固定显示大船
        typesToShow = ['2500_24m', '2700_24m', '3500_24m', '4250_24m', '5700_24m', '6500_24m'];
    } else {
        // default 模式：只显示用户在筛选器中选中的船型
        typesToShow = Array.from(state.activeShipTypes);
        // 过滤掉带后缀的（default模式下只显示主船型）
        typesToShow = typesToShow.filter(t => !t.includes('_'));
    }

    // 如果没有任何选中的船型，显示友好提示
    if (typesToShow.length === 0) {
        if (state.ratesChart) {
            state.ratesChart.destroy();
            state.ratesChart = null;
        }
        // 在 canvas 上方或旁边显示提示
        const chartContainer = document.querySelector('#ratesChart').parentElement;
        let hint = chartContainer.querySelector('.no-data-hint');
        if (!hint) {
            hint = document.createElement('div');
            hint.className = 'no-data-hint';
            hint.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#718096;font-size:14px;text-align:center;';
            chartContainer.style.position = 'relative';
            chartContainer.appendChild(hint);
        }
        hint.innerHTML = '👆 请在上方选择船型，或切换期限以查看对应数据';
        return;
    }

    // 移除提示（如果存在）
    const chartContainer = document.querySelector('#ratesChart').parentElement;
    const existingHint = chartContainer.querySelector('.no-data-hint');
    if (existingHint) existingHint.remove();

    // 构建每个船型的数据序列
    const datasets = typesToShow.map(t => {
        const color = SHIP_TYPE_COLORS[t.replace('_24m', '').replace('_12m', '')] || COLORS.muted;
        const label = t.includes('_24m')
            ? t.replace('_24m', '') + ' TEU (24m期)'
            : t.includes('_12m')
                ? t.replace('_12m', '') + ' TEU (12m期)'
                : t + ' TEU';

        const data = [];
        allSnapshots.forEach(snap => {
            const r = snap.rates[t];
            if (r !== undefined && r !== null) {
                data.push({ x: snap.date, y: r, source: snap.source });
            }
        });

        return {
            label,
            data,
            borderColor: color,
            backgroundColor: color + '20',
            borderWidth: 2.5,
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

// ============ Alphaliner 表 ============
function renderAlphalinerTable() {
    const tbody = document.querySelector('#alphalinerTable tbody');
    const rows = state.timeSeries.alphaliner_assessments;

    tbody.innerHTML = rows.map(r => `
        <tr>
            <td>${fmtDate(r.date)}</td>
            <td><strong>${fmt(r.teu)} TEU</strong></td>
            <td class="num">$${fmt(r.rate)}/天</td>
            <td class="source-cell">${r.source}</td>
        </tr>
    `).join('');
}

// ============ Clarksons 表 ============
function renderClarksonsTable() {
    const tbody = document.querySelector('#clarksonsTable tbody');
    const rows = state.timeSeries.clarksons_reference;

    tbody.innerHTML = rows.map(r => `
        <tr>
            <td>${fmtDate(r.date)}</td>
            <td>${r.desc}</td>
            <td class="num">${r.rate !== null ? '$' + fmt(r.rate) + '/天' : '— (历史最高,非疫情期间)'}</td>
            <td class="source-cell">${r.source}</td>
        </tr>
    `).join('');
}

// ============ Fixtures 表 ============
function renderFixturesTable() {
    const tbody = document.querySelector('#fixturesTable tbody');
    let rows = [...state.fixtures];

    // 搜索
    const q = document.getElementById('fixtureSearch').value.trim().toLowerCase();
    if (q) {
        rows = rows.filter(f =>
            (f.vessel || '').toLowerCase().includes(q) ||
            (f.charterer || '').toLowerCase().includes(q) ||
            String(f.teu || '').includes(q)
        );
    }

    // 排序
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
        // 行样式: 新造船/现代船/老旧船
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

// ============ 时间线 ============
function renderTimeline() {
    const container = document.getElementById('timeline');
    const events = state.meta.market_events || [];

    container.innerHTML = events.map(e => `
        <div class="timeline-item">
            <div class="tl-date">${fmtDate(e[0])}</div>
            <div class="tl-text">${e[1]}</div>
        </div>
    `).join('');
}

// ============ 数据源表 ============
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

// ============ 初始化 ============
async function init() {
    try {
        await loadData();
        renderUpdateInfo();
        renderOverview();
        renderContexChart();
        renderShipTypeFilters();
        renderRatesChart();
        renderAlphalinerTable();
        renderClarksonsTable();
        renderFixturesTable();
        renderTimeline();
        renderSourcesTable();

        // fixtures 搜索/排序事件
        document.getElementById('fixtureSearch').addEventListener('input', renderFixturesTable);
        document.getElementById('fixtureSort').addEventListener('change', renderFixturesTable);
    } catch (err) {
        console.error('初始化失败:', err);
        document.querySelector('.loading-card').innerHTML = `❌ 数据加载失败: ${err.message}`;
    }
}

document.addEventListener('DOMContentLoaded', init);
