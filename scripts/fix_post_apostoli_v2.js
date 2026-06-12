/**
 * FIX URGENT: Corectează badge-urile de post pentru Postul Sfinților Apostoli 2026
 * Câmpul de dată: data_calendaristica
 * Câmpul de post: tip_post
 * 
 * Reguli canonice BOR pentru Postul Apostolilor (8-28 iunie 2026):
 * - Luni, Marți, Joi: dezlegare_ulei (dezlegare la ulei și vin)
 * - Miercuri, Vineri: post_aspru (post aspru, fără ulei, fără vin)
 * - Sâmbătă, Duminică: dezlegare_peste (dezlegare la pește)
 * - 24 iunie (Nașterea Sf. Ioan Botezătorul): dezlegare_peste (sărbătoare mare)
 * - 29 iunie (Sfinții Apostoli Petru și Pavel): dezlegare (sfârsitul postului)
 */

const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://smuqpipxeotkbttolivp.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

function getTipPostApostoli(dataStr) {
  const d = new Date(dataStr + 'T00:00:00');
  const zi = d.getDay(); // 0=Dum, 1=Lun, 2=Mar, 3=Mie, 4=Joi, 5=Vin, 6=Sam
  const key = dataStr.substring(5); // MM-DD
  
  // 24 iunie - Nașterea Sf. Ioan Botezătorul: dezlegare la pește (chiar dacă e Miercuri)
  if (key === '06-24') return 'dezlegare_peste';
  // Sâmbătă (6) și Duminică (0): dezlegare la pește
  if (zi === 0 || zi === 6) return 'dezlegare_peste';
  // Miercuri (3) și Vineri (5): post aspru
  if (zi === 3 || zi === 5) return 'post_aspru';
  // Luni (1), Marți (2), Joi (4): dezlegare la ulei și vin
  return 'dezlegare_ulei';
}

async function fixPostApostoli() {
  console.log('🔧 Fix urgent: badge-uri post Postul Apostolilor 2026\n');
  
  const zile = [];
  const start = new Date('2026-06-08');
  const end = new Date('2026-06-28');
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    zile.push(d.toISOString().split('T')[0]);
  }
  
  const numezi = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'];
  let ok = 0, lipsa = 0, err = 0;
  
  for (const dataStr of zile) {
    const tipPost = getTipPostApostoli(dataStr);
    const ziua = new Date(dataStr + 'T00:00:00');
    const numeZi = numezi[ziua.getDay()];
    
    // Verifică dacă există rândul
    const { data: existing, error: fetchErr } = await supabase
      .from('zile_ortodoxe')
      .select('data_calendaristica, tip_post')
      .eq('data_calendaristica', dataStr)
      .maybeSingle();
    
    if (fetchErr) {
      console.log(`❌ ERR fetch ${dataStr}: ${fetchErr.message}`);
      err++;
      continue;
    }
    
    if (!existing) {
      console.log(`⚠️  LIPSĂ ${dataStr} (${numeZi}) → ${tipPost} (va fi creat de scriptul zilnic)`);
      lipsa++;
      continue;
    }
    
    // Actualizează tip_post
    const { error: upErr } = await supabase
      .from('zile_ortodoxe')
      .update({ tip_post: tipPost })
      .eq('data_calendaristica', dataStr);
    
    if (upErr) {
      console.log(`❌ ERR update ${dataStr}: ${upErr.message}`);
      err++;
    } else {
      console.log(`✅ ${dataStr} (${numeZi}): ${tipPost}`);
      ok++;
    }
  }
  
  console.log(`\n📊 Rezultat: ${ok} actualizate, ${lipsa} lipsă din DB, ${err} erori`);
  
  // Verificare finală pentru 11 iunie (azi)
  console.log('\n🔍 Verificare 11 iunie 2026 (azi):');
  const { data: azi } = await supabase
    .from('zile_ortodoxe')
    .select('data_calendaristica, tip_post, sfant_nume')
    .eq('data_calendaristica', '2026-06-11')
    .maybeSingle();
  
  if (azi) {
    console.log(`  ✅ data: ${azi.data_calendaristica}`);
    console.log(`  ✅ tip_post: ${azi.tip_post}`);
    console.log(`  ✅ sfant: ${azi.sfant_nume}`);
  } else {
    console.log('  ⚠️  11 iunie nu există în Supabase — va fi generat la 00:01');
  }
}

fixPostApostoli().catch(console.error);
