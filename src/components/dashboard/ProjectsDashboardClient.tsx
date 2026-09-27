'use client';

import React, { useState } from 'react';
import { ProjectsSection } from '@/components/dashboard/ProjectsSection';
import { ProjectModal, DeleteConfirmModal } from '@/components/dashboard/Modals';
import { ApiProject, ApiAgent } from '@/types/api';
import { 
  createProjectServerAction, 
  updateProjectServerAction, 
  deleteProjectServerAction,
  addProjectImageServerAction,
  deleteProjectImageServerAction,
  getProjectByIdServerAction,
  getProjectsServerAction
} from '@/actions/projects.actions';
import { Loader2 } from 'lucide-react';
import { ToastNotification, ToastMessage } from '@/components/ui/ToastNotification';
import { usePaginatedList } from '@/lib/use-paginated-list';

interface ProjectsDashboardClientProps {
  agents: ApiAgent[];
}

export default function ProjectsDashboardClient({ agents = [] }: ProjectsDashboardClientProps) {
  const {
    items: projects,
    meta,
    search: searchQuery,
    setSearch: setSearchQuery,
    setPage,
    setPageSize,
    reload,
  } = usePaginatedList<ApiProject>(getProjectsServerAction);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ApiProject | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiProject | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const handleSaveProject = async (
    formData: FormData,
    newSubImages: File[],
    deletedSubImageIds: number[]
  ) => {
    setIsSubmitting(true);
    try {
      let projectId: number | string | undefined;
      const isEditing = !!editingProject;

      if (editingProject) {
        // Update project
        const res = await updateProjectServerAction(editingProject.id, formData);
        if (res.success && res.data) {
          projectId = res.data.id;
        } else {
          setToast({ type: 'error', message: res.error || 'حدث خطأ أثناء تعديل بيانات المشروع' });
          return;
        }
      } else {
        // Create project
        const res = await createProjectServerAction(formData);
        if (res.success && res.data) {
          projectId = res.data.id;
        } else {
          setToast({ type: 'error', message: res.error || 'حدث خطأ أثناء إضافة المشروع الجديد' });
          return;
        }
      }

      if (projectId) {
        // 1. Delete removed sub-images from server
        if (deletedSubImageIds && deletedSubImageIds.length > 0) {
          for (const imgId of deletedSubImageIds) {
            await deleteProjectImageServerAction(imgId);
          }
        }

        // 2. Upload new sub-images to /gallery/projectimage/
        if (newSubImages && newSubImages.length > 0) {
          for (const file of newSubImages) {
            const subRes = await addProjectImageServerAction(projectId, file);
            if (!subRes.success) {
              setToast({ type: 'error', message: subRes.error || 'فشل رفع إحدى الصور الفرعية للمشروع' });
            }
          }
        }

        // 3. Fetch latest project with full updated project_images
        const updatedProject = await getProjectByIdServerAction(projectId);
        if (updatedProject) {
          if (isEditing) {
            setToast({ type: 'success', message: 'تم تعديل بيانات المشروع بنجاح ⚡' });
            reload();
          } else {
            setToast({ type: 'success', message: 'تمت إضافة المشروع الجديد بنجاح ⚡' });
            // A new project belongs on page 1, so return there to see it.
            setPage(1);
            reload();
          }
        } else {
          setToast({ type: 'success', message: isEditing ? 'تم التعديل بنجاح' : 'تمت الإضافة بنجاح' });
        }
      }
    } catch (error) {
      console.error('Error saving project:', error);
      setToast({ type: 'error', message: (error instanceof Error ? error.message : undefined) || 'فشلت العملية، يرجى المحاولة مرة أخرى' });
    } finally {
      setIsSubmitting(false);
      setEditingProject(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      const res = await deleteProjectServerAction(deleteTarget.id);
      if (res.success) {
        // Deleting the only row of the last page would leave the user on an
        // empty page, so fall back to the previous one.
        if (projects.length === 1 && meta.page > 1) {
          setPage(meta.page - 1);
        } else {
          reload();
        }
        setToast({ type: 'success', message: 'تم حذف المشروع بنجاح 🗑️' });
      } else {
        setToast({ type: 'error', message: res.error || 'حدث خطأ أثناء حذف المشروع من السيرفر' });
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      setToast({ type: 'error', message: (error instanceof Error ? error.message : undefined) || 'فشل حذف المشروع، يرجى التحقق من الاتصال بالشبكة' });
    } finally {
      setIsSubmitting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="relative">
      {/* Global loading spinner overlay during submit/delete */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center">
          <div className="bg-card border border-border p-6 rounded-3xl shadow-xl flex items-center gap-3 text-sm font-bold text-foreground">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <span>جاري معالجة طلبك</span>
          </div>
        </div>
      )}

      <ProjectsSection
        projects={projects}
        meta={meta}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onAddProject={() => {
          setEditingProject(null);
          setIsProjectModalOpen(true);
        }}
        onEditProject={(proj) => {
          setEditingProject(proj);
          setIsProjectModalOpen(true);
        }}
        onDeleteProject={(proj) => setDeleteTarget(proj)}
      />

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSave={handleSaveProject}
        initialData={editingProject}
        agents={agents}
      />

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={deleteTarget ? (deleteTarget.name_ar || deleteTarget.name_en) : ''}
      />

      {/* Floating Bottom Toast Notification */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
