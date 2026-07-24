# 集装箱船期租租金行情看板

> 整合多方权威数据源的集装箱船期租租金(time-charter rate)行情看板,自 **2026年1月** 起,**每日北京时间 12:00 自动更新**,部署于 GitHub Pages。
>
> 🎯 主要用途:**租船决策参考**

## ✨ 功能特性

- 📊 **多源数据整合**:VHBS New ConTex、Alphaliner、Clarkson Research、Braemar、Howe Robinson、Dynamar 等
- 🗓️ **自2026年1月起**的完整历史趋势
- 🚢 **分船型日租金**:1100 / 1800 / 2500 / 2700 / 3500 / 4250 / 5700 / 6500 / 8500 TEU
- 📋 **租船成交案例(Fixtures)**:实际成交价,可搜索/排序,新造船/现代船/老旧船颜色区分
- 📈 **走势图表**:综合指数走势 + 分船型租金对比
- 🕐 **市场事件时间线**:关键事件与市场转折点
- 🔄 **GitHub Actions 自动更新**:每日北京时间 12:00 (UTC 04:00) 自动抓取最新数据
- 🆓 **完全免费**:基于公开渠道数据,无付费订阅依赖

## 📂 数据源权威性分级

| 权威性 | 数据源 | 类型 | 访问 |
|--------|--------|------|------|
| ★★★★★ | VHBS New ConTex | 综合指数+分船型 | 官网公开最近2期 |
| ★★★★★ | Alphaliner (AXSMarine) | 评估价+fixtures+订单簿 | 付费(媒体公开部分) |
| ★★★★★ | Clarkson Research (SIN) | 综合航运市场 | 付费(评论公开) |
| ★★★★ | Howe Robinson HRCI | 综合指数(14船型) | 付费(KSG有历史) |
| ★★★★ | HAX Hamburg Index (VHSS) | 月度矩阵 | 部分PDF免费 |
| ★★★★ | Braemar Shipbrokers | fixtures+市场评论 | 通过媒体免费转载 |
| ★★★★ | Dynamar (DynaLiners Monthly) | 月报 | 样本PDF免费 |
| ★★★★ | Lloyd's List | 新闻+fixtures | 付费 |
| ★★★ | The Loadstar | 新闻+fixtures | 免费 |
| ★★★ | Hellenic Shipping News | 转载New ConTex周报 | 免费 |

## 🚀 部署到 GitHub

### 步骤1: 推送代码到 GitHub 仓库

```bash
git init
git add .
git commit -m "初始化: 集装箱船期租租金行情看板"
git branch -M main
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

### 步骤2: 启用 GitHub Pages

1. 进入仓库 **Settings → Pages**
2. **Source** 选择 **GitHub Actions**(推荐,自动部署)
3. workflow 已配置好,推送到 main 即自动部署

### 步骤3: 启用 GitHub Actions

1. 进入仓库 **Actions** 标签页
2. 若提示,点击 **"I understand my workflows, go ahead and enable them"**
3. 默认每日北京时间 12:00 自动运行

### 步骤4: 手动触发首次更新

1. 进入 **Actions → 每日数据更新**
2. 点击 **Run workflow** 按钮
3. 等待运行完成(约 1-2 分钟)
4. 访问 `https://<你的用户名>.github.io/<仓库名>/`

## 🔧 本地运行

### 抓取数据

```bash
python3 scripts/fetch_data.py
```

### 本地预览

```bash
cd docs
python3 -m http.server 8000
# 浏览器访问 http://localhost:8000
```

## 📁 项目结构

```
.
├── .github/
│   └── workflows/
│       └── daily-update.yml       # GitHub Actions: 每日北京时间12:00更新
├── scripts/
│   ├── fetch_data.py              # 主抓取脚本(多数据源)
│   ├── seed_data.py               # 历史种子数据(2026年1月起)
│   └── requirements.txt
├── docs/                          # GitHub Pages 根目录
│   ├── index.html                 # 主页面
│   ├── css/style.css
│   ├── js/app.js
│   └── data/                      # 自动生成的JSON数据
│       ├── time_series.json
│       ├── fixtures.json
│       └── last_update.json
├── data/                          # 数据备份(同 docs/data)
└── README.md
```

## 🎯 租船决策使用指南

1. **判断市场周期**:看 New ConTex 综合指数(>1500 为高位,< 800 为低位)
2. **查询目标船型租金**:在"分船型日租金"图表选择船型和期限
3. **参考实际成交**:在"成交案例"搜索相似船型/船龄的近期fixtures
4. **对比大型船**:查看 Alphaliner 12个月期租评估(8000+ TEU)
5. **跟踪市场事件**:时间线展示影响租金的关键事件

## ⚠️ 免责声明

- 本看板**仅供租船决策参考**,不构成投资或交易建议
- 数据整合自公开渠道,部分历史数据为基于公开报道的估算,已注明来源
- 完整 New ConTex 历史数据需 VHBS 会员订阅;Alphaliner/Clarkson 为付费数据
- **实际租船成交以经纪商确认数据为准**,本看板不承担任何交易损失责任
- 数据自动更新可能因网络或源站变更而失败,请以原始数据源为准

## 📜 许可

MIT License — 数据版权归各原始数据源所有,代码可自由使用。

## 🙏 致谢

数据来源(按权威性):
- [VHBS New ConTex](https://www.vhbs.de/index.php?id=28) — 汉堡不莱梅船舶经纪人协会
- [Alphaliner](https://www.axsmarine.com/alphaliner) — AXSMarine
- [Clarkson Research](https://sin.clarksons.net/) — Shipping Intelligence Network
- [The Loadstar](https://theloadstar.com/) — 转载Braemar fixtures
- [Lloyd's List](https://www.lloydslist.com/) — 百年航运媒体
- [Dynamar](https://dynamar.com/) — DynaLiners Monthly
- [Hellenic Shipping News](https://www.hellenicshippingnews.com/) — 转载New ConTex周报
