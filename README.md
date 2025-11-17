
<img width="128" height="128" alt="slasher" src="https://github.com/user-attachments/assets/fce8b107-6bb6-4da7-89e0-cab38dd19ba3" />

# Logseq Slasher
The opinionated page remover for Logseq.

Every day I delete multiple pages in Logseq DB. First, I create pages, tags, or properties to test some ideas. Then I have to clean things up.

There are three annoying things about deleting pages:

1. I have to use my mouse and click through multiple UI menus.
2. After deleting the current page, Logseq jumps to the journal/home page — while I usually prefer to return to the previous page.
3. If a page was created from another block with `[[syntax]]`, removing the page won't remove that block — it becomes an orphan, a regular text node.

This plugin adds a `/delete this pageּ` command that solves exactly these issues:

1. Deletes the current page.
2. Jumps to the previous page.
3. Removes all blocks referencing the removed page, if they contain no other data besides the reference.

Pages are deleted without asking for confirmation. If user accidentally deletes a page, `⌘+z` will restore it. Nevertheless, it is easy to lose data with Slasher, so please make regular backups.

## Demo
https://github.com/user-attachments/assets/b430b4c2-599e-4e1a-8528-dce4b4bcd617

## If

If you do not want to install another plugin, or just do not like my approach, try this query:

```clojure
{:query [:find (pull ?page [*])
         :in $ ?start
         :where
         (or-join [?tag]
           [?tag :block/name "page"]
           [?tag :block/name "property"]
           [?tag :block/name "tag"]
         )
         [?page :block/tags ?tag]
         [?page :block/created-at ?created]
         [(> ?created ?start)] 
 ]
 :inputs [:-1d-start]
}
```
It will show all recently created pages. With [bulk actions](https://github.com/logseq/docs/blob/master/db-version.md#bulk-actions) in Logseq DB it's easy to delete unwanted pages.
