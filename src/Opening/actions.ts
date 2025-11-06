import _ from 'lodash';
import abilitiesDB from './AbilitiesDB.json' assert { type: 'json' };

const PATHS = {
  RESISTANCE: 'user.sex_statue.lust_resistance[0]',
  ABILITIES: 'user.special_abilities[0]',
  IDENTITY: 'user.profile.past_identity[0]',
  BLESSING: 'user.profile.bless_old_gods[0]',
  HOME: 'user.profile.home[0]',
  PHASE_CHANGED: 'latent_variables.ejs_index.phase_changed[0]',
  OPTION_DB: 'latent_variables.opening_options_db',
};

export async function createStart(selections: {
  livelihood: string;
  god: string;
  district: string;
  resistance: string;
}) {
  if (
    typeof Mvu === 'undefined' ||
    typeof generate !== 'function' ||
    typeof getChatMessages !== 'function' ||
    typeof setChatMessages !== 'function' ||
    typeof getLastMessageId !== 'function' ||
    typeof updateVariablesWith !== 'function'
  ) {
    throw new Error('无法访问酒馆助手核心API。请确保酒馆助手 (Tavern Helper) 已安装并正确加载。');
  }

  await waitGlobalInitialized('Mvu');

  // 1. Prepare the data based on user selections
  const initialData = Mvu.getMvuData({ type: 'message', message_id: 0 });
  if (!initialData || !initialData.stat_data) {
    throw new Error('未在聊天变量中找到 stat_data。');
  }

  const chosenStatData = initialData.stat_data;

  const abilitiesToAdd: string[] = [];
  const { livelihood, god, district, resistance } = selections;

  const resistanceAbility = (abilitiesDB.resistance as Record<string, any>)[resistance];
  if (resistanceAbility) {
    abilitiesToAdd.push(resistanceAbility);
  }

  const livelihoodAbilities = (abilitiesDB.livelihood as Record<string, any>)[livelihood];
  if (livelihoodAbilities) {
    const abilities = Array.isArray(livelihoodAbilities) ? livelihoodAbilities : [livelihoodAbilities];
    abilitiesToAdd.push(...abilities);
  }

  _.set(chosenStatData, PATHS.IDENTITY, livelihood);
  _.set(chosenStatData, PATHS.BLESSING, god);
  _.set(chosenStatData, PATHS.HOME, district);
  _.set(chosenStatData, PATHS.RESISTANCE, resistance);
  _.set(chosenStatData, PATHS.ABILITIES, abilitiesToAdd);
  _.set(chosenStatData, PATHS.PHASE_CHANGED, 0);
  _.merge(initialData.stat_data, chosenStatData);

  replaceVariables(initialData, { type: 'message', message_id: 0 });

  // 2. Generate the AI response
  const generatedResponse = await generate({ user_input: '' });

  // 3. Get the newly created message
  const latestMessage = getChatMessages(-1, { include_swipes: true })[0];

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
