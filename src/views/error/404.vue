<template>
    <div class="error-page">
        <div class="error-container">
            <div class="error-number">
                <div class="four">4</div>
                <div class="zero">0</div>
                <div class="four">4</div>
            </div>
            <div class="error-message">
                <h1>Oops! 页面走丢了</h1>
                <p>看来你来到了一个未知的领域</p>
                <!-- <el-button type="primary" @click="goHome" class="home-button">返回首页</el-button> -->
                <el-button type="primary" @click="goback" class="home-button">返回上一页</el-button>
            </div>
            <div class="circles">
                <div class="circle circle-1"></div>
                <div class="circle circle-2"></div>
                <div class="circle circle-3"></div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
const goHome = () => {
    router.push('/home')
}

const goback = () => {
    router.back()
}
</script>

<style scoped lang="scss">
.error-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #6B73FF 0%, #000DFF 100%);
    position: relative;
    overflow: hidden;
}

.error-container {
    text-align: center;
    color: white;
    position: relative;
    z-index: 1;
}

.error-number {
    display: flex;
    justify-content: center;
    font-size: 150px;
    font-weight: bold;
    margin-bottom: 20px;

    .four,
    .zero {
        animation: bounce 2s infinite;
        text-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
    }

    .four:first-child {
        animation-delay: 0.2s;
    }

    .zero {
        animation-delay: 0.4s;
    }

    .four:last-child {
        animation-delay: 0.6s;
    }
}

.error-message {
    h1 {
        font-size: 32px;
        margin-bottom: 10px;
        opacity: 0;
        animation: fadeIn 0.8s forwards;
        animation-delay: 1s;
    }

    p {
        font-size: 18px;
        margin-bottom: 30px;
        opacity: 0;
        animation: fadeIn 0.8s forwards;
        animation-delay: 1.2s;
    }
}

.home-button {
    padding: 12px 30px;
    border: none;
    border-radius: 25px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    opacity: 0;
    animation: fadeIn 0.8s forwards;
    animation-delay: 1.4s;
    position: relative;
    z-index: 10;
    pointer-events: auto;

    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
    }

    &:active {
        transform: translateY(-1px);
    }
}

.circles {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
}

.circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    animation: float 6s infinite;

    &.circle-1 {
        width: 200px;
        height: 200px;
        top: 10%;
        left: 15%;
        animation-delay: 0s;
    }

    &.circle-2 {
        width: 300px;
        height: 300px;
        top: 60%;
        right: 10%;
        animation-delay: 2s;
    }

    &.circle-3 {
        width: 150px;
        height: 150px;
        bottom: 20%;
        left: 25%;
        animation-delay: 4s;
    }
}

@keyframes bounce {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-20px);
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes float {

    0%,
    100% {
        transform: translateY(0) rotate(0deg);
    }

    50% {
        transform: translateY(-20px) rotate(180deg);
    }
}

@media (max-width: 768px) {
    .error-number {
        font-size: 100px;
    }

    .error-message {
        h1 {
            font-size: 24px;
        }

        p {
            font-size: 16px;
        }
    }

    .circle {
        &.circle-1 {
            width: 100px;
            height: 100px;
        }

        &.circle-2 {
            width: 150px;
            height: 150px;
        }

        &.circle-3 {
            width: 80px;
            height: 80px;
        }
    }
}
</style>