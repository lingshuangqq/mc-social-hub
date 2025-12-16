# User Allowlist Management

This directory contains scripts to manage the employee allowlist for MC Social Hub.

## How to Add New Users

You do **NOT** need to redeploy the application to add users to the allowlist. Just follow these steps:

1.  **Edit CSV**:
    Open `mc-social-hub/backend/scripts/add_employees.csv` and add the new users.
    Format:
    ```csv
    email,name,department
    john.doe@masterconcept.ai,John Doe,Sales
    jane.smith@masterconcept.ai,Jane Smith,IT
    ```

2.  **Run Script**:
    Run the import script from the backend directory.

    **Local Development:**
    ```bash
    cd mc-social-hub/backend
    source venv/bin/activate
    python scripts/import_employees.py
    ```

    **Production (Cloud SQL):**
    You need to connect to the production database.
    1.  Install [Cloud SQL Auth Proxy](https://cloud.google.com/sql/docs/postgres/sql-proxy).
    2.  Start the proxy:
        ```bash
        ./cloud_sql_proxy -instances=gen-media-veo-test:us-central1:mc-social-db-instance=tcp:5432
        ```
    3.  Set environment variables (in a separate terminal):
        ```bash
        export DB_USER=postgres
        export DB_PASSWORD=<YOUR_DB_PASSWORD>
        export DB_NAME=mc_social_db
        export DB_HOST=127.0.0.1
        
        cd mc-social-hub/backend
        python scripts/import_employees.py
        ```

    *Note: The script supports Upsert (Insert or Update).*

## Files

- `import_employees.py`: The main script.
- `add_employees.csv`: The default input file for new users.
- `template_employees.csv`: A template/backup of the initial list.
