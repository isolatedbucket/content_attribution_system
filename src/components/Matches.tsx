import { Match } from '../types';
import { FileText, Image as ImageIcon } from 'lucide-react';

interface MatchesProps {
  matches: Match[];
}

function Matches({ matches }: MatchesProps) {
  const formatPercentage = (similarity: number) => {
    return (similarity * 100).toFixed(1);
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 0.8) return 'text-green-700 bg-green-100';
    if (similarity >= 0.5) return 'text-yellow-700 bg-yellow-100';
    return 'text-gray-700 bg-gray-100';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Matches</h2>

      {matches.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No matches yet. Process a file to see results.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((match, index) => (
            <div
              key={match.entry.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="mt-1">
                    {match.entry.filetype === 'text' ? (
                      <FileText className="w-5 h-5 text-blue-600" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {match.entry.filename}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(match.entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getSimilarityColor(match.similarity)}`}>
                  {formatPercentage(match.similarity)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Matches;
