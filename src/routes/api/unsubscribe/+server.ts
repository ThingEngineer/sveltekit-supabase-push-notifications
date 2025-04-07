import { error, json, type RequestHandler } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';

export const POST = (async ({ request }) => {
	// Using service role key to bypass RLS policies
	const supabase = createClient(
		env.PUBLIC_SUPABASE_URL || '',
		env.SUPABASE_SERVICE_ROLE_KEY || ''
	);
	
	const data = await request.json();
	
	if (!data.endpoint) {
		throw error(400, 'No endpoint provided');
	}
	
	try {
		 // Instead of using JSON path filtering which is causing issues,
		// we'll retrieve all subscriptions and filter on the client side
		const { data: allDevices, error: selectError } = await supabase
			.from('user_devices')
			.select('device_id, subscription');
		
		if (selectError) {
			console.error('Error retrieving subscriptions:', selectError);
			throw error(500, 'Failed to retrieve subscriptions');
		}
		
		// Find devices with matching endpoint
		const matchingDevices = allDevices?.filter(device => {
			try {
				const subscription = device.subscription;
				return subscription && 
				       subscription.endpoint && 
				       subscription.endpoint === data.endpoint;
			} catch (e) {
				console.error('Error parsing device subscription:', e);
				return false;
			}
		}) || [];
		
		// If we found matching devices, delete them
		if (matchingDevices.length > 0) {
			const deviceIds = matchingDevices.map(device => device.device_id);
			
			const { error: deleteError } = await supabase
				.from('user_devices')
				.delete()
				.in('device_id', deviceIds);
			
			if (deleteError) {
				console.error('Error deleting subscription:', deleteError);
				throw error(500, 'Failed to delete subscription');
			}
			
			console.log(`Deleted ${deviceIds.length} subscriptions`);
		} else {
			console.log('No matching subscriptions found for endpoint:', data.endpoint);
		}
		
		return json({ success: true });
	} catch (e) {
		console.error('Error in unsubscribe handler:', e);
		throw error(500, 'Server error');
	}
}) satisfies RequestHandler;