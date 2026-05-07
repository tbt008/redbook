<template>
    <div class="mes-all">
        <div class=" message-container">
            <!-- 左侧导航栏 -->
            <div class="message-sidebar">
                <div class="sidebar-header">
                    <h2>消息中心</h2>
                </div>
                <div class="message-menu">
                    <div class="menu-item active">
                        <i class="iconfont icon-notice"></i>
                        <span>系统通知</span>
                        <span class="unread-count" v-if="unreadCount">{{ unreadCount }}</span>
                    </div>
                    <!-- <div class="menu-item disabled">
                    <i class="iconfont icon-at"></i>
                    <span>@我的</span>
                </div>
                <div class="menu-item disabled">
                    <i class="iconfont icon-like"></i>
                    <span>点赞和收藏</span>
                </div>
                <div class="menu-item disabled">
                    <i class="iconfont icon-comment"></i>
                    <span>评论回复</span>
                </div>
                <div class="menu-item disabled">
                    <i class="iconfont icon-whisper"></i>
                    <span>私信</span>
                </div> -->
                </div>
            </div>
            <!-- 右侧内容区 -->
            <div class="message-content">
                <div class="message-wrapper">
                    <div class="message-header">
                        <div class="header-left">
                            <h3>系统通知</h3>
                            <span class="message-count">共 {{ messages.length }} 条</span>
                        </div>
                        <!-- <div class="header-right">
                        <el-button type="primary" size="small" @click="markAllRead"
                            :disabled="!unreadCount">全部已读</el-button>
                    </div> -->
                    </div>
                    <div class="message-list" v-loading="loading">
                        <template v-if="messages.length">
                            <div v-for="message in messages" :key="message.id" class="message-item"
                                :class="{ 'message-unread': !message.status }">
                                <div class="message-title">{{ message.title }}</div>
                                <!-- <div class="message-text">{{ message.content }}</div> -->
                                <div class="message-text" v-html="message.content"></div>
                                <div class="message-footer">
                                    <span class="message-time">{{ formatTime(message.messageSentTime) }}</span>
                                </div>
                            </div>
                        </template>
                        <el-empty v-else description="暂无系统通知" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/util/request'
import { formatDateTime } from '@/utils/date'

const messages = ref([])
const loading = ref(false)
const unreadCount = ref(0)
const formatTime = (time) => {
    return formatDateTime(time, '时间待确认')
}
// 获取系统通知
const getSystemMessages = async () => {
    loading.value = true
    try {
        const res = await request.get('/user/Notice/message/system')
        if (res.code === 200) {
            if (res.data != null) {
                messages.value = res.data;

                // 触发自定义事件通知未读消息数更新
                window.dispatchEvent(new CustomEvent('updateUnreadCount'))
            }
        }
    } catch (error) {
        console.error('获取系统通知失败:', error)
        ElMessage.error('获取系统通知失败')
    } finally {
        loading.value = false
    }
}


const getUnreadCount = async () => {
    try {
        const res = await request.get('/user/Notice/unRead')
        if (res.code === 200) {
            unreadCount.value = res.data
        }
    } catch (error) {
        console.error('获取未读消息数失败:', error)
    }
}

onMounted(() => {
    getUnreadCount()
    getSystemMessages()
})
</script>

<style scoped lang="scss">
.mes-all {
    overflow: hidden;
    /* 隐藏滚动，防止超出内容溢出 */
    background: linear-gradient(135deg, #f6f8fc 0%, #f0f4f8 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    // 稍微去掉一点，因为导航栏占用
    height: 93.8vh;
    width: 100vw;
}

.message-container {
    display: flex;
    //窗口高度
    height: 92vh;
    background: #fff;
    width: 80vw;
    margin: 0 auto;
    border-radius: 12px;
    box-shadow: 1px 2px 4px rgba(0, 0, 0, 0.1);
    border: 1px solid #e3e5e7;
}

.message-sidebar {
    width: 200px;
    border-right: 1px solid #e3e5e7;

    .sidebar-header {
        padding: 20px;
        border-bottom: 1px solid #e3e5e7;

        h2 {
            margin: 0;
            font-size: 18px;
            color: #18191c;
        }
    }
}

.message-list {
    flex: 1;
    overflow-y: auto;
    height: 100%;
    scrollbar-width: thin; // Firefox 滚动条宽度
    scrollbar-color: #d4d4d4 transparent; // Firefox 滚动条颜色

    &::-webkit-scrollbar {
        width: 6px; // 滚动条宽度
    }

    &::-webkit-scrollbar-thumb {
        background: #d4d4d4; // 滚动条颜色
        border-radius: 4px; // 滚动条圆角
    }

    &::-webkit-scrollbar-thumb:hover {
        background: #b3b3b3; // 滚动条悬停颜色
    }

    &::-webkit-scrollbar-track {
        background: transparent; // 滚动条轨道背景
    }
}

.message-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 20px;
    overflow: hidden;
}

.message-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden; //防止内容溢出
}

.message-menu {
    .menu-item {
        padding: 16px 20px;
        display: flex;
        align-items: center;
        cursor: pointer;
        color: #18191c;

        &:hover:not(.disabled) {
            background: #f1f2f3;
        }

        &.active {
            background: #e3e5e7;
        }

        &.disabled {
            cursor: not-allowed;
            color: #9499a0;
        }

        i {
            margin-right: 12px;
            font-size: 18px;
        }

        .unread-count {
            margin-left: auto;
            background: #FA3F3F;

            color: white;
            padding: 0 6px;
            height: 16px;
            line-height: 16px;
            border-radius: 8px;
            font-size: 12px;
        }
    }
}

.message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .header-left {
        display: flex;
        align-items: center;
        gap: 12px;

        h3 {
            margin: 0;
            font-size: 16px;
            color: #18191c;
        }

        .message-count {
            color: #9499a0;
            font-size: 14px;
        }
    }
}

.message-item {
    padding: 16px;
    border-bottom: 1px solid #e3e5e7;

    &.message-unread {
        background: #f6f7f8;
    }

    .message-item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
    }

    .message-title {
        font-size: 14px;
        color: #18191c;
        font-weight: 500;
        margin-bottom: 10px;
        // 字体加粗
        font-weight: bold;
    }

    .message-text {
        color: #61666d;
        line-height: 1.5;
        margin-bottom: 8px;
    }

    .message-footer {
        .message-time {
            color: #9499a0;
            font-size: 12px;
        }
    }
}
</style>
