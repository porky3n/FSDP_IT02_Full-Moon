CREATE DATABASE FSDP;
USE FSDP;

-- Create the test table
CREATE TABLE test (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);

-- Insert dummy data into the test table
INSERT INTO test (name) VALUES ('John Doe');
INSERT INTO test (name) VALUES ('Jane Smith');
INSERT INTO test (name) VALUES ('Alice Johnson');
INSERT INTO test (name) VALUES ('Bob Brown');
INSERT INTO test (name) VALUES ('Charlie Davis');