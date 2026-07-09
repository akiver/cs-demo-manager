#!/usr/bin/node
import path from 'node:path';
import os from 'node:os';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import fs from 'fs-extra';

const require = createRequire(import.meta.url);
const asar = require('@electron/asar');

const rootFolderPath = fileURLToPath(new URL('..', import.meta.url));
const outFolderPath = path.resolve(rootFolderPath, 'out');
const assetsFolderPath = path.resolve(outFolderPath, 'assets');
const defaultInstalledAppPath = path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'cs-demo-manager');
const installedAppPath = process.env.CSDM_INSTALLED_APP_PATH ?? defaultInstalledAppPath;
const installedAsarPath = path.join(installedAppPath, 'resources', 'app.asar');

function readMessagesChunk(content) {
  const script = content.replace(/export\{e as messages\};?/, 'globalThis.messages = e;');
  const context = {
    JSON,
    globalThis: {},
  };
  vm.runInNewContext(script, context);

  return context.globalThis.messages;
}

function normalizeAsarPath(filePath) {
  return filePath.replaceAll('\\', '/');
}

function normalizeMessageId(id) {
  return id.replaceAll('+', '-').replaceAll('/', '_');
}

function normalizeMessageIds(messages) {
  const normalizedMessages = {};

  for (const [id, message] of Object.entries(messages)) {
    normalizedMessages[id] = message;
    normalizedMessages[normalizeMessageId(id)] ??= message;
  }

  return normalizedMessages;
}

function findAsarFile(normalizedFilePath) {
  const filePath = asar.listPackage(installedAsarPath).find((filePath) => {
    return normalizeAsarPath(filePath) === normalizedFilePath;
  });

  if (filePath === undefined) {
    throw new Error(`"${normalizedFilePath}" was not found in ${installedAsarPath}`);
  }

  return filePath;
}

function extractAsarFile(normalizedFilePath) {
  const filePath = findAsarFile(normalizedFilePath);

  return asar.extractFile(installedAsarPath, filePath.slice(1));
}

function writeMessagesChunk(filePath, messages) {
  const content = `var e=${JSON.stringify(messages)};export{e as messages};\n`;
  fs.writeFileSync(filePath, content, 'utf8');
}

function compileEnglishMessage(message) {
  const chunks = [];
  let lastIndex = 0;

  for (const match of message.matchAll(/\{([^}]+)\}/g)) {
    if (match.index > lastIndex) {
      chunks.push(message.slice(lastIndex, match.index));
    }

    chunks.push([match[1]]);
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < message.length) {
    chunks.push(message.slice(lastIndex));
  }

  return chunks.length === 0 ? [message] : chunks;
}

function findBuiltMessagesChunk(locale) {
  const indexFileNames = fs
    .readdirSync(assetsFolderPath)
    .filter((fileName) => fileName.startsWith('index-') && fileName.endsWith('.js'));
  const translationPath = `../translations/${locale}/messages.po`;

  for (const fileName of indexFileNames) {
    const filePath = path.join(assetsFolderPath, fileName);
    const content = fs.readFileSync(filePath, 'utf8');
    const translationIndex = content.indexOf(translationPath);
    if (translationIndex === -1) {
      continue;
    }

    const slice = content.slice(translationIndex, translationIndex + 500);
    const chunkStart = slice.indexOf('messages-');
    if (chunkStart === -1) {
      continue;
    }

    const chunkEnd = slice.indexOf('.js', chunkStart);
    if (chunkEnd === -1) {
      continue;
    }

    return slice.slice(chunkStart, chunkEnd + 3);
  }

  throw new Error(`Could not find built ${locale} messages chunk in ${assetsFolderPath}`);
}

function findOfficialSimplifiedChineseMessages() {
  const messageFiles = asar
    .listPackage(installedAsarPath)
    .filter((filePath) => /^\/assets\/messages-.+\.js$/.test(normalizeAsarPath(filePath)));

  for (const filePath of messageFiles) {
    const content = asar.extractFile(installedAsarPath, filePath.slice(1)).toString('utf8');
    const messages = readMessagesChunk(content);
    const serializedMessages = JSON.stringify(messages);

    if (serializedMessages.includes('应用程序语言') && serializedMessages.includes('概览')) {
      return normalizeMessageIds(messages);
    }
  }

  throw new Error(`Could not find Simplified Chinese renderer messages in ${installedAsarPath}`);
}

