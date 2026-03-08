<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
	<link
		href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700&family=Manrope:wght@400;500;600;700&display=swap"
		rel="stylesheet"
	/>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<style>
	:global(:root) {
		--brand-ink: #0b1220;
		--brand-ink-soft: #111a2e;
		--brand-ink-muted: #1f2937;
		--brand-surface: #ffffff;
		--brand-surface-soft: #f8fafc;
		--brand-surface-strong: #eef2ff;
		--brand-border: #e2e8f0;
		--brand-border-strong: #cbd5f5;
		--brand-muted: #5b6b80;
		--brand-accent: #2563eb;
		--brand-accent-strong: #1d4ed8;
		--brand-accent-soft: #dbeafe;
		--brand-gold: #d4af37;
		--brand-gold-soft: #f1d487;
		--shadow-soft: 0 18px 40px rgba(15, 23, 42, 0.12);
		--shadow-strong: 0 28px 80px rgba(15, 23, 42, 0.28);
		--radius-xl: 32px;
		--radius-lg: 24px;
		--radius-md: 18px;
		--radius-sm: 12px;
	}

	:global(body) {
		font-family: 'Manrope', 'Segoe UI', sans-serif;
		background:
			radial-gradient(1200px 600px at 15% -10%, rgba(37, 99, 235, 0.18), transparent 60%),
			radial-gradient(900px 520px at 90% 5%, rgba(14, 165, 233, 0.15), transparent 60%),
			radial-gradient(700px 420px at 40% 110%, rgba(15, 23, 42, 0.12), transparent 62%),
			#f6f8ff;
		color: var(--brand-ink);
		margin: 0;
		padding: 32px 24px 60px;
		min-height: 100vh;
	}

	:global(a) {
		color: inherit;
		text-decoration: none;
	}

	:global(h1),
	:global(h2),
	:global(h3) {
		font-family: 'Fraunces', 'Times New Roman', serif;
		letter-spacing: 0.01em;
	}

	@media (max-width: 720px) {
		:global(body) {
			padding: 24px 16px 48px;
		}
	}
</style>
