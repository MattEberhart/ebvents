# Ebvents - A Sporting Event Scheduler
Ebvents is a web app that allows users to view a dashboard of sporting events. The user can view all sporting event details, navigate to create and edit forms to alter events, and search or filter for sports on various fields. Key details are event name, sport type, date / time, description, and venue(s). As such, a user can also create venues and request additional sport creation. The dashboard allows user to toggle between card and table views.

Having just venue names felt lame so I made them their own entities. A user can create and edit venues, view details, and view a dashboard of venues similar to that of the events. These venues have additional details like address and capacity.

At this time, all users can view, edit, and delete other users' events and venues as this was my understanding of the spec. I'd like to have role based permissions in the future, but this would complicate the signup flow or ideally admins would have their own event management portal and regular users would have read only access to find their desired events.

The project was implemented in Next.js, hosted in vercel, and stores data in supabase. Users may sign in with email/password, email/OTP code, or Google OAuth all managed by supabase. Database interactions are serverside with Server Actions, not API routes.

Claude assisted in the making of this web app, many GPUs were harmed in the process. 

## Links
- https://ebvents.com
- 

## Architecture
The table details are captured in [Database Spec](docs/database.md) and the scripts to provision them are in /supabase/migrations. You will see multiple files here since as I find issues with the schemas, I write additional scripts to migrate / fix. For a production system I would take more time to review before doing any provisioning, but for a coding challenge POC with no users I like to get a good base and build from there.

All tables are public except the auth.users table and have RLS enabled, though the RLS is simply "Is user authenticated" since for now we are allowing users to edit / delete others' events and venues.

### Profiles Table
This represents the user and is separate from the auth.users. The columns are id (fk to auth.users), first name, last name, avatar image id, and created at.
Some Decisions I Made:
- Claude suggested full name column at first. I like splitting into first and last for UX puposes. "Hi Matt" is better than "Hi Matt Eberhart"
- Claude suggested we include the email in the profiles table. I did this once in a side project, but realized users need to have RLS access on other users' profile rows to fetch things like avatar image id or their name and this means exposing the email if it is a column in the table. That was a big migration in my app - rolling out ux to use auth.users email where appropriate then deprecating the columnn in profiles.
- I gave the avatar image id a lot of thought on two fronts:
  - Claude first suggested image url, which I am against because I thought it meant storing signed urls. In my side project I ruled against this as the urls wouldn't expire and could be shared. I went with server side signing based on RLS - can the user view this other user's avatar?
  - I raised this concern and told Claude to move to image id. It interpreted this as storing image ids, but using public delivery urls meaning the images remain public and we can just construct the url client side based on the image id. A simple formatting helper function. I hadn't heard of public delivery urls. I had only served signed image urls on private images (or blobs in a past job)
  - I decided leaving the images public was fine for this challenge since it was an extra, avatars are only visible to the user themself at this time in the ux, and we have no friend / follow. The pattern works well for venue images as well since all users can see all venue details. I was happy we still moved from storing url to just id, since storing the whole url over and over would be redundant when it can just be a helper function + client side config.

### Events Table
This represents an event. The columns are id, user id (fk to auth.users), sport_type_id (fk to sport_types), name, starts_at, duration_minutes, description, status (enum), created_at, updated_at.

Decisions:
- user id represents the event owner. This is not important per our requirements, but eventually if I want to enforce RLS on who can edit events, who can grant edit access to events, etc, we need to know who created the event.
- sport_type_id references sport types. The initial plan from Claude was to enforce sport type as an enum. For the challenge this would be fine, but it bothered me extensibility wise. Adding sports would mean a db change. As its own table, we can insert a new sports type on admin approval. If we used sport type in some future feature like say a Leagues table, the enum now needs to be maintained in multiple places. UX would need to track this enum as well.
- starts_at and duration_minutes was a big decision. At first we had starts_at and ends_at. The challenge just wanted a date and time which didn't necessarily include an end time, but I was thinking about how we would validate / check if multiple events were at the same venue on the same day. You would need to know when events ended and in the real world know how long it took to clean up and reset the venue. Ignoring cleanup time I figured we should know when an event ends. I chose duration because we can infer the end time on the UX side and updating an event time would then only take one write (to the start time) instead of editing start and end time.
- Status wasn't a requirement, but one of the fun features I thought of along the way was cancelling an event rather than deleting it. Status comes into play here. It is Active or Cancelled for now. The UX can infer Upcoming or Completed by Active status + event time + current time. A future status could be Draft so our users can draft events and come back to them later before publishing.

