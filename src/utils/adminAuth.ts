// Secure Admin Authentication & Plan Unlocking Utility
// Allows administrator to unlock plans without displaying secret credentials in the UI

export interface AdminCredentialRule {
  tierId: string;
  planName: string;
  quota: number;
  allowedEmails: string[];
  allowedPasswords: string[];
}

export const ADMIN_CREDENTIAL_RULES: AdminCredentialRule[] = [
  {
    tierId: '10',
    planName: 'Starter Pack 10',
    quota: 10,
    allowedEmails: [
      'garciasaul@hotmail.com',
      'garcciassaul7@gmail.com',
      'starter10@conexionwhop.com',
      'plan10@conexionprompts.com',
    ],
    allowedPasswords: ['WHOP-10-ACTIVO', 'PLAN-10-ACTIVO'],
  },
  {
    tierId: '30',
    planName: 'Creador Básico 30',
    quota: 30,
    allowedEmails: [
      'garciasaul@hotmail.com',
      'creador30@conexionwhop.com',
      'creador30@conexionprompts.com',
      'garcciassaul7@gmail.com',
    ],
    allowedPasswords: ['WHOP-30-ACTIVO', 'PLAN-30-ACTIVO'],
  },
  {
    tierId: '50',
    planName: 'Creador Pro 50',
    quota: 50,
    allowedEmails: [
      'garciasaul@hotmail.com',
      'pro50@conexionwhop.com',
      'pro50@conexionprompts.com',
      'garcciassaul7@gmail.com',
    ],
    allowedPasswords: ['WHOP-50-PRO', 'PLAN-50-PRO'],
  },
  {
    tierId: '100',
    planName: 'Business Booster 100',
    quota: 100,
    allowedEmails: [
      'garciasaul@hotmail.com',
      'business100@conexionwhop.com',
      'business100@conexionprompts.com',
      'garcciassaul7@gmail.com',
    ],
    allowedPasswords: ['WHOP-100-VIP', 'PLAN-100-VIP'],
  },
  {
    tierId: '500',
    planName: 'Agencia Master 500',
    quota: 500,
    allowedEmails: [
      'garciasaul@hotmail.com',
      'agencia500@conexionwhop.com',
      'agencia500@conexionprompts.com',
      'garcciassaul7@gmail.com',
    ],
    allowedPasswords: ['WHOP-500-MASTER', 'PLAN-500-MASTER'],
  },
  {
    tierId: '1000',
    planName: 'VIP Enterprise 1000',
    quota: 1000,
    allowedEmails: [
      'garciasaul@hotmail.com',
      'enterprise1000@conexionwhop.com',
      'enterprise1000@conexionprompts.com',
      'garcciassaul7@gmail.com',
    ],
    allowedPasswords: ['WHOP-1000-CORP', 'PLAN-1000-CORP'],
  },
];

export interface ValidateAdminResult {
  success: boolean;
  tierId?: string;
  planName?: string;
  quota?: number;
  message: string;
}

/**
 * Validates admin credentials securely without displaying them on the screen.
 * If targetTierId is provided, checks if the credentials authorize that specific tier.
 * If targetTierId is omitted, checks across all tiers.
 */
export function validateAdminCredentials(
  inputUsername: string,
  inputPassword: string,
  targetTierId?: string
): ValidateAdminResult {
  const cleanUser = (inputUsername || '').trim().toLowerCase();
  const cleanPass = (inputPassword || '').trim();

  if (!cleanUser || !cleanPass) {
    return {
      success: false,
      message: 'Ingresa tu usuario y password de administrador.',
    };
  }

  // 1. If target tier is specified, check against that tier first
  if (targetTierId && targetTierId !== 'free') {
    const rule = ADMIN_CREDENTIAL_RULES.find((r) => r.tierId === targetTierId);
    if (rule) {
      const userMatches = rule.allowedEmails.some((e) => e.toLowerCase() === cleanUser);
      const passMatches = rule.allowedPasswords.includes(cleanPass);

      if (userMatches && passMatches) {
        return {
          success: true,
          tierId: rule.tierId,
          planName: rule.planName,
          quota: rule.quota,
          message: `¡Credenciales válidas! Plan ${rule.planName} (${rule.quota} prompts/mes) desbloqueado con éxito.`,
        };
      }
    }
  }

  // 2. Check across all rules (allows auto-detecting the plan from the credentials entered)
  for (const rule of ADMIN_CREDENTIAL_RULES) {
    const userMatches = rule.allowedEmails.some((e) => e.toLowerCase() === cleanUser);
    const passMatches = rule.allowedPasswords.includes(cleanPass);

    if (userMatches && passMatches) {
      return {
        success: true,
        tierId: rule.tierId,
        planName: rule.planName,
        quota: rule.quota,
        message: `¡Acceso de Administrador verificado! Desbloqueado ${rule.planName} (${rule.quota} prompts/mes).`,
      };
    }
  }

  // 3. Super admin master bypass for Saúl García (`garciasaul@hotmail.com` or `garcciassaul7@gmail.com`)
  const isMasterAdminEmail =
    cleanUser === 'garciasaul@hotmail.com' ||
    cleanUser === 'garcciassaul7@gmail.com' ||
    cleanUser === 'garciasaul501@gmail.com';
  if (isMasterAdminEmail) {
    // If master admin provided any known plan password
    const matchedRule = ADMIN_CREDENTIAL_RULES.find((r) =>
      r.allowedPasswords.includes(cleanPass)
    );
    if (matchedRule) {
      const finalTier = targetTierId && targetTierId !== 'free'
        ? ADMIN_CREDENTIAL_RULES.find((r) => r.tierId === targetTierId) || matchedRule
        : matchedRule;
      return {
        success: true,
        tierId: finalTier.tierId,
        planName: finalTier.planName,
        quota: finalTier.quota,
        message: `¡Acceso Maestro verificado para Saúl García! Plan ${finalTier.planName} (${finalTier.quota} prompts/mes) activo.`,
      };
    }
  }

  return {
    success: false,
    message: 'Usuario o password incorrectos. Verifica tus credenciales de administrador.',
  };
}
