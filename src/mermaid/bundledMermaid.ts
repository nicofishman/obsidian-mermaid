/**
 * Do **not** import `mermaid/dist/mermaid.js` into the esbuild bundle: that file ends with
 * `globalThis.mermaid = globalThis.__esbuild_esm_mermaid_nm["mermaid"].default` while the
 * namespace object is only assigned to a *local* `var __esbuild_esm_mermaid_nm`. When
 * bundled, that `var` is no longer on `globalThis`, so the last line throws
 * "Cannot read properties of undefined (reading 'mermaid')".
 *
 * Use the package entry (`mermaid.core.mjs`) and rely on esbuild to bundle dynamic
 * `import()` diagram chunks into `main.js`.
 */
import mermaid from "mermaid";
import type { Mermaid } from "mermaid";

let initialized = false;
let globalInstalled = false;

function detectTheme(): "dark" | "default" {
	return document.body?.classList.contains("theme-dark") ? "dark" : "default";
}

/**
 * Lazily initializes Mermaid (v11.14.x) bundled with the plugin so diagrams like
 * `ishikawa-beta` render even when Obsidian's built-in Mermaid is older.
 */
export async function getBundledMermaid(): Promise<Mermaid> {
	if (!initialized) {
		mermaid.initialize({
			startOnLoad: false,
			securityLevel: "loose",
			theme: detectTheme(),
		});
		// Eagerly load all lazy diagram modules so detectors + parsers are ready in one bundle.
		try {
			await mermaid.registerExternalDiagrams([], { lazyLoad: false });
		} catch (e) {
			console.warn("[Mermaid Tools] registerExternalDiagrams preload failed", e);
		}
		initialized = true;
	}
	return mermaid;
}

/**
 * Obsidian renders fenced ` ```mermaid ` blocks with its own `mermaid.min.js` (see stack traces).
 * That build is older and does not register `ishikawa-beta`. The app often reads `window.mermaid`
 * after `loadMermaid()` — we expose our bundled API on `globalThis` / `window` and ignore
 * later assignments so Obsidian cannot replace it with the embedded min build.
 */
export function installBundledMermaidGlobal(api: Mermaid): void {
	if (globalInstalled) {
		return;
	}
	globalInstalled = true;
	const get = () => api;
	const targets: object[] = [globalThis];
	if (typeof window !== "undefined") {
		targets.push(window);
	}
	for (const t of targets) {
		try {
			Object.defineProperty(t, "mermaid", {
				configurable: true,
				enumerable: true,
				get: get,
				set() {
					/* keep bundled 11.x API */
				},
			});
		} catch (e) {
			console.warn("[Mermaid Tools] Could not install mermaid global override", e);
		}
	}
}

export function makeMermaidRenderId(): string {
	if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
		return `mermaid-tools-${crypto.randomUUID()}`;
	}
	return `mermaid-tools-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
