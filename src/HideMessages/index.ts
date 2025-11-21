$(() => {
  function formatIds(ids: number[]) {
    const sortedIds = [...new Set(ids)].sort((a, b) => a - b); // 排序并去重
    const result = [];
    let start = sortedIds[0];
    let end = sortedIds[0];

    for (let i = 1; i <= sortedIds.length; i++) {
      if (i < sortedIds.length && sortedIds[i] === sortedIds[i - 1] + 1) {
        end = sortedIds[i];
      } else {
        if (start === end) {
          result.push(`${start}`);
        } else {
          result.push(`${start}~${end}`);
        }

        if (i < sortedIds.length) {
          start = sortedIds[i];
          end = sortedIds[i];
        }
      }
    }
    return `${result.join(', ')}楼层`;
  }

  async function hideMessage(phase: string): Promise<void> {
    try {
      let ids_to_hide: number[] = [];
      let undefined_ids: number[] = [];
      const last_message_id = getLastMessageId();
      const unhidden_messages = getChatMessages('0-' + last_message_id, { hide_state: 'unhidden' });
      await waitGlobalInitialized('Mvu');
      if (!unhidden_messages || unhidden_messages.length === 0) {
        throw new Error('无法获取未隐藏楼层信息，或者所有楼层都被隐藏。');
      }
      for (let message of unhidden_messages) {
        const current_phase = message?.data?.stat_data?.user?.current_phase[0];
        if (current_phase === undefined) {
          undefined_ids.push(message.message_id);
        } else if (current_phase === phase) {
          ids_to_hide.push(message.message_id);
        }
      }
      if (ids_to_hide.length === 0) {
        toastr.info('没有需要隐藏的楼层。');
      } else {
        await setChatMessages(ids_to_hide.map(message_id => ({ message_id, is_hidden: true })));
        const hide_success = formatIds(ids_to_hide);
        toastr.success('隐藏了' + hide_success + '的内容。');
      }
      if (undefined_ids.length >= 1) {
        const floors_undefined = formatIds(undefined_ids);
        throw new Error(floors_undefined + '的数据丢失，请关闭 MVU 的自动清理功能。');
      }
    } catch (e: any) {
      console.error(e);
    }
  }

  eventOn(getButtonEvent('隐藏侦破阶段楼层'), async () => {
    await hideMessage('侦破阶段');
  });
});
