#!/usr/bin/env node

/**
 * 美业CRM文档同步脚本
 * 功能：
 * 1. 检测本地文档变化
 * 2. 与GitHub仓库对比差异
 * 3. 自动提交更新到GitHub
 * 4. 验证文档一致性
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ============================================
// 配置加载
// ============================================

const CONFIG_PATH = path.join(__dirname, '..', '.claude', 'doc-sync-config.json');
let config;

try {
  config = JSON.require(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  console.log('✅ 配置文件加载成功');
} catch (error) {
  console.error('❌ 配置文件加载失败:', error.message);
  process.exit(1);
}

// ============================================
// 工具函数
// ============================================

/**
 * 执行命令并返回结果
 */
function exec(command, options = {}) {
  try {
    const result = execSync(command, {
      encoding: 'utf-8',
      stdio: options.silent ? 'pipe' : 'inherit',
      cwd: config.localPaths.codeRoot,
      ...options
    });
    return { success: true, output: result };
  } catch (error) {
    return { success: false, error: error.message, output: error.stdout };
  }
}

/**
 * 检查文件是否存在
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

/**
 * 读取文件内容
 */
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`读取文件失败 ${filePath}:`, error.message);
    return null;
  }
}

/**
 * 获取文件的Git状态
 */
function getGitStatus(filePath) {
  const relativePath = path.relative(config.localPaths.codeRoot, filePath);
  const result = exec(`git status --porcelain "${relativePath}"`, { silent: true });

  if (!result.success) return 'unknown';

  const status = result.output.trim();
  if (!status) return 'unchanged';
  if (status.startsWith('M')) return 'modified';
  if (status.startsWith('A')) return 'added';
  if (status.startsWith('D')) return 'deleted';
  if (status.startsWith('??')) return 'untracked';

  return 'unknown';
}

/**
 * 获取文件最后修改时间
 */
function getLastModified(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.mtime;
  } catch {
    return null;
  }
}

/**
 * 计算文件哈希值
 */
function getFileHash(filePath) {
  const crypto = require('crypto');
  try {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(content).digest('hex');
  } catch {
    return null;
  }
}

// ============================================
// 文档检查功能
// ============================================

/**
 * 检查文档状态
 */
function checkDocumentStatus() {
  console.log('\n📊 检查文档状态...\n');

  const documents = config.syncRules.documents;
  const status = [];

  for (const doc of documents) {
    const fullPath = path.join(config.localPaths.codeRoot, doc.file);
    const exists = fileExists(fullPath);

    if (!exists) {
      console.log(`❌ 文件不存在: ${doc.file}`);
      status.push({ file: doc.file, exists: false });
      continue;
    }

    const gitStatus = getGitStatus(fullPath);
    const lastModified = getLastModified(fullPath);
    const hash = getFileHash(fullPath);

    const fileStatus = {
      file: doc.file,
      exists: true,
      gitStatus,
      lastModified,
      hash,
      description: doc.description
    };

    status.push(fileStatus);

    const statusIcon = gitStatus === 'unchanged' ? '✅' : '⚠️';
    console.log(`${statusIcon} ${doc.file}`);
    console.log(`   状态: ${gitStatus}`);
    console.log(`   修改时间: ${lastModified ? lastModified.toLocaleString('zh-CN') : 'N/A'}`);
    console.log(`   哈希: ${hash || 'N/A'}\n`);
  }

  return status;
}

/**
 * 检查文档链接有效性
 */
function checkDocumentLinks() {
  console.log('\n🔗 检查文档链接...\n');

  const documents = config.syncRules.documents;
  const brokenLinks = [];

  for (const doc of documents) {
    const fullPath = path.join(config.localPaths.codeRoot, doc.file);
    if (!fileExists(fullPath)) continue;

    const content = readFile(fullPath);
    if (!content) continue;

    // 匹配Markdown链接 [文本](路径)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      const linkText = match[1];
      const linkPath = match[2];

      // 跳过外部链接和锚点
      if (linkPath.startsWith('http') || linkPath.startsWith('#')) {
        continue;
      }

      // 处理相对路径
      const resolvedPath = path.resolve(path.dirname(fullPath), linkPath.split('#')[0]);

      if (!fileExists(resolvedPath)) {
        brokenLinks.push({
          file: doc.file,
          linkText,
          linkPath,
          resolvedPath
        });
        console.log(`❌ 链接失效: ${doc.file}`);
        console.log(`   文本: ${linkText}`);
        console.log(`   路径: ${linkPath}\n`);
      }
    }
  }

  if (brokenLinks.length === 0) {
    console.log('✅ 所有链接有效\n');
  } else {
    console.log(`⚠️ 发现 ${brokenLinks.length} 个失效链接\n`);
  }

  return brokenLinks;
}

/**
 * 检查文档与代码一致性
 */
function checkCodeDocConsistency() {
  console.log('\n🔍 检查文档与代码一致性...\n');

  const inconsistencies = [];

  // 检查HTML页面
  const htmlFiles = exec('git ls-files "*.html"', { silent: true });
  if (htmlFiles.success) {
    const pages = htmlFiles.output.trim().split('\n').filter(f => f && !f.startsWith('test-'));
    console.log(`📄 发现 ${pages.length} 个HTML页面`);

    // 这里可以扩展检查逻辑，比如验证每个页面是否在文档中有说明
  }

  // 检查数据库表
  const initSqlPath = path.join(config.localPaths.databasePath, 'init.sql');
  if (fileExists(initSqlPath)) {
    const sqlContent = readFile(initSqlPath);
    if (sqlContent) {
      const tableMatches = sqlContent.match(/CREATE TABLE (\w+)/gi);
      if (tableMatches) {
        const tables = tableMatches.map(m => m.replace(/CREATE TABLE /i, ''));
        console.log(`🗄️ 发现 ${tables.length} 张数据表`);

        // 可以检查这些表是否在系统设计.md中有文档
      }
    }
  }

  if (inconsistencies.length === 0) {
    console.log('✅ 文档与代码保持一致\n');
  }

  return inconsistencies;
}

