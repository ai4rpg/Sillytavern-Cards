<template>
  <div class="character-creation-container">
    <div class="hud-block">
      <h1 class="main-title">镜中面容</h1>
      <div class="intro-text">
        <p>
          你被古神们选中，成为能够完全免疫色情化特异点的侦探，已经有一阵子了，提尼，这个繁荣而衰败的城市总是有着数不清的麻烦，色情案件滋生在城市的每个角落，而你的任务就是纠正它们，在行动力用尽前让案件失控值归零，否则，那特异点将会入侵现实，以平然化的方式侵入人们的日常生活。
        </p>
        <h2>新的案件开始了……</h2>
        <p>等等，但你还没有收拾妥当，不是吗？先仔细想想，你究竟是谁……</p>
      </div>
    </div>

    <div class="hud-block">
      <h3 class="hud-block-title">你的过往</h3>
      <div class="selection-grid" id="group-livelihood">
        <div
          v-for="option in livelihoodOptions"
          :key="option.value"
          class="option-card"
          :class="{ selected: selections.livelihood === option.value }"
          @click="selectOption('livelihood', option.value)"
        >
          <div class="option-title">{{ option.title }}</div>
          <div class="option-description">{{ option.description }}</div>
        </div>
      </div>
    </div>

    <div class="hud-block">
      <h3 class="hud-block-title">你被哪位古神宠爱</h3>
      <div class="selection-grid" id="group-god">
        <div
          v-for="option in godOptions"
          :key="option.value"
          class="option-card"
          :class="{ selected: selections.god === option.value }"
          @click="selectOption('god', option.value)"
        >
          <div class="option-title">{{ option.title }}</div>
          <div class="option-description">{{ option.description }}</div>
        </div>
      </div>
    </div>

    <div class="hud-block">
      <h3 class="hud-block-title">你肉体的栖身之所</h3>
      <div class="selection-grid" id="group-district">
        <div
          v-for="option in districtOptions"
          :key="option.value"
          class="option-card"
          :class="{ selected: selections.district === option.value }"
          @click="selectOption('district', option.value)"
        >
          <div class="option-title">{{ option.title }}</div>
          <div class="option-description">{{ option.description }}</div>
        </div>
      </div>
    </div>

    <div class="hud-block">
      <h3 class="hud-block-title">你作为色情侦探的必备素质</h3>
      <div class="selection-grid" id="group-resistance">
        <div
          v-for="option in resistanceOptions"
          :key="option.value"
          class="option-card"
          :class="{ selected: selections.resistance === option.value }"
          @click="selectOption('resistance', option.value)"
        >
          <div class="option-title">{{ option.title }}</div>
          <div class="option-description">{{ option.description }}</div>
        </div>
      </div>
    </div>

    <div class="confirm-button-container">
      <button class="confirm-button" :disabled="!allSelected || isConfirming" @click="handleConfirmation">
        {{ confirmButtonText }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';

import { createStart } from './actions';

const selections = reactive({
  livelihood: '',
  god: '',
  district: '',
  resistance: '',
});

const confirmButtonText = ref('这就是我了');
const isConfirming = ref(false);

const livelihoodOptions = [
  { value: '侦探', title: '侦探', description: '失去了特殊能力的侦探，又获得了新的能力' },
  { value: '医生', title: '医生', description: '作为精神科医生，与青梅竹马过着平静而幸福的日子' },
  { value: '学生', title: '学生', description: '不仅仅是高中生，也是提尼的守护者' },
  { value: '潜藏者', title: '潜藏者', description: '心口的烙印还在发烫，你知道自己被魔女盯上了…' },
  { value: '画家', title: '画家', description: '凡间如幻梦，春秋如朝露，你还在捕捉着时光的影子' },
  { value: '上班族', title: '上班族', description: '你得乘着地铁去上班，也得乘着地铁去拯救世界' },
  {
    value: '修习术法者',
    title: '修习术法者',
    description: '炼丹画符，避世清修，在特异点降临后，你发现它们与咒术同出一脉',
  },
  { value: '魔修', title: '魔修', description: '血炼池中蛰伏近千载，凡尘俗世本已于你无干' },
  { value: '迷雾之人', title: '迷雾之人', description: '你的过往完全由自己定义…' },
];

const godOptions = [
  { value: '猫的庇护', title: '猫的庇护', description: '战争与领域之神' },
  { value: '面庞的庇护', title: '面庞的庇护', description: '野心与灵魂之神' },
  { value: '隐者的庇护', title: '隐者的庇护', description: '海与深渊之神' },
];

const districtOptions = [
  { value: '朝阳区', title: '朝阳区', description: '现代社会，由特异点带来的尖端科技与改造技术被掌握在少数人手中' },
  { value: '回廊区', title: '回廊区', description: '被特异点摧毁过的城区，又被巫术与仪式重建' },
  { value: '平云区', title: '平云区', description: '被特异点摧毁过的城区，被仙人与武者们修缮' },
];

const resistanceOptions = [
  { value: '丧失性欲', title: '丧失性欲', description: '你的身体连动情都做不到，当之无愧的色情侦探' },
  {
    value: '感觉遮蔽',
    title: '“感觉遮蔽”',
    description: '你的精神完全屏蔽了性欲，无法享受快感，但肉体受到刺激的表现正常',
  },
  { value: '只是很镇定', title: '只是很镇定', description: '你的精神韧性远高于其他人，但有着和正常人无二的性欲' },
];

const allSelected = computed(() => {
  return Object.values(selections).every(value => value !== '');
});

function selectOption(group: keyof typeof selections, value: string) {
  selections[group] = value;
}

async function handleConfirmation() {
  isConfirming.value = true;
  confirmButtonText.value = '正在生成...';
  try {
    await createStart(selections);
  } catch (error: any) {
    console.error('角色创建失败:', error);
    confirmButtonText.value = '错误！请检查控制台';
    alert(`角色创建失败！ 错误详情: ${error.message} 请检查浏览器控制台(F12)获取更多信息。`);
  } finally {
    isConfirming.value = false;
  }
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;500;700&family=Orbitron:wght@400;700&display=swap');
:root {
  --erotic-pink: #ff0077;
  --pink-glow: 0 0 8px rgba(255, 0, 119, 0.5);
  --detective-cyan: #00ffff;
  --cyan-glow: 0 0 8px rgba(0, 255, 255, 0.5);
  --bg-dark: #10001a;
  --bg-panel: #2a0a3a;
  --border-color: rgba(255, 0, 119, 0.3);
  --text-light: #f5f5f5;
  --text-dim: #b0a0c0;
  --font-main: 'Noto Sans SC', sans-serif;
  --font-hud: 'Orbitron', sans-serif;
}

body {
  background-color: var(--bg-dark);
  color: var(--text-light);
  font-family: var(--font-main);
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 15px; /* 在小屏幕上减少 body 边距 */
  margin: 0;
  box-sizing: border-box;
}

.character-creation-container {
  background: transparent;
  border: none;
  border-radius: 8px;
  padding: 20px; /* 调整内边距 */
  max-width: 900px;
  width: 100%;
  box-shadow:
    0 0 20px rgba(255, 0, 119, 0.2),
    0 4px 30px rgba(0, 0, 0, 0.5);
  position: relative;
  overflow: hidden;
  clip-path: polygon(
    0 10px,
    10px 0,
    calc(100% - 10px) 0,
    100% 10px,
    100% calc(100% - 10px),
    calc(100% - 10px) 100%,
    10px 100%,
    0 calc(100% - 10px)
  );
}

.character-creation-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: 30px 30px; /* 可选：在移动端减小网格大小 */
  opacity: 0.3;
  pointer-events: none;
}

.main-title {
  font-family: var(--font-hud);
  color: var(--erotic-pink);
  text-shadow: var(--pink-glow);
  text-align: center;
  font-size: 2.2em; /* 略微减小字号 */
  margin-top: 0;
  margin-bottom: 15px;
}

.intro-text {
  color: var(--text-dim);
  text-align: center;
  font-size: 0.95em; /* 调整介绍文本字号 */
}

.intro-text h2 {
  font-family: var(--font-main);
  font-weight: 500;
  font-size: 1.1em; /* 调整副标题字号 */
  margin-top: 20px;
  color: var(--erotic-pink);
  text-shadow: var(--pink-glow);
}

.selection-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.hud-block {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 255, 255, 0.2);
  padding: 15px; /* 调整内边距 */
  border-radius: 5px;
  margin-bottom: 20px;
}

