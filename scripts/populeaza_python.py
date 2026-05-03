#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Populare inițială Supabase cu date ortodoxe pentru 30 de zile.
Folosește OpenAI API (gpt-4.1-mini) pentru generarea conținutului.
"""

import os
import json
import time
import datetime
import requests
from openai import OpenAI

SUPABASE_URL = 'https://smuqpipxeotkbttolivp.supabase.co'
SUPABASE_SERVICE_KEY = os.environ.get('SUPABASE_SERVICE_KEY', '')
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')

client = OpenAI(api_key=OPENAI_API_KEY)

CALENDAR_STATIC = {
    '01-01': {'sfant': 'Tăierea împrejur cea după trup a Domnului; Sfântul Vasile cel Mare', 'post': 'dezlegare', 'culoare': 'alb'},
    '01-06': {'sfant': 'Botezul Domnului (Boboteaza)', 'post': 'dezlegare', 'culoare': 'alb'},
    '01-30': {'sfant': 'Sfinții Trei Ierarhi: Vasile cel Mare, Grigorie Teologul și Ioan Gură de Aur', 'post': 'dezlegare', 'culoare': 'alb'},
    '02-02': {'sfant': 'Întâmpinarea Domnului', 'post': 'dezlegare', 'culoare': 'alb'},
    '03-25': {'sfant': 'Buna Vestire a Maicii Domnului', 'post': 'dezlegare_peste', 'culoare': 'alb'},
    '04-23': {'sfant': 'Sfântul Mare Mucenic Gheorghe, purtătorul de biruință', 'post': 'dezlegare', 'culoare': 'rosu'},
    '05-01': {'sfant': 'Sfântul Prooroc Ieremia', 'post': 'post', 'culoare': 'verde'},
    '05-02': {'sfant': 'Sfântul Atanasie cel Mare, arhiepiscopul Alexandriei', 'post': 'post', 'culoare': 'alb'},
    '05-03': {'sfant': 'Sfinții Mucenici Timotei și Mavra', 'post': 'dezlegare', 'culoare': 'rosu'},
    '05-04': {'sfant': 'Cuvioasa Pelaghia din Tars', 'post': 'post', 'culoare': 'alb'},
    '05-05': {'sfant': 'Sfânta Mare Muceniță Irina', 'post': 'dezlegare', 'culoare': 'rosu'},
    '05-06': {'sfant': 'Dreptul Iov cel mult pătimitor', 'post': 'post', 'culoare': 'alb'},
    '05-07': {'sfant': 'Arătarea Sfintei Cruci pe cerul Ierusalimului', 'post': 'dezlegare', 'culoare': 'alb'},
    '05-08': {'sfant': 'Sfântul Apostol și Evanghelist Ioan Teologul', 'post': 'post', 'culoare': 'alb'},
    '05-09': {'sfant': 'Sfântul Prooroc Isaia; Sfântul Mucenic Hristofor', 'post': 'dezlegare_peste', 'culoare': 'verde'},
    '05-10': {'sfant': 'Sfântul Apostol Simon Zilotul', 'post': 'dezlegare', 'culoare': 'alb'},
    '05-11': {'sfant': 'Sfinții Egali cu Apostolii Chiril și Metodie', 'post': 'post', 'culoare': 'alb'},
    '05-12': {'sfant': 'Sfântul Epifanie al Ciprului; Sfântul German al Constantinopolului', 'post': 'dezlegare', 'culoare': 'alb'},
    '05-13': {'sfant': 'Sfânta Muceniță Glicheria', 'post': 'post', 'culoare': 'rosu'},
    '05-14': {'sfant': 'Sfântul Mucenic Isidor din Hio', 'post': 'dezlegare', 'culoare': 'rosu'},
    '05-15': {'sfant': 'Sfântul Pahomie cel Mare', 'post': 'post', 'culoare': 'verde'},
    '05-16': {'sfant': 'Sfântul Teodor Sfințitul', 'post': 'dezlegare', 'culoare': 'verde'},
    '05-17': {'sfant': 'Sfântul Apostol Andronic și Sfânta Ionia', 'post': 'post', 'culoare': 'alb'},
    '05-18': {'sfant': 'Sfântul Mucenic Teodot din Ancira', 'post': 'dezlegare', 'culoare': 'rosu'},
    '05-19': {'sfant': 'Sfântul Patrichie al Prusiei și cei împreună cu el', 'post': 'post', 'culoare': 'alb'},
    '05-20': {'sfant': 'Sfântul Mucenic Talaleleu', 'post': 'dezlegare', 'culoare': 'rosu'},
    '05-21': {'sfant': 'Sfinții Împărați întocmai cu Apostolii Constantin și Elena', 'post': 'post', 'culoare': 'alb'},
    '05-22': {'sfant': 'Sfântul Vasile Episcopul Amasiei', 'post': 'dezlegare', 'culoare': 'rosu'},
    '05-23': {'sfant': 'Sfântul Mihail Mărturisitorul, Episcopul Sinadei', 'post': 'post', 'culoare': 'alb'},
    '05-24': {'sfant': 'Sfântul Simeon cel din Muntele Minunat', 'post': 'dezlegare', 'culoare': 'verde'},
    '05-25': {'sfant': 'A treia aflare a Capului Sfântului Ioan Botezătorul', 'post': 'post', 'culoare': 'alb'},
    '05-26': {'sfant': 'Sfântul Apostol Carp', 'post': 'dezlegare', 'culoare': 'alb'},
    '05-27': {'sfant': 'Sfântul Ioan cel Nou de la Suceava', 'post': 'post', 'culoare': 'rosu'},
    '05-28': {'sfant': 'Sfântul Eutihie Patriarhul Constantinopolului', 'post': 'dezlegare', 'culoare': 'alb'},
    '05-29': {'sfant': 'Sfânta Muceniță Teodosia fecioara', 'post': 'post', 'culoare': 'rosu'},
    '05-30': {'sfant': 'Sfântul Isaac Dalmatinul', 'post': 'dezlegare', 'culoare': 'verde'},
    '05-31': {'sfant': 'Sfântul Ermie Mucenicul', 'post': 'post', 'culoare': 'rosu'},
    '06-01': {'sfant': 'Sfântul Iustin Martirul și Filosoful', 'post': 'dezlegare', 'culoare': 'rosu'},
    '06-02': {'sfant': 'Sfântul Nichifor Mărturisitorul, Patriarhul Constantinopolului', 'post': 'post', 'culoare': 'alb'},
    '06-03': {'sfant': 'Sfinții Mucenici Luchilian și cei împreună cu el', 'post': 'dezlegare', 'culoare': 'rosu'},
    '06-24': {'sfant': 'Nașterea Sfântului Ioan Botezătorul', 'post': 'dezlegare', 'culoare': 'alb'},
    '06-29': {'sfant': 'Sfinții Apostoli Petru și Pavel', 'post': 'dezlegare', 'culoare': 'alb'},
    '07-20': {'sfant': 'Sfântul Prooroc Ilie Tesviteanul', 'post': 'dezlegare', 'culoare': 'alb'},
    '08-06': {'sfant': 'Schimbarea la Față a Domnului', 'post': 'dezlegare_peste', 'culoare': 'alb'},
    '08-15': {'sfant': 'Adormirea Maicii Domnului', 'post': 'dezlegare', 'culoare': 'alb'},
    '09-08': {'sfant': 'Nașterea Maicii Domnului', 'post': 'dezlegare', 'culoare': 'alb'},
    '09-14': {'sfant': 'Înălțarea Sfintei Cruci', 'post': 'post', 'culoare': 'rosu'},
    '10-14': {'sfant': 'Cuvioasa Parascheva de la Iași', 'post': 'dezlegare', 'culoare': 'alb'},
    '11-08': {'sfant': 'Soborul Sfinților Arhangheli Mihail și Gavriil', 'post': 'dezlegare', 'culoare': 'alb'},
    '11-30': {'sfant': 'Sfântul Apostol Andrei, cel Întâi chemat, Ocrotitorul României', 'post': 'dezlegare', 'culoare': 'alb'},
    '12-06': {'sfant': 'Sfântul Ierarh Nicolae, arhiepiscopul Mirelor Lichiei', 'post': 'dezlegare', 'culoare': 'alb'},
    '12-25': {'sfant': 'Nașterea Domnului nostru Iisus Hristos (Crăciunul)', 'post': 'dezlegare', 'culoare': 'alb'},
}

def get_sfant_default(data_str):
    key = data_str[5:]  # MM-DD
    if key in CALENDAR_STATIC:
        return CALENDAR_STATIC[key]
    d = datetime.date.fromisoformat(data_str)
    zi = d.weekday()  # 0=Luni, 2=Miercuri, 4=Vineri
    post = 'post' if zi in [2, 4] else 'dezlegare'
    return {'sfant': 'Sfânt din Sinaxarul BOR', 'post': post, 'culoare': 'alb'}

def verifica_exista(data_str):
    resp = requests.get(
        f'{SUPABASE_URL}/rest/v1/zile_ortodoxe?data=eq.{data_str}&limit=1',
        headers={
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
            'Accept': 'application/json'
        }
    )
    data = resp.json()
    return len(data) > 0

def salveaza_in_supabase(data_str, continut):
    record = {'data': data_str, **continut}
    resp = requests.post(
        f'{SUPABASE_URL}/rest/v1/zile_ortodoxe',
        headers={
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
        },
        json=record
    )
    if resp.status_code not in [200, 201]:
        raise Exception(f'Supabase error {resp.status_code}: {resp.text[:200]}')
    return True

def genereaza_zi(data_str):
    info = get_sfant_default(data_str)
    sfant = info['sfant']
    tip_post = info['post']
    
    prompt = f"""Ești un preot ortodox român erudit. Generează conținut pentru calendarul ortodox pentru data {data_str}.
