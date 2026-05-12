// ========== 交易历史 ==========

export interface DashboardTrade {
  id: number
  pair: string
  open_date: string
  close_date: string
  stake_amount: number
  profit_ratio: number // 百分比
  profit_abs: number
  exit_reason: string
  enter_tag: string
  is_short: boolean
  open_rate: number
  close_rate: number
}

export interface TradeStats {
  total: number
  total_pnl: number
  avg_profit_pct: number
  winrate: number
}

export interface TradeFilters {
  exit_reasons: string[]
  enter_tags: string[]
  pairs: string[]
}

export interface TradeQueryParams {
  pair?: string
  exit_reason?: string
  enter_tag?: string
  is_short?: boolean
  date_from?: string
  date_to?: string
  min_profit?: number
  max_profit?: number
  limit?: number
  offset?: number
}

// ========== 选币扫描 ==========

export interface ScanItem {
  symbol: string
  display: string
  last_price: number
  volume_24h: number
  volume_3d_quote: number
  price_change_3d: number
  high_3d: number
  low_3d: number
  volume_rank_overall: number
  volume_rank_3d: number
  age_days: number | null
  age_ok: boolean
}

export interface ScanResult {
  data: ScanItem[]
  status: string
  updated_at: string | null
  count: number
  error: string | null
}

// ========== 实盘报告 ==========

export interface LiveReportData {
  profit_total: number
  sharpe: number
  sortino: number
  calmar: number
  profit_factor: number
  expectancy: number
  max_drawdown_account: number
  total_trades: number
  wins: number
  losses: number
  winrate: number
  trades_per_day: number
  profit_total_abs: number
  final_balance: number
  starting_balance: number
  duration_avg: string
  max_consecutive_wins: number
  max_consecutive_losses: number
  daily_profit: Array<{ date: string; profit: number; profit_abs: number }>
  results_per_pair: Array<Record<string, any>>
  [key: string]: any
}

export interface ReportStatus {
  status: 'idle' | 'running' | 'ok' | 'error'
  log: string
  updated_at: string | null
  data: LiveReportData | null
}

// ========== 回测对比 ==========

export interface CompareMetric {
  label: string
  live: number
  bt: number
  unit: string
  diff_pct: number
}

export interface MatchedTrade {
  pair: string
  side: string
  enter_tag: string
  bt_entry_time: string
  live_entry_time: string
  entry_delay_sec: number
  entry_slippage_pct: number
  exit_slippage_pct: number
  bt_profit_pct: number
  live_profit_pct: number
  pnl_diff_pct: number
  match_confidence: number
  bucket: string
}

export interface CompareResult {
  ready: boolean
  overview: {
    metrics: CompareMetric[]
    cards: Array<{ label: string; value: number; unit: string }>
    matched_count: number
    bt_trade_count: number
    live_trade_count: number
  }
  diagnosis: {
    score: number
    conclusion: string
    limitations: string
  }
  attribution: {
    contributions: Array<{ label: string; value: number; share_pct: number }>
    clusters: Array<Record<string, any>>
  }
  matching: {
    matched: MatchedTrade[]
    bt_only: Array<Record<string, any>>
    live_only: Array<Record<string, any>>
    top_anomalies: MatchedTrade[]
  }
}

// ========== Bot 信息 ==========

export interface BotInfo {
  exchange: string
  stake_currency: string
  trading_mode: string
  run_mode: string
  db_path: string
  starting_balance: number
  dry_run: boolean
  current_balance?: number
}
