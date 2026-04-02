<template>
  <div class="alipay-test-container">
    <el-card class="test-card">
      <div slot="header">
        <h2>支付宝沙箱支付测试</h2>
      </div>
      
      <el-form :model="orderForm" label-width="120px">
        <el-form-item label="订单号">
          <el-input v-model="orderForm.orderNo" placeholder="输入订单号"></el-input>
        </el-form-item>
        
        <el-form-item label="订单金额">
          <el-input v-model="orderForm.amount" type="number">
            <template slot="append">元</template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="商品名称">
          <el-input v-model="orderForm.subject" placeholder="输入商品名称"></el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="createOrder" :loading="loading">
            创建订单并支付
          </el-button>
        </el-form-item>
      </el-form>
      
      <!-- 支付表单显示区域 -->
      <div v-if="payQrCodeUrl" class="pay-container">
        <h3>请使用支付宝沙箱 App 扫码支付</h3>
        <el-image :src="payQrCodeUrl" fit="contain" style="width: 220px; height: 220px" />
        <div class="qrcode-tip">完成支付后返回此页查询状态。</div>
        <el-button type="success" @click="checkPaymentStatus" class="check-btn">
          我已支付，查询状态
        </el-button>
      </div>
      
      <!-- 支付状态显示 -->
      <div v-if="paymentStatus" class="status-container">
        <el-alert
          :title="paymentStatus.message"
          :type="paymentStatus.type"
          :description="paymentStatus.description"
          show-icon>
        </el-alert>
      </div>
    </el-card>
    
    <!-- 配置说明 -->
    <el-card class="config-card">
      <div slot="header">
        <h3>支付宝沙箱配置说明</h3>
      </div>
      
      <el-collapse v-model="activeNames">
        <el-collapse-item title="1. 获取沙箱配置信息" name="1">
          <ol>
            <li>访问 <a href="https://open.alipay.com/develop/sandbox" target="_blank">支付宝开放平台沙箱</a></li>
            <li>登录后在"沙箱环境"页面获取以下信息：
              <ul>
                <li><strong>APPID</strong>：应用的唯一标识</li>
                <li><strong>支付宝公钥</strong>：用于验证支付回调签名</li>
              </ul>
            </li>
            <li>使用支付宝密钥工具生成RSA2密钥对：
              <ul>
                <li><strong>商户私钥</strong>：用于签名支付请求</li>
                <li>工具下载：<a href="https://opendocs.alipay.com/open/291/106097/" target="_blank">支付宝密钥工具</a></li>
              </ul>
            </li>
          </ol>
        </el-collapse-item>
        
        <el-collapse-item title="2. 配置到 application.yml" name="2">
          <pre class="config-code">alipay:
  # 支付宝应用ID
  app-id: 你的APPID
  # 支付宝私钥（PKCS8格式RSA2私钥）
  private-key: 你的商户私钥
  # 支付宝公钥
  alipay-public-key: 你的支付宝公钥
  # 支付宝网关地址（沙箱环境）
  gateway: https://openapi-sandbox.dl.alipaydev.com/gateway.do
  # 回调通知地址（沙箱测试可使用内网穿透）
  notify-url: http://localhost:9090/api/alipay/notify
  # 支付成功跳转地址
  return-url: http://localhost:9090/payment/success
  # 测试金额
  test-amount: "0.01"</pre>
        </el-collapse-item>
        
        <el-collapse-item title="3. 沙箱环境注意事项" name="3">
          <ul>
            <li><strong>沙箱网关</strong>：必须使用 <code>https://openapi-sandbox.dl.alipaydev.com/gateway.do</code></li>
            <li><strong>支付工具</strong>：需要下载"支付宝沙箱"APP，使用沙箱版的支付宝</li>
            <li><strong>回调通知</strong>：沙箱环境回调需要公网地址，可使用内网穿透工具（如ngrok）</li>
            <li><strong>资金流动</strong>：沙箱环境的资金是虚拟的，不会产生真实的交易</li>
            <li><strong>沙箱账号</strong>：在沙箱控制台可以查看买家/卖家账号信息</li>
          </ul>
        </el-collapse-item>
        
        <el-collapse-item title="4. 内网穿透配置（接收回调）" name="4">
          <p>如果需要接收支付宝回调通知，需要配置内网穿透：</p>
          <pre class="config-code"># 使用 ngrok 示例
