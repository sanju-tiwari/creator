"use client"

import { api } from "@/convex/_generated/api";
import { useConvexMutation, useConvexQuery } from "@/hook/use-convex-query";
import { useUser } from "@clerk/nextjs";
import { notFound } from "next/navigation";
import React from "react"
import PublicHeader from "./_component/public-header";
import Image from "next/image";
import { Calendar, UserCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import PostCard from "@/components/ui/postcard";
import { Card, CardContent } from "@/components/ui/card";

export default function ProfilePage({params}){
   const {username} = React.use(params)
   const { user: currentUser } = useUser();

     const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = useConvexQuery(api.users.getByUsername, { username });
  
   const { data: postsData, isLoading: postsLoading } = useConvexQuery(api.public.getPublishedPostsByUsername,
    {
      username,
      limit: 20,
    }
  );
  
    const { data: followerCount } = useConvexQuery(api.follows.getFollowerCount,
    user ? { userId: user._id } : "skip"
  );

  const { data: isFollowing } = useConvexQuery(api.follows.isFollowing,
    currentUser && user ? { followingId: user._id } : "skip"
  );

  const toggleFollow = useConvexMutation(api.follows.toggleFollow);

  if (userLoading || postsLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (userError || !user) {
    notFound();
  }
   
  const post = postsData?.post || []
  const isOwnProfile = currentUser && currentUser.publicMetadata?.username === user.username;

     const handleFollowToggle = async () => {
    if (!currentUser) {
      toast.error("Please sign in to follow users");
      return;
    }

    try {
      await toggleFollow.mutate({ followingId: user._id });
    } catch (error) {
      toast.error(error.message || "Failed to update follow status");
    }
  };

  return (
     <div className="min-h-screen bg-slate-900 text-white">
        <PublicHeader link="/" title="Back to Home" />

        <div lassName="max-w-7xl mx-auto px-6 py-12">
            <div className="text-center mb-12">
               <div className="relative w-24 h-24 mx-auto mb-6">
            {user.imageUrl ? (
              <Image
                src={user.imageUrl}
                alt={user.name}
                fill
                className="rounded-full object-cover border-2 border-slate-700"
                sizes="96px"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-2xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <h1 className="text-4xl font-bold mb-2 gradient-text-primary">
            {user.name}
          </h1>

          <p className="text-xl text-slate-400 mb-4">@{user.username}</p>   
           {!isOwnProfile && currentUser && (
            <Button
              onClick={handleFollowToggle}
              disabled={toggleFollow.isLoading}
              variant={isFollowing ? "outline" : "primary"}
              className="mb-4"
            >
              {isFollowing ? (
                <>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Following
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Follow
                </>
              )}
            </Button>
          )}
            <div className="flex items-center justify-center text-sm text-slate-500">
            <Calendar className="h-4 w-4 mr-2" />
            Joined{" "}
            {new Date(user.createdAt).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </div>
            </div>
             <div className="flex justify-center gap-8 mb-12">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{post.length}</div>
            <div className="text-sm text-slate-400">Posts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {followerCount || 0}
            </div>
            <div className="text-sm text-slate-400">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {post
                .reduce((acc, post) => acc + post.viewCount, 0)
                .toLocaleString()}
            </div>
            <div className="text-sm text-slate-400">Total Views</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {post
                .reduce((acc, post) => acc + post.likeCount, 0)
                .toLocaleString()}
            </div>
            <div className="text-sm text-slate-400">Total Likes</div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Recent Posts</h2>

          {post.length === 0 ? (
            <Card className="bg-gray-900/50 border-gray-800 hover:border-purple-500/50">
              <CardContent className="text-center py-12">
                <p className="text-slate-400 text-lg">No posts yet</p>
                <p className="text-slate-500 text-sm mt-2">
                  Check back later for new content!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {post.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  showActions={false}
                  showAuthor={false}
                />
              ))}
            </div>
          )}
        </div>
        </div>

     </div>

  )


}