import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import webpush from "npm:web-push@3.6.6"
import { createClient } from "npm:@supabase/supabase-js@2"

// Set CORS headers so the frontend can call this function directly
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS Preflight checks for browser calls
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders })
  }

  try {
    const { title, body, familyId } = await req.json()

    // Ambil Kunci Rahasia dari Environment Variables Supabase
    const vapidPublic = Deno.env.get("VAPID_PUBLIC_KEY")!
    const vapidPrivate = Deno.env.get("VAPID_PRIVATE_KEY")!
    
    // Setup Supabase Client (Pakai Service Role agar bisa by-pass RLS)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    webpush.setVapidDetails('mailto:admin@aicount.app', vapidPublic, vapidPrivate)

    // Cari endpoint HP khusus untuk familyId yang bersangkutan
    let query = supabase.from('push_subscriptions').select('*')
    if (familyId) {
      query = query.eq('family_id', familyId)
    }
    
    const { data: subs, error } = await query
    if (error) throw error

    let successCount = 0
    let failedCount = 0

    // Berondong Notifikasi
    for (const sub of subs || []) {
      const pushConfig = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth }
      }

      try {
        await webpush.sendNotification(pushConfig, JSON.stringify({
          title: title || 'Aicount Alert',
          body: body || 'You have a new alert',
          data: { url: '/' }
        }))
        successCount++
      } catch (err: unknown) {
        failedCount++
        // Hapus device mati/kadaluarsa supaya tak menuh-menuhin database
        if (err instanceof Error && ('statusCode' in err)) {
          await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      sent: successCount, 
      failed: failedCount 
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } })

  } catch (error: unknown) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), { 
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }
})
