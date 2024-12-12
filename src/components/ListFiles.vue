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
      <span>3. 点击文件名即可下载。</span>
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
        <h4 class="group-title">{{ group.extension.toUpperCase() }}</h4>
        <ul class="file-list">
          <li v-for="file in group.files" :key="file" class="file-item">
            <span class="file-name" @click="downloadFile(file)">{{ file }}</span>
            <div class="file-actions">
              <!-- 如果是 RAR 或 ZIP 文件，提供解压按钮 -->
              <el-button v-if="isRar(file)" @click="extractRar(file)" type="primary" size="small">解压</el-button>
              <el-button v-if="isZip(file)" @click="extractZip(file)" type="primary" size="small">解压</el-button>
              
              <!-- 删除文件夹按钮 -->
              <el-button v-if="isFolder(file)" @click="deleteFolder(file)" type="danger" size="small">删除文件夹</el-button>
              <!-- 删除文件按钮 -->
              <el-button v-else @click="deleteFile(file)" type="danger" size="small">删除文件</el-button>
              <!-- 下载文件按钮 -->
              <el-button v-if="!isFolder(file)" @click="downloadFile(file)" type="success" size="small">下载</el-button>
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
const route = useRoute();
// const id = route.params.id as string;
const problem = JSON.parse(route.query.problem as string);
const name = problem.name;
const titleid = problem.titleid;
const id = problem.id as string;
console.log(problem);
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
    const response = await fetch('http://120.26.170.155:12138/list_files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: id }),
    });

    const result = await response.json();
    if (response.ok) {
      files.value = result.files || [];
      message.value = '文件列表获取成功';
      messageClass.value = 'success';
    } else {
      let msg = '获取文件列表失败';
      if(result.error==="Invalid folder path")msg="文件夹 "+id+" 不存在";
      message.value = msg;
      messageClass.value = 'error';
    }
  } catch (error) {
    message.value = '获取文件列表过程中发生错误';
    messageClass.value = 'error';
     
    console.error('Error:', "error");
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
  formData.append('path', id);

  try {
    const response = await fetch('http://120.26.170.155:12138/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    if (response.ok) {
      message.value = result.message || '文件上传成功';
      messageClass.value = 'success';
      await fetchFileList(); // 上传成功后重新获取文件列表
    } else {
      message.value = result.error || '文件上传失败';
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
    const response = await fetch('http://120.26.170.155:12138/extract_rar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: id, filename: file }),
    });

    const result = await response.json();
    if (response.ok) {
      message.value = result.message || 'RAR 文件解压成功';
      messageClass.value = 'success';
      await fetchFileList();
    } else {
      message.value = result.error || '解压失败';
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
    const response = await fetch('http://120.26.170.155:12138/extract_zip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: id, filename: file }),
    });

    const result = await response.json();
    if (response.ok) {
      message.value = result.message || 'ZIP 文件解压成功';
      messageClass.value = 'success';
      await fetchFileList();
    } else {
      message.value = result.error || '解压失败';
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
    const response = await fetch('http://120.26.170.155:12138/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: id, filename: file }),
    });

    const result = await response.json();
    if (response.ok) {
      message.value = result.message || '文件删除成功';
      messageClass.value = 'success';
      await fetchFileList();
    } else {
      message.value = result.error || '删除文件失败';
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
  message.value = `正在删除文件夹 ${folder}...`;
  messageClass.value = 'info';
  let path =id;
  if(folder)
    path += '/' + folder;
  console.log(path);
  try {
    const response = await fetch('http://120.26.170.155:12138/delete_folder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder_name: path }),
    });

    const result = await response.json();
    if (response.ok) {
      message.value = result.message || '文件夹删除成功';
      messageClass.value = 'success';
      await fetchFileList();
    } else {
      message.value = result.error || '删除文件夹失败';
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
      // 发起 POST 请求创建文件夹
      const response = await fetch('http://120.26.170.155:12138/create_folder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ folder_name: folderName }),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        message.value = result.message;
        messageClass.value = 'success';
      } else {
        message.value = result.error || '创建失败';
        messageClass.value = 'error';
      }
    } catch (error) {
      message.value = '创建文件夹时发生错误';
      messageClass.value = 'error';
    }
  }; 
  // 下载文件
  const downloadFile = async (file: string) => {
    let filename = file;
    if (!filename) {
      message.value = '文件不能为空';
      messageClass.value = 'error';
      return;
    }

    try {
      // 发起 POST 请求下载文件
      const response = await fetch('http://120.26.170.155:12138/get_file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({                 
          path: id,
          filename: filename }),
      });

      if (response.ok) {
        const blob = await response.blob(); // 获取文件的二进制内容
        const fileURL = URL.createObjectURL(blob); // 创建一个 URL 对象
        const link = document.createElement('a'); // 创建下载链接
        link.href = fileURL;
        link.download = filename; // 设置下载的文件名
        link.click(); // 触发点击下载
        message.value = '文件下载成功';
        messageClass.value = 'success';
      } else {
        const result = await response.json();
        message.value = result.error || '下载失败';
        messageClass.value = 'error';
      }
    } catch (error) {
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
  // 创建一个Map来存储不同后缀的文件
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

  // 转换为数组并排序
  const groups = Array.from(groupMap.entries()).map(([ext, files]) => ({
    extension: ext,
    files: files.sort()
  }));

  // 确保文件夹始终在最前面
  return groups.sort((a, b) => {
    if (a.extension === '文件夹') return -1;
    if (b.extension === '文件夹') return 1;
    return a.extension.localeCompare(b.extension);
  });
};

onMounted(fetchFileList);
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
</style>
