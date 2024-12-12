<template>
  <div ref="container" class="container">
    <div class="my-left" :style="leftStyle">
      <slot name="one"></slot>
    </div>
    <div ref="spliter" style="height: 100%; width: 10px" class="my-spliter" />
    <div class="my-right" :style="rightStyle">
      <slot name="two"></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const container = ref(null)
const spliter = ref(null)
const leftStyle = ref({})
const rightStyle = ref({})
const ratio = ref(0.5)

function updatePaneStyles(newRatio) {
  leftStyle.value = { width: `calc(${newRatio * 100}% - 5px)` }
  rightStyle.value = { width: `calc(${(1 - newRatio) * 100}% - 5px)` }
}

function handleResize(e) {
  const containerWidth = container.value.clientWidth
  const rect = container.value.getBoundingClientRect()
  const initX = rect.left
  function onMouseMove(e) {
    e.preventDefault()
    // 限制鼠标移动事件的范围为container容器四至范围内
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    ) {
      onMouseUp()
    }
    const moveScale = (e.clientX - initX) / containerWidth
    const newRatio = moveScale
    if (newRatio > 0.05 && newRatio < 0.95) {
      ratio.value = newRatio
      updatePaneStyles(newRatio)
    }
  }

  function onMouseUp() {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

function onDblClick(e) {
  ratio.value = 0.5
  updatePaneStyles(ratio.value)
}

onMounted(() => {
  updatePaneStyles(ratio.value)
  if (spliter.value) {
    spliter.value.addEventListener('mousedown', handleResize, false)
    spliter.value.addEventListener('dblclick', onDblClick, false)
  }
})
onUnmounted(() => {
  if (spliter.value) {
    spliter.value.removeEventListener('mousedown', handleResize)
    spliter.value.removeEventListener('dblclick', onDblClick)
  }
})
</script>

<style scoped>
.container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
}

.my-left {
  height: 100%;
  z-index: 1;
}

.my-right {
  height: 100%;
  z-index: 1;
}

.my-spliter {
  cursor: col-resize;
  position: relative;
  z-index: 2;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  &:before,
  &:after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    background-color: rgba(0, 0, 0, 0.15);
    width: 1.5px;
    height: 30px;
  }

  &:before {
    margin-left: -2px;
  }

  &:after {
    margin-left: 1px;
  }

  &:hover:before,
  &:hover:after {
    width: 1.5px;
    background-color: rgba(0, 0, 0, 0.35);
  }
}
</style>
