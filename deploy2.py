import paramiko, os, glob

print('Connecting...')
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('64.90.19.87', username='root', password='RW693xTP9Yid', timeout=10)
print('Connected.')

# Step 1: Create directories on server
print('Creating directories...')
stdin, stdout, stderr = c.exec_command(
    'mkdir -p /var/www/jingxin/css/features /var/www/jingxin/js/features /var/www/jingxin/icons'
)
stdout.read(); stderr.read()

# Step 2: Upload files one by one
local_dir = 'C:/Users/Administrator/jingxin-web'
remote_dir = '/var/www/jingxin'

# Get all files to upload
files_to_upload = []
for root, dirs, files in os.walk(local_dir):
    for f in files:
        local_path = os.path.join(root, f)
        rel_path = os.path.relpath(local_path, local_dir).replace('\\', '/')
        files_to_upload.append((local_path, rel_path))

print(f'Uploading {len(files_to_upload)} files...')

sftp = c.open_sftp()
ok_count = 0
for local_path, rel_path in files_to_upload:
    remote_path = remote_dir + '/' + rel_path
    try:
        sftp.put(local_path, remote_path)
        ok_count += 1
        print(f'  [{ok_count}/{len(files_to_upload)}] {rel_path}')
    except Exception as e:
        print(f'  FAIL [{rel_path}]: {e}')

sftp.close()
print(f'Uploaded {ok_count} files.')

# Step 3: Open firewall & start server on port 8080
print('Configuring firewall & starting server...')

# Kill old processes
c.exec_command('fuser -k 80/tcp 2>/dev/null; fuser -k 8080/tcp 2>/dev/null')

# Try to open port 8080 in firewall
c.exec_command('firewall-cmd --add-port=8080/tcp --permanent 2>/dev/null && firewall-cmd --reload 2>/dev/null; iptables -I INPUT -p tcp --dport 8080 -j ACCEPT 2>/dev/null')

# Start server on port 8080
stdin, stdout, stderr = c.exec_command(
    'cd /var/www/jingxin && nohup python -m SimpleHTTPServer 8080 > /var/log/jingxin8080.log 2>&1 & sleep 3 && curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/anxiety.html'
)
print('HTTP status:', stdout.read().decode().strip())
err = stderr.read().decode()
if err: print('STDERR:', err[:200])

c.close()
print('')
print('=== DEPLOYMENT COMPLETE ===')
print('Visit: http://64.90.19.87:8080/anxiety.html')
print('Full app: http://64.90.19.87:8080/index.html')
