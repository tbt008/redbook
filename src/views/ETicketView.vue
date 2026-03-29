<template>
  <div class="eticket-view">
    <el-header class="header">
      <div class="header-content">
        <div class="logo" @click="goHome">
          <h1>莆田文旅</h1>
        </div>
        <el-button @click="goBack">返回</el-button>
      </div>
    </el-header>

    <el-main class="main-content">
      <div class="ticket-container">
        <div class="ticket-card">
          <div class="ticket-header">
            <h2>电子票</h2>
            <el-tag v-if="eTicket.isUsed === 0" type="success" size="large">未使用</el-tag>
            <el-tag v-else type="info" size="large">已使用</el-tag>
          </div>

          <div class="ticket-body">
            <!-- 二维码 -->
            <div class="qr-code-section">
              <div class="qr-code">
                <el-image :src="eTicket.qrCode" fit="contain" style="width: 200px; height: 200px" />
              </div>
              <div class="ticket-code">票务编码：{{ eTicket.ticketCode }}</div>
              <div class="tip">请在景区入口出示此二维码</div>
            </div>

            <!-- 订单信息 -->
            <div class="order-info">
              <h3>订单信息</h3>
              <div class="info-item">
                <span class="label">订单号：</span>
                <span class="value">{{ order.orderNo }}</span>
              </div>
              <div class="info-item">
                <span class="label">门票名称：</span>
                <span class="value">{{ order.ticketName }}</span>
              </div>
              <div class="info-item">
                <span class="label">购买数量：</span>
                <span class="value">{{ order.ticketCount }} 张</span>
              </div>
              <div class="info-item">
                <span class="label">游玩日期：</span>
                <span class="value">{{ order.visitDate }}</span>
              </div>
              <div class="info-item">
                <span class="label">总金额：</span>
                <span class="value amount">¥{{ order.totalAmount }}</span>
              </div>
            </div>

            <!-- 游客信息 -->
            <div class="visitor-info">
              <h3>游客信息</h3>
              <div class="info-item">
                <span class="label">姓名：</span>
                <span class="value">{{ order.visitorName }}</span>
              </div>
              <div class="info-item">
                <span class="label">身份证号：</span>
                <span class="value">{{ maskIdCard(order.visitorIdCard) }}</span>
              </div>
              <div class="info-item">
                <span class="label">联系电话：</span>
                <span class="value">{{ order.visitorPhone }}</span>
              </div>
            </div>

            <!-- 使用信息 -->
            <div v-if="eTicket.isUsed === 1" class="use-info">
              <h3>使用信息</h3>
              <div class="info-item">
                <span class="label">使用时间：</span>
                <span class="value">{{ formatTime(eTicket.useTime) }}</span>
              </div>
            </div>
          </div>

          <div class="ticket-footer">
            <el-button type="primary" @click="downloadTicket">下载电子票</el-button>
            <el-button @click="shareTicket">分享</el-button>
          </div>
        </div>

        <!-- 温馨提示 -->
        <div class="tips-card">
          <h3>温馨提示</h3>
          <ul>
            <li>请在游玩日期当天使用，过期无效</li>
            <li>入园时请出示此二维码供工作人员扫描</li>
            <li>每张电子票仅可使用一次</li>
            <li>请妥善保管电子票，避免截图泄露</li>
            <li>如有疑问，请联系客服：400-123-4567</li>
          </ul>
        </div>
      </div>
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/util/request'
import dayjs from 'dayjs'

const router = useRouter()
const route = useRoute()

const orderNo = ref(route.params.orderNo as string)
const eTicket = ref<any>({})
const order = ref<any>({})

// 加载电子票信息
const loadETicket = async () => {
  try {
    // 先获取订单信息
    const orderRes: any = await request.get(`/order/${orderNo.value}`)
    if (orderRes && orderRes.data) {
      order.value = orderRes.data
      
      // 再获取电子票信息
      const ticketRes: any = await request.get(`/eticket/order/${order.value.id}`)
      if (ticketRes && ticketRes.data) {
        eTicket.value = ticketRes.data
      }
    }
  } catch (error) {
    console.error('加载电子票失败', error)
    ElMessage.error('加载电子票失败')
  }
}

// 脱敏身份证号
const maskIdCard = (idCard: string) => {
  if (!idCard) return ''
  return idCard.replace(/^(.{6})(?:\d+)(.{4})$/, '$1********$2')
}

// 格式化时间
const formatTime = (time: string) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

// 下载电子票
const downloadTicket = () => {
  ElMessage.info('下载功能开发中')
}

// 分享电子票
const shareTicket = () => {
  ElMessage.info('分享功能开发中')
}

const goHome = () => router.push('/')
const goBack = () => router.back()

onMounted(() => {
  loadETicket()
})
</script>

<style scoped lang="scss">
.eticket-view {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0;
  height: 60px;
  line-height: 60px;

  .header-content {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;

    .logo h1 {
      margin: 0;
      font-size: 24px;
      font-weight: bold;
      color: #ff6b6b;
      cursor: pointer;
    }
  }
}

.main-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.ticket-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.ticket-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

  .ticket-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 32px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;

    h2 {
      margin: 0;
      font-size: 24px;
    }
  }

  .ticket-body {
    padding: 32px;

    .qr-code-section {
      text-align: center;
      padding: 32px;
      background: #f9f9f9;
      border-radius: 8px;
      margin-bottom: 32px;

      .qr-code {
        display: inline-block;
        padding: 16px;
        background: #fff;
        border-radius: 8px;
        margin-bottom: 16px;
      }

      .ticket-code {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 8px;
      }

      .tip {
        color: #999;
        font-size: 14px;
      }
    }

    .order-info,
    .visitor-info,
    .use-info {
      margin-bottom: 32px;

      h3 {
        margin: 0 0 16px 0;
        padding-bottom: 12px;
        border-bottom: 2px solid #f0f0f0;
      }

      .info-item {
        display: flex;
        padding: 12px 0;
        border-bottom: 1px solid #f5f5f5;

        .label {
          width: 120px;
          color: #999;
        }

        .value {
          flex: 1;
          font-weight: 500;

          &.amount {
            color: #ff6b6b;
            font-size: 18px;
          }
        }
      }
    }
  }

  .ticket-footer {
    padding: 24px 32px;
    background: #f9f9f9;
    display: flex;
    gap: 16px;
    justify-content: center;
  }
}

.tips-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

  h3 {
    margin: 0 0 16px 0;
    color: #ff6b6b;
  }

  ul {
    margin: 0;
    padding-left: 20px;

    li {
      line-height: 2;
      color: #666;
    }
  }
}
</style>

