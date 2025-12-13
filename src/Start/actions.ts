import _ from 'lodash';
import { getStatData } from '../shared/utils/getStatData';
import abilitiesDB from './AbilitiesDB.json' assert { type: 'json' };

const PATHS = {
  ABILITIES: 'user.special_abilities[0]',
  PHASE_CHANGED: 'latent_variables.ejs_index.phase_changed[0]',
};

const CHAT_PATHS = {
  GENDER: 'settings.profile.gender',
  IDENTITY: 'settings.profile.past_identity',
  BLESSING: 'settings.profile.bless_old_gods',
  HOME: 'settings.profile.home',
  RESISTANCE: 'settings.profile.lust_resistance',
  DAILY_AP: 'settings.daily_ap',
  ENDLESS_MODE: 'settings.endless_mode',
};

export interface Selections {
  gender: string;
  livelihood: string;
  god: string;
  district: string;
  resistance: string;
  daily_ap: number;
  endless_mode: boolean;
}

export async function createStart(selections: Selections) {
  if (
    typeof generate !== 'function' ||
    typeof getChatMessages !== 'function' ||
    typeof setChatMessages !== 'function' ||
    typeof getLastMessageId !== 'function' ||
    typeof replaceVariables !== 'function'
  ) {
    throw new Error('无法访问酒馆助手核心API。请确保酒馆助手 (Tavern Helper) 已安装并正确加载。');
  }

  // 1. Prepare the data based on user selections
  await waitGlobalInitialized('Mvu');
  const initialData = await getStatData(0);
  if (!initialData || !initialData.stat_data) {
    throw new Error('未在消息变量中找到 stat_data。');
  }

  const chosenStatData = initialData.stat_data;

  const abilitiesToAdd: string[] = [];
  const { gender, livelihood, god, district, resistance, daily_ap, endless_mode } = selections;

  const resistanceAbility = (abilitiesDB.resistance as Record<string, any>)[resistance];
  if (resistanceAbility) {
    abilitiesToAdd.push(resistanceAbility);
  }

  const livelihoodAbilities = (abilitiesDB.livelihood as Record<string, any>)[livelihood];
  if (livelihoodAbilities) {
    const abilities = Array.isArray(livelihoodAbilities) ? livelihoodAbilities : [livelihoodAbilities];
    abilitiesToAdd.push(...abilities);
  }

  _.set(chosenStatData, PATHS.ABILITIES, abilitiesToAdd);
  _.set(chosenStatData, PATHS.PHASE_CHANGED, 0);
  _.merge(initialData.stat_data, chosenStatData);

  replaceVariables(initialData, { type: 'message', message_id: 0 });

  const chatData = getVariables({ type: 'chat' });

  _.set(chatData, CHAT_PATHS.GENDER, gender);
  _.set(chatData, CHAT_PATHS.IDENTITY, livelihood);
  _.set(chatData, CHAT_PATHS.BLESSING, god);
  _.set(chatData, CHAT_PATHS.HOME, district);
  _.set(chatData, CHAT_PATHS.RESISTANCE, resistance);
  _.set(chatData, CHAT_PATHS.DAILY_AP, daily_ap);
  _.set(chatData, CHAT_PATHS.ENDLESS_MODE, endless_mode);

  replaceVariables(chatData, { type: 'chat' });

  // 2. Generate the AI response
  const generatedResponse = await generate({ user_input: '' });

  // 3. Get the newly created message
  const latestMessage = await getChatMessages(-1, { include_swipes: true })[0];

  // 4. Prepare new swipes and their data
  const newSwipes = [...latestMessage.swipes, generatedResponse + '\n\n<StatusPlaceHolderImpl/>'];
  const newSwipeData = await Mvu.parseMessage(generatedResponse, initialData);
  const newSwipesData = [...latestMessage.swipes_data, newSwipeData ? newSwipeData : initialData];

  // 5. Update the message with the new swipe and data
  await setChatMessages([
    {
      message_id: -1,
      swipes: newSwipes,
      swipes_data: newSwipesData,
      swipe_id: latestMessage.swipes.length, // new swipe is at the end
    },
  ]);
}
