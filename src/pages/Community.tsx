import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { cn } from '@/lib/utils';
import { Users, MessageCircle, ThumbsUp, Share2, MapPin, Clock, Send, Image, Plus, TrendingUp, AlertTriangle, Leaf, User } from 'lucide-react';

interface Post {
  id: string;
  author: string;
  authorLocation: string;
  avatarColor: string;
  timeAgo: string;
  contentEn: string;
  contentTa: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  category: 'question' | 'tip' | 'alert' | 'success';
}

interface LocalAlert {
  id: string;
  type: 'pest' | 'weather' | 'market';
  messageEn: string;
  messageTa: string;
  district: string;
  timeAgo: string;
}

const defaultPosts: Post[] = [
  {
    id: '1',
    author: 'Muthu Kumar',
    authorLocation: 'Thanjavur',
    avatarColor: 'bg-primary',
    timeAgo: '2h',
    contentEn: 'Just harvested my Samba paddy! Got 28 quintals per acre this season. Applied neem cake during flowering which helped control BPH. Happy to share my experience! 🌾',
    contentTa: 'என் சம்பா நெல் அறுவடை முடிந்தது! இந்த பருவத்தில் ஏக்கருக்கு 28 குவிண்டால் கிடைத்தது. பூக்கும் நேரத்தில் வேப்பம் பிண்ணாக்கு போட்டதால் BPH கட்டுப்பாடு நன்றாக இருந்தது. என் அனுபவத்தை பகிர்ந்துகொள்ள மகிழ்ச்சி! 🌾',
    likes: 45,
    comments: 2,
    category: 'success'
  },
  {
    id: '2',
    author: 'Lakshmi Devi',
    authorLocation: 'Coimbatore',
    avatarColor: 'bg-sky',
    timeAgo: '4h',
    contentEn: 'Can anyone help? My tomato leaves are turning yellow with brown spots. Is this a disease? Attached photos for reference. Need urgent help! 🍅',
    contentTa: 'யாராவது உதவ முடியுமா? என் தக்காளி இலைகள் பழுப்பு புள்ளிகளுடன் மஞ்சளாக மாறுகின்றன. இது நோயா? குறிப்புக்காக படங்கள் இணைக்கப்பட்டுள்ளன. அவசர உதவி தேவை! 🍅',
    likes: 23,
    comments: 1,
    category: 'question'
  },
  {
    id: '3',
    author: 'Senthil Raja',
    authorLocation: 'Madurai',
    avatarColor: 'bg-warning',
    timeAgo: '6h',
    contentEn: 'Tip: For cotton farmers - installing yellow sticky traps at 25/acre helps reduce whitefly population by 40%. Cost-effective and chemical-free! 💡',
    contentTa: 'குறிப்பு: பருத்தி விவசாயிகளுக்கு - ஏக்கருக்கு 25 மஞ்சள் ஒட்டும் பொறிகளை நிறுவினால் வெள்ளை ஈ எண்ணிக்கையை 40% குறைக்கும். செலவு குறைவு மற்றும் இரசாயனம் இல்லாதது! 💡',
    likes: 67,
    comments: 0,
    category: 'tip'
  },
  {
    id: '4',
    author: 'Kavitha',
    authorLocation: 'Tiruchirappalli',
    avatarColor: 'bg-danger',
    timeAgo: '8h',
    contentEn: '⚠️ Alert: Brown planthopper infestation reported in Cauvery delta region. Farmers please check your paddy fields and take preventive measures immediately!',
    contentTa: '⚠️ எச்சரிக்கை: காவிரி டெல்டா பகுதியில் பழுப்பு தாவர நத்தை தாக்குதல் அறிவிக்கப்பட்டுள்ளது. விவசாயிகள் உங்கள் நெல் வயல்களை சரிபார்த்து உடனடியாக தடுப்பு நடவடிக்கைகள் எடுக்கவும்!',
    likes: 89,
    comments: 0,
    category: 'alert'
  },
  {
    id: '5',
    author: 'Rajan',
    authorLocation: 'Salem',
    avatarColor: 'bg-harvest',
    timeAgo: '12h',
    contentEn: 'Got ₹6500/quintal for my groundnut today at the Regulated Market! Prices are good this week. If you have stock, consider selling now. 📈',
    contentTa: 'இன்று ஒழுங்குபடுத்தப்பட்ட சந்தையில் என் நிலக்கடலைக்கு குவிண்டாலுக்கு ₹6500 கிடைத்தது! இந்த வாரம் விலை நன்றாக உள்ளது. உங்களிடம் கையிருப்பு இருந்தால், இப்போது விற்க பரிசீலிக்கவும். 📈',
    likes: 34,
    comments: 0,
    category: 'success'
  }
];

