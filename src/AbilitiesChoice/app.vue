<template>
  <div class="hud-header">
    <h2 class="hud-block-title">[ 新的特殊能力 ]</h2>
    <div class="hud-phase">选择一个祝福</div>
  </div>
  <div class="skill-upgrade-grid" :class="{ selecting: isSelecting }">
    <div class="skill-card" id="bast" @click="handleSelect(0)">
      <div class="skill-card-header">
        <h3 class="skill-title">{{ bast.ability_name }}</h3>
        <div class="skill-meta">
          <span class="skill-quality" :style="{ color: getQualityColor(bast.ability_quality) }">{{
            bast.ability_quality
          }}</span>
          <span
            class="skill-nature"
            :style="{ color: bast.is_passive ? 'var(--detective-cyan)' : 'var(--erotic-pink)' }"
            >{{ bast.is_passive ? '被动' : '主动' }}</span
          >
        </div>
      </div>
      <div class="skill-card-body">{{ bast.ability_description }}</div>
    </div>

    <div class="skill-card" id="hypnos" @click="handleSelect(1)">
      <div class="skill-card-header">
        <h3 class="skill-title">{{ hypnos.ability_name }}</h3>
        <div class="skill-meta">
          <span class="skill-quality" :style="{ color: getQualityColor(hypnos.ability_quality) }">{{
            hypnos.ability_quality
          }}</span>
          <span
            class="skill-nature"
            :style="{ color: hypnos.is_passive ? 'var(--detective-cyan)' : 'var(--erotic-pink)' }"
            >{{ hypnos.is_passive ? '被动' : '主动' }}</span
          >
        </div>
      </div>
      <div class="skill-card-body">{{ hypnos.ability_description }}</div>
    </div>

    <div class="skill-card" id="nodens" @click="handleSelect(2)">
      <div class="skill-card-header">
        <h3 class="skill-title">{{ nodens.ability_name }}</h3>
        <div class="skill-meta">
          <span class="skill-quality" :style="{ color: getQualityColor(nodens.ability_quality) }">{{
            nodens.ability_quality
          }}</span>
          <span
            class="skill-nature"
            :style="{ color: nodens.is_passive ? 'var(--detective-cyan)' : 'var(--erotic-pink)' }"
            >{{ nodens.is_passive ? '被动' : '主动' }}</span
          >
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
const originalAbilities = ref<any[]>([]);

type Ability = {
  ability_name: string;
  ability_quality: string;
  ability_description: string;
  is_passive: boolean;
};

const bast = ref<Ability>({
  ability_name: 'Loading...',
  ability_quality: '',
  ability_description: '',
  is_passive: false,
});

const hypnos = ref<Ability>({
  ability_name: 'Loading...',
  ability_quality: '',
  ability_description: '',
  is_passive: false,
});

const nodens = ref<Ability>({
  ability_name: 'Loading...',
  ability_quality: '',
  ability_description: '',
  is_passive: false,
});

const handleSelect = async (index: number) => {
  if (isSelecting.value) return;
  isSelecting.value = true;
  await selectAbility(originalAbilities.value[index]);
};

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

/**
 * The AI returns ability properties as an array, where the first element is the value
 * and the second is an explanation. This function extracts the value.
 */
function parseAbility(abilityData: any): Ability {
  const parsed: { [key: string]: any } = {};
  for (const key in abilityData) {
    if (Object.prototype.hasOwnProperty.call(abilityData, key)) {
      if (Array.isArray(abilityData[key]) && abilityData[key].length > 0) {
        parsed[key] = abilityData[key][0];
      } else {
        parsed[key] = abilityData[key];
      }
    }
  }
  return parsed as Ability;
}

onMounted(async () => {
  try {
    await waitGlobalInitialized('Mvu');
    const mvuData = Mvu.getMvuData({ type: 'message', message_id: 'latest' });
    if (!mvuData || !mvuData.stat_data) {
      throw new Error('未在聊天变量中找到 stat_data。');
    }

    const generatedAbilities = mvuData?.stat_data?.latent_variables?.ability_update?.generated_abilities[0];

    if (generatedAbilities && Array.isArray(generatedAbilities) && generatedAbilities.length === 3) {
      originalAbilities.value = generatedAbilities;
      bast.value = parseAbility(generatedAbilities[0]);
      hypnos.value = parseAbility(generatedAbilities[1]);
      nodens.value = parseAbility(generatedAbilities[2]);
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

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;500;700&family=Orbitron:wght@400;700&display=swap');

:root {
  --erotic-pink: #ff0077;
  --detective-cyan: #00ffff;
  --border-color: rgba(255, 0, 119, 0.3);
  --text-light: #f5f5f5;
  --text-dim: #b0a0c0;
  --aq-green: #44ff00;
  --aq-orange: #ff8000;
  --aq-gold: #ffcc00;
  --font-main: 'Noto Sans SC', sans-serif;
}

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
