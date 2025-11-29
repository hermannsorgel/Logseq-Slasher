import '@logseq/libs';
import {
  PageEntity,
  PageIdentity,
  BlockEntity,
  BlockIdentity,
} from '@logseq/libs/dist/LSPlugin.user';

let _isDBAppCached: boolean | null = null;

export const isDBapp = async (): Promise<boolean> => {
  if (_isDBAppCached !== null) return _isDBAppCached;

  const info = await logseq.App.getInfo();
  return info.version >= '0.11.0';
};

export const getCurrentPage = async (): Promise<PageEntity | null> => {
  const currentBlock = await logseq.Editor.getCurrentBlock();

  if (!currentBlock?.page?.id) return null;

  const currentPage = await logseq.Editor.getPage(currentBlock.page.id);
  return currentPage || null;
};

export const jumpBack = (): void => {
  if (window.history.length > 1) {
    window.history.back();
  }
};

export const mdVersion = {
  getPagePointer(pageObject: PageEntity) {
    return pageObject.name;
  },

  async orphansHelper(pointer: PageIdentity) {
    const orphanRemover = async (item: BlockEntity) => {
      if (item.content.toLowerCase() == `[[${pointer}]]`) {
        await logseq.Editor.removeBlock(item.uuid);
      }
    };
    await this._refsHelper(pointer, orphanRemover);
  },

  async clearRefs(pointer: BlockIdentity) {
    const refCleaner = async (item: BlockEntity) => {
      const regex = new RegExp(`\\[\\[(${pointer})\\]\\]`, 'gi');
      const newContent = item.content.replaceAll(regex, '$1');
      await logseq.Editor.updateBlock(item.uuid, newContent);
    };
    await this._refsHelper(pointer, refCleaner);
  },

  async _refsHelper(pointer: BlockIdentity, fn) {
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

export const dbVersion = {
  getPagePointer(pageObject: PageEntity) {
    return pageObject.uuid;
  },

  async orphansHelper(pointer: BlockIdentity, graphType: 'db' | 'md') {
    const blockContentKey = graphType == 'db' ? 'title' : 'content';

    let pageRef = pointer;
    if (graphType == 'md') {
      const removingPage = await logseq.Editor.getBlock(pointer);
      if (!removingPage) {
        return;
      }
      pageRef = removingPage.title;
    }

    const orphanRemover = async (item: BlockEntity) => {
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

    const refsRemover = async (item: BlockEntity) => {
      const newContent = item.title.replaceAll(`[[${pageRef}]]`, pageRef);
      await logseq.Editor.updateBlock(item.uuid, newContent);
    };

    await this._refsHelper(pointer, refsRemover);
  },

  async _refsHelper(pointer: BlockIdentity, fn) {
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
