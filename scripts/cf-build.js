const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Building Skoolar for Cloudflare Workers...\n');

try {
  // Step 1: Generate Prisma client
  console.log('📦 Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma generated\n');

  // Step 2: Build Next.js app
  console.log('🏗️ Building Next.js application...');
  execSync('npx next build', { stdio: 'inherit' });
  console.log('✅ Next.js build complete\n');

  // Step 3: Run OpenNext adapter (from node_modules)
  console.log('⚡ Running OpenNext Cloudflare adapter...');
  const adapterPath = path.join(__dirname, 'node_modules', '@opennextjs', 'cloudflare', 'dist', 'index.js');
  
  if (fs.existsSync(adapterPath)) {
    execSync(`node "${adapterPath}" build`, { stdio: 'inherit' });
  } else {
    console.log('⚠️ OpenNext not found locally, using npx...');
    execSync('npx @opennextjs/cloudflare build', { stdio: 'inherit' });
  }
  console.log('✅ Cloudflare build complete\n');

  console.log('🎉 Build successful! Ready for deployment.');
  console.log('\nTo deploy, run: npm run cf:deploy');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}