import paramiko
import os
from stat import S_ISDIR

def deploy():
    host = "213.199.34.94"
    user = "root"
    passw = "Behruz@1"
    
    local_sql = "backup.sql"
    remote_path = "/opt/bloggers"
    
    print(f"--- CONNECTING TO {host} ---")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        ssh.connect(host, username=user, password=passw)
        print("SSH Connection Successful!")

        # 1. Update from GitHub
        print("UPDATING CODE FROM GITHUB...")
        stdin, stdout, stderr = ssh.exec_command(f"cd {remote_path} && git pull && docker compose up -d --build")
        print(stdout.read().decode())
        err = stderr.read().decode()
        if err: print(f"Error (if any): {err}")

        # 2. Upload SQL
        print("UPLOADING SQL DUMP...")
        sftp = ssh.open_sftp()
        sftp.put(local_sql, f"{remote_path}/backup.sql")
        print("SQL Uploaded.")

        # 3. Synchronize Database
        print("INJECTING DATA INTO POSTGRES...")
        # Note: we use cat | docker exec -i
        command = f"cat {remote_path}/backup.sql | docker exec -i blogger-awards-db psql -U postgres blogger_awards"
        stdin, stdout, stderr = ssh.exec_command(command)
        print(stdout.read().decode())
        print("Database sync complete.")

        # 4. Upload Photos (recursive)
        print("SYNCHRONIZING PHOTOS (uploads)...")
        def put_dir(local_dir, remote_dir):
            for item in os.listdir(local_dir):
                if os.path.isfile(os.path.join(local_dir, item)):
                    sftp.put(os.path.join(local_dir, item), f"{remote_dir}/{item}")
                elif os.path.isdir(os.path.join(local_dir, item)):
                    try:
                        sftp.mkdir(f"{remote_dir}/{item}")
                    except IOError: pass # exists
                    put_dir(os.path.join(local_dir, item), f"{remote_dir}/{item}")

        local_uploads = "uploads"
        remote_uploads = f"{remote_path}/backend/uploads"
        # Ensure remote dir exists
        try:
            sftp.mkdir(remote_uploads)
        except IOError: pass
        
        if os.path.exists(local_uploads):
            put_dir(local_uploads, remote_uploads)
            print("Photos sync complete.")
        else:
            print("No local photos found to upload.")

        sftp.close()
        ssh.close()
        print("--- ALL DONE! DEPLOY SUCCESSFUL ---")

    except Exception as e:
        print(f"DEPLOY FAILED: {str(e)}")

if __name__ == "__main__":
    deploy()
