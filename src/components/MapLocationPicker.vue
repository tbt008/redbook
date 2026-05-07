<template>
  <div class="map-location-picker">
    <el-input :model-value="address" readonly :placeholder="placeholder" class="map-location-picker__input">
      <template #append>
        <el-button type="primary" @click="openPicker">
          <el-icon><MapLocation /></el-icon>
          地图选点
        </el-button>
      </template>
    </el-input>

    <div v-if="hasCoordinates" class="map-location-picker__meta">
      <span>经度 {{ longitude }}</span>
      <span>纬度 {{ latitude }}</span>
    </div>

    <el-dialog v-model="pickerVisible" title="地图选点" width="860px" append-to-body destroy-on-close @closed="destroyMap">
      <div class="map-location-picker__toolbar">
        <span class="map-location-picker__hint">点击地图或拖动标记选择位置，系统会自动回填详细地址。</span>
        <el-button size="small" @click="resetToPutian">回到莆田</el-button>
      </div>

      <div ref="mapContainerRef" class="map-location-picker__map" v-loading="mapLoading">
        <div v-if="mapLoadFailed" class="map-location-picker__error">
          <el-icon><Warning /></el-icon>
          <span>地图加载失败，请检查网络后重试</span>
        </div>
      </div>

      <div class="map-location-picker__result">
        <div class="map-location-picker__address">{{ draftAddress || '尚未选择地址' }}</div>
        <div class="map-location-picker__coords" v-if="draftLongitude && draftLatitude">
          {{ draftLongitude }}，{{ draftLatitude }}
        </div>
      </div>

      <template #footer>
        <el-button @click="pickerVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!draftAddress || !draftLongitude || !draftLatitude" @click="confirmLocation">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { MapLocation, Warning } from '@element-plus/icons-vue'
import { loadAMapScript, reverseGeocodeLocation, waitForContainerVisible } from '@/utils/amap'

const props = withDefaults(defineProps<{
  address: string
  longitude?: number | null
  latitude?: number | null
  region?: string
  placeholder?: string
}>(), {
  longitude: null,
  latitude: null,
  region: '',
  placeholder: '请点击地图选点自动填充地址'
})

const emit = defineEmits<{
  (event: 'update:address', value: string): void
  (event: 'update:longitude', value: number | null): void
  (event: 'update:latitude', value: number | null): void
  (event: 'update:region', value: string): void
}>()

const PUTIAN_CENTER: [number, number] = [119.007718, 25.454]
const REGION_OPTIONS = ['荔城区', '城厢区', '涵江区', '秀屿区', '湄洲岛', '仙游县']

const pickerVisible = ref(false)
const mapLoading = ref(false)
const mapLoadFailed = ref(false)
const mapContainerRef = ref<HTMLElement>()
const draftAddress = ref('')
const draftLongitude = ref<number | null>(null)
const draftLatitude = ref<number | null>(null)
const draftRegion = ref('')

let mapInstance: any = null
let markerInstance: any = null

const hasCoordinates = computed(() => props.longitude != null && props.latitude != null)

watch(pickerVisible, async (visible) => {
  if (!visible) return
  draftAddress.value = props.address || ''
  draftLongitude.value = props.longitude ?? null
  draftLatitude.value = props.latitude ?? null
  draftRegion.value = props.region || ''
  await nextTick()
  await initMap()
})

const openPicker = () => {
  pickerVisible.value = true
}

const initMap = async () => {
  if (!mapContainerRef.value) return
  mapLoading.value = true
  mapLoadFailed.value = false

  try {
    await loadAMapScript()
    await waitForContainerVisible(mapContainerRef.value)
    destroyMap()

    const AMap = (window as any).AMap
    const center = draftLongitude.value && draftLatitude.value
      ? [draftLongitude.value, draftLatitude.value]
      : PUTIAN_CENTER

    mapInstance = new AMap.Map(mapContainerRef.value, {
      zoom: 13,
      center,
      mapStyle: 'amap://styles/normal'
    })

    if (draftLongitude.value && draftLatitude.value) {
      addMarker(draftLongitude.value, draftLatitude.value)
    }

    mapInstance.on('click', (event: any) => {
      updateDraftLocation(event.lnglat.getLng(), event.lnglat.getLat())
    })
  } catch (error) {
    console.error('地图初始化失败:', error)
    mapLoadFailed.value = true
    ElMessage.error('地图加载失败，请稍后重试')
  } finally {
    mapLoading.value = false
  }
}

const updateDraftLocation = async (lng: number, lat: number) => {
  draftLongitude.value = Number(lng.toFixed(6))
  draftLatitude.value = Number(lat.toFixed(6))
  addMarker(draftLongitude.value, draftLatitude.value)

  try {
    const location = await reverseGeocodeLocation(draftLongitude.value, draftLatitude.value)
    draftAddress.value = location.address
    draftRegion.value = normalizeRegion(location.region, location.address)
  } catch (error) {
    console.error('逆地理编码失败:', error)
    draftAddress.value = `地图选点：${draftLongitude.value}, ${draftLatitude.value}`
    draftRegion.value = normalizeRegion('', '')
    ElMessage.warning('地址解析暂时失败，已先保留坐标，可换一个附近点重试')
  }
}

const addMarker = (lng: number, lat: number) => {
  if (!mapInstance) return
  const AMap = (window as any).AMap

  if (markerInstance) {
    mapInstance.remove(markerInstance)
  }

  markerInstance = new AMap.Marker({
    position: [lng, lat],
    draggable: true,
    cursor: 'move'
  })

  markerInstance.on('dragend', (event: any) => {
    updateDraftLocation(event.lnglat.getLng(), event.lnglat.getLat())
  })

  mapInstance.add(markerInstance)
  mapInstance.setCenter([lng, lat])
}

const resetToPutian = () => {
  if (!mapInstance) return
  mapInstance.setZoomAndCenter(13, PUTIAN_CENTER)
}

const confirmLocation = () => {
  emit('update:address', draftAddress.value)
  emit('update:longitude', draftLongitude.value)
  emit('update:latitude', draftLatitude.value)
  if (draftRegion.value) {
    emit('update:region', draftRegion.value)
  }
  pickerVisible.value = false
}

const destroyMap = () => {
  if (mapInstance) {
    mapInstance.destroy()
    mapInstance = null
    markerInstance = null
  }
}

const normalizeRegion = (region: string, address: string) => {
  const matchedRegion = REGION_OPTIONS.find((item) => region.includes(item) || address.includes(item))
  return matchedRegion || region
}
</script>

<style scoped lang="scss">
.map-location-picker {
  width: 100%;

  &__input {
    width: 100%;
  }

  &__meta {
    display: flex;
    gap: 12px;
    margin-top: 8px;
    color: #7b8794;
    font-size: 12px;
  }

  &__toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }

  &__hint {
    color: #667085;
    font-size: 13px;
  }

  &__map {
    position: relative;
    width: 100%;
    height: 420px;
    overflow: hidden;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    background: #f5f7fa;
  }

  &__error {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #909399;
    background: #f5f7fa;
  }

  &__result {
    margin-top: 12px;
    padding: 12px 14px;
    border-radius: 8px;
    background: #f6faf8;
  }

  &__address {
    color: #344054;
    font-weight: 600;
  }

  &__coords {
    margin-top: 4px;
    color: #7b8794;
    font-size: 12px;
  }
}
</style>
