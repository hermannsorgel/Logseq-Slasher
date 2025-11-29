import '@logseq/libs';
import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user';
import { getSettings } from './settings';
import { copyBlockUrl } from './commands/copyBlockUrl';
import { deletePage } from './commands/deletePage';
import { removeFormatting } from './commands/removeFormatting';

const settingsHelper = (settings: SettingSchemaDesc[]) => {
  logseq.useSettingsSchema(settings);
};

const main = async () => {
  let graphType: 'db' | 'md' = (await logseq.App.checkCurrentIsDbGraph())
    ? 'db'
    : 'md';

  let settings = getSettings(graphType);
  settingsHelper(settings);

  logseq.App.onCurrentGraphChanged(async () => {
    graphType = (await logseq.App.checkCurrentIsDbGraph()) ? 'db' : 'md';
    settings = getSettings(graphType);
    settingsHelper(settings);
  });

  settingsHelper(settings);

  copyBlockUrl();
  await deletePage();
  removeFormatting();
};

logseq.ready(main).catch(console.error);
