/// <reference lib="webworker" />

// This allows TypeScript to know that this is a service worker
declare const self: ServiceWorkerGlobalScope;

// Basic fetch event listener to make the service worker valid
self.addEventListener('fetch', () => {
	return;
});

// Listen for push events
self.addEventListener('push', (event) => {
	const payload = event.data?.text() ?? 'New notification';
	
	event.waitUntil(
		self.registration.showNotification('SvelteKit Push Notification', {
			body: payload,
			icon: '/icons/icon-192.png',
			badge: '/icons/icon-192.png'
		})
	);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
	event.notification.close();
	
	event.waitUntil(
		self.clients.matchAll({ type: 'window', includeUncontrolled: true })
			.then((clientList) => {
				// If a window client is already open, focus it
				for (const client of clientList) {
					if (client.url && 'focus' in client) {
						return client.focus();
					}
				}
				// Otherwise open a new window
				if (self.clients.openWindow) {
					return self.clients.openWindow('/');
				}
			})
	);
});
