import { IMermaidElement } from "src/core/IMermaidElement";

export const radarDiagramElements: IMermaidElement[] = [
	{
		id: crypto.randomUUID(),
		categoryId: "radar",
		description: "Sample radar chart",
		content: `title Skills comparison
axis Speed, Quality, Cost, Scope, Risk
curve teamA{8, 7, 6, 5, 8}
curve teamB{6, 8, 7, 9, 6}`,
		sortingOrder: 0,
		isPinned: false,
	},
];
