<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	let notifPermGranted: boolean | null = null;
	let isSubscribed = false;
	let notificationMessage = 'Test notification';
	let showToast = false;
	let toastMessage = '';
	let sendingNotification = false;

	onMount(async () => {
		notifPermGranted = Notification.permission === 'granted';

		if (notifPermGranted) {
			isSubscribed = await checkSubscriptionStatus();

			if (!isSubscribed) {
				await subscribeUser();
			}
		}
	});

	function requestNotificationPermission() {
		Notification.requestPermission().then((permission) => {
			if (permission === 'granted') {
				notifPermGranted = true;
				subscribeUser();
			}
		});
	}

	function showSuccessToast(message: string) {
		toastMessage = message;
		showToast = true;
		setTimeout(() => {
			showToast = false;
		}, 3000);
	}

	async function sendSubscriptionToServer(subscription: PushSubscription) {
		try {
			// Convert the subscription to a plain object to ensure proper serialization
			const subscriptionObj = JSON.parse(JSON.stringify(subscription));

			const res = await fetch('/api/subscribe', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ subscription: subscriptionObj })
			});

			if (!res.ok)
				throw new Error(`Error saving subscription on server: ${res.statusText} (${res.status})`);
		} catch (error) {
			console.error('Error saving subscription on server:', error);
			unsubscribe();
		}
	}

	async function checkSubscriptionStatus() {
		if ('serviceWorker' in navigator) {
			const registration = await navigator.serviceWorker.ready;
			const subscription = await registration.pushManager.getSubscription();
			console.log('Subscription:', subscription);
			const exists = subscription !== null;
			if (exists) {
				// just to make sure the subscription is saved on the server
				sendSubscriptionToServer(subscription);
			}
			return exists;
		}
		return false;
	}

	async function subscribeUser() {
		if ('serviceWorker' in navigator) {
			try {
				const res = await fetch('/api/vapid-public-key');
				const { publicKey } = await res.json();

				const registration = await navigator.serviceWorker.ready;
				const subscription = await registration.pushManager.subscribe({
					userVisibleOnly: true,
					applicationServerKey: publicKey
				});
				isSubscribed = true;
				console.log('Subscription:', JSON.stringify(subscription));
				sendSubscriptionToServer(subscription);
			} catch (err) {
				console.error('Error subscribing:', err);
			}
		}
	}

	async function unsubscribe() {
		if ('serviceWorker' in navigator) {
			const registration = await navigator.serviceWorker.ready;
			const subscription = await registration.pushManager.getSubscription();
			if (subscription) {
				await subscription.unsubscribe();
				isSubscribed = false;

				try {
					const endpoint = subscription.endpoint;
					await fetch('/api/unsubscribe', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({ endpoint })
					});
				} catch (error) {
					console.error('Error removing subscription from server:', error);
				}
			}
		}
	}

	async function sendTestNotification() {
		try {
			sendingNotification = true;
			const res = await fetch('/api/send-notification', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ message: notificationMessage })
			});

			if (!res.ok) {
				throw new Error(`Error sending test notification: ${res.statusText}`);
			}

			const data = await res.json();
			console.log('Test notification sent:', data);
			showSuccessToast('Notification sent successfully!');
		} catch (error) {
			console.error('Error sending test notification:', error);
			toastMessage = 'Failed to send notification';
			showToast = true;
		} finally {
			sendingNotification = false;
		}
	}
</script>

