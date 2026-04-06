import { IMermaidElement } from "src/core/IMermaidElement";

export const vennDiagramElements: IMermaidElement[] = [
	{
		id: crypto.randomUUID(),
		categoryId: "venn",
		description: "Sample Venn diagram (syntax per Mermaid docs)",
		// Body only; category wrapping adds `venn-beta`. Use comma-separated sets in `union` (see mermaid.js.org/syntax/venn.html).
		content: `  title "Team overlap"
  set Frontend
  set Backend
  union Frontend,Backend["APIs"]`,
		sortingOrder: 0,
		isPinned: false,
	},
];
