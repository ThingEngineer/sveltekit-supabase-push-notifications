create table "public"."notif_channel_users" (
    "id" uuid not null default gen_random_uuid(),
    "username" text,
    "channel_id" text,
    "created_at" timestamp with time zone default now()
);


alter table "public"."notif_channel_users" enable row level security;

create table "public"."notif_channels" (
    "channel_id" text not null,
    "created_at" timestamp with time zone default now()
);


alter table "public"."notif_channels" enable row level security;

create table "public"."notif_log" (
    "id" uuid not null default gen_random_uuid(),
    "device_id" uuid,
    "payload" text,
    "http_status_response" integer,
    "success" boolean default false,
    "error_message" text,
    "sent_at" timestamp with time zone default now()
);


alter table "public"."notif_log" enable row level security;

create table "public"."user_devices" (
    "device_id" uuid not null default gen_random_uuid(),
    "username" text,
    "subscription" jsonb not null,
    "created_at" timestamp with time zone default now()
);


alter table "public"."user_devices" enable row level security;

create table "public"."users" (
    "id" uuid not null default gen_random_uuid(),
    "username" text not null,
    "created_at" timestamp with time zone default now()
);


alter table "public"."users" enable row level security;

CREATE UNIQUE INDEX notif_channel_users_pkey ON public.notif_channel_users USING btree (id);

CREATE UNIQUE INDEX notif_channel_users_username_channel_id_key ON public.notif_channel_users USING btree (username, channel_id);

CREATE UNIQUE INDEX notif_channels_pkey ON public.notif_channels USING btree (channel_id);

CREATE UNIQUE INDEX notif_log_pkey ON public.notif_log USING btree (id);

CREATE UNIQUE INDEX user_devices_pkey ON public.user_devices USING btree (device_id);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);

alter table "public"."notif_channel_users" add constraint "notif_channel_users_pkey" PRIMARY KEY using index "notif_channel_users_pkey";

alter table "public"."notif_channels" add constraint "notif_channels_pkey" PRIMARY KEY using index "notif_channels_pkey";

alter table "public"."notif_log" add constraint "notif_log_pkey" PRIMARY KEY using index "notif_log_pkey";

alter table "public"."user_devices" add constraint "user_devices_pkey" PRIMARY KEY using index "user_devices_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."notif_channel_users" add constraint "notif_channel_users_channel_id_fkey" FOREIGN KEY (channel_id) REFERENCES notif_channels(channel_id) ON DELETE CASCADE not valid;

alter table "public"."notif_channel_users" validate constraint "notif_channel_users_channel_id_fkey";

alter table "public"."notif_channel_users" add constraint "notif_channel_users_username_channel_id_key" UNIQUE using index "notif_channel_users_username_channel_id_key";

alter table "public"."notif_channel_users" add constraint "notif_channel_users_username_fkey" FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE not valid;

alter table "public"."notif_channel_users" validate constraint "notif_channel_users_username_fkey";

alter table "public"."notif_log" add constraint "notif_log_device_id_fkey" FOREIGN KEY (device_id) REFERENCES user_devices(device_id) ON DELETE CASCADE not valid;

alter table "public"."notif_log" validate constraint "notif_log_device_id_fkey";

alter table "public"."user_devices" add constraint "user_devices_username_fkey" FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE not valid;

alter table "public"."user_devices" validate constraint "user_devices_username_fkey";

alter table "public"."users" add constraint "users_username_key" UNIQUE using index "users_username_key";

grant delete on table "public"."notif_channel_users" to "anon";

grant insert on table "public"."notif_channel_users" to "anon";

grant references on table "public"."notif_channel_users" to "anon";

grant select on table "public"."notif_channel_users" to "anon";

grant trigger on table "public"."notif_channel_users" to "anon";

grant truncate on table "public"."notif_channel_users" to "anon";

grant update on table "public"."notif_channel_users" to "anon";

grant delete on table "public"."notif_channel_users" to "authenticated";

grant insert on table "public"."notif_channel_users" to "authenticated";

grant references on table "public"."notif_channel_users" to "authenticated";

grant select on table "public"."notif_channel_users" to "authenticated";

grant trigger on table "public"."notif_channel_users" to "authenticated";

grant truncate on table "public"."notif_channel_users" to "authenticated";

grant update on table "public"."notif_channel_users" to "authenticated";

grant delete on table "public"."notif_channel_users" to "service_role";

grant insert on table "public"."notif_channel_users" to "service_role";

grant references on table "public"."notif_channel_users" to "service_role";

grant select on table "public"."notif_channel_users" to "service_role";

grant trigger on table "public"."notif_channel_users" to "service_role";

grant truncate on table "public"."notif_channel_users" to "service_role";

