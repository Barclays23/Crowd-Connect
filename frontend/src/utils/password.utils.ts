// frontend/ src/utils/password.utils.ts

// Simple password strength scoring (used for the bar)
export const calculatePasswordStrength = (password: string): number => {
    if (!password) return 0;

    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (password.length >= 16 && score >= 5) score++;
    return Math.min(score, 4);
};


export const passwordRules = [
    {
        label: '8–20 characters',
        test: (pw: string) => pw.length >= 8 && pw.length <= 20,
    },
    {
        label: 'One uppercase letter',
        test: (pw: string) => /[A-Z]/.test(pw),
    },
    {
        label: 'One lowercase letter',
        test: (pw: string) => /[a-z]/.test(pw),
    },
    {
        label: 'One number',
        test: (pw: string) => /[0-9]/.test(pw),
    },
    {
        label: 'One special character',
        test: (pw: string) => /[^A-Za-z0-9]/.test(pw),
    },
];




// Password Strength UI levels
export const passwordStrengthLevels = [
    { label: 'Too weak', color: 'bg-red-500', textColor: 'text-red-600', width: 'w-1/5' },
    { label: 'Weak', color: 'bg-orange-500', textColor: 'text-orange-600', width: 'w-2/5' },
    { label: 'Medium', color: 'bg-yellow-500', textColor: 'text-yellow-600', width: 'w-3/5' },
    { label: 'Strong', color: 'bg-green-500', textColor: 'text-green-600', width: 'w-4/5' },
    { label: 'Very strong', color: 'bg-emerald-600', textColor: 'text-emerald-700', width: 'w-full' },
];