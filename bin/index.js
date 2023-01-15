#! /usr/bin/env node
const { execSync } = require('child_process');

const args = process.argv.slice(2);

const repoName = args[0];

execSync(
  `git clone https://github.com/k2sebeom/ts-express-template.git ${repoName}`,
  {
    stdio: 'inherit',
  }
);

if (args.length > 1) {
  execSync(`cd ${repoName} && git checkout ${args[1]}`, {
    stdio: 'inherit',
  });
}

execSync(
  `cd ${repoName} && rm -rf .git && git init && git add . && git commit -m "Initial commit" && git branch -M main`,
  {
    stdio: 'inherit',
  }
);

console.log('Installing Dependencies...');

execSync(`cd ${repoName} && yarn`, {
  stdio: 'inherit',
});

console.log(`
==============
Express Typescript App initialized in ${repoName}
==============`);
