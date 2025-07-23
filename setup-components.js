import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const componentsDir = path.resolve(__dirname, 'src', 'components');

const filesToCheck = [
  { name: 'CyberDashboard.tsx', create: false },
  { name: 'CyberTerminal.tsx', create: false },
  { name: 'ModuleDashboard.tsx', create: false },
  { name: 'SystemMonitor.tsx', create: false },
  { name: 'NotFoundPage.tsx', create: false },
  { name: 'LoginPage.tsx', create: true },
  { name: 'UnauthorizedPage.tsx', create: true },
];

const loginPageContent = `import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage: FC = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    // TODO: Implement real login logic here
    navigate('/', { replace: true });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">Login</h1>
      <button
        onClick={handleLogin}
        className="px-6 py-2 bg-primary text-white rounded hover:bg-primary-dark"
      >
        Log In
      </button>
    </div>
  );
};

export default LoginPage;
`;

const unauthorizedPageContent = `import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';

const UnauthorizedPage: FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4 text-red-600">Unauthorized</h1>
      <p className="mb-6">You do not have permission to access this page.</p>
      <button
        onClick={() => navigate('/', { replace: true })}
        className="px-6 py-2 bg-secondary text-white rounded hover:bg-secondary-dark"
      >
        Go Home
      </button>
    </div>
  );
};

export default UnauthorizedPage;
`;

async function ensureDirExists(dir) {
  try {
    await fs.promises.access(dir, fs.constants.F_OK);
  } catch {
    console.log(`Directory not found: ${dir}. Creating it...`);
    await fs.promises.mkdir(dir, { recursive: true });
  }
}

async function checkAndCreateFiles() {
  await ensureDirExists(componentsDir);

  for (const file of filesToCheck) {
    const filePath = path.join(componentsDir, file.name);
    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
      console.log(`✅ ${file.name} already exists.`);
    } catch {
      if (file.create) {
        console.log(`✍️ Creating ${file.name}...`);
        let content = '';
        if (file.name === 'LoginPage.tsx') content = loginPageContent;
        else if (file.name === 'UnauthorizedPage.tsx') content = unauthorizedPageContent;
        else content = `// TODO: Implement ${file.name}`;

        await fs.promises.writeFile(filePath, content, 'utf8');
        console.log(`Created ${file.name}`);
      } else {
        console.log(`⚠️  ${file.name} does not exist and no template is provided. Please create it manually.`);
      }
    }
  }
}

checkAndCreateFiles().catch(err => {
  console.error('Error setting up component files:', err);
});
