// Verifică filtrul de texte generate din js/corectura-provizorie.js (fără browser):
// 1) denumiri alternative ale sfinților din calendarul validat (titluri întregi, grafii diferite, ordine schimbată) NU ascund texte corecte;
// 2) sfinții care nu sunt în calendar (cazul real 11 oct.: Optina, Zenaida) sunt detectați.
// Folosire: node tests/test_denumiri_alternative.js
const fs=require('fs');const src=fs.readFileSync('js/corectura-provizorie.js','utf8');
const g=new Function(src.slice(src.indexOf('  var TITLURI'), src.indexOf('  var NEUTRU'))+'; return {pomeniriStraine, numesteStrain};')();
const V=JSON.parse(require('fs').readFileSync('data/calendar-validat-2026-t4.json','utf8')).zile;
const T=[[/\bSf\. Mari Mc\./g,'Sfinții Mari Mucenici'],[/\bSf\. M\. Mc\./g,'Sfântul Mare Mucenic'],[/\bSf\. Sfințit Mc\./g,'Sfântul Sfințit Mucenic'],[/\bSf\. Mc\./g,'Sfinții Mucenici'],
 [/\bSf\. Cuv\./g,'Sfântul Cuvios'],[/\bSf\. Ier\./g,'Sfântul Ierarh'],[/\bSf\. Ap\./g,'Sfântul Apostol'],[/\bSf\. Arh\./g,'Sfinții Arhangheli'],[/\bSf\./g,'Sfântul'],[/\bMc\./g,'Mucenic'],[/\bCuv\./g,'Cuvioasa'],[/\bIer\./g,'Ierarh'],[/\bAp\./g,'Apostol'],[/[†()]/g,'']];
// grafii alternative reale (BOR / ruse / grecești) pentru aceiași sfinți
const ALT=[[/Parascheva/g,'Paraschiva'],[/Dimitrie, Izvorâtorul de mir/g,'Dumitru'],[/Dimitrie/g,'Dumitru'],[/Gervasie/g,'Ghervasie'],[/Ghervasie/g,'Gervasie'],[/Nicolae/g,'Nicolai'],[/Spiridon/g,'Spiridonu'],[/Ioan Gură de Aur/g,'Ioan Hrisostom'],
 [/Mihail și Gavriil/g,'Mihail, Gavriil'],[/Andrei/g,'Andrei cel Întâi chemat'],[/Ecaterina/g,'Ecaterina din Alexandria'],[/Varvara/g,'Varvara (Barbara)'],[/Sava/g,'Sava cel Sfințit'],[/Filip/g,'Filip apostolul'],
 [/Teodor/g,'Feodor'],[/Gheorghe/g,'Georgie'],[/Iacob/g,'Iacov'],[/Matei/g,'Matia'],[/Hristofor/g,'Cristofor'],[/Eustratie/g,'Evstratie'],[/Eleftherie/g,'Elefterie'],[/Ignatie/g,'Ignațiu']];
let probleme=0, n=0;
for(const [zi,z] of Object.entries(V)){
  let db=z.sfinti; for(const [a,b] of T) db=db.replace(a,b);
  const variante=[db, ALT.reduce((s,[a,b])=>s.replace(a,b),db), db.split(';').reverse().join(';')];
  for(const v of variante){ n++;
    const st=g.pomeniriStraine(v + (z.duminica?'; '+z.duminica:''), z);
    // textul de viață despre fiecare sfânt corect, scris cu denumirea alternativă
    const texte=v.split(';').map(p=>'Viața '+p.trim()+'. A trăit în rugăciune, smerenie și post, iar Biserica îl pomenește în această zi.');
    const ascunse=texte.filter(t=>g.numesteStrain(t,st));
    if(st.length||ascunse.length){probleme++; console.log('PROBLEMĂ',zi,JSON.stringify(st),'|',v.slice(0,160));}
  }
}

// cazul real 11 octombrie (nume din baza de date)
const z11=V['2026-10-11'], db11='Duminica a 21-a după Rusalii (Pilda semănătorului); Sfântul Apostol Filip, unul din cei 7 diaconi; Sfânta Muceniță Zenaida; Sfântul Ierarh Teofan Mărturisitorul, Episcopul Niceei; Soborul Sfinților Stareți de la Optina';
const st11=g.pomeniriStraine(db11,z11);
const caz=[['Sfântul Lev de la Optina a fost stareț.',true],['Sfânta Zenaida a fost doctoriță fără de arginți.',true],
  ['Sfântul Apostol Filip a botezat pe famenul etiopian, după cum spune Sfântul Ioan Gură de Aur.',false],['Sfântul Teofan Mărturisitorul a apărat icoanele.',false]];
for(const [t,asteptat] of caz){ n++; if(g.numesteStrain(t,st11)!==asteptat){probleme++; console.log('PROBLEMĂ 11 oct.:',t);} }
// predica: citatele din Sfinții Părinți rămân; o predică despre un sfânt din afara calendarului e ascunsă
const db1='Sfântul Cuvios Roman Melodul; Sfântul Ioan Cucuzel; Sfânta Sidonia din Georgia', db8='Sfânta Cuvioasă Pelaghia; Sfântul Nou Mucenic Ignatie';
const pred=[[db11,'2026-10-11','Sfântul Ioan Gură de Aur ne spune că sămânța este cuvântul lui Dumnezeu.',false],[db11,'2026-10-11','Să urmăm pilda Sfântului Lev de la Optina.',true],
  [db1,'2026-10-01','Sfântul Ioan Gură de Aur tâlcuiește această Evanghelie.',false],[db8,'2026-10-08','Sfântul Ignatie Teoforul spunea că suntem grâul lui Dumnezeu.',false],
  [db1,'2026-10-01','Sfântul Ioan Cucuzel cânta cu glas îngeresc.',true]];
for(const [d,zi,t,asteptat] of pred){ n++; if(g.numesteStrain(t,g.pomeniriStraine(d,V[zi]),true)!==asteptat){probleme++; console.log('PROBLEMĂ predică',zi,t);} }
console.log(`verificări: ${n} | probleme: ${probleme}`); process.exit(probleme?1:0);
