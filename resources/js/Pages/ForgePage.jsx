import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';




export default function ForgePage({ projectId, frameId }) {
  return (
    <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    ForcePage
                </h2>
            }
        >
            <Head title="ForgePage" />
            
            <div className="h-screen flex flex-col">
              <header className="flex justify-between items-center px-4 py-2 shadow">
                <div className="font-semibold text-lg">Forge</div>
                <div className="flex gap-2">
                  <button className="bg-purple-600 text-white px-3 py-1 rounded">Save</button>
                </div>
              </header>
        
              <div className="flex flex-1">
                <aside className="w-64 bg-gray-50 border-r">Components Panel</aside>
        
                <main className="flex-1 bg-white border">
                  {/* Drop canvas */}
                  <div className="h-full">Canvas Here</div>
                </main>
        
                <aside className="w-64 bg-gray-50 border-l">Properties Panel</aside>
              </div>
        
              {/* Source Panel bottom */}
              <footer className="h-48 bg-gray-100 border-t px-4 py-2">
                <h2 className="text-sm text-gray-700 mb-2">Generated Code:</h2>
                <pre className="bg-white p-2 rounded shadow text-xs overflow-auto h-full">
        {`<button class="bg-purple-500 text-white px-4 py-2 rounded">Click Me</button>`}
                </pre>
              </footer>
            </div>
    </AuthenticatedLayout>
  );
}