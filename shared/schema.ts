import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email"),
  password: text("password").notNull(),
  name: text("name").notNull(),
  bio: text("bio"),
  avatar: text("avatar"),
  coverPhoto: text("cover_photo"),
  location: text("location"),
  website: text("website"),
  birthday: text("birthday"),
  themeColor: text("theme_color"),
  posts: integer("posts").default(0),
  stories: integer("stories").default(0),
  activity: text("activity").default("Nouveau"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  image: text("image"),
  video: text("video"),
  mediaType: text("media_type"),
  reactions: json("reactions").$type<{
    likes: number;
    dislikes: number;
  }>().default({ likes: 0, dislikes: 0 }),
  comments: integer("comments").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").notNull().references(() => users.id),
  followingId: integer("following_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content"),
  media: text("media").notNull(),
  mediaType: text("media_type").notNull(),
  duration: integer("duration").default(24),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  senderId: integer("sender_id").references(() => users.id),
  type: text("type").notNull(), // 'like', 'comment', 'follow', 'mention', 'system'
  content: text("content").notNull(),
  postId: integer("post_id").references(() => posts.id),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  name: true,
  bio: true,
  avatar: true,
  coverPhoto: true,
  location: true,
  website: true,
  birthday: true,
  themeColor: true,
  posts: true,
  stories: true,
  activity: true,
});

export const insertPostSchema = createInsertSchema(posts).pick({
  userId: true,
  content: true,
  image: true,
  video: true,
  mediaType: true,
});

export const insertStorySchema = createInsertSchema(stories).pick({
  userId: true,
  content: true,
  media: true,
  mediaType: true,
  duration: true,
  expiresAt: true,
});

export const insertFollowSchema = createInsertSchema(follows).pick({
  followerId: true,
  followingId: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  senderId: true,
  type: true,
  content: true,
  postId: true,
  read: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;

export type InsertFollow = z.infer<typeof insertFollowSchema>;
export type Follow = typeof follows.$inferSelect;

export type InsertStory = z.infer<typeof insertStorySchema>;
export type Story = typeof stories.$inferSelect;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
