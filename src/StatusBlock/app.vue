<template>
  <div v-if="error" class="error-message">{{ error }}</div>
  <div v-else id="detective-hud-root">
    <div class="hud-header">
      <div class="hud-time-date">
        <span>{{ state.time }}</span> //
        <span>{{ state.date }}</span>
      </div>
      <div id="hud-phase" class="hud-phase">{{ state.current_phase }}</div>
    </div>
    <div
      class="hud-grid"
      style="margin-top: 0"
      v-if="state.current_phase !== '日常阶段'"
    >
      <div class="hud-block">
        <h3 class="hud-block-title">[ 案件信息 // Case Info ]</h3>
        <div class="hud-data-item">
          <span class="hud-label">当前案件:</span
          ><span class="hud-value">{{ state.case_name }}</span>
        </div>
        <div class="hud-data-item">
          <span class="hud-label">案件地点:</span
          ><span class="hud-value hud-location-text">{{ state.case_location }}</span>
        </div>
        <div class="hud-data-item">
          <span class="hud-label">等级:</span><span class="hud-value hud-case-level">{{ state.difficulty_class }}</span>
        </div>
      </div>
      <div class="hud-block">
        <h3 class="hud-block-title">[ 侦探状态 // Detective ]</h3>
        <div class="hud-gauge-container">
          <div class="hud-label">剩余行动力 (AP)</div>
          <progress :value="state.action_points" max="30"></progress>
          <div class="hud-gauge-text">{{ state.action_points }} / 30</div>
        </div>
      </div>
    </div>
    <div class="hud-block" style="margin-top: 15px" v-if="state.current_phase !== '日常阶段'">
      <h3 class="hud-block-title" style="color: var(--erotic-pink)">[ 失控值 // Reality Distortion ]</h3>
      <div class="hud-gauge-container">
        <progress :value="state.out_of_control" max="100"></progress>
        <div class="hud-gauge-text">{{ state.out_of_control }} / 100</div>
      </div>
    </div>
    <div class="hud-grid" style="margin-top: 15px">
      <div class="hud-block">
        <h3 class="hud-block-title">[ 个人信息 // Personal Info ]</h3>
        <div class="hud-data-item">
          <span class="hud-label">地点:</span>
          <span class="hud-value hud-location-text">{{ state.location }}</span>
        </div>
        <div class="hud-data-item">
          <span class="hud-label">侦破案件数:</span>
          <span class="hud-value">{{ state.solved_cases_count }}</span>
        </div>
      </div>
      <div class="hud-block">
        <h3 class="hud-block-title" style="color: var(--erotic-pink)">[ 平然化条目 // Normalization ]</h3>
        <div class="hud-list">
          <template v-if="state.normalization_entries.length > 0">
            <div
              v-for="(entry, index) in state.normalization_entries"
              :key="index"
              class="hud-data-item"
              style="display: block; margin-bottom: 8px"
            >
              <span class="hud-label" style="color: var(--detective-cyan)">{{
                getValue(entry, 'title', '名称缺失')
              }}</span>
              <span class="hud-value" style="white-space: pre-wrap; text-align: left; padding-left: 10px">{{
                getValue(entry, 'description', '影响未知')
              }}</span>
            </div>
          </template>
          <template v-else>无</template>
        </div>
      </div>
    </div>
    <div class="hud-grid" style="margin-top: 15px">
      <div class="hud-block">
        <h3 class="hud-block-title">[ 特殊能力 // Abilities ]</h3>
        <div class="hud-list">
          <template v-if="state.abilities.length > 0">
            <div
              v-for="(ability, index) in state.abilities"
              :key="index"
              class="hud-data-item"
              style="display: block; margin-bottom: 8px"
            >
              <span
                class="hud-label"
                :style="{ color: getValue(ability, 'is_used', false) ? 'var(--text-dim)' : 'var(--text-light)' }"
              >
                {{ getValue(ability, 'is_used', false) ? '[已使用]' : ''
                }}{{ getValue(ability, 'ability_name', '未知能力') }}
              </span>
              <span :style="{ color: getQualityColor(getValue(ability, 'ability_quality', '品质不明')) }">{{
                getValue(ability, 'ability_quality', '品质不明')
              }}</span>
              <span
                :style="{
                  color: getValue(ability, 'is_passive', false) ? 'var(--detective-cyan)' : 'var(--erotic-pink)',
                }"
                >{{ getValue(ability, 'is_passive', false) ? '被动' : '主动' }}</span
              >
              <span class="hud-value" style="white-space: pre-wrap; text-align: left; padding-left: 10px">{{
                getValue(ability, 'ability_description', '描述缺失')
              }}</span>
            </div>
          </template>
          <template v-else>无</template>
        </div>
      </div>
      <div class="hud-block">
        <h3 class="hud-block-title" style="color: var(--erotic-pink)">[ 性状态 // Sex Status ]</h3>
        <div class="hud-gauge-container">
          <div class="hud-label" style="font-size: 0.8rem">肉体兴奋</div>
          <progress :value="state.body_excitement" max="100"></progress>
          <div class="hud-gauge-text">{{ state.body_excitement }} / 100</div>
        </div>
        <div class="hud-gauge-container">
          <div class="hud-label" style="font-size: 0.8rem">精神欲望</div>
          <progress :value="state.spiritual_desire" max="100"></progress>
          <div class="hud-gauge-text">{{ state.spiritual_desire }} / 100</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getQualityColor } from '../shared/utils/getQualityColor';
import { getStatData, getValue } from '../shared/utils/getStatData';

interface GameState {
  time: string;
  date: string;
  current_phase: string;
  case_name: string;
  case_location: string;
  location: string;
  difficulty_class: number;
  action_points: number;
  out_of_control: number;
  body_excitement: number;
  spiritual_desire: number;
  solved_cases_count: number;
  abilities: any[];
  normalization_entries: any[];
}

const state = ref<GameState>({
  time: '',
  date: '',
  current_phase: '',
  case_name: '',
  case_location: '',
  location: '',
  difficulty_class: 0,
  action_points: 0,
  out_of_control: 0,
  body_excitement: 0,
  spiritual_desire: 0,
  solved_cases_count: 0,
  abilities: [],
  normalization_entries: [],
});

const error = ref<string | null>(null);

const getArrayValue = (data: any, path: string): any[] => {
  const val = getValue(data, path, []);
  return Array.isArray(val) ? val : [];
};

onMounted(async () => {
  try {
    await waitGlobalInitialized('Mvu');
    const current_message_id = getCurrentMessageId();
    const statData = await getStatData(current_message_id, 'stat_data');

    state.value = {
      time: getValue(statData, 'world.time', '未知时间'),
      date: getValue(statData, 'world.date', '未知时间'),
      current_phase: getValue(statData, 'user.current_phase', '未知阶段'),
      case_name: getValue(statData, 'world.current_case.case_name', '未知案件'),
      case_location: getValue(statData, 'world.current_case.case_location', '未知地点'),
      location: getValue(statData, 'user.location', '未知地点'),
      difficulty_class: getValue(statData, 'world.current_case.difficulty_class', 0),
      out_of_control: getValue(statData, 'world.current_case.out_of_control', 0),
      action_points: getValue(statData, 'user.action_points', 0),
      body_excitement: getValue(statData, 'user.sex_statue.body_excitement', 0),
      spiritual_desire: getValue(statData, 'user.sex_statue.spiritual_desire', 0),
      solved_cases_count: getValue(statData, 'latent_variables.solved_cases_count', 0),
      abilities: getArrayValue(statData, 'user.special_abilities'),
      normalization_entries: getArrayValue(statData, 'world.normalization_entries'),
    };
  } catch (e: any) {
    error.value = `状态面板加载出错: ${e.message || '未知错误'}`;
    console.error('Failed to load stat_data:', e);
  }
});
</script>

<style lang="scss">
@use 'shared/styles/common.scss';

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
  background: linear-gradient(145deg, rgba(42, 10, 58, 0.9), rgba(42, 10, 58, 0.7));
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