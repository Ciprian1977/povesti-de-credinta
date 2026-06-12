/**
 * fix_pericope_bor.js
 * Actualizează Supabase cu pericopele corecte BOR pentru 2026
 * Sursa: admd.info/calendar_anual.php (reflectă calendarul oficial Patriarhia Română)
 * 
 * Rulare: SUPABASE_SERVICE_KEY="..." node fix_pericope_bor.js
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://smuqpipxeotkbttolivp.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// ═══════════════════════════════════════════════════════════════════════════════
// LECTIONAR BOR 2026 — Sursa: admd.info (Patriarhia Română)
// Structura: { data: 'YYYY-MM-DD', apostol_carte, apostol_versete, evanghelie_carte, evanghelie_versete, tip_zi }
// ═══════════════════════════════════════════════════════════════════════════════

const PERICOPE_BOR_2026 = [
  // ─── IUNIE 2026 ──────────────────────────────────────────────────────────────
  {
    data: '2026-06-07',
    tip_zi: 'Duminica I după Rusalii (a Tuturor Sfinților; Urmarea lui Hristos)',
    apostol_carte: 'Evrei 11, 33-40; 12, 1-2',
    apostol_versete: '11, 33-40; 12, 1-2',
    evanghelie_carte: 'Matei 10, 32-33; 37-38; 19, 27-30',
    evanghelie_versete: '10, 32-33; 37-38; 19, 27-30',
    glas: 8, voscresna: 1
  },
  {
    data: '2026-06-14',
    tip_zi: 'Duminica a II-a după Rusalii (a Sfinților Români; Chemarea primilor Apostoli)',
    apostol_carte: 'Romani 2, 10-16',
    apostol_versete: '2, 10-16',
    evanghelie_carte: 'Matei 4, 18-23',
    evanghelie_versete: '4, 18-23',
    glas: 1, voscresna: 2
  },
  {
    data: '2026-06-21',
    tip_zi: 'Duminica a III-a după Rusalii (a Sfinților Athoniți; Despre grijile vieții)',
    apostol_carte: 'Romani 5, 1-10',
    apostol_versete: '5, 1-10',
    evanghelie_carte: 'Matei 6, 22-33',
    evanghelie_versete: '6, 22-33',
    glas: 2, voscresna: 3
  },
  {
    data: '2026-06-28',
    tip_zi: 'Duminica a IV-a după Rusalii (Vindecarea slugii sutașului)',
    apostol_carte: 'Romani 6, 18-23',
    apostol_versete: '6, 18-23',
    evanghelie_carte: 'Matei 8, 5-13',
    evanghelie_versete: '8, 5-13',
    glas: 3, voscresna: 4
  },

  // ─── IULIE 2026 ──────────────────────────────────────────────────────────────
  {
    data: '2026-07-05',
    tip_zi: 'Duminica a V-a după Rusalii (Vindecarea celor doi demonizați din ținutul Gadarei)',
    apostol_carte: 'Romani 10, 1-10',
    apostol_versete: '10, 1-10',
    evanghelie_carte: 'Matei 8, 28-34; 9, 1',
    evanghelie_versete: '8, 28-34; 9, 1',
    glas: 4, voscresna: 5
  },
  {
    data: '2026-07-12',
    tip_zi: 'Duminica a VI-a după Rusalii (Vindecarea paraliticului din Capernaum)',
    apostol_carte: 'Romani 12, 6-14',
    apostol_versete: '12, 6-14',
    evanghelie_carte: 'Matei 9, 1-8',
    evanghelie_versete: '9, 1-8',
    glas: 5, voscresna: 6
  },
  {
    data: '2026-07-19',
    tip_zi: 'Duminica a VII-a după Rusalii (a Sfinților Părinți de la Sinodul al IV-lea Ecumenic; Vindecarea a doi orbi și a unui mut)',
    apostol_carte: 'Romani 15, 1-7',
    apostol_versete: '15, 1-7',
    evanghelie_carte: 'Matei 9, 27-35',
    evanghelie_versete: '9, 27-35',
    glas: 6, voscresna: 7
  },
  {
    data: '2026-07-26',
    tip_zi: 'Duminica a VIII-a după Rusalii (Înmulțirea pâinilor)',
    apostol_carte: '1 Corinteni 1, 10-17',
    apostol_versete: '1, 10-17',
    evanghelie_carte: 'Matei 14, 14-22',
    evanghelie_versete: '14, 14-22',
    glas: 7, voscresna: 8
  },

  // ─── AUGUST 2026 ─────────────────────────────────────────────────────────────
  {
    data: '2026-08-02',
    tip_zi: 'Duminica a IX-a după Rusalii (a Sfinților Părinți de la primele șase Sinoade Ecumenice; Umblarea pe mare)',
    apostol_carte: '1 Corinteni 3, 9-17',
    apostol_versete: '3, 9-17',
    evanghelie_carte: 'Matei 14, 22-34',
    evanghelie_versete: '14, 22-34',
    glas: 8, voscresna: 9
  },
  {
    data: '2026-08-09',
    tip_zi: 'Duminica a X-a după Rusalii (Vindecarea lunaticului)',
    apostol_carte: '1 Corinteni 4, 9-16',
    apostol_versete: '4, 9-16',
    evanghelie_carte: 'Matei 17, 14-23',
    evanghelie_versete: '17, 14-23',
    glas: 1, voscresna: 10
  },
  {
    data: '2026-08-16',
    tip_zi: 'Duminica a XI-a după Rusalii (Pilda datornicului nemilostiv)',
    apostol_carte: '1 Corinteni 9, 2-12',
    apostol_versete: '9, 2-12',
    evanghelie_carte: 'Matei 18, 23-35',
    evanghelie_versete: '18, 23-35',
    glas: 2, voscresna: 11
  },
  {
    data: '2026-08-23',
    tip_zi: 'Duminica a XII-a după Rusalii (Tânărul bogat)',
    apostol_carte: '1 Corinteni 15, 1-11',
    apostol_versete: '15, 1-11',
    evanghelie_carte: 'Matei 19, 16-26',
    evanghelie_versete: '19, 16-26',
    glas: 3, voscresna: 1
  },
  {
    data: '2026-08-30',
    tip_zi: 'Duminica a XIII-a după Rusalii (Pilda lucrătorilor răi)',
    apostol_carte: '1 Corinteni 16, 13-24',
    apostol_versete: '16, 13-24',
    evanghelie_carte: 'Matei 21, 33-44',
    evanghelie_versete: '21, 33-44',
    glas: 4, voscresna: 2
  },

  // ─── SEPTEMBRIE 2026 ─────────────────────────────────────────────────────────
  {
    data: '2026-09-06',
    tip_zi: 'Duminica a XIV-a după Rusalii (Pilda nunții fiului de împărat)',
    apostol_carte: '2 Corinteni 1, 21-24; 2, 1-4',
    apostol_versete: '1, 21-24; 2, 1-4',
    evanghelie_carte: 'Matei 22, 1-14',
    evanghelie_versete: '22, 1-14',
    glas: 5, voscresna: 3
  },
  {
    data: '2026-09-13',
    tip_zi: 'Duminica dinaintea Înălțării Sfintei Cruci (Convorbirea lui Iisus cu Nicodim)',
    apostol_carte: 'Galateni 6, 11-18',
    apostol_versete: '6, 11-18',
    evanghelie_carte: 'Ioan 3, 13-17',
    evanghelie_versete: '3, 13-17',
    glas: 6, voscresna: 4
  },
  {
    data: '2026-09-20',
    tip_zi: 'Duminica după Înălțarea Sfintei Cruci (Luarea crucii și urmarea lui Hristos)',
    apostol_carte: 'Galateni 2, 16-20',
    apostol_versete: '2, 16-20',
    evanghelie_carte: 'Marcu 8, 34-38; 9, 1',
    evanghelie_versete: '8, 34-38; 9, 1',
    glas: 7, voscresna: 5
  },
  {
    data: '2026-09-27',
    tip_zi: 'Duminica a XVIII-a după Rusalii (Pescuirea minunată)',
    apostol_carte: '2 Corinteni 9, 6-11',
    apostol_versete: '9, 6-11',
    evanghelie_carte: 'Luca 5, 1-11',
    evanghelie_versete: '5, 1-11',
    glas: 8, voscresna: 6
  },

  // ─── OCTOMBRIE 2026 ──────────────────────────────────────────────────────────
  {
    data: '2026-10-04',
    tip_zi: 'Duminica a XIX-a după Rusalii (Predica de pe munte. Iubirea vrăjmașilor)',
    apostol_carte: '2 Corinteni 11, 31-33; 12, 1-9',
    apostol_versete: '11, 31-33; 12, 1-9',
    evanghelie_carte: 'Luca 6, 31-36',
    evanghelie_versete: '6, 31-36',
    glas: 1, voscresna: 7
  },
  {
    data: '2026-10-11',
    tip_zi: 'Duminica a XXI-a după Rusalii (a Sfinților Părinți de la Sinodul al VII-lea Ecumenic; Pilda semănătorului)',
    apostol_carte: 'Galateni 2, 16-20',
    apostol_versete: '2, 16-20',
    evanghelie_carte: 'Luca 8, 5-15',
    evanghelie_versete: '8, 5-15',
    glas: 2, voscresna: 8
  },
  {
    data: '2026-10-18',
    tip_zi: 'Duminica a XX-a după Rusalii (Învierea fiului văduvei din Nain)',
    apostol_carte: 'Galateni 1, 11-19',
    apostol_versete: '1, 11-19',
    evanghelie_carte: 'Luca 7, 11-16',
    evanghelie_versete: '7, 11-16',
    glas: 3, voscresna: 9
  },
  {
    data: '2026-10-25',
    tip_zi: 'Duminica a XXIII-a după Rusalii (Vindecarea demonizatului din ținutul Gherghesenilor)',
    apostol_carte: 'Efeseni 2, 4-10',
    apostol_versete: '2, 4-10',
    evanghelie_carte: 'Luca 8, 26-39',
    evanghelie_versete: '8, 26-39',
    glas: 4, voscresna: 10
  },

  // ─── NOIEMBRIE 2026 ──────────────────────────────────────────────────────────
  {
    data: '2026-11-01',
    tip_zi: 'Duminica a XXII-a după Rusalii (Bogatul nemilostiv și săracul Lazăr)',
    apostol_carte: 'Galateni 6, 11-18',
    apostol_versete: '6, 11-18',
    evanghelie_carte: 'Luca 16, 19-31',
    evanghelie_versete: '16, 19-31',
    glas: 5, voscresna: 11
  },
  {
    data: '2026-11-08',
    tip_zi: 'Duminica a XXIV-a după Rusalii (Învierea fiicei lui Iair)',
    apostol_carte: 'Efeseni 2, 14-22',
    apostol_versete: '2, 14-22',
    evanghelie_carte: 'Luca 8, 41-56',
    evanghelie_versete: '8, 41-56',
    glas: 6, voscresna: 1
  },
  {
    data: '2026-11-15',
    tip_zi: 'Duminica a XXV-a după Rusalii (Pilda samarineanului milostiv)',
    apostol_carte: 'Efeseni 4, 1-7',
    apostol_versete: '4, 1-7',
    evanghelie_carte: 'Luca 10, 25-37',
    evanghelie_versete: '10, 25-37',
    glas: 7, voscresna: 2
  },
  {
    data: '2026-11-22',
    tip_zi: 'Duminica a XXVI-a după Rusalii (Pilda bogatului căruia i-a rodit țarina)',
    apostol_carte: 'Efeseni 5, 9-19',
    apostol_versete: '5, 9-19',
    evanghelie_carte: 'Luca 12, 16-21',
    evanghelie_versete: '12, 16-21',
    glas: 8, voscresna: 3
  },
  {
    data: '2026-11-29',
    tip_zi: 'Duminica a XXVII-a după Rusalii (Tămăduirea femeii gârbove)',
    apostol_carte: 'Efeseni 6, 10-17',
    apostol_versete: '6, 10-17',
    evanghelie_carte: 'Luca 13, 10-17',
    evanghelie_versete: '13, 10-17',
    glas: 2, voscresna: 5
  },

  // ─── DECEMBRIE 2026 ──────────────────────────────────────────────────────────
  {
    data: '2026-12-06',
    tip_zi: 'Duminica a XXVIII-a după Rusalii (a Sfinților Strămoși după trup ai Domnului; Pilda celor poftiți la cină)',
    apostol_carte: 'Coloseni 3, 4-11',
    apostol_versete: '3, 4-11',
    evanghelie_carte: 'Luca 14, 16-24',
    evanghelie_versete: '14, 16-24',
    glas: 3, voscresna: 6
  },
  {
    data: '2026-12-13',
    tip_zi: 'Duminica a XXX-a după Rusalii (Dregătorul bogat - Păzirea poruncilor)',
    apostol_carte: 'Coloseni 3, 12-16',
    apostol_versete: '3, 12-16',
    evanghelie_carte: 'Luca 18, 18-27',
    evanghelie_versete: '18, 18-27',
    glas: 1, voscresna: 4
  },
  {
    data: '2026-12-20',
    tip_zi: 'Duminica dinaintea Nașterii Domnului (a Sfinților Părinți după trup ai Domnului; Genealogia Mântuitorului)',
    apostol_carte: 'Evrei 11, 9-10; 32-40',
    apostol_versete: '11, 9-10; 32-40',
    evanghelie_carte: 'Matei 1, 1-25',
    evanghelie_versete: '1, 1-25',
    glas: 4, voscresna: 7
  },
  {
    data: '2026-12-27',
    tip_zi: 'Duminica după Nașterea Domnului (a Sf. Iosif, David Proorocul și Iacob; Fuga în Egipt)',
    apostol_carte: 'Galateni 1, 11-19',
    apostol_versete: '1, 11-19',
    evanghelie_carte: 'Matei 2, 13-23',
    evanghelie_versete: '2, 13-23',
    glas: 5, voscresna: 8
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// FUNCȚIE PRINCIPALĂ: Actualizează Supabase cu pericopele corecte
// ═══════════════════════════════════════════════════════════════════════════════

async function fixPericopeBOR() {
  console.log('🔧 Actualizez Supabase cu pericopele corecte BOR 2026...\n');
  
  let succese = 0;
  let erori = 0;
  let lipsa = 0;

  for (const zi of PERICOPE_BOR_2026) {
    // Verificăm dacă există rândul în Supabase
    const { data: existing } = await supabase
      .from('zile_ortodoxe')
      .select('id, apostol_carte, evanghelie_carte')
      .eq('data_calendaristica', zi.data)
      .single();

    if (!existing) {
      console.log(`⚠️  ${zi.data}: Nu există rând în Supabase — va fi creat la generarea zilnică`);
      lipsa++;
      continue;
    }

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
      console.error(`❌ ${zi.data}: Eroare — ${error.message}`);
      erori++;
    } else {
      console.log(`✅ ${zi.data}: ${zi.apostol_carte} | ${zi.evanghelie_carte}`);
      succese++;
    }

    // Pauză mică pentru a nu suprasolicita API-ul
    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`\n📊 Rezultate:`);
  console.log(`   ✅ Actualizate: ${succese}`);
  console.log(`   ❌ Erori: ${erori}`);
  console.log(`   ⚠️  Lipsă (vor fi create la generare): ${lipsa}`);
  console.log(`\n✅ Pericopele BOR 2026 sunt acum corecte în Supabase!`);
}

fixPericopeBOR().catch(console.error);
