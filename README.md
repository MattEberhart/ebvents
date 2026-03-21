# Ebvents - A Sporting Event Scheduler
Ebvents is a web app that allows users to view a dashboard of sporting events. The user can view all sporting event details, navigate to create and edit forms to alter events, and search or filter for sports on various fields. Key details are event name, sport type, date / time, description, and venue(s). As such, a user can also create venues and sport types. The dashboard allows user to toggle between card and table views.

Having just venue names felt lame so I made them their own entities. A user can create and edit venues, view details, and view a dashboard of venues similar to that of the events. These venues have additional details like address and capacity.

At this time, all users can view, edit, and delete other users' events and venues as this was my understanding of the spec. I'd like to have role based permissions in the future, but this would complicate the signup flow or ideally admins would have their own event management portal and regular users would have read only access to find their desired events. Edit: The longer I work on this I think it's weird that users can edit/delete other users' events and venues. Please know I know how to block this with RLS and only show edit icons on the appropriate cards/rows in the dashboard. I am just not sure what was wanted from the spec. 

The project was implemented in Next.js, hosted in vercel, and stores data in supabase. Users may sign in with email/password, email/OTP code, or Google OAuth all managed by supabase. Google OAuth was new to me, I had to create a Google Cloud account, create an identity, and wire it up in supabase. Database interactions are serverside with Server Actions, not API routes. Images are in cloudflare images rather than supabase object storage for CDN serving + no montly throughput limit that supabase would impose.

Claude Code assisted in the making of this web app, many GPUs were harmed in the process. 

## Links
- https://ebvents.com
- https://ebvents.vercel.app
- https://github.com/MattEberhart/ebvents

## Architecture
The table details are captured in [Database Spec](docs/database.md) and the scripts to provision them are in [DB Scripts](/supabase/migrations). You will see multiple files here since as I find issues with the schemas, I write additional scripts to migrate / fix. For a production system I would take more time to review before doing any provisioning and have bullet proof migration plans, but for a coding challenge POC with no users I like to get a good base and build from there.

All tables are public except the auth.users table and have RLS enabled, though the RLS is simply "Is user authenticated" since for now we are allowing users to edit / delete others' events and venues.

### Profiles Table
This represents the user and is separate from the auth.users. The columns are id (fk to auth.users), first name, last name, avatar image id, and created at.
Some Decisions I Made:
- Claude suggested full name column at first. I like splitting into first and last for UX puposes. "Hi Matt" is better than "Hi Matt Eberhart"
- Claude suggested we include the email in the profiles table. I did this once in a side project, but realized users need to have RLS access on other users' profile rows to fetch things like avatar image id or their name and this means exposing the email if it is a column in the table. That was a big migration in my app - rolling out ux to use auth.users email where appropriate (the users own profile details) then deprecating the columnn in profiles.
- I gave the avatar image id a lot of thought:
  - Claude first suggested image url, which I am against because I thought it meant storing signed urls. In my side project I ruled against this as the urls wouldn't expire and could be shared. I went with server side signing with auth checks in the side project - can the user view this other user's avatar? We can check following/friend relationships server side and then sign image. Other users could only maliciously get the image id, not the cloudflare domain/path nor the signed url. 
  - I raised this concern and told Claude to move to image id. It interpreted this as storing image ids, but using public delivery urls meaning the images remain public and we can just construct the url client side based on the image id. A simple formatting helper function. I hadn't heard of public delivery urls. I had only served signed image urls on private images (or blobs in a past job)
  - I decided leaving the images public was fine for this challenge since it was an extra, avatars are only visible to the user themself at this time in the ux, and we have no friend / follow. The pattern works well for venue images as well since all users can see all venue details. I was happy we still moved from storing url to just id, since storing the whole url over and over would be redundant when it can just be a helper function + client side config.
  - Having avatar image id as a column means no tracking historical avatar images + deleting the old images on a new image upload else having orphaned images in cloudflare

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
This table represents the venues. The columns are id, name, address, city, state, capacity, latitude, longitude, created_by (fk to auth.users), image id, created_at, updated_at.

Again this was an extra for me. Per the challenge we just needed to show venues (plural) for the event. Claude initially just wanted to store these as an array in it's own column of Events. I immediately was thinking about how a venue is way more than the name and added these extra fields.
Decisions:
- created_by similar to Events, I want to know who created the venue for future access policy features.
- I haven't finished yet as I write this, but I believe latitude and longitude are for a future feature where we will verify the address with a Google Maps API and store coordinates for directions. [Google API Feature](/docs/todos/google-places-autocomplete.md)
- I went with image id as a column here since venue details were an extra. To support many images we would have a venue images table, but I did not want to spend more time spinning up the table, thinking through max image logic, and maintaining a photo carousel in various UXes.

### Event Venues Table
This is a table to track the many to many relationship between events and venues. Obviously a venue can be assigne to many events over many days. The reason venue id is not just a column in Events Table is because the challenge explicitly outlines an event can have multiple venues. I was surprised this didn't mean multiple dates as well, but maybe it could be like an AAU tournament on one day with multiple courts/sportsplexes. Columns are id, event_id (fk to events), and venue_id (fk to venues).

