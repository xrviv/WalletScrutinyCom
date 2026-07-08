#!/usr/bin/env node

/**
 * Verification notifier — flags sourceavailable desktop wallets whose latest
 * upstream release is newer than the latest reproducibility verification we
 * have on Nostr (kind 30301).
 *
 * Latest release: reused from refreshDesktop.mjs's per-app fetch logic (handles
 * apps with non-standard GitHub releases, e.g. Electrum, Blockstream Green).
 *
 * Latest verification: read from Nostr. Live relay data is cross-checked
 * against the local backup (scripts/nostrVerificationIndex.mjs's event source)
 * since individual relays are known to drop or fail to index events; the
 * merged result is what gets compared, and any app resolved only from the
 * backup (not confirmed on relays just now) is marked accordingly.
 */

import fs from 'fs';
import path from 'path';
import minimist from 'minimist';
import { colors, getGitHubToken, getMarkdownFiles, parseFrontmatter, sleep, normalizeVersion, areVersionsEquivalent } from './refresh_common.mjs';
import { getRateLimitDelay } from './github_common.mjs';
import { getDesktopVersion } from './refreshDesktop.mjs';
import { loadBackupEvents, gatherRelayData } from './verifications/tools/nostr-data.mjs';
import { buildDetailedIndexFromEvents, getLatestVerificationEntry } from './nostrVerificationIndex.mjs';

const DESKTOP_DIR = '_desktop';
const MD_PLATFORM = 'desktop';

const args = minimist(process.argv.slice(2), {
  boolean: ['offline', 'help'],
  string: ['g'],
  alias: { g: 'github-token', h: 'help' },
});

function showUsage() {
  console.log(`
Usage: node scripts/verificationNotifier.mjs [options]

Scans _desktop/*.md entries with meta:ok and verdict:sourceavailable, compares
each app's latest upstream release against the latest reproducibility
verification available on Nostr, and lists apps that need re-verification.

Options:
  -g, --github-token <token>  GitHub token (fallback: GITHUB_TOKEN env var)
  --offline                   Skip the live relay query; use only the local
                               Nostr backup (backup/nostr-verification-events).
                               Faster, but may miss very recent verifications.
  -h, --help                  Show this help message
`);
}

if (args.help) {
  showUsage();
  process.exit(0);
}

function dedupeById(events) {
  const byId = new Map();
  for (const e of events) {
    if (e?.id) byId.set(e.id, e);
  }
  return [...byId.values()];
}

async function loadCandidateApps() {
  const files = getMarkdownFiles(DESKTOP_DIR);
  const apps = [];
  const skippedNoRepo = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(DESKTOP_DIR, file), 'utf8');
    const fm = parseFrontmatter(content);

    if (fm.meta !== 'ok' || fm.verdict !== 'sourceavailable') continue;

    if (!fm.repository || !fm.repository.includes('github.com')) {
      skippedNoRepo.push(file);
      continue;
    }

    apps.push({
      file,
      appId: fm.appId,
      title: fm.title,
      repository: fm.repository,
      mdVersion: fm.version || null,
    });
  }

  return { apps, skippedNoRepo };
}

