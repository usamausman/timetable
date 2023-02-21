<script>
	import '../global.css';
	import { base } from '$app/paths';
</script>

<svelte:head>
	<link rel="apple-touch-icon" sizes="180x180" href="{base}/icon/apple-touch-icon.png" />
	<link rel="icon" type="image/png" sizes="32x32" href="{base}/icon/favicon-32x32.png" />
	<link rel="icon" type="image/png" sizes="16x16" href="{base}/icon/favicon-16x16.png" />
	<link rel="manifest" href="{base}/site.webmanifest" />
	<link rel="mask-icon" href="{base}/icon/safari-pinned-tab.svg" color="#222222" />
	<link rel="shortcut icon" href="{base}/favicon.ico" />
	<meta name="msapplication-TileColor" content="#b91d47" />
	<meta name="msapplication-config" content="{base}/icon/browserconfig.xml" />
	<meta name="viewport" content="width=device-width,initial-scale=1" />
</svelte:head>

<slot />
