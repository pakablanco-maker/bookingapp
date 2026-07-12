#!/usr/bin/env node

/**
 * Sentry v10 Migration Validation Script
 * Validates that all Sentry APIs have been properly migrated
 */

import fs from 'fs';
import path from 'path';

const BACKEND_DIR = path.resolve('./backend');
const DEPRECATED_PATTERNS = [
  {
    name: 'getCurrentHub()',
    regex: /Sentry\.getCurrentHub/g,
    file: 'config/sentry.js',
    severity: 'CRITICAL',
    replace: 'Sentry.getClient()',
    note: 'COMPLETELY REMOVED in v10',
  },
  {
    name: 'configureScope()',
    regex: /\.configureScope\(/g,
    severity: 'CRITICAL',
    replace: 'Remove - automatic in v10',
    note: 'COMPLETELY REMOVED in v10',
  },
  {
    name: 'Sentry.logger',
    regex: /Sentry\.logger\./g,
    severity: 'CRITICAL',
    replace: 'captureInfo(), captureWarning(), captureException()',
    note: 'COMPLETELY REMOVED in v10',
  },
  {
    name: 'Sentry.metrics',
    regex: /Sentry\.metrics\./g,
    severity: 'CRITICAL',
    replace: 'Use custom event or OpenTelemetry',
    note: 'COMPLETELY REMOVED in v10',
  },
  {
    name: 'Sentry.Handlers.requestHandler()',
    regex: /Sentry\.Handlers\.requestHandler/g,
    severity: 'CRITICAL',
    replace: 'Remove - Express auto-instrumentation is automatic in v10',
    note: 'COMPLETELY REMOVED in v10',
  },
  {
    name: 'Sentry.Handlers.tracingHandler()',
    regex: /Sentry\.Handlers\.tracingHandler/g,
    severity: 'CRITICAL',
    replace: 'Remove - Express auto-instrumentation is automatic in v10',
    note: 'COMPLETELY REMOVED in v10',
  },
  {
    name: 'Sentry.Handlers.errorHandler()',
    regex: /Sentry\.Handlers\.errorHandler/g,
    severity: 'CRITICAL',
    replace: 'Sentry.setupExpressErrorHandler(app)',
    note: 'COMPLETELY REMOVED in v10',
  },
  {
    name: 'startTransaction()',
    regex: /Sentry\.startTransaction/g,
    severity: 'CRITICAL',
    replace: 'Sentry.startSpan() [recommended]',
    note: 'COMPLETELY REMOVED in v10',
  },
  {
    name: '.startChild()',
    regex: /\.startChild\(/g,
    severity: 'CRITICAL',
    replace: 'Use Sentry.startSpan() or startInactiveSpan()',
    note: 'COMPLETELY REMOVED in v10',
  },
];

const REQUIRED_PATTERNS = [
  {
    name: 'Sentry.setupExpressErrorHandler(app)',
    regex: /Sentry\.setupExpressErrorHandler/g,
    file: 'server.js',
    severity: 'CRITICAL',
  },
];

function findFilesRecursive(dir, pattern) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!item.startsWith('.') && item !== 'node_modules' && item !== 'logs') {
        files.push(...findFilesRecursive(fullPath, pattern));
      }
    } else if (item.endsWith('.js') && !item.startsWith('.')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function checkFile(filePath, pattern) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const matches = content.match(pattern.regex);
    return matches ? matches.length : 0;
  } catch (error) {
    return -1; // File read error
  }
}

function main() {
  console.log('\n┌─────────────────────────────────────────────────────┐');
  console.log('│  SENTRY v10 MIGRATION VALIDATION                    │');
  console.log('└─────────────────────────────────────────────────────┘\n');
  
  const files = findFilesRecursive(BACKEND_DIR, /\.js$/);
  console.log(`📁 Scanning ${files.length} files...\n`);
  
  let criticalIssues = 0;
  let warnings = 0;
  let success = 0;
  
  // Check for deprecated patterns
  console.log('🔍 CHECKING FOR DEPRECATED APIs:\n');
  
  for (const pattern of DEPRECATED_PATTERNS) {
    let foundCount = 0;
    const occurrences = [];
    
    for (const file of files) {
      const count = checkFile(file, pattern);
      if (count > 0) {
        foundCount += count;
        const relative = path.relative(BACKEND_DIR, file);
        occurrences.push({ file: relative, count });
      }
    }
    
    if (foundCount > 0) {
      let icon = '❌';
      if (pattern.severity === 'WARNING') icon = '⚠️';
      if (pattern.severity === 'INFO') icon = 'ℹ️';
      
      console.log(`${icon} ${pattern.name}: ${foundCount} occurrence(s)`);
      occurrences.forEach(occ => {
        console.log(`   → ${occ.file}: ${occ.count}x`);
      });
      console.log(`   💡 Replace with: ${pattern.replace}`);
      console.log(`   📝 Note: ${pattern.note}\n`);
      
      if (pattern.severity === 'CRITICAL') {
        criticalIssues += foundCount;
      } else if (pattern.severity === 'WARNING') {
        warnings += foundCount;
      }
    } else {
      success++;
    }
  }
  
  // Check for required patterns
  console.log('\n✅ CHECKING FOR REQUIRED APIs:\n');
  
  for (const pattern of REQUIRED_PATTERNS) {
    let foundCount = 0;
    
    for (const file of files) {
      const count = checkFile(file, pattern);
      if (count > 0) {
        foundCount += count;
      }
    }
    
    if (foundCount > 0) {
      console.log(`✅ ${pattern.name}: ${foundCount} occurrence(s)`);
      success++;
    } else {
      console.log(`❌ ${pattern.name}: NOT FOUND`);
      criticalIssues++;
    }
  }
  
  // Summary
  console.log('\n┌─────────────────────────────────────────────────────┐');
  console.log('│  VALIDATION SUMMARY                                 │');
  console.log('├─────────────────────────────────────────────────────┤');
  console.log(`│  ✅ Passed:         ${success.toString().padStart(38)}`);
  console.log(`│  ⚠️  Warnings:      ${warnings.toString().padStart(38)}`);
  console.log(`│  ❌ Critical Issues: ${criticalIssues.toString().padStart(37)}`);
  console.log('└─────────────────────────────────────────────────────┘\n');
  
  if (criticalIssues === 0 && warnings === 0) {
    console.log('✨ PERFECT! Sentry v10 migration is complete and clean.\n');
    process.exit(0);
  } else if (criticalIssues === 0 && warnings <= 2) {
    console.log('✅ GOOD! Migration is complete. Some deprecated patterns remain but are still functional.\n');
    console.log('   Recommendations:');
    console.log('   - startTransaction() → Consider replacing with startActiveSpan() for better tracing');
    console.log('   - This can be done in a follow-up refactor for improved performance\n');
    process.exit(0);
  } else if (criticalIssues === 0) {
    console.log('⚠️  ACCEPTABLE. Migration successful. Some warnings found. Please review them.\n');
    process.exit(0);
  } else {
    console.log('❌ BLOCKING ISSUES FOUND! These APIs are completely removed in v10.\n');
    console.log('   This will cause runtime errors on deployment.\n');
    console.log('   Action: Fix all critical issues before deploying to production.\n');
    process.exit(1);
  }
}

main();
