import { IMermaidElement } from "src/core/IMermaidElement";

export const treemapDiagramElements: IMermaidElement[] = [
	{
		id: crypto.randomUUID(),
		categoryId: "treemap",
		description: "Sample treemap",
		content: `"Products"
    "North": 40
    "South"
      "East": 25
      "West": 35
"Services"
    "Consulting": 30`,
		sortingOrder: 0,
		isPinned: false,
	},
];
