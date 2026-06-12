const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://smuqpipxeotkbttolivp.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function fix5Iunie() {
  // Textul exact al Apostolului pentru 5 iunie 2026 conform BOR
  // Sursa: Romani 2, 14-29 — conform aplicației BOR oficiale
  const apostolText = `Fraților, când păgânii care nu au lege, din fire fac ale legii, aceștia, neavând lege, își sunt loruși lege, ceea ce arată fapta legii scrisă în inimile lor, prin mărturia conștiinței lor și prin judecățile lor, care îi învinovățesc sau îi și apără, în ziua în care Dumnezeu va judeca, prin Iisus Hristos, după Evanghelia mea, cele ascunse ale oamenilor.

Iată, tu te numești iudeu și te odihnești în lege și te lauzi cu Dumnezeu, și cunoști voia Lui și deosebești cele mai bune, fiind învățat din lege, și ești încredințat că ești povățuitor al orbilor, lumină a celor din întuneric, îndreptător al celor fără de minte, învățător al pruncilor, având în lege chipul cunoștinței și al adevărului.

Deci tu, care înveți pe altul, pe tine însuți nu te înveți? Tu, care propovăduiești să nu furi, furi? Tu, care zici să nu săvârșești adulter, săvârșești adulter? Tu, care urăști idolii, jefuiești templele? Tu, care te lauzi cu legea, necinsteai pe Dumnezeu prin călcarea legii? Căci, după cum este scris, din pricina voastră numele lui Dumnezeu este hulit între neamuri.

Tăierea împrejur folosește, dacă păzești legea; dar dacă ești călcător de lege, tăierea ta împrejur a ajuns netăiere împrejur. Deci, dacă cel netăiat împrejur păzește îndreptățirile legii, oare netăierea lui împrejur nu i se va socoti ca tăiere împrejur? Și cel netăiat împrejur din fire, care împlinește legea, te va judeca pe tine, care prin literă și tăiere împrejur ești călcător de lege.

Căci nu cel ce se arată pe dinafară este iudeu, nici cea arătată pe dinafară, în trup, este tăiere împrejur; ci cel ascuns este iudeu, și tăierea împrejur este aceea a inimii, în duh, nu în literă; a cărui laudă nu este de la oameni, ci de la Dumnezeu.`;

  // Evanghelia pentru 5 iunie 2026 — Vineri, Săptămâna a 3-a după Rusalii
  // Conform Evangheliarului BOR: Matei 10, 32-33; 37-38; 19, 27-30
  const evanghelieText = `Zis-a Domnul: Oricine va mărturisi pentru Mine înaintea oamenilor, mărturisi-voi și Eu pentru el înaintea Tatălui Meu, Care este în ceruri. Iar de cel ce se va lepăda de Mine înaintea oamenilor, Mă voi lepăda și Eu de el înaintea Tatălui Meu, Care este în ceruri.

Cel ce iubește pe tată sau pe mamă mai mult decât pe Mine nu este vrednic de Mine; cel ce iubește pe fiu sau pe fiică mai mult decât pe Mine nu este vrednic de Mine. Și cel ce nu-și ia crucea și nu-Mi urmează Mie nu este vrednic de Mine.

Atunci, răspunzând Petru, I-a zis: Iată, noi am lăsat toate și Ți-am urmat Ție; ce va fi nouă? Iar Iisus le-a zis: Adevărat grăiesc vouă că voi, cei ce Mi-ați urmat Mie, la înnoirea lumii, când Fiul Omului va ședea pe tronul slavei Sale, veți ședea și voi pe douăsprezece tronuri, judecând cele douăsprezece seminții ale lui Israel. Și oricine a lăsat case sau frați sau surori sau tată sau mamă sau femeie sau copii sau țarini pentru numele Meu, înmulțit va lua înapoi și viața veșnică va moșteni. Și mulți dintâi vor fi pe urmă și cei de pe urmă vor fi întâi.`;

  console.log('🔧 Corectez rândul pentru 5 iunie 2026...');

  const { data, error } = await supabase
    .from('zile_ortodoxe')
    .update({
      apostol_carte: 'Romani 2, 14-29',
      apostol_versete: '2, 14-29',
      apostol_text: apostolText,
      evanghelie_carte: 'Matei 10, 32-33; 37-38; 19, 27-30',
      evanghelie_versete: '10, 32-33; 37-38; 19, 27-30',
      evanghelie_text: evanghelieText,
    })
    .eq('data_calendaristica', '2026-06-05');

  if (error) {
    console.error('❌ Eroare la update:', error.message);
    return;
  }

  console.log('✅ Rândul pentru 5 iunie 2026 a fost corectat!');
  console.log('   Apostol: Romani 2, 14-29');
  console.log('   Evanghelie: Matei 10, 32-33; 37-38; 19, 27-30');

  // Verifică că s-a salvat corect
  const { data: verificare } = await supabase
    .from('zile_ortodoxe')
    .select('data_calendaristica, apostol_carte, apostol_versete, evanghelie_carte, evanghelie_versete')
    .eq('data_calendaristica', '2026-06-05')
    .single();

  if (verificare) {
    console.log('\n📋 Verificare rând salvat:');
    console.log('   Data:', verificare.data_calendaristica);
    console.log('   Apostol:', verificare.apostol_carte);
    console.log('   Evanghelie:', verificare.evanghelie_carte);
  }
}

fix5Iunie().catch(console.error);
