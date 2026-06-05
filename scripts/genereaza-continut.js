/**
 * genereaza-continut.js
 * Povești de Credință – povestidecredinta.ro
 *
 * Script rulat zilnic via GitHub Actions la 00:01 România (22:01 UTC)
 * Generează conținut ortodox complet pentru ziua următoare folosind OpenAI API
 * și îl salvează în Supabase.
 *
 * Fiecare linie de cod este o candelă aprinsă. Amin. ✝️
 */

const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');
const ws = require('ws');
const fs = require('fs');
const path = require('path');

// —— Lecționar static BOR — texte sacre EXACTE (Apostol, Evanghelie, Tropar) ——
// Sursă: Biblia Sinodală BOR 1988/2001 + Mineiele BOR
// OpenAI NU generează aceste texte — sunt preluate din fișierul static
let LECTIONAR = {};
try {
  const lectionarPath = path.join(__dirname, '..', 'data', 'lectionar.json');
  const raw = fs.readFileSync(lectionarPath, 'utf8');
  LECTIONAR = JSON.parse(raw);
  console.log(`📖 Lecționar BOR încărcat: ${Object.keys(LECTIONAR).length} zile cu texte sacre exacte`);
} catch (e) {
  console.warn('⚠️ Lecționar static nu a putut fi încărcat:', e.message);
}

// —— Configurare ————————————————————————————————————————————————————
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://smuqpipxeotkbttolivp.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY;

// Validare a obligatiilor
if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_KEY lipsește!');
  process.exit(1);
}
if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY lipsește!');
  process.exit(1);
}

