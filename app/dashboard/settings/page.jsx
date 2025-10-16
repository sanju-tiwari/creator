"use client"
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/convex/_generated/api';
import { useConvexMutation, useConvexQuery } from '@/hook/use-convex-query';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Loader2, User } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

const usernameSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens"
    ),
});

export default function SettingsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: currentUser, isLoading } = useConvexQuery( api.users.getCurrentUser);
  const updateUsername = useConvexMutation(api.users.updateUsername);
  const form = useForm({resolver: zodResolver(usernameSchema),defaultValues: {username: "",},});
  const {register,handleSubmit,formState: { errors },reset, } = form;

  useEffect(() => {
    if (currentUser) {
      reset({
        username: currentUser.username || "",
      });
    }
  }, [currentUser, reset]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await updateUsername.mutate({
        username: data.username,
      });
      toast.success("Username updated successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to update username");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto" />
          <p className="text-slate-400 mt-4">Loading settings...</p>
        </div>
      </div>
    );
  }

return (
    <div className=' space-y-8 p-4 lg:p-8 ' >
        <div>
        <h1 className="text-3xl font-bold gradient-text-primary">Settings</h1>
        <p className="text-slate-400 mt-2">
          Manage your profile and account preferences
        </p>
      </div>  
      <Card className="bg-gray-900/50 border-gray-800 hover:border-purple-500/50 max-w-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <User className="h-5 w-5 mr-2" />
            Username Settings
          </CardTitle>
          <CardDescription>
            Set your unique username for your public profile
          </CardDescription>
        </CardHeader> 
          <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white">
                Username
              </Label>
              <Input
                id="username"
                {...register("username")}
                placeholder="Enter your username"
                className="bg-slate-800 border-slate-600 text-white"
              />
              {currentUser?.username && (
                <div className="text-sm text-slate-400">
                  Current username:{" "}
                  <span className="text-white">@{currentUser.username}</span>
                </div>
              )}
              <div className="text-xs text-slate-500">
                3-20 characters, letters, numbers, underscores, and hyphens only
              </div>

              {errors.username && (
                <p className="text-red-400 text-sm flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.username.message}
                </p>
              )}
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                variant="primary"
                className="w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Username"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
)
}

