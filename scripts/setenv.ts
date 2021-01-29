const { writeFile, readFileSync } = require('fs');
const { argv } = require('yargs');

require('dotenv').config();

const targetPath = `./src/environments/dotenv.ts`;

const environmentFileContent = `export default ${getEnvKeys()};`;

writeFile(targetPath, environmentFileContent, function (err: Error) {
  if (err) {
    console.error('writeFile', err);
    return;
  }
  console.log(`Wrote variables to ${targetPath}`);
});

function getEnvKeys() {
  const data = readFileSync('.env.example', 'utf-8')
    .split(/\r?\n/)
    .map((line: string) => {
      return line.trim().replace('=', '');
    })
    .filter((item: string) => item)
    .map((key: string) => {
      let value = process.env[key];
      if (value !== 'true' && value !== 'false') {
        value = `"${value}"`;
      }
      return `"${key}": ${value}`;
    })
    .join(',');
  const json = `{${data}}`;
  return JSON.stringify(JSON.parse(json), null, 2);
}
