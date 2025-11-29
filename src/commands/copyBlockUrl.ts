import '@logseq/libs';

export const copyBlockUrl = () =>
  logseq.Editor.registerSlashCommand('Copy block URL', async () => {
    const currentBlock = await logseq.Editor.getCurrentBlock();
    const currentGraph = await logseq.App.getCurrentGraph();
    if (!currentBlock) {
      return;
    }
    const currentBlockUUID = currentBlock?.uuid;
    if (!currentGraph) {
      return;
    }
    const graphName = currentGraph.name.replace('logseq_db_', '');
    const link = `logseq://graph/${graphName}?block-id=${currentBlockUUID}`;

    parent.navigator.clipboard.writeText(link);

    logseq.UI.showMsg('Link copied to clipboard', 'success');
    console.log(link);
  });
