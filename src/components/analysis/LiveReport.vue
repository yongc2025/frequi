<script setup lang="ts">
import { useDashboardStore } from '@/stores/dashboardStore'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'

use([CanvasRenderer, LineChart, BarChart, GridComponent, TooltipComponent, LegendComponent])

const dashboardStore = useDashboardStore()
const customBalance = ref<number | undefined>(undefined)

onMounted(async () => {
  await dashboardStore.fetchBotInfo()
  if (dashboardStore.botInfo) {
    customBalance.value = dashboardStore.botInfo.starting_balance
  }
  // 尝试加载已有报告
  await dashboardStore.fetchReportData()
  if (dashboardStore.reportStatus !== 'ok') {
    await dashboardStore.fetchReportStatus()
  }
})

function runReport() {
  dashboardStore.runReport(customBalance.value)
}

// 权益曲线图表
const equityOption = computed(() => {
  if (!dashboardStore.reportData?.daily_profit) return {}
  const daily = dashboardStore.reportData.daily_profit
  let equity = dashboardStore.reportData.starting_balance
  const xData: string[] = []
  const yData: number[] = [equity]
  for (const d of daily) {
    equity += d.profit_abs
    xData.push(d.date)
    yData.push(Math.round(equity * 100) / 100)
  }
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: 60, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: ['Start', ...xData] },
    yAxis: { type: 'value', name: 'USDT' },
    series: [
      {
        type: 'line',
        data: yData,
        smooth: true,
        areaStyle: { opacity: 0.15 },
        lineStyle: { width: 2 },
      },
    ],
  }
})

// 月度收益柱状图
const monthlyOption = computed(() => {
  if (!dashboardStore.reportData?.daily_profit) return {}
  const daily = dashboardStore.reportData.daily_profit
  const monthly: Record<string, number> = {}
  for (const d of daily) {
    const month = d.date.substring(0, 7)
    monthly[month] = (monthly[month] || 0) + d.profit_abs
  }
  const months = Object.keys(monthly).sort()
  const values = months.map((m) => Math.round(monthly[m] * 100) / 100)
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: 60, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: months },
    yAxis: { type: 'value', name: 'USDT' },
    series: [
      {
        type: 'bar',
        data: values,
        itemStyle: {
          color: (params: any) => (params.value >= 0 ? '#22c55e' : '#ef4444'),
        },
      },
    ],
  }
})

const rd = computed(() => dashboardStore.reportData)
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Bot 自动检测信息 -->
    <Card v-if="dashboardStore.botInfo">
      <template #content>
        <div class="flex flex-wrap gap-4 items-center text-sm">
          <span class="text-gray-500">🤖 自动检测：</span>
          <span>交易所=<strong>{{ dashboardStore.botInfo.exchange }}</strong></span>
          <span>初始资金=<strong>${{ dashboardStore.botInfo.starting_balance }}</strong></span>
          <span>模式=<strong>{{ dashboardStore.botInfo.dry_run ? '模拟盘' : '实盘' }}</strong></span>
          <span>DB=<strong class="text-xs">{{ dashboardStore.botInfo.db_path.split('/').pop() }}</strong></span>
        </div>
        <div class="flex gap-3 items-center mt-3">
          <span class="text-sm text-gray-500">初始资金:</span>
          <InputNumber v-model="customBalance" :min="0" :step="100" size="small" class="w-36" />
          <Button
            label="一键生成报告"
            size="small"
            :loading="dashboardStore.reportStatus === 'running'"
            @click="runReport"
          />
        </div>
      </template>
    </Card>

    <!-- 运行状态 -->
    <Message v-if="dashboardStore.reportStatus === 'running'" severity="info" :closable="false">
      报告生成中...
    </Message>
    <Message v-if="dashboardStore.reportStatus === 'error'" severity="error">
      生成失败，请查看日志
    </Message>

    <!-- 指标卡片 -->
    <template v-if="rd">
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <Card>
          <template #content>
            <div class="text-center">
              <div
                class="text-xl font-bold"
                :class="(rd.profit_total * 100) >= 0 ? 'text-green-500' : 'text-red-500'"
              >
                {{ (rd.profit_total * 100).toFixed(2) }}%
              </div>
              <div class="text-xs text-gray-500">总收益率</div>
            </div>
          </template>
        </Card>
        <Card>
          <template #content>
            <div class="text-center">
              <div class="text-xl font-bold">{{ rd.sharpe?.toFixed(2) }}</div>
              <div class="text-xs text-gray-500">夏普比率</div>
            </div>
          </template>
        </Card>
        <Card>
          <template #content>
            <div class="text-center">
              <div class="text-xl font-bold text-red-500">
                {{ (rd.max_drawdown_account * 100).toFixed(2) }}%
              </div>
              <div class="text-xs text-gray-500">最大回撤</div>
            </div>
          </template>
        </Card>
        <Card>
          <template #content>
            <div class="text-center">
              <div class="text-xl font-bold">{{ rd.profit_factor?.toFixed(2) }}</div>
              <div class="text-xs text-gray-500">获利因子</div>
            </div>
          </template>
        </Card>
        <Card>
          <template #content>
            <div class="text-center">
              <div class="text-xl font-bold">{{ rd.sortino?.toFixed(2) }}</div>
              <div class="text-xs text-gray-500">索提诺</div>
            </div>
          </template>
        </Card>
        <Card>
          <template #content>
            <div class="text-center">
              <div class="text-xl font-bold">{{ rd.calmar?.toFixed(2) }}</div>
              <div class="text-xs text-gray-500">卡玛比率</div>
            </div>
          </template>
        </Card>
        <Card>
          <template #content>
            <div class="text-center">
              <div class="text-xl font-bold">{{ rd.total_trades }}</div>
              <div class="text-xs text-gray-500">交易次数</div>
            </div>
          </template>
        </Card>
        <Card>
          <template #content>
            <div class="text-center">
              <div class="text-xl font-bold">{{ rd.trades_per_day?.toFixed(1) }}</div>
              <div class="text-xs text-gray-500">日均交易</div>
            </div>
          </template>
        </Card>
      </div>

      <!-- 图表 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <template #title>
            <span class="text-sm">📈 权益曲线</span>
          </template>
          <template #content>
            <VChart :option="equityOption" style="height: 300px" autoresize />
          </template>
        </Card>
        <Card>
          <template #title>
            <span class="text-sm">📊 月度收益</span>
          </template>
          <template #content>
            <VChart :option="monthlyOption" style="height: 300px" autoresize />
          </template>
        </Card>
      </div>
    </template>
  </div>
</template>
