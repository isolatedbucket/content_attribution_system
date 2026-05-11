import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import FileUpload from './components/FileUpload';
import Ledger from './components/Ledger';
import Matches from './components/Matches';
import { processFile, computeSimilarity } from './utils/fingerprint';
import { LedgerEntry, Match } from './types';

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('attribution-ledger');
    if (stored) {
      try {
        setLedger(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load ledger:', e);
      }
    }
  }, []);

  const saveLedger = (newLedger: LedgerEntry[]) => {
    localStorage.setItem('attribution-ledger', JSON.stringify(newLedger));
    setLedger(newLedger);
  };

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    setError(null);
    setMatches([]);
  };

  const handleProcess = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setProcessing(true);
    setError(null);
    setMatches([]);

    try {
      const result = await processFile(selectedFile);

      const computedMatches: Match[] = ledger
        .map(entry => ({
          entry,
          similarity: computeSimilarity(
            result.fingerprint,
            entry.fingerprint,
            result.filetype,
            entry.filetype,
            result.ngramHashes,
            entry.ngramHashes
          )
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5);

      setMatches(computedMatches);

      const newEntry: LedgerEntry = {
        id: Date.now().toString(),
        filename: selectedFile.name,
        filetype: result.filetype,
        fingerprint: result.fingerprint,
        ngramHashes: result.ngramHashes,
        timestamp: new Date().toISOString()
      };

      saveLedger([...ledger, newEntry]);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Attribution</h1>
          <p className="text-gray-600">Upload images or text files to compute fingerprints and find similar content</p>
        </header>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Supported formats:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Images: JPG, PNG, GIF, WebP</li>
                <li>Text: .txt files only (save Word or PDF as .txt before uploading)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <FileUpload
            selectedFile={selectedFile}
            onFileSelect={handleFileSelect}
            onProcess={handleProcess}
            processing={processing}
            error={error}
          />

          <Matches matches={matches} />
        </div>

        <Ledger entries={ledger} onClear={() => saveLedger([])} />
      </div>
    </div>
  );
}

export default App;
