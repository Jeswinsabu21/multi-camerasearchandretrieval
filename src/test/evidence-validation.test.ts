import { describe, it, expect } from 'vitest';
import { validateEvidenceFile, validateFileContents } from '@/lib/evidence-validation';
describe('Evidence uses supported uploads only', () => {
  it('accepts JPG, PNG, MP4, and WebM', () => {
    for (const [name, type] of [['frame.jpg', 'image/jpeg'], ['frame.png', 'image/png'], ['camera.mp4', 'video/mp4'], ['camera.webm', 'video/webm']]) expect(validateEvidenceFile({ name, type, size: 200 })).toBeNull();
  });
  it('rejects unsupported and mislabeled files', () => {
    expect(validateEvidenceFile({ name: 'data.txt', type: 'text/plain', size: 100 })).not.toBeNull();
    expect(validateEvidenceFile({ name: 'frame.png', type: 'image/jpeg', size: 100 })).not.toBeNull();
  });
  it('rejects empty files', () => { expect(validateEvidenceFile({ name: 'frame.png', type: 'image/png', size: 0 })).not.toBeNull(); });
  it('rejects a fake image signature', async () => {
    const fake = { name: 'frame.png', type: 'image/png', size: 100, slice: () => ({ arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer }) } as unknown as File;
    await expect(validateFileContents(fake)).rejects.toThrow('File contents do not match');
  });
});