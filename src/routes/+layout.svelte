<script lang="ts">
	import { page } from '$app/stores';
	import logoKreolTech from '$lib/assets/logo-kreol-tech.png';

	const siteName = 'CV Motion';
	const ogImagePath = '/og-cv-motion.svg';
	let { children } = $props();
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
	<link
		href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
		rel="stylesheet"
	/>
	<link rel="icon" href={logoKreolTech} type="image/png" />
	<link rel="apple-touch-icon" href={logoKreolTech} />
	<link rel="canonical" href={$page.url.origin + $page.url.pathname} />
	<meta property="og:site_name" content={siteName} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={$page.url.origin + $page.url.pathname} />
	<meta property="og:image" content={$page.url.origin + ogImagePath} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" content={$page.url.origin + ogImagePath} />
</svelte:head>

{@render children()}

<style>
	:global(:root) {
		--brand-ink: #0b1220;
		--brand-ink-soft: #162132;
		--brand-ink-muted: #2c3a4b;
		--brand-surface: #ffffff;
		--brand-surface-soft: #fff7f2;
		--brand-surface-strong: #ffece1;
		--brand-border: #f0e3d9;
		--brand-border-strong: #e6cdbd;
		--brand-muted: #6b778a;
		--brand-accent: #ff6b35;
		--brand-accent-strong: #e84c1b;
		--brand-accent-soft: #ffe1d6;
		--brand-gold: #f4b93d;
		--brand-gold-soft: #ffe6a8;
		--shadow-soft: 0 18px 40px rgba(21, 24, 36, 0.12);
		--shadow-strong: 0 32px 90px rgba(21, 24, 36, 0.25);
		--radius-xl: 32px;
		--radius-lg: 24px;
		--radius-md: 18px;
		--radius-sm: 12px;
	}

	:global(body) {
		font-family: 'Space Grotesk', 'Segoe UI', sans-serif;
		background:
			radial-gradient(950px 520px at 12% -8%, rgba(255, 107, 53, 0.22), transparent 60%),
			radial-gradient(860px 520px at 88% 6%, rgba(16, 185, 129, 0.18), transparent 58%),
			radial-gradient(820px 560px at 50% 120%, rgba(59, 130, 246, 0.12), transparent 65%),
			#fff7f2;
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