function createManualTranslations() {
  const translations = new Map();
  const set = (message, translation) => {
    translations.set(JSON.stringify(compileEnglishMessage(message)), translation);
  };

  set('Flashbang', ['闪光弹']);
  set('HE grenade', ['高爆手雷']);
  set('Molotov / Incendiary', ['燃烧瓶 / 燃烧弹']);
  set('Smoke grenade', ['烟雾弹']);
  set('Grenade averages', ['投掷物平均数据']);
  set('Grenade', ['投掷物']);
  set('Grenade', ['投掷物'], 'Table header');
  set('Grenade', ['投掷物'], 'Table header tooltip');
  set('Thrown', ['投掷数'], 'Table header');
  set('Thrown by this player', ['该玩家投掷'], 'Table header tooltip');
  set('Avg / match', ['场均'], 'Table header');
  set('Average thrown per match', ['场均投掷'], 'Table header tooltip');
  set('Avg / round', ['回合均'], 'Table header');
  set('Average thrown per round', ['回合均投掷'], 'Table header tooltip');
  set('Enemy damage', ['对敌伤害'], 'Table header');
  set('Damage dealt to enemies', ['对敌人造成的伤害'], 'Table header tooltip');
  set('Damage / throw', ['每投伤害'], 'Table header');
  set('Damage dealt to enemies per throw', ['每次投掷对敌人造成的伤害'], 'Table header tooltip');
  set('Kills', ['击杀'], 'Table header');
  set('Enemy kills', ['击杀敌人数'], 'Table header tooltip');
  set('Steam ID', ['Steam ID'], 'Table header');
  set('Steam ID', ['Steam ID'], 'Table header tooltip');
  set('Flashes', ['闪白次数'], 'Table header');
  set('Flashbang count', ['闪光弹命中次数'], 'Table header tooltip');
  set('Total blind time', ['总致盲时间'], 'Table header');
  set('Total enemy blind time', ['敌人总致盲时间'], 'Table header tooltip');
  set('Avg blind time', ['平均致盲时间'], 'Table header');
  set('Average blind time', ['平均致盲时间'], 'Table header tooltip');

  set('Flashbangs thrown / match', ['场均闪光弹投掷']);
  set('Enemies flashed / match', ['场均闪白敌人']);
  set('Enemy blind time / flash', ['每次闪光敌人致盲时间']);
  set('Enemy HE damage / match', ['场均高爆对敌伤害']);
  set('Enemy fire damage / match', ['场均火焰对敌伤害']);
  set('Smokes thrown / match', ['场均烟雾弹投掷']);
  set('Thrown by this player: {flashbangsThrownCount}', ['该玩家投掷：', ['flashbangsThrownCount']]);
  set('Thrown by this player: {smokeGrenadesThrownCount}', ['该玩家投掷：', ['smokeGrenadesThrownCount']]);
  set('Enemies flashed by this player: {flashedEnemyCount}', ['该玩家闪白敌人：', ['flashedEnemyCount']]);
  set('Total enemy blind time caused: {totalEnemyBlindDuration}s', [
    '造成敌人总致盲时间：',
    ['totalEnemyBlindDuration'],
    '秒',
  ]);
  set('Damage dealt to enemies: {heDamage}', ['对敌人造成伤害：', ['heDamage']]);
  set('Damage dealt to enemies: {fireDamage}', ['对敌人造成伤害：', ['fireDamage']]);
  set('Players flashed by this player', ['该玩家闪到的对手']);
  set('Enemy players flashed by this player only.', ['只统计该玩家闪到的敌方玩家。']);
  set('No enemy player was flashed by this player for the current filters.', [
    '当前筛选条件下，该玩家没有闪到敌方玩家。',
  ]);
  set('Players who flashed this player', ['闪到该玩家的对手']);
  set('Enemy players who flashed this player only.', ['只统计闪到该玩家的敌方玩家。']);
  set('No enemy player flashed this player for the current filters.', ['当前筛选条件下，没有敌方玩家闪到该玩家。']);
  set('No grenade stats found for the current filters.', ['当前筛选条件下未找到投掷物统计。']);
  set('{averageEnemyBlindDuration}s', [['averageEnemyBlindDuration'], '秒'], 'Seconds');
  set('{totalDuration}s', [['totalDuration'], '秒'], 'Seconds');
  set('{averageDuration}s', [['averageDuration'], '秒'], 'Seconds');

  set('Total blind time', ['总致盲时间'], 'Table header tooltip');
  set('Enemies flashed / match', ['场均闪白敌人'], 'Table header');
  set('Enemy players flashed by this player per match', ['该玩家场均闪白敌方玩家'], 'Table header tooltip');
  set('Teammates flashed / match', ['场均闪白队友'], 'Table header');
  set('Teammates flashed by this player per match', ['该玩家场均闪白队友'], 'Table header tooltip');
  set('Flashed by enemies / match', ['场均被敌人闪白'], 'Table header');
  set('Times this player was flashed by enemies per match', ['该玩家场均被敌人闪白次数'], 'Table header tooltip');
  set('Flashed by teammates / match', ['场均被队友闪白'], 'Table header');
  set('Times this player was flashed by teammates per match', ['该玩家场均被队友闪白次数'], 'Table header tooltip');
  set('Relation', ['关系'], 'Table header');
  set('Player relation', ['玩家关系'], 'Table header tooltip');
  set('Teammates flashed / match', ['场均闪白队友']);
  set('Flashed by enemies / match', ['场均被敌人闪白']);
  set('Flashed by teammates / match', ['场均被队友闪白']);
  set('Teammates flashed by this player: {flashedTeammateCount}', ['该玩家闪白队友：', ['flashedTeammateCount']]);
  set('Times this player was flashed by enemies: {flashedByEnemyCount}', [
    '该玩家被敌人闪白次数：',
    ['flashedByEnemyCount'],
  ]);
  set('Times this player was flashed by teammates: {flashedByTeammateCount}', [
    '该玩家被队友闪白次数：',
    ['flashedByTeammateCount'],
  ]);
  set('Players flashed by this player', ['该玩家闪到的玩家']);
  set('Enemy and teammate players flashed by this player.', ['该玩家闪到的敌方和队友玩家。']);
  set('No player was flashed by this player for the current filters.', ['当前筛选条件下，该玩家没有闪到其他玩家。']);
  set('Players who flashed this player', ['闪到该玩家的玩家']);
  set('Enemy and teammate players who flashed this player.', ['闪到该玩家的敌方和队友玩家。']);
  set('No player flashed this player for the current filters.', ['当前筛选条件下，没有其他玩家闪到该玩家。']);
  set('Enemy', ['敌人']);
  set('Teammate', ['队友']);
  set('Enemy impact / match', ['场均对敌影响'], 'Table header');
  set('Teammate impact / match', ['场均对队友影响'], 'Table header');
  set('Enemy impact received / match', ['场均受到敌人影响'], 'Table header');
  set('Teammate impact received / match', ['场均受到队友影响'], 'Table header');
  set(
    'Flash count for flashbangs, damage for HE and fire grenades',
    ['闪光弹显示闪白次数，高爆和火显示伤害'],
    'Table header tooltip',
  );

  return translations;
}

