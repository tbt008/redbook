<script setup lang="ts">
import { reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/util/request'

const props = defineProps<{
  userInfo?: Record<string, any>
}>()

const form = reactive({
  nickName: '',
  description: '',
  sex: 0
})

watch(
  () => props.userInfo,
  (value) => {
    form.nickName = value?.nickName || ''
    form.description = value?.description || ''
    form.sex = Number(value?.sex ?? 0)
  },
  { immediate: true, deep: true }
)

const saveInfo = async () => {
  const payload = {
    ...(props.userInfo || {}),
    nickName: form.nickName,
    description: form.description,
    sex: form.sex
  }

  const res: any = await request.put('/user/update', payload)
  if (res.code === 200) {
    ElMessage.success('个人资料已更新')
  }
}
</script>

<template>
  <div class="person-info">
    <div class="person-info__header">
      <div>
        <h2>个人资料</h2>
        <p>在这里维护昵称、简介和性别信息。</p>
      </div>
      <el-avatar :src="props.userInfo?.avatar" :size="72" />
    </div>

    <div class="person-info__panel">
      <el-form label-width="88px">
        <el-form-item label="昵称">
          <el-input v-model="form.nickName" maxlength="24" show-word-limit />
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="form.sex">
            <el-radio :label="0">保密</el-radio>
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="form.description" type="textarea" :rows="6" maxlength="200" show-word-limit />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveInfo">保存修改</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.person-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.person-info__header,
.person-info__panel {
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(31, 41, 51, 0.06);
}

.person-info__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 28px;

  h2 {
    margin: 0;
    font-size: 24px;
    color: #16342c;
  }

  p {
    margin: 8px 0 0;
    color: #667085;
  }
}

.person-info__panel {
  padding: 28px;
}
</style>
