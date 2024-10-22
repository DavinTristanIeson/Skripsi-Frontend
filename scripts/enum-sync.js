const fs = require('fs/promises');
const { pascalize } = require('humps');

const ENDPOINT = 'http://127.0.0.1:8000/api/enums';
const ENUM_FILE_PATH = 'src/common/constants/enum.ts';

/**
 * @param {string} identifier
 */
function isValidIdentifier(identifier) {
  const firstChar = identifier[0].charCodeAt(0);
  return (
    identifier.search(/[^a-zA-Z0-9]/) === -1 &&
    !(firstChar >= 48 && firstChar <= 48 + 9)
  );
}

/**
 * @param {string} enumClass
 * @param {Record<string, string>} enumValues
 */
function stringifyEnum(enumClass, enumValues) {
  const enumValueDeclaration = Object.entries(enumValues)
    .map(([label, value]) => {
      const isValid = isValidIdentifier(label);
      return `  ${isValid ? label : `'${label}'`} = '${value}',`;
    })
    .join('\n');
  if (Object.values(enumValues).length) {
    return `export enum ${enumClass} {\n${enumValueDeclaration}\n}\n`;
  } else {
    return `export enum ${enumClass} {}\n`;
  }
}

async function main() {
  // STEP 1: Fetch all enums
  console.log('LOG: Fetching all enums...');
  const res = await fetch(ENDPOINT);
  const json = await res.json();
  const allEnums = json.data

  // STEP 2: Stringify
  const enumDeclarations = Object.entries(allEnums)
    .map(([enumClass, enumValues]) =>
      stringifyEnum(enumClass, enumValues),
    )
    .join('\n');

  const enumListDeclaration = stringifyEnum(
    'EnumList',
    Object.fromEntries(Object.keys(allEnums).map((enumClass) => [enumClass, enumClass]))
  );

  const fileContents = `// This file was auto-generated by scripts/enum-sync.js\n\n${enumDeclarations}\n${enumListDeclaration}`;

  // STEP 3: Write to file
  await fs.writeFile(ENUM_FILE_PATH, fileContents, {
    encoding: 'utf-8',
  });
  console.log(`Enum file has been generated at ${ENUM_FILE_PATH}`);
}
main();