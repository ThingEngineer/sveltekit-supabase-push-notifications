import type { PageServerLoad } from './$types';

export const load = (({ locals }) => {
	const { username } = locals;

	return {
		username
	};
}) satisfies PageServerLoad;
