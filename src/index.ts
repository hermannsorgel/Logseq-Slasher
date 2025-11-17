import "@logseq/libs";
import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user";

const removeOrphans = async (uuid: string) => {
  const refs = await logseq.Editor.getPageLinkedReferences(uuid)
  if (!refs) {
    return
  }
  Object.values(refs).forEach(items => {
    items.forEach(item => {
      if (item.title == `[[${uuid}]]`) {
        logseq.Editor.removeBlock(item.uuid)
      }
    });
  });
}

const main = () => {
  logseq.Editor.registerSlashCommand("Delete this page", async () => {
    try {
      const currentBlock: BlockEntity | null = await logseq.Editor.getCurrentBlock();
      if (!currentBlock) {
        logseq.UI.showMsg(`Cannot find the current block`, 'warning');
        return;
      }
      const currentPage = await logseq.Editor.getPage(currentBlock.page.id);
      if (!currentPage) {
        logseq.UI.showMsg(`Cannot find the current page`, 'error');
        return;
      }

      history.back();
      await removeOrphans(currentPage.uuid)
      await logseq.Editor.deletePage(currentPage.uuid);
      await logseq.UI.showMsg(`Page "${currentPage.name}" has been deleted.`, 'success');

      console.log('new part');

    } catch (error) {
      console.error('Error deleting page:', error);
      logseq.UI.showMsg('An unexpected error occurred while deleting the page.', 'error');
    }
  });
};

logseq.ready(main).catch(console.error)
