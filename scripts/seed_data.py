# -*- coding: utf-8 -*-
"""
历史种子数据（2026年1月起）

来源：VHBS New ConTex官网公开数据、Dynamar月报样本、Hellenic Shipping News转载、
     The Loadstar、Lloyd's List、Alphaliner Newsletter、Clarkson Research公开评论

说明：完整历史数据需VHBS会员订阅，此处整理自公开渠道的关键时点数据，
     用于网页历史趋势展示与租船决策参考。所有数据均注明来源。
"""

# New ConTex 综合指数周度历史（来自Hellenic Shipping News转载 + VHBS官网）
NEWCONTEX_INDEX_HISTORY = [
    # (周次日期, 指数点, 来源)
    ("2026-01-08", 1480, "估算（基于月报趋势）"),
    ("2026-01-15", 1483, "估算（基于月报趋势）"),
    ("2026-01-22", 1485, "估算（基于月报趋势）"),
    ("2026-01-29", 1487, "估算（基于月报趋势）"),
    ("2026-02-05", 1488, "估算（基于月报趋势）"),
    ("2026-02-12", 1487, "Hellenic Shipping News (SeaNews引用)"),
    ("2026-02-19", 1487, "SeaNews报道 (New ConTex 2026-02-19)"),
    ("2026-02-26", 1490, "估算（基于月报趋势）"),
    ("2026-03-05", 1493, "估算（基于月报趋势）"),
    ("2026-03-12", 1495, "估算（基于月报趋势）"),
    ("2026-03-19", 1498, "估算（基于月报趋势）"),
    ("2026-03-26", 1500, "估算（基于月报趋势）"),
    ("2026-04-02", 1502, "估算（基于月报趋势）"),
    ("2026-04-10", 1505, "Hellenic Shipping News Week 15"),
    ("2026-04-17", 1510, "Hellenic Shipping News Week 16"),
    ("2026-04-24", 1515, "Hellenic Shipping News Week 17"),
    ("2026-05-01", 1520, "估算（基于月报趋势）"),
    ("2026-05-08", 1525, "估算（基于月报趋势）"),
    ("2026-05-15", 1532, "估算（基于月报趋势）"),
    ("2026-05-22", 1540, "估算（基于月报趋势）"),
    ("2026-05-29", 1548, "估算（基于月报趋势）"),
    ("2026-06-05", 1555, "估算（基于月报趋势）"),
    ("2026-06-12", 1562, "估算（基于月报趋势）"),
    ("2026-06-19", 1568, "估算（基于月报趋势）"),
    ("2026-06-26", 1573, "估算（基于月报趋势）"),
    ("2026-07-03", 1576, "估算（基于月报趋势）"),
    ("2026-07-11", 1580, "Hellenic Shipping News Week 28"),
    ("2026-07-16", 1585, "VHBS官网（2026-07-16）"),
    ("2026-07-21", 1588, "VHBS官网（2026-07-21）"),
]

# New ConTex 各船型日租金（美元/天）— 关键时点快照
# 来源：Dynamar Monthly Feb 2026 样本(Jan-26) + VHBS官网(Jul-26)
NEWCONTEX_RATES_HISTORY = [
    # (日期, {船型: 金额}, 期限, 来源)
    ("2026-01-15", {
        "1100": 15986, "1700": 30268, "2500": 33955, "2700": 35768,
        "3500": 40725, "4250": 50115, "5700": 50115, "6500": 50115
    }, "6mo/12mo", "Dynamar Monthly Feb 2026 (引用New ConTex Jan-26)"),
    ("2026-07-16", {
        "1100": 18018, "1800": 35268, "2500": 34975, "2700": 37180,
        "3500": 43365, "4250": 57094, "5700": 50719, "6500": 56472
    }, "6mo/12mo", "VHBS官网（2026-07-16）"),
    ("2026-07-21", {
        "1100": 17959, "1800": 35575, "2500": 35068, "2700": 37341,
        "3500": 43329, "4250": 57220, "5700": 50806, "6500": 56558
    }, "6mo/12mo", "VHBS官网（2026-07-21）"),
]

# Alphaliner 12个月期租评估价（来自xindemarinenews 2026-07-10报道，引用Alphaliner late-June assessment）
ALPHALINER_ASSESSMENTS = [
    # (日期, 船型TEU, 12个月期租USD/天, 来源)
    ("2026-06-30", 8500, 76000, "Alphaliner late-June assessment (via xindemarinenews)"),
    ("2026-06-30", 5600, 64000, "Alphaliner late-June assessment (via xindemarinenews)"),
    ("2026-06-30", 4000, 55000, "Alphaliner late-June assessment (via xindemarinenews)"),
    ("2026-06-30", 2500, 35000, "Alphaliner late-June assessment (via xindemarinenews)"),
    ("2026-06-30", 1800, 33000, "Alphaliner late-June assessment (via xindemarinenews)"),
]

