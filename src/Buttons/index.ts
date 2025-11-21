$(() => {
  async function hideMessage(phase: string): Promise<void> {
    try {
      let start = NaN;
      let end = NaN;
      let error_id = NaN;
      const last_message_id = getLastMessageId();
      await waitGlobalInitialized('Mvu');

      for (let id = last_message_id; id > 0; id--) {
        const mvuData = Mvu.getMvuData({ type: 'message', message_id: id });
        const current_phase = _.get(mvuData, 'stat_data.user.current_phase[0]');
        switch (current_phase) {
          case phase:
            if (!end) {
              end = id + 1;
            }
            break;
          case undefined:
            error_id = id;
            if (end) {
              start = id + 1;
            }
            break;
          default:
            if (end) {
              start = id + 2;
            }
            break;
        }
        if (start) {
          break;
        }
      }

      if (start && end) {
        const hide_range = start + '-' + end;
        triggerSlash('/hide ' + hide_range);
        toastr.success('隐藏了' + hide_range + '楼的内容。');
      }
      if (error_id) {
        throw new Error(error_id + '楼以及之前的楼层数据丢失，请自行判断这些楼层是否需要隐藏。');
      }
    } catch (e: any) {
      toastr.error(`隐藏楼层时发生错误: ${e.message}请关闭 MVU 的自动清理功能以免同样的问题再次发生。`);
      console.error(e);
    }
  }

  async function endDaily() {
    try {
      await waitGlobalInitialized('Mvu');
      const mvuData = Mvu.getMvuData({ type: 'message', message_id: 'latest' });
      const current_phase = _.get(mvuData, 'stat_data.user.current_phase[0]');
      switch (current_phase) {
        case '日常阶段':
          _.set(mvuData, 'stat_data.user.action_points[0]', 0);
          await Mvu.replaceMvuData(mvuData, { type: 'message', message_id: 'latest' });
          toastr.success('设置成功，将在下次回复后进入侦破阶段。');
          break;
        case undefined:
          throw new Error('MVU变量获取失败。');
        default:
          toastr.warning('当前不是日常阶段，请在日常阶段点击按钮。');
          break;
      }
    } catch (e: any) {
      toastr.error(e.message);
      console.error(e);
    }
  }

  eventOn(getButtonEvent('隐藏最近的侦破过程'), async () => {
    await hideMessage('侦破阶段');
  });

  eventOn(getButtonEvent('提前结束日常阶段'), endDaily);
});
