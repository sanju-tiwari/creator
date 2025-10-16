import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getPublishedPostsByUsername = query({
  args: {
    username: v.string(),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("username"), args.username))
      .unique();

    if (!user) {
      return { posts: [], hasMore: false };
    }

    let query = ctx.db
      .query("posts")
      .filter((q) =>
        q.and(
          q.eq(q.field("authorId"), user._id),
          q.eq(q.field("status"), "published")
        )
      )
      .order("desc");

    const limit = args.limit || 10;
    const posts = await query.take(limit + 1);

    const hasMore = posts.length > limit;
    const finalPosts = hasMore ? posts.slice(0, limit) : posts;

    const postsWithAuthor = await Promise.all(
      finalPosts.map(async (post) => ({
        ...post,
        author: {
          _id: user._id,
          name: user.name,
          username: user.username,
          imageUrl: user.imageUrl,
        },
      }))
    );

    return {
      posts: postsWithAuthor,
      hasMore,
      nextCursor: hasMore ? finalPosts[finalPosts.length - 1]._id : null,
    };
  },
});

export const getPublishedPost = query({ 
    args:{username:v.string() , postId: v.id("posts")},
    handler: async (ctx , args)=>{
            const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("username"), args.username))
      .unique();

    if (!user) {
      return null;
    }

    const post = await ctx.db.get(args.postId)

    if (!post) {
      return null;
    }

    if (post.authorId !== user._id || post.status !== "published"){
      return null;
    }
    
     return {
      ...post,
      author: {
        _id: user._id,
        name: user.name,
        username: user.username,
        imageUrl: user.imageUrl,
      },
    };
    }
})

export const incrementViewCount = mutation({
     args: { postId: v.id("posts") },
     
     handler: async (ctx , args)=>{
     
    const post = await ctx.db.get(args.postId);

    if (!post || post.status !== "published") {
      return;
    }

    await ctx.db.patch(args.postId , {
        viewCount: post.viewCount + 1,  
    })
     const today = new Date().toISOString().split("T")[0]; 

    const existingStats = await ctx.db
      .query("dailyStats")
      .filter((q) =>
        q.and(
          q.eq(q.field("postId"), args.postId),
          q.eq(q.field("date"), today)
        )
      )
      .unique();

    if (existingStats) {
      await ctx.db.patch(existingStats._id, {
        views: existingStats.views + 1,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("dailyStats", {
        postId: args.postId,
        date: today,
        views: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return { success: true };
     }
})
