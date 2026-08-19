import { FolderOpen, Plus } from 'lucide-react';

export default function ImportButton({ onImport }) {
  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onImport(files);
    }
    e.target.value = null;
  };

  return (
    <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors cursor-pointer text-sm font-medium">
      <Plus className="h-4 w-4" />
      Import Music
      <input
        type="file"
        accept="audio/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
    </label>
  );
}
