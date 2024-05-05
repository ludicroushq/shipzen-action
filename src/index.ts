import { readFileSync, existsSync, writeFileSync, unlinkSync } from 'fs'
import { join} from 'path'
import { apiBaseUrl } from './config/api';
import { VersionData, VersionsData } from './types';
import * as core from '@actions/core'
import { execSync } from 'child_process';

const cwd = process.cwd();

const packagePath = join(cwd, 'package.json');
if (!existsSync(packagePath)) {
  throw new Error('package.json not found');
}

const packageJson = readFileSync(packagePath, 'utf8');
const { shipzen } = JSON.parse(packageJson);

if (!shipzen) {
  throw new Error('shipzen not found in package.json');
}

const version = shipzen.version as string | undefined;

if (!version) {
  throw new Error('shipzen.version not found in package.json');
}

const allVersions = await fetch(`${apiBaseUrl}/api/v1/versions`).then(r => r.json()) as VersionsData

if (!allVersions.ok) {
  throw new Error(allVersions.error);
}

const {versions} = allVersions.data;

const currentVersionIndex = versions.findIndex(v => v === `v${version}`);
const nextVersion = versions[currentVersionIndex - 1]

if (!nextVersion) {
  console.log("No next version found for version:", version);
  process.exit(0);
}

const nextVersionPatch = await fetch(`${apiBaseUrl}/api/v1/versions/${nextVersion}`).then(r => r.json()) as VersionData;

if (!nextVersionPatch.ok) {
  throw new Error(nextVersionPatch.error);
}

const {body, tag, updatePatch} = nextVersionPatch.data;

const patchPath = join(cwd, 'update.diff');
writeFileSync(patchPath, updatePatch);

try {
  execSync(`git apply --reject --whitespace=fix ${patchPath}`, {
    cwd
  })
} catch (error) {
  // ignore
}

unlinkSync(patchPath);

const prBody = `# Instructions

Please review this PR and verify the changes. Ensure that you have done the following:

1. Apply any changes in \`.rej\` files by hand and remove them
2. Follow any instructions in the release notes below. There sometimes may be changes you need to make by hand

# Release Notes

${body}`

core.setOutput('pr-title', `ShipZen: v${version} -> ${nextVersion}`);
core.setOutput('pr-body', prBody);
