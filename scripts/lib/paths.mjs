import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const PUBLIC = path.join(ROOT, 'public');
export const DIST = path.join(ROOT, 'dist');
export const VENDOR = path.join(PUBLIC, 'vendor');
export const SOURCE_ROOT = path.resolve(process.env.TEXTMODE_EXAMPLES_SOURCE_ROOT || path.join(ROOT, '.sources'));
export const LIBRARIES_PATH = path.join(ROOT, 'libraries.json');
export const SOURCE_METADATA_PATH = path.join(PUBLIC, 'source-metadata.json');

export function projectPath(absPath) {
	return path.relative(ROOT, absPath);
}
