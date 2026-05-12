<script setup lang="ts">
import TabMenu from 'primevue/tabmenu'
import TradeHistory from '@/components/analysis/TradeHistory.vue'
import LiveReport from '@/components/analysis/LiveReport.vue'
import BacktestCompare from '@/components/analysis/BacktestCompare.vue'
import MarketScan from '@/components/analysis/MarketScan.vue'

const activeTab = ref(0)
const tabs = [
  { label: '历史交易', icon: 'pi pi-clock' },
  { label: '实盘报告', icon: 'pi pi-file' },
  { label: '回测对比', icon: 'pi pi-sync' },
  { label: '选币扫描', icon: 'pi pi-search' },
]
</script>

<template>
  <div class="p-3 flex flex-col gap-3">
    <TabMenu :model="tabs" v-model:activeIndex="activeTab" />
    <div>
      <KeepAlive>
        <TradeHistory v-if="activeTab === 0" />
        <LiveReport v-else-if="activeTab === 1" />
        <BacktestCompare v-else-if="activeTab === 2" />
        <MarketScan v-else-if="activeTab === 3" />
      </KeepAlive>
    </div>
  </div>
</template>
