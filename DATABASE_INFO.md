# Database Connection Info

**⚠️ IMPORTANT: This file contains sensitive credentials. Do NOT commit to public repositories.**

## Cloud SQL Instance
- **Project ID**: `gen-media-veo-test`
- **Region**: `us-central1`
- **Instance Name**: `mc-social-db-instance`
- **Connection Name**: `gen-media-veo-test:us-central1:mc-social-db-instance`

## Credentials
- **User**: `postgres`
- **Password**: `changeme123`
- **Database**: `mc_social_db`

## How to Connect Locally

To connect to this Cloud SQL instance from your local machine (or for the `import_employees.py` script), you need **Cloud SQL Auth Proxy**.

1.  **Install Proxy**:
    ```bash
    curl -o cloud_sql_proxy https://dl.google.com/cloudsql/cloud_sql_proxy.darwin.amd64
    chmod +x cloud_sql_proxy
    ```

2.  **Start Proxy**:
    ```bash
    ./cloud_sql_proxy -instances=gen-media-veo-test:us-central1:mc-social-db-instance=tcp:5432
    ```

3.  **Run Scripts / Connect**:
    Set the environment variable to point to localhost:
    ```bash
    export DATABASE_URL="postgresql+asyncpg://postgres:changeme123@127.0.0.1:5432/mc_social_db"
    
    # Example: Run import script
    cd backend
    python scripts/import_employees.py
    ```
