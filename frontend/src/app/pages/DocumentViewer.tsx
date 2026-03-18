import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Download, MessageSquare, Send, Trash2, Highlighter } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { io, Socket } from 'socket.io-client';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { ScrollArea } from '../components/ui/scroll-area';
import { API_BASE, SPACES_BASE } from '../config';
import { authClient } from '../../lib/auth-client';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
const PDF_PAGE_WIDTH = 800;

type AnchorRect = { xPct: number; yPct: number; widthPct: number; heightPct: number };
type AnchorData = { page: number; text: string; rects: AnchorRect[] };

type AnnotationItem = {
  id: number;
  fileId: number;
  authorId: string;
  parentId: number | null;
  anchorJson: AnchorData | Record<string, never>;
  body: string;
  createdAt: string;
  updatedAt: string;
  author?: { name: string; displayName?: string | null };
};

type FileInfo = {
  id: number;
  courseId: number;
  ownerId: string;
  title: string;
  fileUrl: string;
};

function hasAnchor(a: AnnotationItem): a is AnnotationItem & { anchorJson: AnchorData } {
  const aj = a.anchorJson as any;
  return aj && typeof aj.page === 'number' && Array.isArray(aj.rects) && aj.rects.length > 0;
}

const HIGHLIGHT_COLORS = [
  'rgba(255, 213, 0, 0.35)',
  'rgba(0, 200, 120, 0.25)',
  'rgba(100, 149, 237, 0.25)',
  'rgba(255, 140, 0, 0.3)',
  'rgba(186, 85, 211, 0.25)',
];

function colorForAnnotation(id: number) {
  return HIGHLIGHT_COLORS[id % HIGHLIGHT_COLORS.length];
}

