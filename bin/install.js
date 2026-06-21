#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

const SKILL_NAME = 'fivem-resource-builder';
const SKILL_DIR = path.join(os.homedir(), '.claude', 'skills', SKILL_NAME);
const PKG_ROOT = path.join(__dirname, '..');
const SOURCE_SKILL = path.join(PKG_ROOT, 'SKILL.md');
const SOURCE_TEMPLATES = path.join(PKG_ROOT, 'templates');

const CYAN = '\x1b[36m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

function banner() {
    console.log('');
    console.log(`${CYAN}${BOLD}  ╔══════════════════════════════════════╗${RESET}`);
    console.log(`${CYAN}${BOLD}  ║ FiveM Resource Builder - Claude Code ║${RESET}`);
    console.log(`${CYAN}${BOLD}  ║         v1.0 by Dei                  ║${RESET}`);
    console.log(`${CYAN}${BOLD}  ╚══════════════════════════════════════╝${RESET}`);
    console.log('');
}

function copyDirRecursive(src, dest) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const s = path.join(src, entry.name);
        const d = path.join(dest, entry.name);
        if (entry.isDirectory()) copyDirRecursive(s, d);
        else fs.copyFileSync(s, d);
    }
}

function install() {
    banner();

    if (!fs.existsSync(SOURCE_SKILL)) {
        console.log(`${RED}Error: SKILL.md not found in package${RESET}`);
        process.exit(1);
    }

    fs.mkdirSync(SKILL_DIR, { recursive: true });
    fs.copyFileSync(SOURCE_SKILL, path.join(SKILL_DIR, 'SKILL.md'));

    let templateCount = 0;
    if (fs.existsSync(SOURCE_TEMPLATES)) {
        copyDirRecursive(SOURCE_TEMPLATES, path.join(SKILL_DIR, 'templates'));
        templateCount = fs.readdirSync(SOURCE_TEMPLATES).filter(f => f.endsWith('.md')).length;
    }

    console.log(`${GREEN}${BOLD}Installed successfully!${RESET}`);
    console.log('');
    console.log(`  ${CYAN}Skill:${RESET}    ${SKILL_NAME}`);
    console.log(`  ${CYAN}Location:${RESET} ${SKILL_DIR}`);
    console.log(`  ${CYAN}Files:${RESET}    SKILL.md + ${templateCount} templates`);
    console.log('');
    console.log(`${BOLD}Usage:${RESET}`);
    console.log(`    ${GREEN}/fivem-resource-builder${RESET}`);
    console.log(`  Or ask naturally:`);
    console.log(`    ${CYAN}"create a FiveM shop resource for QBCore"${RESET}`);
    console.log(`    ${CYAN}"scaffold an ESX garage script"${RESET}`);
    console.log(`    ${CYAN}"add a secure server event"${RESET}`);
    console.log('');
    console.log(`${DIM}Pairs with: fivem-security-audit (run it to verify what you build).${RESET}`);
    console.log('');
    console.log(`${YELLOW}Restart Claude Code for the skill to take effect.${RESET}`);
    console.log('');
}

if (process.argv.includes('--uninstall') || process.argv.includes('-u')) {
    banner();
    if (fs.existsSync(SKILL_DIR)) {
        fs.rmSync(SKILL_DIR, { recursive: true });
        console.log(`${GREEN}Uninstalled.${RESET} Removed: ${SKILL_DIR}`);
    } else {
        console.log(`${YELLOW}Skill not found at ${SKILL_DIR}${RESET}`);
    }
    console.log('');
    process.exit(0);
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
    banner();
    console.log(`${BOLD}Commands:${RESET}`);
    console.log(`  ${GREEN}npx fivem-resource-builder${RESET}              Install the skill`);
    console.log(`  ${GREEN}npx fivem-resource-builder --uninstall${RESET}  Remove the skill`);
    console.log('');
    process.exit(0);
}

install();
