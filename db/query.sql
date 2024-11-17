SELECT 
    department.username AS department_name, 
    role.title AS role_title, 
    role.salary AS role_salary, 
    role.department_id AS department_id,
    employee.first_name AS employee_firstname,
    employee.last_name AS employee_lastname,
    employee.role_id AS employee_id,
    employee.manager_id AS manager_id
FROM role
LEFT JOIN department ON role.department_id = department.id
LEFT JOIN employee ON employee.role_id = role.id
