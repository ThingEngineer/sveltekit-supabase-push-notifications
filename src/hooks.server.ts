import { getSession } from '$lib/server/sesstionStore';
import type { Handle } from '@sveltejs/kit';

export const handle = (async ({ event, resolve }) => {
	const { cookies } = event;
	const sid = cookies.get('sid');
	if (sid) {
		const session = getSession(sid);
		if (session) {
			event.locals.username = session.username;
		} else {
			// session not found in our store -> remove cookie
			cookies.delete('sid');
		}
	} else {
		// For our simple demo, we'll use a default user if no session exists
		event.locals.username = 'demo-user';
	}

	const response = await resolve(event);
	return response;
}) satisfies Handle;
