import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";

/** Cliente Supabase para uso no servidor (Server Components, Actions, Route Handlers). */
export async function criarClienteServidor() {
  // Dados do usuário (sessão, saúde) são sempre lidos na hora do pedido:
  // nunca pré-renderizados nem pré-carregados antecipadamente.
  await connection();
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Chamado a partir de um Server Component: não é possível gravar
            // cookies aqui. O proxy (src/proxy.ts) já renova a sessão.
          }
        },
      },
    },
  );
}
