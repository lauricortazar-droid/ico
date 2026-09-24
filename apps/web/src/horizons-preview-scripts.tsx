import { useEffect } from 'react';
import { bannerAttrs } from 'virtual:horizons-banner';

/** Vite serves `\0`-resolved virtual ids at `/@id/__x00__<id>` in dev. */
const viteVirtualSrc = (id: string) => `/@id/__x00__${id}`;

export function HorizonsPreviewScripts() {
	useEffect(() => {
		if (!import.meta.env.DEV) {
			void import('virtual:horizons-runtime');
		}
	}, []);

	return (
		<>
			{import.meta.env.DEV ? (
				<>
					<script type="module" src={viteVirtualSrc('virtual:horizons-runtime')} />
					<script type="module" src={viteVirtualSrc('virtual:horizons-edit-mode')} />
					<script type="module" src={viteVirtualSrc('virtual:horizons-iframe-route-restoration')} />
					<script type="module" src={viteVirtualSrc('virtual:horizons-pocketbase-auth')} />
					<script type="module" src={viteVirtualSrc('virtual:session-journal-client')} />
				</>
			) : null}
			{bannerAttrs ? (
				<script
					src={bannerAttrs.src}
					{...{
						'template-redirect-url': bannerAttrs['template-redirect-url'],
						...(bannerAttrs['template-main-text'] && { 'template-main-text': bannerAttrs['template-main-text'] }),
						...(bannerAttrs['template-cta-text'] && { 'template-cta-text': bannerAttrs['template-cta-text'] }),
						...(bannerAttrs['template-theme'] && { 'template-theme': bannerAttrs['template-theme'] }),
					}}
				/>
			) : null}
		</>
	);
}
