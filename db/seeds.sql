INSERT INTO department (username)
VALUES ('IT'),
       ('Engineering'),
       ('Legal'),
       ('Media'),
       ('Superhero');

INSERT INTO role (title, salary, department_id)
VALUES ('Lead Cyber Analyst', 120000, 1),
       ('Civil Engineer', 90000, 2),
       ('Lawyer', 100000, 3),
       ('Publicist', 70000, 4),
       ('SHIELD', 200000, 5)
ON CONFLICT (title) DO NOTHING;
      
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ('Tony', 'Stark', 1, NULL),
       ('Bruce', 'Banner', 2, NULL),
       ('Nick', 'Fury', 3, 1),
       ('Peter', 'Parker', 4, NULL),
       ('Barry', 'Allen', 5, NULL);