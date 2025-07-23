


import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Plus } from 'lucide-react';

export default function ProjectList() {
  const tempProjects = Array.from({ length: 8 });

  // Random size variants for demo purposes
  const sizeVariants = [
    'h-64 w-full', // portrait
    'h-40 w-full', // landscape
    'h-72 w-full', // tablet-ish
    'h-52 w-full',
  ];

  return (
    <AuthenticatedLayout
      header={
        <div className="w-full flex justify-center items-center">
          <h2 className="text-xl font-semibold text-[var(--color-primary)] text-center">
            Bridging the gap between Designing and Coding
          </h2>
        </div>
      }
    >
      <Head title="Project List" />

      <div className="p-8 space-y-6">
        {/* New Project Button at Top Right */}
        <div className="flex justify-end">
          <button className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg text-sm shadow-md flex items-center gap-2 hover:bg-[var(--color-primary-hover)] transition">
            <Plus size={16} />
            New Project
          </button>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tempProjects.map((_, index) => (
            <div
              key={index}
              className={`${
                sizeVariants[index % sizeVariants.length]
              } bg-[var(--color-bg-muted)] rounded-xl shadow-md flex items-center justify-center text-[var(--color-text-muted)] text-sm transition hover:scale-[1.01] duration-200`}
            >
              Preview {index + 1}
            </div>
          ))}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
