
<img width="128" height="128" alt="slasher" src="https://github.com/user-attachments/assets/fce8b107-6bb6-4da7-89e0-cab38dd19ba3" />

# Logseq Slasher
The opinionated page remover for Logseq.

Every day I delete multiple pages in Logseq DB. First, I create pages, tags, or properties to test some ideas. Then I have to clean things up.

There are three annoying things about deleting pages:

1. I have to use my mouse and click through multiple UI menus.
2. After deleting the current page, Logseq jumps to the journal/home page — while I usually prefer to return to the previous page.
3. If a page was created from another page with `[[syntax]]`, removing the page won't remove that block — it becomes an orphan, a regular text node.

This plugin adds a `/delete this pageּ` command that solves exactly these issues:

1. Deletes the current page
2. Jumps to the previous page
3. Removes all blocks referencing the removed page, if they contain no other content besides the reference.

Pages are deleted without asking for confirmation. If user accidentally deletes a page, `⌘+z` will restore it.

## Demo
https://github.com/user-attachments/assets/3594c770-be4a-429a-8149-e75973538474

