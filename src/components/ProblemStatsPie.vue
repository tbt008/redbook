<!-- 题目统计饼图 -->
<template>
  <div class="stats-container">
    <div class="problem-name">{{ title || '请选择题目' }}</div>
    <div class="pie-chart" ref="pieChart"></div>
    <div class="stats-numbers">
      <div class="ac-stats">
        <span class="label">AC:</span>
        <span class="value">{{ shouldShowStats ? (passPerson || 0) : '-' }}</span>
      </div>
      <div class="wa-stats">
        <span class="label">WA:</span>
        <span class="value">{{ shouldShowStats ? (waPerson || 0) : '-' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import * as echarts from 'echarts'
// TODO 未来会多接收几个参数
const props = defineProps<{
  title?: string
  passPerson?: number
  tryPerson?: number
}>()

const pieChart = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

const shouldShowStats = computed(() => 
  props.title !== undefined && props.title !== null
)

const waPerson = computed(() => 
  props.tryPerson && props.passPerson 
    ? props.tryPerson - props.passPerson 
    : 0
)

const initChart = () => {
  if (!pieChart.value) return
  
  chart = echarts.init(pieChart.value)
  updateChart()
}

const updateChart = () => {
  if (!chart) return

  const chartData = []
  if (props.passPerson && props.passPerson > 0) {
    chartData.push({ 
      value: props.passPerson, 
      name: 'AC',
      itemStyle: { 
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0, color: '#95eb75' 
          }, {
            offset: 1, color: '#67C23A'
          }]
        }
      }
    })
  }
  
  if (waPerson.value > 0) {
    chartData.push({ 
      value: waPerson.value, 
      name: 'WA',
      itemStyle: { 
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0, color: '#ff7875'
          }, {
            offset: 1, color: '#F56C6C'
          }]
        }
      }
    })
  }

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    series: [{
      type: 'pie',
      radius: ['40%', '80%'],
      center: ['50%', '50%'],
      silent: true,
      labelLine: {
        show: true,
        length: 8,
        length2: 8,
        smooth: true
        
      },
      label: { 
        show: true,
        position: 'outside',
        fontSize: 10,
        formatter: '{b}',
        color: '#606266',
        padding: [0, 0, 0, 0]
      },
      itemStyle: {
        borderRadius: 15,
        borderColor: '#fff',
        borderWidth: 3
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 15,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      data: chartData.length > 0 ? chartData : [
        { 
          value: 1, 
          itemStyle: { 
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0, color: '#f5f7fa'
              }, {
                offset: 1, color: '#E4E7ED'
              }]
            }
          }
        }
      ]
    }]
  }
  
  chart.setOption(option)
}

watch(
  () => [props.passPerson, props.tryPerson, props.title],
  () => updateChart()
)

onMounted(() => {
  initChart()
})
</script>

<style scoped>
.stats-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  /* padding: 10px; */
  height: 300px;
  padding-top: 0;
}

.problem-name {
  font-size: 14px;
  font-weight: 500;
  /* margin-bottom: 10px; */
  margin-top: 10px;
  text-align: center;
  height: 40px;
  display: flex;
  align-items: center;
}

.pie-chart {
  width: 100%;
  height: 220px;
  margin: 0 auto;
}
.stats-numbers {
  display: flex;
  gap: 20px;
  margin-top: 10px;
  text-align: center;
  height: 20px; 
}

.ac-stats, .wa-stats {
  display: flex;
  gap: 5px;
}

.label {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}

.value {
  font-size: 16px;
  font-weight: 500;
}

.ac-stats .value {
  color: #67C23A;
}

.wa-stats .value {
  color: #F56C6C;
}

 
</style> 