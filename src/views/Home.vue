<template>
  <div class="homepage">
    <div style="margin: auto; width: 100%">
      <div class="title-top">
        <div class="home-title-1">The</div>
        <div class="home-title-2">ptuCode</div>
        <div class="home-title-3">OnlineJudge Platform</div>
      </div>
      <!-- <el-button type="success" style="display: flex; margin: auto">随机一题</el-button> -->
    </div>
  </div>
</template>
<script setup></script>
<style>
.homepage {
  width: 100%;
  height: 100vh;
  /* background: linear-gradient(180deg, rgba(250, 250, 250, 0) 0, #fafafa 100%); */
  background: url(@/views/imgs/contest.png) no-repeat;
  background-size: cover;
  object-fit: cover;
  background-position: center center;
  background-attachment: fixed;
}
.title-top {
  user-select: none;
  justify-content: center;
  align-items: center;
  display: flex;
  /* margin-top: 100px; */
  padding-top: 100px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}
.home-title-1 {
  font-size: 100px;
  margin: 20px;
  font-weight: bold; /* 加粗文本 */
}
.home-title-2 {
  font-size: 100px;
  background: linear-gradient(135deg, #002ef9 0%, #f700ff 100%);
  -webkit-background-clip: text; /*将设置的背景颜色限制在文字中*/
  -webkit-text-fill-color: transparent; /*给文字设置成透明*/
  /* font-size: 20px; */
  /* font-family: Microsoft Yahei; */
  /* font-family:
    LXGW WenKai GB, */
  /* sans-serif; */
  font-weight: bold; /* 加粗文本 */
  display: block;
}
.home-title-3 {
  font-size: 100px;
  font-weight: bold; /* 加粗文本 */
}
</style>
