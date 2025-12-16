INSERT INTO allowed_emails (email, name, created_at, updated_at)
VALUES ('joe.wang@masterconcept.ai', 'Joe Wang', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