# Clarksons 1年期TC混合参考价（来自Euroseas Q1 2026财报会议）
CLARKSONS_REFERENCE = [
    # (日期, 描述, USD/天, 来源)
    ("2026-05-15", "1年期TC混合参考价(集装箱船)", 37000, "Euroseas Q1 2026财报会议引用"),
    ("2026-05-15", "10年历史均值", 23500, "Euroseas Q1 2026财报会议引用"),
    ("2026-05-15", "10年中位数", 15000, "Euroseas Q1 2026财报会议引用"),
    ("2026-06-30", "集装箱船期租租金(非疫情期间最高)", None, "Clarksons Research 2026上半年回顾"),
]

# 实际租船成交案例（fixtures）— 来自公开媒体报道
FIXTURES_HISTORY = [
    # (成交日期, 船名, 船型TEU, 建造年, 租家, 期限, USD/天, 来源)
    ("2026-02-10", "Pavo J", 962, None, "Unifeeder", "12个月", 16900, "Lloyd's List 2026-02-10"),
    ("2026-02-15", "Cosco 5艘现代船(批量)", 2400, None, "Cosco(延期)", "30-34个月", 25000, "Lloyd's List 2026-02-10 (Braemar)"),
    ("2026-02-15", "Santa Loukia", 1700, 2015, "BG Freight", "12个月", 30000, "Dynamar Monthly Feb 2026"),
    ("2026-02-15", "Contship Sky", 1100, 2006, "CFS", "5-7个月", 17250, "Dynamar Monthly Feb 2026"),
    ("2026-02-15", "CMA CGM Port Gdynia", 3100, 2011, "CMA CGM(延期)", "30-36个月", 30000, "Dynamar Monthly Feb 2026"),
    ("2026-02-15", "Magdalena Schulte", 2300, 2019, "CMA CGM(延期)", "35-37个月", 25000, "Dynamar Monthly Feb 2026"),
    ("2026-02-15", "Melchior Schulte", 2300, 2015, "CMA CGM", "36个月", 25000, "Dynamar Monthly Feb 2026"),
    ("2026-02-15", "Teoman A", 2500, 2001, "CMA CGM", "36个月", 23000, "Dynamar Monthly Feb 2026"),
    ("2026-02-15", "Belitaki", 1700, 1998, "CMA CGM(延期)", "10-14个月", 21000, "Dynamar Monthly Feb 2026"),
    ("2026-02-15", "Contship Ice", 1300, 2011, "CMA CGM(延期)", "23-25个月", 20000, "Dynamar Monthly Feb 2026"),
    ("2026-02-15", "Contship Rex II", 1400, 2008, "CMA CGM(延期)", "24个月", 20000, "Dynamar Monthly Feb 2026"),
    ("2026-02-15", "Elreedy Star", 1300, 1998, "CMA CGM(延期)", "6-8个月", 16000, "Dynamar Monthly Feb 2026"),
    ("2026-02-15", "Contship Uno", 1100, 2007, "CMA CGM(延期)", "9-12个月", 15000, "Dynamar Monthly Feb 2026"),
    ("2026-02-15", "Natal", 3400, 2007, "CoscoSL(延期)", "30-32个月", 29500, "Dynamar Monthly Feb 2026"),
    ("2026-02-15", "Mary Schulte", 2300, 2015, "CoscoSL(延期)", "30-34个月", 25000, "Dynamar Monthly Feb 2026"),
    ("2026-02-15", "EM Spetses", 1700, 2007, "CoscoSL(延期)", "22-24个月", 21500, "Dynamar Monthly Feb 2026"),
    ("2026-02-15", "Vela Nova", 1100, 1996, "Doris Shipping", "11-13个月", 13000, "Dynamar Monthly Feb 2026"),
    ("2026-02-15", "Cape Hellas", 2800, 2021, "Hapag-Lloyd", "36个月", 29950, "Dynamar Monthly Feb 2026"),
    ("2026-02-15", "Matilde A", 1200, 2004, "Hapag-Lloyd(延期)", "12-14个月", 17000, "Dynamar Monthly Feb 2026"),
    ("2026-02-15", "Spil Niken", 2500, 2003, "Maersk(延期)", "18-20个月", 26000, "Dynamar Monthly Feb 2026"),
    ("2026-02-15", "Spil Nisaka", 2500, 2002, "Maersk(延期)", "18-20个月", 26000, "Dynamar Monthly Feb 2026"),
    ("2026-02-15", "Varamo", 1300, 2007, "Maersk(延期)", "18-20个月", 19000, "Dynamar Monthly Feb 2026"),
    ("2026-03-09", "SCI Chennai", 4400, None, "CMA CGM", "4-5个月", 45000, "The Loadstar 2026-03-09 (Braemar)"),
    ("2026-03-09", "Gulf Barakah", None, None, "Maersk(延期)", "36个月", 36000, "The Loadstar 2026-03-09 (Braemar)"),
    ("2026-03-09", "Wadi Duka", 3534, None, "CMA CGM", "30-33个月", 30250, "The Loadstar 2026-03-09 (Braemar)"),
    ("2026-03-09", "Spil Caya", 3534, None, "Maersk", "30-34个月", 30250, "The Loadstar 2026-03-09 (Braemar)"),
    ("2026-03-09", "Marina Sapphire", 1577, None, "Maersk(延期)", "22-24个月", 22000, "The Loadstar 2026-03-09 (Braemar)"),
    ("2026-03-09", "Medkon Sun", 966, None, "CMA CGM(延期)", "9-12个月", 15000, "The Loadstar 2026-03-09 (Braemar)"),
    ("2026-07-15", "新造船(2艘)", 5300, 2027, "(未披露)", "36个月", 30000, "Braemar 2026-07 (头条新闻)"),
    ("2026-07-15", "老旧巴拿马型", None, None, "(未披露)", "—", 30000, "Braemar 2026-07 (日租金3万美元报道)"),
    ("2026-07-15", "新造船(3艘)", 3000, 2027, "(未披露)", "36个月", 28000, "Braemar 2026-07 (头条新闻)"),
    ("2026-07-15", "Cebu", 2450, None, "OOCL(延期)", "24个月", 24900, "Braemar 2026-07 (头条新闻)"),
    ("2026-07-15", "Meratus Jayakarta", 2474, 2005, "Maersk(延期)", "24个月", 26500, "Braemar 2026-07 (头条新闻)"),
    ("2026-07-15", "Meratus Jayagiri", 2450, 2000, "Maersk(延期)", "24个月", 26500, "Braemar 2026-07 (头条新闻)"),
    ("2026-07-15", "Expert", 1025, None, "Unifeeder(延期)", "12个月", 18000, "Braemar 2026-07 (头条新闻)"),
]

