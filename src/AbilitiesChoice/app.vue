<template>
  <div class="hud-header">
    <h2 class="hud-block-title">[ 新的特殊能力 ]</h2>
    <div class="hud-phase">选择一个祝福</div>
  </div>
  
  <div class="skill-upgrade-grid" :class="{ selecting: isSelecting }">
    <div 
      v-for="(skill, index) in skills" 
      :key="index"
      class="skill-card" 
      @click="handleSelect(index)"
    >
      <div class="skill-card-header">
        <h3 class="skill-title">{{ getValue(skill, 'ability_name', '未知能力') }}</h3>
        <div class="skill-meta">
          <span 
            class="skill-quality" 
            :style="{ color: getQualityColor(getValue(skill, 'ability_quality', '未知品质')) }"
          >
            {{ getValue(skill, 'ability_quality', '') }}
          </span>
          <span
            class="skill-nature"
            :style="{ color: getValue(skill, 'is_passive', '') ? 'var(--detective-cyan)' : 'var(--erotic-pink)' }"
          >
            {{ getValue(skill, 'is_passive', false) ? '被动' : '主动' }}
          </span>
        </div>
      </div>
      <div class="skill-card-body">{{ getValue(skill, 'ability_description', '描述缺失') }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getQualityColor } from '../shared/utils/getQualityColor';
import { getStatData, getValue } from '../shared/utils/getStatData';
import { selectAbility } from './actions';

const isSelecting = ref(false);
const skills = ref<any[]>([]);

const handleSelect = async (index: number) => {
  if (isSelecting.value || !skills.value[index]) return;
  isSelecting.value = true;
  await selectAbility(skills.value[index]);
};

onMounted(async () => {
  try {
    const current_message_id = getCurrentMessageId();
    const last_message_id = getLastMessageId();

    if (current_message_id !== last_message_id) {
      isSelecting.value = true;
    }

    await waitGlobalInitialized('Mvu');
    const statData = await getStatData(current_message_id, 'stat_data');

    const generatedAbilities = getValue(statData, 'latent_variables.ability_update.generated_abilities', []);

    if (Array.isArray(generatedAbilities) && generatedAbilities.length > 0) {
      skills.value = generatedAbilities;
    } else {
      throw new Error('未能够正确获取候选能力');
    }
  } catch (error) {
    console.error('Failed to initialize AbilitiesChoice:', error);
    skills.value = [{
      ability_name: 'Error',
      ability_quality: 'N/A',
      ability_description: String(error),
      is_passive: false
    }];
  }
});
</script>

<style lang="scss">
@use 'shared/styles/common.scss';

.hud-header {
  background-color: rgba(42, 10, 58, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px; /* Add a small gap between title and phase */
  text-align: center;
}
.hud-block-title {
  color: var(--detective-cyan);
  font-family: var(--font-hud);
  margin: 0;
}
.hud-phase {
  color: var(--text-light);
  font-family: var(--font-hud);
  margin: 0;
}

.skill-upgrade-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(256px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.skill-card {
  background: linear-gradient(145deg, var(--bg-dark), var(--bg-panel));
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.skill-upgrade-grid:not(.selecting) .skill-card:hover {
  transform: translateY(-5px);
  border-color: var(--detective-cyan);
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
}

.skill-upgrade-grid.selecting .skill-card {
  pointer-events: none;
  opacity: 0.6;
}

.skill-card-header {
  font-family: var(--font-hud);
  text-align: center;
  margin-bottom: 15px;
}

.skill-title {
  font-size: 1.25rem;
  color: var(--detective-cyan);
  text-shadow: var(--cyan-glow);
  margin: 0;
  padding-bottom: 5px;
  border-bottom: 1px dashed rgba(0, 255, 255, 0.4);
  text-transform: uppercase;
}

.skill-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  margin-top: 8px;
  color: var(--text-dim);
  text-transform: uppercase;
}

.skill-quality,
.skill-nature {
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: 700;
}

.skill-card-body {
  font-family: var(--font-main);
  color: var(--text-light);
  font-size: 0.9rem;
  line-height: 1.6;
  flex-grow: 1;
  white-space: pre-wrap;
}

@media (max-width: 768px) {
  .skill-upgrade-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .hud-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .skill-card {
    padding: 12px;
  }

  .skill-title {
    font-size: 1.1rem;
  }
}
</style>