const Community: React.FC = () => {
  const { isTamil, language } = useLanguage();
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'feed' | 'alerts' | 'nearby'>('feed');
  const [newPost, setNewPost] = useState('');
  const [postCategory, setPostCategory] = useState<Post['category']>('question');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  
  // Comments thread state
  const [expandedCommentsId, setExpandedCommentsId] = useState<string | null>(null);
  const [postComments, setPostComments] = useState<Record<string, { id: string; author: string; text: string; date: string }[]>>({
    '1': [
      { id: 'c1', author: 'Senthil Raja', text: 'Great harvest brother! What seeds did you use?', date: '1h ago' },
      { id: 'c2', author: 'Muthu Kumar', text: 'Thank you! Used traditional Samba seeds from government depot.', date: '30m ago' }
    ],
    '2': [
      { id: 'c3', author: 'Kavitha', text: 'Looks like early blight. Check Crop Doctor tab!', date: '3h ago' }
    ]
  });
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('id, content, image_url, category, created_at, user_id, profiles:user_id(name, district)')
          .order('created_at', { ascending: false })
          .limit(20);

        if (!error && data && data.length > 0) {
          const mappedPosts: Post[] = data.map((p: any) => ({
            id: p.id,
            author: p.profiles?.name || 'Farmer',
            authorLocation: p.profiles?.district || 'Tamil Nadu',
            avatarColor: 'bg-primary',
            timeAgo: 'Recently',
            contentEn: p.content,
            contentTa: p.content,
            imageUrl: p.image_url,
            likes: 0,
            comments: 0,
            category: (p.category as Post['category']) || 'question'
          }));
          setPosts(mappedPosts);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Posts fetch fallback:', err);
      }

      setPosts(defaultPosts);
      setLoading(false);
    };

    fetchPosts();
  }, []);

  const handlePostSubmit = async () => {
    if (!newPost.trim()) return;

    const postId = Date.now().toString();
    const authorName = profile?.name || (isTamil ? 'நீங்கள்' : 'You');
    const authorDistrict = profile?.district || (isTamil ? 'உள்ளூர்' : 'Local District');

    const post: Post = {
      id: postId,
      author: authorName,
      authorLocation: authorDistrict,
      avatarColor: 'bg-primary',
      timeAgo: 'Just now',
      contentEn: newPost,
      contentTa: newPost,
      likes: 0,
      comments: 0,
      category: postCategory
    };

    setPosts([post, ...posts]);
    setPostComments(prev => ({ ...prev, [postId]: [] }));
    const postContent = newPost;
    setNewPost('');

    if (user) {
      try {
        await supabase.from('posts').insert({
          user_id: user.id,
          content: postContent,
          category: postCategory,
          district: profile?.district || 'Tamil Nadu',
        });
      } catch (err) {
        console.warn('Post save error:', err);
      }
    }
  };

  const handleLike = async (postId: string) => {
    const isLiked = likedPosts.includes(postId);
    if (isLiked) {
      setLikedPosts(likedPosts.filter(id => id !== postId));
      setPosts(posts.map(p => p.id === postId ? { ...p, likes: Math.max(0, p.likes - 1) } : p));
      if (user && postId.length > 20) {
        await supabase.from('likes').delete().match({ post_id: postId, user_id: user.id });
      }
    } else {
      setLikedPosts([...likedPosts, postId]);
      setPosts(posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
      if (user && postId.length > 20) {
        await supabase.from('likes').insert({ post_id: postId, user_id: user.id });
      }
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!commentText.trim()) return;
    
    const newComment = {
      id: Date.now().toString(),
      author: profile?.name || (isTamil ? 'நீங்கள்' : 'You'),
      text: commentText,
      date: 'Just now'
    };

    setPostComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment]
    }));

    setPosts(posts.map(p => p.id === postId ? { ...p, comments: p.comments + 1 } : p));
    const savedText = commentText;
    setCommentText('');

    if (user && postId.length > 20) {
      try {
        await supabase.from('comments').insert({
          post_id: postId,
          user_id: user.id,
          content: savedText,
        });
      } catch (err) {
        console.warn('Comment save error:', err);
      }
    }
  };

  const localAlerts: LocalAlert[] = [
    {
      id: '1',
      type: 'pest',
      messageEn: 'Aphid attack reported on cotton crops',
      messageTa: 'பருத்தி பயிர்களில் அசுவினி தாக்குதல் அறிவிக்கப்பட்டுள்ளது',
      district: 'Erode',
      timeAgo: '1h'
    },
    {
      id: '2',
      type: 'weather',
      messageEn: 'Heavy rain expected in next 24 hours',
      messageTa: 'அடுத்த 24 மணி நேரத்தில் கனமழை எதிர்பார்க்கப்படுகிறது',
      district: 'Chennai',
      timeAgo: '3h'
    },
    {
      id: '3',
      type: 'market',
      messageEn: 'Tomato prices dropped by 15% this week',
      messageTa: 'இந்த வாரம் தக்காளி விலை 15% குறைந்துள்ளது',
      district: 'Krishnagiri',
      timeAgo: '5h'
    }
  ];

  const getCategoryIcon = (category: Post['category']) => {
    switch (category) {
      case 'question': return <MessageCircle className="w-4 h-4" />;
      case 'tip': return <Leaf className="w-4 h-4" />;
      case 'alert': return <AlertTriangle className="w-4 h-4" />;
      case 'success': return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: Post['category']) => {
    switch (category) {
      case 'question': return 'bg-sky-light text-sky';
      case 'tip': return 'bg-success-light text-success';
      case 'alert': return 'bg-danger-light text-danger';
      case 'success': return 'bg-harvest-light text-harvest';
    }
  };

  const getCategoryLabel = (category: Post['category']) => {
    const labels = {
      question: { en: 'Question', ta: 'கேள்வி' },
      tip: { en: 'Tip', ta: 'குறிப்பு' },
      alert: { en: 'Alert', ta: 'எச்சரிக்கை' },
      success: { en: 'Success', ta: 'வெற்றி' }
    };
    return language === 'ta' ? labels[category].ta : labels[category].en;
  };

  const getAlertIcon = (type: LocalAlert['type']) => {
    switch (type) {
      case 'pest': return <AlertTriangle className="w-4 h-4 text-danger" />;
      case 'weather': return <AlertTriangle className="w-4 h-4 text-sky" />;
      case 'market': return <TrendingUp className="w-4 h-4 text-warning" />;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-5 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className={cn('text-2xl font-bold text-foreground font-heading', isTamil && 'font-tamil')}>
            {isTamil ? 'விவசாயிகள் சமூகம்' : 'Farmer Community'}
          </h1>
          <p className={cn('text-sm text-muted-foreground mt-1', isTamil && 'font-tamil')}>
            {isTamil ? 'உள்ளூர் விவசாயிகளுடன் இணையுங்கள், அனுபவங்களைப் பகிரவும்' : 'Connect with local farmers, share experiences'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-muted rounded-xl p-1">
          {[
            { key: 'feed', en: 'Feed', ta: 'ஊட்டம்' },
            { key: 'alerts', en: 'Local Alerts', ta: 'உள்ளூர் எச்சரிக்கைகள்' },
            { key: 'nearby', en: 'Nearby', ta: 'அருகில்' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={cn(
                'flex-1 py-2 rounded-lg text-sm font-medium transition-all',
                activeTab === tab.key
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground',
                isTamil && 'font-tamil'
              )}
            >
              {language === 'ta' ? tab.ta : tab.en}
            </button>
          ))}
        </div>

        {/* Create Post */}
        <div className="bg-card rounded-2xl p-4 border border-border shadow-card space-y-3">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
              U
            </div>
            <div className="flex-1">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder={isTamil ? 'உங்கள் அனுபவத்தைப் பகிரவும்...' : 'Share your experience...'}
                className={cn(
                  'w-full resize-none bg-transparent border-none focus:outline-none text-sm text-foreground',
                  isTamil && 'font-tamil'
                )}
                rows={2}
              />
              
              {/* Category tags selector for new post */}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="text-[10px] text-muted-foreground font-semibold uppercase">
                  {isTamil ? 'வகை:' : 'Tag:'}
                </span>
                {(['question', 'tip', 'alert', 'success'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setPostCategory(cat)}
                    className={cn(
                      'text-xs px-2.5 py-1 rounded-full border transition-all font-medium',
                      postCategory === cat 
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border text-muted-foreground hover:bg-muted'
                    )}
                  >
                    {getCategoryLabel(cat)}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <div className="flex gap-2">
                  <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                    <Image className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <button
                  onClick={handlePostSubmit}
                  disabled={!newPost.trim()}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium transition-opacity',
                    !newPost.trim() && 'opacity-50 cursor-not-allowed',
                    isTamil && 'font-tamil'
                  )}>
                  <Send className="w-4 h-4" />
                  {isTamil ? 'பகிர்' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feed Tab */}
        {activeTab === 'feed' && (
          <div className="space-y-4">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-2xl p-4 border border-border shadow-card space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
                      <div className="h-3 w-1/4 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-muted animate-pulse rounded" />
                    <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              ))
            ) : (
              posts.map((post) => {
                const commentsList = postComments[post.id] || [];
                const isCommentsOpen = expandedCommentsId === post.id;
                const userHasLiked = likedPosts.includes(post.id);

                return (
                  <div key={post.id} className="bg-card rounded-2xl p-4 border border-border shadow-card animate-slide-up space-y-3">
                    {/* Post Header */}
                    <div className="flex items-start gap-3">
                      <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-white font-bold', post.avatarColor)}>
                        {post.author.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-foreground">{post.author}</span>
                          <span className={cn('text-xs px-2 py-0.5 rounded-full flex items-center gap-1 font-medium', getCategoryColor(post.category))}>
                            {getCategoryIcon(post.category)}
                            {getCategoryLabel(post.category)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <MapPin className="w-3 h-3" />
                          <span>{post.authorLocation}</span>
                          <span>•</span>
                          <Clock className="w-3 h-3" />
                          <span>{post.timeAgo}</span>
                        </div>
                      </div>
                    </div>

                    {/* Post Content */}
                    <p className={cn('text-sm text-foreground leading-relaxed', isTamil && 'font-tamil')}>
                      {language === 'ta' ? post.contentTa : post.contentEn}
                    </p>

                    {/* Post Actions */}
                    <div className="flex items-center gap-4 pt-2 border-t border-border">
                      <button 
                        onClick={() => handleLike(post.id)}
                        className={cn(
                          'flex items-center gap-2 transition-colors text-xs font-semibold py-1 px-2 rounded-lg hover:bg-muted',
                          userHasLiked ? 'text-primary' : 'text-muted-foreground'
                        )}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>{post.likes}</span>
                      </button>
                      <button 
                        onClick={() => setExpandedCommentsId(isCommentsOpen ? null : post.id)}
                        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-xs font-semibold py-1 px-2 rounded-lg hover:bg-muted"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.comments}</span>
                      </button>
                      <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors ml-auto p-1 hover:bg-muted rounded-lg">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Comments Thread Section */}
                    {isCommentsOpen && (
                      <div className="pt-3 border-t border-border space-y-3 animate-fade-in">
                        {/* Write Comment Box */}
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder={isTamil ? 'பதிலை எழுதுங்கள்...' : 'Add a reply...'}
                            className="flex-1 px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none"
                          />
                          <button 
                            onClick={() => handleAddComment(post.id)}
                            className="bg-primary text-primary-foreground px-3 rounded-xl text-xs font-semibold hover:opacity-90"
                          >
                            {isTamil ? 'அனுப்பு' : 'Send'}
                          </button>
                        </div>

                        {/* List comments */}
                        {commentsList.length > 0 ? (
                          <div className="space-y-2 pt-1">
                            {commentsList.map((c) => (
                              <div key={c.id} className="bg-muted/50 p-2.5 rounded-xl text-xs space-y-1">
                                <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold">
                                  <span>{c.author}</span>
                                  <span>{c.date}</span>
                                </div>
                                <p className="text-foreground">{c.text}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-muted-foreground text-center py-1">
                            {isTamil ? 'கருத்துக்கள் ஏதுமில்லை. முதல் கருத்தை எழுதுங்கள்!' : 'No replies yet. Be the first to comment!'}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Local Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-3">
            {localAlerts.map((alert) => (
              <div key={alert.id} className="bg-card rounded-xl p-4 border border-border shadow-card flex items-start gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1">
                  <p className={cn('text-sm text-foreground', isTamil && 'font-tamil')}>
                    {language === 'ta' ? alert.messageTa : alert.messageEn}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{alert.district}</span>
                    <span>•</span>
                    <span>{alert.timeAgo}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Nearby Tab */}
        {activeTab === 'nearby' && (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className={cn('text-sm text-muted-foreground', isTamil && 'font-tamil')}>
                {isTamil ? 'உங்கள் அருகிலுள்ள விவசாயிகளைக் கண்டறிய இருப்பிடத்தை அனுமதிக்கவும்' : 'Allow location to find farmers near you'}
              </p>
              <button className={cn(
                'mt-3 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium',
                isTamil && 'font-tamil'
              )}>
                {isTamil ? 'இருப்பிடத்தை அனுமதி' : 'Enable Location'}
              </button>
            </div>

            {/* Sample Nearby Farmers */}
            <div className="space-y-3">
              {[
                { name: 'Ravi Kumar', distance: '2 km', crops: 'Paddy, Sugarcane' },
                { name: 'Selvi', distance: '3.5 km', crops: 'Cotton, Groundnut' },
                { name: 'Mani', distance: '5 km', crops: 'Vegetables, Fruits' }
              ].map((farmer, idx) => (
                <div key={idx} className="bg-card rounded-xl p-4 border border-border flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{farmer.name}</p>
                    <p className="text-xs text-muted-foreground">{farmer.crops}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-primary font-medium">{farmer.distance}</p>
                    <button
                      onClick={() => alert(isTamil ? 'இணைப்பு கோரிக்கை அனுப்பப்பட்டது!' : 'Connection request sent!')}
                      className={cn(
                        'text-xs text-muted-foreground hover:text-primary',
                        isTamil && 'font-tamil'
                      )}>
                      {isTamil ? 'இணைக்க' : 'Connect'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Community;
