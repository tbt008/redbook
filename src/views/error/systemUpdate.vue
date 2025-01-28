<template>
    <div class="maintenance">
        <div class="content">
            <!-- <img src="" alt="系统维护" class="maintenance-img"> -->
            <h1>系统升级维护中</h1>
            <div class="message">
                <p>亲爱的用户：</p>
                <p>系统正在进行版本升级，预计需要一段时间。</p>
                <p>给您带来的不便，敬请谅解。</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'


onMounted(() => {
})
</script>

<style scoped>
.maintenance {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f5f7fa;
}

.content {
    text-align: center;
    padding: 40px;
}

.maintenance-img {
    width: 200px;
    margin-bottom: 20px;
}

h1 {
    color: #303133;
    margin-bottom: 30px;
}

.message {
    color: #606266;
    line-height: 1.8;
    margin-bottom: 30px;
}

.time {
    color: #909399;
    font-size: 14px;
    line-height: 1.6;
}
</style>
