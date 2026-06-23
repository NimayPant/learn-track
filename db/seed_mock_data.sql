-- Batch insert for students
INSERT ALL
  INTO students (first_name, last_name, email) VALUES ('Aarav', 'Sharma', 'aarav.sharma@gmail.com')
  INTO students (first_name, last_name, email) VALUES ('Priya', 'Iyer', 'priya.iyer@yahoo.com')
SELECT 1 FROM DUAL;

-- Batch insert for activities
INSERT ALL
  INTO activities (name, category, max_points) VALUES ('Math Quiz', 'Quiz', 20)
  INTO activities (name, category, max_points) VALUES ('Science Project', 'Project', 50)
  INTO activities (name, category, max_points) VALUES ('Attendance', 'Participation', 10)
SELECT 1 FROM DUAL;

-- Teachers mock data
INSERT ALL
  INTO teachers (first_name, last_name, email) VALUES ('Arnav', 'Bansal', 'arnav.bansal@school.edu')
  INTO teachers (first_name, last_name, email) VALUES ('Ananya', 'Pant', 'pant.ananya123@school.edu')
SELECT 1 FROM DUAL;

-- Courses mock data using subqueries to avoid hardcoded IDs
INSERT INTO courses (name, description, teacher_id) 
SELECT 'Introduction to Math', 'Basic mathematics', id FROM teachers WHERE email = 'arnav.bansal@school.edu';

INSERT INTO courses (name, description, teacher_id) 
SELECT 'Advanced Physics', 'Complex mechanics', id FROM teachers WHERE email = 'pant.ananya123@school.edu';

-- Enrollments mock data using subqueries for relationships
INSERT INTO course_enrollments (student_id, course_id)
SELECT s.id, c.id 
FROM students s
CROSS JOIN courses c 
WHERE s.email = 'aarav.sharma@gmail.com' AND c.name = 'Introduction to Math';

INSERT INTO course_enrollments (student_id, course_id)
SELECT s.id, c.id 
FROM students s
CROSS JOIN courses c 
WHERE s.email = 'priya.iyer@yahoo.com' AND c.name = 'Advanced Physics';

COMMIT;
