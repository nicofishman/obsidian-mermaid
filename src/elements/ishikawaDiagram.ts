import { IMermaidElement } from "src/core/IMermaidElement";

export const ishikawaDiagramElements: IMermaidElement[] = [
	{
		id: crypto.randomUUID(),
		categoryId: "ishikawa",
		description: "Sample Ishikawa (fishbone) diagram",
		content: `Blurry Photo
Process
    Out of focus
    Shutter speed too slow
User
    Shaky hands`,
		sortingOrder: 0,
		isPinned: false,
	},
];
