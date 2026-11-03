# API database layer

Implement the Access connection pool and repository modules here. This directory must be the only code in the application that imports the ODBC driver or opens the `.accdb` file.

Required implementation rules:
- Parameterized SQL only.
- Access SQL dialect only.
- Central serialized write queue and short transactions.
- Retry transient Access lock errors with bounded backoff.
- Small connection pool.
- Idempotent scan writes keyed by client-generated scan ID.
- No raw biometric templates or decrypted sensitive fields in logs.