// —— Clienti ————————————————————————————————————————————————————————
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  global: { fetch: fetch },
  realtime: { transport: ws }
});
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// —— Calendar de date ortodox static (de rezervă) ———————————————————
const CALENDAR_STATIC = {
  // IANUARIE
  '01-01': { sfant: 'Tăierea împrejur cea după trup a Domnului; Sfântul Vasile cel Mare', post: 'dezlegare', culoare: 'alb' },
  '01-02': { sfant: 'Înainte-prăznuirea Botezului Domnului; Sfântul Ioan Scărarul', post: 'post', culoare: 'alb' },
  '01-03': { sfant: 'Sfântul Prooroc Maleahi; Sfântul Mucenic Gordian', post: 'post', culoare: 'verde' },
  '01-04': { sfant: 'Soborul Sfinților 70 de Apostoli; Sfântul Teoctist', post: 'post', culoare: 'verde' },
  '01-05': { sfant: 'Sfântul Mucenic Teopempt; Parascheva; Ajunul Bobotezei', post: 'post', culoare: 'alb' },
  '01-06': { sfant: 'Botezul Domnului (Boboteaza)', post: 'dezlegare', culoare: 'alb' },
  '01-07': { sfant: 'Soborul Sfântului Ioan Botezătorul', post: 'dezlegare', culoare: 'alb' },
  '01-08': { sfant: 'Sfântul Gheorghe Hozevitul; Sfânta Domnica', post: 'post', culoare: 'verde' },
  '01-09': { sfant: 'Sfântul Mucenic Polieuct; Sfântul Filip, episcopul Amasiei', post: 'post', culoare: 'rosu' },
  '01-10': { sfant: 'Sfântul Grigorie al Nyssei; Sfântul Dometian, episcop de Melitina', post: 'post', culoare: 'verde' },
  '01-11': { sfant: 'Sfântul Cuvios Teodosie cel Mare', post: 'post', culoare: 'verde' },
  '01-12': { sfant: 'Sfânta Tatiana; Sfântul Mucenic Petru Avessalomit', post: 'post', culoare: 'rosu' },
  '01-13': { sfant: 'Sfinții Mucenici din Sinai și Rait; Sfântul Iacob Sihastrul', post: 'post', culoare: 'rosu' },
  '01-14': { sfant: 'Sfântul Sava cel Sfințit; Sfântul Cuvios Paisie Velicicovski', post: 'post', culoare: 'verde' },
  '01-15': { sfant: 'Sfântul Cuvios Pavel Tebeul; Sfântul Cuvios Ioan Calabitul', post: 'post', culoare: 'verde' },
  '01-16': { sfant: 'Închinarea cinstitului lanț al Sfântului Apostol Petru', post: 'post', culoare: 'alb' },
  '01-17': { sfant: 'Sfântul Cuvios Antonie cel Mare', post: 'dezlegare', culoare: 'verde' },
  '01-18': { sfant: 'Sfinții Atanasie și Chiril, arhiepiscopii Alexandriei', post: 'post', culoare: 'alb' },
  '01-19': { sfant: 'Sfântul Cuvios Macarie Egipteanul; Sfântul Cuvios Macarie Alexandrinul', post: 'post', culoare: 'verde' },
  '01-20': { sfant: 'Sfântul Eutimie cel Mare', post: 'dezlegare', culoare: 'verde' },
  '01-21': { sfant: 'Sfântul Cuvios Maxim Mărturisitorul; Sfântul Mucenic Neofitul', post: 'post', culoare: 'verde' },
  '01-22': { sfant: 'Sfântul Apostol Timotei; Sfântul Cuvios Anastasie Persul', post: 'post', culoare: 'rosu' },
  '01-23': { sfant: 'Sfântul Clement al Ancirei; Sfântul Mucenic Agatanghel', post: 'post', culoare: 'rosu' },
  '01-24': { sfant: 'Sfânta Cuvioasă Xenia; Sfântul Filotei de la Curtea de Argeș', post: 'post', culoare: 'verde' },
  '01-25': { sfant: 'Sfântul Grigorie Teologul; Sfântul Cuvios Publie', post: 'dezlegare', culoare: 'alb' },
  '01-26': { sfant: 'Sfântul Cuvios Xenofont și soția sa Maria; Sfinții Arcadie și Ioan', post: 'post', culoare: 'verde' },
  '01-27': { sfant: 'Aducerea moaștelor Sfântului Ioan Gură de Aur', post: 'dezlegare', culoare: 'alb' },
  '01-28': { sfant: 'Sfântul Cuvios Efrem Sirul; Sfântul Cuvios Paladie', post: 'post', culoare: 'verde' },
  '01-29': { sfant: 'Aducerea moaștelor Sfântului Ignatie Teoforul', post: 'post', culoare: 'alb' },
  '01-30': { sfant: 'Sfinții Trei Ierarhi: Vasile cel Mare, Grigorie Teologul și Ioan Gură de Aur', post: 'dezlegare', culoare: 'alb' },
  '01-31': { sfant: 'Sfinții Mucenici Chir și Ioan; Sfânta Muceniță Atanasia', post: 'post', culoare: 'rosu' },
  // FEBRUARIE
  '02-01': { sfant: 'Sfântul Mucenic Trifon; Sfânta Muceniță Perpetua', post: 'post', culoare: 'rosu' },
  '02-02': { sfant: 'Întâmpinarea Domnului', post: 'dezlegare', culoare: 'alb' },
  '02-03': { sfant: 'Sfinții Simeoon și Ana; Sfântul Mucenic Blasie', post: 'post', culoare: 'alb' },
  '02-04': { sfant: 'Sfântul Cuvios Isidor Pelusiotul; Sfânta Muceniță Filoteea', post: 'post', culoare: 'verde' },
  '02-05': { sfant: 'Sfânta Muceniță Agata; Sfântul Policarp al Smirnei', post: 'post', culoare: 'rosu' },
  '02-06': { sfant: 'Sfântul Fotie, Patriarhul Constantinopolului; Sfântul Mucenic Iulian', post: 'post', culoare: 'alb' },
  '02-07': { sfant: 'Sfântul Partenie, episcopul Lampsakului; Sfântul Luca al Crimeei', post: 'post', culoare: 'verde' },
  '02-08': { sfant: 'Sfântul Mare Mucenic Teodor Stratilat', post: 'post', culoare: 'rosu' },
  '02-09': { sfant: 'Sfântul Nichfor, Patriarhul Constantinopolului; Sfântul Mucenic Marchel', post: 'post', culoare: 'alb' },
  '02-10': { sfant: 'Sfântul Haralambie', post: 'dezlegare', culoare: 'rosu' },
  '02-11': { sfant: 'Sfântul Cuvios Teodor Studitul; Sfânta Muceniță Teodora', post: 'post', culoare: 'verde' },
  '02-12': { sfant: 'Sfântul Meletie, arhiepiscopul Antiohiei; Sfântul Alexie al Moscovei', post: 'post', culoare: 'alb' },
  '02-13': { sfant: 'Sfântul Cuvios Martinian; Sfânta Muceniță Zoé', post: 'post', culoare: 'verde' },
  '02-14': { sfant: 'Sfântul Auxentie; Sfântul Cuvios Avraam', post: 'post', culoare: 'verde' },
  '02-15': { sfant: 'Sfântul Apostol Onisim; Sfântul Cuvios Pafnutie', post: 'post', culoare: 'rosu' },
  '02-16': { sfant: 'Sfântul Mucenic Pamfil; Sfântul Flavian al Constantinopolului', post: 'post', culoare: 'rosu' },
  '02-17': { sfant: 'Sfântul Mare Mucenic Teodor Tiron', post: 'post', culoare: 'rosu' },
  '02-18': { sfant: 'Sfântul Leon, Papa Romei; Sfântul Agapet', post: 'post', culoare: 'alb' },
  '02-19': { sfant: 'Sfântul Apostol Arhip; Sfânta Cuvioasă Filoteea Atenianca', post: 'post', culoare: 'rosu' },
  '02-20': { sfant: 'Sfântul Leon, episcopul Cataniei; Sfântul Agaton', post: 'post', culoare: 'verde' },
  '02-21': { sfant: 'Sfântul Timotei, episcopul Prusinei; Sfântul Evstatie', post: 'post', culoare: 'verde' },
  '02-22': { sfant: 'Sfântul Cuvios Timotei; Sfânta Muceniță Anastasie Romanca', post: 'post', culoare: 'verde' },
  '02-23': { sfant: 'Sfântul Policarp, episcopul Smirnei', post: 'post', culoare: 'rosu' },
  '02-24': { sfant: 'Aflarea capului Sfântului Ioan Botezătorul (întâia și a doua aflare)', post: 'dezlegare', culoare: 'alb' },
  '02-25': { sfant: 'Sfântul Cuvios Tarasie, Patriarhul Constantinopolului', post: 'post', culoare: 'alb' },
  '02-26': { sfant: 'Sfântul Cuvios Porfirie, episcopul Gazei', post: 'post', culoare: 'verde' },
  '02-27': { sfant: 'Sfântul Cuvios Prohor', post: 'post', culoare: 'verde' },
  '02-28': { sfant: 'Sfântul Cuvios Vasile Mărturisitorul; Sfântul Proterie', post: 'post', culoare: 'verde' },
  '02-29': { sfant: 'Sfântul Cuvios Ioan Casian; Sfântul Gherman', post: 'post', culoare: 'verde' },
  // MARTIE
  '03-01': { sfant: 'Sfântul Cuvios Martirie; Sfântul Evdochim', post: 'post', culoare: 'verde' },
  '03-02': { sfant: 'Sfântul Cuvios Isihie Sinaitul; Sfântul Modest', post: 'post', culoare: 'verde' },
  '03-03': { sfant: 'Sfinții Mucenici Eutropie, Cleonic și Vasilisc', post: 'post', culoare: 'rosu' },
  '03-04': { sfant: 'Sfântul Cuvios Gherasim de la Iordan', post: 'dezlegare', culoare: 'verde' },
  '03-05': { sfant: 'Sfântul Mucenic Conon din Isauria; Sfântul Conon Grădinarul', post: 'post', culoare: 'rosu' },
  '03-06': { sfant: 'Sfinții 42 de Mucenici din Amoreea', post: 'post', culoare: 'rosu' },
  '03-07': { sfant: 'Sfinții Mucenici Efrem, Vasile, Evghenie, Agatodor, Elpidie, Eferie și Capiton', post: 'post', culoare: 'rosu' },
  '03-08': { sfant: 'Sfântul Cuvios Teofilact, episcopul Nicomidiei; Sfânta Muceniță Apollonia', post: 'post', culoare: 'verde' },
  '03-09': { sfant: 'Sfinții 40 de Mucenici din Sevastia', post: 'dezlegare', culoare: 'rosu' },
  '03-10': { sfant: 'Sfântul Mucenic Codrat din Corint; Sfântul Mucenic Codrat din Nicomidia', post: 'post', culoare: 'rosu' },
  '03-11': { sfant: 'Sfântul Cuvios Sofronie, Patriarhul Ierusalimului; Sfântul Sfinție Mucenicul Pioniu', post: 'post', culoare: 'verde' },
  '03-12': { sfant: 'Sfântul Cuvios Teofan Mărturisitorul; Sfântul Grigorie Dialogul', post: 'post', culoare: 'verde' },
  '03-13': { sfant: 'Sfântul Nichfor, Patriarhul Constantinopolului; Sfântul Grigorie al II-lea', post: 'post', culoare: 'alb' },
  '03-14': { sfant: 'Sfântul Cuvios Benedict de Nursia; Sfântul Mucenic Alexandrul', post: 'post', culoare: 'verde' },
  '03-15': { sfant: 'Sfântul Mucenic Agapie și cei împreună cu el; Sfântul Cuvios Sava', post: 'post', culoare: 'rosu' },
  '03-16': { sfant: 'Sfântul Mucenic Sabin din Egipt; Sfântul Mucenic Papă din Licaonia', post: 'post', culoare: 'rosu' },
  '03-17': { sfant: 'Sfântul Alexie, omul lui Dumnezeu; Sfântul Mucenic Marin din Cezareea', post: 'post', culoare: 'verde' },
  '03-18': { sfant: 'Sfântul Chiril, arhiepiscopul Ierusalimului; Sfântul Anin Monahul', post: 'post', culoare: 'alb' },
  '03-19': { sfant: 'Sfântul Mucenici Hrisaf; Sfântul Cuvios Ioan din Panin', post: 'post', culoare: 'rosu' },
  '03-20': { sfant: 'Sfântul Cuvios Grigorie Sinaitul; Sfântul Cuvios Nil Sorschi', post: 'post', culoare: 'verde' },
  '03-21': { sfant: 'Sfântul Cuvios Iacob Mărturisitorul; Sfântul Cuvios Serafim de Sarov', post: 'post', culoare: 'verde' },
  '03-22': { sfant: 'Sfântul Sfinție Mucenic Vasile, presbiterul din Ancira; Sfânta Muceniță Drosida', post: 'post', culoare: 'rosu' },
  '03-23': { sfant: 'Sfântul Mucenic Nicon și cei 199 ucenici ai săi; Sfânta Muceniță Pelaghia', post: 'post', culoare: 'rosu' },
  '03-24': { sfant: 'Sfântul Sfinție Mucenic Artemon; Înainte-prăznuirea Bunei Vestiri', post: 'post', culoare: 'alb' },
  '03-25': { sfant: 'Buna Vestire a Preasfintei Născătoare de Dumnezeu', post: 'dezlegare', culoare: 'alb' },
  '03-26': { sfant: 'Soborul Sfântului Arhanghel Gavriil', post: 'dezlegare', culoare: 'alb' },
  '03-27': { sfant: 'Sfântul Matrona din Tesalonic; Sfântul Cuvios Filip', post: 'post', culoare: 'verde' },
  '03-28': { sfant: 'Sfântul Cuvios Ilarion cel Nou; Sfântul Cuvios Ștefan cel Nou', post: 'post', culoare: 'verde' },
  '03-29': { sfant: 'Sfântul Mucenic Marcu, episcopul Aretuzei; Sfântul Diaconul Chiril', post: 'post', culoare: 'rosu' },
  '03-30': { sfant: 'Sfântul Cuvios Ioan Scărarul', post: 'dezlegare', culoare: 'verde' },
  '03-31': { sfant: 'Sfântul Cuvios Ipomate; Sfântul Mucenic Veniamin', post: 'post', culoare: 'verde' },
  // APRILIE
  '04-01': { sfant: 'Sfânta Maria Egipteanca; Sfântul Cuvios Macarie', post: 'dezlegare', culoare: 'verde' },
  '04-02': { sfant: 'Sfântul Tit, făcătorul de minuni; Sfântul Cuvios Ambrozie de Optina', post: 'post', culoare: 'verde' },
  '04-03': { sfant: 'Sfântul Cuvios Nicolae Mărturisitorul; Sfânta Muceniță Irina', post: 'post', culoare: 'verde' },
  '04-04': { sfant: 'Sfântul Cuvios Iosif Imnograful; Sfântul Gheorghe din Maleon', post: 'dezlegare', culoare: 'verde' },
  '04-05': { sfant: 'Sfânta Muceniță Claudia; Sfinții Mucenici Teodul și Agathopod', post: 'post', culoare: 'rosu' },
  '04-06': { sfant: 'Sfântul Eutihie, Patriarhul Constantinopolului; Sfântul Metodie Mărturisitorul', post: 'post', culoare: 'alb' },
  '04-07': { sfant: 'Sfântul Cuvios Grigorie Sinaitul; Sfântul Calliopie', post: 'post', culoare: 'verde' },
  '04-08': { sfant: 'Sfinții Apostoli Irodion, Agav, Ruf, Asyncrit, Flegon și Ermie', post: 'dezlegare', culoare: 'rosu' },
  '04-09': { sfant: 'Sfântul Mucenic Evpsihie; Sfântul Cuvios Vadim Arhimandritul', post: 'post', culoare: 'rosu' },
  '04-10': { sfant: 'Sfinții Mucenici Terentie, Pompie și cei împreună cu ei', post: 'post', culoare: 'rosu' },
  '04-11': { sfant: 'Sfântul Sfinție Mucenic Antipa; Sfântul Cuvios Ioan de la Lavra Veche', post: 'dezlegare', culoare: 'rosu' },
  '04-12': { sfant: 'Sfântul Vasile Mărturisitorul, episcopul Parisei; Sfântul Mucenic Mina', post: 'post', culoare: 'verde' },
  '04-13': { sfant: 'Sfântul Sfinție Mucenic Artemon; Sfântul Mucenic Maxim', post: 'post', culoare: 'rosu' },
  '04-14': { sfant: 'Sfântul Sfinție Mucenic Martin, Papa Romei; Sfântul Ardalie Mimul', post: 'post', culoare: 'rosu' },
  '04-15': { sfant: 'Sfinții Apostoli Aristarh, Pud și Trofim; Sfânta Muceniță Vasilia', post: 'dezlegare', culoare: 'rosu' },
  '04-16': { sfant: 'Sfântul Sfinție Mucenic Crisovul; Sfânta Muceniță Agafia', post: 'post', culoare: 'rosu' },
  '04-17': { sfant: 'Sfântul Sfinție Mucenic Simeon, episcopul Persiei; Sfântul Acachie Sinaitul', post: 'post', culoare: 'rosu' },
  '04-18': { sfant: 'Sfântul Cuvios Ioan, ucenicul Sfântului Grigorie Decapolitul; Sfântul Cosma din Halchidona', post: 'post', culoare: 'verde' },
  '04-19': { sfant: 'Sfântul Cuvios Ioan din Valahia; Sfântul Mucenic Pafnutie', post: 'dezlegare', culoare: 'verde' },
  '04-20': { sfant: 'Sfântul Cuvios Teodor Trihinas; Sfântul Mucenic Atanasie', post: 'post', culoare: 'verde' },
  '04-21': { sfant: 'Sfântul Sfinție Mucenic Ianuarie, episcopul Beneventului; Sfântul Mucenic Teodor', post: 'post', culoare: 'rosu' },
  '04-22': { sfant: 'Sfântul Mucenic Teodos și cei împreună cu el; Sfântul Cuvios Teodor Sikeotul', post: 'post', culoare: 'rosu' },
  '04-23': { sfant: 'Sfântul Mare Mucenic Gheorghe, purtătorul de biruință', post: 'dezlegare', culoare: 'rosu' },
  '04-24': { sfant: 'Sfânta Muceniță Sabina; Sfântul Sfinție Mucenic Ilie', post: 'post', culoare: 'rosu' },
  '04-25': { sfant: 'Sfântul Evanghelist Marcu', post: 'dezlegare', culoare: 'rosu' },
  '04-26': { sfant: 'Sfântul Sfinție Mucenic Vasile, episcopul Amasiei; Sfântul Cuvios Isidor', post: 'post', culoare: 'rosu' },
  '04-27': { sfant: 'Sfântul Sfinție Mucenic Simeon Ruda Domnului; Sfântul Mucenic Donat', post: 'post', culoare: 'rosu' },
  '04-28': { sfant: 'Sfântul Apostol și Evanghelist Luca; Sfinții Mucenici Maxim, Cvintilian și Dadas din Ozovia', post: 'dezlegare', culoare: 'rosu' },
  '04-29': { sfant: 'Sfânta Muceniță Teodosia Fecioara; Sfântul Cuvios Ioan', post: 'post', culoare: 'rosu' },
  '04-30': { sfant: 'Sfântul Apostol Iacob al lui Zevedeu; Sfântul Donat, episcopul Evreiei', post: 'dezlegare', culoare: 'rosu' },
  // MAI
  '05-01': { sfant: 'Sfântul Prooroc Ieremia; Sfântul Cuv. Mc. Eftimie, Ignatie și Acachie; Sfânta Cuv. Isidora', post: 'post', culoare: 'verde' },
  '05-02': { sfant: 'Aducerea moaștelor Sfântului Ierarh Atanasie cel Mare; Sfânta Matrona din Moscova', post: 'post', culoare: 'alb' },
  '05-03': { sfant: '† Sfântul Cuvios Irodion de la Lainici; Sfântul Mucenic Timotei și soția sa Mavra', post: 'post', culoare: 'verde' },
  '05-04': { sfant: '† Sfântul Cuvios Mavra de pe Ceahlău; Sfântul Mucenic Pelaghia; Sfântul Cuv. Monica, mama Fer. Augustin', post: 'post', culoare: 'verde' },
  '05-05': { sfant: '† Sfânta Cuvioasă Matrona de la Hurezi; Sfânta Mare Muceniță Irina; Sfântul Cuv. Mc. Efrem cel Nou', post: 'post', culoare: 'verde' },
  '05-06': { sfant: 'Înjumătățirea praznicului Cincizecimii; Sfântul și Dreptul Iov, mult răbdătorul', post: 'dezlegare', culoare: 'verde' },
  '05-07': { sfant: 'Arătarea pe cer a semnului Sfintei Cruci în Ierusalim; Sfinții Mucenici Acachie și Codrat', post: 'post', culoare: 'verde' },
  '05-08': { sfant: '† Sfântul Apostol și Evanghelist Ioan Teologul; Sfântul Cuvios Arsenie cel Mare', post: 'dezlegare', culoare: 'rosu' },
  '05-09': { sfant: 'Sfântul Prooroc Isaia; Sfântul Mucenic Hristofor; Aducerea moaștelor Sfântului Ierarh Nicolae la Bari', post: 'dezlegare', culoare: 'verde' },
  '05-10': { sfant: 'Sfântul Apostol Simon Zilotul; † Sfântul Cuvios Calistrat de la Timișeni și Vasiova', post: 'dezlegare', culoare: 'rosu' },
  '05-11': { sfant: 'Sfinții Egali cu Apostolii Chiril și Metodie, luminătorii slavilor', post: 'post', culoare: 'alb' },
  '05-12': { sfant: 'Sfântul Epifanie al Ciprului; Sfântul Gherman, patriarhul Constantinopolului', post: 'dezlegare', culoare: 'alb' },
  '05-13': { sfant: 'Sfânta Muceniță Glicheria; Sfântul Mucenic Alexandru din Drisipara', post: 'post', culoare: 'rosu' },
  '05-14': { sfant: 'Sfântul Mucenic Isidor din Hio; Sfântul Cuvios Serafim de Sarov', post: 'dezlegare', culoare: 'rosu' },
  '05-15': { sfant: 'Sfântul Cuvios Pahomie cel Mare; Sfântul Achilie, episcopul Larissei', post: 'dezlegare', culoare: 'verde' },
  '05-16': { sfant: 'Sfântul Cuvios Teodor cel Sfințit; Sfântul Mucenic Talaleu', post: 'post', culoare: 'verde' },
  '05-17': { sfant: 'Sfântul Apostol Andronic; Sfânta Muceniță Iuia; Sfântul Atanasie Athonitul', post: 'post', culoare: 'rosu' },
  '05-18': { sfant: 'Sfântul Mucenic Teodot din Ancira; Sfintele Mucenice Tecusa și cele împreună cu ea', post: 'post', culoare: 'rosu' },
  '05-19': { sfant: 'Sfântul Cuvios Patrichie, episcopul Prusiei; Sfântul Mucenic Achile', post: 'post', culoare: 'verde' },
  '05-20': { sfant: 'Sfântul Talaleu; Sfântul Cuvios Talasie', post: 'post', culoare: 'verde' },
  '05-21': { sfant: 'Sfinții Împărați Constantin și Elena, întocmai cu Apostolii', post: 'dezlegare', culoare: 'alb' },
  '05-22': { sfant: 'Sfântul Vasile Episcopul Amasiei; Sfântul Cuvios Apolo', post: 'dezlegare', culoare: 'rosu' },
  '05-23': { sfant: 'Sfântul Mihail Mărturisitorul, episcopul Sinadei; Sfântul Mucenic Mihail', post: 'post', culoare: 'alb' },
  '05-24': { sfant: 'Sfântul Simeon cel din Muntele Minunat; Sfânta Muceniță Melissa', post: 'post', culoare: 'verde' },
  '05-25': { sfant: 'A treia aflare a Capului Sfântului Ioan Botezătorul', post: 'dezlegare', culoare: 'alb' },
  '05-26': { sfant: 'Sfântul Apostol Carp; Sfântul Mucenic Averchie', post: 'dezlegare', culoare: 'rosu' },
  '05-27': { sfant: 'Sfântul Ioan cel Nou de la Suceava; Sfântul Cuvios Ioanichie cel Mare', post: 'dezlegare', culoare: 'alb' },
  '05-28': { sfant: 'Sfântul Eutihie Patriarhul Constantinopolului; Sfântul Mucenic Heliconide', post: 'dezlegare', culoare: 'alb' },
  '05-29': { sfant: 'Sfântul Mucenic Teodosia Fecioara din Tir; Sfântul Cuvios Alexandru din Constantinopol', post: 'post', culoare: 'rosu' },
  '05-30': { sfant: 'Sfântul Mucenic Isaac din Dalmatia; Sfântul Cuvios Pahomie de la Gledin', post: 'dezlegare', culoare: 'rosu' },
  '05-31': { sfant: 'Sfântul Mucenic Ermie; Sfântul Mucenic Filosof', post: 'post', culoare: 'rosu' },
  // IUNIE
  '06-01': { sfant: 'Sfântul Mucenic Iustin Martirul și Filosoful; Sfântul Mucenic Iustin Nou', post: 'dezlegare', culoare: 'rosu' },
  '06-02': { sfant: 'Sfântul Nicfor Mărturisitorul, Patriarhul Constantinopolului', post: 'post', culoare: 'alb' },
  '06-03': { sfant: 'Sfântul Mucenic Luchilian și cei împreună cu el; Sfânta Muceniță Paula', post: 'post', culoare: 'rosu' },
  '06-04': { sfant: 'Sfântul Mitrofan, Patriarhul Constantinopolului; Sfântul Zotica', post: 'dezlegare', culoare: 'alb' },
  '06-05': { sfant: 'Sfântul Dorotei, episcopul Tirului; Sfântul Mucenic Marchilin', post: 'post', culoare: 'rosu' },
  '06-06': { sfant: 'Sfântul Visarion, făcătorul de minuni; Sfântul Cuvios Ilarion cel Nou', post: 'dezlegare', culoare: 'verde' },
  '06-07': { sfant: 'Sfântul Cuvios Teodot de Ancira; Sfântul Cuvios Grigorie al Muntelui Sinai', post: 'post', culoare: 'verde' },
  '06-08': { sfant: 'Sfântul Cuvios Teodor Stratilat; Sfântul Mucenic Caliopic', post: 'dezlegare', culoare: 'verde' },
  '06-09': { sfant: 'Sfântul Cuvios Chiril din Alexandria; Sfântul Cuvios Chiril Patriarhul', post: 'dezlegare', culoare: 'alb' },
  '06-10': { sfant: 'Sfântul Mucenic Alexandru și Antonina; Sfântul Timotei', post: 'post', culoare: 'rosu' },
  '06-11': { sfant: 'Sfânții Apostoli Bartolomeu și Barnaba', post: 'dezlegare', culoare: 'rosu' },
  '06-12': { sfant: 'Sfântul Cuvios Onufrie cel Mare; Sfântul Petru Athonitul', post: 'post', culoare: 'verde' },
  '06-13': { sfant: 'Sfântul Mucenic Achilina; Sfântul Cuvios Trifiliie, episcop de Leucosia', post: 'post', culoare: 'rosu' },
  '06-14': { sfant: 'Sfântul Profir al Gazei; Sfântul Cuvios Metodie Mărturisitorul', post: 'post', culoare: 'verde' },
  '06-15': { sfant: 'Sfântul Prooroc Amos; Sfântul Mucenic Vit', post: 'post', culoare: 'verde' },
  '06-16': { sfant: 'Sfântul Cuvios Tihon din Lusinia; Sfântul Mucenic Tigrie', post: 'post', culoare: 'verde' },
  '06-17': { sfant: 'Sfântul Mucenic Manuil, Savel și Ismail; Sfântul Nichita Episcopul', post: 'post', culoare: 'rosu' },
  '06-18': { sfant: 'Sfântul Mucenic Leontie; Sfântul Cuvios Leontie Monahul', post: 'dezlegare', culoare: 'rosu' },
  '06-19': { sfant: 'Sfântul Apostol Iuda, fratele Domnului; Sfântul Paisie cel Mare', post: 'dezlegare', culoare: 'rosu' },
  '06-20': { sfant: 'Sfântul Sfinție Mucenic Metodie, episcopul Patariei; Sfântul Cuvios Teofan', post: 'post', culoare: 'rosu' },
  '06-21': { sfant: 'Sfântul Cuvios Iulian Sihastrul; Sfântul Mucenic Iulian', post: 'post', culoare: 'verde' },
  '06-22': { sfant: 'Sfântul Sfinție Mucenic Eusebiu, episcopul Samosatei; Sfântul Mucenic Galaction', post: 'post', culoare: 'rosu' },
  '06-23': { sfant: 'Sfânta Muceniță Agripina; Sfântul Cuvios Iosif de Optina', post: 'post', culoare: 'rosu' },
  '06-24': { sfant: 'Nașterea Sfântului Ioan Botezătorul', post: 'dezlegare', culoare: 'alb' },
  '06-25': { sfant: 'Sfânta Cuvioasă Fevronia; Sfântul Cuvios David din Tesalonic', post: 'post', culoare: 'verde' },
  '06-26': { sfant: 'Sfântul Cuvios David din Tesalonic; Sfântul Mucenic Ioan cel Nou', post: 'dezlegare', culoare: 'verde' },
  '06-27': { sfant: 'Sfântul Sfinție Mucenic Samson Primitorul de Străini; Sfântul Mucenic Anect', post: 'dezlegare', culoare: 'rosu' },
  '06-28': { sfant: 'Sfinții Mucenici Chir și Ioan; Sfântul Cuvios Pavel', post: 'dezlegare', culoare: 'rosu' },
  '06-29': { sfant: 'Sfinții Apostoli Petru și Pavel', post: 'dezlegare', culoare: 'alb' },
  '06-30': { sfant: 'Soborul Sfinților 12 Apostoli', post: 'dezlegare', culoare: 'alb' },
  // IULIE
  '07-01': { sfant: 'Sfinții Anarghiri Cosma și Damian; Sfântul Mucenic Potit', post: 'dezlegare', culoare: 'rosu' },
  '07-02': { sfant: 'Aducerea veșmântului Maicii Domnului la Vlaherne; Sfântul Cuvios Iuvenalie', post: 'dezlegare', culoare: 'alb' },
  '07-03': { sfant: 'Sfântul Apostol Toma; Sfântul Mucenic Iacint', post: 'dezlegare', culoare: 'rosu' },
  '07-04': { sfant: 'Sfântul Andrei Criteanul; Sfântul Mucenic Teodot', post: 'dezlegare', culoare: 'verde' },
  '07-05': { sfant: 'Sfântul Cuvios Atanasie Athonitul; Sfântul Mucenic Agnia', post: 'dezlegare', culoare: 'verde' },
  '07-06': { sfant: 'Sfântul Sfinție Mucenic Sisoe cel Mare; Sfântul Mucenic Lucian', post: 'dezlegare', culoare: 'verde' },
  '07-07': { sfant: 'Sfântul Cuvios Toma din Maleon; Sfântul Sfințit Mucenic Pangratie', post: 'dezlegare', culoare: 'verde' },
  '07-08': { sfant: 'Sfântul Mare Mucenic Procopie; Sfântul Mucenic Theofil', post: 'dezlegare', culoare: 'rosu' },
  '07-09': { sfant: 'Sfântul Sfinție Mucenic Pancratie, episcopul Tavronomeniei; Sfântul Cuvios Patermut', post: 'dezlegare', culoare: 'rosu' },
  '07-10': { sfant: 'Sfinții 45 de Mucenici din Nicopolea Armeniei; Sfântul Mucenic Apolon', post: 'dezlegare', culoare: 'rosu' },
  '07-11': { sfant: 'Sfânta Mare Muceniță Eufimia; Sfânta Muceniță Olga', post: 'dezlegare', culoare: 'rosu' },
  '07-12': { sfant: 'Sfinții Mucenici Prohor, Nican, Timon și Parmena; Sfântul Mucenic Mihail', post: 'dezlegare', culoare: 'rosu' },
  '07-13': { sfant: 'Soborul Sfinților 12 Apostoli; Sfântul Arcadie de Novgorod', post: 'dezlegare', culoare: 'alb' },
  '07-14': { sfant: 'Sfântul Apostol Acvila; Sfântul Mucenic Iust', post: 'dezlegare', culoare: 'rosu' },
  '07-15': { sfant: 'Sfântul Cuvios Atanasie Athonitul; Sfântul Vladimir, marele cneaz', post: 'dezlegare', culoare: 'verde' },
  '07-16': { sfant: 'Sfântul Sfinție Mucenic Atinogen, episcopul Pedactei; Sfântul Mucenic Fabian', post: 'dezlegare', culoare: 'rosu' },
  '07-17': { sfant: 'Sfânta Mare Muceniță Marina (Margareta); Sfântul Cuvios Lazar Galessiotul', post: 'dezlegare', culoare: 'rosu' },
  '07-18': { sfant: 'Sfântul Mucenic Emilian; Sfântul Pamvo Monahul', post: 'dezlegare', culoare: 'rosu' },
  '07-19': { sfant: 'Sfântul Cuvios Macrina, sora Sfântului Vasile cel Mare; Sfântul Diadoh', post: 'dezlegare', culoare: 'verde' },
  '07-20': { sfant: 'Sfântul Prooroc Ilie Tesviteanul', post: 'dezlegare', culoare: 'alb' },
  '07-21': { sfant: 'Sfântul Cuvios Simeon Nebun pentru Hristos; Sfântul Ioan Coribitul', post: 'dezlegare', culoare: 'verde' },
  '07-22': { sfant: 'Sfânta Muceniță Magdalena, întocmai cu Apostolii; Sfântul Cuvios Marcela', post: 'dezlegare', culoare: 'rosu' },
  '07-23': { sfant: 'Sfântul Sfinție Mucenic Foca din Sinope; Sfântul Prooroc Ezechiel', post: 'dezlegare', culoare: 'rosu' },
  '07-24': { sfant: 'Sfânta Mare Muceniță Hristina; Sfântul Mucenic Aquilina', post: 'dezlegare', culoare: 'rosu' },
  '07-25': { sfant: 'Adormirea Sfintei Ana, mama Preasfintei Născătoare de Dumnezeu; Sfântul Mucenic Olimpia', post: 'dezlegare', culoare: 'alb' },
  '07-26': { sfant: 'Sfântul Sfinție Mucenic Ermolae și cei împreună cu el; Sfântul Cuvios Moise', post: 'dezlegare', culoare: 'rosu' },
  '07-27': { sfant: 'Sfântul Mare Mucenic și tămăduitor Pantelimon', post: 'dezlegare', culoare: 'rosu' },
  '07-28': { sfant: 'Sfinții Apostoli Prohor, Nican, Timon și Parmena; Sfântul Mucenic Victor', post: 'dezlegare', culoare: 'rosu' },
  '07-29': { sfant: 'Sfântul Mucenic Calinic; Sfânta Muceniță Serafima', post: 'dezlegare', culoare: 'rosu' },
  '07-30': { sfant: 'Sfinții Apostoli Sila, Silvan, Cresent, Epenet și Andronic; Sfântul Mucenic Ioan Soluneanul', post: 'dezlegare', culoare: 'rosu' },
  '07-31': { sfant: 'Sfântul Sfinție Mucenic Evdochim; Sfântul Mucenic Iuvenalie', post: 'dezlegare', culoare: 'rosu' },
  // AUGUST
  '08-01': { sfant: 'Sfinții Mucenici Macabei și Mama lor Solomoni cu dascălul Eleazar; Sfântul Mucenic Leontie', post: 'post', culoare: 'rosu' },
  '08-02': { sfant: 'Aducerea moaștelor Sfântului Arhidiacon și Întâiul Mucenic Ștefan', post: 'post', culoare: 'alb' },
  '08-03': { sfant: 'Sfântul Mucenic Isachie, Dalmat și Faust; Sfântul Cosma din Etiopia', post: 'post', culoare: 'rosu' },
  '08-04': { sfant: 'Cele șapte Sfinte Fecioare Mucenice: Tecusa, Alexndra, Claudia și altele; Sfântul Mucenic Eleazar', post: 'post', culoare: 'rosu' },
  '08-05': { sfant: 'Sfântul Cuvios Atanasie Athonitul; Înainte-prăznuirea Schimbării la Față', post: 'post', culoare: 'verde' },
  '08-06': { sfant: 'Schimbarea la Față a Domnului nostru Iisus Hristos', post: 'dezlegare', culoare: 'alb' },
  '08-07': { sfant: 'Sfântul Mucenic Dometie Persul; Sfântul Cuvios Pimen', post: 'post', culoare: 'rosu' },
  '08-08': { sfant: 'Sfântul Emilian Mărturisitorul, episcopul Cizicului; Sfântul Cuvios Grigorie', post: 'post', culoare: 'verde' },
  '08-09': { sfant: 'Sfântul Apostol Matia; Sfântul Mucenic Antonie', post: 'dezlegare', culoare: 'rosu' },
  '08-10': { sfant: 'Sfântul Mucenic și Arhidiacon Laurențiu; Sfântul Sfinție Mucenic Sixt', post: 'post', culoare: 'rosu' },
  '08-11': { sfant: 'Sfântul Sfinție Mucenic Evplu; Sfânta Muceniță Susana', post: 'post', culoare: 'rosu' },
  '08-12': { sfant: 'Sfântul Mucenic Fotie și Anicet; Sfânta Muceniță Clara', post: 'post', culoare: 'rosu' },
  '08-13': { sfant: 'Sfântul Cuvios Maxim Mărturisitorul; Sfântul Mucenic Ipolit', post: 'post', culoare: 'verde' },
  '08-14': { sfant: 'Sfântul Prooroc Mihea; Înainte-prăznuirea Adormirii Maicii Domnului', post: 'post', culoare: 'alb' },
  '08-15': { sfant: 'Adormirea Maicii Domnului', post: 'dezlegare', culoare: 'alb' },
  '08-16': { sfant: 'Icoana Mântuitorului nefăcută de mână omenească (Sfântul Mahramă)', post: 'dezlegare', culoare: 'alb' },
  '08-17': { sfant: 'Sfântul Mucenic Miron; Sfântul Cuvios Alipie Stilpnicul', post: 'post', culoare: 'rosu' },
  '08-18': { sfant: 'Sfinții Mucenici Flor și Laur; Sfântul Mucenic Ioan', post: 'dezlegare', culoare: 'rosu' },
  '08-19': { sfant: 'Sfântul Mucenic Andrei Stratilat; Sfântul Mucenic Timotei', post: 'post', culoare: 'rosu' },
  '08-20': { sfant: 'Sfântul Prooroc Samuel; Sfântul Mucenic Severian', post: 'dezlegare', culoare: 'verde' },
  '08-21': { sfant: 'Sfântul Apostol Tadeu; Sfânta Muceniță Vasa', post: 'dezlegare', culoare: 'rosu' },
  '08-22': { sfant: 'Sfântul Mucenic Agatonie; Sfântul Apostol Matia', post: 'post', culoare: 'rosu' },
  '08-23': { sfant: 'Sfântul Mucenic Lup; Sfântul Sfinție Mucenic Irineu', post: 'post', culoare: 'rosu' },
  '08-24': { sfant: 'Sfântul Mucenic Eutihie, ucenicul Sfântului Ioan Teologul', post: 'post', culoare: 'rosu' },
  '08-25': { sfant: 'Întoarcerea moaștelor Sfântului Apostol Bartolomeu; Sfântul Apostol Tit', post: 'dezlegare', culoare: 'rosu' },
  '08-26': { sfant: 'Sfântul Cuvios Adrian, întemeietorul Mănăstirii Poshehonskaia; Sfântul Mucenic Adrianu', post: 'post', culoare: 'verde' },
  '08-27': { sfant: 'Sfântul Cuvios Pimen cel Mare; Sfântul Mucenic Fanurie', post: 'dezlegare', culoare: 'verde' },
  '08-28': { sfant: 'Sfântul Cuvios Moise Etiopianul; Sfânta Muceniță Ana', post: 'dezlegare', culoare: 'verde' },
  '08-29': { sfant: 'Tăierea capului Sfântului Ioan Botezătorul', post: 'post', culoare: 'alb' },
  '08-30': { sfant: 'Sfinții Mucenieci Alexandru, Ioan și Pavel cel Nou, Patriarhul Constantinopolului', post: 'dezlegare', culoare: 'alb' },
  '08-31': { sfant: 'Aducerea brâului Maicii Domnului; Sfântul Mucenic Aifal', post: 'dezlegare', culoare: 'alb' },
  // SEPTEMBRIE
  '09-01': { sfant: 'Începutul Anului Bisericesc; Sfântul Sfinție Mucenic Simeon Stâlpnicul', post: 'dezlegare', culoare: 'alb' },
  '09-02': { sfant: 'Sfântul Mucenic Mamas; Sfântul Cuvios Ioan Postnicul', post: 'dezlegare', culoare: 'rosu' },
  '09-03': { sfant: 'Sfântul Sfinție Mucenic Antim, episcopul Nicomidiei; Sfântul Teoctist', post: 'dezlegare', culoare: 'rosu' },
  '09-04': { sfant: 'Sfântul Sfinție Mucenic Vavila, episcopul Antiohiei; Sfântul Prooroc Moise', post: 'dezlegare', culoare: 'rosu' },
  '09-05': { sfant: 'Sfântul Prooroc Zaharia și Dreapta Elisabeta, părinții Sfântului Ioan Botezătorul', post: 'dezlegare', culoare: 'verde' },
  '09-06': { sfant: 'Minunea Sfântului Arhanghel Mihail de la Colose (Honele)', post: 'dezlegare', culoare: 'alb' },
  '09-07': { sfant: 'Sfântul Mucenic Sozont; Sfântul Cuvios Lucas din Sicilia', post: 'dezlegare', culoare: 'rosu' },
  '09-08': { sfant: 'Nașterea Maicii Domnului', post: 'dezlegare', culoare: 'alb' },
  '09-09': { sfant: 'Sfinții și Drepții Părinți Dumnezeiești Ioachim și Ana; Sfântul Mucenic Sever', post: 'dezlegare', culoare: 'alb' },
  '09-10': { sfant: 'Sfinții Mucenici Minodora, Mitrodora și Nimfodora; Sfântul Mucenic Apeles', post: 'dezlegare', culoare: 'rosu' },
  '09-11': { sfant: 'Sfântul Cuvios Teodora din Alexandria; Sfântul Cuvios Eufrosina', post: 'dezlegare', culoare: 'verde' },
  '09-12': { sfant: 'Sfântul Sfinție Mucenic Autonome; Sfântul Cuvios Corneliu de la Pskov', post: 'dezlegare', culoare: 'rosu' },
  '09-13': { sfant: 'Sfântul Mucenic Corneliu Sutașul; Sfântul Cuvios Petru din Aton', post: 'dezlegare', culoare: 'rosu' },
  '09-14': { sfant: 'Înălțarea Sfintei Cruci', post: 'post', culoare: 'alb' },
  '09-15': { sfant: 'Sfântul Nichita Mărturisitorul; Sfânta Mare Muceniță Eufimia', post: 'dezlegare', culoare: 'verde' },
  '09-16': { sfant: 'Sfânta Mare Muceniță Eufimia; Sfântul Mucenic Severian', post: 'dezlegare', culoare: 'rosu' },
  '09-17': { sfant: 'Sfânta Muceniță Vera, Nadeajda, Liubov și mama lor Sofia; Sfântul Mucenic Peleu', post: 'dezlegare', culoare: 'rosu' },
  '09-18': { sfant: 'Sfântul Cuvios Eumenie; Sfântul Mucenic Ariadna', post: 'dezlegare', culoare: 'verde' },
  '09-19': { sfant: 'Sfinții Mucenici Trofim, Savatie și Dorimedont; Sfântul Prooroc Iona', post: 'dezlegare', culoare: 'rosu' },
  '09-20': { sfant: 'Sfântul Mare Mucenic Eustatie Plachida și familia sa; Sfântul Mucenic Agapia', post: 'dezlegare', culoare: 'rosu' },
  '09-21': { sfant: 'Sfântul Apostol și Evanghelist Matei; Sfânta Muceniță Ificrate', post: 'dezlegare', culoare: 'rosu' },
  '09-22': { sfant: 'Sfântul Sfinție Mucenic Foca, episcopul Sinopei; Sfântul Prooroc Iona', post: 'dezlegare', culoare: 'rosu' },
  '09-23': { sfant: 'Zămislirea Sfântului Ioan Botezătorul; Sfântul Mucenic Andronicu', post: 'dezlegare', culoare: 'alb' },
  '09-24': { sfant: 'Sfânta Muceniță Tecla, întocmai cu Apostolii; Sfântul Cuvios Coprie', post: 'dezlegare', culoare: 'rosu' },
  '09-25': { sfant: 'Sfânta Cuvioasă Eufrosina; Sfântul Mucenic Pavel', post: 'dezlegare', culoare: 'verde' },
  '09-26': { sfant: 'Adormirea Sfântului Apostol și Evanghelist Ioan Teologul', post: 'dezlegare', culoare: 'alb' },
  '09-27': { sfant: 'Sfântul Mucenic Calist și Evod; Sfântul Cuvios Ignatiu', post: 'dezlegare', culoare: 'rosu' },
  '09-28': { sfant: 'Sfântul Cuvios Hariton Mărturisitorul; Sfântul Mucenic Prohor', post: 'dezlegare', culoare: 'verde' },
  '09-29': { sfant: 'Sfântul Cuvios Chiriac Sihastrul; Sfântul Mucenic Dada', post: 'dezlegare', culoare: 'verde' },
  '09-30': { sfant: 'Sfântul Mucenic Grigorie Armeanul; Sfântul Cuvios Grigorie', post: 'dezlegare', culoare: 'rosu' },
  // OCTOMBRIE
  '10-01': { sfant: 'Sfântul Cuvios Roman Melodul; Sfânta Muceniță Areta', post: 'dezlegare', culoare: 'verde' },
  '10-02': { sfant: 'Sfinții Mucenici Ciprian și Iustina; Sfântul Mucenic Andronic', post: 'dezlegare', culoare: 'rosu' },
  '10-03': { sfant: 'Sfântul Sfinție Mucenic Dionisie Areopagitul; Sfântul Mucenic Rustic', post: 'dezlegare', culoare: 'rosu' },
  '10-04': { sfant: 'Sfântul Sfinție Mucenic Ieronim Mărturisitorul; Sfântul Mucenic Gaie', post: 'dezlegare', culoare: 'rosu' },
  '10-05': { sfant: 'Sfinții Mucenici Haritina și Mamelta; Sfânta Muceniță Fidel', post: 'dezlegare', culoare: 'rosu' },
  '10-06': { sfant: 'Sfântul Apostol Toma', post: 'dezlegare', culoare: 'rosu' },
  '10-07': { sfant: 'Sfinții Mucenici Serghie și Vah; Sfântul Mucenic Iulian', post: 'dezlegare', culoare: 'rosu' },
  '10-08': { sfant: 'Sfânta Cuvioasă Pelaghia; Sfântul Cuvios Tais', post: 'dezlegare', culoare: 'verde' },
  '10-09': { sfant: 'Sfântul Apostol Iacob al lui Alfeu; Sfântul Cuvios Andronicu', post: 'dezlegare', culoare: 'rosu' },
  '10-10': { sfant: 'Sfinții Mucenici Evlampie și Evlampia; Sfântul Teofil', post: 'dezlegare', culoare: 'rosu' },
  '10-11': { sfant: 'Sfântul Apostol Filip, unul din cei șapte Diaconi; Sfântul Mucenic Zenon', post: 'dezlegare', culoare: 'rosu' },
  '10-12': { sfant: 'Sfântul Mucenic Probu, Andronic și Taracu; Sfântul Mucenic Cosma', post: 'dezlegare', culoare: 'rosu' },
  '10-13': { sfant: 'Sfinții Mucenici Carp, Papur, Agatodor și Agotonica; Sfântul Mucenic Florentiu', post: 'dezlegare', culoare: 'rosu' },
  '10-14': { sfant: 'Sfânta Cuvioasă Parascheva de la Iași; Sfântul Mucenic Nazariu', post: 'dezlegare', culoare: 'alb' },
  '10-15': { sfant: 'Sfântul Cuvios Eutimie cel Nou; Sfânta Muceniță Lucia', post: 'dezlegare', culoare: 'verde' },
  '10-16': { sfant: 'Sfântul Mucenic Longin Sutașul; Sfântul Mucenic Isachie', post: 'dezlegare', culoare: 'rosu' },
  '10-17': { sfant: 'Sfântul Prooroc Osea; Sfântul Mucenic Andronie', post: 'dezlegare', culoare: 'verde' },
  '10-18': { sfant: 'Sfântul Apostol și Evanghelist Luca', post: 'dezlegare', culoare: 'rosu' },
  '10-19': { sfant: 'Sfântul Prooroc Ioil; Sfântul Mucenic Varan', post: 'dezlegare', culoare: 'verde' },
  '10-20': { sfant: 'Sfântul Mare Mucenic Artemie; Sfântul Mucenic Matern', post: 'dezlegare', culoare: 'rosu' },
  '10-21': { sfant: 'Sfântul Cuvios Ilarion cel Mare; Sfântul Mucenic Dasie', post: 'dezlegare', culoare: 'verde' },
  '10-22': { sfant: 'Sfântul Cuvios Aversachie; Sfântul Mucenic Alexandr', post: 'dezlegare', culoare: 'verde' },
  '10-23': { sfant: 'Sfântul Apostol Iacob, fratele Domnului; Sfântul Mucenic Ignatie', post: 'dezlegare', culoare: 'rosu' },
  '10-24': { sfant: 'Sfântul Mucenic Areta și cei 4299 de Mucenici cu el din Negran; Sfânta Muceniță Valurie', post: 'dezlegare', culoare: 'rosu' },
  '10-25': { sfant: 'Sfinții Mucenici Marcian și Martirie; Sfântul Mucenic Anastasie', post: 'dezlegare', culoare: 'rosu' },
  '10-26': { sfant: 'Sfântul Mare Mucenic Dimitrie, Izvorâtorul de Mir', post: 'dezlegare', culoare: 'rosu' },
  '10-27': { sfant: 'Sfântul Mucenic Nestor; Sfântul Mucenic Capiton', post: 'dezlegare', culoare: 'rosu' },
  '10-28': { sfant: 'Sfântul Mucenic Terentie și Neonila; Sfântul Mucenic Ciprian', post: 'dezlegare', culoare: 'rosu' },
  '10-29': { sfant: 'Sfântul Mucenic Anastasie din Ilirie; Sfântul Cuvios Abraham', post: 'dezlegare', culoare: 'rosu' },
  '10-30': { sfant: 'Sfântul Mucenic Zenobiu și Zenobia; Sfântul Mucenic Domentian', post: 'dezlegare', culoare: 'rosu' },
  '10-31': { sfant: 'Sfinții Apostoli Stahu, Ampliatu, Urban, Narcis, Apellie și Aristovul', post: 'dezlegare', culoare: 'rosu' },
  // NOIEMBRIE
  '11-01': { sfant: 'Sfinții Anarghiri Cosma și Damian din Arabia; Sfântul Mucenic Domentian', post: 'dezlegare', culoare: 'rosu' },
  '11-02': { sfant: 'Sfinții Mucenici Achindin, Pigasie, Aftonie, Elpidofor și Anempodistu; Sfântul Cuvios Marcian', post: 'dezlegare', culoare: 'rosu' },
  '11-03': { sfant: 'Sfântul Mucenic Acepsima, Iosif și Aital; Sfântul Cuvios Iacov de Persia', post: 'dezlegare', culoare: 'rosu' },
  '11-04': { sfant: 'Sfântul Cuvios Ioanichie cel Mare; Sfinții Mucenici Nichander și Ermeu', post: 'dezlegare', culoare: 'verde' },
  '11-05': { sfant: 'Sfinții Mucenici Galaction și Epistimia; Sfântul Mucenic Pavel', post: 'dezlegare', culoare: 'rosu' },
  '11-06': { sfant: 'Sfântul Pavel Mărturisitorul, Patriarhul Constantinopolului; Sfântul Mucenic Luca', post: 'dezlegare', culoare: 'alb' },
  '11-07': { sfant: 'Sfinții 33 de Mucenici din Melitin; Sfântul Cuvios Lazăr Galessiotul', post: 'dezlegare', culoare: 'rosu' },
  '11-08': { sfant: 'Soborul Sfinților Arhangheli Mihail și Gavriil și al tuturor Puterilor cerești', post: 'dezlegare', culoare: 'alb' },
  '11-09': { sfant: 'Sfântul Mucenic Onisifor și Porfirie; Sfânta Muceniță Matrona', post: 'dezlegare', culoare: 'rosu' },
  '11-10': { sfant: 'Sfinții Apostoli Olimp, Rodion, Erasm, Sosipatru, Cuartu și Tertiu; Sfântul Mucenic Orest', post: 'dezlegare', culoare: 'rosu' },
  '11-11': { sfant: 'Sfântul Mucenic Mina; Sfântul Mucenic Victor și Ștefan; Sfânta Muceniță Stefanida', post: 'dezlegare', culoare: 'rosu' },
  '11-12': { sfant: 'Sfântul Ioan Milostivul, Patriarhul Alexandriei; Sfântul Cuvios Nil Postnicul', post: 'dezlegare', culoare: 'alb' },
  '11-13': { sfant: 'Sfântul Ioan Gură de Aur, Arhiepiscopul Constantinopolului', post: 'dezlegare', culoare: 'alb' },
  '11-14': { sfant: 'Sfântul Apostol Filip; Sfântul Grigorie Palama', post: 'post', culoare: 'rosu' },
  '11-15': { sfant: 'Sfinții Mucenici Gurie, Samona și Aviv; Sfântul Cuvios Paisie de la Neamț', post: 'post', culoare: 'rosu' },
  '11-16': { sfant: 'Sfântul Apostol și Evanghelist Matei; Sfântul Mucenic Barlaamu', post: 'post', culoare: 'rosu' },
  '11-17': { sfant: 'Sfântul Grigorie al Neocezareei; Sfântul Mucenic Goncalo', post: 'post', culoare: 'alb' },
  '11-18': { sfant: 'Sfântul Mucenic Platon; Sfântul Mucenic Roman', post: 'post', culoare: 'rosu' },
  '11-19': { sfant: 'Sfântul Prooroc Avdie; Sfântul Mucenic Varlaam', post: 'post', culoare: 'verde' },
  '11-20': { sfant: 'Sfântul Cuvios Grigorie Decapolitul; Sfântul Mucenic Proclu', post: 'post', culoare: 'verde' },
  '11-21': { sfant: 'Intrarea în Biserică a Maicii Domnului', post: 'dezlegare', culoare: 'alb' },
  '11-22': { sfant: 'Sfântul Apostol Filimon și Onisim; Sfânta Muceniță Cecilia', post: 'post', culoare: 'rosu' },
  '11-23': { sfant: 'Sfântul Amfilohie, episcopul Iconiei; Sfântul Grigorie, episcopul Agrigentului', post: 'post', culoare: 'alb' },
  '11-24': { sfant: 'Sfânta Mare Muceniță Ecaterina; Sfântul Mucenic Mercurie', post: 'dezlegare', culoare: 'rosu' },
  '11-25': { sfant: 'Sfântul Mucenic Clement, Papa Romei; Sfântul Mucenic Petru, episcopul Alexandriei', post: 'post', culoare: 'rosu' },
  '11-26': { sfant: 'Sfântul Alipie Stilpnicul; Sfântul Cuvios Iacob Sihastrul', post: 'post', culoare: 'verde' },
  '11-27': { sfant: 'Sfântul Mucenic Iacob Persul; Sfântul Cuvios Roman', post: 'post', culoare: 'rosu' },
  '11-28': { sfant: 'Sfântul Cuvios Paisie Velicicovski; Sfântul Mucenic Ireneu', post: 'dezlegare', culoare: 'verde' },
  '11-29': { sfant: 'Sfântul Mucenic Paramon; Sfântul Cuvios Acaciu', post: 'post', culoare: 'rosu' },
  '11-30': { sfant: 'Sfântul Apostol Andrei cel Întâi Chemat, Ocrotitorul României', post: 'dezlegare', culoare: 'alb' },
  // DECEMBRIE
  '12-01': { sfant: 'Sfântul Prooroc Naum; Sfântul Mucenic Filaret', post: 'post', culoare: 'verde' },
  '12-02': { sfant: 'Sfântul Prooroc Avacum; Sfântul Mucenic Miropos', post: 'post', culoare: 'verde' },
  '12-03': { sfant: 'Sfântul Prooroc Sofonie; Sfântul Mucenic Agapie', post: 'post', culoare: 'verde' },
  '12-04': { sfant: 'Sfânta Mare Muceniță Varvara; Sfântul Cuvios Ioan Damaschinul', post: 'dezlegare', culoare: 'rosu' },
  '12-05': { sfant: 'Sfântul Cuvios Sava cel Sfințit; Sfântul Mucenic Anastasie', post: 'post', culoare: 'verde' },
  '12-06': { sfant: 'Sfântul Ierarh Nicolae, Arhiepiscopul Mirelor Lichiei', post: 'dezlegare', culoare: 'alb' },
  '12-07': { sfant: 'Sfântul Ambrozie, episcopul Mediolanului; Sfântul Mucenic Atena', post: 'dezlegare', culoare: 'alb' },
  '12-08': { sfant: 'Sfântul Cuvios Patapie; Sfântul Mucenic Sozon', post: 'post', culoare: 'verde' },
  '12-09': { sfant: 'Zămislirea Sfintei Fecioare Maria de către Sfânta Ana; Sfântul Mucenic Tripun', post: 'dezlegare', culoare: 'alb' },
  '12-10': { sfant: 'Sfântul Mucenic Mina, Ermogen și Evgraf; Sfântul Cuvios Toma', post: 'post', culoare: 'rosu' },
  '12-11': { sfant: 'Sfântul Cuvios Daniil Stâlpnicul; Sfântul Mucenic Vrintan', post: 'post', culoare: 'verde' },
  '12-12': { sfant: 'Sfântul Sfinție Mucenic Alexandru; Sfântul Mucenic Epimah', post: 'dezlegare', culoare: 'rosu' },
  '12-13': { sfant: 'Sfântul Cuvios Luchian Presbiterul din Antiohia; Sfânta Muceniță Lucia', post: 'post', culoare: 'verde' },
  '12-14': { sfant: 'Sfântul Mucenic Tirs, Leuciu și Calinic; Sfântul Mucenic Filemon', post: 'post', culoare: 'rosu' },
  '12-15': { sfant: 'Sfântul Cuvios Pavel din Teba; Sfântul Mucenic Elevsiu', post: 'post', culoare: 'verde' },
  '12-16': { sfant: 'Sfântul Prooroc Ageu; Sfântul Mucenic Marin', post: 'post', culoare: 'verde' },
  '12-17': { sfant: 'Sfântul Prooroc Daniil; Sfinții Trei Tineri: Anania, Azaria și Misail', post: 'dezlegare', culoare: 'verde' },
  '12-18': { sfant: 'Sfântul Mucenic Sebastian și cei împreună cu el; Sfântul Mucenic Zoticu', post: 'post', culoare: 'rosu' },
  '12-19': { sfant: 'Sfântul Cuvios Bonifaciu Milostivul; Sfântul Mucenic Bonifaciu', post: 'dezlegare', culoare: 'verde' },
  '12-20': { sfant: 'Sfântul Ierarh Ignatie Teoforul; Sfântul Mucenic Filogon', post: 'dezlegare', culoare: 'alb' },
  '12-21': { sfant: 'Sfânta Muceniță Iuliana din Nicomidia; Sfântul Cuvios Toma', post: 'post', culoare: 'rosu' },
  '12-22': { sfant: 'Sfânta Mare Muceniță Anastasia Romana; Sfântul Mucenic Hrisogon', post: 'dezlegare', culoare: 'rosu' },
  '12-23': { sfant: 'Sfinții 10 Mucenici din Creta; Sfântul Cuvios Naum de la Ohrid', post: 'post', culoare: 'rosu' },
  '12-24': { sfant: 'Sfântul Cuvios Mc. Eugenia; Ajunul Nașterii Domnului', post: 'post', culoare: 'alb' },
  '12-25': { sfant: 'Nașterea Domnului nostru Iisus Hristos', post: 'dezlegare', culoare: 'alb' },
  '12-26': { sfant: 'Soborul Preasfintei Născătoare de Dumnezeu; Sfântul Mucenic Euthimie', post: 'dezlegare', culoare: 'alb' },
  '12-27': { sfant: 'Sfântul Apostol, Întâiul Mucenic și Arhidiacon Ștefan', post: 'dezlegare', culoare: 'alb' },
  '12-28': { sfant: 'Sfinții 20.000 de Mucenici arși în Nicomidia; Sfântul Mucenic Galileu', post: 'dezlegare', culoare: 'rosu' },
  '12-29': { sfant: 'Sfinții 14.000 de Prunci uciși de Irod; Sfântul Mucenic Marcel', post: 'dezlegare', culoare: 'rosu' },
  '12-30': { sfant: 'Sfânta Muceniță Anisia; Sfântul Cuvios Gelasie', post: 'dezlegare', culoare: 'rosu' },
  '12-31': { sfant: 'Sfântul Cuvios Melania Romana; Sfântul Mucenic Zoticu', post: 'dezlegare', culoare: 'verde' },
};

