import '@logseq/libs';

export const removeFormatting = () => {
  logseq.Editor.registerSlashCommand('Remove text formatting', async () => {
    const currentBlock = await logseq.Editor.getCurrentBlock();
    if (!currentBlock) {
      console.error('Cannot get block');
      return;
    }

    const contentKey = (await logseq.App.checkCurrentIsDbGraph?.())
      ? 'title'
      : 'content';
    const newContent = removeMarkdown(currentBlock[contentKey]);

    await logseq.Editor.exitEditingMode();
    await logseq.Editor.updateBlock(currentBlock.uuid, newContent);
    await logseq.Editor.upsertBlockProperty(
      currentBlock.uuid,
      ':logseq.property/heading'
    );
  });
};

function removeMarkdown(text: string) {
  if (!text) return '';

  const patterns = [
    // Headers: # to ######
    { match: /^#{1,6}\s+/gm, replacement: '' },

    // Bold: ** or __
    { match: /(\*\*|__)(.+?)\1/g, replacement: '$2' },

    // Italic: * or _
    { match: /([*_])(.+?)\1/g, replacement: '$2' },

    // Strikethrough: ~~
    { match: /~~(.+?)~~/g, replacement: '$1' },

    // Highlight: ==
    { match: /==(.+?)==/g, replacement: '$1' },
  ];

  let output = text;
  let previous;

  do {
    previous = output;
    patterns.forEach(({ match, replacement }) => {
      output = output.replace(match, replacement);
    });
  } while (output !== previous);

  return output;
}