### Querying
Given the above structures, to load the dashboard we take a subset or all of events depending on how we are paginating, join on event venues by event id, join on venues by the event id from event venues. We could join on sports types, but since it is a small table that doesn't change often I will probably pre load them into memory and fetch from there. Profiles/auth.users is unqueried for the dashboard until we do additional RLS policies like editing only your own events/venues.

See the server side actions below to see these implemented. 

### Server Actions over API Routes
This was completely new to me. My side project PWA/iOS app uses supabase sdks directly with user's session token and is aided by RLS. Features requiring server side work like CloudFlare image uploading/signing, RLS bypasses for unique scenarios, or Stripe/Revenue Cat integrations I have always implemented as API routes.

I really like the concept. Avoiding url formatting and fetch calls makes the code clean. The user session token seems to pass seemlessly to the server action whereas in other projects I've had to explicitly pass it over https and parse it out in the API route. Avoiding direct supabase client calls in the front end makes the components short, clean, and clear.

One potential critique is that this only works because the front end and server are hosted in the same place. I wonder if this could bring redundancy issues down the road at scale. Also my understanding is we would need API routes or supabase client queries if we were to build a mobile app, as the front end is not next to the server.

- [Auth](actions/auth.ts)
- [Sport Types](actions/sport-types.ts)
- [Events](actions/events.ts)
- [Venues](actions/venues.ts)
- [Profiles](actions/profile.ts)

### Toast Notifications
Toast notifications were also totally new to me. The immediate feedback to the user is a pleasant guide on how to navigate the app. It is nice to be able to wrap any code in a toast.success/toast.error and get a message to the user.  The current functionality also does not require persistent notifications so there is no need to store these notifications. Down the road if there were some review/approve flow for event creation, we would need to store these somewhere to list for the user when they sign back in.

Notifications:
- Event created, updated, deleted, cancelled
- Venue created, updated, deleted
- Sport created
- Avatar image updated
- Welcome back
- Not authenticated
- Sport name is required
- Sport already exists
- An unexpected error occurred
- Email confirmed


### UI
At first I attempted to use Claude Cowork / Projects to generate UI mockups that I intended to feed to Claude Code as image parameters in the initial propmts. My Claude chat kept bugging out and losing the UI mockups when I asked for changes / screenshots so I ended up letting Claude Code decided the UX color schemes, card designs, etc for the most part given the requirements and plan I had come up with in Claude Cowork / Projects. A hard requirement that I set in the CLAUDE.md file was to use shadcn components as per the challenge.

I had it implement both an events dashboard and a venues dashboard. The user can toggle between the two via buttons on the nav bar at the top. Changing between these changes the 'Create' button between 'Create Event' and 'Create Venue'. Each of these opens a shadcn form component to enter appropriate fields or images in the venue case. When creating an event the user can choose from the Sports drop down or create a new sport. Similarly the user can choose from available venues or create one.

The user can select their avatar or initial icon in the top right to open their user details. There they can click their avatar again to upload an avatar.

Each dashboard supports both a card view and a table view. The challenge specified a 'grid/list layout' and I felt this solved both. The card view supports infinite scrolling and the table view supports pagination. Both experiences utilize the same pagination logic in the server side action. A user can search on the name field in each dashboard. The searches are debounced so as not to hit the db for every letter. Dashboards also support filtering on certain fields and ordering by certain fields. Each do a call to the server side action. Optimizations could be made in certain edge cases where the filter or order by appended would not affect the results or would leave enough results to fill the page, but that was a lot to work through for a minor optimization in a coding challenge.

Sign up via email and password triggers a confirm email with OTP code screen. User must fetch the code from email to verify the account. OAuth with Google avoids this step and takes user straight to the dashboard.

### Deployment
The web app is hosted on vercel. I bought ebvents.com on squarespace and wired it up to point to the web app. Commits to main trigger production deployments. I had to add environment variables on vercel to connect to supabase, cloudflare images, and Groq.

### Cloudflare Images
I used my cloudflare images to store user avatars and venue images. In our db we are storing the image id. The client uses NEXT_PUBLIC_CF_ACCOUNT_HASH to construct the public delivery url with a helper function. For uploading we do a server side action using CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_IMAGES_API_TOKEN.

### Emails
Signup, OTP, etc emails come from supabase, but I did update them to match the app's styling. These can be found in [Emails](/supabase/emails). I did not take the time to setup an SMTP server. In my side project I have configured emails to come from my domain using Zoho Mail and later Resend. Similarly you'll see a supabase url flash by as you continue with Google.

## How to Run
- Set environment variables in .env, examples can be found in [Sample .env](/.env.local.example)
- npm run dev

## Extras
- Events
    - Status (Active/Cancelled, implied upcoming/completed)
    - Click for venue details
    - Card grid and table views, various filters, name search, order by
    - Pagination, infinite scrolling for cards and next page for table
- Venues
    - Additional venue details other than just name
    - Venue Dashboard
    - Capturing Venue Address
    - Capturing Venue Images
- Sports
    - Table tracking, not enum or ruleless user input
    - Many sports provisioned by default
    - Additional sport creation
- Profiles
    - Profile details slide out
    - Avatar uploads

## TODOS
As I was building I had ideas for more features and captured them in the [Todos Folder](docs/todos) folder.


