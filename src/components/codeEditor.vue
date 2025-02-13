<script>
import { getCurrentInstance, onMounted, watch } from 'vue'
// import * as monaco from 'monaco-editor/esm/vs/editor/editor.main.js'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';
import 'monaco-editor/esm/vs/basic-languages/cpp/cpp.contribution'
import { debounce } from '@/utils/optimizeUtils'
// }
export default {
  props: {
    value: String,
    language: Number
  },
  setup(props, { emit }) {
    let monacoEditor = null
    const { proxy } = getCurrentInstance()

    watch(
      () => props.value,
      (value) => {
        // 防止改变编辑器内容时光标重定向

        if (value !== monacoEditor?.getValue()) {
          monacoEditor.setValue(value)
        }
      }
    )

    const changeSize = (entries) => {

      // 获取编辑器容器的大小
      var objSz = entries[0]
      monacoEditor.layout({ height: objSz.contentRect.height, width: objSz.contentRect.width - 10 })
    }
    // 节流操作
    const _fn = debounce(changeSize, 100)
    onMounted(() => {
      monacoEditor = monaco.editor.create(proxy.$refs.editContainer, {
        value: props.value,
        readOnly: false,
        language: 'cpp',
        theme: 'vs',
        selectOnLineNumbers: true,
        renderSideBySide: false,
        minimap: {
          // 关闭代码缩略图
          enabled: false // 是否启用预览图
        }
      })
      // 监听值变化
      monacoEditor.onDidChangeModelContent(() => {
        const currenValue = monacoEditor?.getValue()
        emit('updateCode', currenValue)
      })
      monacoEditor.layout({
        width: 600,
        height: 600
      })
      var code = document.getElementsByClassName('code-editor')[0]
      var resizeObserver = new ResizeObserver(function (entries) {
        _fn(entries)
      })

      // 监听特定元素
      resizeObserver.observe(code)
    })
    return {}
  }
}
</script>
<template>
  <div ref="editContainer" class="code-editor"></div>
</template>
<style scoped>
.code-editor {
  height: auto;
  width: 100%;
  min-height: 570px;
  overflow-y: hidden;
}
</style>
