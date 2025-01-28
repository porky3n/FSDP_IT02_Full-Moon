-- -- Insert more data into Programme table
-- INSERT INTO Programme (ProgrammeName, Category, ProgrammePicture, Description)
-- VALUES 
-- ('Music Workshop', 'Workshop', 'PLACEHOLDER_PROGRAMME_3', 'A workshop to learn basic music skills.'),
-- ('Dance Camp', 'Camp', 'PLACEHOLDER_PROGRAMME_4', 'An immersive dance camp for young dancers.');

-- -- Insert more data into ProgrammeClass table
-- INSERT INTO ProgrammeClass (ProgrammeID, ShortDescription, Location, Fee, MaxSlots, ProgrammeLevel, Remarks)
-- VALUES 
-- (40, 'Intro to Music', 'Music Hall', 60.00, 25, 'Beginner', 'Instruments provided ~ Interactive sessions'),
-- (41, 'Dance Basics', 'Dance Studio', 80.00, 15, 'Intermediate', 'Dance shoes provided ~ Lunch included');

-- -- Insert more data into ProgrammeClassBatch table
-- INSERT INTO ProgrammeClassBatch (ProgrammeClassID)
-- VALUES 
-- (31),
-- (32);

-- -- Insert more data into ProgrammeSchedule table with start dates 3 days from now
-- INSERT INTO ProgrammeSchedule (InstanceID, StartDateTime, EndDateTime)
-- VALUES 
-- (27, DATE_ADD(NOW(), INTERVAL 3 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 3 DAY), INTERVAL 3 HOUR)),
-- (27, DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 5 DAY), INTERVAL 3 HOUR)),
-- (28, DATE_ADD(NOW(), INTERVAL 3 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 3 DAY), INTERVAL 6 HOUR)),
-- (28, DATE_ADD(NOW(), INTERVAL 7 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 7 DAY), INTERVAL 6 HOUR));