<template>
  <h1>文件管理系统</h1>
  <div class="container">
    <!-- 操作说明按钮 -->
    <el-button plain @click="dialogVisible = true" type="success" class="operation-btn">
      操作说明
    </el-button>

    <h2 class="title">{{ titleid }} {{ name }}</h2>
    <!-- 对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="操作说明"
      width="500" 
    >
      <span>1. 上传的文件路径不能有中文。</span>
      <br>
      <br>
      <span>2. 提交的压缩包要直接对数据压缩，不要对文件夹压缩。</span>
      <br>
      <br>
      <span>3. 只支持对zip和rar的解压。</span>
 
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="dialogVisible = false">确认</el-button> 
        </div>
      </template>
    </el-dialog>
    <!-- 显示信息提示 -->
    <el-alert
      v-if="message"
      :title="message"
      :type="messageClass"
      show-icon
      class="alert"
    ></el-alert>
    
 
    <!-- 文件列表 -->
    <div>
      <h3>文件列表：</h3>
      <!-- 删除/创建文件夹按钮 -->
      <el-button 
        v-if="message !== `文件夹 ${id} 不存在`"
        @click="deleteFolder()"
        type="danger"
        size="small" 
      >
        删除文件夹 {{ id  }}
      </el-button>
      <el-button 
        v-else
        plain
        @click="CreateFolder()"
        type="success"
        size="small"  
      >
        创建文件夹 {{ id }}
      </el-button>

      <div v-for="group in groupFiles(files)" :key="group.extension" class="file-group">
        <div class="group-header">
          <h4 class="group-title">{{ group.extension.toUpperCase() }}</h4>
          <!-- 添加全选功能和批量操作按钮 -->
          <div class="group-actions">
            <el-checkbox 
              v-model="groupSelections[group.extension].selectAll"
              @change="(val: boolean) => handleSelectAll(val, group.extension)"
            >
              全选
            </el-checkbox>
            <div v-if="groupSelections[group.extension].selected.length > 0" class="batch-actions">
              <el-button type="danger" size="small" @click="batchDelete(group.extension)">
                批量删除 ({{ groupSelections[group.extension].selected.length }})
              </el-button>
              <el-button type="success" size="small" @click="batchDownload(group.extension)">
                批量下载 ({{ groupSelections[group.extension].selected.length }})
              </el-button>
              <!-- 仅对 zip 和 rar 显示批量解压按钮 -->
              <el-button 
                v-if="['zip', 'rar'].includes(group.extension)"
                type="primary" 
                size="small" 
                @click="batchExtract(group.extension)"
              >
                批量解压 ({{ groupSelections[group.extension].selected.length }})
              </el-button>
            </div>
          </div>
        </div>
        <ul class="file-list">
          <li v-for="file in group.files" :key="file" class="file-item">
            <el-checkbox 
              v-model="groupSelections[group.extension].selected"
              :label="file"
              class="file-checkbox"
            ></el-checkbox>
            <span class="file-name" @click="downloadFile(file)"></span>
            <div class="file-actions">
              <!-- 根据文件类型显示不同的操作按钮 -->
              <template v-if="group.extension === 'zip' || group.extension === 'rar'">
                <el-button @click="group.extension === 'zip' ? extractZip(file) : extractRar(file)" type="primary" size="small">解压</el-button>
                <el-button @click="deleteFile(file)" type="danger" size="small">删除</el-button>
                <el-button @click="downloadFile(file)" type="success" size="small">下载</el-button>
              </template>
              <template v-else-if="group.extension === 'in' || group.extension === 'out'">
                <el-button @click="deleteFile(file)" type="danger" size="small">删除</el-button>
                <el-button @click="downloadFile(file)" type="success" size="small">下载</el-button>
              </template>
              <template v-else-if="isFolder(file)">
                <el-button @click="deleteFolder(file)" type="danger" size="small">删除</el-button>
              </template>
              <template v-else>
                <el-button @click="deleteFile(file)" type="danger" size="small">删除</el-button>
                <el-button @click="downloadFile(file)" type="success" size="small">下载</el-button>
              </template>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- 上传文件部分 -->
    <div class="upload-section">
      <h3>上传文件：</h3>
      <form @submit.prevent="handleSubmit">
        <label for="file">选择文件：</label>
        <input type="file" ref="fileInput" id="file" required />
        
        <button type="submit">上传文件</button>
      </form>
    </div>
 

  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router'; 