export function DocumentViewer() {
  const navigate = useNavigate();
  const { courseCode, fileId: fileIdParam } = useParams();
  const fileId = Number(fileIdParam);

  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [annotations, setAnnotations] = useState<AnnotationItem[]>([]);

  // fetch real auth session
  const { data: sessionData } = authClient.useSession();
  const user = sessionData?.user;
  const [loading, setLoading] = useState(true);
  const [numPages, setNumPages] = useState<number>(0);

  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [pendingAnchor, setPendingAnchor] = useState<AnchorData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [highlightedAnnId, setHighlightedAnnId] = useState<number | null>(null);

  const [selectionPopup, setSelectionPopup] = useState<{ x: number; y: number; anchor: AnchorData } | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  // ---- Data loading ----
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
        if (fileRes.ok) setFileInfo(await fileRes.json());
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

  // ---- Socket.IO ----
  useEffect(() => {
    if (!fileId) return;
    const socket = io(SOCKET_URL);
    socketRef.current = socket;
    socket.emit('join-file', fileId);
    socket.on('annotation:created', (annotation: AnnotationItem) => {
      setAnnotations(prev => prev.some(a => a.id === annotation.id) ? prev : [...prev, annotation]);
    });
    return () => {
      socket.emit('leave-file', fileId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [fileId]);

  // ---- Text selection handler ----
  // Uses document-level listener so it works regardless of when PDF pages load.
  useEffect(() => {
    function handleMouseUp() {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.rangeCount) return;

      const text = sel.toString().trim();
      if (!text) return;

      const range = sel.getRangeAt(0);
      const anchor = range.commonAncestorContainer;

      // Walk up from the selection to find which page wrapper it's in
      let node: Node | null = anchor;
      let pageEl: HTMLDivElement | null = null;
      let pageNum: number | null = null;
      while (node) {
        if (node instanceof HTMLElement && node.dataset.page) {
          pageNum = Number(node.dataset.page);
          pageEl = node as HTMLDivElement;
          break;
        }
        node = node.parentNode;
      }
      if (!pageNum || !pageEl) return;

      const pageRect = pageEl.getBoundingClientRect();
      const clientRects = range.getClientRects();
      const rects: AnchorRect[] = [];

      for (let i = 0; i < clientRects.length; i++) {
        const r = clientRects[i];
        if (r.width < 1 || r.height < 1) continue;
        rects.push({
          xPct: (r.left - pageRect.left) / pageRect.width,
          yPct: (r.top - pageRect.top) / pageRect.height,
          widthPct: r.width / pageRect.width,
          heightPct: r.height / pageRect.height,
        });
      }

      if (rects.length === 0) return;

      const anchorData: AnchorData = { page: pageNum, text, rects };

      // Position popup near the end of the selection, relative to viewport
      const lastRect = clientRects[clientRects.length - 1];
      setSelectionPopup({
        x: lastRect.right,
        y: lastRect.bottom + 8,
        anchor: anchorData,
      });
    }

    function handleMouseDown(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target.closest('[data-selection-popup]')) return;
      setSelectionPopup(null);
    }

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // ---- Helpers ----
  const topLevel = annotations.filter(a => !a.parentId);
  const repliesFor = (parentId: number) => annotations.filter(a => a.parentId === parentId);

  const startAnnotation = (anchor: AnchorData) => {
    setPendingAnchor(anchor);
    setReplyTo(null);
    setSelectionPopup(null);
    window.getSelection()?.removeAllRanges();
    setTimeout(() => commentInputRef.current?.focus(), 50);
  };

  const cancelAnchor = () => {
    setPendingAnchor(null);
  };

  const scrollToPage = (pageNum: number) => {
    const el = pageRefs.current.get(pageNum);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // ---- Send annotation ----
  const handleSendComment = async () => {
    if (!newComment.trim() || !fileId) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/annotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId,
          authorId: user?.id || 'seed-alice-001',
          parentId: replyTo,
          anchorJson: pendingAnchor || {},
          body: newComment.trim(),
        }),
      });
      if (!res.ok) throw new Error('Failed to create annotation');
      const created: AnnotationItem = await res.json();
      // append author so it displays correctly without reload
      created.author = { name: user?.name || user?.email || 'You' };
      setAnnotations(prev => prev.some(a => a.id === created.id) ? prev : [...prev, created]);
      setNewComment('');
      setReplyTo(null);
      setPendingAnchor(null);
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

  // ---- Highlight overlays for a given page ----
  const renderHighlights = (pageNum: number) => {
    const pageAnns = annotations.filter(a => hasAnchor(a) && a.anchorJson.page === pageNum);
    if (pageAnns.length === 0) return null;

    return (
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
        {pageAnns.map(ann => {
          const anchor = ann.anchorJson as AnchorData;
          const isActive = highlightedAnnId === ann.id;
          return anchor.rects.map((r, ri) => (
            <div
              key={`${ann.id}-${ri}`}
              className="absolute pointer-events-auto cursor-pointer transition-all"
              style={{
                left: `${r.xPct * 100}%`,
                top: `${r.yPct * 100}%`,
                width: `${r.widthPct * 100}%`,
                height: `${r.heightPct * 100}%`,
                backgroundColor: isActive ? 'rgba(255, 213, 0, 0.55)' : colorForAnnotation(ann.id),
                borderBottom: isActive ? '2px solid #f59e0b' : 'none',
              }}
              onClick={() => setHighlightedAnnId(ann.id)}
              title={ann.body}
            />
          ));
        })}
      </div>
    );
  };

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
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-gray-600 hover:text-[#002855]">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h2 className="text-[#002855]">{fileInfo?.title || 'Loading...'}</h2>
                <p className="text-sm text-gray-600">{courseCode}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-400 mr-2">Select text on PDF to annotate</div>
              {pdfDirectUrl && (
                <a href={pdfDirectUrl} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50" style={{ borderRadius: '8px' }}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </a>
              )}
            </div>
          </div>
        </header>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-auto bg-gray-50 p-8 relative">
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
                  <div
                    key={i + 1}
                    className="relative mb-4"
                    ref={el => { if (el) pageRefs.current.set(i + 1, el); }}
                    data-page={i + 1}
                  >
                    <Page
                      pageNumber={i + 1}
                      width={PDF_PAGE_WIDTH}
                      className="shadow-sm rounded-lg"
                    />
                    {renderHighlights(i + 1)}
                  </div>
                ))}
              </Document>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">No document available.</div>
          )}

          {/* Selection popup — "Annotate" button near selected text (fixed to viewport) */}
          {selectionPopup && (
            <div
              data-selection-popup
              className="fixed z-50 bg-[#002855] text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 cursor-pointer hover:bg-[#003a75] transition-colors"
              style={{ left: selectionPopup.x, top: selectionPopup.y }}
              onClick={() => startAnnotation(selectionPopup.anchor)}
            >
              <Highlighter className="h-4 w-4" />
              <span className="text-sm font-medium">Annotate</span>
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
              <p className="text-sm text-gray-400 text-center py-8">No annotations yet. Select text on the PDF to start!</p>
            )}
            {topLevel.map((ann) => {
              const anchored = hasAnchor(ann);
              const isActive = highlightedAnnId === ann.id;
              return (
                <div key={ann.id} className="space-y-2">
                  <div
                    className={`rounded-lg p-4 transition-all cursor-pointer ${isActive ? 'bg-yellow-50 ring-2 ring-yellow-300' : 'bg-gray-50 hover:bg-gray-100'}`}
                    style={{ borderRadius: '8px' }}
                    onClick={() => {
                      setHighlightedAnnId(isActive ? null : ann.id);
                      if (anchored && !isActive) scrollToPage(ann.anchorJson.page);
                    }}
                  >
                    {/* Anchor badge */}
                    {anchored && (
                      <div className="mb-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded inline-flex items-center gap-1">
                        <Highlighter className="h-3 w-3" />
                        p.{ann.anchorJson.page}: &ldquo;{ann.anchorJson.text.length > 60 ? ann.anchorJson.text.slice(0, 60) + '…' : ann.anchorJson.text}&rdquo;
                      </div>
                    )}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#0066CC] flex items-center justify-center text-white text-sm">
                          {(ann.author?.name || ann.author?.displayName || String(ann.authorId)).charAt(0).toUpperCase()}
                        </div>
                        <p className="text-sm font-medium text-[#002855]">{ann.author?.name || ann.author?.displayName || `User ${ann.authorId}`}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(ann.id); }} className="h-auto p-1 text-gray-400 hover:text-red-500">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{ann.body}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">{new Date(ann.createdAt).toLocaleString()}</p>
                      <Button variant="ghost" size="sm" className="text-xs text-[#0066CC] hover:bg-blue-50 h-auto py-1" onClick={(e) => { e.stopPropagation(); setReplyTo(ann.id); setPendingAnchor(null); setTimeout(() => commentInputRef.current?.focus(), 50); }}>
                        Reply
                      </Button>
                    </div>
                  </div>

                  {repliesFor(ann.id).map((reply) => (
                    <div key={reply.id} className="ml-8 bg-white border border-gray-200 rounded-lg p-3" style={{ borderRadius: '8px' }}>
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs">
                            {(reply.author?.name || reply.author?.displayName || String(reply.authorId)).charAt(0).toUpperCase()}
                          </div>
                          <p className="text-sm font-medium text-[#002855]">{reply.author?.name || reply.author?.displayName || `User ${reply.authorId}`}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(reply.id)} className="h-auto p-1 text-gray-400 hover:text-red-500">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-700 mb-1">{reply.body}</p>
                      <p className="text-xs text-gray-500">{new Date(reply.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Comment Input */}
        <div className="p-6 border-t border-gray-200">
          {pendingAnchor && (
            <div className="mb-3 bg-yellow-50 border border-yellow-200 px-3 py-2 rounded-lg" style={{ borderRadius: '8px' }}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1 text-sm text-yellow-800">
                  <Highlighter className="h-3 w-3" />
                  Annotating text on page {pendingAnchor.page}
                </div>
                <Button variant="ghost" size="sm" onClick={cancelAnchor} className="h-auto p-1 text-gray-500 hover:text-gray-700">✕</Button>
              </div>
              <p className="text-xs text-yellow-700 truncate">&ldquo;{pendingAnchor.text}&rdquo;</p>
            </div>
          )}
          {replyTo && !pendingAnchor && (
            <div className="mb-3 flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg" style={{ borderRadius: '8px' }}>
              <p className="text-sm text-[#0066CC]">Replying to annotation #{replyTo}</p>
              <Button variant="ghost" size="sm" onClick={() => setReplyTo(null)} className="h-auto p-1 text-gray-500 hover:text-gray-700">✕</Button>
            </div>
          )}
          <div className="flex gap-2">
            <Textarea
              ref={commentInputRef}
              placeholder={pendingAnchor ? 'Write your annotation...' : 'Add a comment or select text to annotate...'}
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
