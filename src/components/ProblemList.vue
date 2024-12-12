<template>
    <h1>文件管理系统</h1>
    <div class="container">
      <h2>题目列表</h2>
      <ul>
        <li v-for="(problem, index) in problems" :key="index">
          <span>{{ problem.name }}</span>
          <button @click="goToFileList(problem)">查看详情</button>
        </li>
      </ul>
    </div>
</template>
  
<script lang="ts" setup>
import { useRouter } from 'vue-router';

const router = useRouter();

// 示例题目列表
const problems = [
  { titleid:'35', id: '1863171174498951170', name: '题目一' },
  { titleid:'36', id: '1863171852378169345', name: '题目二' },
  { titleid:'37', id: '1863172094368538625', name: '题目三' },
];
  
// 跳转到文件列表页面
const goToFileList = (problem: typeof problems[number]) => {
  // 使用 params 传递 id
  // 使用 query 传递整个 problem 对象
  router.push({
    name: 'ListFile',
    params: { id: problem.titleid },
    query: { problem: JSON.stringify(problem) }
  });
};
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

button {
  margin-left: 10px;
  padding: 5px 10px;
  cursor: pointer;
}
</style>