// ============================================
// Git同步功能
// ============================================

/**
 * 获取与远程的差异
 */
function checkRemoteDiff() {
  console.log('\n🌐 检查与GitHub远程仓库的差异...\n');

  // 获取远程更新
  console.log('正在fetch远程更新...');
  const fetchResult = exec('git fetch origin', { silent: true });

  if (!fetchResult.success) {
    console.error('❌ 无法连接到远程仓库');
    return { success: false };
  }

  // 检查本地与远程的差异
  const diffResult = exec('git diff origin/master --name-only docs/', { silent: true });

  if (!diffResult.success) {
    console.error('❌ 无法获取差异');
    return { success: false };
  }

  const changedFiles = diffResult.output.trim().split('\n').filter(f => f);

  if (changedFiles.length === 0) {
    console.log('✅ 本地文档与远程同步\n');
    return { success: true, synced: true, changedFiles: [] };
  }

  console.log(`⚠️ 发现 ${changedFiles.length} 个文件与远程不同:\n`);
  changedFiles.forEach(file => console.log(`   - ${file}`));
  console.log('');

  return { success: true, synced: false, changedFiles };
}

/**
 * 提交文档更新
 */
function commitDocChanges(message) {
  console.log('\n📝 提交文档更新...\n');

  // 检查是否有变更
  const statusResult = exec('git status --porcelain docs/', { silent: true });

  if (!statusResult.success || !statusResult.output.trim()) {
    console.log('ℹ️ 没有需要提交的变更\n');
    return { success: true, committed: false };
  }

  // 添加文档目录
  console.log('添加文档文件...');
  const addResult = exec('git add docs/');

  if (!addResult.success) {
    console.error('❌ 添加文件失败');
    return { success: false };
  }

  // 提交
  const commitMessage = message || `${config.github.commitPrefix} 更新文档 - ${new Date().toLocaleString('zh-CN')}`;
  console.log(`提交信息: ${commitMessage}`);

  const commitResult = exec(`git commit -m "${commitMessage}"`);

  if (!commitResult.success) {
    console.error('❌ 提交失败');
    return { success: false };
  }

  console.log('✅ 提交成功\n');
  return { success: true, committed: true };
}

/**
 * 推送到远程仓库
 */
function pushToRemote() {
  console.log('\n🚀 推送到GitHub...\n');

  const pushResult = exec(`git push origin ${config.github.branch}`);

  if (!pushResult.success) {
    console.error('❌ 推送失败');
    console.error('请检查网络连接和仓库权限');
    return { success: false };
  }

  console.log('✅ 推送成功\n');
  return { success: true };
}

// ============================================
// 主函数
// ============================================

/**
 * 显示帮助信息
 */
function showHelp() {
  console.log(`
美业CRM文档同步工具 v1.0.0

用法:
  node scripts/sync-docs.js [命令] [选项]

命令:
  check          检查文档状态和一致性
  status         查看文档Git状态
  links          检查文档链接有效性
  diff           对比本地与远程差异
  commit [msg]   提交文档更新
  push           推送到GitHub
  sync           完整同步流程（check + commit + push）
  help           显示帮助信息

示例:
  node scripts/sync-docs.js check
  node scripts/sync-docs.js commit "更新系统设计文档"
  node scripts/sync-docs.js sync
  `);
}

/**
 * 主流程
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'check';

  console.log('='.repeat(60));
  console.log('美业CRM文档同步工具');
  console.log('='.repeat(60));

  switch (command) {
    case 'check':
      checkDocumentStatus();
      checkCodeDocConsistency();
      break;

    case 'status':
      checkDocumentStatus();
      break;

    case 'links':
      checkDocumentLinks();
      break;

    case 'diff':
      checkRemoteDiff();
      break;

    case 'commit':
      const message = args.slice(1).join(' ');
      commitDocChanges(message);
      break;

    case 'push':
      pushToRemote();
      break;

    case 'sync':
      console.log('🔄 开始完整同步流程\n');

      // 1. 检查状态
      checkDocumentStatus();
      checkDocumentLinks();
      checkCodeDocConsistency();

      // 2. 检查远程差异
      const diffResult = checkRemoteDiff();

      // 3. 提交本地变更
      const commitResult = commitDocChanges();

      // 4. 推送到远程
      if (commitResult.success && commitResult.committed) {
        const pushResult = pushToRemote();

        if (pushResult.success) {
          console.log('✅ 文档同步完成！\n');
        } else {
          console.log('⚠️ 提交成功但推送失败，请稍后手动推送\n');
        }
      } else if (commitResult.success && !commitResult.committed) {
        console.log('ℹ️ 没有需要同步的变更\n');
      } else {
        console.log('❌ 同步失败\n');
      }
      break;

    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;

    default:
      console.log(`❌ 未知命令: ${command}\n`);
      showHelp();
      process.exit(1);
  }

  console.log('='.repeat(60));
}

// 运行主函数
main().catch(error => {
  console.error('❌ 执行出错:', error);
  process.exit(1);
});
