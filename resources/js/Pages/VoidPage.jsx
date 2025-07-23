import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';



export default function VoidPage({ projectId }) {
  return (
    <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    VoidPage
                </h2>
            }
        >
            <Head title="VoidPage" />
            <div className="h-screen w-screen bg-white">
              <header className="flex justify-between p-4 shadow-md">
                <div className="font-bold text-lg">DeCode</div>
                <div className="flex gap-2">
                  <button className="bg-purple-500 text-white px-3 py-1 rounded">Preview</button>
                  <div className="w-8 h-8 bg-cyan-400 rounded-full" />
                </div>
              </header>
        
              {/* Frame previews */}
              <main className="p-8 grid grid-cols-2 gap-4">
                <div className="border p-4">Frame 1</div>
                <div className="border p-4">Frame 2</div>
              </main>
            </div>
    </AuthenticatedLayout>
  );
}