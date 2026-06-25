type SupabaseLikeError = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

export const formatSupabaseError = (error: unknown, fallback: string) => {
  const supabaseError = error as SupabaseLikeError;
  const message = error instanceof Error ? error.message : supabaseError?.message;
  const code = supabaseError?.code;
  const details = supabaseError?.details;
  const hint = supabaseError?.hint;
  const raw = [code, message, details, hint].filter(Boolean).join(' ');
  const looksLikePermissionError = /permission|policy|rls|row-level|denied|42501/i.test(raw);

  if (looksLikePermissionError) {
    return `Erro de permissão. Verifique se o usuário possui role admin ou commission.${message ? ` Detalhe: ${message}` : ''}`;
  }

  return message || fallback;
};
