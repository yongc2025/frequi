<script setup lang="ts">
import { useDashboardStore } from '@/stores/dashboardStore'

const dashboardStore = useDashboardStore()

onMounted(() => {
  dashboardStore.fetchScan()
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- 头部信息 -->
    <Card>
      <template #content>
        <div class="flex flex-wrap gap-4 items-center justify-between">
          <div class="flex flex-wrap gap-4 items-center text-sm">
            <span class="font-bold">🔍 市场扫描</span>
            <span class="text-gray-500">上次更新: {{ dashboardStore.scanUpdatedAt }}</span>
            <span class="text-gray-500">扫描数量: {{ dashboardStore.scanCount }} 个币种</span>
            <span v-if="dashboardStore.scanResult?.status === 'ok'" class="text-green-500">● 就绪</span>
            <span v-else-if="dashboardStore.scanResult?.status === 'running'" class="text-blue-500">● 扫描中...</span>
            <span v-else-if="dashboardStore.scanResult?.status === 'error'" class="text-red-500">● 错误</span>
          </div>
          <Button
            label="确认刷新"
            size="small"
            :loading="dashboardStore.scanLoading"
            :disabled="dashboardStore.scanResult?.status === 'running'"
            @click="dashboardStore.refreshScan()"
          />
        </div>
      </template>
    </Card>

    <!-- 错误提示 -->
    <Message v-if="dashboardStore.scanResult?.error" severity="warn">
      {{ dashboardStore.scanResult.error }}
    </Message>

    <!-- 扫描结果表格 -->
    <DataTable :value="dashboardStore.scanData" sort-mode="multiple" class="text-sm">
      <Column field="volume_rank_3d" header="排名" :sortable="true" style="width: 60px" />
      <Column field="display" header="币种" :sortable="true" />
      <Column field="last_price" header="价格" :sortable="true">
        <template #body="{ data }">
          ${{ data.last_price.toLocaleString() }}
        </template>
      </Column>
      <Column field="price_change_3d" header="3日涨幅" :sortable="true">
        <template #body="{ data }">
          <span :class="data.price_change_3d >= 0 ? 'text-green-500' : 'text-red-500'">
            {{ data.price_change_3d >= 0 ? '+' : '' }}{{ data.price_change_3d.toFixed(2) }}%
          </span>
        </template>
      </Column>
      <Column field="volume_24h" header="24H成交额" :sortable="true">
        <template #body="{ data }">
          ${{ (data.volume_24h / 1e6).toFixed(1) }}M
        </template>
      </Column>
      <Column field="volume_3d_quote" header="3D成交额" :sortable="true">
        <template #body="{ data }">
          ${{ (data.volume_3d_quote / 1e6).toFixed(1) }}M
        </template>
      </Column>
      <Column field="high_3d" header="3D最高" :sortable="true">
        <template #body="{ data }">
          ${{ data.high_3d.toLocaleString() }}
        </template>
      </Column>
      <Column field="low_3d" header="3D最低" :sortable="true">
        <template #body="{ data }">
          ${{ data.low_3d.toLocaleString() }}
        </template>
      </Column>
      <Column field="age_days" header="上线天数" :sortable="true">
        <template #body="{ data }">
          {{ data.age_days ? Math.round(data.age_days) : '-' }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>
