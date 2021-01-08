const { writeFile, readFileSync } = require('fs');
const { argv } = require('yargs');

require('dotenv').config();

const targetPath = `./src/environments/dotenv.ts`;

const environmentFileContent = `export default ${getEnvKeys()};`;

writeFile(targetPath, environmentFileContent, function (err) {
  if (err) {
    console.log(err);
  }
  console.log(`Wrote variables to ${targetPath}`);
});

function getEnvKeys() {
  const data = readFileSync('.env.example', 'utf-8')
    .split(/\r?\n/)
    .map((line) => {
      return line.trim().replace('=', '');
    })
    .filter((item) => item)
    .map((key) => `"${key}": "${process.env[key]}"`)
    .join(',');
  const json = `{${data}}`;
  return JSON.stringify(JSON.parse(json), null, 2);
}
