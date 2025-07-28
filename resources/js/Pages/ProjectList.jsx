


import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Plus, ChevronDown } from 'lucide-react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function ProjectList() {
  const projects = [
    { id: '0', title: 'Design Sprint', date: 'July 1, 2025', w: 3, h: 4 },
    { id: '1', title: 'Mobile UI Kit', date: 'July 2, 2025', w: 3, h: 3 },
    { id: '2', title: 'Dashboard Redesign', date: 'July 3, 2025', w: 3, h: 5 },
    { id: '3', title: 'Tablet Layout', date: 'July 4, 2025', w: 3, h: 4 },
    { id: '4', title: 'Landing Page', date: 'July 5, 2025', w: 3, h: 3 },
    { id: '5', title: 'Admin Panel', date: 'July 6, 2025', w: 3, h: 4 },
    { id: '6', title: 'Prototype', date: 'July 7, 2025', w: 3, h: 5 },
    { id: '7', title: 'UX Case Study', date: 'July 8, 2025', w: 3, h: 3 },
  ];

  const layouts = {
    lg: projects.map((p, i) => ({
      i: p.id,
      x: (i % 4) * 3, 
      y: Math.floor(i / 4) * 5,
      w: p.w,
      h: p.h,
    })),
    md: projects.map((p, i) => ({
      i: p.id,
      x: (i % 3) * 3,
      y: Math.floor(i / 3) * 5,
      w: p.w,
      h: p.h,
    })),
    sm: projects.map((p, i) => ({
      i: p.id,
      x: (i % 2) * 2,
      y: Math.floor(i / 2) * 5,
      w: 2,
      h: p.h,
    })),
  };

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
        {/* New Project Button */}
        <div className="flex justify-between items-center">
          <div className="flex-start items-center flex-col gap-2">
            <span className="font-bold text-[var(--color-text)] text-sm">All</span>
            <button className="flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition">
              Last viewed by me
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        
          <button className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg text-sm shadow-md flex items-center gap-2 hover:bg-[var(--color-primary-hover)] transition">
            <Plus size={16} />
            New Project
          </button>
        </div>


        {/* Draggable Responsive Grid */}
        <div className="overflow-x-hidden">
          <ResponsiveGridLayout
            className="layout"
            layouts={layouts}
            breakpoints={{ lg: 1024, md: 768, sm: 480 }}
            cols={{ lg: 12, md: 9, sm: 4 }}
            rowHeight={30}
            isResizable={false}
            isDraggable={true}
            margin={[16, 16]}
            compactType="vertical"
            preventCollision={false}
            isBounded={true}
          >
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-[var(--color-bg-muted)] rounded-xl shadow-md overflow-hidden relative group"
              >
                <div className="absolute bottom-2 left-2 text-xs text-[var(--color-text-muted)]">
                  <div className="font-medium">{project.title}</div>
                  <div className="text-[10px]">{project.date}</div>
                </div>
  
                {/* Dummy preview area */}
                <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)] text-sm">
                  Preview
                </div>
              </div>
            ))}
          </ResponsiveGridLayout>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

