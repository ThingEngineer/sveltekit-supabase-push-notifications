import { error, json, type RequestHandler } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { env } from '$env/dynamic/private';

export const POST = (async ({ request }) => {
	// Using service role key to bypass RLS policies
	const supabase = createClient(
		PUBLIC_SUPABASE_URL || '',
		env.SUPABASE_SERVICE_ROLE_KEY || ''
	);
	
	// For a real application, you would get the user from auth
	// For this demo, we'll use a default username
	const username = 'demo-user';
	
	const data = await request.json();
	
	if (!data.message) {
		throw error(400, 'No message provided');
	}
	
	try {
		// Call the Supabase Edge Function to send the notification
		const { data: result, error: functionError } = await supabase.functions.invoke('send-notification', {
			body: {
				username,
				payload: data.message
			}
		});
		
		if (functionError) {
			console.error('Error calling send-notification function:', functionError);
			throw error(500, 'Failed to send notification');
		}
		
		return json(result);
	} catch (err) {
		console.error('Error sending notification:', err);
		throw error(500, 'Failed to send notification');
	}
}) satisfies RequestHandler;