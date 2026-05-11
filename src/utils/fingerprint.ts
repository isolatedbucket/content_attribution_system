import { ProcessResult } from '../types';

async function sha1(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

function generateNGrams(text: string, n: number = 5): string[] {
  const words = text.split(' ');
  const ngrams: string[] = [];
  for (let i = 0; i <= words.length - n; i++) {
    ngrams.push(words.slice(i, i + n).join(' '));
  }
  return ngrams;
}

async function computeTextFingerprint(text: string): Promise<{ fingerprint: string; ngramHashes: string[] }> {
  const normalized = normalizeText(text);
  const ngrams = generateNGrams(normalized, 5);

  const ngramHashes = await Promise.all(ngrams.map(ng => sha1(ng)));
  const uniqueHashes = Array.from(new Set(ngramHashes)).sort();

  const concatenated = uniqueHashes.join('');
  const fingerprint = await sha1(concatenated);

  return { fingerprint, ngramHashes: uniqueHashes };
}

function imageToCanvas(img: HTMLImageElement, size: number = 32): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, size, size);
  return canvas;
}

function computePerceptualHash(canvas: HTMLCanvasElement): string {
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  const grayscale: number[] = [];
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.floor(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    grayscale.push(gray);
  }

  const avg = grayscale.reduce((sum, val) => sum + val, 0) / grayscale.length;

  const bits = grayscale.map(val => val > avg ? '1' : '0').join('');

  let hash = '';
  for (let i = 0; i < bits.length; i += 4) {
    const nibble = bits.substr(i, 4);
    hash += parseInt(nibble, 2).toString(16);
  }

  return hash;
}

async function computeImageFingerprint(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      try {
        const canvas = imageToCanvas(img, 32);
        const phash = computePerceptualHash(canvas);
        URL.revokeObjectURL(url);
        resolve(phash);
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

export async function processFile(file: File): Promise<ProcessResult> {
  const ext = file.name.split('.').pop()?.toLowerCase();

  if (ext === 'txt') {
    const text = await file.text();
    const { fingerprint, ngramHashes } = await computeTextFingerprint(text);
    return { fingerprint, filetype: 'text', ngramHashes };
  } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
    const fingerprint = await computeImageFingerprint(file);
    return { fingerprint, filetype: 'image' };
  } else {
    throw new Error('Unsupported file type. Please upload .txt or image files only.');
  }
}

function hammingDistance(hash1: string, hash2: string): number {
  if (hash1.length !== hash2.length) return 1;

  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    const xor = parseInt(hash1[i], 16) ^ parseInt(hash2[i], 16);
    distance += xor.toString(2).split('1').length - 1;
  }
  return distance;
}

function jaccardSimilarity(set1: string[], set2: string[]): number {
  const s1 = new Set(set1);
  const s2 = new Set(set2);

  const intersection = new Set([...s1].filter(x => s2.has(x)));
  const union = new Set([...s1, ...s2]);

  return union.size === 0 ? 0 : intersection.size / union.size;
}

export function computeSimilarity(
  fp1: string,
  fp2: string,
  type1: 'text' | 'image',
  type2: 'text' | 'image',
  ngrams1?: string[],
  ngrams2?: string[]
): number {
  if (type1 !== type2) return 0;

  if (type1 === 'text') {
    if (ngrams1 && ngrams2) {
      return jaccardSimilarity(ngrams1, ngrams2);
    }
    return fp1 === fp2 ? 1 : 0;
  } else {
    const maxBits = fp1.length * 4;
    const distance = hammingDistance(fp1, fp2);
    return Math.max(0, 1 - distance / maxBits);
  }
}
