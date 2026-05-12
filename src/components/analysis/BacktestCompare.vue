<script setup lang="ts">
import { useDashboardStore } from '@/stores/dashboardStore'

const dashboardStore = useDashboardStore()
const liveFile = ref<File | null>(null)
const btFile = ref<File | null>(null)
const liveFileInput = ref<HTMLInputElement | null>(null)
const btFileInput = ref<HTMLInputElement | null>(null)

function onLiveFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.length) liveFile.value = input.files[0]
}

function onBtFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.length) btFile.value = input.files[0]
}

async function doCompare() {
  if (!liveFile.value || !btFile.value) return
  await dashboardStore.compareBacktest(liveFile.value, btFile.value)
}

const result = computed(() => dashboardStore.compareResult)
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- 上传区域 -->
    <Card>
      <template #content>
        <div class="flex flex-wrap gap-4 items-end">
          <div class="flex flex-col gap-1">
            <label class="text-sm text-gray-500">实盘报告文件</label>
            <div class="flex gap-2 items-center">
              <input ref="liveFileInput" type="file" accept=".json" @change="onLiveFileSelect" class="text-sm" />
              <span v-if="liveFile" class="text-xs text-green-500">✓ {{ liveFile.name }}</span>
            </div>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm text-gray-500">回测结果文件</label>
            <div class="flex gap-2 items-center">
              <input ref="btFileInput" type="file" accept=".json,.zip" @change="onBtFileSelect" class="text-sm" />
              <span v-if="btFile" class="text-xs text-green-500">✓ {{ btFile.name }}</span>
            </div>
          </div>
          <Button
            label="开始对比分析"
            :loading="dashboardStore.compareLoading"
            :disabled="!liveFile || !btFile"
            @click="doCompare"
          />
        </div>
      </template>
    </Card>

    <!-- 对比结果 -->
    <template v-if="result?.ready">
      <!-- 汇总指标对比 -->
      <Card>
        <template #title>
          <span class="text-sm">📊 汇总指标对比</span>
        </template>
        <template #content>
          <DataTable :value="result.overview.metrics" class="text-sm">
            <Column field="label" header="指标" />
            <Column field="live" header="实盘">
              <template #body="{ data }">
                {{ data.live }}{{ data.unit }}
              </template>
            </Column>
            <Column field="bt" header="回测">
              <template #body="{ data }">
                {{ data.bt }}{{ data.unit }}
              </template>
            </Column>
            <Column field="diff_pct" header="偏差%">
              <template #body="{ data }">
                <span :class="data.diff_pct >= 0 ? 'text-green-500' : 'text-red-500'">
                  {{ data.diff_pct >= 0 ? '+' : '' }}{{ data.diff_pct.toFixed(1) }}%
                </span>
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>

      <!-- 概览卡片 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card v-for="card in result.overview.cards" :key="card.label">
          <template #content>
            <div class="text-center">
              <div class="text-xl font-bold">{{ card.value }}{{ card.unit }}</div>
              <div class="text-xs text-gray-500">{{ card.label }}</div>
            </div>
          </template>
        </Card>
      </div>

      <!-- 偏差归因 -->
      <Card>
        <template #title>
          <span class="text-sm">🎯 偏差归因</span>
        </template>
        <template #content>
          <div class="flex flex-col gap-2">
            <div v-for="item in result.attribution.contributions" :key="item.label" class="flex items-center gap-3">
              <span class="text-sm w-28 shrink-0">{{ item.label }}</span>
              <div class="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                <div
                  class="h-full rounded-full bg-blue-500"
                  :style="{ width: `${item.share_pct}%` }"
                />
              </div>
              <span class="text-sm w-16 text-right">{{ item.share_pct.toFixed(1) }}%</span>
            </div>
          </div>
        </template>
      </Card>

      <!-- 结论 -->
      <Card>
        <template #content>
          <div class="text-sm">
            <strong>📝 结论：</strong>{{ result.diagnosis.conclusion }}
            <div class="text-xs text-gray-400 mt-2">{{ result.diagnosis.limitations }}</div>
          </div>
        </template>
      </Card>
    </template>
  </div>
</template>
