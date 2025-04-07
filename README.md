# SvelteKit Supabase Web Push Notifications Demo

A minimal implementation of web push notifications using SvelteKit, PWA, and Supabase. This project demonstrates how to create and manage web push notifications with a serverless backend.

## Features

- 🔔 Web Push Notifications
- 📱 Progressive Web App (PWA) support
- 🔐 Supabase for user subscriptions storage
- ⚡️ Supabase Edge Functions for notification delivery

## Implementation Notes

For simplicity, this demo uses a basic in-memory session management system instead of Supabase Auth. In a production application, you would want to implement proper authentication using Supabase Auth or another authentication system. The current implementation uses a default "demo-user" to demonstrate push notification functionality without the complexity of a full authentication system.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- [Supabase Account](https://app.supabase.com/) with a new project
- [Supabase CLI](https://supabase.com/docs/guides/cli) for deploying Edge Functions

## Setup Instructions

1. **Clone and Install Dependencies**

```bash
git clone https://github.com/thingenineer/sveltekit-supabase-push-notifications.git
cd sveltekit-supabase-push-notifications
npm install # or pnpm install
```

2. **Generate VAPID Keys**

```bash
npx web-push generate-vapid-keys
```

Save the generated keys for the next step.

3. **Set up Environment Variables**

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Fill in your Supabase URL, keys, and the VAPID keys from the previous step.

4. **Create Supabase Tables**

Run the migrations in the Supabase Dashboard SQL editor or using Supabase CLI:

```bash
supabase start # If running locally
supabase db push # To push migrations
```

5. **Deploy the Edge Function**

```bash
supabase functions deploy send-notification --project-ref your-project-ref
```

Make sure to set your VAPID keys as secrets in the Supabase dashboard:

```bash
supabase secrets set VAPID_PUBLIC_KEY=your_public_key VAPID_PRIVATE_KEY=your_private_key --project-ref your-project-ref
```

6. **Run the Development Server**

```bash
npm run dev # or pnpm dev
```

The application will be available at http://localhost:5173.

## Usage

1. Open the application in a browser that supports Push Notifications (Chrome, Firefox, Edge)
2. Click "Enable Notifications" to grant permission
3. Subscribe to push notifications
4. Test sending notifications using the form on the page

## Supabase Structure

- **Database Tables**:

  - `users`: Stores user information
  - `user_devices`: Stores push subscription information
  - `notif_channels`: Stores notification channels
  - `notif_channel_users`: Maps users to notification channels
  - `notif_log`: Logs notification delivery attempts

- **Edge Function**:
  - `send-notification`: Handles notification delivery using web-push

## Resources

- [Web Push API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Web Push Protocol](https://web.dev/articles/push-notifications-web-push-protocol)
- [SvelteKit Documentation](https://kit.svelte.dev/docs)
- [Supabase Documentation](https://supabase.com/docs/guides/getting-started/quickstarts/sveltekit)