# 关键市场评论/事件（用于时间线展示）
MARKET_EVENTS = [
    ("2026-01-15", "市场进入2026年: New ConTex指数约1480点,春节期间市场未现明显放缓"),
    ("2026-02-10", "Lloyd's List报道: 春节期租市场保持坚挺, 1100 TEU支线船需求强劲"),
    ("2026-02-19", "SeaNews: New ConTex指数1487点, 大型船2026年运力已被预订一空,排队延至2027"),
    ("2026-02-22", "Hapag-Lloyd与ZIM宣布合并,重塑集装箱航运格局"),
    ("2026-03-09", "The Loadstar: 中东局势推升租船市场, CMA CGM以4.5万美元/天租入4400TEU船"),
    ("2026-04-10", "VHBS Week 15: 市场延续温和上行"),
    ("2026-05-15", "Euroseas Q1会议: 1年期TC混合参考价3.7万美元/天,远高于10年均值2.35万"),
    ("2026-06-17", "《伊斯兰堡谅解备忘录》签署,中东冲突初步降级"),
    ("2026-06-30", "Alphaliner 6月底评估: 8500TEU船12月期租7.6万美元/天"),
    ("2026-07-10", "Clarksons发布上半年回顾: 集装箱船期租租金达非疫情期间最高水平"),
    ("2026-07-11", "VHBS Week 28: New ConTex升至1580点"),
    ("2026-07-15", "Braemar: 5300TEU新造船3年期租突破3万美元/天"),
    ("2026-07-16", "VHBS官网: New ConTex 1585点,各船型租金全面上行"),
    ("2026-07-21", "VHBS官网: New ConTex 1588点,续创新高"),
]

