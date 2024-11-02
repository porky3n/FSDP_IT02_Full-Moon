-- CREATE DATABASE FSDP;
-- USE FSDP;

-- -- Create the test table
-- CREATE TABLE test (
--     id INT PRIMARY KEY IDENTITY(1,1),
--     name NVARCHAR(50) NOT NULL,
--     created_at DATETIME DEFAULT GETDATE()
-- );

-- -- Insert dummy data into the test table
-- INSERT INTO test (name) VALUES ('John Doe');
-- INSERT INTO test (name) VALUES ('Jane Smith');
-- INSERT INTO test (name) VALUES ('Alice Johnson');
-- INSERT INTO test (name) VALUES ('Bob Brown');
-- INSERT INTO test (name) VALUES ('Charlie Davis');

INSERT INTO Programme (ProgrammeName, Category, Location, Description, StartDate, EndDate, Fee, MaxSlots, ProgrammeLevel)
VALUES
    ('Introduction to Digital Marketing', 'Workshop', 'Singapore', 'A beginner-level workshop introducing digital marketing fundamentals.', '2024-11-01', '2024-11-03', 100.00, 20, 'Beginner'),
    ('Advanced Data Analytics', 'Workshop', 'Online', 'An advanced workshop on data analytics techniques using Python.', '2024-12-05', '2024-12-10', 250.00, 15, 'Advanced'),
    ('Intermediate UX Design', 'Workshop', 'Kuala Lumpur', 'An intermediate workshop focused on user experience design principles.', '2024-11-15', '2024-11-17', 150.00, 25, 'Intermediate'),
    ('Cybersecurity Essentials', 'Workshop', 'Jakarta', 'A workshop for beginners to understand cybersecurity threats and defenses.', '2024-11-20', '2024-11-22', 120.00, 30, 'Beginner'),
    ('Project Management Fundamentals', 'Workshop', 'Bangkok', 'An introductory workshop on project management methodologies.', '2024-12-01', '2024-12-03', 130.00, 20, 'Beginner');
