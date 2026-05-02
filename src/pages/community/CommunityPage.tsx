import React, { useState } from 'react';
import { MessageSquare, Heart, MessageCircle, Share2, MoreHorizontal, Send, Image, Smile, UserPlus, Search } from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Input, Textarea } from '../../components/common';

const mockPosts = [
  {
    id: 1,
    author: 'John Doe',
    avatar: 'J',
    content: 'Just completed my first full-stack project! So excited to share it with you all. Thanks to STUNIVOZ community for all the support! 🎉',
    likes: 45,
    comments: 12,
    time: '2 hours ago',
    image: null,
  },
  {
    id: 2,
    author: 'Jane Smith',
    avatar: 'J',
    content: 'Tips for cracking coding interviews: Practice daily, understand fundamentals, and don\'t give up! 💪',
    likes: 78,
    comments: 24,
    time: '5 hours ago',
    image: null,
  },
  {
    id: 3,
    author: 'Mike Johnson',
    avatar: 'M',
    content: 'Looking for a study partner for web development. Anyone interested?',
    likes: 15,
    comments: 8,
    time: '1 day ago',
    image: null,
  },
];

const mockQuestions = [
  { id: 1, title: 'How to prepare for Amazon SDE interview?', answers: 5, category: 'Interview Prep' },
  { id: 2, title: 'Best resources to learn React in 2024?', answers: 12, category: 'Web Dev' },
  { id: 3, title: 'Is it too late to switch to tech?', answers: 8, category: 'Career' },
];

export const CommunityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'feed' | 'qna' | 'groups'>('feed');
  const [newPost, setNewPost] = useState('');
  const [posts] = useState(mockPosts);
  const [liked, setLiked] = useState<number[]>([]);

  const toggleLike = (id: number) => {
    if (liked.includes(id)) {
      setLiked(liked.filter(l => l !== id));
    } else {
      setLiked([...liked, id]);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Community</h1>
          <p className="text-gray-500">Connect with fellow students</p>
        </div>
        <Button variant="primary">
          <UserPlus className="w-4 h-4" />
          Find Mentor
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
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
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'feed' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Create Post */}
            <Card>
              <CardContent>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold">
                    Y
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
                      <Button variant="primary" size="sm">Post</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Posts Feed */}
            {posts.map((post) => (
              <Card key={post.id}>
                <CardContent>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold">
                      {post.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">{post.author}</h3>
                        <span className="text-sm text-gray-500">{post.time}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{post.content}</p>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-1 text-sm ${
                        liked.includes(post.id) ? 'text-red-500' : 'text-gray-500'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${liked.includes(post.id) ? 'fill-current' : ''}`} />
                      {post.likes + (liked.includes(post.id) ? 1 : 0)}
                    </button>
                    <button className="flex items-center gap-1 text-sm text-gray-500">
                      <MessageCircle className="w-4 h-4" />
                      {post.comments}
                    </button>
                    <button className="flex items-center gap-1 text-sm text-gray-500">
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader title="Popular Topics" />
              <CardContent>
                <div className="space-y-2">
                  {['Web Development', 'Data Science', 'Interview Prep', 'Career Advice', 'Projects'].map((topic) => (
                    <button key={topic} className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-600">
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
                  ].map((user) => (
                    <div key={user.name} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.role}</p>
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
                  <h3 className="font-semibold text-gray-900 mb-2">{q.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="px-2 py-1 bg-gray-100 rounded">{q.category}</span>
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
                      <span className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-xs font-bold text-primary-600">
                        {i + 1}
                      </span>
                      <span className="flex-1 text-sm">{u.name}</span>
                      <span className="text-sm text-gray-500">{u.answers}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'groups' && (
        <div className="text-center py-12">
          <UserPlus className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Join Groups</h3>
          <p className="text-gray-500 mb-4">Connect with students with similar interests</p>
          <Button variant="primary">Explore Groups</Button>
        </div>
      )}
    </div>
  );
};
