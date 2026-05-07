<template>
  <div class="item-selector">
    <el-tabs v-model="activeTab" class="selector-tabs">
      <el-tab-pane label="🏞️ 景点" name="attraction">
        <div class="search-bar">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索景点..."
            prefix-icon="Search"
            clearable
          />
        </div>
        <div class="items-grid">
          <div
            v-for="item in filteredAttractions"
            :key="item.id"
            class="item-card"
            @click="selectItem(item)"
          >
            <div class="item-image">
              <img :src="item.coverImage || '/src/views/imgs/1.jpg'" :alt="item.name" />
            </div>
            <div class="item-info">
              <h4>{{ item.name }}</h4>
              <div class="item-meta">
                <span>⏱️ {{ item.duration || 120 }}分钟</span>
                <span>💰 ¥{{ item.ticketPrice || 0 }}</span>
              </div>
              <div class="item-desc">{{ item.description }}</div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="🍜 美食" name="food">
        <div class="search-bar">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索美食..."
            prefix-icon="Search"
            clearable
          />
        </div>
        <div class="items-grid">
          <div
            v-for="item in filteredFoods"
            :key="item.id"
            class="item-card"
            @click="selectItem(item)"
          >
            <div class="item-image">
              <img :src="item.coverImage || '/src/views/imgs/2.jpg'" :alt="item.name" />
            </div>
            <div class="item-info">
              <h4>{{ item.name }}</h4>
              <div class="item-meta">
                <span>⏱️ {{ item.duration || 90 }}分钟</span>
                <span>💰 ¥{{ item.avgPrice || 50 }}/人</span>
              </div>
              <div class="item-desc">{{ item.description }}</div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="🏨 酒店" name="hotel">
        <div class="search-bar">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索酒店..."
            prefix-icon="Search"
            clearable
          />
        </div>
        <div class="items-grid">
          <div
            v-for="item in filteredHotels"
            :key="item.id"
            class="item-card"
            @click="selectItem(item)"
          >
            <div class="item-image">
              <img :src="item.coverImage || '/src/views/imgs/3.jpg'" :alt="item.name" />
            </div>
            <div class="item-info">
              <h4>{{ item.name }}</h4>
              <div class="item-meta">
                <span>🛏️ {{ item.roomType || '标准间' }}</span>
                <span>💰 ¥{{ item.price || 200 }}/晚</span>
              </div>
              <div class="item-desc">{{ item.description }}</div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 选择天数 -->
    <div class="day-selector">
      <span>添加到：</span>
      <el-select v-model="selectedDay" placeholder="选择天数" style="width: 150px">
        <el-option
          v-for="day in availableDays"
          :key="day.value"
          :label="day.label"
          :value="day.value"
        />
      </el-select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const emit = defineEmits(['select', 'close'])

const activeTab = ref('attraction')
const searchKeyword = ref('')
const selectedDay = ref(0)

// 景点列表
const attractions = ref<any[]>([])
// 美食列表
const foods = ref<any[]>([])
// 酒店列表
const hotels = ref<any[]>([])

// 可用天数
const availableDays = ref([
  { label: '第1天', value: 0 },
  { label: '第2天', value: 1 },
  { label: '第3天', value: 2 }
])

