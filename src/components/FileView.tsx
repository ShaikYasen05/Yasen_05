import React, { useState, useEffect } from "react";
import { 
  Paperclip, Search, Trash2, Download, Eye, FileText, Image, FolderOpen, Plus, ExternalLink, RefreshCw 
} from "lucide-react";

interface FileViewProps {
  apiClient: any;
  activeProjectId: string | null;
}

export default function FileView({ apiClient, activeProjectId }: FileViewProps) {
  const [files, setFiles] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const allTasks = await apiClient.getTasks();
      // Gather all attachments from all tasks
      const list: any[] = [];
      allTasks.forEach((t: any) => {
        if (t.attachments && t.attachments.length > 0) {
          t.attachments.forEach((a: any) => {
            list.push({
              ...a,
              taskTitle: t.title,
              taskId: t.id
            });
          });
        }
      });
      setFiles(list);
    } catch (err) {
      console.error("Failed to load workspace files", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [activeProjectId]);

  const filteredFiles = files.filter(f => {
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header and Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 shrink-0 bg-white p-4 border border-slate-100 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 font-display">Document Explorer</h2>
            <p className="text-[10px] text-slate-500 font-semibold">Workspace assets, designs, and specifications</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-all"
            />
          </div>
          <button
            onClick={fetchFiles}
            className="p-2 hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-xl transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Document Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-white border border-slate-100 rounded-2xl" />
          ))}
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-100 rounded-2xl shadow-2xs space-y-3">
          <FolderOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-700">No documents indexed</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">Upload design mockups, sprint summaries, or logs directly inside individual task details cards.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredFiles.map((file, idx) => {
            const isImage = file.name.endsWith(".png") || file.name.endsWith(".jpg") || file.name.endsWith(".jpeg");
            return (
              <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs hover:border-slate-200 hover:shadow-xs transition-all flex flex-col justify-between space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg shrink-0">
                    {isImage ? <Image className="w-5 h-5 text-blue-500" /> : <FileText className="w-5 h-5 text-violet-500" />}
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <span className="block text-xs font-semibold text-slate-800 truncate" title={file.name}>{file.name}</span>
                    <span className="block text-[9px] text-slate-400 uppercase font-mono">{file.size}</span>
                  </div>
                </div>

                <div className="space-y-1 bg-slate-50 p-2 rounded-lg border border-slate-100 text-[9px]">
                  <span className="text-slate-400 block uppercase font-bold tracking-wider text-[8px]">LINKED TASK</span>
                  <span className="text-slate-700 font-medium block truncate">{file.taskTitle}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[8px] text-slate-400 font-bold uppercase">{file.taskId}</span>
                  <div className="flex gap-1">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
                      title="Open attachment"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
