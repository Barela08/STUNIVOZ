import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Image, Smile, UserPlus, Search, Send, Users, Plus, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Input, Textarea } from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import {
  collection, onSnapshot, addDoc, updateDoc, doc,
  arrayUnion, arrayRemove, serverTimestamp, query, orderBy, limit
} from 'firebase/firestore';

interface FirestorePost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  likedBy: string[];
  commentsCount: number;
  createdAt: any;
  image?: string | null;
}


const CREATOR_ROLES = ['admin', 'staff', 'company'];

function timeAgo(ts: any): string {
  if (!ts) return 'Just now';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export const CommunityPage: React.FC = () => {
  const { profile, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'feed' | 'qna' | 'groups'>('feed');
  const [newPost, setNewPost] = useState('');
  const [posts, setPosts] = useState<FirestorePost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState('');
  const [posting, setPosting] = useState(false);

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Anonymous';
  const avatarLetter = displayName.charAt(0).toUpperCase();
  const userId = user?.uid || '';

  useEffect(() => {
    setPostsLoading(true);
    setPostsError('');
    const q = query(collection(db, 'community_posts'), orderBy('createdAt', 'desc'), limit(50));
    const unsub = onSnapshot(q,
      (snap) => {
        setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() } as FirestorePost)));
        setPostsLoading(false);
      },
      (err) => {
        console.error('Community posts error:', err);
        setPostsError('Could not load posts. Check Firestore rules.');
        setPostsLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const toggleLike = async (post: FirestorePost) => {
    if (!userId) return;
    const ref = doc(db, 'community_posts', post.id);
    const hasLiked = post.likedBy?.includes(userId);
    try {
      await updateDoc(ref, {
        likedBy: hasLiked ? arrayRemove(userId) : arrayUnion(userId),
      });
    } catch (e) {
      console.error('Like error:', e);
    }
  };

  const handlePost = async () => {
    if (!newPost.trim() || !userId) return;
    setPosting(true);
    try {
      await addDoc(collection(db, 'community_posts'), {
        authorId: userId,
        authorName: displayName,
        authorAvatar: avatarLetter,
        content: newPost.trim(),
        likedBy: [],
        commentsCount: 0,
        createdAt: serverTimestamp(),
        image: null,
      });
      setNewPost('');
    } catch (e) {
      console.error('Post error:', e);
    }
    setPosting(false);
  };

  const canCreateGroup = profile?.role && CREATOR_ROLES.includes(profile.role);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Community</h1>
          <p className="text-gray-500 dark:text-gray-400">Connect with fellow students</p>
        </div>
        <Button variant="primary">
          <UserPlus className="w-4 h-4" />
          Find Mentor
        </Button>
      </div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'feed', label: 'Feed' },
          { id: 'qna', label: 'Q&A' },
          { id: 'groups', label: 'Groups' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'feed' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardContent>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {avatarLetter}
                  </div>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Share something with the community..."
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      rows={2}
                    />
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Image className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Smile className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handlePost}
                        disabled={!newPost.trim() || posting}
                        loading={posting}
                      >
                        <Send className="w-4 h-4" />
                        Post
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {postsLoading && (
              <div className="flex items-center justify-center py-10 gap-2 text-gray-400 dark:text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Loading posts...</span>
              </div>
            )}

            {postsError && (
              <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {postsError}
              </div>
            )}

            {!postsLoading && !postsError && posts.length === 0 && (
              <div className="text-center py-10 text-gray-400 dark:text-gray-500">
                <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No posts yet. Be the first to share!</p>
              </div>
            )}

            {posts.map((post) => {
              const hasLiked = post.likedBy?.includes(userId);
              return (
                <Card key={post.id}>
                  <CardContent>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {post.authorAvatar || post.authorName?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{post.authorName}</h3>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{timeAgo(post.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">{post.content}</p>
                    <div className="flex items-center gap-4 border-t border-gray-100 dark:border-gray-800 pt-3">
                      <button
                        onClick={() => toggleLike(post)}
                        className={`flex items-center gap-1.5 text-sm transition-colors ${
                          hasLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 hover:text-red-400'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
                        {post.likedBy?.length || 0}
                      </button>
                      <button className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        {post.commentsCount || 0}
                      </button>
                      <button className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors">
                        <Share2 className="w-4 h-4" />
                        Share
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader title="Popular Topics" />
              <CardContent>
                <div className="space-y-2">
                  {['Web Development', 'Data Science', 'Interview Prep', 'Career Advice', 'Projects'].map((topic) => (
                    <button key={topic} className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm text-gray-600 dark:text-gray-400 transition-colors">
                      #{topic}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="Suggested Users" />
              <CardContent>
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
                  Suggestions coming soon
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'qna' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex gap-4">
              <Input placeholder="Search questions..." icon={<Search className="w-5 h-5" />} />
              <Button variant="primary">Ask Question</Button>
            </div>
            <Card>
              <CardContent>
                <div className="py-8 flex flex-col items-center justify-center text-center">
                  <MessageCircle className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">No questions yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Be the first to ask a question!</p>
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader title="Top Contributors" />
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
                  No contributors yet
                </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'groups' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Student Groups</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Join groups to connect with students who share your interests</p>
            </div>
            {canCreateGroup && (
              <Button variant="primary">
                <Plus className="w-4 h-4" />
                Create Group
              </Button>
            )}
          </div>

          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">No groups yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Groups created by admin, staff, and company accounts will appear here.
            </p>
          </div>

          {!canCreateGroup && (
            <p className="text-center text-xs text-gray-400 dark:text-gray-600">
              Group creation is available to admin, staff, and company accounts.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
