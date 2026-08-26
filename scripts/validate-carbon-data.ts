import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { validateCarbonInventoryDocument } from '../lib/carbon/validation.ts';
import { PayloadValidationError } from '../lib/providers/errors.ts';

const candidatePath = process.argv[2];

if (!candidatePath) {
  console.error('Usage: npm run validate:carbon -- <path-to-inventory.json>');
  process.exitCode = 2;
} else {
  try {
    const raw = await readFile(resolve(candidatePath), 'utf8');
    const parsed: unknown = JSON.parse(raw);
    const normalized = validateCarbonInventoryDocument(parsed);
    console.log(JSON.stringify(normalized, null, 2));
  } catch (error) {
    if (error instanceof PayloadValidationError) {
      console.error('Carbon inventory validation failed:');
      for (const issue of error.issues) console.error(`- ${issue}`);
      process.exitCode = 1;
    } else if (error instanceof SyntaxError) {
      console.error('Carbon inventory validation failed: the file is not valid JSON.');
      process.exitCode = 1;
    } else {
      console.error('Carbon inventory validation failed: the file could not be read.');
      process.exitCode = 1;
    }
  }
}
