import { isEqual, merge } from 'lodash';

export async function selectAbility(ability: any) {
  try {
    await waitGlobalInitialized('Mvu');
    const mvuData = Mvu.getMvuData({ type: 'message', message_id: 'latest' });
    if (!mvuData || !mvuData.stat_data) {
      throw new Error('未在聊天变量中找到 stat_data。');
    }

    if (!isEqual(ability.is_used, [false, ''])) {
      ability.is_used = [false, ''];
    }

    const command = `_.assign('user.special_abilities[0]', ${JSON.stringify(ability)}); // choose a special abilities`;
    const newMvuData = await Mvu.parseMessage(command, mvuData);

    if (newMvuData) {
      if (mvuData.delta_data) {
        newMvuData.delta_data = merge({}, mvuData.delta_data, newMvuData.delta_data);
      }
      await Mvu.replaceMvuData(newMvuData, { type: 'message', message_id: 'latest' });
    }
    toastr.success(`已选择能力: ${ability.ability_name}`);
  } catch (error) {
    console.error('Failed to select ability:', error);
    toastr.error(`选择能力失败: ${String(error)}`);
  }
}