async function main() {
  const token = getGitHubToken(args);
  if (!token) {
    console.log(`${colors.yellow}No GitHub token provided${colors.reset} — using unauthenticated API (60 req/hour).`);
    console.log(`   Use -g <token> or set GITHUB_TOKEN environment variable.\n`);
  }

  console.log(`${colors.cyan}🔔 Verification notifier — desktop${colors.reset}`);

  const { apps, skippedNoRepo } = await loadCandidateApps();
  console.log(`Found ${apps.length} desktop wallet(s) with meta:ok and verdict:sourceavailable`);
  if (skippedNoRepo.length > 0) {
    console.log(`${colors.gray}Skipped (no GitHub repository): ${skippedNoRepo.join(', ')}${colors.reset}`);
  }

  // ---- latest release per app ----
  const delay = getRateLimitDelay(!!token);
  const releaseResults = new Map();
  for (const app of apps) {
    try {
      const release = await getDesktopVersion(app.file, app.repository, token);
      releaseResults.set(app.appId, { ok: true, ...release });
    } catch (error) {
      releaseResults.set(app.appId, { ok: false, error: error.message });
    }
    await sleep(delay);
  }

  // ---- Nostr verification data: local backup + live relays, merged ----
  console.log(`\n${colors.cyan}Loading local Nostr verification backup...${colors.reset}`);
  const backupEvents = await loadBackupEvents();
  console.log(`  ${backupEvents.length} WalletScrutiny verification event(s) in local backup.`);

  let liveEvents = [];
  if (!args.offline) {
    console.log(`\n${colors.cyan}Querying live relays (cross-check against backup)...${colors.reset}`);
    try {
      const relayData = await gatherRelayData();
      liveEvents = Object.values(relayData).flat();
    } catch (error) {
      console.log(`${colors.yellow}Live relay query failed (${error.message}) — falling back to backup only.${colors.reset}`);
    }
  } else {
    console.log(`\n${colors.gray}--offline: skipping live relay query, using local backup only.${colors.reset}`);
  }

  const liveEventIds = new Set(liveEvents.map(e => e.id));
  const mergedEvents = dedupeById([...backupEvents, ...liveEvents]);
  const mergedIndex = buildDetailedIndexFromEvents(mergedEvents);

  // ---- compare + report ----
  console.log(`\n${colors.cyan}──── Results ────${colors.reset}`);
  printf('%-24s  %-16s  %-16s  %-10s  %s\n', 'App', 'Latest Release', 'Last Verified', 'Status', 'Source');
  console.log('━'.repeat(100));

  const needsVerification = [];
  const noReleaseInfo = [];

  for (const app of apps) {
    const release = releaseResults.get(app.appId);
    const entry = getLatestVerificationEntry(mergedIndex, app.appId, MD_PLATFORM);

    if (!release?.ok) {
      noReleaseInfo.push({ app, error: release?.error });
      printf('%-24s  %-16s  %-16s  %-10s  %s\n', app.appId, `${colors.red}ERROR${colors.reset}`, '—', '—', release?.error ?? 'unknown error');
      continue;
    }

    const releaseVersion = normalizeVersion(release.version);
    let verifiedLabel = '(none)';
    let statusLabel = `${colors.yellow}❓ NO VERIF${colors.reset}`;
    let sourceLabel = '—';

    if (entry) {
      verifiedLabel = entry.version;
      sourceLabel = liveEventIds.has(entry.id) ? 'live' : `${colors.gray}backup only${colors.reset}`;
      if (areVersionsEquivalent(entry.version, releaseVersion)) {
        statusLabel = `${colors.green}✅ up to date${colors.reset}`;
      } else {
        statusLabel = `${colors.yellow}⚠ NEEDS CHECK${colors.reset}`;
        needsVerification.push({ app, releaseVersion, entry, sourceLabel });
      }
    } else {
      needsVerification.push({ app, releaseVersion, entry: null, sourceLabel: '—' });
    }

    printf('%-24s  %-16s  %-16s  %-10s  %s\n', app.appId, releaseVersion, verifiedLabel, statusLabel, sourceLabel);
  }

  console.log('');
  if (needsVerification.length > 0) {
    console.log(`${colors.yellow}──── Needs verification (${needsVerification.length}) ────${colors.reset}`);
    for (const { app, releaseVersion, entry, sourceLabel } of needsVerification) {
      const lastKnown = entry ? `${entry.version} (${entry.status})` : 'no verification on record';
      console.log(`  • ${colors.cyan}${app.appId}${colors.reset} (${app.title ?? app.file})`);
      console.log(`      current release: ${releaseVersion}`);
      console.log(`      last known Nostr verification: ${lastKnown}${entry ? ` [${sourceLabel === 'live' ? 'confirmed live' : 'from local backup only'}]` : ''}`);
    }
  } else {
    console.log(`${colors.green}All apps with known releases are up to date on Nostr. ✅${colors.reset}`);
  }

  if (noReleaseInfo.length > 0) {
    console.log(`\n${colors.red}Could not determine latest release for ${noReleaseInfo.length} app(s):${colors.reset}`);
    for (const { app, error } of noReleaseInfo) {
      console.log(`  • ${app.appId}: ${error}`);
    }
  }
}

function printf(fmt, ...vals) {
  // Minimal printf-style helper (matches uploader script conventions), strips
  // ANSI codes only for width calculation so colored columns still align.
  let i = 0;
  const out = fmt.replace(/%-?(\d+)?s/g, (m, width) => {
    const raw = String(vals[i++] ?? '');
    const visibleLen = raw.replace(/\x1b\[[0-9;]*m/g, '').length;
    const pad = width ? Math.max(0, Number(width) - visibleLen) : 0;
    return m.startsWith('%-') ? raw + ' '.repeat(pad) : ' '.repeat(pad) + raw;
  });
  process.stdout.write(out);
}

main().catch(error => {
  console.error(`${colors.red}Unexpected error:${colors.reset} ${error.message}`);
  process.exit(1);
});
