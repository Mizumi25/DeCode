import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';


export default function SourcePage({ projectId, frameId }) {
  return (
    <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    SourcePage
                </h2>
            }
        >
            <Head title="SourcePage" />
            
            <div className="h-screen w-screen flex flex-col">
              <header className="flex justify-between items-center px-4 py-2 shadow">
                <div className="font-semibold text-lg">Source Editor</div>
                <button className="bg-purple-600 text-white px-3 py-1 rounded">Back to Forge</button>
              </header>
        
              <main className="flex-1 flex">
                <aside className="w-64 bg-gray-50 border-r">File Explorer</aside>
        
                <div className="flex-1 p-4">
                  <textarea className="w-full h-full p-2 border rounded" defaultValue={`<button>Click Me</button>`} />
                </div>
        
                <aside className="w-64 bg-gray-50 border-l">Live Preview Panel</aside>
              </main>
            </div>
    </AuthenticatedLayout>
  );
}
