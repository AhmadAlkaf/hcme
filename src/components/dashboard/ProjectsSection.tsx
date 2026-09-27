'use client';

import React, { useState } from 'react';
import { FolderKanban, Search, Plus, Edit, Trash2, MapPin, Building, Calendar, Tag } from 'lucide-react';
import { ApiProject } from '@/types/api';
import type { PaginationMeta } from '@/types/pagination';
import { Pagination } from '@/components/ui/Pagination';
import { getImageUrl } from '@/lib/utils';

interface ProjectsSectionProps {
  projects: ApiProject[];
  meta: PaginationMeta;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onAddProject: () => void;
  onEditProject: (project: ApiProject) => void;
  onDeleteProject: (project: ApiProject) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  projects = [],
  meta,
  searchQuery,
  onSearchChange,
  onAddProject,
  onEditProject,
  onDeleteProject,
  onPageChange,
  onPageSizeChange,
}) => {
  // Search runs on the server, so the list is rendered as received.
  const filteredProjects = projects;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-6 rounded-3xl border border-border/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-foreground">إدارة المشاريع المنجزة والجارية</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-xs font-black">
                {projects.length} مشروع
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              عرض وإضافة وتعديل وحذف مشاريع التوريدات والمقاولات المرتبطة بوكالات المركز
            </p>
          </div>
        </div>

        <button
          onClick={onAddProject}
          className="px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground font-extrabold text-xs sm:text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          إضافة مشروع جديد
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-card border border-border/80 p-4 rounded-3xl shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ابحث باسم المشروع، المالك، الوكيل، أو المدينة..."
            className="w-full pl-4 pr-10 py-2.5 rounded-2xl bg-background/50 border border-input text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Empty State Banner */}
      {filteredProjects.length === 0 ? (
        <div className="bg-card text-card-foreground border border-dashed border-border/80 rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center mx-auto text-2xl">
            🏢
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="font-extrabold text-base text-foreground">لا توجد مشاريع مسجلة حتى الآن</h3>
            <p className="text-xs text-muted-foreground">
              سجل أول مشروع منجز أو قيد التنفيذ لإظهاره لعملاء ومهندسي المركز.
            </p>
          </div>
          <button
            onClick={onAddProject}
            className="px-6 py-2.5 rounded-2xl bg-primary text-primary-foreground font-extrabold text-xs inline-flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            إضافة أول مشروع الآن
          </button>
        </div>
      ) : (
        /* Data Table View */
        <div className="bg-card border border-border/80 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs sm:text-sm">
              <thead className="bg-muted/50 text-muted-foreground border-b border-border font-bold">
                <tr>
                  <th className="p-4">اسم المشروع</th>
                  <th className="p-4">الوكيل   </th>
                  <th className="p-4">الموقع وتاريخ التنفيذ</th>
                  <th className="p-4">الوصف والتصنيف</th>
                  <th className="p-4 text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProjects.map((proj) => {
                  const projName = proj.name_ar || proj.name_en || 'بدون عنوان';
                  const ownerName = proj.name_owner_ar || proj.name_owner_en;
                  const agentName = proj.agent_name_ar || proj.agent_name_en;
                  const location = proj.location_ar || proj.location_en;

                  return (
                    <tr key={proj.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                            {proj.image ? (
                              <img src={getImageUrl(proj.image)} alt={projName} className="w-full h-full object-cover" />
                            ) : (
                              <FolderKanban className="w-6 h-6 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <span className="font-extrabold text-foreground block">{projName}</span>
                            <span className="text-[11px] text-muted-foreground line-clamp-1">
                              {proj.short_description_ar || proj.short_description_en || 'بدون وصف قصير'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="space-y-0.5">
                          {agentName && (
                            <span className="font-bold text-primary block flex items-center gap-1">
                              <Tag className="w-3.5 h-3.5 text-primary" />
                              {agentName}
                            </span>
                          )}
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Building className="w-3.5 h-3.5 text-muted-foreground" />
                            {ownerName || 'غير محدد'}
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-foreground block flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-primary" />
                            {location || 'المكلا'}
                          </span>
                          {(proj.start || proj.completed) && (
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {proj.start ? proj.start : ''} {proj.completed ? `- ${proj.completed}` : ''}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-slate-600 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg inline-block">
                          {proj.attribute_ar || proj.attribute_en || 'توريدات عامة'}
                        </span>
                      </td>

                      <td className="p-4 text-left">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onEditProject(proj)}
                            className="p-2 rounded-xl border border-input hover:bg-muted text-foreground transition-colors"
                            title="تعديل"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteProject(proj)}
                            className="p-2 rounded-xl border border-destructive/20 text-destructive hover:bg-destructive/10 transition-colors"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {meta.totalPages > 0 && (
        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm">
          <Pagination
            meta={meta}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            idPrefix="dashboard-projects"
          />
        </div>
      )}
    </div>
  );
};
