import '@logseq/libs';
import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user';
import { checkGraphType } from './utils';
import { getSettings } from './settings';
import { copyBlockUrl } from './commands/copyBlockUrl';
import { deletePage } from './commands/deletePage';
import { removeFormatting } from './commands/removeFormatting';

const settingsHelper = (settings: SettingSchemaDesc[]) => {
  logseq.useSettingsSchema(settings);
};

const main = async () => {
  let graphType: 'db' | 'md' = await checkGraphType();

  let settings = getSettings(graphType);
  settingsHelper(settings);

  logseq.App.onCurrentGraphChanged(async () => {
    graphType = await checkGraphType();
    settings = getSettings(graphType);
    settingsHelper(settings);
  });

  settingsHelper(settings);

  copyBlockUrl();
  deletePage();
  removeFormatting();
};

logseq.ready(main).catch(console.error);
