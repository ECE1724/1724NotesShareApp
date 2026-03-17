import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Download, MessageSquare, Send, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { io, Socket } from 'socket.io-client';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { ScrollArea } from '../components/ui/scroll-area';
import { API_BASE, SPACES_BASE } from '../config';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

type AnnotationItem = {
  id: number;
  fileId: number;
  authorId: number;
  parentId: number | null;
  anchorJson: any;
  body: string;
  createdAt: string;
  updatedAt: string;
};

type FileInfo = {
  id: number;
  courseId: number;
  ownerId: number;
  title: string;
  fileUrl: string;
};

export function DocumentViewer() {
  const navigate = useNavigate();
  const { courseCode, fileId: fileIdParam } = useParams();
  const fileId = Number(fileIdParam);

  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [annotations, setAnnotations] = useState<AnnotationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [numPages, setNumPages] = useState<number>(0);

  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!fileId) return;
    let mounted = true;

    async function loadData() {
      try {
        const [fileRes, annRes] = await Promise.all([
          fetch(`${API_BASE}/files/${fileId}`),
          fetch(`${API_BASE}/annotations/file/${fileId}`),
        ]);

        if (!mounted) return;

        if (fileRes.ok) {
          const data = await fileRes.json();
          setFileInfo(data);
        }

        if (annRes.ok) {
          const data = await annRes.json();
          setAnnotations(Array.isArray(data) ? data : data.annotations || []);
        }
      } catch (e) {
        console.error('Error loading document data', e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();
    return () => { mounted = false };
  }, [fileId]);

  useEffect(() => {
    if (!fileId) return;

    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.emit('join-file', fileId);

    socket.on('annotation:created', (annotation: AnnotationItem) => {
      setAnnotations(prev => {
        if (prev.some(a => a.id === annotation.id)) return prev;
        return [...prev, annotation];
      });
    });

    return () => {
      socket.emit('leave-file', fileId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [fileId]);

  const topLevel = annotations.filter(a => !a.parentId);
  const repliesFor = (parentId: number) => annotations.filter(a => a.parentId === parentId);

  const handleSendComment = async () => {
    if (!newComment.trim() || !fileId) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/annotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId,
          authorId: 1,
          parentId: replyTo,
          anchorJson: {},
          body: newComment.trim(),
        }),
      });
      if (!res.ok) throw new Error('Failed to create annotation');
      const created: AnnotationItem = await res.json();
      setAnnotations(prev => {
        if (prev.some(a => a.id === created.id)) return prev;
        return [...prev, created];
      });
      setNewComment('');
      setReplyTo(null);
    } catch (e) {
      console.error('Error sending comment', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/annotations/${id}`, { method: 'DELETE' });
      if (res.ok || res.status === 204) {
        setAnnotations(prev => prev.filter(a => a.id !== id && a.parentId !== id));
      }
    } catch (e) {
      console.error('Error deleting annotation', e);
    }
  };

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
  const pdfProxyUrl = fileId ? `${BACKEND_URL}/api/files/${fileId}/proxy` : null;
  const pdfDirectUrl = fileInfo?.fileUrl
    ? (fileInfo.fileUrl.startsWith('http') ? fileInfo.fileUrl : `${SPACES_BASE}${fileInfo.fileUrl}`)
    : null;

  return (
    <div className="flex h-screen bg-white">
      {/* Main Document Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-[#002855]"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h2 className="text-[#002855]">{fileInfo?.title || 'Loading...'}</h2>
                <p className="text-sm text-gray-600">{courseCode}</p>
              </div>
            </div>
            {pdfDirectUrl && (
              <a href={pdfDirectUrl} target="_blank" rel="noreferrer">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  style={{ borderRadius: '8px' }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </a>
            )}
          </div>
        </header>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-auto bg-gray-50 p-8">
          {loading ? (
            <div className="flex items-center justify-center h-full text-gray-500">Loading document...</div>
          ) : pdfProxyUrl ? (
            <div className="max-w-4xl mx-auto">
              <Document
                file={pdfProxyUrl}
                onLoadSuccess={({ numPages: n }) => setNumPages(n)}
                loading={<div className="text-center text-gray-500 py-12">Loading PDF...</div>}
                error={
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">Could not render PDF in browser.</p>
                    {pdfDirectUrl && (
                      <a href={pdfDirectUrl} target="_blank" rel="noreferrer">
                        <Button className="bg-[#0066CC] text-white">Open PDF directly</Button>
                      </a>
                    )}
                  </div>
                }
              >
                {Array.from({ length: numPages }, (_, i) => (
                  <Page
                    key={i + 1}
                    pageNumber={i + 1}
                    width={800}
                    className="mb-4 shadow-sm rounded-lg overflow-hidden"
                  />
                ))}
              </Document>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No document available.
            </div>
          )}
        </div>
      </div>

      {/* Annotations Sidebar */}
      <aside className="w-96 bg-white border-l border-gray-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[#0066CC]" />
            <h3 className="text-[#002855]">Annotations</h3>
            <span className="text-xs text-gray-400 ml-auto">{annotations.length} total</span>
          </div>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            {topLevel.length === 0 && !loading && (
              <p className="text-sm text-gray-400 text-center py-8">No annotations yet. Be the first to comment!</p>
            )}
            {topLevel.map((ann) => (
              <div key={ann.id} className="space-y-2">
                {/* Top-level annotation */}
                <div className="bg-gray-50 rounded-lg p-4" style={{ borderRadius: '8px' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#0066CC] flex items-center justify-center text-white text-sm">
                        {String(ann.authorId).charAt(0)}
                      </div>
                      <p className="text-sm text-[#002855]">User {ann.authorId}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(ann.id)}
                      className="h-auto p-1 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{ann.body}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">{new Date(ann.createdAt).toLocaleString()}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-[#0066CC] hover:bg-blue-50 h-auto py-1"
                      onClick={() => setReplyTo(ann.id)}
                    >
                      Reply
                    </Button>
                  </div>
                </div>

                {/* Replies */}
                {repliesFor(ann.id).map((reply) => (
                  <div
                    key={reply.id}
                    className="ml-8 bg-white border border-gray-200 rounded-lg p-3"
                    style={{ borderRadius: '8px' }}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs">
                          {String(reply.authorId).charAt(0)}
                        </div>
                        <p className="text-sm text-[#002855]">User {reply.authorId}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(reply.id)}
                        className="h-auto p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-700 mb-1">{reply.body}</p>
                    <p className="text-xs text-gray-500">{new Date(reply.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Comment Input */}
        <div className="p-6 border-t border-gray-200">
          {replyTo && (
            <div className="mb-3 flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg" style={{ borderRadius: '8px' }}>
              <p className="text-sm text-[#0066CC]">Replying to annotation #{replyTo}</p>
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
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendComment();
                }
              }}
              className="min-h-[80px] resize-none border-gray-300"
              style={{ borderRadius: '8px' }}
            />
            <Button
              onClick={handleSendComment}
              disabled={!newComment.trim() || submitting}
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
