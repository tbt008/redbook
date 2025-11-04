<template>
  <div class="captcha-container">
    <div class="captcha-input">
      <el-input
        v-model="captchaCode"
        placeholder="请输入验证码"
        size="large"
        clearable
        @input="updateCaptchaCode"
      />
    </div>
    <img
      :src="captchaImage"
      alt="验证码"
      @click="refreshCaptcha"
      class="captcha-image"
      title="点击刷新"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import request from '../util/request';

// 定义props
const props = defineProps<{
  modelValue?: string;
}>();

// 定义emits
const emit = defineEmits<{
  'update:modelValue': [value: string];
  'captchaIdChange': [value: string];
}>();

// 验证码图片和ID
const captchaImage = ref('');
const captchaId = ref('');
const captchaCode = ref(props.modelValue || '');

// 生成验证码
const generateCaptcha = async () => {
  try {
    const response = await request.get('/captcha/generate');
    if (response.code === 200) {
      captchaImage.value = response.data.captchaImage;
      captchaId.value = response.data.captchaId;
      // 发送captchaId给父组件
      emit('captchaIdChange', captchaId.value);
    } else {
      ElMessage.error('验证码生成失败，请重试');
    }
  } catch (error) {
    console.error('生成验证码失败:', error);
    ElMessage.error('验证码生成失败，请检查网络连接');
  }
};

// 刷新验证码
const refreshCaptcha = () => {
  // 清空验证码输入
  captchaCode.value = '';
  emit('update:modelValue', '');
  generateCaptcha();
};

// 更新验证码输入
const updateCaptchaCode = () => {
  emit('update:modelValue', captchaCode.value);
};

// 暴露方法给父组件
defineExpose({
  refreshCaptcha,
  getCaptchaId: () => captchaId.value
});

// 组件挂载时生成验证码
onMounted(() => {
  generateCaptcha();
});
</script>

<style scoped>
.captcha-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.captcha-image {
  width: 150px;
  height: 40px;
  cursor: pointer;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  transition: all 0.3s;
}

.captcha-image:hover {
  border-color: #409eff;
}

.captcha-input {
  flex: 1;
}
</style>