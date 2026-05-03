/**
 * genereaza-continut.js
 * Povești de Credință — povestidecredinta.ro
 * 
 * Script rulat zilnic via GitHub Actions la 00:01 România (22:01 UTC)
 * Generează conținut ortodox complet pentru ziua următoare folosind OpenAI API
 * și îl salvează în Supabase.
 * 
 * Fiecare linie de cod este o candelă aprinsă. Amin. ✝️
 */

const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');

// ─── Configurare ─────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://smuqpipxeotkbttolivp.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY;

// Validare chei obligatorii
if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_KEY lipsește!');
  process.exit(1);
}
if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY lipsește!');
  process.exit(1);
}

// ─── Clienți ─────────────────────────────────────────────────────────────────
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// ─── Date calendar ortodox static (fallback) ─────────────────────────────────
const CALENDAR_STATIC = {
  '01-01': { sfant: 'Tăierea împrejur cea după trup a Domnului; Sfântul Vasile cel Mare', post: 'dezlegare', culoare: 'alb' },
  '01-06': { sfant: 'Botezul Domnului (Boboteaza)', post: 'dezlegare', culoare: 'alb' },
  '01-07': { sfant: 'Soborul Sfântului Ioan Botezătorul', post: 'dezlegare', culoare: 'alb' },
  '01-17': { sfant: 'Cuviosul Antonie cel Mare', post: 'dezlegare', culoare: 'verde' },
  '01-20': { sfant: 'Sfântul Eutimie cel Mare', post: 'dezlegare', culoare: 'verde' },
  '01-30': { sfant: 'Sfinții Trei Ierarhi: Vasile cel Mare, Grigorie Teologul și Ioan Gură de Aur', post: 'dezlegare', culoare: 'alb' },
  '02-02': { sfant: 'Întâmpinarea Domnului', post: 'dezlegare', culoare: 'alb' },
  '02-10': { sfant: 'Sfântul Haralambie', post: 'dezlegare', culoare: 'rosu' },
  '03-09': { sfant: 'Sfinții 40 de Mucenici din Sevastia', post: 'dezlegare_vin_ulei', culoare: 'rosu' },
  '03-25': { sfant: 'Buna Vestire a Maicii Domnului', post: 'dezlegare_peste', culoare: 'alb' },
  '04-23': { sfant: 'Sfântul Mare Mucenic Gheorghe', post: 'dezlegare', culoare: 'rosu' },
  '05-01': { sfant: 'Sfântul Prooroc Ieremia', post: 'post', culoare: 'verde' },
  '05-02': { sfant: 'Sfântul Atanasie cel Mare, arhiepiscopul Alexandriei', post: 'post', culoare: 'alb' },
  '05-03': { sfant: 'Sfinții Mucenici Timotei și Mavra', post: 'dezlegare', culoare: 'rosu' },
  '05-04': { sfant: 'Cuvioasa Pelaghia din Tars', post: 'post', culoare: 'alb' },
  '05-05': { sfant: 'Sfânta Mare Muceniță Irina', post: 'dezlegare', culoare: 'rosu' },
  '05-06': { sfant: 'Dreptul Iov cel mult pătimitor', post: 'post', culoare: 'alb' },
  '05-07': { sfant: 'Arătarea Sfintei Cruci pe cerul Ierusalimului', post: 'dezlegare', culoare: 'alb' },
  '05-08': { sfant: 'Sfântul Apostol și Evanghelist Ioan Teologul', post: 'post', culoare: 'alb' },
  '05-09': { sfant: 'Sfântul Prooroc Isaia; Sfântul Mucenic Hristofor', post: 'dezlegare_peste', culoare: 'verde' },
  '05-10': { sfant: 'Sfântul Apostol Simon Zilotul', post: 'dezlegare', culoare: 'alb' },
  '05-11': { sfant: 'Sfinții Egali cu Apostolii Chiril și Metodie', post: 'post', culoare: 'alb' },
  '05-12': { sfant: 'Sfântul Epifanie al Ciprului', post: 'dezlegare', culoare: 'alb' },
  '05-13': { sfant: 'Sfânta Muceniță Glicheria', post: 'post', culoare: 'rosu' },
  '05-14': { sfant: 'Sfântul Mucenic Isidor din Hio', post: 'dezlegare', culoare: 'rosu' },
  '05-15': { sfant: 'Sfântul Pahomie cel Mare', post: 'post', culoare: 'verde' },
  '05-16': { sfant: 'Sfântul Teodor Sfințitul', post: 'dezlegare', culoare: 'verde' },
  '05-17': { sfant: 'Sfântul Apostol Andronic', post: 'post', culoare: 'alb' },
  '05-18': { sfant: 'Sfântul Mucenic Teodot din Ancira', post: 'dezlegare', culoare: 'rosu' },
  '05-19': { sfant: 'Sfântul Patrichie al Prusiei', post: 'post', culoare: 'alb' },
  '05-20': { sfant: 'Sfântul Talaleleu', post: 'dezlegare', culoare: 'rosu' },
  '05-21': { sfant: 'Sfinții Împărați Constantin și Elena', post: 'post', culoare: 'alb' },
  '05-22': { sfant: 'Sfântul Vasile Episcopul Amasiei', post: 'dezlegare', culoare: 'rosu' },
  '05-23': { sfant: 'Sfântul Mihail Mărturisitorul', post: 'post', culoare: 'alb' },
  '05-24': { sfant: 'Sfântul Simeon cel din Muntele Minunat', post: 'dezlegare', culoare: 'verde' },
  '05-25': { sfant: 'A treia aflare a Capului Sfântului Ioan Botezătorul', post: 'post', culoare: 'alb' },
  '05-26': { sfant: 'Sfântul Apostol Carp', post: 'dezlegare', culoare: 'alb' },
  '05-27': { sfant: 'Sfântul Ioan cel Nou de la Suceava', post: 'post', culoare: 'rosu' },
  '05-28': { sfant: 'Sfântul Eutihie Patriarhul Constantinopolului', post: 'dezlegare', culoare: 'alb' },
  '05-29': { sfant: 'Sfântul Mucenic Teodosia fecioara', post: 'post', culoare: 'rosu' },
  '05-30': { sfant: 'Sfântul Isaac Dalmatinul', post: 'dezlegare', culoare: 'verde' },
  '05-31': { sfant: 'Sfântul Ermie Mucenicul', post: 'post', culoare: 'rosu' },
  '06-01': { sfant: 'Sfântul Iustin Martirul și Filosoful', post: 'dezlegare', culoare: 'rosu' },
  '06-02': { sfant: 'Sfântul Nichifor Mărturisitorul', post: 'post', culoare: 'alb' },
  '06-24': { sfant: 'Nașterea Sfântului Ioan Botezătorul', post: 'dezlegare', culoare: 'alb' },
  '06-29': { sfant: 'Sfinții Apostoli Petru și Pavel', post: 'dezlegare', culoare: 'alb' },
  '07-20': { sfant: 'Sfântul Prooroc Ilie Tesviteanul', post: 'dezlegare', culoare: 'alb' },
  '08-06': { sfant: 'Schimbarea la Față a Domnului', post: 'dezlegare_peste', culoare: 'alb' },
  '08-15': { sfant: 'Adormirea Maicii Domnului', post: 'dezlegare', culoare: 'alb' },
  '09-08': { sfant: 'Nașterea Maicii Domnului', post: 'dezlegare', culoare: 'alb' },
  '09-14': { sfant: 'Înălțarea Sfintei Cruci', post: 'post', culoare: 'rosu' },
  '10-14': { sfant: 'Cuvioasa Parascheva de la Iași', post: 'dezlegare', culoare: 'alb' },
  '11-08': { sfant: 'Soborul Sfinților Arhangheli Mihail și Gavriil', post: 'dezlegare', culoare: 'alb' },
  '11-30': { sfant: 'Sfântul Apostol Andrei, Ocrotitorul României', post: 'dezlegare', culoare: 'alb' },
  '12-06': { sfant: 'Sfântul Ierarh Nicolae, arhiepiscopul Mirelor Lichiei', post: 'dezlegare', culoare: 'alb' },
  '12-25': { sfant: 'Nașterea Domnului nostru Iisus Hristos (Crăciunul)', post: 'dezlegare', culoare: 'alb' },
  '12-26': { sfant: 'Soborul Maicii Domnului', post: 'dezlegare', culoare: 'alb' }
};

