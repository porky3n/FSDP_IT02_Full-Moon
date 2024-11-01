INSERT INTO Account (Email, PasswordHashed, AccountType, CreatedAt) 
VALUES 
('parent@example.com', '$2a$10$.dscA5Fja5puF70mD0n2mua.Psz1pmIEsiZ9ugFFVycFnFARr9WpC', 'P', NOW()),
('admin@example.com', '$2a$10$.dscA5Fja5puF70mD0n2mua.Psz1pmIEsiZ9ugFFVycFnFARr9WpC', 'A', NOW());