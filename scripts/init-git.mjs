import fs from 'fs';
import path from 'path';

const dir = process.cwd();
const gitDir = path.join(dir, '.git');

function main() {
  console.log('Checking Git repository status at:', dir);
  if (!fs.existsSync(gitDir)) {
    fs.mkdirSync(gitDir, { recursive: true });
    fs.writeFileSync(path.join(gitDir, 'HEAD'), 'ref: refs/heads/main\n', 'utf-8');
    fs.writeFileSync(
      path.join(gitDir, 'config'),
      '[core]\n\trepositoryformatversion = 0\n\tfilemode = false\n\tbare = false\n\tlogallrefupdates = true\n\tsymlinks = false\n\tignorecase = true\n',
      'utf-8'
    );
    console.log('✓ Git repository initialized with default branch: main');
  } else {
    console.log('✓ Git repository already initialized at:', gitDir);
  }
}

main();
