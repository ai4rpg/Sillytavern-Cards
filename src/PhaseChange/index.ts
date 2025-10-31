$(() => {
  // ===================================================================
  // 集中管理所有变量路径，提升代码的可读性、健壮性与可维护性。
  // ===================================================================
  const PATHS = {
    // user
    CURRENT_PHASE: 'stat_data.user.current_phase[0]',
    ACTION_POINTS: 'stat_data.user.action_points[0]',
    ABILITIES: 'stat_data.user.special_abilities[0]',
    BLESSING: 'stat_data.user.profile.bless_old_gods[0]',
    SOLVED_CASES_COUNT: 'stat_data.user.profile.solved_cases_count[0]',
    // world
    CASE_NAME: 'stat_data.world.current_case.case_name[0]',
    CASE_LOCATION: 'stat_data.world.current_case.case_location[0]',
    DIFFICULTY_CLASS: 'stat_data.world.current_case.difficulty_class[0]',
    OUT_OF_CONTROL: 'stat_data.world.current_case.out_of_control[0]',
    // latent_variables
    PHASE_CHANGED: 'stat_data.latent_variables.ejs_index.phase_changed[0]',
    EXPERIENCE: 'stat_data.latent_variables.ejs_index.experience[0]',
    CANDIDATE_QUALITIES: 'stat_data.latent_variables.ability_update.candidate_ability_qualities[0]',
  } as const;

  // ===================================================================
  // 核心逻辑函数模块
  // ===================================================================
  /**
   * 初始化候选能力的品质。
   * @param {any} stats - stat_data 对象。
   * @param {number} bias - 随机偏移量。
   */
  function initializeAbilityQualities(stats: any, bias: number = 0): void {
    const blessing: string | undefined = _.get(stats, PATHS.BLESSING);

    const DEFAULT_BIAS_MAP: Record<string, number> = { Bast: 0, Hypnos: 0, Nodens: 0 };
    const BIAS_MAP: Record<string, Record<string, number>> = {
      猫的庇护: { ...DEFAULT_BIAS_MAP, Bast: 5 },
      面庞的庇护: { ...DEFAULT_BIAS_MAP, Hypnos: 5 },
      隐者的庇护: { ...DEFAULT_BIAS_MAP, Nodens: 5 },
    };

    const BLESSING_BIASES = (blessing && BIAS_MAP[blessing]) || DEFAULT_BIAS_MAP;

    const ABILITY_QUALITIES_WEIGHTED = [
      ...Array(27).fill('普通'),
      ...Array(9).fill('稀有'),
      ...Array(3).fill('史诗'),
      '传说',
    ];
    _.update(stats, PATHS.CANDIDATE_QUALITIES, (candidates: Record<string, string>) =>
      _.mapValues(candidates, key => {
        const max_bias = ABILITY_QUALITIES_WEIGHTED.length - 1;
        const final_bias = Math.min(bias + (BLESSING_BIASES[key as string] || 0), max_bias);
        return ABILITY_QUALITIES_WEIGHTED[_.random(final_bias, max_bias)];
      }),
    );
    console.log(`已根据经验值和旧神的庇护抽选候选能力品质, 等待AI响应。`);
  }

  /**
   * 根据难度等级初始化案件。
   * @param {any} stats - stat_data 对象。
   * @param {number} bias - 由经验值计算的难度偏移。
   */
  function initializeCase(stats: any, bias: number): void {
    const difficulty_class = Math.max(1, Math.floor((Math.random() * 5 + bias + 2) / 3));
    _.set(stats, PATHS.DIFFICULTY_CLASS, difficulty_class);
    _.set(stats, PATHS.ACTION_POINTS, difficulty_class * 5 + 5);
    _.set(stats, PATHS.OUT_OF_CONTROL, 50);
  }

  /** 清理案件相关的核心信息。*/
  function clearCaseInfoProgress(stats: any): void {
    _.set(stats, PATHS.CASE_NAME, '');
    _.set(stats, PATHS.CASE_LOCATION, '');
    _.set(stats, PATHS.DIFFICULTY_CLASS, 0);
    _.set(stats, PATHS.ACTION_POINTS, 5);
    _.set(stats, PATHS.OUT_OF_CONTROL, 0);
  }

  /** 重置所有非被动技能的使用状态。*/
  function resetActiveSkills(stats: any): void {
    const abilities: any[] = _.get(stats, PATHS.ABILITIES, []);
    let resetCount = 0;
    abilities.forEach(ability => {
      if (ability && _.get(ability, 'is_passive[0]') === false && _.get(ability, 'is_used[0]') === true) {
        _.set(ability, 'is_used[0]', false);
        resetCount++;
      }
    });
    if (resetCount > 0) {
      console.log(`已成功重置 ${resetCount} 个主动技能的使用状态。`);
    }
  }

  /** 根据当前阶段决定是否需要计算新的 phase_changed **/
  function changedIndexUpdate(stats: any): void {
    const current_phase: string = _.get(stats, PATHS.CURRENT_PHASE);
    const action_points: number = _.get(stats, PATHS.ACTION_POINTS);
    const out_of_control: number = _.get(stats, PATHS.OUT_OF_CONTROL);
    const PHASE_TRANSITION_RULES: Record<string, () => number> = {
      日常阶段: () => (action_points <= 0 ? 2 : -1),
      侦破阶段: () => (out_of_control <= 0 ? 3 : action_points <= 0 ? 4 : -1),
    };

    let phase_changed: number = _.get(stats, PATHS.PHASE_CHANGED);

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

  function statDataUpdate(stats: any): void {
    const difficulty_class: number = _.get(stats, PATHS.DIFFICULTY_CLASS);
    const experience: number = _.get(stats, PATHS.EXPERIENCE);
    const LEVEL_RULE = (expr: number): number => {
      for (let i = 0; i < 5; i++) {
        expr -= i * 3;
        if (expr <= 0) return i;
      }
      return 5;
    };

    changedIndexUpdate(stats);
    const phase_changed: number = _.get(stats, PATHS.PHASE_CHANGED);

    if (phase_changed === 1) {
      resetActiveSkills(stats);
      clearCaseInfoProgress(stats);
      initializeAbilityQualities(stats, experience);
      _.set(stats, PATHS.CURRENT_PHASE, '日常阶段');
    } else if (phase_changed === 2) {
      _.set(stats, PATHS.CURRENT_PHASE, '侦破阶段');
      const level = LEVEL_RULE(experience);
      initializeCase(stats, level);
    } else if (phase_changed >= 3) {
      _.update(stats, PATHS.EXPERIENCE, (expr: number) => expr + difficulty_class * 3);
      _.update(stats, PATHS.SOLVED_CASES_COUNT, (count: number) => count + 4 - phase_changed);
      _.update(stats, PATHS.EXPERIENCE, (expr: number) => expr + difficulty_class * (9 - phase_changed * 2));
      _.set(stats, PATHS.CURRENT_PHASE, '后日谈阶段');
      _.set(stats, PATHS.ACTION_POINTS, 1);
    }
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
      if (role === 'user') {
        statDataUpdate(variables);
        console.log('后台状态更新已成功应用。');
      }
    } catch (e) {
      console.error('脚本错误:', e);
    }
  });
  console.log("世界状态后台自动化脚本已加载并监听 'mag_variable_update_ended' 事件。");
});