import request from '@/util/request'
import requestBlob from '@/util/requestblob'
const route = useRoute();
const problemId = route.params.problemid as string;
const titleid = problemId;
const id = problemId;
const name = ref('');
import { ElMessage } from 'element-plus';
// 添加获取题目详情的函数
const fetchProblemDetails = async () => {
  try {
    const response = await request.get(`/question/${id}`,{
       
    }) as any; 
    if (response.code === 200) {
      name.value = response.data.title;
    } else {
      message.value = '获取题目详情失败';
      messageClass.value = 'error';
    }
  } catch (error) {
    message.value = '获取题目详情时发生错误';
    messageClass.value = 'error';
    console.error('Error:', error);
  }
};

const files = ref<string[]>([]);
const message = ref('');
const messageClass = ref<'error' | 'success' | 'warning' | 'info' | ''>('');


const dialogVisible = ref(false)


// 文件上传相关
const fileInput = ref<HTMLInputElement | null>(null); // 文件输入元素

const isRar = (file: string) => file.toLowerCase().endsWith('.rar');
const isZip = (file: string) => file.toLowerCase().endsWith('.zip');
const isFolder = (file: string) => !file.includes('.');

// 获取文件列表
const fetchFileList = async () => {
  if (!id) {
    message.value = '无效的题目 ID';
    messageClass.value = 'error';
    return;
  }

  message.value = '正在获取文件列表...';
  messageClass.value = 'info';

  try {
    const response = await request.post('/root/question/list/file', {
      questionId: id
    }) as any;
    
    if (response.code === 200) {
      files.value = response.data || [];
      // console.log(files.value);
      initializeGroupSelections(files.value);
      message.value = '文件列表获取成功';
      messageClass.value = 'success';
    } else {
      let msg = '获取文件列表失败';
      if(response.msg === "Bad Request") msg = "文件夹 " + id + " 不存在";
      message.value = msg;
      messageClass.value = 'error';
    }
  } catch (error) {
    message.value = '获取文件列表过程中发生错误';
    messageClass.value = 'error';
    console.error('Error:', error);
  }
};