// ─── Funcții helper ───────────────────────────────────────────────────────────

function getDataMaine() {
  const maine = new Date();
  maine.setDate(maine.getDate() + 1);
  return maine.toISOString().split('T')[0]; // YYYY-MM-DD
}

function getDataKey(dataStr) {
  return dataStr.substring(5); // MM-DD din YYYY-MM-DD
}

function getZiuaSaptamanii(dataStr) {
  const d = new Date(dataStr);
  return d.getDay(); // 0=Duminică, 1=Luni, ... 6=Sâmbătă
}

function getTipPostDefault(dataStr) {
  const zi = getZiuaSaptamanii(dataStr);
  const key = getDataKey(dataStr);
  if (CALENDAR_STATIC[key]) return CALENDAR_STATIC[key].post;
  if (zi === 3 || zi === 5) return 'post'; // Miercuri și Vineri
  return 'dezlegare';
}

function getSfantDefault(dataStr) {
  const key = getDataKey(dataStr);
  return CALENDAR_STATIC[key]?.sfant || `Sfânt din Sinaxarul BOR pentru ${dataStr}`;
}

// ─── Generare conținut cu OpenAI ─────────────────────────────────────────────

async function genereazaContiut(data) {
  const sfantDefault = getSfantDefault(data);
  const tipPost = getTipPostDefault(data);
  
  const prompt = `Ești un preot ortodox român erudit și un expert în Sinaxarul Bisericii Ortodoxe Române.
Generează conținut complet pentru calendarul ortodox pentru data ${data}.
Sfântul principal al zilei este: ${sfantDefault}
Tipul de post: ${tipPost}

Răspunde DOAR cu JSON valid, fără alte texte, fără markdown, fără explicații.
Folosește diacritice românești corecte (ă, â, î, ș, ț).
Toate textele trebuie să fie autentice, ortodoxe și conform tradiției BOR.

JSON exact (toate câmpurile obligatorii):
{
  "sfant_nume": "numele complet al sfântului principal conform Sinaxarului BOR",
  "sfant_viata": "viața sfântului în 250-300 cuvinte, scrisă cu evlavie, cu date istorice exacte",
  "tropar": "troparul complet al sfântului (glasul și textul integral)",
  "tip_post": "${tipPost}",
  "culoare_liturgica": "una din: alb / rosu / verde / violet / negru",
  "rugaciunea_zilei": "o rugăciune ortodoxă completă potrivită zilei, de 50-80 cuvinte",
  "sinaxar": "sinaxarul zilei în 180-220 cuvinte, cu toți sfinții zilei",
  "apostol_carte": "cartea Apostolului (ex: Romani)",
  "apostol_versete": "versetele exacte (ex: 8:1-14)",
  "apostol_text": "textul complet al Apostolului zilei conform lectinarului ortodox",
  "evanghelie_carte": "cartea Evangheliei (ex: Ioan)",
  "evanghelie_versete": "versetele exacte (ex: 1:1-17)",
  "evanghelie_text": "textul complet al Evangheliei zilei conform lectinarului ortodox",
  "predica": "predică scurtă de 150-180 cuvinte bazată pe Evanghelia zilei, cu aplicare practică",
  "cuvant_folos": "citat patristic autentic relevant pentru ziua respectivă, cu sursa exactă",
  "sfinti_secundari": "alți sfinți prăznuiți în această zi, separați prin punct și virgulă",
  "meta_description": "descriere SEO de exact 150-160 caractere pentru această zi, cu sfântul și data"
}`;

  console.log(`\n📿 Generez conținut pentru ${data} — ${sfantDefault}`);
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [
      { 
        role: 'system', 
        content: 'Ești un preot ortodox român erudit. Răspunzi DOAR cu JSON valid, fără alte texte. Folosești diacritice românești corecte.' 
      },
      { role: 'user', content: prompt }
    ],
    temperature: 0.3,
    max_tokens: 3000
  });

  const continut = response.choices[0].message.content.trim();
  
  // Curăță răspunsul de eventuale blocuri markdown
  const jsonCurat = continut
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  
  return JSON.parse(jsonCurat);
}

