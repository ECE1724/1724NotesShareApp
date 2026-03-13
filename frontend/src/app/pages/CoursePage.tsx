import { useParams, useNavigate } from 'react-router';
import { documents, courses } from '../data/mockData';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

export function CoursePage(){
  const { courseCode } = useParams();
  const navigate = useNavigate();
  const course = courses.find(c => c.code === courseCode);
  const docs = documents.filter(d => d.courseCode === courseCode);

  return (
    <div className="flex h-screen bg-white">
      <aside className="w-64 bg-[#002855] text-white p-6">
        <h2 className="text-lg">CourseShare</h2>
        <p className="text-sm text-blue-200">University of Toronto</p>
      </aside>

      <main className="flex-1 p-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">Back</Button>
        <h1 className="text-2xl text-[#002855] mb-2">{course?.code} - {course?.name}</h1>
        <p className="text-sm text-gray-600 mb-6">{docs.length} documents</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {docs.map(doc => (
            <div key={doc.id} className="bg-white border rounded-lg p-4">
              <h3 className="text-[#002855]">{doc.title}</h3>
              <p className="text-sm text-gray-500">Uploaded by {doc.uploader} on {doc.uploadDate}</p>
              <div className="mt-4 flex items-center justify-between">
                <Badge className="bg-blue-50 text-[#0066CC]">{course?.department}</Badge>
                <Button onClick={() => navigate(`/course/${courseCode}/document/${doc.id}`)}>Open</Button>
              </div>
            </div>
          ))}
          {docs.length === 0 && <p className="text-gray-500">No documents yet.</p>}
        </div>
      </main>
    </div>
  )
}
