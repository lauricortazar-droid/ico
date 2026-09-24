const ALLOWED_PARENT_ORIGINS = [
	"https://horizons.hostinger.com",
	"https://horizons.hostinger.dev",
	"https://horizons-frontend-local.hostinger.dev",
];

/**
 * Keeps the builder's page selector in sync with the preview, and applies the
 * navigation the builder asks for.
 *
 * The builder owns the preview route here: it navigates by pointing the iframe at
 * the target URL, so every route arrives as its own server-rendered document.
 * Nothing in this file may rewrite `location` on its own — a URL that disagrees
 * with the HTML the server rendered makes React hydrate the wrong route, which
 * fails hydration and snaps the preview back to the previous page.
 */
// Check to see if the page is in an iframe
if (window.self !== window.top) {
	const getCurrentRoute = () => location.pathname + location.search + location.hash;

	const reportRoute = () => {
		try {
			window.parent.postMessage({message: 'route-changed', route: getCurrentRoute()}, '*');
		} catch {}
	};

	let pendingRoute: string | null = null;

	const applyRoute = (route: string) => {
		try {
			history.replaceState(null, '', route);
			window.dispatchEvent(new PopStateEvent('popstate', { state: history.state }));
		} catch {}
	};

	/**
	 * Navigates within the hydrated router rather than reloading, so the messages
	 * the builder sends straight after (an edit-mode draft, for one) still reach a
	 * live listener. Changing `location` while React hydrates is the mismatch
	 * described above, so this waits for `load` — a best effort rather than a
	 * guarantee, since `load` waits for subresources and not for React to commit,
	 * and framework mode hydrates inside a `startTransition`. Only the route asked
	 * for last is applied; replaying the earlier ones would render every route on
	 * the way to it.
	 */
	const navigateTo = (route: string) => {
		if (document.readyState === 'complete') {
			applyRoute(route);
			return;
		}

		const isFirstPending = pendingRoute === null;
		pendingRoute = route;

		if (!isFirstPending) return;

		window.addEventListener('load', () => {
			const queued = pendingRoute;
			pendingRoute = null;

			if (queued) applyRoute(queued);
		}, { once: true });
	};

	const originalPushState = history.pushState;
	history.pushState = function(...args) {
		originalPushState.apply(this, args);
		reportRoute();
	};

	const originalReplaceState = history.replaceState;
	history.replaceState = function(...args) {
		originalReplaceState.apply(this, args);
		reportRoute();
	};

	const getParentOrigin = () => {
		if (
			window.location.ancestorOrigins &&
			window.location.ancestorOrigins.length > 0
		) {
			return window.location.ancestorOrigins[0];
		}

		if (document.referrer) {
			try {
				return new URL(document.referrer).origin;
			} catch (e) {
				console.warn("Invalid referrer URL:", document.referrer);
			}
		}

		return null;
	};

	window.addEventListener('popstate', reportRoute);
	window.addEventListener('hashchange', reportRoute);
	window.addEventListener("message", function (event) {
		const parentOrigin = getParentOrigin();
		if (!parentOrigin || !ALLOWED_PARENT_ORIGINS.includes(parentOrigin)) return;

		if (event.data?.type === "redirect-home" && getCurrentRoute() !== '/') {
			navigateTo('/');
		}

		if (event.data?.type === "navigate-to-route" && typeof event.data.path === "string") {
			const target = event.data.path.startsWith('/') ? event.data.path : '/' + event.data.path;
			if (getCurrentRoute() !== target) {
				navigateTo(target);
			}
		}
	});
}
