import { useState, useEffect } from 'react';
import { ArrowLeft, Download, Share2, MessageSquare, Send } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { ScrollArea } from '../components/ui/scroll-area';
import { io } from 'socket.io-client';
import { AnnotationList } from '../components/AnnotationList';
import { API_BASE } from '../config';

export function DocumentViewer() {
  const navigate = useNavigate();
  const { courseCode, documentId } = useParams();
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [socket, setSocket] = useState<any | null>(null);
  const [annotations, setAnnotations] = useState<any[]>([]);

  useEffect(() => {
    // fetch initial annotations
    async function load(){
      const res = await fetch(`${API_BASE}/annotations?fileId=${documentId}`);
      const data = await res.json();
      setAnnotations(data.annotations || []);
    }
    load();

    const s = io((import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'));
    setSocket(s);
    s.emit('join-file', documentId);
    s.on('annotation:created', (a:any) => {
      setAnnotations(prev => [...prev, a]);
    });

    return () => {
      s.emit('leave-file', documentId);
      s.disconnect();
    }
  }, [documentId]);

  const handleSendComment = async () => {
    if (newComment.trim()) {
      // send to backend
      await fetch(`${API_BASE}/annotations`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ fileId: Number(documentId), authorId: 1, body: newComment, anchorJson: {} }) });
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
            <AnnotationList fileId={Number(documentId)} />
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
