import _ from 'lodash';
import { getSettings, replaceSettings } from './settings';

$(() => {
  // ===================================================================
  // 集中管理所有变量路径，提升代码的可读性、健壮性与可维护性。
  // ===================================================================
  const PATHS = {
    // user
    CURRENT_PHASE: 'stat_data.user.current_phase[0]',
    ACTION_POINTS: 'stat_data.user.action_points[0]',
    EXCITEMENT: 'stat_data.user.sex_statue.body_excitement[0]',
    DESIRE: 'stat_data.user.sex_statue.spiritual_desire[0]',
    ABILITIES: 'stat_data.user.special_abilities[0]',
    // world
    CASE_NAME: 'stat_data.world.current_case.case_name[0]',
    CASE_LOCATION: 'stat_data.world.current_case.case_location[0]',
    DIFFICULTY_CLASS: 'stat_data.world.current_case.difficulty_class[0]',
    OUT_OF_CONTROL: 'stat_data.world.current_case.out_of_control[0]',
    NORMALIZATION: 'stat_data.world.normalization_entries[0]',
    // latent_variables
    PHASE_CHANGED: 'stat_data.latent_variables.ejs_index.phase_changed[0]',
    EXPERIENCE: 'stat_data.latent_variables.ejs_index.experience[0]',
    CANDIDATE_QUALITIES: 'stat_data.latent_variables.ability_update.candidate_ability_qualities[0]',
    GENERATED_ABILITIES: 'stat_data.latent_variables.ability_update.generated_abilities[0]',
    SOLVED_CASES_COUNT: 'stat_data.latent_variables.solved_cases_count[0]',
  } as const;

  const CHAT_PATHS = {
    BLESSING: 'settings.profile.bless_old_gods',
    DAILY_AP: 'settings.daily_ap',
    ENDLESS_MODE: 'settings.endless_mode',
    STORY_ENDED: 'story_ended',
  } as const;

  const chat_variables = getVariables({ type: 'chat' });

  const settings = getSettings();

  // ===================================================================
  // 核心逻辑函数模块
  // ===================================================================
  /**
   * 初始化候选能力的品质。
   * @param {any} stats - stat_data 对象。
   * @param {number} bias - 随机池偏移。
   */
  function initializeAbilityQualities(stats: any, bias: number = 0): void {
    const blessing: string | undefined = _.get(chat_variables, CHAT_PATHS.BLESSING);
    const DEFAULT_BIAS_MAP: Record<string, number> = { Bast: 0, Hypnos: 0, Nodens: 0 };
    const BIAS_MAP: Record<string, Record<string, number>> = {
      猫的庇护: { ...DEFAULT_BIAS_MAP, Bast: 5 },
      面庞的庇护: { ...DEFAULT_BIAS_MAP, Hypnos: 5 },
      隐者的庇护: { ...DEFAULT_BIAS_MAP, Nodens: 5 },
    };

    const BLESSING_BIASES = (blessing && BIAS_MAP[blessing]) || DEFAULT_BIAS_MAP;

    const ABILITY_QUALITIES_WEIGHTED = [
      ...Array(54).fill('普通'),
      ...Array(18).fill('稀有'),
      ...Array(6).fill('史诗'),
      ...Array(2).fill('传说'),
    ];
    _.update(stats, PATHS.CANDIDATE_QUALITIES, (candidates: Record<string, [string, string]>) =>
      _.mapValues(candidates, (value, key) => {
        const max_bias = ABILITY_QUALITIES_WEIGHTED.length - 1;
        const final_bias = Math.min(bias + (BLESSING_BIASES[key as string] || 0), max_bias);
        const quality = ABILITY_QUALITIES_WEIGHTED[_.random(final_bias, max_bias)];
        return [quality, value[1]];
      }),
    );
    console.log(`已根据经验值和旧神的庇护抽选候选能力品质, 等待AI响应。`);
  }

  /**
   * 根据难度等级初始化案件。
   * @param {any} stats - stat_data 对象。
   * @param {number} bias - 难度偏移。
   */
  function initializeCase(stats: any, bias: number): void {
    const difficulty_class = Math.max(1, Math.floor((Math.random() * (16 + bias) + 2 * bias + 7) / 10));
    _.set(stats, PATHS.DIFFICULTY_CLASS, difficulty_class);
    _.set(stats, PATHS.ACTION_POINTS, difficulty_class * 5 + 5);
    _.set(stats, PATHS.OUT_OF_CONTROL, 50);
  }

  /** 清理案件相关的核心信息。*/
  function clearCaseInfoProgress(stats: any, daily_ap: number): void {
    _.set(stats, PATHS.CASE_NAME, '');
    _.set(stats, PATHS.CASE_LOCATION, '');
    _.set(stats, PATHS.DIFFICULTY_CLASS, 0);
    _.set(stats, PATHS.ACTION_POINTS, daily_ap);
    _.set(stats, PATHS.OUT_OF_CONTROL, 0);
  }

  /**
   * 重置指定类型的技能使用状态。
   * @param {any} stats - stat_data 对象。
   * @param {boolean} is_passive - 如果为 true，重置被动技能；如果为 false，重置主动技能。
   */
  function resetSkills(stats: any, is_passive: boolean): void {
    const abilities: any[] = _.get(stats, PATHS.ABILITIES, []);
    let resetCount = 0;
    abilities.forEach(ability => {
      const ability_is_passive = _.get(ability, 'is_passive[0]');
      if (ability && ability_is_passive !== undefined && ability_is_passive === is_passive && _.get(ability, 'is_used[0]') === true) {
        _.set(ability, 'is_used[0]', false);
        resetCount++;
      }
    });
    if (resetCount > 0) {
      const type = is_passive === true ? '被动' : '主动';
      console.log(`已成功重置 ${resetCount} 个 ${type} 技能的使用状态。`);
    }
  }

  /** 根据当前阶段决定是否需要计算新的 phase_changed **/
  function changedIndexUpdate(stats: any): void {
    const story_ended = _.get(chat_variables, CHAT_PATHS.STORY_ENDED);
    const current_phase: string = _.get(stats, PATHS.CURRENT_PHASE);
    let action_points: number = _.get(stats, PATHS.ACTION_POINTS);
    const out_of_control: number = _.get(stats, PATHS.OUT_OF_CONTROL);
    const PHASE_TRANSITION_RULES: Record<string, () => number> = {
      日常阶段: () => (action_points <= 0 ? 2 : -1),
      侦破阶段: () => (out_of_control <= 0 ? 3 : action_points <= 0 || out_of_control >= 100 ? 4 : -1),
    };

    let phase_changed: number = _.get(stats, PATHS.PHASE_CHANGED);

    if (current_phase === '日常阶段') {
      action_points -= 1;
      _.set(stats, PATHS.ACTION_POINTS, action_points);
      _.update(stats, PATHS.GENERATED_ABILITIES, abilities =>
        abilities.isArray && abilities.length === 0 ? abilities : [],
      );
      if (story_ended && phase_changed === -1) {
        _.set(stats, PATHS.PHASE_CHANGED, -1);
        _.set(settings, 'enableStatDataUpdate', false);
        replaceSettings(settings);
        console.log('故事结束，不再生成新案件。');
        return;
      }
    }

    if (phase_changed === 0) {
      phase_changed = 1;
    } else if (phase_changed === -1) {
      const rule = PHASE_TRANSITION_RULES[current_phase];
      if (rule) phase_changed = rule();
    } else if (phase_changed === 1 || phase_changed === 2) {
      phase_changed = -1;
    } else if (phase_changed >= 3) {
      phase_changed = 1;
    }

    _.set(stats, PATHS.PHASE_CHANGED, phase_changed);
  }

  function statDataUpdate(stats: any, daily_ap: number): void {
    const endless_mode = _.get(chat_variables, CHAT_PATHS.ENDLESS_MODE);
    const difficulty_class: number = _.get(stats, PATHS.DIFFICULTY_CLASS);
    const experience: number = _.get(stats, PATHS.EXPERIENCE);
    const LEVEL_RULE = (expr: number): number => {
      for (let i = 0; i < 10; i++) {
        expr -= i;
        if (expr <= 0) return i;
      }
      return 12;
    };

    changedIndexUpdate(stats);
    const phase_changed: number = _.get(stats, PATHS.PHASE_CHANGED);

    if (phase_changed === 1) {
      clearCaseInfoProgress(stats, daily_ap);
      initializeAbilityQualities(stats, experience);
      _.set(stats, PATHS.CURRENT_PHASE, '日常阶段');
    } else if (phase_changed === 2) {
      const level = LEVEL_RULE(experience);
      initializeCase(stats, level);
      _.set(stats, PATHS.CURRENT_PHASE, '侦破阶段');
    } else if (phase_changed >= 3) {
      resetSkills(stats, false);
      _.update(stats, PATHS.EXPERIENCE, (expr: number) => expr + difficulty_class * (9 - phase_changed * 2)) + 3;
      _.set(stats, PATHS.CURRENT_PHASE, '后日谈阶段');
      _.set(stats, PATHS.ACTION_POINTS, 1);
      if (phase_changed === 3) {
        _.update(stats, PATHS.SOLVED_CASES_COUNT, (count: number) => count + 1);
        if (!endless_mode && difficulty_class === 5) {
          _.set(chat_variables, CHAT_PATHS.STORY_ENDED, true);
        }
      }
    }
  }

  const nonNegative = (value: number) => {
    return value >= 0 ? value : 0;
  };

  const removeHashPrefix = (str: string) => {
    return str.replace(/^#\s?/, '');
  };

  const removePrefixDescriptions = (str: string) => {
    return str.replace(/^(主|被)动能力(，|,|。)\s?/, '');
  };

  const entriesCorrection = (
    removePrefix: (str: string) => string,
    entries: Record<string, [string, string]>[],
    target?: string,
  ) => {
    if (entries.length <= 1) return entries;
    return _.map(entries, entry =>
      _.mapValues(entry, (value, key) => (!target || key === target ? [removePrefix(value[0]), value[1]] : value)),
    );
  };

  function valuesCorrection(stats: any): void {
    _.update(stats, PATHS.ACTION_POINTS, nonNegative);
    _.update(stats, PATHS.EXCITEMENT, nonNegative);
    _.update(stats, PATHS.DESIRE, nonNegative);
    _.update(stats, PATHS.CASE_NAME, removeHashPrefix);
    _.update(stats, PATHS.CASE_LOCATION, removeHashPrefix);
    _.update(stats, PATHS.NORMALIZATION, (entries: any) => entriesCorrection(removeHashPrefix, entries));
    _.update(stats, PATHS.OUT_OF_CONTROL, nonNegative);
    _.update(stats, PATHS.GENERATED_ABILITIES, (abilities: any) =>
      entriesCorrection(removePrefixDescriptions, abilities, 'ability_description'),
    );
    resetSkills(stats, true);
  }

  // ===================================================================
  // 主事件监听器
  // ===================================================================
  eventOn('mag_variable_update_ended', async (variables: any) => {
    try {
      const last_message_id = getLastMessageId();
      const messages = getChatMessages(last_message_id);
      if (!messages || messages.length === 0) {
        console.error('无法加载最新楼层消息。');
        return;
      }
      const role = messages[0].role;
      if (role === 'user' && settings.enableStatDataUpdate) {
        const daily_ap: number = _.get(chat_variables, CHAT_PATHS.DAILY_AP, 5);
        const daily_ap_final = last_message_id <= 1 ? daily_ap - 1 : daily_ap;
        statDataUpdate(variables, daily_ap_final);
        console.log('后台状态更新已成功应用。');
      } else {
        valuesCorrection(variables);
      }
    } catch (e) {
      console.error('脚本错误:', e);
    }
  });
  console.log("世界状态后台自动化脚本已加载并监听 'mag_variable_update_ended' 事件。");
});
