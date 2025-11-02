<template>
  <div v-if="error" class="error-message">{{ error }}</div>
  <div v-else-if="statData" id="detective-hud-root">
    <div class="hud-header">
      <div class="hud-time-date">
        <span>{{ _.get(statData, 'world.time[0]', '未知时间') }}</span> //
        <span>{{ _.get(statData, 'world.date[0]', '未知日期') }}</span>
      </div>
      <div id="hud-phase" class="hud-phase">{{ _.get(statData, 'user.current_phase[0]', '未知阶段') }}</div>
    </div>
    <div
      class="hud-grid"
      style="margin-top: 0"
      v-if="_.get(statData, 'user.current_phase[0]', '未知阶段') !== '日常阶段'"
    >
      <div class="hud-block">
        <h3 class="hud-block-title">[ 案件信息 // Case Info ]</h3>
        <div class="hud-data-item">
          <span class="hud-label">当前案件:</span
          ><span class="hud-value">{{ _.get(statData, 'world.current_case.case_name[0]', '无') }}</span>
        </div>
        <div class="hud-data-item">
          <span class="hud-label">案件地点:</span
          ><span class="hud-value hud-location-text">{{
            _.get(statData, 'world.current_case.case_location[0]', '未知地点')
          }}</span>
        </div>
        <div class="hud-data-item">
          <span class="hud-label">等级:</span><span class="hud-value hud-case-level">{{ caseLevelText }}</span>
        </div>
      </div>
      <div class="hud-block">
        <h3 class="hud-block-title">[ 侦探状态 // Detective ]</h3>
        <div class="hud-gauge-container">
          <div class="hud-label">剩余行动力 (AP)</div>
          <progress :value="_.get(statData, 'user.action_points[0]', 0)" max="30"></progress>
          <div class="hud-gauge-text">{{ _.get(statData, 'user.action_points[0]', 0) }} / 30</div>
        </div>
      </div>
    </div>
    <div
      class="hud-block"
      style="margin-top: 15px"
      v-if="_.get(statData, 'user.current_phase[0]', '未知阶段') !== '日常阶段'"
    >
      <h3 class="hud-block-title" style="color: var(--erotic-pink)">[ 失控值 // Reality Distortion ]</h3>
      <div class="hud-gauge-container">
        <progress :value="_.get(statData, 'world.current_case.out_of_control[0]', 0)" max="100"></progress>
        <div class="hud-gauge-text">{{ _.get(statData, 'world.current_case.out_of_control[0]', 0) }} / 100</div>
      </div>
    </div>
    <div class="hud-grid" style="margin-top: 15px">
      <div class="hud-block">
        <h3 class="hud-block-title">[ 个人信息 // Personal Info ]</h3>
        <div class="hud-data-item">
          <span class="hud-label">地点:</span>
          <span class="hud-value hud-location-text">{{ _.get(statData, 'user.location[0]', '未知地点') }}</span>
        </div>
        <div class="hud-data-item">
          <span class="hud-label">身份:</span>
          <span class="hud-value">{{ _.get(statData, 'user.profile.past_identity[0]', '未知过往') }}</span>
        </div>
        <div class="hud-data-item">
          <span class="hud-label">侦破案件数:</span>
          <span class="hud-value">{{ _.get(statData, 'user.profile.solved_cases_count[0]', 0) }}</span>
        </div>
      </div>
      <div class="hud-block">
        <h3 class="hud-block-title">[ 性状态 // Sex Status ]</h3>
        <div class="hud-data-item">
          <span class="hud-label">Lust Resistance:</span>
          <span class="hud-value">{{ _.get(statData, 'user.sex_statue.lust_resistance[0]', 'N/A') }}</span>
        </div>
        <div class="hud-gauge-container">
          <div class="hud-label">Body Excitement</div>
          <progress :value="_.get(statData, 'user.sex_statue.body_excitement[0]', 0)" max="100"></progress>
          <div class="hud-gauge-text">{{ _.get(statData, 'user.sex_statue.body_excitement[0]', 0) }} / 100</div>
        </div>
        <div class="hud-gauge-container">
          <div class="hud-label">Spiritual Desire</div>
          <progress :value="_.get(statData, 'user.sex_statue.spiritual_desire[0]', 0)" max="100"></progress>
          <div class="hud-gauge-text">{{ _.get(statData, 'user.sex_statue.spiritual_desire[0]', 0) }} / 100</div>
        </div>
      </div>
    </div>
    <div class="hud-grid" style="margin-top: 15px">
      <div class="hud-block">
        <h3 class="hud-block-title">[ 特殊能力 // Abilities ]</h3>
        <div class="hud-list">
          <template v-if="specialAbilities.length > 0">
            <div
              v-for="(ability, index) in specialAbilities"
              :key="index"
              class="hud-data-item"
              style="display: block; margin-bottom: 8px"
            >
              <span
                class="hud-label"
                :style="{ color: _.get(ability, 'is_used[0]', false) ? 'var(--text-dim)' : 'var(--text-light)' }"
              >
                {{ _.get(ability, 'is_used[0]', false) ? '[已使用]' : ''
                }}{{ _.get(ability, 'ability_name[0]', '未知能力') }}
              </span>
              <span :style="{ color: getQualityColor(_.get(ability, 'ability_quality[0]', '品质不明')) }">{{
                _.get(ability, 'ability_quality[0]', '品质不明')
              }}</span>
              <span
                :style="{
                  color: _.get(ability, 'is_passive[0]', false) ? 'var(--detective-cyan)' : 'var(--erotic-pink)',
                }"
                >{{ _.get(ability, 'is_passive[0]', false) ? '被动' : '主动' }}</span
              >
              <span class="hud-value" style="white-space: pre-wrap; text-align: left; padding-left: 10px">{{
                _.get(ability, 'ability_description[0]', '描述缺失')
              }}</span>
            </div>
          </template>
          <template v-else>无</template>
        </div>
      </div>
      <div class="hud-block">
        <h3 class="hud-block-title">[ 平然化条目 // Normalization ]</h3>
        <div class="hud-list">
          <template v-if="normalizationEntries.length > 0">
            <div
              v-for="(entry, index) in normalizationEntries"
              :key="index"
              class="hud-data-item"
              style="display: block; margin-bottom: 8px"
            >
              <span class="hud-label" style="color: var(--detective-cyan)">{{
                _.get(entry, 'title[0]', '名称缺失')
              }}</span>
              <span class="hud-value" style="white-space: pre-wrap; text-align: left; padding-left: 10px"
                >- {{ _.get(entry, 'description[0]', '影响未知') }}</span
              >
            </div>
          </template>
          <template v-else>无</template>
        </div>
      </div>
    </div>
  </div>
  <div v-else>Loading...</div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { computed, onMounted, ref } from 'vue';

const statData = ref<any>(null);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    const messages = await getChatMessages(getCurrentMessageId());
    if (!messages || messages.length === 0 || !messages[0].data || !messages[0].data.stat_data) {
      throw new Error('无法加载状态数据。');
    }
    statData.value = messages[0].data.stat_data;
  } catch (e: any) {
    error.value = `状态面板加载出错: ${e.message}`;
    console.error(e);
  }
});

const caseLevelText = computed(() => {
  const level = _.get(statData.value, 'world.current_case.difficulty_class[0]', '');
  return level === 0 ? '' : level;
});

const specialAbilities = computed(() => {
  const abilities = _.get(statData.value, 'user.special_abilities[0]', []);
  return Array.isArray(abilities) ? abilities : [];
});

const normalizationEntries = computed(() => {
  const entries = _.get(statData.value, 'world.normalization_entries[0]', []);
  return Array.isArray(entries) ? entries : [];
});

function getQualityColor(quality: string): string {
  switch (quality) {
    case '普通':
      return 'var(--text-dim)';
    case '稀有':
      return 'var(--aq-green)';
    case '史诗':
      return 'var(--aq-orange)';
    case '传说':
      return 'var(--aq-gold)';
    default:
      return 'var(--text-light)';
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
  --aq-green: #44ff00;
  --aq-orange: #ff8000;
  --aq-gold: #ffcc00;
  --font-main: 'Noto Sans SC', sans-serif;
}

@keyframes ripple-effect {
  0% {
    box-shadow: 0 0 1px 1px rgba(0, 255, 255, 0.05);
  }
  70% {
    box-shadow: 0 0 2px 5px rgba(0, 255, 255, 0.08);
  }
  100% {
    box-shadow: 0 0 3px 7px rgba(0, 255, 255, 0);
  }
}

#detective-hud-root,
.error-message {
  background-color: var(--bg-dark);
  color: var(--text-light);
  font-family: var(--font-main);
  padding: 15px;
  margin: 0;
  box-sizing: border-box;
}

.error-message {
  color: red;
  padding: 10px;
}

#detective-hud-root {
  background: linear-gradient(145deg, var(--bg-dark), var(--bg-panel));
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 18px;
  margin: 15px 0;
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

#detective-hud-root::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    linear-gradient(0deg, rgba(0, 0, 0, 0) 95%, rgba(255, 255, 255, 0.05) 97%, rgba(0, 0, 0, 0) 100%),
    linear-gradient(90deg, rgba(0, 0, 0, 0) 95%, rgba(255, 255, 255, 0.05) 97%, rgba(0, 0, 0, 0) 100%);
  background-size: 40px 40px;
  opacity: 0.3;
  pointer-events: none;
}

.hud-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--erotic-pink);
  padding-bottom: 10px;
  margin-bottom: 15px;
  text-shadow: var(--pink-glow);
  font-family: var(--font-hud);
}

.hud-time-date {
  font-size: 1rem;
  color: var(--detective-cyan);
  text-shadow: var(--cyan-glow);
}

.hud-phase {
  font-size: 0.95rem;
  padding: 3px 8px;
  border-radius: 4px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.hud-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

@media (max-width: 600px) {
  .hud-grid {
    grid-template-columns: 1fr;
  }
}

.hud-block {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 255, 255, 0.2);
  padding: 12px;
  border-radius: 5px;
  transition: border-color 0.5s ease-out;
}

.hud-block:hover {
  border-color: var(--detective-cyan);
  animation: ripple-effect 0.8s ease-out;
}

.hud-block-title {
  font-family: var(--font-hud);
  color: var(--detective-cyan);
  font-size: 0.95rem;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  border-bottom: 1px dashed rgba(0, 255, 255, 0.4);
  padding-bottom: 4px;
}

.hud-data-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
  font-size: 0.85rem;
}

.hud-label {
  color: var(--text-dim);
  flex-shrink: 0;
  margin-right: 10px;
}

.hud-value {
  text-align: right;
  font-weight: 500;
}

.hud-location-text {
  color: var(--detective-cyan);
}

.hud-case-level {
  color: var(--erotic-pink);
  text-shadow: var(--pink-glow);
}

.hud-gauge-container {
  margin-top: 10px;
}

.hud-gauge-text {
  font-family: var(--font-hud);
  font-size: 0.8rem;
  margin-top: 4px;
  text-align: center;
}

.hud-list {
  font-size: 0.8rem;
  max-height: 120px;
  overflow-y: auto;
  padding-right: 5px;
  color: var(--text-light);
  white-space: pre-wrap;
}

progress {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 15px;
  border-radius: 3px;
  border: none;
  background: rgba(0, 0, 0, 0.25);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

progress::-webkit-progress-bar {
  background: transparent;
}

progress::-webkit-progress-value {
  background: rgba(0, 255, 255, 0.25);
}

progress::-moz-progress-bar {
  background: rgba(0, 255, 255, 0.25);
}
</style>
