import type { Handle } from '@sveltejs/kit';

// Register the service worker
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('Service worker registered:', registration);
      })
      .catch((error) => {
        console.error('Service worker registration failed:', error);
      });
  });
}

export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);
  return response;
};