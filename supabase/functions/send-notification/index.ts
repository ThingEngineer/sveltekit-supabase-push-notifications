import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import webpush from 'https://esm.sh/web-push@3.6.3';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') || '';
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Initialize web-push with VAPID keys
webpush.setVapidDetails(
  'mailto:webpush@example.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

serve(async (req) => {
  try {
    // Create a Supabase client with the service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
      },
    });

    // Parse the request body
    const { username, channelId, payload } = await req.json();

    if (!username && !channelId) {
      return new Response(
        JSON.stringify({ error: 'Either username or channelId must be provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!payload) {
      return new Response(
        JSON.stringify({ error: 'Payload is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let devices;
    
    // Get subscriptions based on whether we're notifying a user or a channel
    if (username) {
      const { data, error } = await supabase
        .from('user_devices')
        .select('device_id, subscription')
        .eq('username', username);

      if (error) throw error;
      devices = data;
    } else if (channelId) {
      const { data, error } = await supabase
        .from('user_devices')
        .select('ud.device_id, ud.subscription')
        .from('user_devices as ud')
        .join('notif_channel_users as ncu', 'ud.username = ncu.username')
        .eq('ncu.channel_id', channelId);

      if (error) throw error;
      devices = data;
    }

    if (!devices || devices.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No devices found' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Send notifications to all devices
    const results = await Promise.all(
      devices.map(async (device) => {
        try {
          const subscription = JSON.parse(device.subscription);
          const result = await webpush.sendNotification(subscription, payload);
          
          // Log the notification
          await supabase.from('notif_log').insert({
            device_id: device.device_id,
            payload,
            http_status_response: result.statusCode,
            success: result.statusCode === 201,
            error_message: result.body || null
          });

          return {
            device_id: device.device_id,
            success: result.statusCode === 201
          };
        } catch (error) {
          // Handle expired subscriptions
          if (error.statusCode === 410) {
            // Delete the expired subscription
            await supabase
              .from('user_devices')
              .delete()
              .eq('device_id', device.device_id);
          }
          
          // Log the error
          await supabase.from('notif_log').insert({
            device_id: device.device_id,
            payload,
            http_status_response: error.statusCode,
            success: false,
            error_message: error.message
          });

          return {
            device_id: device.device_id,
            success: false,
            error: error.message
          };
        }
      })
    );

    return new Response(
      JSON.stringify({ 
        message: 'Notifications sent', 
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});