INSERT INTO allowed_emails (email, name, created_at, updated_at)
VALUES 
    ('qi.zhuang@hkmci.com', 'Qi Zhuang', NOW(), NOW()),
    ('steven.zheng@masterconcept.ai', 'Steven Zheng', NOW(), NOW()),
    ('yankel.yang@hkmci.com', 'Yankel Yang', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
