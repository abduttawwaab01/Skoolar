import { initWasm } from '@resvg/resvg-wasm';

let initPromise: Promise<void> | null = null;

export function ensureResvgInit(): Promise<void> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      if (typeof process !== 'undefined' && process.versions?.node) {
        const path = await import('node:path');
        const fs = await import('node:fs');
        const wasmPath = path.resolve(process.cwd(), 'node_modules', '@resvg', 'resvg-wasm', 'index_bg.wasm');
        const wasmBuffer = fs.readFileSync(wasmPath);
        await initWasm(new Uint8Array(wasmBuffer));
        return;
      }
      const resp = await fetch('https://unpkg.com/@resvg/resvg-wasm@2.6.2/index_bg.wasm');
      if (!resp.ok) throw new Error(`Failed to fetch WASM: ${resp.status}`);
      await initWasm(resp);
    } catch (err) {
      initPromise = null;
      throw err;
    }
  })();

  return initPromise;
}
