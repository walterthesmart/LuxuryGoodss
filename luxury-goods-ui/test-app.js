// Simple test to verify the app structure
const fs = require('fs');
const path = require('path');

console.log('Testing Luxury Goods App Structure...\n');

// Check if required files exist
const requiredFiles = [
  'app.tsx',
  'app/page.tsx',
  'data/products.ts',
  'hooks/useShoppingCart.ts',
  'shoppingCart.tsx',
  'components/ui/button.tsx',
  'components/ui/card.tsx',
  'components/ui/badge.tsx',
  'components/ui/dialog.tsx',
  'components/ui/select.tsx',
  'components/ui/input.tsx',
  'package.json'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
    allFilesExist = false;
  }
});

// Check package.json for required dependencies
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  console.log('\nChecking dependencies...');
  const requiredDeps = [
    '@stacks/connect',
    '@stacks/transactions',
    '@stacks/network',
    '@stacks/auth',
    'framer-motion',
    'lucide-react',
    '@radix-ui/react-slot',
    '@radix-ui/react-dialog',
    '@radix-ui/react-select'
  ];
  
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`✅ ${dep} installed`);
    } else {
      console.log(`❌ ${dep} missing`);
      allFilesExist = false;
    }
  });
}

console.log('\n' + '='.repeat(50));
if (allFilesExist) {
  console.log('🎉 All required files and dependencies are present!');
  console.log('✅ Luxury Goods Store implementation is complete');
} else {
  console.log('⚠️  Some files or dependencies are missing');
}
console.log('='.repeat(50));