// 处理文件上传
const handleSubmit = async () => {
  if (!fileInput.value || !fileInput.value.files || fileInput.value.files.length === 0) {
    message.value = '请选择文件';
    messageClass.value = 'error';
    return;
  }

  message.value = '正在上传文件...';
  messageClass.value = 'info';

  const formData = new FormData();
  formData.append('file', fileInput.value.files[0]);
  formData.append('questionId', id);

  try {
    const response = await request.post('/root/quesion/save/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }) as any;

    if (response.code === 200) {
      message.value = response.message || '文件上传成功';
      messageClass.value = 'success';
      await fetchFileList(); // 上传成功后重新获取文件列表
    } else {
      message.value = response.error || '文件上传失败';
      messageClass.value = 'error';
    }
  } catch (error) {
    message.value = '上传过程中发生错误';
    messageClass.value = 'error';
    console.error('Error:', error);
  }
};

// 解压 RAR 文件
const extractRar = async (file: string) => {
  message.value = '正在解压 RAR 文件...';
  messageClass.value = 'info';

  try {
    const response = await request.post('/root/question/extract/rar', {
      questionId: id,
      folderName: file
    }) as any;

    if (response.code === 200) {
      message.value = response.message || 'RAR 文件解压成功';
      messageClass.value = 'success';
      ElMessage.success(response.message || 'RAR 文件解压成功');
      await fetchFileList();
    } else {
      message.value = response.error || '解压失败';
      messageClass.value = 'error';
    }
  } catch (error) {
    message.value = '解压过程中发生错误';
    messageClass.value = 'error';
    console.error('Error:', error);
  }
};

// 解压 ZIP 文件
const extractZip = async (file: string) => {
  message.value = '正在解压 ZIP 文件...';
  messageClass.value = 'info';

  try {
    const response = await request.post('/root/question/extract/zip', {
      questionId: id,
      folderName: file
    }) as any;

    if (response.code === 200) {
      message.value = response.message || 'ZIP 文件解压成功';
      messageClass.value = 'success';
      ElMessage.success(response.message || 'ZIP 文件解压成功');
      await fetchFileList();
    } else {
      message.value = response.error || '解压失败';
      messageClass.value = 'error';
    }
  } catch (error) {
    message.value = '解压过程中发生错误';
    messageClass.value = 'error';
    console.error('Error:', error);
  }
};

// 删除文件
const deleteFile = async (file: string) => {
  message.value = `正在删除文件 ${file}...`;
  messageClass.value = 'info';
  try {
    const response = await request.post('/root/question/delete/file', {
      questionId: id,
      folderName: file
    }) as any;

    if (response.code === 200) {
      message.value = response.message || '文件删除成功';
      messageClass.value = 'success';
      ElMessage.success(response.message || '文件删除成功');
      await fetchFileList();
    } else {
      message.value = response.error || '删除文件失败';
      messageClass.value = 'error';
    }
  } catch (error) {
    message.value = '删除文件过程中发生错误';
    messageClass.value = 'error';
    console.error('Error:', error);
  }
};

// 删除文件夹
const deleteFolder = async (folder?: string) => {
  message.value = `正在删除文件夹 ${folder||id}...`;
  messageClass.value = 'info';
  let path = id;
  if (folder) {
    path += '/' + folder;
  }
  console.log(path);
  
  try {
    const response = await request.post('/root/question/delete/folder', {
      questionId: id,
      folderName: path
    }) as any;

    if (response.code === 200) {
      message.value = response.message || '文件夹删除成功';
      messageClass.value = 'success';
      ElMessage.success(response.message || '文件夹删除成功');
      await fetchFileList();
    } else {
      message.value = response.error || '删除文件夹失败';
      messageClass.value = 'error';
    }
  } catch (error) {
    message.value = '删除文件夹过程中发生错误';
    messageClass.value = 'error';
    console.error('Error:', error);
  }
};
//创建文件夹
const CreateFolder = async () => {
  let folderName = id;
  if (!folderName) {
    message.value = '文件夹名称不能为空';
    messageClass.value = 'error';
    return;
  }
  try {
    const response = await request.post('/root/question/create/folder', {
      questionId: id,
      folderName: folderName
    }) as any;

    if (response.code === 200) {
      message.value = response.message || '创建文件夹成功';
      messageClass.value = 'success'; 
    } else {
      message.value = response.error || '创建文件夹失败';
      messageClass.value = 'error';
    }
  } catch (error) {
    message.value = '创建文件夹时发生错误';
    messageClass.value = 'error';
    console.error('Error:', error);
  }
}; 
 

const downloadFile = async (folderName: string) => {
  if (!folderName) {
    message.value = '文件不能为空';
    messageClass.value = 'error';
    return;
  }

  const questionId = Number(id);
  if (isNaN(questionId)) {
    message.value = '无效的问题ID';
    messageClass.value = 'error';
    return;
  }

  try {
    const response = await request.post('/root/question/get/file', {
      questionId,
      folderName
    }) as any;

    if (!response || response.code !== 200) {
      throw new Error('下载失败');
    }

    // 解码base64数据
    const base64Data = response.data.body;
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // 创建blob对象
    const blob = new Blob([bytes]);
    
    // 创建下载链接
    const fileURL = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = fileURL;
    link.download = folderName;
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 清理URL对象
    URL.revokeObjectURL(fileURL);
    
    message.value = '文件下载成功';
    messageClass.value = 'success';
    
  } catch (error) {
    console.error('下载文件时发生错误:', error);
    message.value = '下载文件时发生错误';
    messageClass.value = 'error';
  }
};

// 添加新的类型定义和排序函数
interface FileGroup {
  extension: string;
  files: string[];
}

const groupFiles = (files: string[]): FileGroup[] => {
  const groupMap = new Map<string, string[]>();
  
  files.forEach(file => {
    const extension = file.includes('.') 
      ? file.split('.').pop()?.toLowerCase() || '其他'
      : '文件夹';
    
    if (!groupMap.has(extension)) {
      groupMap.set(extension, []);
    }
    groupMap.get(extension)?.push(file);
  });

  // 自然排序比较函数
  const naturalCompare = (a: string, b: string) => {
    return a.split(/(\d+)/).map(part => {
      const num = parseInt(part);
      return isNaN(num) ? part : String(num).padStart(10, '0');
    }).join('').localeCompare(
      b.split(/(\d+)/).map(part => {
        const num = parseInt(part);
        return isNaN(num) ? part : String(num).padStart(10, '0');
      }).join('')
    );
  };

  // 转换为数组并排序
  const groups = Array.from(groupMap.entries()).map(([ext, files]) => ({
    extension: ext,
    files: files.sort(naturalCompare) // 使用自然排序
  }));

  // 确保文件夹始终在最前面
  return groups.sort((a, b) => {
    if (a.extension === '文件夹') return -1;
    if (b.extension === '文件夹') return 1;
    return a.extension.localeCompare(b.extension);
  });
};

// 为每个文件类型组维护独立的选择状态
interface GroupSelection {
  selected: string[];
  selectAll: boolean;
}

const groupSelections = ref<Record<string, GroupSelection>>({});

// 初始化或更新文件组的选择状态
const initializeGroupSelections = (files: string[]) => {
  const groups = groupFiles(files);
  groups.forEach(group => {
    if (!groupSelections.value[group.extension]) {
      groupSelections.value[group.extension] = {
        selected: [],
        selectAll: false
      };
    }
  });
};

// 处理全选功能
const handleSelectAll = (val: boolean, extension: string) => {
  const group = groupFiles(files.value).find(g => g.extension === extension);
  if (group) {
    groupSelections.value[extension].selected = val ? [...group.files] : [];
  }
};

// 批量删除指定类型的文件
const batchDelete = async (extension: string) => {
  const selectedFiles = groupSelections.value[extension].selected;
  message.value = '正在批量删除文件...';
  messageClass.value = 'info';

  try {
    for (const file of selectedFiles) {
      if (isFolder(file)) {
        await deleteFolder(file);
      } else {
        await deleteFile(file);
      }
    }
    groupSelections.value[extension].selected = [];
    groupSelections.value[extension].selectAll = false;
    message.value = '批量删除完成';
    messageClass.value = 'success';
    await fetchFileList();
  } catch (error) {
    message.value = '批量删除过程中发生错误';
    messageClass.value = 'error';
  }
};

// 批量下载指定类型的文件
const batchDownload = async (extension: string) => {
  const selectedFiles = groupSelections.value[extension].selected;
  message.value = '正在准备批量下载...';
  messageClass.value = 'info';

  try {
    for (const file of selectedFiles) {
      if (!isFolder(file)) {
        await downloadFile(file);
      }
    }
    message.value = '批量下载完成';
    messageClass.value = 'success';
  } catch (error) {
    message.value = '批量下载过程中发生错误';
    messageClass.value = 'error';
  }
};

// 批量解压文件
const batchExtract = async (extension: string) => {
  const selectedFiles = groupSelections.value[extension].selected;
  message.value = '正在批量解压文件...';
  messageClass.value = 'info';

  try {
    for (const file of selectedFiles) {
      if (extension === 'zip') {
        await extractZip(file);
      } else if (extension === 'rar') {
        await extractRar(file);
      }
    }
    groupSelections.value[extension].selected = [];
    groupSelections.value[extension].selectAll = false;
    message.value = '批量解压完成';
    messageClass.value = 'success';
    await fetchFileList();
  } catch (error) {
    message.value = '批量解压过程中发生错误';
    messageClass.value = 'error';
  }
};

onMounted(() => {
  fetchProblemDetails();
  fetchFileList();
});
</script>

<style scoped>
h1 {
  text-align: center;
  margin: 20px 0;
}
.container {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  position: relative;
}
/* 操作说明按钮 */
.operation-btn {
  position: absolute;
  top: 10px;
  right: 10px;
}

 
.title {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

.alert {
  margin-bottom: 20px;
}

.file-list {
  list-style-type: none;
  padding-left: 0;
}

.file-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 6px;
  background-color: #f9f9f9;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.file-name {
  flex: 1;
  font-size: 16px;
  cursor: pointer; /* 将鼠标光标变为指针，表示这是一个可点击的元素 */
  color: #333; /* 文件名的颜色 */
  transition: color 0.3s; /* 平滑的颜色过渡效果 */
}
.file-name:hover {
  /* 悬浮时的样式 */
  color: #409EFF; /* 悬浮时改变文件名的颜色 */
}
.file-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  align-items: center;
}

