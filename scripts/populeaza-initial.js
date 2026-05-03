/**
 * populeaza-initial.js
 * Povești de Credință — povestidecredinta.ro
 * 
 * Rulează o singură dată pentru a popula Supabase cu date pentru
 * următoarele 30 de zile înainte de lansare.
 * 
 * Utilizare: node scripts/populeaza-initial.js [numar_zile]
 * Exemplu:   node scripts/populeaza-initial.js 30
 */

const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://smuqpipxeotkbttolivp.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!SUPABASE_SERVICE_KEY || !OPENAI_API_KEY) {
  console.error('❌ Lipsesc variabilele de mediu: SUPABASE_SERVICE_KEY, OPENAI_API_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const CALENDAR_STATIC = {
  '01-01': { sfant: 'Tăierea împrejur cea după trup a Domnului; Sfântul Vasile cel Mare', post: 'dezlegare', culoare: 'alb' },
  '01-06': { sfant: 'Botezul Domnului (Boboteaza)', post: 'dezlegare', culoare: 'alb' },
  '01-30': { sfant: 'Sfinții Trei Ierarhi', post: 'dezlegare', culoare: 'alb' },
  '02-02': { sfant: 'Întâmpinarea Domnului', post: 'dezlegare', culoare: 'alb' },
  '03-25': { sfant: 'Buna Vestire a Maicii Domnului', post: 'dezlegare_peste', culoare: 'alb' },
  '04-23': { sfant: 'Sfântul Mare Mucenic Gheorghe', post: 'dezlegare', culoare: 'rosu' },
  '05-01': { sfant: 'Sfântul Prooroc Ieremia', post: 'post', culoare: 'verde' },
  '05-02': { sfant: 'Sfântul Atanasie cel Mare', post: 'post', culoare: 'alb' },
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
  '05-29': { sfant: 'Sfânta Muceniță Teodosia fecioara', post: 'post', culoare: 'rosu' },
  '05-30': { sfant: 'Sfântul Isaac Dalmatinul', post: 'dezlegare', culoare: 'verde' },
  '05-31': { sfant: 'Sfântul Ermie Mucenicul', post: 'post', culoare: 'rosu' },
  '06-01': { sfant: 'Sfântul Iustin Martirul și Filosoful', post: 'dezlegare', culoare: 'rosu' },
  '06-02': { sfant: 'Sfântul Nichifor Mărturisitorul', post: 'post', culoare: 'alb' },
  '06-03': { sfant: 'Sfinții Mucenici Luchilian și cei împreună cu el', post: 'dezlegare', culoare: 'rosu' },
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
  '12-06': { sfant: 'Sfântul Ierarh Nicolae', post: 'dezlegare', culoare: 'alb' },
  '12-25': { sfant: 'Nașterea Domnului nostru Iisus Hristos (Crăciunul)', post: 'dezlegare', culoare: 'alb' }
};

function getDataKey(dataStr) { return dataStr.substring(5); }
function getSfantDefault(dataStr) {
  const key = getDataKey(dataStr);
  const zi = new Date(dataStr).getDay();
  return CALENDAR_STATIC[key]?.sfant || `Sfânt din Sinaxarul BOR`;
}
function getTipPostDefault(dataStr) {
  const key = getDataKey(dataStr);
  if (CALENDAR_STATIC[key]) return CALENDAR_STATIC[key].post;
  const zi = new Date(dataStr).getDay();
  return (zi === 3 || zi === 5) ? 'post' : 'dezlegare';
}

async function genereazaZi(data) {
  const sfantDefault = getSfantDefault(data);
  const tipPost = getTipPostDefault(data);
  
  const prompt = `Ești un preot ortodox român erudit. Generează conținut pentru calendarul ortodox pentru data ${data}.
Sfântul principal: ${sfantDefault}. Tip post: ${tipPost}.
Răspunde DOAR cu JSON valid, fără alte texte, cu diacritice românești corecte.

{
  "sfant_nume": "numele complet conform Sinaxarului BOR",
  "sfant_viata": "viața sfântului în 250 cuvinte cu evlavie și date istorice",
  "tropar": "troparul complet al sfântului",
  "tip_post": "${tipPost}",
  "culoare_liturgica": "alb sau rosu sau verde sau violet sau negru",
  "rugaciunea_zilei": "rugăciune ortodoxă completă de 60 cuvinte",
  "sinaxar": "sinaxarul zilei în 200 cuvinte cu toți sfinții",
  "apostol_carte": "cartea Apostolului",
  "apostol_versete": "versetele exacte",
  "apostol_text": "textul complet al Apostolului",
  "evanghelie_carte": "cartea Evangheliei",
  "evanghelie_versete": "versetele exacte",
  "evanghelie_text": "textul complet al Evangheliei",
  "predica": "predică de 150 cuvinte bazată pe Evanghelie",
  "cuvant_folos": "citat patristic autentic cu sursa",
  "sfinti_secundari": "alți sfinți ai zilei",
  "meta_description": "descriere SEO de 155 caractere"
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [
      { role: 'system', content: 'Ești un preot ortodox român. Răspunzi DOAR cu JSON valid.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.3,
    max_tokens: 2500
  });

  const continut = response.choices[0].message.content.trim()
    .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
  
  return JSON.parse(continut);
}

async function main() {
  const nrZile = parseInt(process.argv[2]) || 30;
  console.log(`✝️  Populare inițială Supabase — ${nrZile} zile`);
  console.log('='.repeat(50));

  const azi = new Date();
  let success = 0, skip = 0, errors = 0;

  for (let i = 0; i < nrZile; i++) {
    const d = new Date(azi);
    d.setDate(d.getDate() + i);
    const dataStr = d.toISOString().split('T')[0];

    // Verifică dacă există deja
    const { data: existing } = await supabase
      .from('zile_ortodoxe')
      .select('data')
      .eq('data', dataStr)
      .single();

    if (existing) {
      console.log(`⏭️  ${dataStr} — deja există, skip`);
      skip++;
      continue;
    }

    try {
      console.log(`\n📿 Generez ${dataStr} (${i+1}/${nrZile})...`);
      const continut = await genereazaZi(dataStr);
      
      await supabase.from('zile_ortodoxe').upsert({ data: dataStr, ...continut });
      console.log(`✅ ${dataStr} — ${continut.sfant_nume}`);
      success++;
      
      // Pauză între cereri pentru a evita rate limiting
      if (i < nrZile - 1) {
        await new Promise(r => setTimeout(r, 2000));
      }
    } catch (err) {
      console.error(`❌ ${dataStr} — Eroare: ${err.message}`);
      errors++;
      
      // Salvează fallback
      await supabase.from('zile_ortodoxe').upsert({
        data: dataStr,
        sfant_nume: getSfantDefault(dataStr),
        tip_post: getTipPostDefault(dataStr),
        culoare_liturgica: 'alb',
        meta_description: `Calendar ortodox ${dataStr}: ${getSfantDefault(dataStr).substring(0, 100)}.`
      });
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Finalizat: ${success} generate, ${skip} existente, ${errors} erori`);
}

main().catch(err => { console.error('❌', err); process.exit(1); });
