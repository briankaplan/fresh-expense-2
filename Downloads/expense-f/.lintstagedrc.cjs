module.exports = {
  './src/**/*.{js,jsx,ts,tsx}': [
    'prettier --write',
    'eslint --fix',
    'biome check --apply',
    'biome check --apply-unsafe',
    () => 'tsc --noEmit'
  ],
  './src/**/*.{css,scss,json,md}': ['prettier --write'],
  './src/**/*.{json}': ['biome format --write']
} 