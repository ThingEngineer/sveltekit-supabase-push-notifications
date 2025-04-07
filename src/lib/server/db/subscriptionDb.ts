import { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY } from '$env/static/private';
import { supabase } from './index';
import webpush, { type PushSubscription } from 'web-push';

// Initialize web-push with VAPID keys
initWebPush();

function initWebPush() {
	webpush.setVapidDetails('mailto:webpush@example.com', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

async function sendNotification(subscription: PushSubscription, payload: string) {
	try {
		const res = await webpush.sendNotification(subscription, payload);
		return {
			ok: res.statusCode === 201,
			status: res.statusCode,
			body: res.body
		};
	} catch (err) {
		const msg = `Could not send notification: ${err}`;
		console.error(msg);
		return {
			ok: false,
			status: err.statusCode,
			body: msg
		};
	}
}

export async function addUserDevice(username: string, subscription: PushSubscription) {
	// Make sure the user exists
	await supabase.from('users').upsert({ username }).select();
	
	// Check if subscription already exists
	const { data } = await supabase
		.from('user_devices')
		.select('device_id')
		.eq('username', username)
		.filter('subscription->endpoint', 'eq', subscription.endpoint)
		.single();
	
	// If subscription doesn't exist, add it
	if (!data) {
		await supabase
			.from('user_devices')
			.insert({
				username,
				subscription
			});
	}
}

export async function addUserToChannel(username: string, channelId: string) {
	// Make sure the channel exists
	await supabase.from('notif_channels').upsert({ channel_id: channelId }).select();
	
	// Add user to channel if not already subscribed
	await supabase
		.from('notif_channel_users')
		.upsert({
			username,
			channel_id: channelId
		})
		.select();
}

export async function notifUser(username: string, payload: string) {
	// Call the Supabase Edge Function to send the notification
	const { data, error } = await supabase.functions.invoke('send-notification', {
		body: { username, payload }
	});
	
	if (error) {
		console.error('Error calling send-notification function:', error);
		throw error;
	}
	
	return data;
}

export async function notifChannel(channelId: string, payload: string) {
	// Call the Supabase Edge Function to send the notification
	const { data, error } = await supabase.functions.invoke('send-notification', {
		body: { channelId, payload }
	});
	
	if (error) {
		console.error('Error calling send-notification function:', error);
		throw error;
	}
	
	return data;
}
