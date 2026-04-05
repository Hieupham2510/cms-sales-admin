import { createClient } from "@/lib/supabase/server";

export default async function TestSupabasePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="page-container">
      <h1 className="page-title">Test Supabase</h1>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}