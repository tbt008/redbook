<script setup lang="ts">
import { useRouter } from 'vue-router';
const router = useRouter();
</script>
<template>
    <el-backtop :right="100" :bottom="100" />
    <!-- AI助手按钮 -->
    <div class="ai-button-container">
        <el-button class="ai-button" @click="router.push('/ai')">
            <el-icon class="ai-icon">
                <ChatDotRound />
            </el-icon>
            <span class="ai-text">AI</span>
        </el-button>
    </div>
</template>

<style>
/* AI助手按钮 */
.ai-button-container {
    position: fixed;
    right: 2rem;
    bottom: 2rem;
    z-index: 100;
}

.ai-button {
    width: 3.15rem;
    height: 3.15rem;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    border: none;
    color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
}

.ai-button:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(99, 102, 241, 0.35);
}

.ai-icon {
    font-size: 1.5rem;
    margin-bottom: 0.25rem;
}
</style>