import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { prepareSources } from './prepare-sources.mjs';
import { syncExamples } from './sync.mjs';

const args = process.argv.slice(2);
const targetLib = args[0];
const sourceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'examples-textmode-sources-'));

try {
	prepareSources({ sourceRoot, targetLib });
	syncExamples({ sourceRoot, targetLib });
} catch (error) {
	console.error(error.message);
	process.exitCode = 1;
} finally {
	fs.rmSync(sourceRoot, { recursive: true, force: true });
}
