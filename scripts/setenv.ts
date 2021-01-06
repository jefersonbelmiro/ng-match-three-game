const { writeFile, readFileSync } = require('fs');
const { argv } = require('yargs');

require('dotenv').config();

const environment = argv.environment;
const isProduction = environment === 'prod';
const targetPath = isProduction
   ? `./src/environments/environment.prod.ts`
   : `./src/environments/environment.ts`;

// @TODO - get current json and append env
const environmentFileContent = `
export const environment = {
   production: ${isProduction},
   ${getEnvKeys()}
};
`;

writeFile(targetPath, environmentFileContent, function (err) {
   if (err) {
      console.log(err);
   }
   console.log(`Wrote variables to ${targetPath}`);
});

function getEnvKeys() {
  return readFileSync('.env.example', 'utf-8')
    .split(/\r?\n/)
    .map(line => {
      return line.trim().replace('=', '');
    })
    .filter(item => item)
    .map(key => `${key}: "${process.env[key]}"`)
    .join(",\n  ");
}
