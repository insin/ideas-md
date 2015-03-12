## 0.6.1 / 2015-03-12

Upgraded to React 0.13.

## 0.6 / 2015-03-05

Ditched and deprecated `PlainEditable` - now using `input` and
[react-textarea-autosize](https://github.com/andreypopp/react-textarea-autosize),
which was all the app ever really needed.

Added confirmation when deleting sections.

## 0.5 / 2015-02-26

Updated [`PlainEditable`](https://github.com/insin/react-plain-editable) to
version 2.0.0 - now uses plain text for storage.

Placeholder values are now displayed any time an editable value becomes blank,
not just initially.

## 0.4 / 2015-02-24

`##` headings now win if both supported heading types are detected when
importing a file.

Added export to an IDEAS.md file - defaults to exporting `##` headings, but will
export headings matching the format used in the last file import.

Fixed trimming of whitespace when importing.

Switched to centred layout.

Fixed drag and drop import in IE11.

Automatically give focus to the names of newly-created sections.

## 0.3 / 2015-02-22

Added importing ideas by dragging and dropping a Markdown file.

The following types of headings will become section names:

```markdown
## 2 Hash Heading

Underline Equals Heading
========================
```

Fixed using the spacebar to use buttons.

## 0.2 / 2015-02-19

Extracted `ContentEditable` component out into [react-plain-editable](https://github.com/insin/react-plain-editable).

## 0.1 / 2015-02-18

Initial version.
