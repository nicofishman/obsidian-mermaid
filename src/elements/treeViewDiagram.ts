import { IMermaidElement } from "src/core/IMermaidElement";

export const treeViewDiagramElements: IMermaidElement[] = [
	{
		id: crypto.randomUUID(),
		categoryId: "treeView",
		description: "Sample tree view (quoted labels per Mermaid docs)",
		// Body only; wrapping adds `treeView-beta`. Labels must be quoted — see mermaid.js.org/syntax/treeView.html
		content: `    "<folder name>"
        "<file name>"
        "<folder name>"
            "<file name>"
    "<file-name>"`,
		sortingOrder: 0,
		isPinned: false,
	},
];
