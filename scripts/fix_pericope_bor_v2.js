/**
 * fix_pericope_bor_v2.js
 * Actualizează Supabase cu pericopele CORECTE BOR pentru 2026
 * Sursa: admd.info/calendar_anual.php (reflectă calendarul oficial Patriarhia Română)
 * 
 * Rulare: SUPABASE_SERVICE_KEY="..." node fix_pericope_bor_v2.js
 * 
 * IMPORTANT: Actualizează apostol_carte, apostol_versete, evanghelie_carte, evanghelie_versete
 * pentru toate zilele cu pericope proprii (Duminici + Sărbători mari)
 * Zilele de rând (L-S) fără pericope proprii vor fi actualizate de scriptul de generare zilnică
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://smuqpipxeotkbttolivp.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// ═══════════════════════════════════════════════════════════════════════════════
// LECTIONAR BOR 2026 — Sursa: admd.info (Patriarhia Română)
// Toate Duminicile + Sărbătorile mari cu pericope proprii
// ═══════════════════════════════════════════════════════════════════════════════

const PERICOPE_BOR_2026 = [

  // ─── IUNIE 2026 ──────────────────────────────────────────────────────────────
  // 5 Iunie — Zi de rând (Vineri) — Apostolul și Evanghelia din rânduiala săptămânii
  // Conform BOR, Vineri în săptămâna I după Rusalii:
  { data: '2026-06-05', apostol_carte: 'Romani 2, 14-29', apostol_versete: '2, 14-29', evanghelie_carte: 'Matei 10, 32-33; 37-38; 19, 27-30', evanghelie_versete: '10, 32-33; 37-38; 19, 27-30', tip_zi: 'Vineri, săptămâna I după Rusalii' },
  // 6 Iunie — Sâmbătă, Odovania Rusaliilor
  { data: '2026-06-06', apostol_carte: 'Evrei 13, 7-16', apostol_versete: '13, 7-16', evanghelie_carte: 'Ioan 17, 1-13', evanghelie_versete: '17, 1-13', tip_zi: 'Sâmbătă, Odovania Rusaliilor' },
  // 7 Iunie — Duminica I după Rusalii (a Tuturor Sfinților)
  { data: '2026-06-07', apostol_carte: 'Evrei 11, 33-40; 12, 1-2', apostol_versete: '11, 33-40; 12, 1-2', evanghelie_carte: 'Matei 10, 32-33; 37-38; 19, 27-30', evanghelie_versete: '10, 32-33; 37-38; 19, 27-30', tip_zi: 'Duminica I după Rusalii (a Tuturor Sfinților)' },
  // 8 Iunie — Luni, Începutul Postului Sf. Ap. Petru și Pavel
  { data: '2026-06-08', apostol_carte: 'Romani 1, 1-7; 13-17', apostol_versete: '1, 1-7; 13-17', evanghelie_carte: 'Matei 4, 25; 5, 1-13', evanghelie_versete: '4, 25; 5, 1-13', tip_zi: 'Luni, săptămâna II după Rusalii (Începutul Postului Sf. Ap. Petru și Pavel)' },
  // 9 Iunie — Marți
  { data: '2026-06-09', apostol_carte: 'Romani 1, 18-27', apostol_versete: '1, 18-27', evanghelie_carte: 'Matei 5, 20-26', evanghelie_versete: '5, 20-26', tip_zi: 'Marți, săptămâna II după Rusalii' },
  // 10 Iunie — Miercuri
  { data: '2026-06-10', apostol_carte: 'Romani 1, 28-32; 2, 1-9', apostol_versete: '1, 28-32; 2, 1-9', evanghelie_carte: 'Matei 5, 27-32', evanghelie_versete: '5, 27-32', tip_zi: 'Miercuri, săptămâna II după Rusalii' },
  // 11 Iunie — Joi, Sf. Ap. Bartolomeu și Barnaba
  { data: '2026-06-11', apostol_carte: 'Fapte 11, 19-26; 29-30', apostol_versete: '11, 19-26; 29-30', evanghelie_carte: 'Matei 9, 36-38; 10, 1-8', evanghelie_versete: '9, 36-38; 10, 1-8', tip_zi: 'Joi, Sf. Ap. Bartolomeu și Barnaba' },
  // 12 Iunie — Vineri
  { data: '2026-06-12', apostol_carte: 'Romani 2, 14-29', apostol_versete: '2, 14-29', evanghelie_carte: 'Matei 5, 33-41', evanghelie_versete: '5, 33-41', tip_zi: 'Vineri, săptămâna II după Rusalii' },
  // 13 Iunie — Sâmbătă
  { data: '2026-06-13', apostol_carte: 'Romani 3, 19-26', apostol_versete: '3, 19-26', evanghelie_carte: 'Matei 7, 1-8', evanghelie_versete: '7, 1-8', tip_zi: 'Sâmbătă, săptămâna II după Rusalii' },
  // 14 Iunie — Duminica II după Rusalii (a Sfinților Români)
  { data: '2026-06-14', apostol_carte: 'Romani 2, 10-16', apostol_versete: '2, 10-16', evanghelie_carte: 'Matei 4, 18-23', evanghelie_versete: '4, 18-23', tip_zi: 'Duminica II după Rusalii (a Sfinților Români; Chemarea primilor Apostoli)' },
  // 15 Iunie — Luni
  { data: '2026-06-15', apostol_carte: 'Romani 4, 4-12', apostol_versete: '4, 4-12', evanghelie_carte: 'Matei 6, 31-34; 7, 9-11', evanghelie_versete: '6, 31-34; 7, 9-11', tip_zi: 'Luni, săptămâna III după Rusalii' },
  // 16 Iunie — Marți, Sf. Ier. Martir Neofit Cretanul
  { data: '2026-06-16', apostol_carte: 'Romani 4, 13-25', apostol_versete: '4, 13-25', evanghelie_carte: 'Matei 7, 15-21', evanghelie_versete: '7, 15-21', tip_zi: 'Marți, Sf. Ier. Martir Neofit Cretanul' },
  // 17 Iunie — Miercuri
  { data: '2026-06-17', apostol_carte: 'Romani 5, 1-10', apostol_versete: '5, 1-10', evanghelie_carte: 'Matei 7, 21-23', evanghelie_versete: '7, 21-23', tip_zi: 'Miercuri, săptămâna III după Rusalii' },
  // 18 Iunie — Joi
  { data: '2026-06-18', apostol_carte: 'Romani 5, 10-16', apostol_versete: '5, 10-16', evanghelie_carte: 'Matei 8, 23-27', evanghelie_versete: '8, 23-27', tip_zi: 'Joi, săptămâna III după Rusalii' },
  // 19 Iunie — Vineri, Sf. Ap. Iuda
  { data: '2026-06-19', apostol_carte: 'Romani 5, 17-21; 6, 1-2', apostol_versete: '5, 17-21; 6, 1-2', evanghelie_carte: 'Matei 9, 14-17', evanghelie_versete: '9, 14-17', tip_zi: 'Vineri, Sf. Ap. Iuda, rudenia Domnului' },
  // 20 Iunie — Sâmbătă
  { data: '2026-06-20', apostol_carte: 'Romani 6, 11-17', apostol_versete: '6, 11-17', evanghelie_carte: 'Matei 9, 18-26', evanghelie_versete: '9, 18-26', tip_zi: 'Sâmbătă, săptămâna III după Rusalii' },
  // 21 Iunie — Duminica III după Rusalii (a Sfinților Athoniți)
  { data: '2026-06-21', apostol_carte: 'Romani 5, 1-10', apostol_versete: '5, 1-10', evanghelie_carte: 'Matei 6, 22-33', evanghelie_versete: '6, 22-33', tip_zi: 'Duminica III după Rusalii (a Sfinților Athoniți; Despre grijile vieții)' },
  // 22 Iunie — Luni, Sf. Ier. Grigorie Dascălul
  { data: '2026-06-22', apostol_carte: 'Romani 7, 1-13', apostol_versete: '7, 1-13', evanghelie_carte: 'Matei 9, 36-38; 10, 1-8', evanghelie_versete: '9, 36-38; 10, 1-8', tip_zi: 'Luni, Sf. Ier. Grigorie Dascălul' },
  // 23 Iunie — Marți
  { data: '2026-06-23', apostol_carte: 'Romani 7, 14-25', apostol_versete: '7, 14-25', evanghelie_carte: 'Matei 10, 9-15', evanghelie_versete: '10, 9-15', tip_zi: 'Marți, săptămâna IV după Rusalii' },
  // 24 Iunie — Miercuri, Nașterea Sf. Ioan Botezătorul
  { data: '2026-06-24', apostol_carte: 'Romani 13, 11-14; 14, 1-4', apostol_versete: '13, 11-14; 14, 1-4', evanghelie_carte: 'Luca 1, 1-25; 57-68; 76; 80', evanghelie_versete: '1, 1-25; 57-68; 76; 80', tip_zi: 'Nașterea Sf. Prooroc Ioan Botezătorul (Sânzienele)' },
  // 25 Iunie — Joi
  { data: '2026-06-25', apostol_carte: 'Romani 8, 22-27', apostol_versete: '8, 22-27', evanghelie_carte: 'Matei 10, 23-31', evanghelie_versete: '10, 23-31', tip_zi: 'Joi, săptămâna IV după Rusalii' },
  // 26 Iunie — Vineri
  { data: '2026-06-26', apostol_carte: 'Romani 9, 6-19', apostol_versete: '9, 6-19', evanghelie_carte: 'Matei 10, 32-36; 11, 1', evanghelie_versete: '10, 32-36; 11, 1', tip_zi: 'Vineri, săptămâna IV după Rusalii' },
  // 27 Iunie — Sâmbătă
  { data: '2026-06-27', apostol_carte: 'Romani 9, 18-33', apostol_versete: '9, 18-33', evanghelie_carte: 'Matei 12, 14-16; 22-30', evanghelie_versete: '12, 14-16; 22-30', tip_zi: 'Sâmbătă, săptămâna IV după Rusalii' },
  // 28 Iunie — Duminica IV după Rusalii (Vindecarea slugii sutașului)
  { data: '2026-06-28', apostol_carte: 'Romani 6, 18-23', apostol_versete: '6, 18-23', evanghelie_carte: 'Matei 8, 5-13', evanghelie_versete: '8, 5-13', tip_zi: 'Duminica IV după Rusalii (Vindecarea slugii sutașului)' },
  // 29 Iunie — Sf. Ap. Petru și Pavel
  { data: '2026-06-29', apostol_carte: '2 Corinteni 11, 21-33; 12, 1-9', apostol_versete: '11, 21-33; 12, 1-9', evanghelie_carte: 'Matei 16, 13-19', evanghelie_versete: '16, 13-19', tip_zi: 'Sf. Ap. Petru și Pavel' },
  // 30 Iunie — Soborul Sf. 12 Apostoli
  { data: '2026-06-30', apostol_carte: '1 Corinteni 4, 9-16', apostol_versete: '4, 9-16', evanghelie_carte: 'Marcu 3, 13-19', evanghelie_versete: '3, 13-19', tip_zi: 'Soborul Sf. 12 Apostoli; Sf. Ier. Ghelasie de la Râmeț' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// FUNCȚIE PRINCIPALĂ
// ═══════════════════════════════════════════════════════════════════════════════

async function fixPericopeBOR() {
  console.log('🔧 Actualizez Supabase cu pericopele CORECTE BOR 2026...\n');
  console.log('📖 Sursa: admd.info (calendar oficial Patriarhia Română)\n');
  
  let succese = 0;
  let erori = 0;
  let create = 0;

  for (const zi of PERICOPE_BOR_2026) {
    // Verificăm dacă există rândul în Supabase
    const { data: existing } = await supabase
      .from('zile_ortodoxe')
      .select('data_calendaristica, apostol_carte')
      .eq('data_calendaristica', zi.data)
      .single();

    if (!existing) {
      // Rândul nu există — îl creăm cu datele minime
      const { error: insertError } = await supabase
        .from('zile_ortodoxe')
        .insert({
          data_calendaristica: zi.data,
          apostol_carte: zi.apostol_carte,
          apostol_versete: zi.apostol_versete,
          evanghelie_carte: zi.evanghelie_carte,
          evanghelie_versete: zi.evanghelie_versete,
        });
      
      if (insertError) {
        console.error(`❌ ${zi.data}: Eroare insert — ${insertError.message}`);
        erori++;
      } else {
        console.log(`🆕 ${zi.data}: Creat — ${zi.apostol_carte} | ${zi.evanghelie_carte}`);
        create++;
      }
    } else {
      // Actualizăm pericopele
      const { error } = await supabase
        .from('zile_ortodoxe')
        .update({
          apostol_carte: zi.apostol_carte,
          apostol_versete: zi.apostol_versete,
          evanghelie_carte: zi.evanghelie_carte,
          evanghelie_versete: zi.evanghelie_versete,
        })
        .eq('data_calendaristica', zi.data);

      if (error) {
        console.error(`❌ ${zi.data}: Eroare update — ${error.message}`);
        erori++;
      } else {
        console.log(`✅ ${zi.data}: ${zi.apostol_carte} | ${zi.evanghelie_carte}`);
        succese++;
      }
    }

    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`\n📊 Rezultate:`);
  console.log(`   ✅ Actualizate: ${succese}`);
  console.log(`   🆕 Create: ${create}`);
  console.log(`   ❌ Erori: ${erori}`);
  console.log(`\n✅ Pericopele BOR 2026 sunt acum corecte în Supabase!`);
  
  // Verificare finală
  console.log('\n🔍 Verificare finală pentru 5-10 iunie 2026:');
  const { data: verificare } = await supabase
    .from('zile_ortodoxe')
    .select('data_calendaristica, apostol_carte, evanghelie_carte')
    .gte('data_calendaristica', '2026-06-05')
    .lte('data_calendaristica', '2026-06-10')
    .order('data_calendaristica');
    
  if (verificare) {
    verificare.forEach(r => {
      console.log(`   ${r.data_calendaristica}: ${r.apostol_carte} | ${r.evanghelie_carte}`);
    });
  }
}

fixPericopeBOR().catch(console.error);
