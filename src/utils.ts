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

export const jumpBack = (): void => {
  if (window.history.length > 1) {
    window.history.back();
  }
};

export const checkGraphType = async (): Promise<'db' | 'md'> => {
  try {
    const isDbGraph = await logseq.App.checkCurrentIsDbGraph?.();
    return isDbGraph ? 'db' : 'md';
  } catch (e) {
    console.warn('DB Graph check failed (likely MD version):', e);
    return 'md';
  }
};

export const mdVersion = {
  getPagePointer(pageObject: PageEntity) {
    return pageObject.name;
  },

  async orphansHelper(pointer: PageIdentity) {
    let orphansCounter = 0;
    const orphanRemover = async (item: BlockEntity) => {
      if (item.content.toLowerCase() == `[[${pointer}]]`) {
        await logseq.Editor.removeBlock(item.uuid);
        orphansCounter++;
      }
    };
    await this._refsHelper(pointer, orphanRemover);
    return orphansCounter;
  },

  async clearRefs(pointer: BlockIdentity) {
    let removedRefsCounter = 0;
    const refCleaner = async (item: BlockEntity) => {
      const regex = new RegExp(`\\[\\[(${pointer})\\]\\]`, 'gi');
      const newContent = item.content.replaceAll(regex, '$1');
      await logseq.Editor.updateBlock(item.uuid, newContent);
      removedRefsCounter++;
    };
    await this._refsHelper(pointer, refCleaner);
    return removedRefsCounter;
  },

  async _refsHelper(pointer: BlockIdentity, fn) {
    const refs = await logseq.Editor.getPageLinkedReferences(pointer);
    if (!refs) {
      return;
    }

    const promises: Promise<any>[] = [];

    refs.forEach(([_, blocks]) => {
      if (Array.isArray(blocks)) {
        blocks.forEach((blockEntity) => {
          promises.push(fn(blockEntity));
        });
      }
    });

    await Promise.all(promises);
  },
};

export const dbVersion = {
  getPagePointer(pageObject: PageEntity) {
    return pageObject.uuid;
  },

  async orphansHelper(pointer: BlockIdentity, graphType: 'db' | 'md') {
    const blockContentKey = graphType == 'db' ? 'title' : 'content';
    let orphansCounter = 0;
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
        orphansCounter++;
      }
    };
    await this._refsHelper(pointer, orphanRemover);
    return orphansCounter;
  },

  async clearRefs(pointer: PageIdentity) {
    let removedRefsCounter = 0;
    const removingPage = await logseq.Editor.getBlock(pointer);
    if (!removingPage) {
      return;
    }
    const pageRef = removingPage.title;

    const refsRemover = async (item: BlockEntity) => {
      const newContent = item.title.replaceAll(`[[${pageRef}]]`, pageRef);
      await logseq.Editor.updateBlock(item.uuid, newContent);
      removedRefsCounter++;
    };

    await this._refsHelper(pointer, refsRemover);
    return removedRefsCounter;
  },

  async _refsHelper(pointer: BlockIdentity, fn) {
    const refs = await logseq.Editor.getPageLinkedReferences(pointer);
    if (!refs) {
      return;
    }
    const promises = [];
    Object.values(refs).forEach((items) => {
      items.forEach((item) => {
        promises.push(fn(item));
      });
    });
    await Promise.all(promises);
  },
};
