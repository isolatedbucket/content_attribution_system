import { LedgerEntry } from '../types';
import { FileText, Image as ImageIcon, Trash2 } from 'lucide-react';

interface LedgerProps {
  entries: LedgerEntry[];
  onClear: () => void;
}

function Ledger({ entries, onClear }: LedgerProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Ledger</h2>
        {entries.length > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No entries yet. Upload and process files to build your ledger.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-semibold text-gray-700">Type</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-700">Filename</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-700">Fingerprint</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-700">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2">
                    {entry.filetype === 'text' ? (
                      <FileText className="w-5 h-5 text-blue-600" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-green-600" />
                    )}
                  </td>
                  <td className="py-3 px-2 max-w-xs truncate">{entry.filename}</td>
                  <td className="py-3 px-2 font-mono text-xs text-gray-600 max-w-xs truncate">
                    {entry.fingerprint}
                  </td>
                  <td className="py-3 px-2 text-gray-600 whitespace-nowrap">
                    {new Date(entry.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Ledger;
