<template>
  <div class="code-editor">
    <div class="item">
      <div class="top">
        <div class="top-item">
          <span style="position: relative; left: 5px">代码</span>
        </div>
      </div>
      <div class="middle">
        <div class="middle-left">
          <el-select v-model="choseLanguage" style="width: 100px">
            <!-- 选择语言 -->
            <el-option
              v-for="item in languageList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
        <div class="middle-right">
          <!-- 刷新代码--恢复到默认 -->
        </div>
      </div>
    </div>
    <div class="code-region">
      <codeEditor
        @update:value="_handleDebounce"
        :value="code"
        :language="choseLanguage"
      ></codeEditor>
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref, watch } from 'vue'
import { useStorage } from '@vueuse/core'
import codeEditor from '@/components/codeEditor.vue'
import { debounce } from '@/utils/optimizeUtils'
const currentTab = ref(0)
const clickToLike = ref(false)
const choseLanguage = useStorage('ptuCode_' + window.location.pathname.split('/')[2], 0)
const languageList = ref([
  { label: 'C', value: 1 },
  { label: 'C++', value: 2 },
  { label: 'Java', value: 3 },
  { label: 'Python', value: 4 }
])
const emit = defineEmits(['submitCode', 'changeLanuage'])
const props = defineProps({
  loading: {
    type: Boolean,
    default: true
  },
  rep: {
    type: Object,
    default: null
  }
})

const clickTitleTab = (index) => {
  currentTab.value = index
}

var key = 'AttackCode_' + choseLanguage.value + '_' + window.location.pathname.split('/')[2]
var code = useStorage(key, '')
const clickFooter = (type) => {
  console.log(clickToLike.value)
  if (type === 1) {
    clickToLike.value = !clickToLike.value
  }
}
const handleUpdateValue = (value) => {
  code.value = value
}
const _handleDebounce = debounce(handleUpdateValue, 200)
const uploadCode = () => {
  emit('submitCode', code.value)
}
const changeLanguageFun = () => {
  key = 'AttackCode_' + choseLanguage.value + '_' + window.location.pathname.split('/')[2]
  code = useStorage(key, '')
  emit('changeLanuage', choseLanguage.value)
  uploadCode()
}
watch(
  () => code.value,
  () => uploadCode(),
  { deep: true }
)

watch(
  () => choseLanguage,
  () => changeLanguageFun(),
  { deep: true }
)
onMounted(() => {
  uploadCode()
  changeLanguageFun()
  // code.value += '\n'
})
</script>
<style lang="scss" scoped>
.code-editor {
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
}
.item {
  padding-left: 5px;
  position: relative;
  width: 100%;

  background-color: #ffffff;
  border-radius: 10px;
  overflow: visible;
  // overflow-y: hidden;
  .top {
    position: relative;
    height: 30px;
    width: 100%;
    border-radius: 10px 10px 0px 0px;
    background-color: #fafafa;
    display: flex;
    gap: 5px;
    align-items: center;
    justify-content: space-between;
    .top-item {
      position: relative;
      // top: 5px;
      display: flex;
      align-items: center;
      border-radius: 5px;
      // width: 70px;
      padding-left: 5px;
      padding-right: 5px;
      height: 80%;
    }
    .top-item:hover {
      background-color: #e6e6e6;
    }
  }
  .middle {
    width: 100%;
    height: 30px;
    display: flex;
    align-items: center;
    // background-color: aqua;
    justify-content: space-between;
    border-bottom: 1px solid rgb(236, 232, 232);
    gap: 5px;
    padding-bottom: 5px;
    .middle-left {
      display: flex;
      align-items: center;

      .middle-item {
        top: 3px;
        // margin: 5px;
        padding: 0px 10px;
        position: relative;
        border-radius: 5px;
        color: gray;
        height: 33px;
        align-items: center;
        cursor: pointer;
        display: flex;
        justify-content: center;
      }
      .middle-item:hover {
        background-color: #e6e6e6;
      }
    }
  }
  .code-region {
    z-index: -1;
    width: 100%;
    overflow: hidden;
  }
}
</style>
