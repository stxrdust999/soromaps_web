/** Cache tag for reports list in moderation. */
export const REPORTS_LIST_TAG = "admin-reports-list";

/** Cache tag for feedback queries. */
export const FEEDBACK_LIST_TAG = "admin-feedback-list";

/** Cache tag for the global user activity feed. */
export const FEED_LIST_TAG = "user-feed-list";

/** Cache tag for active feed mute scopes. */
export const FEED_MUTES_TAG = "user-feed-mutes";

/** Cache tag for public stories and editorial lists. */
export const STORIES_LIST_TAG = "stories-list";

/**
 * Cache tag for a single editorial story by slug.
 *
 * @param slug Unique story slug.
 * @returns Revalidation tag string.
 */
export const storyShowTag = (slug: string) => `story-${slug}`;

/** Cache tag for explorer directory and ranking. */
export const EXPLORERS_LIST_TAG = "community-explorers-list";

/**
 * Cache tag for a single explorer public profile.
 *
 * @param userId Unique user identifier.
 * @returns Revalidation tag string.
 */
export const explorerProfileTag = (userId: string) => `explorer-profile-${userId}`;

/** Cache tag for admin dashboard statistics. */
export const ADMIN_STATS_TAG = "admin-dashboard-stats";
