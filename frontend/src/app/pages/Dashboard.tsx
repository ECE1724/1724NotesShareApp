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

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const depRes = await fetch(`${API_BASE}/departments`);
        const deps: Department[] = await depRes.json();
        if (!mounted) return;
        setDepartments(deps);

        // fetch courses for all departments in parallel
        const courseLists = await Promise.all(deps.map(d => fetch(`${API_BASE}/courses/department/${d.id}`).then(r => r.json())));
        const flat: Course[] = courseLists.flat();
        if (!mounted) return;
        setCourses(flat);
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
    const matchesSearch = course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDepartment && matchesSearch;
  });

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
          <Button 
            className="w-full bg-[#0066CC] hover:bg-[#0052A3] text-white rounded-lg"
            style={{ borderRadius: '8px' }}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Material
          </Button>
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
    </div>
  );
}