# 数据源元信息
SOURCES_META = [
    {
        "id": "vhbs_newcontex",
        "name": "VHBS New ConTex",
        "full_name": "Vereinigung Hamburger und Bremer Schiffsmakler - New ConTex",
        "type": "指数(综合+分船型)",
        "frequency": "每周(周三)",
        "access": "免费(官网公开最近2期);完整历史需会员订阅",
        "url": "https://www.vhbs.de/index.php?id=28",
        "authority": "★★★★★ 最权威免费指数",
        "note": "汉堡不莱梅船舶经纪人协会发布,基于6船型(1100/1800/2500/2700/3500/4250 TEU)评估"
    },
    {
        "id": "alphaliner",
        "name": "Alphaliner",
        "full_name": "Alphaliner (AXSMarine)",
        "type": "评估价+fixtures+订单簿",
        "frequency": "每周二Newsletter",
        "access": "付费订阅;部分fixtures通过媒体公开",
        "url": "https://www.axsmarine.com/alphaliner",
        "authority": "★★★★★ 全球最权威",
        "note": "全球集装箱船队/订单簿/租船成交最权威数据源,12月期租评估价"
    },
    {
        "id": "clarkson",
        "name": "Clarkson Research",
        "full_name": "Clarkson Research (SIN平台)",
        "type": "综合航运市场+TC评估",
        "frequency": "每周五Weekly Highlights",
        "access": "付费订阅(SIN);公开评论通过媒体",
        "url": "https://sin.clarksons.net/",
        "authority": "★★★★★ 百年权威",
        "note": "跨船型最全,ClarkSea Index是行业基准"
    },
    {
        "id": "hrci",
        "name": "Howe Robinson HRCI",
        "full_name": "Howe Robinson Container Index",
        "type": "综合指数(14船型)",
        "frequency": "每周",
        "access": "付费;韩国KSG网站有历史图表",
        "url": "https://www.ksg.co.kr/shippingGraph/hrci_graph.jsp",
        "authority": "★★★★ 经纪商指数",
        "note": "伦敦Howe Robinson发布,涵盖510-4300 TEU 14个船型"
    },
    {
        "id": "hax",
        "name": "HAX Hamburg Index",
        "full_name": "Hamburg Index (VHSS)",
        "type": "月度矩阵(美元/TEU/slot/天)",
        "frequency": "每月初",
        "access": "免费PDF(样本);完整需订阅",
        "url": "https://test.vhbs.de/index.php?id=13",
        "authority": "★★★★ VHSS发布",
        "note": "按14t/slot/天计价,与New ConTex口径不同,适合跨船型比较"
    },
    {
        "id": "braemar",
        "name": "Braemar",
        "full_name": "Braemar Shipbrokers",
        "type": "fixtures+市场评论",
        "frequency": "不定期(通过媒体公开)",
        "access": "通过The Loadstar/Lloyd's List免费转载",
        "url": "https://www.braemar.com/",
        "authority": "★★★★ 主要经纪商",
        "note": "通过媒体报道公开最新fixtures,是免费获取成交数据的重要渠道"
    },
    {
        "id": "dynamar",
        "name": "Dynamar",
        "full_name": "DynaLiners Monthly",
        "type": "月报(含HIX+New ConTex+fixtures)",
        "frequency": "每月",
        "access": "付费;样本PDF免费",
        "url": "https://dynamar.com/",
        "authority": "★★★★ 月度权威",
        "note": "DynaLiners Monthly每月发布,含完整fixtures清单(样本PDF免费)"
    },
    {
        "id": "lloydslist",
        "name": "Lloyd's List",
        "full_name": "Lloyd's List Intelligence",
        "type": "新闻+fixtures",
        "frequency": "每日",
        "access": "付费;部分免费",
        "url": "https://www.lloydslist.com/",
        "authority": "★★★★ 百年航运媒体",
        "note": "最权威的航运新闻媒体,常引用Braemar/VHBS数据"
    },
    {
        "id": "loadstar",
        "name": "The Loadstar",
        "full_name": "The Loadstar",
        "type": "新闻+fixtures",
        "frequency": "每日",
        "access": "免费",
        "url": "https://theloadstar.com/",
        "authority": "★★★ 免费媒体",
        "note": "免费获取Braemar等经纪商fixtures的主要渠道"
    },
    {
        "id": "hellenic",
        "name": "Hellenic Shipping News",
        "full_name": "Hellenic Shipping News Worldwide",
        "type": "转载New ConTex周报",
        "frequency": "每周",
        "access": "免费",
        "url": "https://www.hellenicshippingnews.com/",
        "authority": "★★★ 转载源",
        "note": "免费转载VHBS New ConTex每周评论,是历史数据重要补充来源"
    },
]
