import { Upload, FileText, Image as ImageIcon } from 'lucide-react';

interface FileUploadProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  onProcess: () => void;
  processing: boolean;
  error: string | null;
}

function FileUpload({ selectedFile, onFileSelect, onProcess, processing, error }: FileUploadProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onFileSelect(file);
  };

  const getFileIcon = () => {
    if (!selectedFile) return <Upload className="w-6 h-6 text-gray-400" />;
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (ext === 'txt') return <FileText className="w-6 h-6 text-blue-600" />;
    return <ImageIcon className="w-6 h-6 text-green-600" />;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload File</h2>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
        <div className="flex justify-center mb-3">
          {getFileIcon()}
        </div>
        <label className="cursor-pointer">
          <span className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Choose a file
          </span>
          <input
            type="file"
            accept=".txt,image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        {selectedFile && (
          <p className="mt-2 text-sm text-gray-600 truncate">{selectedFile.name}</p>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <button
        onClick={onProcess}
        disabled={!selectedFile || processing}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
      >
        {processing ? 'Processing...' : 'Process File'}
      </button>
    </div>
  );
}

export default FileUpload;
