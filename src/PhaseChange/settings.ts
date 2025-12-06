import { z } from 'zod';

export const Settings = z.object({
  enableStatDataUpdate: z.boolean().default(true),
});

export type Settings = z.infer<typeof Settings>;

const script_id = getScriptId();

export function getSettings(): Settings {
  const settings = getVariables({ type: 'script', script_id });
  return Settings.parse(settings);
}

export function replaceSettings(settings: Settings): void {
  replaceVariables(settings, { type: 'script', script_id });
}
