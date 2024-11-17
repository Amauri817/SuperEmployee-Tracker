import inquirer from 'inquirer';
import { Pool  } from 'pg';
import dotenv from 'dotenv';

dotenv.config();


const pool  = new Pool ({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432', 10),
});

pool.connect()
    .then(() => console.log('Connected to the database'))
    .catch((err) => console.error('Connection error', err.stack));

    async function startApp() {
        const { action } = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'What would you like to do?',
                choices: [
                    'View All',
                    'View all departments',
                    'View all roles',
                    'View all employees',
                    'Add a department',
                    'Add a role',
                    'Add an employee',
                    'Delete an department',
                    'Delete an role',
                    'Delete an employee',
                    'Update an employees role',
                    'Exit'
                ]
            }
        ]);
    
        switch (action) {
            case `View All`:
                await viewAll();
                break;
            case 'View all departments':
                await viewDepartments();
                break;
            case 'View all roles':
                await viewRoles();
                break;
            case 'View all employees':
                await viewEmployees();
                break;
            case 'Add a department':
                await addDepartment();
                break;
            case 'Add a role':
                await addRole();
                break;
            case 'Add an employee':
                await addEmployee();
                break;
            case 'Delete an department':
                await deleteDepartment();
                break;
            case 'Delete an role':
                await deleteRole();
                break;
            case 'Delete an employee':
                await deleteEmployee();
                break;
            case `Update an employee's role`:
                await updateEmployeeRole();
                break;
            case 'Exit':
                pool.end();
                process.exit(0);
                break;
        }
    
        startApp();
    }
    
    // Function to view all departments, roles, and employees
    async function viewAll() {
        const res = await pool.query('SELECT department.username AS department_name, role.title AS role_title, role.salary AS role_salary, role.department_id AS department_id, employee.first_name AS  employee_firstname, employee.last_name AS employee_lastname, employee.role_id AS employee_id, employee.manager_id AS manager_id FROM role LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee ON employee.role_id = role.id');
        console.table(res.rows);
    }

    // Function to view all departments
    async function viewDepartments() {
        const res = await pool.query('SELECT * FROM department');
        console.table(res.rows);
    }
    
    // Function to view all roles
    async function viewRoles() {
        const res = await pool.query('SELECT * FROM role');
        console.table(res.rows);
    }
    
    // Function to view all employees
    async function viewEmployees() {
        const res = await pool.query('SELECT * FROM employee');
        console.table(res.rows);
    }
    
    // Function to add an department
    async function addDepartment() {
        const { name } = await inquirer.prompt([
            { type: 'input', name: 'name', message: 'Enter department name:' }
        ]);
    
        await pool.query('INSERT INTO department (username) VALUES ($1)', [name]);
        console.log('Department added successfully');
    }
    
    // Function to add an role
    async function addRole() {
        const departments = await pool.query('SELECT * FROM department');
        const departmentChoices = departments.rows.map(dept => ({ name: dept.username, value: dept.id }));
    
        const answers = await inquirer.prompt([
            { type: 'input', name: 'title', message: 'Role Name:' },
            { type: 'input', name: 'salary', message: 'Role Salary:' },
            { type: 'list', name: 'department_id', message: 'Role Department:', choices: departmentChoices }
        ]);
    
        await pool.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', [answers.title, answers.salary, answers.department_id]);
        console.log('Role added successfully');
    }
    
    // Function to add an employee
    async function addEmployee() {
        const roles = await pool.query('SELECT * FROM role');
        const roleChoices = roles.rows.map(role => ({ name: role.title, value: role.id }));
    
        const employees = await pool.query('SELECT * FROM employee');
        const managerChoices = employees.rows.map(emp => ({ name: `${emp.first_name} ${emp.last_name}`, value: emp.id }));
        managerChoices.unshift({ name: 'None', value: null });
    
        const answers = await inquirer.prompt([
            { type: 'input', name: 'first_name', message: 'Employees first-name:' },
            { type: 'input', name: 'last_name', message: 'Employees last-name:' },
            { type: 'list', name: 'role_id', message: 'Employees role:', choices: roleChoices },
            { type: 'list', name: 'manager_id', message: 'Select manager:', choices: managerChoices }
        ]);
    
        await pool.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', [answers.first_name, answers.last_name, answers.role_id, answers.manager_id]);
        console.log('Employee added successfully');
    }

        // Function to delete a department
        async function deleteDepartment() {
            const { id } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'id',
                    message: 'Enter the ID of the department to delete:',
                },
            ]);
            await pool.query('DELETE FROM department WHERE id = $1', [id]);
            console.log(`Department deleted.`);
        }

        // Function to delete a role
        async function deleteRole() {
            const { id } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'id',
                    message: 'Enter the ID of the role to delete:',
                },
            ]);
            await pool.query('DELETE FROM role WHERE id = $1', [id]);
            console.log(`Role deleted.`);
        }
            
        // Function to delete an employee
        async function deleteEmployee() {
            const { id } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'id',
                    message: 'Enter the ID of the employee to delete:',
                },
            ]);
            await pool.query('DELETE FROM employee WHERE id = $1', [id]);
            console.log(`Employee deleted.`);
        }
    
    async function updateEmployeeRole() {
        const employees = await pool.query('SELECT * FROM employee');
        const employeeChoices = employees.rows.map(emp => ({ name: `${emp.first_name} ${emp.last_name}`, value: emp.id }));
    
        const roles = await pool.query('SELECT * FROM role');
        const roleChoices = roles.rows.map(role => ({ name: role.title, value: role.id }));
    
        const answers = await inquirer.prompt([
            { type: 'list', name: 'employee_id', message: 'Select employee:', choices: employeeChoices },
            { type: 'list', name: 'role_id', message: 'Select new role:', choices: roleChoices }
        ]);
    
        await pool.query('UPDATE employee SET role_id = $1 WHERE id = $2', [answers.role_id, answers.employee_id]);
        console.log('Employee role updated successfully');
    }
    
    startApp();