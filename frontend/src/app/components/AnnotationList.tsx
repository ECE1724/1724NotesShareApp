import { useEffect, useState } from 'react';
import { API_BASE } from '../config';

export function AnnotationList({ fileId }: { fileId: number }){
  const [annotations, setAnnotations] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    async function load(){
      const res = await fetch(`${API_BASE}/annotations?fileId=${fileId}`);
      const data = await res.json();
      if (!mounted) return;
      setAnnotations(data.annotations || []);
    }
    load();
    return () => { mounted = false };
  }, [fileId]);

  return (
    <div className="space-y-3">
      {annotations.map(a => (
        <div key={a.id} className="bg-gray-50 p-3 rounded">
          <p className="text-sm text-[#002855]">{a.authorId} - {a.body}</p>
        </div>
      ))}
    </div>
  )
}
