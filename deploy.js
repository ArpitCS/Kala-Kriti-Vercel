// Deployment preparation script
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Ensure CSS directories exist
const cssDir = path.join(__dirname, 'public', 'css');
if (!fs.existsSync(cssDir)) {
  console.log('Creating CSS directory...');
  fs.mkdirSync(cssDir, { recursive: true });
}

// Build Tailwind CSS
console.log('Building Tailwind CSS...');
try {
  execSync('npx tailwindcss -i ./src/input.css -o ./public/css/tailwind.css --minify', { stdio: 'inherit' });
  console.log('Tailwind CSS built successfully!');
} catch (error) {
  console.error('Error building Tailwind CSS:', error);
  process.exit(1);
}

// Verify the CSS file exists
const cssFile = path.join(cssDir, 'tailwind.css');
if (fs.existsSync(cssFile)) {
  const stats = fs.statSync(cssFile);
  console.log(`Tailwind CSS file created (${stats.size} bytes)`);
} else {
  console.error('Tailwind CSS file was not created!');
  process.exit(1);
}

console.log('Deployment preparation completed successfully.'); 