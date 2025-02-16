<template>
    <div class="solution-container">
        <div class="solution-header-actions">
            <el-button type="primary" @click="goToPublish" class="publish-btn">
                <el-icon>
                    <EditPen />
                </el-icon>
                发布题解
            </el-button>
        </div>
        <el-skeleton :loading="loading" animated :rows="3">
            <template #default>
                <div v-if="solutions.length === 0" class="no-solutions">
                    <el-empty description="暂无题解" />
                </div>
                <div v-else class="solutions-list">
                    <div v-for="solution in solutions" :key="solution.id" class="solution-item">
                        <div class="solution-header">
                            <!-- <div class="user-info"> -->
                            <!-- <el-avatar :size="40" :src="solution.avatar" /> -->
                            <!-- <span class="nickName">{{ solution.nickName }}</span> -->
                            <!-- </div> -->
                            <h3 class="solution-title" @click="showSolutionDetail(solution.id)">
                                {{ solution.title }}
                            </h3>
                            <div class="solution-stats">
                                <el-button type="primary" text @click="likeSolution(solution.id)">
                                    <el-icon>
                                        <ThumbsUp />
                                    </el-icon>
                                    点赞数{{ solution.likeNum }}
                                </el-button>
                            </div>
                        </div>

                        <div class="solution-content">
                            <mavon-editor v-model="solution.content" :subfield="false" :boxShadow="false"
                                previewBackground="#ffffff" :defaultOpen="'preview'" :toolbarsFlag="false"
                                :editable="false" :scrollStyle="true" :ishljs="true" class="content-preview" />
                        </div>
                        <div v-if="solution.content.length > 300" class="read-more">
                            <el-button type="primary" link @click="showSolutionDetail(solution.id)">
                                阅读更多
                            </el-button>
                        </div>
                        <div class="solution-footer">
                            <span class="time">作者：{{ solution.nickName }}</span>
                            <span class="time">发布于：{{ formatDateArray(solution.createTime) }}</span>
                        </div>
                    </div>
                </div>
            </template>
        </el-skeleton>
    </div>
</template>
<script setup>
import { ref, watch, onMounted } from 'vue'
import request from '@/util/request'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { EditPen } from '@element-plus/icons-vue'

const solutions = ref([])
const loading = ref(true)
const router = useRouter()
// 定义 props
const props = defineProps({
    qid: {
        type: Number,
        required: true
    }
})
// 获取题解列表
const getSolutions = async () => {
    try {
        console.log("区域内测试" + props.qid)
        const qid = props.qid
        const res = await request.get(`/question/tutorial/${qid}`)
        if (res.code === 200) {
            solutions.value = res.data
        } else {
            ElMessage.error('获取题解失败：' + res.msg)
        }
    } catch (error) {
        ElMessage.error('获取题解失败：' + error.message)
    } finally {
        loading.value = false
    }
}
watch(() => props.qid, (newQid) => {
    if (newQid) {
        getSolutions()
    }
}, { immediate: true })
const formatDateArray = (dateArray) => {
    return `${dateArray[0]}年${dateArray[1]}月${dateArray[2]}日`
}

const showSolutionDetail = (solutionId) => {
    router.push(`/discuss/${solutionId}`)
}

const goToPublish = () => {
    //当前页面打开
    //router.push({
    //    path: '/discuss',
    //    query: {
    //        type: '1',
    //        qid: props.qid
    //    }
    //})
    //新页面
    const url = `/discuss?type=1&qid=${props.qid}`
    window.open(url, '_blank') // '_blank' 参数会在新标签页中打开链接
}

onMounted(() => {
    // console.log(props.qid)
    // getSolutions()
})
</script>
<style lang="scss" scoped>
.solution-container {
    padding: 20px;

    .solution-header-actions {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 20px;

        .publish-btn {
            display: flex;
            align-items: center;
            gap: 5px;

            &:hover {
                transform: translateY(-2px);
                transition: transform 0.3s ease;
            }
        }
    }

    .solutions-list {
        .solution-item {

            background: #fff;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

            .solution-header {

                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;

                .user-info {
                    display: flex;
                    align-items: center;
                    gap: 10px;

                    .nickName {
                        font-weight: bold;
                    }
                }

                .solution-stats {
                    display: flex;
                    gap: 15px;
                }
            }

            .solution-title {
                font-size: 18px;
                margin: 10px 0;
                color: #333;
                cursor: pointer;

                &:hover {
                    color: #409EFF;
                }
            }

            .solution-content {
                margin: 15px 0;
                max-height: 100px;
                overflow: hidden;

                //利用:deep()选择器 突破Vue默认的样式隔离，修改深层子组件的样式
                //如果不用这个就看不了完整内容，相当于被隐藏了
                :deep(.content-preview) {
                    max-height: 100px;
                }
            }

            .read-more {
                text-align: center;
                margin-top: 10px;
            }

            .solution-footer {
                display: flex;
                justify-content: space-between;
                color: #999;
                font-size: 14px;
            }
        }
    }

    .no-solutions {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 200px;
    }
}
</style>
