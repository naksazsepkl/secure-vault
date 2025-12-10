import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

const CONTRACT_NAME = "SecureVault";
const rel = "../backend";
const outdir = path.resolve("./abi");

if (!fs.existsSync(outdir)) {
  fs.mkdirSync(outdir);
}

const dir = path.resolve(rel);
const deploymentsDir = path.join(dir, "deployments");

function readDeployment(chainName, chainId, contractName, optional) {
  const chainDeploymentDir = path.join(deploymentsDir, chainName);

  if (!fs.existsSync(chainDeploymentDir)) {
    if (!optional) {
      console.error(
        `\n===================================================================\nUnable to locate '${chainDeploymentDir}' directory.\n\n1. Goto 'backend' directory\n2. Run 'npx hardhat deploy --network ${chainName}'.\n===================================================================\n`
      );
      process.exit(1);
    }
    return undefined;
  }

  const jsonString = fs.readFileSync(
    path.join(chainDeploymentDir, `${contractName}.json`),
    "utf-8"
  );

  const obj = JSON.parse(jsonString);
  obj.chainId = chainId;
  return obj;
}

// Try to read both deployments, allowing either one to be missing
const deployLocalhost = readDeployment("localhost", 31337, CONTRACT_NAME, true);
const deploySepolia = readDeployment("sepolia", 11155111, CONTRACT_NAME, true);

if (!deployLocalhost && !deploySepolia) {
  console.error(
    `\n===================================================================\nUnable to find any deployments.\n\n1. Goto 'backend' directory\n2. Run 'npx hardhat deploy --network sepolia' (or 'localhost')\n===================================================================\n`
  );
  process.exit(1);
}

if (deployLocalhost && deploySepolia) {
  if (JSON.stringify(deployLocalhost.abi) !== JSON.stringify(deploySepolia.abi)) {
    console.error(
      `\n===================================================================\nDeployments on localhost and Sepolia differ. Cant use the same abi on both networks. Consider re-deploying the contracts on both networks.\n===================================================================\n`
    );
    process.exit(1);
  }
}

// Prefer Sepolia ABI if available, otherwise fallback to localhost
const abiSource = deploySepolia ?? deployLocalhost;

const tsCode = `
/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const ${CONTRACT_NAME}ABI = ${JSON.stringify({ abi: abiSource.abi }, null, 2)} as const;
\n`;
const tsAddresses = `
/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const ${CONTRACT_NAME}Addresses = { 
  "11155111": { address: "${deploySepolia ? deploySepolia.address : "0x0000000000000000000000000000000000000000"}", chainId: 11155111, chainName: "sepolia" },
  "31337": { address: "${deployLocalhost ? deployLocalhost.address : "0x0000000000000000000000000000000000000000"}", chainId: 31337, chainName: "hardhat" },
};
`;

fs.writeFileSync(path.join(outdir, `${CONTRACT_NAME}ABI.ts`), tsCode, "utf-8");
fs.writeFileSync(
  path.join(outdir, `${CONTRACT_NAME}Addresses.ts`),
  tsAddresses,
  "utf-8"
);

console.log(`Generated ${path.join(outdir, `${CONTRACT_NAME}ABI.ts`)}`);
console.log(`Generated ${path.join(outdir, `${CONTRACT_NAME}Addresses.ts`)}`);
