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

const mockQuestions = [
  { id: 1, title: 'How to prepare for Amazon SDE interview?', answers: 5, category: 'Interview Prep' },
  { id: 2, title: 'Best resources to learn React in 2024?', answers: 12, category: 'Web Dev' },
  { id: 3, title: 'Is it too late to switch to tech?', answers: 8, category: 'Career' },
];

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
                <div className="space-y-3">
                  {[
                    { name: 'Alice Brown', role: 'SDE at Google' },
                    { name: 'Bob Wilson', role: 'Full Stack Dev' },
                    { name: 'Carol Davis', role: 'UX Designer' },
                  ].map((u) => (
                    <div key={u.name} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{u.role}</p>
                      </div>
                      <Button variant="ghost" size="sm">Follow</Button>
                    </div>
                  ))}
                </div>
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
            {mockQuestions.map((q) => (
              <Card key={q.id} hover className="cursor-pointer">
                <CardContent>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{q.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-300">{q.category}</span>
                    <span>{q.answers} answers</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div>
            <Card>
              <CardHeader title="Top Contributors" />
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Expert1', answers: 150 },
                    { name: 'Expert2', answers: 120 },
                    { name: 'Expert3', answers: 95 },
                  ].map((u, i) => (
                    <div key={u.name} className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-xs font-bold text-primary-600 dark:text-primary-400">
                        {i + 1}
                      </span>
                      <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{u.name}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{u.answers}</span>
                    </div>
                  ))}
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

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Web Dev India', members: 1240, category: 'Technology', color: 'bg-blue-500' },
              { name: 'Campus Placements 2025', members: 3800, category: 'Career', color: 'bg-green-500' },
              { name: 'Data Science Hub', members: 870, category: 'Technology', color: 'bg-purple-500' },
              { name: 'Startup Founders', members: 420, category: 'Entrepreneurship', color: 'bg-orange-500' },
              { name: 'Design & UI/UX', members: 650, category: 'Design', color: 'bg-pink-500' },
              { name: 'Open Source Contributors', members: 310, category: 'Technology', color: 'bg-teal-500' },
            ].map((group) => (
              <Card key={group.name} hover className="cursor-pointer">
                <CardContent>
                  <div className={`w-10 h-10 rounded-xl ${group.color} flex items-center justify-center mb-3`}>
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{group.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{group.category}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{group.members.toLocaleString()} members</span>
                    <Button variant="ghost" size="sm">Join</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
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
