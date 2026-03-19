import { useParams, useNavigate, useLocation } from 'react-router';
import { useEffect, useState, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { API_BASE, apiFetch } from '../config';
import { authClient } from '../../lib/auth-client';

type FileItem = {
  id: number;
  ownerId: string;
  courseId: number;
  title: string;
  fileUrl: string;
  createdAt?: string;
  owner?: { name: string; displayName?: string | null };
};

export function CoursePage(){
  const { courseCode } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const passedCourseId = (location.state as any)?.courseId;
  const [courseId, setCourseId] = useState<number | null>(passedCourseId ?? null);

  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // fetch real auth session
  const { data: sessionData } = authClient.useSession();
  const user = sessionData?.user;

  useEffect(() => {
    if (!courseId) return;
    let mounted = true;
    async function loadFiles(){
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch(`${API_BASE}/files/course/${courseId}`);
        if (!res.ok) throw new Error('Failed to load files');
        const data = await res.json();
        if (!mounted) return;
        // backend returns array directly or { files: [...] }
        const list: FileItem[] = Array.isArray(data) ? data : data.files || data;
        setFiles(list.map(f => ({ ...f, fileUrl: f.fileUrl }))); 
      } catch (e:any){
        setError(e.message || 'Error');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadFiles();
    return () => { mounted = false };
  }, [courseId]);

  // If courseId wasn't provided via navigation state, try fetching by courseCode
  useEffect(() => {
    let mounted = true;
    async function resolveCourseId() {
      if (courseId || !courseCode) return;
      try {
        // first try dedicated endpoint
        const res = await apiFetch(`${API_BASE}/courses/code/${encodeURIComponent(courseCode)}`);
        if (res.ok) {
          const data = await res.json();
          if (!mounted) return;
          if (data && data.id) {
            setCourseId(Number(data.id));
            return;
          }
        }

        // fallback: fetch departments and their courses (same approach as Dashboard)
        const depRes = await apiFetch(`${API_BASE}/departments`);
        const depsRaw = await depRes.json();
        const depsList = Array.isArray(depsRaw) ? depsRaw : (depsRaw.departments || []);
        for (const d of depsList) {
          const cl = await apiFetch(`${API_BASE}/courses/department/${d.id}`).then(r => r.json()).catch(() => null);
          const arr = Array.isArray(cl) ? cl : (cl?.courses || cl || []);
          const found = arr.find((c:any) => (c.courseCode || c.code || String(c.id)) === courseCode);
          if (found) {
            if (!mounted) return;
            setCourseId(Number(found.id));
            return;
          }
        }

        if (mounted) setError('Course not found');
      } catch (e:any) {
        console.error('Error resolving course id by code', e);
        if (mounted) setError(e.message || 'Error');
      }
    }
    resolveCourseId();
    return () => { mounted = false };
  }, [courseCode, courseId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (f && f.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      setSelectedFile(null);
      e.target.value = ''; // Reset input
      return;
    }
    setError(null);
    setSelectedFile(f ?? null);
  };

  const handleUpload = async () => {
    if (!selectedFile || !courseId) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', selectedFile);
      fd.append('courseId', String(courseId));
      // prefer the real user ID
      const ownerId = user?.id || 'seed-alice-001';
      fd.append('ownerId', String(ownerId));

      const res = await apiFetch(`${API_BASE}/files`, { method: 'POST', body: fd });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error || 'Upload failed');
      }
      // refresh
      setSelectedFile(null);
      const created = await res.json();
      // manually append owner relation so the UI can immediately display the uploader's name
      created.owner = { name: user?.name || user?.email || 'You' };
      setFiles(prev => [created, ...prev]);
    } catch (e:any){
      setError(e.message || 'Upload error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex h-screen bg-white">
      <aside className="w-64 bg-[#002855] text-white p-6">
        <h2 className="text-lg">CourseShare</h2>
        <p className="text-sm text-blue-200">University of Toronto</p>
      </aside>

      <main className="flex-1 p-8">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)} 
          className="mb-6 text-gray-500 hover:text-[#002855] hover:bg-gray-100 px-3 py-2 transition-colors"
          style={{ borderRadius: '8px' }}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>
        <h1 className="text-2xl font-semibold text-[#002855] mb-2">{courseCode} Documents</h1>

        {!courseId && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">Course ID missing — this view expects navigation from the dashboard. If you navigated directly, provide a course id in state.</div>
        )}

        <div className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-xl" style={{ borderRadius: '12px' }}>
          <h2 className="text-lg font-medium text-[#002855] mb-4">Upload new material</h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 w-full bg-white border border-gray-300 rounded-lg px-4 py-2 flex items-center justify-between" style={{ borderRadius: '8px' }}>
              <span className="text-sm text-gray-500 truncate max-w-[200px] sm:max-w-xs">{selectedFile ? selectedFile.name : 'No file chosen...'}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="ml-2 text-[#0066CC] border-blue-200 hover:bg-blue-50 relative bottom-0"
              >
                Browse
              </Button>
            </div>
            <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
            <Button
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
              className="bg-[#0066CC] hover:bg-[#0052A3] text-white w-full sm:w-auto px-6 h-[40px]"
              style={{ borderRadius: '8px' }}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>

        {loading ? (
          <p>Loading files...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map(f => (
              <div key={f.id} className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-xl p-5 flex flex-col justify-between" style={{ borderRadius: '12px' }}>
                <div>
                  <h3 className="text-lg font-medium text-[#002855] hover:text-[#0066CC] cursor-pointer mb-2 line-clamp-2"
                      onClick={() => navigate(`/course/${courseCode}/file/${f.id}`)}>
                    {f.title}
                  </h3>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[#0066CC] text-xs font-semibold">
                      {(f.owner?.name || f.owner?.displayName || String(f.ownerId)).charAt(0).toUpperCase()}
                    </div>
                    <p className="text-xs text-gray-500">
                      Uploaded by <span className="font-medium text-gray-700">{f.owner?.name || f.owner?.displayName || f.ownerId}</span>
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3 pt-4 border-t border-gray-100">
                  <Button 
                    className="flex-1 bg-gray-50 hover:bg-gray-100 text-[#002855] border border-gray-200"
                    style={{ borderRadius: '8px' }}
                    onClick={() => navigate(`/course/${courseCode}/file/${f.id}`)}>
                    View Note
                  </Button>
                  <a
                    className="flex-1"
                    href={f.fileUrl && (f.fileUrl.startsWith('http://') || f.fileUrl.startsWith('https://'))
                      ? f.fileUrl
                      : `https://ece1724-final-project.tor1.digitaloceanspaces.com/${f.fileUrl}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button variant="outline" className="w-full border-gray-200 text-[#0066CC] hover:bg-blue-50" style={{ borderRadius: '8px' }}>
                      Download
                    </Button>
                  </a>
                </div>
              </div>
            ))}
            {files.length === 0 && <p className="text-gray-500">No documents yet.</p>}
          </div>
        )}
      </main>
    </div>
  )
}
