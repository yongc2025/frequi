import { defineStore } from 'pinia'
import axios from 'axios'
import type {
  DashboardTrade,
  TradeStats,
  TradeFilters,
  TradeQueryParams,
  ScanResult,
  ReportStatus,
  CompareResult,
  BotInfo,
} from '@/types/dashboard'

const API_BASE = '/api/v1/dashboard'

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    // 交易历史
    trades: [] as DashboardTrade[],
    tradeStats: { total: 0, total_pnl: 0, avg_profit_pct: 0, winrate: 0 } as TradeStats,
    filters: { exit_reasons: [], enter_tags: [], pairs: [] } as TradeFilters,
    tradesLoading: false,

    // 选币扫描
    scanResult: null as ScanResult | null,
    scanLoading: false,

    // 实盘报告
    reportStatus: 'idle' as string,
    reportLog: '',
    reportData: null as any,
    reportUpdatedAt: null as string | null,
    reportPollTimer: null as number | null,

    // Bot 信息（自动检测）
    botInfo: null as BotInfo | null,

    // 回测对比
    compareResult: null as CompareResult | null,
    compareLoading: false,
  }),

  getters: {
    scanData: (state) => state.scanResult?.data || [],
    scanUpdatedAt: (state) => state.scanResult?.updated_at || '-',
    scanCount: (state) => state.scanResult?.count || 0,
    reportReady: (state) => state.reportStatus === 'ok' && state.reportData !== null,
  },

  actions: {
    // ========== 交易历史 ==========

    async fetchTrades(params: TradeQueryParams = {}) {
      this.tradesLoading = true
      try {
        const { data } = await axios.get(`${API_BASE}/trades`, { params })
        this.trades = data.trades
        this.tradeStats = data.stats
      } catch (err) {
        console.error('Failed to fetch trades:', err)
      } finally {
        this.tradesLoading = false
      }
    },

    async fetchFilters() {
      try {
        const { data } = await axios.get(`${API_BASE}/trades/filters`)
        this.filters = data
      } catch (err) {
        console.error('Failed to fetch filters:', err)
      }
    },

    // ========== 选币扫描 ==========

    async fetchScan() {
      try {
        const { data } = await axios.get(`${API_BASE}/market-scan`)
        this.scanResult = data
      } catch (err) {
        console.error('Failed to fetch scan:', err)
      }
    },

    async refreshScan() {
      this.scanLoading = true
      try {
        await axios.post(`${API_BASE}/market-scan/refresh`)
        // 轮询状态直到完成
        const poll = setInterval(async () => {
          await this.fetchScan()
          if (this.scanResult?.status !== 'running') {
            clearInterval(poll)
            this.scanLoading = false
          }
        }, 3000)
      } catch (err) {
        console.error('Failed to refresh scan:', err)
        this.scanLoading = false
      }
    },

    // ========== 实盘报告 ==========

    async fetchBotInfo() {
      try {
        const { data } = await axios.get(`${API_BASE}/config/bot-info`)
        this.botInfo = data
      } catch (err) {
        console.error('Failed to fetch bot info:', err)
      }
    },

    async runReport(balance?: number) {
      try {
        const params: any = {}
        if (balance !== undefined) params.starting_balance = balance
        await axios.post(`${API_BASE}/live-report/run`, null, { params })
        this.reportStatus = 'running'
        // 轮询
        this._startReportPoll()
      } catch (err) {
        console.error('Failed to run report:', err)
      }
    },

    _startReportPoll() {
      if (this.reportPollTimer) clearInterval(this.reportPollTimer)
      this.reportPollTimer = window.setInterval(async () => {
        await this.fetchReportStatus()
        if (this.reportStatus !== 'running') {
          if (this.reportPollTimer) {
            clearInterval(this.reportPollTimer)
            this.reportPollTimer = null
          }
          if (this.reportStatus === 'ok') {
            await this.fetchReportData()
          }
        }
      }, 3000)
    },

    async fetchReportStatus() {
      try {
        const { data } = await axios.get(`${API_BASE}/live-report/status`)
        this.reportStatus = data.status
        this.reportLog = data.log
        this.reportUpdatedAt = data.updated_at
      } catch (err) {
        console.error('Failed to fetch report status:', err)
      }
    },

    async fetchReportData() {
      try {
        const { data } = await axios.get(`${API_BASE}/live-report/data`)
        this.reportData = data.data
        this.reportStatus = data.status
      } catch (err) {
        console.error('Failed to fetch report data:', err)
      }
    },

    // ========== 回测对比 ==========

    async compareBacktest(liveFile: File, btFile: File) {
      this.compareLoading = true
      try {
        const formData = new FormData()
        formData.append('live_file', liveFile)
        formData.append('bt_file', btFile)
        const { data } = await axios.post(`${API_BASE}/backtest/compare`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        this.compareResult = data
        return data as CompareResult
      } catch (err) {
        console.error('Failed to compare backtest:', err)
        this.compareResult = null
        return null
      } finally {
        this.compareLoading = false
      }
    },
  },
})