### Sport Types Table
As I explained above this is to track sport types. Rather than an enum maintained across many potential tables, we can maintain them here and add new ones on the fly. Columns are id, name, display_order, is_active, created_at.
Decisions:
- display_order is one I'm not sure about. The idea was to have a way to display popular sports in Event creation first. Soccer is number 1 for example and Esports are 16. Claude ranked them, don't come after me. I played Rocket League back in the day. Paginating on the display_order should be fairly trivial or since this table shouldn't get too large, UX can load them all into memory, order them, and do infinite scrolling / search on the client side.

### Venues Table
This table represents the venues. The columns are id, name, address, city, state, capacity, latitude, longitude, created_by (fk to auth.users), created_at, updated_at.

Again this was an extra for me. Per the challenge we just needed to show venues (plural) for the event. Claude initially just wanted to store these as an array in it's own column of Events. I immediately was thinking about how a venue is way more than the name and added these extra fields.
Decisions:
- created_by similar to Events, I want to know who created the venue for future access policy features.
- I haven't finished yet as I write this, but I believe latitude and longitude are for a future feature where we will verify the address with a Google Maps API and store coordinates for directions. 

### Event Venues Table
This is a table to track the many to many relationship between events and venues. Obviously a venue can be assigne to many events over many days. The reason venue id is not just a column in Events Table is because the challenge explicitly outlines an event can have multiple venues. I was surprised this didn't mean multiple dates as well, but maybe it could be like an AAU tournament on one day with multiple courts/sportsplexes. Columns are id, event_id (fk to events), and venue_id (fk to venues).

Given the above structures, to load the dashboard we take a subset or all of events depending on how we are paginating, join on event venues by event id, join on venues by the event id from event venues. We could join on sports types, but since it is a small table that doesn't change often I will probably pre load them into memory and fetch from there. Profiles/auth.users is unqueried for the dashboard until we do additional RLS policies like editing only your own events/venues.

### Server Actions over API Routes
This was completely new to me. My side project PWA/iOS app uses supabase sdks directly with user's session token and is aided by RLS. Features requiring server side work like CloudFlare image uploading/signing, RLS bypasses for unique scenarios, or Stripe/Revenue Cat integrations I have always implemented as API routes.

### Toast Notifications
Toast notifications were also totally new to me. Admittedly in my side project my "notifications" are just a table with a type, message, and read field.

### UI
At first I attempted to use Claude Cowork / Projects to generate UI mockups that I intended to feed to Claude Code as image parameters in the initial propmts. My Claude chat kept bugging out and losing the UI mockups when I asked for changes / screenshots so I ended up letting Claude Code decided the UX for the most part given the requirements and plan I had come up with in Claude Cowork / Projects. A hard requirement that I set in the CLAUDE.md file was to use shadcn components as per the challenge.

### Deployment
The web app is hosted on vercel. I bought a ebvents.com on squarespace and wired it up to point to the web app. Commits to main trigger production deployments. I had to add environment variables on vercel to connect to supabase, cloudflare images, and Groq.

### Cloudlare Images
I used my cloudflare images to store user avatars and venue images. In our db we are storing public delivery urls as references. Environment variable in vercel and my own local .env for connection.

### Groq
I used my groq account to add LLM based field guesses. Guessing the sport based on the description or title for example. Environment variable in vercel and my own local .env for connection.

## How to Run
- Set environment variables in .env, examples can be found in [Sample .env](/.env.local.sample)
- npm run dev

## Extras
- Events
    - LLM based field autofill in event creation
    - Capturing event images
- Venues
    - Additional venue details other than just name
    - Venue Dashboard
    - Capturing Venue Address
    - Capturing Venue Images
- Sports
    - Many sports provisioned by default
    - User may request a new sport by filling out a sport creation form. All users are admins and can approve their own requests at this time.

## TODOS
As I was building I had ideas for more features and captured them in the [Todos Folder](docs/todos) folder.