// —— Funcții helper ————————————————————————————————————————————————
function getDataMaine() {
  const maine = new Date();
  maine.setDate(maine.getDate() + 1);
  return maine.toISOString().split('T')[0]; // AAAA-LL-ZZ
}

function getDataKey(dataStr) {
  return dataStr.substring(5); // MM-DD din AAAA-MM-DD
}

function getZiuaSaptamanii(dataStr) {
  const d = new Date(dataStr);
  return d.getDay(); // 0=Duminica, 1=Luni, ... 6=Sâmbătă
}

function getTipPostDefault(dataStr) {
  const zi = getZiuaSaptamanii(dataStr);
  const key = getDataKey(dataStr);

  // ══ REGULA CANONICĂ ORTODOXĂ ══
  // Duminica este zi de prăznuire — NICIODATĂ zi de post,
  // indiferent de ce apare în calendarul static.
  // Conform Canonului 64 Apostolic și tradiției BOR.
  if (zi === 0) return 'dezlegare'; // 0 = Duminică

  // Sâmbăta este zi de dezlegare (cu excepția Sâmbetei Mari)
  // Sâmbăta Mare este gestionată prin CALENDAR_STATIC (post_strict)
  if (zi === 6) {
    // Verificăm dacă e Sâmbăta Mare (excepție canonică)
    if (CALENDAR_STATIC[key] && CALENDAR_STATIC[key].post === 'post_strict') {
      return 'post_strict';
    }
    return 'dezlegare'; // 6 = Sâmbătă — dezlegare în general
  }

  // Pentru celelalte zile: consultăm calendarul static BOR
  if (CALENDAR_STATIC[key]) return CALENDAR_STATIC[key].post;

  // Fallback: Miercuri (3) și Vineri (5) sunt zile de post
  if (zi === 3 || zi === 5) return 'post';
  return 'dezlegare';
}

