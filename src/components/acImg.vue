<template>
  <div class="ac-img">
    <img class="ac-image" src="@/views/imgs/ac1.png" />
  </div>
</template>

<script setup></script>
<style>
.ac-img {
  position: absolute;
  top: 10px;
  left: 10px;

  z-index: 100;
  user-select: none;
  width: 100%;
  height: 100%;
}
.ac-image {
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 35%; /* 可根据需要调整 */
}
</style>
