# Test fără publicare: rulează pre-randarea de pe main cu datele reale de azi. Nu împinge nimic.
import subprocess, os
os.makedirs('out',exist_ok=True)
subprocess.run(['git','clone','-q','--depth','1','https://github.com/Ciprian1977/povesti-de-credinta.git','/tmp/pr'],check=True)
r=subprocess.run(['python','scripts/prerandare/prerandeaza.py'],cwd='/tmp/pr',capture_output=True,text=True)
d=subprocess.run(['git','diff','--stat'],cwd='/tmp/pr',capture_output=True,text=True).stdout
open('out/productie.txt','w').write(r.stdout+r.stderr[-1500:]+'\n'+d)