grant update on table "public"."notif_channel_users" to "service_role";

grant delete on table "public"."notif_channels" to "anon";

grant insert on table "public"."notif_channels" to "anon";

grant references on table "public"."notif_channels" to "anon";

grant select on table "public"."notif_channels" to "anon";

grant trigger on table "public"."notif_channels" to "anon";

grant truncate on table "public"."notif_channels" to "anon";

grant update on table "public"."notif_channels" to "anon";

grant delete on table "public"."notif_channels" to "authenticated";

grant insert on table "public"."notif_channels" to "authenticated";

grant references on table "public"."notif_channels" to "authenticated";

grant select on table "public"."notif_channels" to "authenticated";

grant trigger on table "public"."notif_channels" to "authenticated";

grant truncate on table "public"."notif_channels" to "authenticated";

grant update on table "public"."notif_channels" to "authenticated";

grant delete on table "public"."notif_channels" to "service_role";

grant insert on table "public"."notif_channels" to "service_role";

grant references on table "public"."notif_channels" to "service_role";

grant select on table "public"."notif_channels" to "service_role";

grant trigger on table "public"."notif_channels" to "service_role";

grant truncate on table "public"."notif_channels" to "service_role";

grant update on table "public"."notif_channels" to "service_role";

grant delete on table "public"."notif_log" to "anon";

grant insert on table "public"."notif_log" to "anon";

grant references on table "public"."notif_log" to "anon";

grant select on table "public"."notif_log" to "anon";

grant trigger on table "public"."notif_log" to "anon";

grant truncate on table "public"."notif_log" to "anon";

grant update on table "public"."notif_log" to "anon";

grant delete on table "public"."notif_log" to "authenticated";

grant insert on table "public"."notif_log" to "authenticated";

grant references on table "public"."notif_log" to "authenticated";

grant select on table "public"."notif_log" to "authenticated";

grant trigger on table "public"."notif_log" to "authenticated";

grant truncate on table "public"."notif_log" to "authenticated";

grant update on table "public"."notif_log" to "authenticated";

grant delete on table "public"."notif_log" to "service_role";

grant insert on table "public"."notif_log" to "service_role";

grant references on table "public"."notif_log" to "service_role";

grant select on table "public"."notif_log" to "service_role";

grant trigger on table "public"."notif_log" to "service_role";

grant truncate on table "public"."notif_log" to "service_role";

grant update on table "public"."notif_log" to "service_role";

grant delete on table "public"."user_devices" to "anon";

grant insert on table "public"."user_devices" to "anon";

grant references on table "public"."user_devices" to "anon";

grant select on table "public"."user_devices" to "anon";

grant trigger on table "public"."user_devices" to "anon";

grant truncate on table "public"."user_devices" to "anon";

grant update on table "public"."user_devices" to "anon";

grant delete on table "public"."user_devices" to "authenticated";

grant insert on table "public"."user_devices" to "authenticated";

grant references on table "public"."user_devices" to "authenticated";

grant select on table "public"."user_devices" to "authenticated";

grant trigger on table "public"."user_devices" to "authenticated";

grant truncate on table "public"."user_devices" to "authenticated";

grant update on table "public"."user_devices" to "authenticated";

grant delete on table "public"."user_devices" to "service_role";

grant insert on table "public"."user_devices" to "service_role";

grant references on table "public"."user_devices" to "service_role";

grant select on table "public"."user_devices" to "service_role";

grant trigger on table "public"."user_devices" to "service_role";

grant truncate on table "public"."user_devices" to "service_role";

grant update on table "public"."user_devices" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";

create policy "channel_users_policy"
on "public"."notif_channel_users"
as permissive
for all
to public
using (((auth.uid())::text = username));


create policy "service_policy"
on "public"."notif_channel_users"
as permissive
for all
to public
using (((auth.jwt() ->> 'role'::text) = 'service_role'::text));


create policy "service_policy"
on "public"."notif_channels"
as permissive
for all
to public
using (((auth.jwt() ->> 'role'::text) = 'service_role'::text));


create policy "service_policy"
on "public"."notif_log"
as permissive
for all
to public
using (((auth.jwt() ->> 'role'::text) = 'service_role'::text));


create policy "devices_policy"
on "public"."user_devices"
as permissive
for all
to public
using (((auth.uid())::text = username));


create policy "service_policy"
on "public"."user_devices"
as permissive
for all
to public
using (((auth.jwt() ->> 'role'::text) = 'service_role'::text));


create policy "service_policy"
on "public"."users"
as permissive
for all
to public
using (((auth.jwt() ->> 'role'::text) = 'service_role'::text));


create policy "users_policy"
on "public"."users"
as permissive
for all
to public
using (((auth.uid())::text = username));



