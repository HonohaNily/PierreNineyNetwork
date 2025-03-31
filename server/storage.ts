import { 
  User, 
  InsertUser, 
  Post, 
  InsertPost, 
  Follow,
  InsertFollow,
  Story,
  InsertStory,
  Notification,
  InsertNotification,
  users,
  posts,
  follows,
  stories,
  notifications
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, not, inArray, lt, gt, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User>;
  getUsers(): Promise<User[]>;
  
  // Post methods
  getPost(id: number): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  getUserPosts(userId: number): Promise<Post[]>;
  getPosts(): Promise<Post[]>;
  updatePostReactions(postId: number, reactions: { likes: number; dislikes: number }): Promise<Post>;
  
  // Follow methods
  createFollow(follow: InsertFollow): Promise<Follow>;
  getFollowers(userId: number): Promise<User[]>;
  getFollowing(userId: number): Promise<User[]>;
  
  // Suggestions
  getSuggestions(userId: number): Promise<User[]>;
  
  // Story methods
  createStory(story: InsertStory): Promise<Story>;
  getUserStories(userId: number): Promise<Story[]>;
  getActiveStories(): Promise<Story[]>;
  getStory(id: number): Promise<Story | undefined>;
  
  // Notification methods
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotification(id: number): Promise<Notification | undefined>;
  getUserNotifications(userId: number): Promise<Notification[]>;
  updateNotification(id: number, data: Partial<InsertNotification>): Promise<Notification>;
  markAllNotificationsAsRead(userId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User> {
    const result = await db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error("User not found");
    }
    
    return result[0];
  }
  
  async getUsers(): Promise<User[]> {
    return db.select().from(users);
  }
  
  async getPost(id: number): Promise<Post | undefined> {
    const result = await db.select().from(posts).where(eq(posts.id, id));
    return result[0];
  }
  
  async createPost(insertPost: InsertPost): Promise<Post> {
    const result = await db.insert(posts).values({
      ...insertPost,
      comments: 0
    }).returning();
    
    return result[0];
  }
  
  async getUserPosts(userId: number): Promise<Post[]> {
    return db.select()
      .from(posts)
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.createdAt));
  }
  
  async getPosts(): Promise<Post[]> {
    return db.select()
      .from(posts)
      .orderBy(desc(posts.createdAt));
  }
  
  async updatePostReactions(postId: number, reactions: { likes: number; dislikes: number }): Promise<Post> {
    const result = await db.update(posts)
      .set({ reactions })
      .where(eq(posts.id, postId))
      .returning();
    
    if (result.length === 0) {
      throw new Error("Post not found");
    }
    
    return result[0];
  }
  
  async createFollow(insertFollow: InsertFollow): Promise<Follow> {
    const result = await db.insert(follows)
      .values(insertFollow)
      .returning();
    
    return result[0];
  }
  
  async getFollowers(userId: number): Promise<User[]> {
    const result = await db.select({
      user: users
    })
    .from(follows)
    .innerJoin(users, eq(follows.followerId, users.id))
    .where(eq(follows.followingId, userId));
    
    return result.map(r => r.user);
  }
  
  async getFollowing(userId: number): Promise<User[]> {
    const result = await db.select({
      user: users
    })
    .from(follows)
    .innerJoin(users, eq(follows.followingId, users.id))
    .where(eq(follows.followerId, userId));
    
    return result.map(r => r.user);
  }
  
  async getSuggestions(userId: number): Promise<User[]> {
    // Get the IDs of users that the current user is following
    const followingResult = await db.select({ followingId: follows.followingId })
      .from(follows)
      .where(eq(follows.followerId, userId));
    
    const followingIds = followingResult.map(r => r.followingId);
    
    // Return users that are not the current user and not being followed
    return db.select()
      .from(users)
      .where(
        and(
          not(eq(users.id, userId)),
          followingIds.length > 0 ? not(inArray(users.id, followingIds)) : undefined
        )
      );
  }
  
  async createStory(insertStory: InsertStory): Promise<Story> {
    const result = await db.insert(stories)
      .values(insertStory)
      .returning();
    
    return result[0];
  }
  
  async getUserStories(userId: number): Promise<Story[]> {
    return db.select()
      .from(stories)
      .where(eq(stories.userId, userId))
      .orderBy(desc(stories.createdAt));
  }
  
  async getActiveStories(): Promise<Story[]> {
    const now = new Date();
    return db.select()
      .from(stories)
      .where(sql`${stories.expiresAt} > ${now}`)
      .orderBy(desc(stories.createdAt));
  }
  
  async getStory(id: number): Promise<Story | undefined> {
    const result = await db.select().from(stories).where(eq(stories.id, id));
    return result[0];
  }
  
  // Notification methods
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const result = await db.insert(notifications)
      .values(insertNotification)
      .returning();
    
    return result[0];
  }
  
  async getNotification(id: number): Promise<Notification | undefined> {
    const result = await db.select().from(notifications).where(eq(notifications.id, id));
    return result[0];
  }
  
  async getUserNotifications(userId: number): Promise<Notification[]> {
    return db.select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }
  
  async updateNotification(id: number, data: Partial<InsertNotification>): Promise<Notification> {
    const result = await db.update(notifications)
      .set(data)
      .where(eq(notifications.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error("Notification not found");
    }
    
    return result[0];
  }
  
  async markAllNotificationsAsRead(userId: number): Promise<void> {
    await db.update(notifications)
      .set({ read: true })
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.read, false)
        )
      );
  }
  
  // Method to seed the database with initial data if it's empty
  async seedInitialData(): Promise<void> {
    // Check if we already have users
    const existingUsers = await this.getUsers();
    if (existingUsers.length > 0) {
      return; // Database already has data, no need to seed
    }
    
    // Create default user
    const defaultUser = await this.createUser({
      username: "pierre_network",
      password: "password123",
      name: "Pierre Network",
      bio: "Bienvenue sur mon réseau social. Partagez vos photos et vos vidéos avec vos amis !",
      avatar: "/assets/ENILV.jpg",
      themeColor: "#3498db"
    });
    
    // Create sample users
    const sampleUsers = [
      {
        username: "jean_dupont",
        password: "password123",
        name: "Jean Dupont",
        bio: "Photographe amateur et passionné de cinéma.",
        avatar: "/assets/Favé.png"
      },
      {
        username: "marie_claire",
        password: "password123",
        name: "Marie Claire",
        bio: "Voyageuse et amoureuse de la nature.",
        avatar: "/assets/Séduire.png"
      },
      {
        username: "thomas_martin",
        password: "password123",
        name: "Thomas Martin",
        bio: "Coach sportif et passionné de fitness.",
        avatar: "/assets/Abdos.png"
      }
    ];
    
    const createdUsers = await Promise.all(sampleUsers.map(user => 
      this.createUser({
        username: user.username,
        password: user.password,
        name: user.name,
        bio: user.bio,
        avatar: user.avatar
      })
    ));
    
    // Create sample posts
    const samplePosts = [
      {
        userId: defaultUser.id,
        content: "Bienvenue sur Pierre Niney Network ! Le réseau social où vous pouvez partager vos moments préférés.",
        image: "/assets/ENILV.jpg",
        mediaType: "image"
      },
      {
        userId: createdUsers[0].id,
        content: "Une magnifique journée à la plage. Que demander de plus ?",
        image: "/assets/design.jpeg",
        mediaType: "image"
      },
      {
        userId: createdUsers[1].id,
        content: "Mon nouveau projet photo commence aujourd'hui !",
        image: "/assets/image_1743428476401.png",
        mediaType: "image"
      },
      {
        userId: createdUsers[2].id,
        content: "Séance d'entraînement du jour terminée. Qui est motivé pour demain ?",
        image: "/assets/Abdos.png",
        mediaType: "image"
      }
    ];
    
    await Promise.all(samplePosts.map(post => 
      this.createPost({
        userId: post.userId,
        content: post.content,
        image: post.image,
        mediaType: post.mediaType
      })
    ));
    
    // Update user posts count
    await db.update(users)
      .set({ posts: 1 })
      .where(eq(users.id, defaultUser.id));
    
    await Promise.all(createdUsers.map(user => 
      db.update(users)
        .set({ posts: 1 })
        .where(eq(users.id, user.id))
    ));
  }
}

export const storage = new DatabaseStorage();
