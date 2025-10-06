# Developer Plan: Building the Web Game with Codex and Supabase

This document captures the step-by-step plan for integrating a new web-based game into the Mega Museum site. Each phase includes a checklist so progress can be tracked over time. Check off items (`[x]`) as they are completed.

## Phase 1: Initial Setup and Planning
- [ ] Confirm project repository is set up and AI assistant (e.g., GitHub Copilot) is connected.
- [ ] Finalize technology stack (Phaser 3 for the client, Supabase for backend services).
- [ ] Create or configure the Supabase project; record API URL and anon key.
- [ ] Establish secure configuration handling for Supabase credentials.
- [ ] Define game integration approach and file structure within the site.
- [ ] Initialize and document the development log for ongoing progress tracking.

## Phase 2: Basic Game Page and Engine Setup
- [ ] Add a dedicated game page or route to the website and link it from navigation.
- [ ] Include the Phaser 3 library (via CDN or build tooling).
- [ ] Scaffold a minimal Phaser game instance with a placeholder scene.
- [ ] Verify the basic Phaser scene renders correctly in the browser.
- [ ] Commit the initial game setup and update the development log.

## Phase 3: Core Game Development
- [ ] Implement core gameplay prototype (player controls, basic mechanics).
- [ ] Integrate temporary or final art assets into the game scene.
- [ ] Introduce game states (Start, Playing, Game Over) and transitions.
- [ ] Add pause/resume functionality for the game loop.
- [ ] Playtest and iterate on mechanics to ensure smooth gameplay.
- [ ] Commit gameplay progress and note details in the development log.

## Phase 4: Supabase Backend Setup (Database & Auth)
- [ ] Initialize Supabase client in the project using the anon key.
- [ ] Enable and configure Supabase authentication providers (e.g., email/password).
- [ ] Design and create database schema (profiles, scores, items, inventory, etc.).
- [ ] Configure Row Level Security policies for user-specific data tables.
- [ ] Test database connectivity with basic queries/inserts.
- [ ] Document Supabase setup (tables, policies) in the development log.

## Phase 5: User Authentication Integration
- [ ] Build signup/login UI (page or modal) for user accounts.
- [ ] Implement Supabase auth flows (sign up, sign in, sign out) in the frontend.
- [ ] Handle authentication state changes and update UI accordingly.
- [ ] Apply access rules (require login or allow guest play as designed).
- [ ] Validate forms and display helpful error messages.
- [ ] Test complete auth scenarios and commit the integration.

## Phase 6: Persisting Game Data (Profiles, Scores, Progress)
- [ ] Create profile records for new users and associate with Supabase auth IDs.
- [ ] Save relevant game data (high scores, progress, inventory, etc.).
- [ ] Load user-specific data when the game initializes.
- [ ] (Optional) Implement realtime subscriptions for dynamic features like leaderboards.
- [ ] Verify persistence across sessions and multiple user accounts.
- [ ] Commit data persistence features and update documentation.

## Phase 7: In-Game Shop and Monetization
- [ ] Design the in-game shop UI and integrate with game navigation.
- [ ] Implement in-game currency earning and tracking.
- [ ] Define purchasable items (hard-coded or database-driven).
- [ ] Handle purchases using in-game currency (update balances and inventory).
- [ ] Outline or prototype secure real-money purchase flow (e.g., Stripe via server/edge functions).
- [ ] Test purchase scenarios and reflect changes in player state.
- [ ] Commit shop features and document available items and future monetization plans.

## Phase 8: Testing, Debugging, and Refinement
- [ ] Perform end-to-end testing of signup, gameplay, data saving, and shop flows.
- [ ] Test across browsers/devices and adjust for responsive layouts.
- [ ] Optimize performance (frame rate, asset loading) as needed.
- [ ] Address bugs and edge cases discovered during testing.
- [ ] Polish UI/UX elements for consistency with the site.
- [ ] Commit final refinements and prepare for deployment.

## Phase 9: Deployment and Maintenance
- [ ] Deploy the updated site to the production hosting environment.
- [ ] Configure Supabase environment variables for production builds.
- [ ] Conduct post-deployment smoke tests on the live site.
- [ ] Monitor Supabase usage and plan for scaling if necessary.
- [ ] Continue updating the development log for ongoing tasks and enhancements.
- [ ] Document future improvement ideas (multiplayer, analytics, seasonal updates, etc.).

---

**References & Inspiration**
- Phaser official site and tutorials – [https://phaser.io](https://phaser.io)
- Supabase documentation – [https://supabase.com/docs](https://supabase.com/docs)
- Articles discussing Phaser with AI-assisted development and in-game shops.

Update this plan as milestones are achieved or priorities shift to keep the project organized and transparent.