// 过滤后的景点
const filteredAttractions = computed(() => {
  if (!searchKeyword.value) return attractions.value
  return attractions.value.filter(item =>
    item.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

// 过滤后的美食
const filteredFoods = computed(() => {
  if (!searchKeyword.value) return foods.value
  return foods.value.filter(item =>
    item.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

// 过滤后的酒店
const filteredHotels = computed(() => {
  if (!searchKeyword.value) return hotels.value
  return hotels.value.filter(item =>
    item.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

// 选择项目
const selectItem = (item: any) => {
  if (selectedDay.value === null) {
    ElMessage.warning('请先选择添加到哪一天')
    return
  }

  const selectedItem = {
    ...item,
    type: activeTab.value,
    duration: item.duration || (activeTab.value === 'attraction' ? 120 : 90),
    cost: item.ticketPrice || item.avgPrice || item.price || 0
  }

  emit('select', selectedItem, selectedDay.value)
}

// 加载数据
const loadData = async () => {
  try {
    // 加载景点
    const attractionsRes = await fetch('/api/attraction/list?pageNum=1&pageSize=100', {
      headers: {
        'auth-token': localStorage.getItem('auth-token') || ''
      }
    })
    if (attractionsRes.ok) {
      const result = await attractionsRes.json()
      // 后端返回PageInfo对象，需要从result.data.list获取数据
      const list = result.data?.list || result.data || []
      attractions.value = list.map((item: any) => transformAttraction(item))
    }

    // 加载美食
    const foodsRes = await fetch('/api/food/list?pageNum=1&pageSize=100', {
      headers: {
        'auth-token': localStorage.getItem('auth-token') || ''
      }
    })
    if (foodsRes.ok) {
      const result = await foodsRes.json()
      const list = result.data?.list || result.data || []
      foods.value = list.map((item: any) => transformFood(item))
    }

    // 加载酒店
    const hotelsRes = await fetch('/api/hotel/list?pageNum=1&pageSize=100', {
      headers: {
        'auth-token': localStorage.getItem('auth-token') || ''
      }
    })
    if (hotelsRes.ok) {
      const result = await hotelsRes.json()
      const list = result.data?.list || result.data || []
      hotels.value = list.map((item: any) => transformHotel(item))
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    // 使用模拟数据
    attractions.value = [
      {
        id: 1,
        name: '湄洲岛',
        description: '妈祖文化发源地，海上明珠',
        ticketPrice: 65,
        duration: 240,
        coverImage: '/src/views/imgs/1.jpg'
      },
      {
        id: 2,
        name: '南少林寺',
        description: '千年古刹，武术圣地',
        ticketPrice: 40,
        duration: 120,
        coverImage: '/src/views/imgs/2.jpg'
      },
      {
        id: 3,
        name: '九鲤湖',
        description: '九鲤飞瀑，人间仙境',
        ticketPrice: 50,
        duration: 180,
        coverImage: '/src/views/imgs/3.jpg'
      },
      {
        id: 4,
        name: '广化寺',
        description: '福建四大丛林之一',
        ticketPrice: 0,
        duration: 90,
        coverImage: '/src/views/imgs/4.jpg'
      },
      {
        id: 5,
        name: '木兰溪',
        description: '莆田母亲河，风景秀丽',
        ticketPrice: 0,
        duration: 120,
        coverImage: '/src/views/imgs/5.jpg'
      }
    ]

    foods.value = [
      {
        id: 101,
        name: '兴化米粉',
        description: '莆田特色小吃，细如发丝',
        avgPrice: 30,
        duration: 60,
        coverImage: '/src/views/imgs/2.jpg'
      },
      {
        id: 102,
        name: '莆田卤面',
        description: '地道莆田味道，汤浓面香',
        avgPrice: 35,
        duration: 60,
        coverImage: '/src/views/imgs/2.jpg'
      },
      {
        id: 103,
        name: '海鲜大排档',
        description: '新鲜海鲜，现点现做',
        avgPrice: 80,
        duration: 90,
        coverImage: '/src/views/imgs/2.jpg'
      },
      {
        id: 104,
        name: '红团',
        description: '传统糕点，节庆必备',
        avgPrice: 20,
        duration: 30,
        coverImage: '/src/views/imgs/2.jpg'
      }
    ]

    hotels.value = [
      {
        id: 201,
        name: '湄洲岛度假酒店',
        description: '海景房，设施齐全',
        price: 300,
        roomType: '海景房',
        coverImage: '/src/views/imgs/3.jpg'
      },
      {
        id: 202,
        name: '市区商务酒店',
        description: '交通便利，性价比高',
        price: 200,
        roomType: '标准间',
        coverImage: '/src/views/imgs/3.jpg'
      },
      {
        id: 203,
        name: '仙游温泉酒店',
        description: '温泉养生，环境优美',
        price: 400,
        roomType: '温泉房',
        coverImage: '/src/views/imgs/3.jpg'
      }
    ]
  }
}

// 转换景点数据 - 处理后端返回的images JSON数组
const transformAttraction = (item: any) => {
  let coverImage = '/src/views/imgs/1.jpg'
  if (item.images) {
    try {
      const images = JSON.parse(item.images)
      if (Array.isArray(images) && images.length > 0) {
        coverImage = images[0]
      }
    } catch (e) {
      // 如果解析失败，尝试直接使用
      coverImage = item.images
    }
  }
  return {
    ...item,
    coverImage,
    duration: item.duration || 120, // 默认为2小时
    ticketPrice: item.ticketPrice || 0
  }
}

// 转换美食数据 - 处理后端返回的images JSON数组
const transformFood = (item: any) => {
  let coverImage = '/src/views/imgs/2.jpg'
  if (item.images) {
    try {
      const images = JSON.parse(item.images)
      if (Array.isArray(images) && images.length > 0) {
        coverImage = images[0]
      }
    } catch (e) {
      coverImage = item.images
    }
  }
  return {
    ...item,
    coverImage,
    duration: item.duration || 60, // 默认为1小时
    avgPrice: item.avgPrice || 50
  }
}

// 转换酒店数据 - 处理后端返回的images JSON数组和starLevel
const transformHotel = (item: any) => {
  let coverImage = '/src/views/imgs/3.jpg'
  if (item.images) {
    try {
      const images = JSON.parse(item.images)
      if (Array.isArray(images) && images.length > 0) {
        coverImage = images[0]
      }
    } catch (e) {
      coverImage = item.images
    }
  }
  // 将星级转换为房型显示
  const roomTypeMap: Record<number, string> = {
    1: '经济房',
    2: '标准间',
    3: '商务间',
    4: '豪华间',
    5: '总统套房'
  }
  return {
    ...item,
    coverImage,
    roomType: item.roomType || roomTypeMap[item.starLevel] || '标准间',
    price: item.price || item.avgPrice || 200
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.item-selector {
  .selector-tabs {
    min-height: 500px;

    .search-bar {
      margin-bottom: 20px;
    }

    .items-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 16px;
      max-height: 400px;
      overflow-y: auto;
      padding: 4px;

      .item-card {
        background: #f8f9fa;
        border-radius: 12px;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
          background: #e3f2fd;
        }

        .item-image {
          height: 140px;
          overflow: hidden;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s;
          }

          &:hover img {
            transform: scale(1.1);
          }
        }

        .item-info {
          padding: 12px;

          h4 {
            margin: 0 0 8px 0;
            font-size: 16px;
            color: #333;
            font-weight: 600;
          }

          .item-meta {
            display: flex;
            gap: 12px;
            margin-bottom: 8px;
            font-size: 13px;
            color: #666;
          }

          .item-desc {
            font-size: 12px;
            color: #999;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }
    }
  }

  .day-selector {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 20px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;

    span {
      font-weight: 600;
      color: #333;
    }
  }
}
</style>
