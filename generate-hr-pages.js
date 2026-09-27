const fs = require('fs');
const path = require('path');

const pages = [ 
  { dir: 'job-titles', title: 'المسميات الوظيفية', desc: 'إدارة المسميات الوظيفية في النظام' },
  { dir: 'education-levels', title: 'المستويات التعليمية', desc: 'إدارة المستويات والدرجات العلمية' },
  { dir: 'companies', title: 'الشركات', desc: 'إدارة الفروع والشركات التابعة' },
  { dir: 'employees', title: 'الموظفون', desc: 'سجل بيانات الموظفين' },
  { dir: 'device-fingerprints', title: ' جهاز البصمة', desc: 'إدارة الأجهزة المعتمدة' },
  { dir: 'employee-fingerprints', title: 'بصمة الموظف', desc: 'إدارة البصمات الحيوية للموظفين' },
  { dir: 'data-descriptions', title: 'استقبال البيانات', desc: 'إدارة قوائم وخيارات النظام' },
  { dir: 'attendance', title: 'الحضور والانصراف', desc: 'سجلات حضور الموظفين' },
  { dir: 'shifts', title: '    الورديات', desc: 'إدارة الشفتات وجداول العمل' },
  { dir: 'legal-specialists', title: 'أخصائي بصمات قانوني', desc: 'صلاحيات واعتمادات البصمات القانونية' },
];

const template = (title, desc) => `"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, MoreVertical, Edit, Trash2, ChevronRight } from 'lucide-react';

export default function Page() {
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-muted-foreground gap-2">
        <Link href="/dashboard/hr" className="hover:text-primary transition-colors">الموارد البشرية</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-medium">${title}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">${title}</h1>
          <p className="text-muted-foreground text-sm mt-1">${desc}</p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          إضافة جديد
        </button>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="بحث..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-xl pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Data Table Container */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-bold">#</th>
                <th className="px-6 py-4 font-bold">الاسم / الوصف</th>
                <th className="px-6 py-4 font-bold">تاريخ الإضافة</th>
                <th className="px-6 py-4 font-bold">الحالة</th>
                <th className="px-6 py-4 font-bold text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {/* Dummy Row 1 */}
              <tr className="hover:bg-muted/30 transition-colors group">
                <td className="px-6 py-4">1</td>
                <td className="px-6 py-4 font-medium">عنصر تجريبي 1</td>
                <td className="px-6 py-4 text-muted-foreground">2023-10-15</td>
                <td className="px-6 py-4">
                  <span className="bg-emerald-500/10 text-emerald-600 px-2 py-1 rounded-md text-xs font-bold">نشط</span>
                </td>
                <td className="px-6 py-4 text-left">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-muted-foreground hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                    <button className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
              {/* Dummy Row 2 */}
              <tr className="hover:bg-muted/30 transition-colors group">
                <td className="px-6 py-4">2</td>
                <td className="px-6 py-4 font-medium">عنصر تجريبي 2</td>
                <td className="px-6 py-4 text-muted-foreground">2023-10-16</td>
                <td className="px-6 py-4">
                  <span className="bg-emerald-500/10 text-emerald-600 px-2 py-1 rounded-md text-xs font-bold">نشط</span>
                </td>
                <td className="px-6 py-4 text-left">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-muted-foreground hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                    <button className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
              {/* Empty State Fallback (Can be shown when data is empty) */}
              {/* 
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                  لا توجد بيانات متاحة حالياً. سيتم عرض البيانات هنا بعد ربط الـ API.
                </td>
              </tr>
              */}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
          <span>يعرض 2 من أصل 2</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-border rounded-md hover:bg-muted transition-colors disabled:opacity-50">السابق</button>
            <button className="px-3 py-1 border border-border rounded-md hover:bg-muted transition-colors disabled:opacity-50">التالي</button>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

const basePath = path.join(__dirname, 'src', 'app', 'dashboard', 'hr');

if (!fs.existsSync(basePath)) {
  fs.mkdirSync(basePath, { recursive: true });
}

pages.forEach(page => {
  const dirPath = path.join(basePath, page.dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  const filePath = path.join(dirPath, 'page.tsx');
  fs.writeFileSync(filePath, template(page.title, page.desc));
  console.log(`Created: ${filePath}`);
});
