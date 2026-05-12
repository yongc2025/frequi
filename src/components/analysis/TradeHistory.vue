<script setup lang="ts">
import { useDashboardStore } from '@/stores/dashboardStore'
import type { TradeQueryParams } from '@/types/dashboard'

const dashboardStore = useDashboardStore()

// 筛选状态
const filters = ref<TradeQueryParams>({
  pair: undefined,
  exit_reason: undefined,
  enter_tag: undefined,
  is_short: undefined,
  date_from: undefined,
  date_to: undefined,
  min_profit: undefined,
  max_profit: undefined,
  limit: 500,
  offset: 0,
})

onMounted(async () => {
  await Promise.all([dashboardStore.fetchTrades(), dashboardStore.fetchFilters()])
})

async function doSearch() {
  filters.value.offset = 0
  await dashboardStore.fetchTrades(filters.value)
}

function doReset() {
  filters.value = {
    pair: undefined,
    exit_reason: undefined,
    enter_tag: undefined,
    is_short: undefined,
    date_from: undefined,
    date_to: undefined,
    min_profit: undefined,
    max_profit: undefined,
    limit: 500,
    offset: 0,
  }
  dashboardStore.fetchTrades()
}

function onPage(event: any) {
  filters.value.offset = event.first
  filters.value.limit = event.rows
  dashboardStore.fetchTrades(filters.value)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Card>
        <template #content>
          <div class="text-center">
            <div class="text-2xl font-bold">{{ dashboardStore.tradeStats.total }}</div>
            <div class="text-sm text-gray-500">交易数</div>
          </div>
        </template>
      </Card>
      <Card>
        <template #content>
          <div class="text-center">
            <div
              class="text-2xl font-bold"
              :class="dashboardStore.tradeStats.total_pnl >= 0 ? 'text-green-500' : 'text-red-500'"
            >
              {{ dashboardStore.tradeStats.total_pnl >= 0 ? '+' : '' }}{{ dashboardStore.tradeStats.total_pnl.toFixed(2) }}
            </div>
            <div class="text-sm text-gray-500">总盈亏</div>
          </div>
        </template>
      </Card>
      <Card>
        <template #content>
          <div class="text-center">
            <div
              class="text-2xl font-bold"
              :class="dashboardStore.tradeStats.winrate >= 50 ? 'text-green-500' : 'text-orange-500'"
            >
              {{ dashboardStore.tradeStats.winrate.toFixed(1) }}%
            </div>
            <div class="text-sm text-gray-500">胜率</div>
          </div>
        </template>
      </Card>
      <Card>
        <template #content>
          <div class="text-center">
            <div
              class="text-2xl font-bold"
              :class="dashboardStore.tradeStats.avg_profit_pct >= 0 ? 'text-green-500' : 'text-red-500'"
            >
              {{ dashboardStore.tradeStats.avg_profit_pct >= 0 ? '+' : '' }}{{ dashboardStore.tradeStats.avg_profit_pct.toFixed(2) }}%
            </div>
            <div class="text-sm text-gray-500">平均收益</div>
          </div>
        </template>
      </Card>
    </div>

    <!-- 筛选栏 -->
    <Card>
      <template #content>
        <div class="flex flex-wrap gap-3 items-end">
          <div class="flex flex-col gap-1">
            <label class="text-sm text-gray-500">交易对</label>
            <Dropdown
              v-model="filters.pair"
              :options="dashboardStore.filters.pairs"
              placeholder="全部"
              show-clear
              class="w-48"
              size="small"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm text-gray-500">卖出原因</label>
            <Dropdown
              v-model="filters.exit_reason"
              :options="dashboardStore.filters.exit_reasons"
              placeholder="全部"
              show-clear
              class="w-40"
              size="small"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm text-gray-500">入场标签</label>
            <Dropdown
              v-model="filters.enter_tag"
              :options="dashboardStore.filters.enter_tags"
              placeholder="全部"
              show-clear
              class="w-40"
              size="small"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm text-gray-500">方向</label>
            <Dropdown
              v-model="filters.is_short"
              :options="[
                { label: '全部', value: undefined },
                { label: '多', value: false },
                { label: '空', value: true },
              ]"
              option-label="label"
              option-value="value"
              placeholder="全部"
              show-clear
              class="w-28"
              size="small"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm text-gray-500">日期从</label>
            <InputText v-model="filters.date_from" type="date" size="small" class="w-36" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm text-gray-500">日期到</label>
            <InputText v-model="filters.date_to" type="date" size="small" class="w-36" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm text-gray-500">最小收益%</label>
            <InputNumber v-model="filters.min_profit" size="small" class="w-28" :min-fraction-digits="1" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm text-gray-500">最大收益%</label>
            <InputNumber v-model="filters.max_profit" size="small" class="w-28" :min-fraction-digits="1" />
          </div>
          <Button label="查询" size="small" @click="doSearch" />
          <Button label="重置" size="small" severity="secondary" @click="doReset" />
        </div>
      </template>
    </Card>

    <!-- 交易表格 -->
    <DataTable
      :value="dashboardStore.trades"
      :loading="dashboardStore.tradesLoading"
      paginator
      :rows="50"
      :total-records="dashboardStore.tradeStats.total"
      :lazy="true"
      @page="onPage"
      sort-mode="multiple"
      class="text-sm"
    >
      <Column field="id" header="ID" :sortable="true" style="width: 60px" />
      <Column field="pair" header="交易对" :sortable="true" />
      <Column field="is_short" header="方向" :sortable="true" style="width: 60px">
        <template #body="{ data }">
          <Tag :value="data.is_short ? '空' : '多'" :severity="data.is_short ? 'danger' : 'success'" />
        </template>
      </Column>
      <Column field="open_date" header="开仓时间" :sortable="true">
        <template #body="{ data }">
          {{ data.open_date?.replace('T', ' ').substring(0, 16) }}
        </template>
      </Column>
      <Column field="close_date" header="平仓时间" :sortable="true">
        <template #body="{ data }">
          {{ data.close_date?.replace('T', ' ').substring(0, 16) }}
        </template>
      </Column>
      <Column field="profit_ratio" header="收益%" :sortable="true">
        <template #body="{ data }">
          <span :class="data.profit_ratio >= 0 ? 'text-green-500' : 'text-red-500'">
            {{ data.profit_ratio >= 0 ? '+' : '' }}{{ data.profit_ratio.toFixed(2) }}%
          </span>
        </template>
      </Column>
      <Column field="profit_abs" header="盈亏" :sortable="true">
        <template #body="{ data }">
          <span :class="data.profit_abs >= 0 ? 'text-green-500' : 'text-red-500'">
            {{ data.profit_abs >= 0 ? '+' : '' }}{{ data.profit_abs.toFixed(2) }}
          </span>
        </template>
      </Column>
      <Column field="exit_reason" header="原因" :sortable="true" />
      <Column field="enter_tag" header="标签" :sortable="true" />
    </DataTable>
  </div>
</template>
