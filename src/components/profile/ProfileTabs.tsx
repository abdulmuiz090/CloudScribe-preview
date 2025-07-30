
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfilePostsTab } from './ProfilePostsTab';
import { ProfileProductsTab } from './ProfileProductsTab';
import { ProfileCommunitiesTab } from './ProfileCommunitiesTab';
import { ProfileAboutTab } from './ProfileAboutTab';
import { ProfileFollowersTab } from './ProfileFollowersTab';
import { UserProfile } from '@/types/database.types';

interface ProfileTabsProps {
  profile: UserProfile;
  followers: any[];
  following: any[];
}

export const ProfileTabs = ({ profile, followers, following }: ProfileTabsProps) => {
  const [activeTab, setActiveTab] = useState('posts');

  return (
    <div className="mt-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="sticky top-0 bg-background border-b z-10">
          <TabsList className="w-full h-12 bg-transparent p-0 justify-start">
            <TabsTrigger 
              value="posts" 
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-6"
            >
              Posts
            </TabsTrigger>
            <TabsTrigger 
              value="products" 
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-6"
            >
              Products
            </TabsTrigger>
            <TabsTrigger 
              value="communities" 
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-6"
            >
              Communities
            </TabsTrigger>
            <TabsTrigger 
              value="about" 
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-6"
            >
              About
            </TabsTrigger>
            <TabsTrigger 
              value="followers" 
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-6"
            >
              Followers ({followers.length})
            </TabsTrigger>
          </TabsList>
        </div>
        
        <div className="mt-6">
          <TabsContent value="posts" className="mt-0">
            <ProfilePostsTab userId={profile.id} />
          </TabsContent>
          
          <TabsContent value="products" className="mt-0">
            <ProfileProductsTab userId={profile.id} />
          </TabsContent>
          
          <TabsContent value="communities" className="mt-0">
            <ProfileCommunitiesTab userId={profile.id} />
          </TabsContent>
          
          <TabsContent value="about" className="mt-0">
            <ProfileAboutTab profile={profile} />
          </TabsContent>
          
          <TabsContent value="followers" className="mt-0">
            <ProfileFollowersTab followers={followers} following={following} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