// ─── Salvare în Supabase ──────────────────────────────────────────────────────

async function salveazaInSupabase(data, continut) {
  const record = {
    data: data,
    ...continut
  };

  const { data: result, error } = await supabase
    .from('zile_ortodoxe')
    .upsert(record, { onConflict: 'data' });

  if (error) {
    console.error('❌ Eroare Supabase:', error.message);
    throw error;
  }

  console.log(`✅ Salvat în Supabase pentru ${data}`);
  return result;
}

// ─── Push notification OneSignal ─────────────────────────────────────────────

async function trimiteNotificare(data, sfantNume) {
  if (!ONESIGNAL_APP_ID || !ONESIGNAL_API_KEY) {
    console.log('⚠️  OneSignal nu este configurat — skip notificare');
    return;
  }

  const dataRo = new Date(data);
  const luni = ['ianuarie','februarie','martie','aprilie','mai','iunie','iulie','august','septembrie','octombrie','noiembrie','decembrie'];
  const dataFormatata = `${dataRo.getDate()} ${luni[dataRo.getMonth()]} ${dataRo.getFullYear()}`;

  const payload = {
    app_id: ONESIGNAL_APP_ID,
    included_segments: ['All'],
    headings: { ro: `✝️ ${sfantNume}` },
    contents: { ro: `Calendar ortodox ${dataFormatata} — Sfântul zilei, Apostolul și Evanghelia zilei` },
    url: 'https://povestidecredinta.ro/sfantul-zilei/',
    chrome_web_icon: 'https://povestidecredinta.ro/images/icon-192.png',
    send_after: `${data} 05:00:00 GMT+0200`
  };

  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${ONESIGNAL_API_KEY}`
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json();
  if (result.id) {
    console.log(`🔔 Notificare programată pentru ${data} la 05:00 România`);
  } else {
    console.warn('⚠️  Notificare OneSignal:', JSON.stringify(result));
  }
}

// ─── Funcție principală ───────────────────────────────────────────────────────

async function main() {
  console.log('✝️  Povești de Credință — Generare conținut zilnic');
  console.log('================================================');
  
  // Determină data pentru care generăm (implicit: mâine)
  const dataTarget = process.argv[2] || getDataMaine();
  console.log(`📅 Data target: ${dataTarget}`);

  // Verifică dacă există deja în Supabase
  const { data: existing, error: checkError } = await supabase
    .from('zile_ortodoxe')
    .select('data, sfant_nume')
    .eq('data', dataTarget)
    .single();

  if (existing && !process.argv.includes('--force')) {
    console.log(`ℹ️  Conținut deja există pentru ${dataTarget}: ${existing.sfant_nume}`);
    console.log('   Folosește --force pentru a regenera');
    return;
  }

  try {
    // Generează conținut cu OpenAI
    const continut = await genereazaContiut(dataTarget);
    console.log(`📖 Sfânt generat: ${continut.sfant_nume}`);
    
    // Salvează în Supabase
    await salveazaInSupabase(dataTarget, continut);
    
    // Trimite notificare push
    await trimiteNotificare(dataTarget, continut.sfant_nume);
    
    console.log('\n✅ Flux complet finalizat cu succes!');
    console.log(`   Sfânt: ${continut.sfant_nume}`);
    console.log(`   Post: ${continut.tip_post}`);
    console.log(`   Apostol: ${continut.apostol_carte} ${continut.apostol_versete}`);
    console.log(`   Evanghelie: ${continut.evanghelie_carte} ${continut.evanghelie_versete}`);
    
  } catch (error) {
    console.error('\n❌ Eroare în generarea conținutului:', error.message);
    
    // Fallback: salvează date minime din calendar static
    console.log('⚠️  Salvez date fallback din calendar static...');
    const sfantFallback = getSfantDefault(dataTarget);
    const fallbackRecord = {
      sfant_nume: sfantFallback,
      tip_post: getTipPostDefault(dataTarget),
      culoare_liturgica: 'alb',
      sfant_viata: `${sfantFallback} — Conform Sinaxarului Bisericii Ortodoxe Române.`,
      meta_description: `Calendar ortodox ${dataTarget}: ${sfantFallback.substring(0, 100)}.`
    };
    
    await salveazaInSupabase(dataTarget, fallbackRecord);
    console.log('✅ Date fallback salvate');
    
    process.exit(1);
  }
}

// ─── Rulare ───────────────────────────────────────────────────────────────────
main().catch(err => {
  console.error('❌ Eroare fatală:', err);
  process.exit(1);
});
