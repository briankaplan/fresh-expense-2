export function generateSecurePassword(length = 16): string {
  const charset = {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    special: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  };

  let password = '';

  // Ensure at least one of each type
  password += getRandomChar(charset.upper);
  password += getRandomChar(charset.lower);
  password += getRandomChar(charset.numbers);
  password += getRandomChar(charset.special);

  // Fill the rest randomly
  const allChars = Object.values(charset).join('');
  while (password.length < length) {
    password += getRandomChar(allChars);
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

function getRandomChar(charset: string): string {
  const array = new Uint8Array(1);
  crypto.getRandomValues(array);
  return charset[array[0] % charset.length];
} 