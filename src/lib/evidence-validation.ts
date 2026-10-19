export const MAX_FILE_BYTES = 50 * 1024 * 1024;
export const FILE_TYPES: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', mp4: 'video/mp4', webm: 'video/webm' };

export function validateEvidenceFile(file: { name: string; size: number; type: string }) {
  const extension = file.name.split('.').at(-1)?.toLowerCase() ?? '';
  const mime = FILE_TYPES[extension];
  if (!mime || file.type !== mime) return 'Choose a JPG, PNG, MP4, or WebM file.';
  if (file.size <= 0) return 'This file is empty.';
  if (file.size > MAX_FILE_BYTES) return 'Each file must be 50 MB or smaller.';
  return null;
}

// Check the file signature, not just the user-supplied filename and MIME type.
export async function validateFileContents(file: File) {
  const error = validateEvidenceFile(file);
  if (error) throw new Error(error);
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const png = [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v);
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const mp4 = String.fromCharCode(...bytes.slice(4, 8)) === 'ftyp';
  const webm = [26, 69, 223, 163].every((v, i) => bytes[i] === v);
  if (!(file.type === 'image/png' ? png : file.type === 'image/jpeg' ? jpeg : file.type === 'video/mp4' ? mp4 : webm)) throw new Error('File contents do not match the selected format.');
}