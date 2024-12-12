<template>
  <div class="about-body">
    <div class="about">
      <div class="profile">
        <div class="about-member">
          <div class="about-img">
            <img src="@/views/imgs/about1.jpg" alt="" class="about-img-1" />
          </div>

          <div class="about-info">
            <span class="about-name">谭冰涛</span>
          </div>
        </div>

        <div class="about-member">
          <div class="about-img">
            <img src="@/views/imgs/about2.jpg" alt="" class="about-img-1" />
          </div>
          <div class="about-info">
            <span class="about-name">黄佳威</span>
          </div>
        </div>
        <div class="about-member">
          <div class="about-img">
            <img src="@/views/imgs/about3.jpg" alt="" class="about-img-1" />
          </div>
          <div class="about-info">
            <span class="about-name">王其彬</span>
          </div>
        </div>
        <div class="about-member">
          <div class="about-img">
            <img src="@/views/imgs/about4.jpg" alt="" class="about-img-1" />
          </div>
          <div class="about-info">
            <span class="about-name">张俊艺</span>
          </div>
        </div>
        <div class="about-member">
          <div class="about-img">
            <img src="@/views/imgs/about5.jpg" alt="" class="about-img-1" />
          </div>
          <div class="about-info">
            <span class="about-name">钟宇杰</span>
          </div>
        </div>
      </div>
      <div class="about-content">
        <div class="home-title-2">人活着就是为了麻衣学姐</div>
        <div class="home-title-2">人活着就是为了麻衣学姐</div>
        <div class="home-title-2">人活着就是为了麻衣学姐</div>
      </div>
    </div>
  </div>
</template>
<script setup></script>
<style>
.about-body {
  width: 100%;
  background: linear-gradient(135deg, #002ef9 0%, rgb(22, 195, 255) 100%);
  /* background: url(@/views/imgs/about.jpg) no-repeat; */
  background-size: cover;
  object-fit: cover;
  background-position: center center;
  background-attachment: fixed;

  /* background: linear-gradient(to right, rgb(255, 104, 84), rgb(255, 188, 55)); */
}
.about-content {
  height: 500px;
  width: 100%;
  background-color: antiquewhite;
  border-radius: 15px;
}
.about-info {
  margin: auto;
  text-align: center;
  display: block;
}
.about-member {
  margin-top: 10rem;
  user-select: none;
}
.about-name {
  margin: 10px;
  font-size: 20px;
  color: #ffffff;
}
.about-level {
  margin: 10px;
  font-size: 20px;
  color: #ffffff;
  /* background: linear-gradient(135deg, #002ef9 0%, #f700ff 100%);
  -webkit-background-clip: text; 
  -webkit-text-fill-color: transparent;  */
}
.about {
  padding-top: 100px;
  display: flex;
  flex-wrap: wrap;
  width: 80%;
  margin: auto;
}
.profile {
  margin: auto;
  width: 100%;
  display: flex;
  justify-content: space-around;
  padding: 5px;
}
.about-img {
  user-select: none;
  display: flex;
  border-radius: 50%;
  width: 150px;
  height: 150px;

  justify-content: center;
  align-items: center;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: cover;
}
.about-img-1 {
  width: 100px;
  height: 100px;
  user-select: none;
  z-index: 99;
  border-radius: 100%;
  transition: all 0.6s;
  display: block;
  margin: auto;
}
.about-img-1:hover {
  transform: rotate(360deg);
}
.about-img::before {
  animation: rotate 4s linear infinite;
  position: absolute;
  width: 110px;
  height: 110px;
  border-radius: 100%;
  overflow: hidden;
  content: '';
  /* box-shadow: 0 0 15px 10px #fff; */
  background: linear-gradient(#14aaf0, #d500f9);
}
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