ngrok http 9090

# 配置回调地址为 ngrok 提供的公网地址
# 例如：https://xxxx.ngrok.io/api/alipay/notify</pre>
          <p>其他内网穿透工具：frp、natapp、 localhosttunnel 等</p>
        </el-collapse-item>
        
        <el-collapse-item title="5. 测试流程" name="5">
          <ol>
            <li>启动后端服务：确保 9090 端口可访问</li>
            <li>创建订单：调用接口创建测试订单</li>
            <li>获取支付链接：调用 <code>/api/order/pay/qrcode/{orderNo}</code></li>
            <li>扫码支付：使用沙箱版支付宝APP扫描二维码</li>
            <li>查询状态：调用 <code>/api/order/pay/status/{orderNo}</code> 查询支付结果</li>
          </ol>
        </el-collapse-item>
      </el-collapse>
    </el-card>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AlipayTest',
  data() {
    return {
      orderForm: {
        orderNo: '',
        amount: '0.01',
        subject: '测试商品'
      },
      loading: false,
      payQrCodeUrl: '',
      paymentStatus: null,
      activeNames: ['1', '2', '3']
    };
  },
  methods: {
    async createOrder() {
      if (!this.orderForm.orderNo) {
        this.$message.error('请输入订单号');
        return;
      }
      
      this.loading = true;
      this.payQrCodeUrl = '';
      this.paymentStatus = null;
      
      try {
        // 先创建订单
        await axios.post('/api/order/create', {
          orderNo: this.orderForm.orderNo,
          // 其他订单信息...
        });
        
        // 获取支付二维码
        const response = await axios.get(`/api/order/pay/qrcode/${this.orderForm.orderNo}`);
        
        if (response.data.code === 200) {
          this.payQrCodeUrl = response.data.data.qrCodeUrl || '';
          if (!this.payQrCodeUrl) {
            throw new Error('未获取到支付宝支付二维码');
          }
          this.$message.success('订单创建成功，请使用支付宝沙箱 App 扫码支付');
        } else {
          this.$message.error(response.data.message || '创建订单失败');
        }
      } catch (error) {
        console.error('创建订单失败:', error);
        this.$message.error('创建订单失败：' + (error.response?.data?.message || error.message));
      } finally {
        this.loading = false;
      }
    },
    async checkPaymentStatus() {
      try {
        const response = await axios.get(`/api/order/pay/status/${this.orderForm.orderNo}`);
        
        if (response.data.code === 200) {
          const data = response.data.data;
          
          if (data.paid || data.orderStatus === 1) {
            this.paymentStatus = {
              type: 'success',
              message: '支付成功！',
              description: `订单号：${this.orderForm.orderNo}`
            };
            this.$message.success('支付成功！');
          } else {
            this.paymentStatus = {
              type: 'warning',
              message: '等待支付',
              description: '请确认是否已完成支付，或稍后再次查询'
            };
          }
        } else {
          this.$message.error(response.data.message || '查询失败');
        }
      } catch (error) {
        console.error('查询支付状态失败:', error);
        this.$message.error('查询失败：' + (error.response?.data?.message || error.message));
      }
    }
  }
};
</script>

<style scoped>
.alipay-test-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.test-card {
  margin-bottom: 20px;
}

.pay-container {
  margin-top: 30px;
  padding: 20px;
  border: 2px dashed #409eff;
  border-radius: 8px;
  text-align: center;
}

.pay-form {
  margin: 20px 0;
  display: inline-block;
}

.qrcode-tip {
  margin-top: 12px;
  color: #666;
}

.check-btn {
  margin-top: 20px;
}

.status-container {
  margin-top: 20px;
}

.config-card {
  margin-top: 20px;
}

.config-code {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
}

ol, ul {
  padding-left: 25px;
  line-height: 1.8;
}

li {
  margin-bottom: 8px;
}

a {
  color: #409eff;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

code {
  background-color: #f0f0f0;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}
</style>
