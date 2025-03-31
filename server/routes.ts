import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPostSchema, insertUserSchema, insertFollowSchema, insertNotificationSchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth, isAuthenticated } from "./auth";
import { WebSocketServer } from "ws";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configurer l'authentification
  setupAuth(app);
  
  // API routes
  
  // La route /api/login est maintenant définie dans auth.ts
  
  // Users
  app.get("/api/users", async (req: Request, res: Response) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to get users" });
    }
  });
  
  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });
  
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  
  // Posts
  app.get("/api/posts", async (req: Request, res: Response) => {
    try {
      const posts = await storage.getPosts();
      
      // Fetch user details for each post
      const postsWithUserDetails = await Promise.all(
        posts.map(async (post) => {
          const user = await storage.getUser(post.userId);
          return {
            ...post,
            user: user || { id: post.userId, name: "Unknown User", username: "unknown" }
          };
        })
      );
      
      res.json(postsWithUserDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to get posts" });
    }
  });
  
  app.get("/api/posts/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getPost(id);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      const user = await storage.getUser(post.userId);
      
      res.json({
        ...post,
        user: user || { id: post.userId, name: "Unknown User", username: "unknown" }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get post" });
    }
  });
  
  app.post("/api/posts", async (req: Request, res: Response) => {
    try {
      // For demo purposes, assume the post is from the first user
      const userId = 1;
      
      const validatedData = insertPostSchema
        .omit({ userId: true })
        .parse(req.body);
        
      const post = await storage.createPost({
        ...validatedData,
        userId
      });
      
      const user = await storage.getUser(userId);
      
      res.status(201).json({
        ...post,
        user: user || { id: userId, name: "Unknown User", username: "unknown" }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid post data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create post" });
    }
  });
  
  // Profile
  app.get("/api/profile", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as Express.User).id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const followers = await storage.getFollowers(userId);
      const following = await storage.getFollowing(userId);
      
      res.json({
        ...user,
        stats: {
          posts: user.posts || 0,
          stories: user.stories || 0,
          activity: user.activity || "Actif"
        },
        followers: followers.length,
        following: following.length
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to get profile" });
    }
  });
  
  app.get("/api/profile/posts", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as Express.User).id;
      const posts = await storage.getUserPosts(userId);
      const user = await storage.getUser(userId);
      
      // Add user details to each post
      const postsWithUserDetails = posts.map(post => ({
        ...post,
        user: user || { id: userId, name: "Unknown User", username: "unknown" }
      }));
      
      res.json(postsWithUserDetails);
    } catch (error) {
      console.error("Error fetching profile posts:", error);
      res.status(500).json({ message: "Failed to get user posts" });
    }
  });
  
  // Follows
  app.post("/api/follows", async (req: Request, res: Response) => {
    try {
      const validatedData = insertFollowSchema.parse(req.body);
      const follow = await storage.createFollow(validatedData);
      res.status(201).json(follow);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid follow data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create follow" });
    }
  });
  
  // Suggestions
  app.get("/api/suggestions", async (req: Request, res: Response) => {
    try {
      // For demo purposes, assume it's the first user
      const userId = 1;
      const suggestions = await storage.getSuggestions(userId);
      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get suggestions" });
    }
  });
  
  // Update post reactions
  app.patch("/api/posts/:id/reactions", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { reactions } = req.body;
      
      const updatedPost = await storage.updatePostReactions(id, reactions);
      res.json(updatedPost);
    } catch (error) {
      res.status(500).json({ message: "Failed to update post reactions" });
    }
  });
  
  // Notifications
  app.get("/api/notifications", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as Express.User).id;
      const notifications = await storage.getUserNotifications(userId);
      
      // Ajouter les informations de l'expéditeur pour chaque notification
      const notificationsWithSenderInfo = await Promise.all(
        notifications.map(async (notification) => {
          if (notification.senderId) {
            const sender = await storage.getUser(notification.senderId);
            if (sender) {
              return {
                ...notification,
                senderName: sender.name,
                senderAvatar: sender.avatar
              };
            }
          }
          return notification;
        })
      );
      
      res.json(notificationsWithSenderInfo);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });
  
  app.post("/api/notifications", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const validatedData = insertNotificationSchema.parse({
        ...req.body,
        userId: req.body.userId || (req.user as Express.User).id
      });
      
      const notification = await storage.createNotification(validatedData);
      res.status(201).json(notification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid notification data", errors: error.errors });
      }
      console.error("Error creating notification:", error);
      res.status(500).json({ message: "Failed to create notification" });
    }
  });
  
  app.patch("/api/notifications/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { read } = req.body;
      
      if (typeof read !== 'boolean') {
        return res.status(400).json({ message: "Invalid data. 'read' must be a boolean value." });
      }
      
      // Vérifier que la notification appartient à l'utilisateur
      const notification = await storage.getNotification(id);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      if (notification.userId !== (req.user as Express.User).id) {
        return res.status(403).json({ message: "You don't have permission to update this notification" });
      }
      
      const updatedNotification = await storage.updateNotification(id, { read });
      res.json(updatedNotification);
    } catch (error) {
      console.error("Error updating notification:", error);
      res.status(500).json({ message: "Failed to update notification" });
    }
  });
  
  app.post("/api/notifications/read-all", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as Express.User).id;
      await storage.markAllNotificationsAsRead(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
