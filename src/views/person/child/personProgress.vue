<template>
  <div class="person-progress">
    <div class="person-progress__header">
      <div>
        <h2>做题分析</h2>
        <p>先保留稳定可用的概览页面，后续再补详细统计图表。</p>
      </div>
      <el-tag type="success" effect="light">已修复可访问</el-tag>
    </div>

    <div class="person-progress__grid">
      <div class="person-progress__card">
        <div class="label">本周完成</div>
        <div class="value">12</div>
        <div class="hint">近 7 天已完成题目数量</div>
      </div>
      <div class="person-progress__card">
        <div class="label">连续学习</div>
        <div class="value">5 天</div>
        <div class="hint">保持稳定节奏比一次冲刺更重要</div>
      </div>
      <div class="person-progress__card">
        <div class="label">主要难度</div>
        <div class="value">中等</div>
        <div class="hint">当前练习重心集中在中等题</div>
      </div>
    </div>

    <div class="person-progress__panel">
      <h3>后续建议</h3>
      <ul>
        <li>把“最近提交记录”和“按难度分布”接入真实接口。</li>
        <li>图表组件建议独立成可复用模块，避免继续依赖缺失的旧文件。</li>
        <li>如果需要排行榜或成长曲线，再单独做按周聚合接口。</li>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="scss">
.person-progress {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.person-progress__header,
.person-progress__panel,
.person-progress__card {
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(31, 41, 51, 0.06);
}

.person-progress__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 28px;

  h2 {
    margin: 0;
    font-size: 24px;
    color: #16342c;
  }

  p {
    margin: 8px 0 0;
    color: #667085;
  }
}

.person-progress__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.person-progress__card {
  padding: 22px;

  .label {
    font-size: 14px;
    color: #667085;
  }

  .value {
    margin-top: 10px;
    font-size: 30px;
    font-weight: 700;
    color: #1f6f5f;
  }

  .hint {
    margin-top: 10px;
    font-size: 13px;
    color: #98a2b3;
  }
}

.person-progress__panel {
  padding: 24px 28px;

  h3 {
    margin: 0 0 12px;
    color: #16342c;
  }

  ul {
    margin: 0;
    padding-left: 18px;
    color: #475467;
    line-height: 1.8;
  }
}

@media (max-width: 768px) {
  .person-progress__grid {
    grid-template-columns: 1fr;
  }
}
</style>
