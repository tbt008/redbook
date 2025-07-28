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
            <el-option v-for="item in languageList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </div>
        <div class="middle-right" style="background-color: rgb(230, 230, 230); padding: 10px; margin-right: 10px">
          <!-- 距离比赛结束还有: 20分钟 -->
        </div>
      </div>
    </div>
    <div class="code-region">
      <codeEditor @updateCode="_handleDebounce" :value="code" :language="choseLanguage"></codeEditor>
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref, watch } from 'vue'
import { useStorage } from '@vueuse/core'
import codeEditor from '@/components/codeEditor.vue'
import { debounce } from '@/utils/optimizeUtils'
const choseLanguage = useStorage('ptuCode_language', 1)
const languageList = ref([
  { label: 'C', value: 1 },
  { label: 'C++', value: 2 },
  { label: 'Java', value: 3 },
  { label: 'Python', value: 4 }
])
const emit = defineEmits(['submitCode', 'changeLanuage'])
const props = defineProps({
  rep: {
    type: Object,
    default: null
  }
})
const getIdFromUrl = (url) => {
  // 查找第一个 '?id=' 的位置
  const startIndex = url.indexOf('?id=')

  if (startIndex === -1) {
    // 如果未找到 '?id='，则返回 null 或其他表示未找到的值
    return null
  }

  // 从 '?id=' 的下一个字符开始
  const substring = url.substring(startIndex + 4)

  // 查找第一个 '&' 的位置
  const endIndex = substring.indexOf('&')

  if (endIndex === -1) {
    // 如果未找到 '&'，则返回从 '?id=' 后的所有字符
    return decodeURIComponent(substring)
  } else {
    // 返回从 '?id=' 到 '&' 之间的字符
    return decodeURIComponent(substring.substring(0, endIndex))
  }
}

var key = 'ptuCode_' + choseLanguage.value + '_' + getIdFromUrl(window.location.href)

var code = useStorage(key, '')
if (code.value === '') {
  if (choseLanguage.value == 1) {
    code.value = `#include<stdio.h>
int main(){
	
	
	
	
	return 0;
} `
  } else if (choseLanguage.value == 2) {
    code.value = `#include<bits/stdc++.h>
using namespace std;
int main(){
	

	
	
	return 0;
} `
  } else if (choseLanguage.value == 3) {
    code.value = `import java.util.*;

public class Main {
    public static void main(String[] args) {
     
    }
}`
  }
}
const initCode = () => {
  if (code.value === '') {
    if (choseLanguage.value == 1) {
      code.value = `#include<stdio.h>
int main(){
	
	
	
	
	return 0;
} `
    } else if (choseLanguage.value == 2) {
      code.value = `#include<bits/stdc++.h>
using namespace std;
int main(){
	

	
	
	return 0;
} `
    } else if (choseLanguage.value == 3) {
      code.value = `import java.util.*;

public class Main {
    public static void main(String[] args) {
     
    }
}`
    }
  }
}
const handleUpdateValue = (value) => {
  code.value = value
  uploadCode()
}
const _handleDebounce = debounce(handleUpdateValue, 200)
const uploadCode = () => {
  emit('submitCode', code.value)
}
const changeLanguageFun = () => {
  var key = 'ptuCode_' + choseLanguage.value + '_' + getIdFromUrl(window.location.href)
  code = useStorage(key, '')
  initCode()
  emit('changeLanuage', choseLanguage.value)
  uploadCode()
}
watch(
  () => code.value,
  () => uploadCode(),
  { deep: true }
)

watch(
  () => choseLanguage.value,
  () => changeLanguageFun(),
  { deep: true }
)
onMounted(() => {
  changeLanguageFun()

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
