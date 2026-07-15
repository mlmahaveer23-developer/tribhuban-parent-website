/**
 * Password strength evaluator
 * Provides real-time feedback on password strength based on:
 * - Length (8+ characters required)
 * - Uppercase letters
 * - Numbers
 * - Special characters
 */

export interface PasswordStrength {
  score: number; // 0-4
  label: string; // "Weak" | "Fair" | "Good" | "Strong"
  color: string; // hex or CSS variable
}

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return { score: 0, label: 'Weak', color: '#ef4444' };
  }

  let score = 0;
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    numbers: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  // Award 1 point per check passed
  Object.values(checks).forEach(check => {
    if (check) score += 1;
  });

  // Minimum 8 characters is required, so if it fails, cap at score 2 max
  if (!checks.length && score > 2) {
    score = 2;
  }

  // Map score to label and color
  if (score <= 1) {
    return { score: 1, label: 'Weak', color: '#ef4444' }; // red-500
  }
  if (score === 2) {
    return { score: 2, label: 'Fair', color: '#f97316' }; // orange-500
  }
  if (score === 3) {
    return { score: 3, label: 'Good', color: '#eab308' }; // yellow-500
  }
  return { score: 4, label: 'Strong', color: '#22c55e' }; // green-500
}
