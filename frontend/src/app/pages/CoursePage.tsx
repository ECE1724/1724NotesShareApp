import { useParams, useNavigate, useLocation } from 'react-router';
import { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { API_BASE } from '../config';

type FileItem = {
  id: number;
  courseId: number;
  ownerId: number;
  title: string;
  fileUrl: string;
  createdAt?: string;
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

  useEffect(() => {
    if (!courseId) return;
    let mounted = true;
    async function loadFiles(){
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/files/course/${courseId}`);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    setSelectedFile(f ?? null);
  };

  const handleUpload = async () => {
    if (!selectedFile || !courseId) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', selectedFile);
      fd.append('courseId', String(courseId));
      // ownerId: temporary placeholder (should come from auth)
      fd.append('ownerId', '1');

      const res = await fetch(`${API_BASE}/files`, { method: 'POST', body: fd });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error || 'Upload failed');
      }
      // refresh
      setSelectedFile(null);
      const created = await res.json();
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
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">Back</Button>
        <h1 className="text-2xl text-[#002855] mb-2">{courseCode} Documents</h1>

        {!courseId && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">Course ID missing — this view expects navigation from the dashboard. If you navigated directly, provide a course id in state.</div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload new file</label>
          <div className="flex items-center gap-3">
            <input type="file" onChange={handleFileChange} />
            <Button onClick={handleUpload} disabled={!selectedFile || uploading} className="bg-[#0066CC] text-white">
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
              <div key={f.id} className="bg-white border rounded-lg p-4">
                <h3 className="text-[#002855]">{f.title}</h3>
                <p className="text-sm text-gray-500">Uploaded by {f.ownerId}</p>
                <div className="mt-4 flex items-center justify-between">
                  <a href={f.fileUrl} target="_blank" rel="noreferrer">
                    <Button>Open</Button>
                  </a>
                  <Button onClick={() => navigate(`/document/${courseCode}/${f.id}`)}>Annotate</Button>
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