.hud-block-title {
  font-family: var(--font-hud);
  color: var(--detective-cyan);
  font-size: 1rem; /* 调整小标题字号 */
  margin-top: 0;
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  border-bottom: 1px dashed rgba(0, 255, 255, 0.4);
  padding-bottom: 8px;
}

.option-card {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 255, 255, 0.3);
  padding: 15px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.option-card:hover {
  border-color: var(--detective-cyan);
  background: rgba(0, 255, 255, 0.05);
}

.option-card.selected {
  border-color: var(--erotic-pink);
  background: rgba(255, 0, 119, 0.1);
  box-shadow: var(--pink-glow);
}

.option-title {
  font-weight: 700;
  color: var(--text-light);
  margin-bottom: 8px;
  font-size: 1em;
}

.option-description {
  font-size: 0.9em;
  color: var(--text-dim);
  line-height: 1.5;
  flex-grow: 1;
}

.confirm-button-container {
  text-align: center;
  margin-top: 25px; /* 调整按钮与上方间距 */
}

.confirm-button {
  font-family: var(--font-hud);
  background: transparent;
  border: 2px solid var(--erotic-pink);
  color: var(--erotic-pink);
  padding: 12px 35px; /* 调整按钮内边距 */
  font-size: 1.1em; /* 调整按钮字号 */
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease;
  text-shadow: var(--pink-glow);
  width: 100%; /* 让按钮在移动端更易点击 */
  max-width: 300px; /* 限制最大宽度，避免过宽 */
}

.confirm-button:hover:not(:disabled) {
  background: var(--erotic-pink);
  color: var(--bg-dark);
  box-shadow: 0 0 15px var(--erotic-pink);
}

.confirm-button:disabled {
  border-color: #555;
  color: #555;
  cursor: not-allowed;
  text-shadow: none;
}

/* --- 移动端适配核心代码 --- */
@media (max-width: 768px) {
  body {
    padding: 10px; /* 进一步减小 body 边距 */
    align-items: flex-start; /* 内容从顶部开始，方便滚动 */
  }

  .character-creation-container {
    padding: 15px; /* 减小容器内边距 */
    clip-path: none; /* 在小屏上移除复杂的 clip-path 以避免潜在的显示问题 */
    border-radius: 8px; /* 保留圆角 */
  }

  .main-title {
    font-size: 1.8em; /* 显著减小主标题字号 */
  }

  .intro-text p {
    font-size: 0.9em;
    line-height: 1.6;
  }

  .hud-block {
    padding: 12px;
  }

  .selection-grid {
    /* 关键改动：在小屏幕上变为单列布局 */
    grid-template-columns: 1fr;
    gap: 12px; /* 减小选项间距 */
  }

  .option-card {
    padding: 12px;
  }

  .confirm-button-container {
    margin-top: 20px;
  }

  .confirm-button {
    padding: 14px 20px; /* 调整垂直内边距，使其更高，更易触摸 */
    font-size: 1em;
  }
}
</style>
