/**
 * FIX URGENT: Corectează badge-urile de post pentru Postul Sfinților Apostoli 2026
 * Postul Apostolilor 2026: 8 iunie - 28 iunie (inclusiv)
 * 
 * Reguli canonice BOR pentru Postul Apostolilor:
 * - Luni, Marți, Joi: dezlegare la ulei și vin
 * - Miercuri, Vineri: post aspru (fără ulei, fără vin)
 * - Sâmbătă, Duminică: dezlegare la pește
 * - 24 iunie (Nașterea Sf. Ioan Botezătorul): dezlegare la pește (sărbătoare mare)
 * - 29 iunie (Sfinții Apostoli Petru și Pavel): dezlegare deplină (sfârsitul postului)
 */

const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://smuqpipxeotkbttolivp.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Calculează tipul de post pentru fiecare zi din Postul Apostolilor
function getTipPostApostoli(dataStr) {
  const d = new Date(dataStr + 'T00:00:00');
  const zi = d.getDay(); // 0=Dum, 1=Lun, 2=Mar, 3=Mie, 4=Joi, 5=Vin, 6=Sam
  const key = dataStr.substring(5); // MM-DD

  // 24 iunie - Nașterea Sf. Ioan Botezătorul: dezlegare la pește (chiar dacă e zi de post)
  if (key === '06-24') return { tip: 'dezlegare_peste', label: 'Dezlegare la pește', culoare: 'albastru' };
  
  // 29 iunie - Sfinții Apostoli Petru și Pavel: sfârsitul postului, dezlegare deplină
  if (key === '06-29') return { tip: 'dezlegare', label: 'Dezlegare deplină', culoare: 'verde' };
  
  // Duminică și Sâmbătă: dezlegare la pește
  if (zi === 0 || zi === 6) return { tip: 'dezlegare_peste', label: 'Dezlegare la pește', culoare: 'albastru' };
  
  // Miercuri și Vineri: post aspru (fără ulei, fără vin)
  if (zi === 3 || zi === 5) return { tip: 'post_aspru', label: 'Post aspru', culoare: 'rosu' };
  
  // Luni, Marți, Joi: dezlegare la ulei și vin
  return { tip: 'dezlegare_ulei', label: 'Dezlegare la ulei și vin', culoare: 'galben' };
}

async function fixPostApostoli() {
  console.log('🔧 Corectez badge-urile de post pentru Postul Apostolilor 2026...\n');
  
  // Generez toate zilele din 8 iunie până în 28 iunie 2026
  const zile = [];
  const start = new Date('2026-06-08');
  const end = new Date('2026-06-28');
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dataStr = d.toISOString().split('T')[0];
    const tipPost = getTipPostApostoli(dataStr);
    zile.push({ data: dataStr, ...tipPost });
  }
  
  console.log('Zile de corectat:');
  zile.forEach(z => {
    const ziua = new Date(z.data + 'T00:00:00');
    const numezi = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'][ziua.getDay()];
    console.log(`  ${z.data} (${numezi}): ${z.label}`);
  });
  
  console.log('\n📡 Actualizez Supabase...');
  
  let actualizate = 0;
  let negate = 0;
  
  for (const zi of zile) {
    // Verifică dacă există rândul în Supabase
    const { data: existing, error: fetchErr } = await supabase
      .from('zile_ortodoxe')
      .select('id, data, post_tip')
      .eq('data', zi.data)
      .single();
    
    if (fetchErr && fetchErr.code !== 'PGRST116') {
      console.error(`  ❌ Eroare la verificarea ${zi.data}:`, fetchErr.message);
      continue;
    }
    
    if (!existing) {
      console.log(`  ⚠️  ${zi.data} nu există în Supabase (va fi generat de scriptul zilnic)`);
      negate++;
      continue;
    }
    
    // Actualizează câmpul post_tip
    const { error: updateErr } = await supabase
      .from('zile_ortodoxe')
      .update({ 
        post_tip: zi.tip,
        post_label: zi.label
      })
      .eq('data', zi.data);
    
    if (updateErr) {
      // Încearcă fără post_label dacă coloana nu există
      const { error: updateErr2 } = await supabase
        .from('zile_ortodoxe')
        .update({ post_tip: zi.tip })
        .eq('data', zi.data);
      
      if (updateErr2) {
        console.error(`  ❌ Eroare la actualizarea ${zi.data}:`, updateErr2.message);
      } else {
        console.log(`  ✅ ${zi.data}: ${zi.label} (post_tip=${zi.tip})`);
        actualizate++;
      }
    } else {
      console.log(`  ✅ ${zi.data}: ${zi.label} (post_tip=${zi.tip})`);
      actualizate++;
    }
  }
  
  console.log(`\n📊 Rezultat: ${actualizate} actualizate, ${negate} lipsă din DB`);
  
  // Verificare specifică pentru 11 iunie (azi)
  console.log('\n🔍 Verificare 11 iunie 2026:');
  const { data: azi } = await supabase
    .from('zile_ortodoxe')
    .select('data, post_tip, sfant_principal')
    .eq('data', '2026-06-11')
    .single();
  
  if (azi) {
    console.log(`  Data: ${azi.data}`);
    console.log(`  post_tip: ${azi.post_tip}`);
    console.log(`  Sfânt: ${azi.sfant_principal}`);
  } else {
    console.log('  ⚠️  11 iunie nu există în Supabase');
  }
}

fixPostApostoli().catch(console.error);
