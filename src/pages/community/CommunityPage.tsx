import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Image, Smile, UserPlus, Search } from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Input, Textarea, EmptyState, Loading } from '../../components/common';
import { addDocument, updateDocument } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useCollection } from '../../hooks/useCollection';
import type { Post } from '../../types';

export const CommunityPage: React.FC = () => {
  const { user, profile } = useAuth();
  const posts = useCollection<Post>('posts');
  const questions = useCollection<{ id: string; title: string; category?: string; answers?: number }>('questions');
  const [activeTab, setActiveTab] = useState<'feed' | 'qna' | 'groups'>('feed');
  const [newPost, setNewPost] = useState('');
  const [questionSearch, setQuestionSearch] = useState('');
  const [posting, setPosting] = useState(false);

  const createPost = async () => {
    if (!user || !newPost.trim()) return;
    setPosting(true);
    await addDocument('posts', {
      user_id: user.uid,
      content: newPost.trim(),
      likes_count: 0,
      comments_count: 0,
      author_name: profile?.full_name || user.email || 'Student',
      created_at: new Date().toISOString()
    });
    setNewPost('');
    setPosting(false);
    posts.refresh();
  };

  const likePost = async (post: Post) => {
    await updateDocument('posts', post.id, { likes_count: (post.likes_count || 0) + 1 });
    posts.refresh();
  };

  const visibleQuestions = questions.data.filter((question) =>
    question.title.toLowerCase().includes(questionSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Community</h1>
          <p className="text-gray-500">Connect with real students and mentors.</p>
        </div>
        <Button variant="primary"><UserPlus className="w-4 h-4" /> Find Mentor</Button>
      </div>

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
              activeTab === tab.id ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
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
                  <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold">
                    {(profile?.full_name || user?.email || 'S').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <Textarea placeholder="Share something with the community..." value={newPost} onChange={(event) => setNewPost(event.target.value)} rows={2} />
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm"><Image className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm"><Smile className="w-4 h-4" /></Button>
                      </div>
                      <Button variant="primary" size="sm" loading={posting} onClick={createPost}>Post</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {posts.loading ? (
              <Loading text="Loading posts..." />
            ) : posts.data.length === 0 ? (
              <Card><EmptyState title="No posts yet" description="The first real community post will appear here after a student publishes it." /></Card>
            ) : (
              posts.data.map((post) => (
                <Card key={post.id}>
                  <CardContent>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold">
                        {(post.user?.full_name || post.user_id || 'S').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900">{post.user?.full_name || 'Student'}</h3>
                          <span className="text-sm text-gray-500">{post.created_at ? new Date(post.created_at).toLocaleString() : ''}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{post.content}</p>
                    <div className="flex items-center gap-4">
                      <button onClick={() => likePost(post)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500">
                        <Heart className="w-4 h-4" />
                        {post.likes_count || 0}
                      </button>
                      <button className="flex items-center gap-1 text-sm text-gray-500">
                        <MessageCircle className="w-4 h-4" />
                        {post.comments_count || 0}
                      </button>
                      <button className="flex items-center gap-1 text-sm text-gray-500">
                        <Share2 className="w-4 h-4" />
                        Share
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader title="Community Topics" />
              <CardContent>
                <EmptyState title="No topics yet" description="Topic documents can be added to power discovery." />
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'qna' && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <Input placeholder="Search questions..." value={questionSearch} onChange={(event) => setQuestionSearch(event.target.value)} icon={<Search className="w-5 h-5" />} />
            <Button variant="primary">Ask Question</Button>
          </div>
          {questions.loading ? (
            <Loading text="Loading questions..." />
          ) : visibleQuestions.length === 0 ? (
            <Card><EmptyState title="No questions yet" description="Questions will appear after students post them." /></Card>
          ) : (
            visibleQuestions.map((question) => (
              <Card key={question.id} hover>
                <CardContent>
                  <h3 className="font-semibold text-gray-900 mb-2">{question.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {question.category && <span className="px-2 py-1 bg-gray-100 rounded">{question.category}</span>}
                    <span>{question.answers || 0} answers</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'groups' && (
        <Card>
          <EmptyState
            icon={<UserPlus className="w-6 h-6" />}
            title="No groups yet"
            description="Group records can be added later for real student cohorts and communities."
          />
        </Card>
      )}
    </div>
  );
};
