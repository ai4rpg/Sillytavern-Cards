export async function getStatData(message_id: number, key?: string) {
  const messages = await getChatMessages(message_id);
  if (!messages || messages.length === 0 || !messages[0].data) {
    throw new Error('楼层消息丢失。');
  }
  const gameData = messages[0].data;
  if (key) {
    const stats = gameData[key];
    if (!stats) {
      throw new Error(`未在消息变量中找到 ${key}。`);
    }
    return stats;
  } else {
    return gameData;
  }
}

export function getValue(obj: any, path: string, defaultValue: any = "N/A") {
  let keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length; i++) {
    if (current === undefined || current === null || typeof current !== 'object' || !current.hasOwnProperty(keys[i])) {
      return defaultValue;
    }
    current = current[keys[i]];
  }
  if (Array.isArray(current) && current.length === 2 && typeof current[1] === 'string') {
    return current[0];
  } else {
    return (current === undefined || current === null) ? defaultValue : current;
  }
}