Sfântul principal: {sfant}. Tip post: {tip_post}.
Răspunde DOAR cu JSON valid, fără alte texte, cu diacritice românești corecte (ă, â, î, ș, ț).

{{
  "sfant_nume": "numele complet conform Sinaxarului BOR",
  "sfant_viata": "viața sfântului în 250-280 cuvinte cu evlavie și date istorice exacte",
  "tropar": "troparul complet al sfântului cu glasul indicat",
  "tip_post": "{tip_post}",
  "culoare_liturgica": "alb sau rosu sau verde sau violet sau negru",
  "rugaciunea_zilei": "rugăciune ortodoxă completă de 60-80 cuvinte potrivită zilei",
  "sinaxar": "sinaxarul zilei în 200-220 cuvinte cu toți sfinții zilei",
  "apostol_carte": "cartea Apostolului (ex: Romani, Galateni, Fapte)",
  "apostol_versete": "versetele exacte (ex: 8:1-14)",
  "apostol_text": "textul complet al Apostolului zilei conform lectinarului ortodox",
  "evanghelie_carte": "cartea Evangheliei (ex: Ioan, Matei, Luca, Marcu)",
  "evanghelie_versete": "versetele exacte (ex: 1:1-17)",
  "evanghelie_text": "textul complet al Evangheliei zilei conform lectinarului ortodox",
  "predica": "predică de 150-170 cuvinte bazată pe Evanghelia zilei cu aplicare practică",
  "cuvant_folos": "citat patristic autentic cu sursa exactă (Sfântul Nume, titlul operei)",
  "sfinti_secundari": "alți sfinți prăznuiți în această zi, separați prin punct și virgulă",
  "meta_description": "descriere SEO de exact 155 caractere cu sfântul și data"
}}"""

    response = client.chat.completions.create(
        model='gpt-4.1-mini',
        messages=[
            {'role': 'system', 'content': 'Ești un preot ortodox român erudit. Răspunzi DOAR cu JSON valid, fără alte texte. Folosești diacritice românești corecte.'},
            {'role': 'user', 'content': prompt}
        ],
        temperature=0.3,
        max_tokens=2500
    )
    
    continut_raw = response.choices[0].message.content.strip()
    # Curăță markdown dacă există
    continut_raw = continut_raw.replace('```json', '').replace('```', '').strip()
    return json.loads(continut_raw)

def main():
    nr_zile = 30
    print(f'✝️  Populare inițială Supabase — {nr_zile} zile')
    print('=' * 50)
    
    azi = datetime.date.today()
    success = 0
    skip = 0
    errors = 0
    
    for i in range(nr_zile):
        d = azi + datetime.timedelta(days=i)
        data_str = d.isoformat()
        
        # Verifică dacă există deja
        if verifica_exista(data_str):
            print(f'⏭️  {data_str} — deja există, skip')
            skip += 1
            continue
        
        try:
            print(f'\n📿 Generez {data_str} ({i+1}/{nr_zile})...')
            continut = genereaza_zi(data_str)
            salveaza_in_supabase(data_str, continut)
            print(f'✅ {data_str} — {continut.get("sfant_nume", "?")}')
            success += 1
            
            # Pauză pentru rate limiting
            if i < nr_zile - 1:
                time.sleep(2)
                
        except Exception as e:
            print(f'❌ {data_str} — Eroare: {str(e)[:100]}')
            errors += 1
            # Fallback minimal
            try:
                info = get_sfant_default(data_str)
                fallback = {
                    'sfant_nume': info['sfant'],
                    'tip_post': info['post'],
                    'culoare_liturgica': info.get('culoare', 'alb'),
                    'meta_description': f"Calendar ortodox {data_str}: {info['sfant'][:100]}."
                }
                salveaza_in_supabase(data_str, fallback)
                print(f'   ↳ Fallback salvat')
            except Exception as e2:
                print(f'   ↳ Fallback eșuat: {e2}')
            
            time.sleep(3)
    
    print('\n' + '=' * 50)
    print(f'✅ Finalizat: {success} generate, {skip} existente, {errors} erori')

if __name__ == '__main__':
    main()