.el-button {
  margin-left: 5px;
}

.delete-folder-btn {
  background-color: #ff4d4f;
  color: #fff;
  border: none;
  padding: 5px 12px;
  font-size: 12px;
  cursor: pointer;
  border-radius: 4px;
}

.delete-folder-btn:hover {
  background-color: #d93f3a;
}

button:focus {
  outline: none;
}

.upload-section {
  margin-top: 20px;
  padding: 20px;
  background-color: #f1f1f1;
  border-radius: 6px;
}

.upload-section form {
  display: flex;
  flex-direction: column;
}

.upload-section label {
  font-size: 16px;
  margin-bottom: 8px;
}

.upload-section input[type="file"] {
  margin-bottom: 12px;
}

.upload-section button {
  background-color: #409eff;
  color: white;
  border: none;
  padding: 8px 16px;
  cursor: pointer;
  border-radius: 4px;
}

.upload-section button:hover {
  background-color: #66b1ff;
}

.file-group {
  margin-bottom: 20px;
}

.group-title {
  color: #409EFF;
  font-size: 16px;
  margin: 10px 0;
  padding: 5px 10px;
  background-color: #ecf5ff;
  border-radius: 4px;
  display: inline-block;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.group-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.batch-actions {
  display: flex;
  gap: 8px;
}
</style>