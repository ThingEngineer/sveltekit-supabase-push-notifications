import { env } from '$env/dynamic/private';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET = (() => {
	return json({ publicKey: env.VAPID_PUBLIC_KEY });
}) satisfies RequestHandler;