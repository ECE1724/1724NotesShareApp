import { useState, useEffect } from 'react';
import { ArrowLeft, Download, Share2, MessageSquare, Send } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { ScrollArea } from '../components/ui/scroll-area';
import { comments } from '../data/mockData';
import { API_BASE } from '../config';

export function DocumentViewer() {
  const navigate = useNavigate();
  const { courseCode, documentId } = useParams();
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch courseId from courseCode when component mounts
  useEffect(() => {
    if (!courseCode) {
      setLoading(false);
      return;
    }
    let mounted = true;
    async function fetchCourseId() {
      try {
        const res = await fetch(`${API_BASE}/courses/code/${courseCode}`);
        if (!res.ok) throw new Error('Failed to fetch course');
        const data = await res.json();
        if (mounted) {
          setCourseId(data?.id || null);
        }
      } catch (e) {
        console.error('Error fetching course by code:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchCourseId();
    return () => { mounted = false };
  }, [courseCode]);

  const handleSendComment = () => {
    if (newComment.trim()) {
      // In a real app, this would send to backend
      console.log('Sending comment:', newComment);
      setNewComment('');
      setReplyTo(null);
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Main Document Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-[#002855]"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-[#002855]">{courseCode}</h2>
                  <Badge 
                    className="bg-blue-50 text-[#0066CC]"
                    style={{ borderRadius: '8px' }}
                  >
                    Calculus
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">Lecture 5 - Limits and Continuity</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                style={{ borderRadius: '8px' }}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                style={{ borderRadius: '8px' }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </header>

        {/* PDF Viewer Area */}
        <div className="flex-1 overflow-auto bg-gray-50 p-8">
          <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg p-8" style={{ borderRadius: '8px' }}>
            {/* Mock PDF Content with Yellow Highlights */}
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-[#002855] mb-2">Lecture 5: Limits and Continuity</h1>
                <p className="text-gray-600">MAT137 - March 10, 2026</p>
              </div>

              <section className="space-y-4">
                <h2 className="text-[#002855]">1. Introduction to Limits</h2>
                <p className="text-gray-700 leading-relaxed">
                  In calculus, the concept of a limit is fundamental to understanding derivatives and integrals. 
                  <span className="bg-yellow-200 px-1"> A limit describes the value that a function approaches as the input approaches some value.</span>
                </p>

                <div className="bg-gray-50 p-4 rounded-lg my-4" style={{ borderRadius: '8px' }}>
                  <p className="text-sm text-gray-600 mb-2">Definition 1.1</p>
                  <p className="text-gray-800">
                    <span className="bg-yellow-200 px-1">We say that lim(x→a) f(x) = L if for every ε &gt; 0, there exists δ &gt; 0 such that 
                    if 0 &lt; |x - a| &lt; δ, then |f(x) - L| &lt; ε.</span>
                  </p>
                </div>

                <p className="text-gray-700 leading-relaxed">
                  This is known as the epsilon-delta definition of a limit. While it may seem abstract at first, 
                  it provides a rigorous foundation for calculus.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-[#002855]">2. Properties of Limits</h2>
                <p className="text-gray-700 leading-relaxed">
                  Limits have several important properties that make them easier to work with:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li><span className="bg-yellow-200 px-1">Sum Rule: lim(x→a) [f(x) + g(x)] = lim(x→a) f(x) + lim(x→a) g(x)</span></li>
                  <li>Product Rule: lim(x→a) [f(x) · g(x)] = lim(x→a) f(x) · lim(x→a) g(x)</li>
                  <li>Quotient Rule: lim(x→a) [f(x) / g(x)] = lim(x→a) f(x) / lim(x→a) g(x), provided lim(x→a) g(x) ≠ 0</li>
                </ul>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-[#002855]">3. Continuity</h2>
                <p className="text-gray-700 leading-relaxed">
                  A function f is continuous at a point a if:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                  <li>f(a) is defined</li>
                  <li>lim(x→a) f(x) exists</li>
                  <li><span className="bg-yellow-200 px-1">lim(x→a) f(x) = f(a)</span></li>
                </ol>
                <p className="text-gray-700 leading-relaxed mt-4">
                  If any of these conditions fail, the function is discontinuous at that point.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-[#002855]">4. Examples</h2>
                <div className="bg-blue-50 p-6 rounded-lg" style={{ borderRadius: '8px' }}>
                  <p className="text-sm text-[#0066CC] mb-3">Example 1</p>
                  <p className="text-gray-800 mb-2">
                    Find lim(x→2) (x² - 4)/(x - 2)
                  </p>
                  <p className="text-gray-700 text-sm">
                    Solution: Factor the numerator: (x² - 4) = (x - 2)(x + 2)
                    <br />
                    Therefore: lim(x→2) (x - 2)(x + 2)/(x - 2) = lim(x→2) (x + 2) = 4
                  </p>
                </div>
              </section>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">End of Lecture 5</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Sidebar */}
      <aside className="w-96 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[#0066CC]" />
            <h3 className="text-[#002855]">Annotations</h3>
          </div>
          <p className="text-sm text-gray-600 mt-1">Threaded discussion</p>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-4" style={{ borderRadius: '8px' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#0066CC] flex items-center justify-center text-white text-sm">
                        {comment.author.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm text-[#002855]">{comment.author}</p>
                        <Badge 
                          variant={comment.role === 'Admin' ? 'default' : 'secondary'}
                          className={`text-xs ${
                            comment.role === 'Admin' 
                              ? 'bg-[#0066CC] text-white' 
                              : 'bg-gray-200 text-gray-700'
                          }`}
                          style={{ borderRadius: '8px' }}
                        >
                          {comment.role}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{comment.content}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">{comment.timestamp}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-[#0066CC] hover:bg-blue-50 h-auto py-1"
                      onClick={() => setReplyTo(comment.id)}
                    >
                      Reply
                    </Button>
                  </div>
                </div>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-8 space-y-3">
                    {comment.replies.map((reply) => (
                      <div 
                        key={reply.id} 
                        className="bg-white border border-gray-200 rounded-lg p-4"
                        style={{ borderRadius: '8px' }}
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs">
                            {reply.author.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-[#002855]">{reply.author}</p>
                              <Badge 
                                variant={reply.role === 'Admin' ? 'default' : 'secondary'}
                                className={`text-xs ${
                                  reply.role === 'Admin' 
                                    ? 'bg-[#0066CC] text-white' 
                                    : 'bg-gray-200 text-gray-700'
                                }`}
                                style={{ borderRadius: '8px' }}
                              >
                                {reply.role}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{reply.content}</p>
                        <p className="text-xs text-gray-500">{reply.timestamp}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Comment Input */}
        <div className="p-6 border-t border-gray-200">
          {replyTo && (
            <div className="mb-3 flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg" style={{ borderRadius: '8px' }}>
              <p className="text-sm text-[#0066CC]">Replying to comment</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyTo(null)}
                className="h-auto p-1 text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>
          )}
          <div className="flex gap-2">
            <Textarea
              placeholder="Add a comment or annotation..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px] resize-none border-gray-300"
              style={{ borderRadius: '8px' }}
            />
            <Button
              onClick={handleSendComment}
              disabled={!newComment.trim()}
              className="bg-[#0066CC] hover:bg-[#0052A3] text-white"
              style={{ borderRadius: '8px' }}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}