function patchRendererMessages() {
  const englishChunkName = findBuiltMessagesChunk('en');
  const simplifiedChineseChunkName = findBuiltMessagesChunk('zh-CN');
  const englishMessages = readMessagesChunk(fs.readFileSync(path.join(assetsFolderPath, englishChunkName), 'utf8'));
  const officialSimplifiedChineseMessages = findOfficialSimplifiedChineseMessages();
  const manualTranslations = createManualTranslations();
  const mergedMessages = {};
  let manualCount = 0;
  let officialCount = 0;
  let fallbackCount = 0;

  for (const [id, englishMessage] of Object.entries(englishMessages)) {
    const manualTranslation = manualTranslations.get(JSON.stringify(englishMessage));
    if (manualTranslation !== undefined) {
      mergedMessages[id] = manualTranslation;
      manualCount++;
      continue;
    }

    const officialTranslation = officialSimplifiedChineseMessages[id];
    if (officialTranslation !== undefined) {
      mergedMessages[id] = officialTranslation;
      officialCount++;
      continue;
    }

    mergedMessages[id] = englishMessage;
    fallbackCount++;
  }

  writeMessagesChunk(path.join(assetsFolderPath, simplifiedChineseChunkName), mergedMessages);

  return {
    fallbackCount,
    manualCount,
    officialCount,
    target: simplifiedChineseChunkName,
    totalCount: Object.keys(mergedMessages).length,
  };
}

function patchMainProcessMessages() {
  const englishMessagesPath = path.join(outFolderPath, 'translations', 'en', 'messages.json');
  const simplifiedChineseMessagesPath = path.join(outFolderPath, 'translations', 'zh-CN', 'messages.json');
  const englishMessages = fs.readJsonSync(englishMessagesPath);
  const officialSimplifiedChineseMessages = JSON.parse(
    extractAsarFile('/translations/zh-CN/messages.json').toString('utf8'),
  );
  const mergedMessages = {};

  for (const [id, englishMessage] of Object.entries(englishMessages)) {
    mergedMessages[id] = officialSimplifiedChineseMessages[id] ?? englishMessage;
  }

  fs.outputJsonSync(simplifiedChineseMessagesPath, mergedMessages, {
    spaces: 2,
  });

  return {
    target: path.relative(rootFolderPath, simplifiedChineseMessagesPath),
    totalCount: Object.keys(mergedMessages).length,
  };
}

if (!(await fs.pathExists(installedAsarPath))) {
  throw new Error(`Installed CS Demo Manager app.asar not found at ${installedAsarPath}`);
}

const rendererResult = patchRendererMessages();
const mainProcessResult = patchMainProcessMessages();

console.log(
  `Patched zh-CN renderer messages: ${rendererResult.target} (${rendererResult.totalCount} total, ${rendererResult.officialCount} official, ${rendererResult.manualCount} manual, ${rendererResult.fallbackCount} English fallback).`,
);
console.log(`Patched zh-CN main messages: ${mainProcessResult.target} (${mainProcessResult.totalCount} total).`);
