<template>
  <div ref="container" class="container">
    <div class="my-left" :style="{ height: topHeight }">
      <slot name="one"></slot>
    </div>
    <div ref="spliter" style="width: 100%; height: 10px" class="my-spliter" />
    <div class="my-right" :style="{ height: bottomHeight }">
      <slot name="two"></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const container = ref(null)
const spliter = ref(null)
const topHeight = ref('500px')
const bottomHeight = ref('500px')
const ratio = ref(0.5)

function updatePaneStyles(newRatio) {
  const containerHeight = container.value.clientHeight
  topHeight.value = `${containerHeight * newRatio - 5}px`
  bottomHeight.value = `${containerHeight * (1 - newRatio) - 5}px`
  console.log(topHeight.value)
}

function handleResize(e) {
  const containerHeight = container.value.clientHeight
  const rect = container.value.getBoundingClientRect()
  const initX = rect.top
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
    const moveScale = (e.clientY - initX) / containerHeight
    const newRatio = moveScale
    console.log(newRatio)
    if (newRatio > 0.1 && newRatio < 0.9) {
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
  flex-direction: row;
}

.my-left {
  width: 100%;
  border-radius: 15px;
  z-index: 1;
}

.my-right {
  background-color: rgb(255, 255, 254);
  border-radius: 15px;
  width: 100%;
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
    height: 1.5px;
    width: 30px;
  }

  &:before {
    margin-top: -2px;
  }

  &:after {
    margin-top: 1px;
  }

  &:hover:before,
  &:hover:after {
    width: 30px;
    height: 1.5px;
    background-color: rgba(0, 0, 0, 0.35);
  }
}
</style>
