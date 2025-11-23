import '@logseq/libs';
import {
  BlockEntity,
  PageEntity,
  PageIdentity,
} from '@logseq/libs/dist/LSPlugin.user';
import { getSettings } from './settings';

interface VersionHandler {
  getPagePointer: (pageObject: PageEntity) => string;
  orphansHelper: (pointer: PageIdentity) => Promise<void>;
}

const settingsHelper = (settings) => {
  logseq.useSettingsSchema(settings);
};

const isDBgraph = async () => {
  let isDB = false;
  try {
    if (logseq.App.checkCurrentIsDbGraph) {
      isDB = await logseq.App.checkCurrentIsDbGraph();
    }
  } catch (e) {}
  return isDB;
};

const isDBapp = async () => {
  const info = await logseq.App.getInfo();
  return info.version == '0.11.0';
};

const getCurrentPage = async () => {
  const currentBlock: BlockEntity | null =
    await logseq.Editor.getCurrentBlock();
  if (!currentBlock) {
    logseq.UI.showMsg(`Cannot find the current block`, 'warning');
    return;
  }
  const currentPage = await logseq.Editor.getPage(currentBlock.page.id);
  if (!currentPage) {
    logseq.UI.showMsg(`Cannot find the current page`, 'error');
    return;
  }
  return currentPage;
};

const mdVersion = {
  getPagePointer(pageObject: PageEntity) {
    return pageObject.name;
  },

  async orphansHelper(pointer: PageIdentity) {
    const orphanRemover = async (item) => {
      if (item.content.toLowerCase() == `[[${pointer}]]`) {
        await logseq.Editor.removeBlock(item.uuid);
      }
    };
    await this._refsHelper(pointer, orphanRemover);
  },

  async clearRefs(pointer) {
    const refCleaner = async (item) => {
      const regex = new RegExp(`\\[\\[(${pointer})\\]\\]`, 'gi');
      const newContent = item.content.replaceAll(regex, '$1');
      await logseq.Editor.updateBlock(item.uuid, newContent);
    };
    await this._refsHelper(pointer, refCleaner);
  },

  async _refsHelper(pointer, fn) {
    const refs = await logseq.Editor.getPageLinkedReferences(pointer);
    if (!refs) {
      return;
    }
    refs.forEach(([_, blocks]) => {
      if (Array.isArray(blocks)) {
        blocks.forEach((blockEntity) => {
          fn(blockEntity);
        });
      }
    });
  },
};

const dbVersion = {
  getPagePointer(pageObject: PageEntity) {
    return pageObject.uuid;
  },

  async orphansHelper(pointer, graphType) {
    const blockContentKey = graphType == 'db' ? 'title' : 'content';

    let pageRef = pointer;
    if (graphType == 'md') {
      const removingPage = await logseq.Editor.getBlock(pointer);
      if (!removingPage) {
        return;
      }
      pageRef = removingPage.title;
    }

    const orphanRemover = async (item) => {
      if (item[blockContentKey] == `[[${pageRef}]]`) {
        await logseq.Editor.removeBlock(item.uuid);
      }
    };
    await this._refsHelper(pointer, orphanRemover);
  },

  async clearRefs(pointer: PageIdentity) {
    const removingPage = await logseq.Editor.getBlock(pointer);
    if (!removingPage) {
      return;
    }
    const pageRef = removingPage.title;

    const refsCleaner = async (item) => {
      const newContent = item.title.replaceAll(`[[${pageRef}]]`, pageRef);
      await logseq.Editor.updateBlock(item.uuid, newContent);
    };

    await this._refsHelper(pointer, refsCleaner);
  },

  async _refsHelper(pointer, fn) {
    const refs = await logseq.Editor.getPageLinkedReferences(pointer);
    if (!refs) {
      return;
    }
    Object.values(refs).forEach((items) => {
      items.forEach((item) => {
        fn(item);
      });
    });
  },
};

const jumpBack = () => {
  if (history.length > 1) {
    history.back();
  }
};

const main = async () => {
  logseq.UI.showMsg(`plugin is loaded`, 'warning');

  let graphType: 'db' | 'md' = (await isDBgraph()) ? 'db' : 'md';
  let version = (await isDBapp()) ? dbVersion : mdVersion;
  let settings = getSettings(graphType);
  settingsHelper(settings);

  logseq.App.onCurrentGraphChanged(async () => {
    graphType = (await isDBgraph()) ? 'db' : 'md';
    settings = getSettings(graphType);
    settingsHelper(settings);
  });

  logseq.Editor.registerSlashCommand('Delete this page', async () => {
    const currentPage = await getCurrentPage();
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

logseq.ready(main).catch(console.error);