<svelte:head>
	<title>Push Notifications Demo</title>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<main class="app">
	<div class="header">
		<div class="container">
			<h1>SvelteKit + Supabase</h1>
			<p class="tagline">Push Notifications Demo</p>
		</div>
	</div>

	<section class="container">
		<div class="card">
			<div class="card-header">
				<div class="icon-container">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						width="24"
						height="24"
					>
						<path
							d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
						></path>
					</svg>
				</div>
				<div>
					<h2>Push Notifications</h2>
					<p class="subtitle">Receive real-time updates on your device</p>
				</div>
			</div>

			<div class="card-content">
				{#if notifPermGranted === null}
					<div class="status-indicator loading">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="loader"
						>
							<circle cx="12" cy="12" r="10"></circle>
							<path d="M12 6v6l4 2"></path>
						</svg>
						<p>Checking notification permissions...</p>
					</div>
				{:else if notifPermGranted === false}
					<div class="permission-card" transition:fly={{ y: 20, duration: 300 }}>
						<div class="permission-icon">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
								<path
									d="M18 16v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.68-1.5-1.51-1.5S10.5 3.17 10.5 4v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-5 0h-2v-2h2v2zm0-4h-2V8h2v4z"
								></path>
								<path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2z"></path>
							</svg>
						</div>
						<div class="permission-content">
							<h3>Enable Notifications</h3>
							<p>Allow this app to send you push notifications for important updates</p>
							<button class="primary-btn" on:click={requestNotificationPermission}>
								Enable Notifications
							</button>
						</div>
					</div>
				{:else}
					<div class="status-card" transition:fade>
						<div class="status-indicator {isSubscribed ? 'active' : 'inactive'}">
							<span class="status-dot"></span>
							<span>Status: {isSubscribed ? 'Subscribed' : 'Not Subscribed'}</span>
						</div>

						{#if isSubscribed}
							<div class="notification-panel" transition:fade={{ duration: 200 }}>
								<div class="input-group">
									<label for="notification-message">Notification Message</label>
									<div class="message-input">
										<input
											id="notification-message"
											type="text"
											bind:value={notificationMessage}
											placeholder="Enter your notification message"
										/>
										<button
											class="send-btn {sendingNotification ? 'loading' : ''}"
											on:click={sendTestNotification}
											disabled={sendingNotification}
										>
											{#if sendingNotification}
												<svg
													class="spin"
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													stroke-width="2"
													stroke-linecap="round"
													stroke-linejoin="round"
													width="18"
													height="18"
												>
													<circle cx="12" cy="12" r="10"></circle>
													<path d="M12 6v6l4 2"></path>
												</svg>
											{:else}
												Send
											{/if}
										</button>
									</div>
								</div>

								<button class="secondary-btn danger" on:click={unsubscribe}> Unsubscribe </button>
							</div>
						{:else}
							<button class="primary-btn" on:click={subscribeUser}>Subscribe Now</button>
						{/if}
					</div>
				{/if}
			</div>
		</div>

		<div class="info-section">
			<div class="info-card">
				<div class="info-icon">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						width="24"
						height="24"
					>
						<path
							d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
						></path>
					</svg>
				</div>
				<h3>How It Works</h3>
				<p>
					This demo uses the Web Push API with a Supabase backend to deliver real-time notifications
					to your device, even when the browser is closed.
				</p>
			</div>

			<div class="info-card">
				<div class="info-icon">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						width="24"
						height="24"
					>
						<path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"></path>
					</svg>
				</div>
				<h3>Browser Support</h3>
				<p>
					Push notifications are supported in Chrome, Firefox, Edge, and other modern browsers that
					implement the Web Push standard.
				</p>
			</div>
		</div>
	</section>
</main>

{#if showToast}
	<div class="toast" transition:fly={{ y: 50, duration: 200 }}>
		{toastMessage}
	</div>
{/if}

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		background-color: #f8fafc;
		color: #334155;
	}

	.app {
		font-family:
			'Inter',
			system-ui,
			-apple-system,
			sans-serif;
		min-height: 100vh;
	}

	.header {
		background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
		color: white;
		padding: 3rem 0 4rem;
		clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);
		margin-bottom: 2rem;
	}

	h1 {
		margin: 0;
		font-size: 2.5rem;
		font-weight: 700;
	}

	.tagline {
		font-size: 1.25rem;
		margin: 0.5rem 0 0;
		opacity: 0.9;
	}

	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 0 1.5rem;
	}

	.card {
		background-color: white;
		border-radius: 12px;
		box-shadow:
			0 4px 6px rgba(0, 0, 0, 0.05),
			0 1px 3px rgba(0, 0, 0, 0.1);
		overflow: hidden;
		margin-top: -2rem;
	}

	.card-header {
		padding: 1.5rem;
		display: flex;
		align-items: center;
		border-bottom: 1px solid #f1f5f9;
	}

	.card-content {
		padding: 1.5rem;
	}

	.icon-container {
		height: 48px;
		width: 48px;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #4f46e5;
		color: white;
		margin-right: 1rem;
	}

	h2 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: #1e293b;
	}

	.subtitle {
		margin: 0.25rem 0 0;
		color: #64748b;
		font-size: 0.875rem;
	}

	.primary-btn {
		background-color: #4f46e5;
		color: white;
		border: none;
		border-radius: 8px;
		padding: 0.75rem 1.5rem;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		display: inline-flex;
		align-items: center;
	}

	.primary-btn:hover {
		background-color: #4338ca;
		transform: translateY(-1px);
	}

	.primary-btn:active {
		transform: translateY(0);
	}

	.secondary-btn {
		background-color: #f1f5f9;
		color: #334155;
		border: none;
		border-radius: 8px;
		padding: 0.75rem 1.5rem;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.secondary-btn:hover {
		background-color: #e2e8f0;
	}

	.secondary-btn.danger {
		background-color: #fee2e2;
		color: #ef4444;
	}

	.secondary-btn.danger:hover {
		background-color: #fecaca;
	}

	.status-indicator {
		display: flex;
		align-items: center;
		font-size: 0.875rem;
		margin-bottom: 1.5rem;
	}

	.status-dot {
		height: 10px;
		width: 10px;
		border-radius: 50%;
		margin-right: 0.5rem;
		display: inline-block;
	}

	.status-indicator.active .status-dot {
		background-color: #10b981;
		box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
	}

	.status-indicator.inactive .status-dot {
		background-color: #94a3b8;
		box-shadow: 0 0 0 3px rgba(148, 163, 184, 0.2);
	}

	.status-indicator.loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		color: #64748b;
		padding: 2rem 0;
	}

	.loader {
		width: 40px;
		height: 40px;
		margin-bottom: 1rem;
		animation: spin 1.5s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.notification-panel {
		margin-top: 1.5rem;
	}

	.input-group {
		margin-bottom: 1.5rem;
	}

	label {
		display: block;
		font-size: 0.875rem;
		font-weight: 500;
		margin-bottom: 0.5rem;
		color: #475569;
	}

	.message-input {
		display: flex;
	}

	input {
		flex: 1;
		padding: 0.75rem 1rem;
		border: 1px solid #e2e8f0;
		border-radius: 8px 0 0 8px;
		font-size: 1rem;
		outline: none;
		transition: border-color 0.2s;
	}

	input:focus {
		border-color: #a5b4fc;
		box-shadow: 0 0 0 3px rgba(165, 180, 252, 0.2);
	}

	.send-btn {
		background-color: #4f46e5;
		color: white;
		border: none;
		border-radius: 0 8px 8px 0;
		padding: 0 1.25rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		min-width: 80px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.send-btn:hover {
		background-color: #4338ca;
	}

	.send-btn.loading {
		cursor: not-allowed;
		opacity: 0.8;
	}

	.spin {
		animation: spin 1.5s linear infinite;
	}

	.permission-card {
		display: flex;
		background-color: #eff6ff;
		border-radius: 8px;
		padding: 1.5rem;
	}

	.permission-icon {
		height: 48px;
		width: 48px;
		color: #3b82f6;
		margin-right: 1rem;
	}

	.permission-content h3 {
		margin: 0 0 0.5rem;
		color: #1e3a8a;
		font-weight: 600;
	}

	.permission-content p {
		margin: 0 0 1rem;
		font-size: 0.875rem;
		color: #1e40af;
	}

	.info-section {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem;
		margin: 2rem 0;
	}

	.info-card {
		background-color: white;
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
	}

	.info-icon {
		height: 40px;
		width: 40px;
		background-color: #f0f9ff;
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #0284c7;
		margin-bottom: 1rem;
	}

	.info-card h3 {
		margin: 0 0 0.5rem;
		font-weight: 600;
		font-size: 1rem;
		color: #0f172a;
	}

	.info-card p {
		margin: 0;
		font-size: 0.875rem;
		color: #64748b;
		line-height: 1.5;
	}

	.toast {
		position: fixed;
		bottom: 2rem;
		left: 50%;
		transform: translateX(-50%);
		background-color: #1e293b;
		color: white;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		font-size: 0.875rem;
		z-index: 100;
	}

	/* Responsive styles */
	@media (max-width: 768px) {
		.info-section {
			grid-template-columns: 1fr;
		}

		.header {
			padding: 2rem 0 3rem;
		}

		h1 {
			font-size: 2rem;
		}
	}
</style>
