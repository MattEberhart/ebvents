-- Add Cloudflare image support to venues
alter table public.venues add column cf_image_id text;
