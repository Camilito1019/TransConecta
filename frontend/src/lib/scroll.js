/**
 * Hace scroll al inicio del contenedor principal del layout.
 * En esta app el scroll vive en `main.content` (no en window).
 */
export function scrollToTop(options = {}) {
	if (typeof document === 'undefined') return;

	const behavior = options.behavior ?? 'smooth';
	const top = options.top ?? 0;

	// Layout principal: <main class="content">
	const main = document.querySelector('main.content');
	if (main && typeof main.scrollTo === 'function') {
		main.scrollTo({ top, behavior });
		return;
	}

	// Fallback (por si cambia el layout)
	const anyScrollable = document.querySelector('.content');
	if (anyScrollable && typeof anyScrollable.scrollTo === 'function') {
		anyScrollable.scrollTo({ top, behavior });
		return;
	}

	if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
		window.scrollTo({ top, behavior });
	}
}