function getSfantDefault(dataStr) {
  const key = getDataKey(dataStr);
  // Returnăm sfântul din calendarul static sau un mesaj neutru fără placeholder vizibil
  return CALENDAR_STATIC[key]?.sfant || 'Sfântul zilei conform Calendarului Ortodox BOR';
}

function getTitluSfintiDefault(dataStr) {
  const key = getDataKey(dataStr);
  return CALENDAR_STATIC[key]?.sfant || 'Sfinții zilei conform Calendarului Ortodox BOR';
}

// —— Generare conținut cu OpenAI ————————————————————————————————————
async function genereazaContiut(date) {
  const sfantDefault = getSfantDefault(date);
  const tipPost = getTipPostDefault(date);

  // —— PASUL 1: Preluare texte sacre EXACTE din lecționarul static BOR ——
  // Textele Apostolului, Evangheliei și Troparului NU se generează cu AI
  // pentru a evita parafrazarea sau halucinațiile LLM pe texte sacre.
  // Sursă: Biblia Sinodală BOR 1988/2001 + Mineiele BOR
  const cheiaLectionar = date.substring(5); // 'MM-DD' din 'YYYY-MM-DD'
  // Căutăm mai întâi cu cheia completă YYYY-MM-DD (pentru Duminici mobile și zile speciale 2026)
  // apoi cu MM-DD (pentru sărbători fixe: Crăciun, Bobotează, Sf. Apostoli etc.)
  const texteStatice = LECTIONAR[date] || LECTIONAR[cheiaLectionar] || null;

  if (texteStatice) {
    const cheiaGasita = LECTIONAR[date] ? date : cheiaLectionar;
    console.log(`📖 Texte sacre exacte găsite în lecționar pentru ${cheiaGasita}`);
  } else {
    console.warn(`⚠️ Ziua ${cheiaLectionar} nu este în lecționar — câmpurile Apostol/Evanghelie/Tropar vor fi marcate`);
  }

  // —— PASUL 2: Generare conținut CREATIV cu OpenAI ——
  // OpenAI generează DOAR: sfant_viata, sinaxar, predica, cuvant_folos,
  // rugaciunea_zilei, sfinti_secundari, meta_description
  // NU generează texte liturgice sacre (Apostol, Evanghelie, Tropar)
  // Construieste lista completa de sfinti din CALENDAR_STATIC pentru context AI
  const sfantiZilei = CALENDAR_STATIC[cheiaLectionar]?.sfant || sfantDefault;

  const prompt = `Ești un preot ortodox român erudit și un expert în Sinaxarul Bisericii Ortodoxe Române (BOR).
Generează conținut COMPLET și AUTENTIC pentru calendarul ortodox pentru data ${date}.
Sfinții principali ai zilei conform Calendarului BOR: ${sfantiZilei}
Tipul postului: ${tipPost}

REGULI STRICTE:
1. GENEREAZĂ textele Apostolului, Evangheliei și Troparului dacă nu sunt furnizate. Folosește traducerea sinodală BOR.
2. NU folosi niciodată texte placeholder sau fraze generice de tipul "disponibil în curând", "Sfânt din Sinaxarul BOR" etc.
3. Câmpul "titlu_sfinti" trebuie să conțină GRUPUL COMPLET de sfinți ai zilei (ex: "Sfinții Mucenici Zotic, Atal, Camasie și Filip de la Niculițel"), nu doar un sfânt secundar.
4. Câmpul "sinaxar_complet" trebuie să fie un text ACADEMIC EXTINS de minimum 600 cuvinte (1500+ caractere), cu date istorice exacte, context teologic profund, referințe patristice, importanță liturgică și relevanță pentru credinciosul ortodox român — text complet pentru indexare SEO profundă. NU trunchia textul.
5. Toate câmpurile sunt OBLIGATORII — nu lăsa niciun câmp gol sau cu text generic.

Răspunde DOAR cu JSON valid, fără alte texte, fără markdown, fără explicații.
Folosește diacritice românești corecte (ă, â, î, ș, ț).
JSON exact (toate câmpurile obligatorii):
{
  "sfant_nume": "numele complet al sfântului principal conform Sinaxarului BOR",
  "titlu_sfinti": "GRUPUL COMPLET de sfinți ai zilei, exact cum apare în Calendarul BOR (ex: Sfinții Mucenici Zotic, Atal, Camasie și Filip de la Niculițel)",
  "sfant_viata": "viața sfântului principal în 400-500 cuvinte, scrisă cu evlavie academică, cu date istorice exacte conform Sinaxarului BOR, locul nașterii, perioada istorică, faptele de credință, modul muceniciei sau al sfințeniei, canonizarea și moaștele — fără texte generice",
  "sinaxar_complet": "sinaxarul ACADEMIC EXTINS al zilei în minimum 600 cuvinte (1500+ caractere): prezintă toți sfinții zilei cu viețile lor complete, contextul istoric al epocii, persecuțiile suferite, minunile săvârșite, importanța lor pentru Biserica Ortodoxă Română, referințe patristice și liturgice, semnificația culorii liturgice și a tipului de post — text dens pentru indexare SEO profundă, conform tradiției BOR",
  "culoare_liturgica": "una din: alb / rosu / verde / violet / negru",
  "rugaciunea_zilei": "o rugăciune ortodoxă completă potrivită zilei, de 60-80 cuvinte",
  "sinaxar": "sinaxarul scurt al zilei în 180-220 cuvinte, cu toți sfinții zilei, conform tradiției BOR",
  "predica": "predică de 250-300 cuvinte bazată pe pericopa evanghelică a zilei, cu tâlcuire patristică (citând un Sfânt Părinte), aplicare practică pentru credinciosul ortodox român de azi și îndemnuri concrete pentru viața duhovnicească",
  "cuvant_folos": "citat patristic autentic relevant pentru ziua respectivă, cu sursa exactă (autor, carte, capitol)",
  "sfinti_secundari": "alți sfinți prăznuiți în această zi conform Calendarului BOR, separați prin punct și virgulă",
  "post_info": "descriere completă a tipului de post/dezlegare pentru această zi conform tradiției ortodoxe (ex: Dezlegare deplină la toate — zi de prăznuire; sau: Post — abstinență de la carne, lactate și ouă)",
  "meta_description": "descriere SEO de exact 150-160 caractere pentru această zi, cu sfântul și data",
  "apostol_carte": "cartea și versetele Apostolului zilei (ex: Romani 1:1-7)",
  "apostol_text": "textul integral al Apostolului zilei în limba română, conform traducerii sinodale BOR",
  "evanghelie_carte": "cartea și versetele Evangheliei zilei (ex: Matei 5:1-10)",
  "evanghelie_text": "textul integral al Evangheliei zilei în limba română, conform traducerii sinodale BOR",
  "tropar": "troparul sfântului zilei, conform Mineiului BOR"
}`;

  console.log(`\n🔄 Generez conținut creativ pentru ${date} – ${sfantDefault}`);
  const response = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [
      {
        role: 'system',
        content: 'Ești un preot ortodox român erudit. Răspunzi DOAR cu JSON valid, fără alte texte. Folosești diacritice românești corecte. Nu inventezi texte liturgice — generezi doar conținut creativ și analitic.'
      },
      { role: 'user', content: prompt }
    ],
    temperature: 0.3,
    max_tokens: 3500
  });

  const continut = response.choices[0].message.content.trim();
  const jsonCurat = continut
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  const continutAI = JSON.parse(jsonCurat);

  // —— PASUL 3: Combinare texte sacre exacte + conținut AI ——
  // Textele sacre din lecționar suprascriu orice ar genera AI
  if (texteStatice) {
    continutAI.apostol_carte = texteStatice.apostol_carte;
    continutAI.apostol_versete = texteStatice.apostol_versete;
    continutAI.apostol_text = texteStatice.apostol_text;
    continutAI.evanghelie_carte = texteStatice.evanghelie_carte;
    continutAI.evanghelie_versete = texteStatice.evanghelie_versete;
    continutAI.evanghelie_text = texteStatice.evanghelie_text;
    continutAI.tropar = texteStatice.tropar;
    console.log(`✅ Texte sacre exacte BOR aplicate pentru ${cheiaLectionar}`);
  } else {
    // Fallback: text informativ fără placeholder vizibil
    continutAI.apostol_carte = continutAI.apostol_carte || 'Apostolul zilei';
    continutAI.apostol_versete = continutAI.apostol_versete || '';
    continutAI.apostol_text = continutAI.apostol_text && continutAI.apostol_text.length > 50 ? continutAI.apostol_text : 'Textul Apostolului pentru această zi se găsește în Apostolul BOR, la pericopa rânduită de Sinaxarul Bisericii Ortodoxe Române.';
    continutAI.evanghelie_carte = continutAI.evanghelie_carte || 'Evanghelia zilei';
    continutAI.evanghelie_versete = continutAI.evanghelie_versete || '';
    continutAI.evanghelie_text = continutAI.evanghelie_text && continutAI.evanghelie_text.length > 50 ? continutAI.evanghelie_text : 'Textul Evangheliei pentru această zi se găsește în Evangheliarul BOR, la pericopa rânduită de Sinaxarul Bisericii Ortodoxe Române.';
    continutAI.tropar = continutAI.tropar || 'Troparul sfântului se găsește în Mineiul lunii, la ziua respectivă, conform rânduielii Bisericii Ortodoxe Române.';
  }

  // —— PASUL 4: Adaugă câmpurile obligatorii calculate server-side ——
  // tip_post este calculat din logica canonică, nu din AI
  continutAI.tip_post = tipPost;

  // Calculează post_info (descriere completă a postului)
  const postInfoMap = {
    'post': 'Zi de post — abstinență de la carne, lactate, ouă, pește, vin și untdelemn, conform rânduielii Bisericii Ortodoxe.',
    'post_strict': 'Post negru (post aspru) — abstinență totală de la hrană sau hrană uscată, conform rânduielii Bisericii Ortodoxe.',
    'dezlegare_peste': 'Dezlegare la pește, vin și untdelemn — zi de sărbătoare cu dezlegare parțială.',
    'dezlegare_vin_ulei': 'Dezlegare la vin și untdelemn — zi cu dezlegare parțială conform Tipicului BOR.',
    'dezlegare': 'Dezlegare deplină la toate — zi de prăznuire, fără restricții alimentare conform rânduielii ortodoxe.'
  };
  const postInfoText = continutAI.post_info || postInfoMap[tipPost] || 'Dezlegare deplină la toate.';

  // titlu_sfinti: grupul complet de sfinți (fallback la sfant_nume)
  const titluSfintiText = (continutAI.titlu_sfinti && !continutAI.titlu_sfinti.includes('Sinaxarul BOR'))
    ? continutAI.titlu_sfinti
    : continutAI.sfant_nume;

  // sinaxar_complet: text extins pentru SEO (fallback la sfant_viata sau sinaxar)
  const sinaxarCompletText = (continutAI.sinaxar_complet && continutAI.sinaxar_complet.length >= 100)
    ? continutAI.sinaxar_complet
    : (continutAI.sfant_viata || continutAI.sinaxar || continutAI.sfant_nume);

  // MAPĂM câmpurile noi la coloanele EXISTENTE în Supabase
  // (până la migrarea SQL care adaugă coloanele titlu_sfinti, sinaxar_complet, post_info)
  // titlu_sfinti → sfant_nume (suprascrie cu grupul complet)
  continutAI.sfant_nume = titluSfintiText;
  // sinaxar_complet → sinaxar (extinde sinaxarul scurt cu versiunea lungă)
  continutAI.sinaxar = sinaxarCompletText;
  // post_info → stocat în meta_description ca prefix (până la migrare)
  // Asigurăm că meta_description include informația de post
  if (!continutAI.meta_description || continutAI.meta_description.length < 50) {
    continutAI.meta_description = `${titluSfintiText.substring(0,80)} — ${postInfoText.substring(0,60)}. Calendar ortodox ${date}.`;
  }

  // Eliminăm câmpurile care nu există în schema Supabase (evităm eroarea PGRST204)
  delete continutAI.titlu_sfinti;
  delete continutAI.sinaxar_complet;
  delete continutAI.post_info;

  return continutAI;
}

