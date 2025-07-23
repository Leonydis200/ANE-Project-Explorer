// repair-imports.ts

import fs from 'fs';
import path from 'path';

const filePath = path.resolve(__dirname, 'src/App.tsx');

let content = fs.readFileSync(filePath, 'utf-8');

// Replace incorrect multiline import
content = content.replace(
  /import\s+\{[^}]+\}\s+from\s+'@tanstack\/react-query',?\s*import\s+\{[^}]+\}\s+from\s+'@tanstack\/react-query',?\s*} from '@tanstack\/react-query';?/gs,
  ''
);

// Fix the broken import statements manually
content = content.replace(
  /import\s+\{ QueryCache \} from '@tanstack\/react-query',?\s*import\s+\{ MutationCache \} from '@tanstack\/react-query',?\s*} from '@tanstack\/react-query';?/gs,
  `import { QueryCache, MutationCache } from '@tanstack/react-query';`
);

// OR simply match and fix lines if above fails
content = content.replace(
  /import\s+\{ QueryCache \} from '@tanstack\/react-query',?\s*import\s+\{ MutationCache \} from '@tanstack\/react-query',?\s*} from '@tanstack\/react-query';?/gs,
  ''
);

// Replace broken syntax with corrected line
content = content.replace(
  /import\s+\{ QueryCache \} from '@tanstack\/react-query',?\s*import\s+\{ MutationCache \} from '@tanstack\/react-query',?\s*}? from '@tanstack\/react-query';?/gs,
  `import { QueryCache, MutationCache } from '@tanstack/react-query';`
);

// OR best option: simply match and fix known lines
content = content.replace(
  /import\s+\{ QueryCache \} from '@tanstack\/react-query',\s*import\s+\{ MutationCache \} from '@tanstack\/react-query',\s*} from '@tanstack\/react-query';?/gs,
  `import { QueryCache, MutationCache } from '@tanstack/react-query';`
);

// Save the repaired file
fs.writeFileSync(filePath, content);

console.log('✅ Fixed import statements in src/App.tsx');
