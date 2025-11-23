import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin';

const commonSettings: SettingSchemaDesc[] = [
  {
    key: 'jumpBack',
    type: 'boolean',
    title: 'Jump Back',
    description:
      'Navigate to previous page after deletion instead of home page',
    default: true,
  },
  {
    key: 'removeOrph',
    type: 'boolean',
    title: 'Remove orphans',
    description:
      'Remove blocks that only contained [[references]] to the deleted page',
    default: true,
  },
];

const settingsSchemaMD: SettingSchemaDesc[] = [
  ...commonSettings,
  {
    key: 'clearRefs',
    type: 'boolean',
    title: 'Clear References',
    description:
      'Remove page references links from blocks, keeping the content.',
    default: true,
  },
];

const settingsSchemaDB: SettingSchemaDesc[] = [...commonSettings];

export const getSettings = (graphType: 'md' | 'db'): SettingSchemaDesc[] => {
  if (graphType === 'md') {
    return settingsSchemaMD;
  } else {
    return commonSettings;
  }
};
