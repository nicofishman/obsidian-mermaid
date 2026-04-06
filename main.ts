import {  Editor, Plugin } from 'obsidian';
import { getBundledMermaid, installBundledMermaidGlobal, makeMermaidRenderId } from 'src/mermaid/bundledMermaid';
import { MermaidElementService } from 'src/core/elementService';
import { TextEditorService } from 'src/core/textEditorService';
import { architectureElements } from 'src/elements/architecture';
import { blockDiagramElements } from 'src/elements/blockDiagram';
import { c4DiagramElements } from 'src/elements/c4Diagram';
import { kanbanElements } from 'src/elements/kanban';
import { mindMapElements } from 'src/elements/mindMap';
import { packetElements } from 'src/elements/packet';
import { quadrantElements } from 'src/elements/quadrant';
import { timelineElements } from 'src/elements/timeline';
import { MermaidPluginSettings } from 'src/settings/settings';
import { addTridentIcon } from 'src/trident-icon';
import { MermaidToolsSettingsTab } from 'src/ui/settingsTab';
import { MermaidToolbarView } from 'src/ui/toolbarView/mermaidToolbarView';

export const TRIDENT_ICON_NAME = "trident-custom";


export default class MermaidPlugin extends Plugin {
	settings: MermaidPluginSettings;
	private activeEditor: Editor;
	public _mermaidElementService = new MermaidElementService();
    private _textEditorService = new TextEditorService();
	
    async onload(): Promise<void> {
        await this.loadSettings();

		addTridentIcon();

		this.registerView(
			MermaidToolbarView.VIEW_TYPE,
			(leaf) => new MermaidToolbarView(leaf, this)
		);

		// keep track of last active editor
		// cannot simply call this.app.workspace.activeEditor ad hoc 
		// because Editor will be null when using Mermaid toolbar view
		this.app.workspace.on('active-leaf-change', (leaf) => {
            this.activeEditor = this.app.workspace.activeEditor?.editor ?? this.activeEditor;
        });

		this.addRibbonIcon(TRIDENT_ICON_NAME, "Open Mermaid Toolbar", () => {
			this.activateView();
		});

		this.addCommand({
			id: "open-toolbar",
			name: "Open Toolbar View",
			callback: () => {
				this.activateView();
			},
		});

		this.addSettingTab(new MermaidToolsSettingsTab(this.app, this));

		const bundledMermaid = await getBundledMermaid();
		installBundledMermaidGlobal(bundledMermaid);

		// Re-render ` ```mermaid ` blocks with bundled Mermaid 11.14+ so newer diagram types
		// (e.g. ishikawa-beta) work in Reading view. Must run after Obsidian's built-in mermaid
		// so we replace its output (very high sortOrder = last).
		this.registerMarkdownCodeBlockProcessor(
			"mermaid",
			async (source, el) => {
				el.empty();
				const wrap = el.createDiv({ cls: "mermaid-tools-bundled-mermaid" });
				try {
					const m = bundledMermaid;
					const { svg } = await m.render(makeMermaidRenderId(), source);
					wrap.innerHTML = svg;
				} catch (err) {
					const message = err instanceof Error ? err.message : String(err);
					wrap.createEl("pre", {
						cls: "mermaid-tools-mermaid-error",
						text: message,
					});
				}
			},
			Number.MAX_SAFE_INTEGER
		);
    }

    async onunload(): Promise<void> {
        this.app.workspace.detachLeavesOfType(MermaidToolbarView.VIEW_TYPE);
    }

    async loadSettings() {
		this.settings = Object.assign(
			{},
			MermaidPluginSettings.DefaultSettings(),
			await this.loadData()
		);

		this.addNewCategories();
	}

	addNewCategories() {
		if (!this.settings.elements.some(x => x.categoryId === "mindmap")) {
			this.settings.elements.push(...mindMapElements);
			console.log("[Mermaid Tools] added Mindmap elements");
		}
		if (!this.settings.elements.some(x => x.categoryId === "timeline")) {
			this.settings.elements.push(...timelineElements);
			console.log("[Mermaid Tools] added Timeline elements");
		}
		if (!this.settings.elements.some(x => x.categoryId === "quadrantChart")) {
			this.settings.elements.push(...quadrantElements);
			console.log("[Mermaid Tools] added QuadrantChart elements");
		}
		if (!this.settings.elements.some(x => x.categoryId === "c4Diagram")) {
			this.settings.elements.push(...c4DiagramElements);
			console.log("[Mermaid Tools] added C4 diagram elements");
		}

		// TODO
		if (!this.settings.elements.some(x => x.categoryId === "packet")) {
			this.settings.elements.push(...packetElements);
			console.log("[Mermaid Tools] added Packet elements");
		}
		if (!this.settings.elements.some(x => x.categoryId === "kanban")) {
			this.settings.elements.push(...kanbanElements);
			console.log("[Mermaid Tools] added Kanban elements");
		}
		if (!this.settings.elements.some(x => x.categoryId === "block")) {
			this.settings.elements.push(...blockDiagramElements);
			console.log("[Mermaid Tools] added Block elements");
		}
		if (!this.settings.elements.some(x => x.categoryId === "architecture")) {
			this.settings.elements.push(...architectureElements);
			console.log("[Mermaid Tools] added Architecture diagram elements");
		}
	}

	async saveSettings() {
		await this.saveData(this.settings);
		await this.activateView();
	}

	async activateView() {
		this.app.workspace.detachLeavesOfType(MermaidToolbarView.VIEW_TYPE);
	
		if (this.app.workspace === null)
			return;

		await this.app.workspace.getRightLeaf(false)?.setViewState({
			type: MermaidToolbarView.VIEW_TYPE,
			active: true,
		});
	
		this.app.workspace.revealLeaf(
			this.app.workspace.getLeavesOfType(MermaidToolbarView.VIEW_TYPE)[0]
		);
	}

	public insertTextAtCursor(text: string) {
		this._textEditorService.insertTextAtCursor(this.activeEditor, text);
	}
}