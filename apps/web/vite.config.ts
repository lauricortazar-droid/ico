import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';
import { AllowedEditorOrigins } from './plugins/horizons-runtime/editor-origins.js';
import horizonsRuntimePlugin from './plugins/horizons-runtime/vite-plugin-horizons-runtime.js';
import sessionJournalPlugin from './plugins/session-journal/vite-plugin-session-journal.js';
import editModeDevPlugin from './plugins/visual-editor/vite-plugin-edit-mode.js';
import inlineEditPlugin from './plugins/visual-editor/vite-plugin-react-inline-editor.js';
import devHeadersPlugin from './plugins/vite-plugin-dev-headers.js';
import horizonsLoggerPlugin from './plugins/vite-plugin-horizons-logger.js';
import iframeRouteRestorationPlugin from './plugins/vite-plugin-iframe-route-restoration.js';
import pocketbaseAuthPlugin from './plugins/vite-plugin-pocketbase-auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(__dirname, '../..');
const isDev = process.env.NODE_ENV !== 'production';

export default defineConfig({
	server: {
		port: 3000,
		host: '::',
		cors: { origin: AllowedEditorOrigins },
		headers: {
			'Cross-Origin-Embedder-Policy': 'credentialless',
		},
		allowedHosts: ['.app-preview.com', '.app-preview.io'],
		fs: {
			strict: true,
			allow: [__dirname, path.join(monorepoRoot, 'node_modules')],
		},
	},
	preview: {
		port: 3000,
		host: '::',
		allowedHosts: ['.app-preview.com', '.app-preview.io'],
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	plugins: [
		horizonsLoggerPlugin(),
		...(isDev
			? [
				inlineEditPlugin(),
				editModeDevPlugin(),
				iframeRouteRestorationPlugin(),
				pocketbaseAuthPlugin(),
				sessionJournalPlugin(),
			]
			: []),
		horizonsRuntimePlugin(),
		devHeadersPlugin(),
		reactRouter(),
	],
});
