<template>
  <div class="hud-header">
    <h2 class="hud-block-title">[ 新的特殊能力 ]</h2>
    <div class="hud-phase">选择一个祝福</div>
  </div>
  <div class="skill-upgrade-grid" :class="{ selecting: isSelecting }">
    <div class="skill-card" id="bast" @click="handleSelect(bast)">
      <div class="skill-card-header">
        <h3 class="skill-title">{{ bast.ability_name }}</h3>
        <div class="skill-meta">
          <span class="skill-quality">{{ bast.ability_quality }}</span>
          <span class="skill-nature">{{ bast.is_passive ? '被动' : '主动' }}</span>
        </div>
      </div>
      <div class="skill-card-body">{{ bast.ability_description }}</div>
    </div>

    <div class="skill-card" id="hypnos" @click="handleSelect(hypnos)">
      <div class="skill-card-header">
        <h3 class="skill-title">{{ hypnos.ability_name }}</h3>
        <div class="skill-meta">
          <span class="skill-quality">{{ hypnos.ability_quality }}</span>
          <span class="skill-nature">{{ hypnos.is_passive ? '被动' : '主动' }}</span>
        </div>
      </div>
      <div class="skill-card-body">{{ hypnos.ability_description }}</div>
    </div>

    <div class="skill-card" id="nodens" @click="handleSelect(nodens)">
      <div class="skill-card-header">
        <h3 class="skill-title">{{ nodens.ability_name }}</h3>
        <div class="skill-meta">
          <span class="skill-quality">{{ nodens.ability_quality }}</span>
          <span class="skill-nature">{{ nodens.is_passive ? '被动' : '主动' }}</span>
        </div>
      </div>
      <div class="skill-card-body">{{ nodens.ability_description }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { selectAbility } from './actions';

const isSelecting = ref(false);

const bast = ref({
  ability_name: 'Loading...',
  ability_quality: '',
  ability_description: '',
  is_passive: false,
});

const hypnos = ref({
  ability_name: 'Loading...',
  ability_quality: '',
  ability_description: '',
  is_passive: false,
});

const nodens = ref({
  ability_name: 'Loading...',
  ability_quality: '',
  ability_description: '',
  is_passive: false,
});

const handleSelect = async (ability: any) => {
  if (isSelecting.value) return;
  isSelecting.value = true;
  await selectAbility(ability);
};

onMounted(async () => {
  try {
    await waitGlobalInitialized('Mvu');
    const mvuData = Mvu.getMvuData({ type: 'message', message_id: 'latest' });
    if (!mvuData || !mvuData.stat_data) {
      throw new Error('未在聊天变量中找到 stat_data。');
    }

    const generatedAbilities = mvuData?.stat_data?.latent_variables?.ability_update?.generated_abilities[0];

    if (generatedAbilities && Array.isArray(generatedAbilities) && generatedAbilities.length === 3) {
      bast.value = generatedAbilities[0];
      hypnos.value = generatedAbilities[1];
      nodens.value = generatedAbilities[2];
    } else {
      throw new Error('未能够正确获取 AI 生成的候选能力');
    }
  } catch (error) {
    console.error('Failed to initialize AbilitiesChoice:', error);
    bast.value.ability_name = 'Error';
    bast.value.ability_description = String(error);
    hypnos.value.ability_name = 'Error';
    hypnos.value.ability_description = String(error);
    nodens.value.ability_name = 'Error';
    nodens.value.ability_description = String(error);
  }
});
</script>

<style lang="scss" scoped>
.hud-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.hud-block-title {
  color: var(--detective-cyan);
  font-family: var(--font-hud);
  margin: 0;
}

.skill-upgrade-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-top: 15px;
}

.skill-card {
  background: rgba(0, 0, 0, 0.3);
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

@media (max-width: 900px) {
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
