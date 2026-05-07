<template>
  <div class="payment-methods">
    <div class="payment-method-title">支付方式</div>
    <button class="payment-method-card selected" type="button" aria-label="支付宝">
      <span class="alipay-icon">支</span>
      <span class="payment-method-name">支付宝</span>
      <span class="payment-method-tag">默认</span>
    </button>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'PaymentMethodCard'
})
</script>

<style scoped>
.payment-methods {
  width: min(100%, 520px);
  margin: 0 auto 24px;
  text-align: left;
}

.payment-method-title {
  margin-bottom: 10px;
  text-align: center;
  font-size: 15px;
  color: #8a8f98;
}

.payment-method-card {
  width: 100%;
  min-height: 62px;
  padding: 0 28px;
  border: 2px solid #1677ff;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 12px 28px rgba(22, 119, 255, 0.08);
  display: flex;
  align-items: center;
  gap: 18px;
  cursor: default;
  font: inherit;
}

.alipay-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: #1677ff;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  font-size: 26px;
  font-weight: 800;
  line-height: 1;
}

.payment-method-name {
  flex: 1;
  min-width: 0;
  color: #1f2329;
  font-size: 18px;
  font-weight: 700;
}

.payment-method-tag {
  flex: 0 0 auto;
  padding: 5px 12px;
  border: 1px solid #95d475;
  border-radius: 8px;
  color: #52c41a;
  font-size: 14px;
  line-height: 1;
  background: #fbfff8;
}

@media (max-width: 520px) {
  .payment-method-card {
    min-height: 58px;
    padding: 0 16px;
    gap: 12px;
  }

  .payment-method-name {
    font-size: 16px;
  }
}
</style>
