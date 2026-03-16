import { useEffect, useState } from 'react';
import { Upload, FileText, Search } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';

type Department = { id: number; name: string; code: string };
type Course = { id: number; code: string; name: string; department: string; documentsCount: number; color: string };

const API_BASE = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000') + '/api';

export function Dashboard() {
  const navigate = useNavigate();
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // upload modal state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadCourseId, setUploadCourseId] = useState<number | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // create dept/course state
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');
  const [creatingDept, setCreatingDept] = useState(false);

  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseDeptId, setNewCourseDeptId] = useState<number | null>(null);
  const [creatingCourse, setCreatingCourse] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const depRes = await fetch(`${API_BASE}/departments`);
        const depsRaw = await depRes.json();
        const depsList: Department[] = Array.isArray(depsRaw) ? depsRaw : (depsRaw.departments || []);
        if (!mounted) return;
        setDepartments(depsList);

        // fetch courses for all departments in parallel
        const courseLists = await Promise.all(depsList.map(d => fetch(`${API_BASE}/courses/department/${d.id}`).then(r => r.json())));
        // backend may return { courses: [...] } or an array
        const rawCourses: any[] = courseLists.flatMap((c:any) => Array.isArray(c) ? c : (c.courses || c));
        if (!mounted) return;
        // build department map
        const deptById = new Map<number,string>();
        for (const d of depsList) { deptById.set(Number(d.id), d.code); }

        const normalized: Course[] = rawCourses.map((c:any) => ({
          id: Number(c.id),
          code: c.courseCode || c.code || String(c.id),
          name: c.title || c.name || c.courseName || '',
          department: c.department || deptById.get(Number(c.departmentId)) || c.department || '',
          documentsCount: c.documentsCount || (c.filesCount || 0),
          color: c.color || '#0066CC',
        }));
        setCourses(normalized);
      } catch (e) {
        console.error('Error loading departments/courses', e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false };
  }, []);

  const filteredCourses = courses.filter((course) => {
    const matchesDepartment = !selectedDepartment || course.department === selectedDepartment;
    const code = (course.code ?? '').toString();
    const name = (course.name ?? '').toString();
    const q = (searchQuery ?? '').toString().toLowerCase();
    const matchesSearch = code.toLowerCase().includes(q) || name.toLowerCase().includes(q);
    return matchesDepartment && matchesSearch;
  });

  // upload handlers
  const openUploadForCourse = (courseId?: number) => {
    setUploadCourseId(courseId ?? null);
    setUploadError(null);
    setUploadSuccess(null);
    setUploadOpen(true);
  };

  const handleUploadFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    setUploadFile(f ?? null);
  };

  const submitUpload = async () => {
    if (!uploadFile || !uploadCourseId) {
      setUploadError('Please select a course and a file');
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append('file', uploadFile);
      fd.append('courseId', String(uploadCourseId));
      fd.append('ownerId', '1');

      const res = await fetch(`${API_BASE}/files`, { method: 'POST', body: fd });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error || 'Upload failed');
      }
      const created = await res.json();
      setUploadSuccess('Upload successful');
      // optionally reset form
      setUploadFile(null);
      setUploadCourseId(null);
      // update courses documentsCount for the course
      setCourses(prev => prev.map(c => c.id === Number((created as any).courseId) ? ({ ...c, documentsCount: (c.documentsCount || 0) + 1 }) : c));
      // close modal and navigate to the course page to show uploaded file
      const createdCourseId = Number((created as any).courseId);
      const course = courses.find(c => c.id === createdCourseId);
      setUploadOpen(false);
      if (course) {
        navigate(`/course/${course.code}`, { state: { courseId: createdCourseId } });
      }
      // you might refresh UI or navigate to course page
      console.log('uploaded file', created);
    } catch (e:any) {
      setUploadError(e.message || 'Upload error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Dark Navy Sidebar */}
      <aside className="w-64 bg-[#002855] text-white flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-white mb-2">CourseShare</h1>
          <p className="text-sm text-blue-200">University of Toronto</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4">
          <h3 className="text-xs uppercase tracking-wide text-blue-300 mb-3 px-2">Departments</h3>
          <div className="space-y-1">
            <button
              onClick={() => setSelectedDepartment(null)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                selectedDepartment === null
                  ? 'bg-[#0066CC] text-white'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              All Departments
            </button>
            {departments.map((dept) => (
              <button
                key={dept.id}
                onClick={() => setSelectedDepartment(dept.code)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  selectedDepartment === dept.code
                    ? 'bg-[#0066CC] text-white'
                    : 'text-blue-100 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{dept.name}</span>
                  <span className="text-xs text-blue-300">{dept.code}</span>
                </div>
              </button>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-white/10">
          {/* Create Department */}
          <div className="mb-4">
            <h4 className="text-sm text-white/90 mb-2">Create department</h4>
            <div className="flex gap-2">
              <Input placeholder="Dept name" value={newDeptName} onChange={e => setNewDeptName(e.target.value)} className="flex-1" />
              <Input placeholder="Code" value={newDeptCode} onChange={e => setNewDeptCode(e.target.value)} style={{width: 80}} />
            </div>
            <Button
              type="button"
              onClick={async () => {
                if (!newDeptName.trim() || !newDeptCode.trim()) return;
                setCreatingDept(true);
                try {
                  const res = await fetch(`${API_BASE}/departments`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: newDeptName.trim(), code: newDeptCode.trim() })
                  });
                  if (!res.ok) throw new Error('Failed to create department');
                  const created = await res.json();
                  setDepartments(prev => [...prev, created]);
                  // reset
                  setNewDeptName(''); setNewDeptCode('');
                } catch (err) {
                  console.error('Create department error', err);
                } finally { setCreatingDept(false); }
              }}
              disabled={creatingDept}
              className="w-full bg-[#0066CC] hover:bg-[#0052A3] text-white rounded-lg mt-2"
              style={{ borderRadius: '8px' }}
            >
              {creatingDept ? 'Creating...' : 'Create Department'}
            </Button>
          </div>

          {/* Create Course */}
          <div className="mb-4">
            <h4 className="text-sm text-white/90 mb-2">Create course</h4>
            <div className="flex gap-2 mb-2">
              <Input placeholder="Code" value={newCourseCode} onChange={e => setNewCourseCode(e.target.value)} />
              <Input placeholder="Title" value={newCourseName} onChange={e => setNewCourseName(e.target.value)} />
            </div>
            <div className="mb-2">
              <select value={newCourseDeptId ?? ''} onChange={e => setNewCourseDeptId(e.target.value ? Number(e.target.value) : null)} className="w-full text-sm rounded px-2 py-2">
                <option value="">Select department</option>
                {departments.map(d => (
                  <option key={d.id} value={String(d.id)}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>
            <Button
              type="button"
              onClick={async () => {
                if (!newCourseCode.trim() || !newCourseName.trim() || !newCourseDeptId) return;
                setCreatingCourse(true);
                try {
                  const body = { courseCode: newCourseCode.trim(), title: newCourseName.trim(), departmentId: Number(newCourseDeptId) };
                  const res = await fetch(`${API_BASE}/courses`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                  });
                  if (!res.ok) throw new Error('Failed to create course');
                  const created = await res.json();
                  // normalize created course into our Course type as best we can
                  const normalized: Course = {
                    id: Number(created.id),
                    code: created.courseCode || created.code || newCourseCode.trim(),
                    name: created.title || created.name || newCourseName.trim(),
                    department: departments.find(d => d.id === Number(newCourseDeptId))?.code || '',
                    documentsCount: created.documentsCount || 0,
                    color: created.color || '#0066CC'
                  };
                  setCourses(prev => [normalized, ...prev]);
                  setNewCourseCode(''); setNewCourseName(''); setNewCourseDeptId(null);
                } catch (err) {
                  console.error('Create course error', err);
                } finally { setCreatingCourse(false); }
              }}
              disabled={creatingCourse}
              className="w-full bg-white text-[#0066CC] border border-white/20"
            >
              {creatingCourse ? 'Creating...' : 'Create'}
            </Button>
          </div>
         </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-[#002855] mb-1">Course Materials</h1>
              <p className="text-sm text-gray-600">
                {selectedDepartment 
                  ? departments.find(d => d.code === selectedDepartment)?.name 
                  : 'All Departments'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64 bg-gray-50 border-gray-200 rounded-lg"
                  style={{ borderRadius: '8px' }}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Course Grid */}
        <div className="flex-1 overflow-y-auto p-8">
          {loading ? (
            <div className="text-gray-500">Loading courses...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCourses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => navigate(`/course/${course.code}`, { state: { courseId: course.id } })}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all hover:border-[#0066CC] text-left group"
                  style={{ borderRadius: '8px' }}
                >
                  <div 
                    className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center"
                    style={{ 
                      backgroundColor: course.color,
                      borderRadius: '8px'
                    }}
                  >
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-[#002855] mb-1 group-hover:text-[#0066CC] transition-colors">
                    {course.code}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{course.name}</p>
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant="secondary" 
                      className="bg-blue-50 text-[#0066CC] hover:bg-blue-100"
                      style={{ borderRadius: '8px' }}
                    >
                      {course.department}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {course.documentsCount} docs
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!loading && filteredCourses.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <FileText className="h-12 w-12 mb-3" />
              <p>No courses found</p>
            </div>
          )}
        </div>
      </main>

      {/* Upload Modal */}
      {uploadOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-md p-6 rounded-lg">
            <h3 className="text-lg mb-3">Upload Material</h3>
            <div className="mb-3">
              <label className="block text-sm mb-1">Select Course</label>
              <select
                className="w-full border rounded p-2"
                value={uploadCourseId ?? ''}
                onChange={(e) => setUploadCourseId(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">-- select course --</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{`${c.code} — ${c.name} (${c.department})`}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="block text-sm mb-1">File</label>
              <input type="file" onChange={handleUploadFileChange} />
            </div>
            {uploadError && <div className="text-sm text-red-600 mb-2">{uploadError}</div>}
            {uploadSuccess && <div className="text-sm text-green-600 mb-2">{uploadSuccess}</div>}
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 border rounded" onClick={() => setUploadOpen(false)} disabled={uploading}>Cancel</button>
              <button className="px-4 py-2 bg-[#0066CC] text-white rounded" onClick={submitUpload} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
