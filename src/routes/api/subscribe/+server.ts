import { error, json, type RequestHandler } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { env } from '$env/dynamic/private';

export const POST = (async ({ request, locals }) => {
	// Using service role key to bypass RLS policies
	const supabase = createClient(
		PUBLIC_SUPABASE_URL || '',
		env.SUPABASE_SERVICE_ROLE_KEY || ''
	);
	
	// For a real application, you would get the user from auth
	// For this demo, we'll use a default username
	const username = 'demo-user';
	
	const data = await request.json();
	
	if (!data.subscription) {
		throw error(400, 'No subscription provided');
	}
	
	try {
		// First, make sure the user exists - just select, don't try to create if exists
		const { data: existingUser } = await supabase
			.from('users')
			.select('username')
			.eq('username', username)
			.maybeSingle();
			
		// Only insert if the user doesn't exist
		if (!existingUser) {
			const { error: userError } = await supabase
				.from('users')
				.insert({ username });
			
			if (userError) {
				console.error('Error creating user:', userError);
				throw error(500, 'Failed to save user');
			}
		}
		
		// Convert subscription to proper JSON if needed
		let subscriptionObj;
		try {
			// If it's already a string, this will throw an error
			if (typeof data.subscription === 'string') {
				subscriptionObj = JSON.parse(data.subscription);
			} else {
				// If it's already an object, stringify then parse to ensure valid JSON
				subscriptionObj = JSON.parse(JSON.stringify(data.subscription));
			}
		} catch (e) {
			console.error('Error parsing subscription:', e);
			throw error(400, 'Invalid subscription format');
		}
		
		// Check if this subscription endpoint already exists
		const { data: existingDevice } = await supabase
			.from('user_devices')
			.select('device_id')
			.eq('username', username)
			.filter('subscription->endpoint', 'eq', subscriptionObj.endpoint)
			.maybeSingle();
		
		if (!existingDevice) {
			// Save the new subscription
			const { error: deviceError } = await supabase
				.from('user_devices')
				.insert({
					username,
					subscription: subscriptionObj
				});
			
			if (deviceError) {
				console.error('Error saving subscription:', deviceError);
				throw error(500, 'Failed to save subscription');
			}
		}
		
		// Add user to default notification channel
		// First check if channel exists
		const { data: existingChannel } = await supabase
			.from('notif_channels')
			.select('channel_id')
			.eq('channel_id', 'general')
			.maybeSingle();
			
		if (!existingChannel) {
			const { error: channelError } = await supabase
				.from('notif_channels')
				.insert({ channel_id: 'general' });
			
			if (channelError) {
				console.error('Error ensuring channel exists:', channelError);
			}
		}
		
		// Check if user is already in the channel
		const { data: existingUserChannel } = await supabase
			.from('notif_channel_users')
			.select('id')
			.eq('username', username)
			.eq('channel_id', 'general')
			.maybeSingle();
		
		if (!existingUserChannel) {
			const { error: userChannelError } = await supabase
				.from('notif_channel_users')
				.insert({
					username,
					channel_id: 'general'
				});
			
			if (userChannelError) {
				console.error('Error adding user to channel:', userChannelError);
			}
		}
		
		return json({ success: true });
	} catch (e) {
		console.error('Error in subscribe handler:', e);
		throw error(500, 'Server error');
	}
}) satisfies RequestHandler;