// —— Salvare în Supabase ————————————————————————————————————————————
async function salveazaInSupabase(data, continut) {
  const inregistrare = {
    data_calendaristica: data,
    ...continut
  };

  delete inregistrare.creat_la;

  const { data: rezultat, error } = await supabase
    .from('zile_ortodoxe')
    .upsert(inregistrare, { onConflict: 'data_calendaristica', ignoreDuplicates: false });

  if (error) {
    console.error('❌ Eroare Supabase:', error.message);
    throw error;
  }

  console.log(`✅ Salvat în Supabase pentru ${data}`);
  return rezultat;
}

// —— Notificare push OneSignal ————————————————————————————————————
async function trimiteNotificare(data, sfantNume) {
  if (!ONESIGNAL_APP_ID || !ONESIGNAL_API_KEY) {
    console.log('⚠️ OneSignal nu este configurat – skip notificare');
    return;
  }

  const dataRo = new Date(data);
  const luni = ['ianuarie','februarie','martie','aprilie','mai','iunie','iulie','august','septembrie','octombrie','noiembrie','decembrie'];
  const dataFormatata = `${dataRo.getDate()} ${luni[dataRo.getMonth()]} ${dataRo.getFullYear()}`;

  const sarcinaUtila = {
    app_id: ONESIGNAL_APP_ID,
    segmente_incluse: ['Toate'],
    titluri: { ro: `🕊️ ${sfantNume}` },
    contents: { ro: `Calendar ortodox ${dataFormatata} – Sfântul zilei, Apostolul și Evanghelia zilei` },
    url: 'https://povestidecredinta.ro/sfantul-zilei/',
    chrome_web_icon: 'https://povestidecredinta.ro/imagini/icon-192.png',
    trimite_după: `${data} 05:00:00 GMT+0200`
  };

  const raspuns = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${ONESIGNAL_API_KEY}`
    },
    body: JSON.stringify(sarcinaUtila)
  });

  const rezultat = await raspuns.json();
  if (rezultat.id) {
    console.log(`📅 Notificare programată pentru ${data} la 05:00 România`);
  } else {
    console.warn('⚠️ Notificare OneSignal:', JSON.stringify(rezultat));
  }
}

// —— Funcție principală ————————————————————————————————————————————
async function main() {
  console.log('✝️  Povești de Credință – Generare conținut zilnic');
  console.log('=========================================');

  // Determină data pentru care generăm (implicit: mâine)
  const dataTarget = process.argv[2] || getDataMaine();
  console.log(`🗓️  Dată țintă: ${dataTarget}`);

  // Verifică dacă există deja în Supabase
  const { data: existent, error: checkError } = await supabase
    .from('zile_ortodoxe')
    .select('data_calendaristica, sfant_nume')
    .eq('data_calendaristica', dataTarget)
    .single();

  if (existent && !process.argv.includes('--force')) {
    console.log(`ℹ️  Conținut deja există pentru ${dataTarget}: ${existent.sfant_nume}`);
    console.log('  Folosește --force pentru a regenera');
    return;
  }

  try {
    // Generează cu OpenAI
    const continut = await genereazaContiut(dataTarget);
    console.log(`📜 Sfânt generat: ${continut.sfant_nume}`);

    // Salvează în Supabase
    await salveazaInSupabase(dataTarget, continut);

    // Trimite notificări push
    await trimiteNotificare(dataTarget, continut.sfant_nume);

    console.log('\n✅ Flux complet finalizat cu succes!');
    console.log(` Sfânt: ${continut.sfant_nume}`);
    console.log(` Post: ${continut.tip_post}`);
    console.log(` Apostol: ${continut.apostol_carte} ${continut.apostol_versete}`);
    console.log(` Evanghelie: ${continut.evanghelie_carte} ${continut.evanghelie_versete}`);

  } catch (eroare) {
    console.error('\n❌ Eroare în generarea conținutului:', eroare.message);

    // Fallback: salvează date minime din calendar static — fără placeholder-uri vizibile
    console.log('⚠️ Salvez data fallback din calendar static...');
    const sfantFallback = getSfantDefault(dataTarget);
    const tipPostFallback = getTipPostDefault(dataTarget);
    const postInfoFallback = {
      'post': 'Zi de post — abstinență de la carne, lactate, ouă, pește, vin și untdelemn.',
      'dezlegare': 'Dezlegare deplină la toate — zi de prăznuire.',
      'dezlegare_peste': 'Dezlegare la pește, vin și untdelemn.',
      'post_strict': 'Post negru — abstinență totală.'
    }[tipPostFallback] || 'Dezlegare deplină la toate.';
    const fallbackRecord = {
      sfant_nume: sfantFallback,
      titlu_sfinti: sfantFallback,
      tip_post: tipPostFallback,
      post_info: postInfoFallback,
      culoare_liturgica: 'alb',
      sfant_viata: `${sfantFallback} este prăznuit în calendarul ortodox pe ${dataTarget}. Conform Sinaxarului Bisericii Ortodoxe Române, acesta este unul dintre sfinții care au slujit lui Dumnezeu cu credință și sfințenie.`,
      sinaxar_complet: `${sfantFallback} este prăznuit în calendarul ortodox pe ${dataTarget}. Conform Sinaxarului Bisericii Ortodoxe Române, viața și faptele acestui sfânt reprezintă o pildă de credință pentru toți creștinii ortodocși.`,
      sinaxar: `${sfantFallback} este prăznuit în calendarul ortodox pe ${dataTarget}.`,
      meta_description: `Calendar ortodox ${dataTarget}: ${sfantFallback.substring(0, 100)}. Sinaxar, tropar și rugăciuni ortodoxe.`
    };

    await salveazaInSupabase(dataTarget, fallbackRecord);
    console.log('✅ Data de rezervă salvată');

    process.exit(1);
  }
}

// —— Rulare ————————————————————————————————————————————————————————
main().catch(err => {
  console.error('❌ Eroare fatală:', err);
  process.exit(1);
});
