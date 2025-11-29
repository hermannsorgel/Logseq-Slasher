import '@logseq/libs';
import {
  mdVersion,
  dbVersion,
  isDBapp,
  jumpBack,
  checkGraphType,
} from '../utils';

export const deletePage = async () => {
  logseq.Editor.registerSlashCommand('Delete this page', async () => {
    const currentPage = await logseq.Editor.getCurrentPage();
    const graphType: 'db' | 'md' = await checkGraphType();
    const version = (await isDBapp()) ? dbVersion : mdVersion;
    let orphansCounter = 0;
    let removedRefsCounter = 0;

    if (!currentPage) {
      console.log('No current page');
      return;
    }
    const pointer = version.getPagePointer(currentPage);

    if (logseq.settings?.jumpBack) {
      jumpBack();
    }

    if (logseq.settings?.removeOrph) {
      orphansCounter = await version.orphansHelper(pointer, graphType);
    }
    if (logseq.settings?.clearRefs && graphType == 'md') {
      removedRefsCounter = await version.clearRefs(pointer);
    }

    if (orphansCounter > 0 || removedRefsCounter > 0) {
      let message = orphansCounter
        ? `Orphans removed: ${orphansCounter}\n`
        : '';
      message = removedRefsCounter
        ? message + `References removed: ${removedRefsCounter}`
        : message;
      await logseq.UI.showMsg(message, 'success');
    }

    await logseq.Editor.deletePage(pointer);
  });
};
