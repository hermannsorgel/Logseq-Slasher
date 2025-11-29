import '@logseq/libs';
import { PageEntity, PageIdentity } from '@logseq/libs/dist/LSPlugin.user';

import { mdVersion, dbVersion, isDBapp, jumpBack } from '../utils';

interface VersionHandler {
  getPagePointer: (pageObject: PageEntity) => string;
  orphansHelper: (pointer: PageIdentity) => Promise<void>;
}

export const deletePage = async () => {
  let graphType: 'db' | 'md' = (await logseq.App.checkCurrentIsDbGraph())
    ? 'db'
    : 'md';
  let version = (await isDBapp()) ? dbVersion : mdVersion;

  logseq.Editor.registerSlashCommand('Delete this page', async () => {
    const currentPage = await logseq.Editor.getCurrentPage();

    if (!currentPage) {
      console.log('No current page');
      return;
    }
    const pointer = version.getPagePointer(currentPage);

    if (logseq.settings?.removeOrph) {
      await version.orphansHelper(pointer, graphType);
    }
    if (logseq.settings?.clearRefs && graphType == 'md') {
      await version.clearRefs(pointer);
    }
    if (logseq.settings?.jumpBack) {
      jumpBack();
    }
    await logseq.Editor.deletePage(pointer);
  });
};
