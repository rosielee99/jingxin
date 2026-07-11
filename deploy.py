import paramiko, os

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('64.90.19.87', username='root', password='RW693xTP9Yid', timeout=10)

sftp = c.open_sftp()
print('=== Uploading files... ===')

local_dir = r'C:\Users\Administrator\jingxin-web'
remote_dir = '/var/www/jingxin'

for root, dirs, files in os.walk(local_dir):
    rel = os.path.relpath(root, local_dir)
    rpath = (remote_dir + '/' + rel.replace('\\', '/')).rstrip('/')
    try:
        sftp.mkdir(rpath)
    except:
        pass
    for f in files:
        lf = os.path.join(root, f)
        rf = rpath + '/' + f
        try:
            sftp.put(lf, rf)
            print('  OK: ' + rf)
        except Exception as e:
            print('  FAIL: ' + f + ' - ' + str(e))

sftp.close()
print('=== Upload done ===')

print('=== Starting server ===')
stdin, stdout, stderr = c.exec_command(
    'fuser -k 80/tcp 2>/dev/null; '
    'cd /var/www/jingxin && '
    'nohup python -m SimpleHTTPServer 80 > /var/log/jingxin.log 2>&1 & '
    'sleep 2; '
    'curl -s -o /dev/null -w "%{http_code}" http://localhost/anxiety.html'
)
print(stdout.read().decode())
print(stderr.read().decode() if stderr else '')
c.close()
print('=== Done! Visit http://64.90.19.87/anxiety.html ===')
