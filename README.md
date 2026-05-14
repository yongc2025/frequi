# FreqUI — GMGN 量化交易前端

基于 [FreqUI](https://github.com/freqtrade/frequi) 定制的量化交易管理界面，配合 [Freqtrade + GMGN 系统](https://github.com/yongc2025/freqtrade) 使用。

原版 FreqUI 是 Freqtrade 官方的 Web 前端，本 Fork 在此基础上新增了 **统计分析模块**，用于回测数据可视化和交易复盘。

## 相对上游的改动

### 新增：统计分析模块

集成完整的交易数据分析前端，包含四个核心组件：

| 组件 | 功能 |
|------|------|
| `LiveReport` | 实时交易报告 — 当前持仓、盈亏汇总、资金曲线 |
| `BacktestCompare` | 回测对比 — 多策略/多参数回测结果横向对比 |
| `TradeHistory` | 交易历史 — 完整交易记录，支持筛选与排序 |
| `MarketScan` | 市场扫描 — GMGN 数据驱动的市场行情概览 |

统计分析菜单在所有模式下可见（不仅限于 trading 模式）。

### 修复：Dashboard 优化

- 错误提示统一使用 Toast 通知
- KeepAlive 组件 key 修复，解决页面缓存异常
- 分页组件对齐问题修复

## 技术栈

- **框架：** Vue 3 + TypeScript
- **UI 库：** PrimeVue
- **构建：** Vite
- **包管理：** pnpm
- **状态管理：** Pinia

## 快速开始

### 前置条件

需要 [Freqtrade + GMGN 系统](https://github.com/yongc2025/freqtrade) 运行中，API 可访问。

### 开发模式

```bash
# 安装依赖
pnpm install

# 启动开发服务器（热重载）
pnpm run dev

# 访问 http://localhost:3000
```

### 生产构建

```bash
pnpm run build
```

### Docker

```bash
docker compose up -d
# 访问 http://localhost:3000
```

### 代码检查

```bash
pnpm run lint
```

## 连接配置

FreqUI 需要连接到 Freqtrade API。两种方式：

1. **Webpack 代理**（开发模式）：在 `vue.config.js` 中配置代理端口
2. **直连 API**（推荐）：直接连接 `http://localhost:8080`

需要正确配置 Freqtrade 的 [CORS](https://www.freqtrade.io/en/stable/rest-api/#cors) 策略，通常需要添加 `http://localhost:3000`。

## 项目结构

```
src/
├── components/
│   ├── analysis/            # 统计分析模块（本 Fork 新增）
│   │   ├── BacktestCompare.vue
│   │   ├── LiveReport.vue
│   │   ├── MarketScan.vue
│   │   └── TradeHistory.vue
│   ├── layout/              # 布局组件
│   └── ...                  # 原有组件
├── views/
│   ├── AnalysisView.vue     # 统计分析页面入口
│   └── ...
├── stores/
│   ├── dashboardStore.ts    # Dashboard 数据 Store
│   └── ...
├── types/
│   ├── backtest.ts          # 回测类型定义
│   ├── dashboard.ts         # Dashboard 类型定义
│   └── ...
└── utils/
    └── backtestMetrics.ts   # 回测指标计算工具
```

## 上游项目

本项目 Fork 自 [freqtrade/frequi](https://github.com/freqtrade/frequi)，保留了全部原有功能：

- 实时交易监控
- 策略管理
- 回测执行与结果查看
- 余额与持仓查看
- 机器人配置管理

## License

MIT — 与上游项目保持一致。
