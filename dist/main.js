"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer_1 = __importDefault(require("inquirer"));
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pool = new pg_1.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432', 10),
});
pool.connect()
    .then(() => console.log('Connected to the database'))
    .catch((err) => console.error('Connection error', err.stack));
function startApp() {
    return __awaiter(this, void 0, void 0, function* () {
        const { action } = yield inquirer_1.default.prompt([
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
                    'Exit'
                ]
            }
        ]);
        switch (action) {
            case `View All`:
                yield viewAll();
                break;
            case 'View all departments':
                yield viewDepartments();
                break;
            case 'View all roles':
                yield viewRoles();
                break;
            case 'View all employees':
                yield viewEmployees();
                break;
            case 'Add a department':
                yield addDepartment();
                break;
            case 'Add a role':
                yield addRole();
                break;
            case 'Add an employee':
                yield addEmployee();
                break;
            case 'Delete an department':
                yield deleteDepartment();
                break;
            case 'Delete an role':
                yield deleteRole();
                break;
            case 'Delete an employee':
                yield deleteEmployee();
                break;
            case 'Exit':
                pool.end();
                process.exit(0);
                break;
        }
        startApp();
    });
}
// Function to view all departments, roles, and employees
function viewAll() {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield pool.query('SELECT department.username AS department_name, role.title AS role_title, role.salary AS role_salary, role.department_id AS department_id, employee.first_name AS  employee_firstname, employee.last_name AS employee_lastname, employee.role_id AS employee_id, employee.manager_id AS manager_id FROM role LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee ON employee.role_id = role.id');
        console.table(res.rows);
    });
}
// Function to view all departments
function viewDepartments() {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield pool.query('SELECT * FROM department');
        console.table(res.rows);
    });
}
// Function to view all roles
function viewRoles() {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield pool.query('SELECT * FROM role');
        console.table(res.rows);
    });
}
// Function to view all employees
function viewEmployees() {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield pool.query('SELECT * FROM employee');
        console.table(res.rows);
    });
}
// Function to add an department
function addDepartment() {
    return __awaiter(this, void 0, void 0, function* () {
        const { name } = yield inquirer_1.default.prompt([
            { type: 'input', name: 'name', message: 'Enter department name:' }
        ]);
        yield pool.query('INSERT INTO department (username) VALUES ($1)', [name]);
        console.log('Department added successfully');
    });
}
// Function to add an role
function addRole() {
    return __awaiter(this, void 0, void 0, function* () {
        const departments = yield pool.query('SELECT * FROM department');
        const departmentChoices = departments.rows.map(dept => ({ name: dept.username, value: dept.id }));
        const answers = yield inquirer_1.default.prompt([
            { type: 'input', name: 'title', message: 'Role Name:' },
            { type: 'input', name: 'salary', message: 'Role Salary:' },
            { type: 'list', name: 'department_id', message: 'Role Department:', choices: departmentChoices }
        ]);
        yield pool.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', [answers.title, answers.salary, answers.department_id]);
        console.log('Role added successfully');
    });
}
// Function to add an employee
function addEmployee() {
    return __awaiter(this, void 0, void 0, function* () {
        const roles = yield pool.query('SELECT * FROM role');
        const roleChoices = roles.rows.map(role => ({ name: role.title, value: role.id }));
        const employees = yield pool.query('SELECT * FROM employee');
        const managerChoices = employees.rows.map(emp => ({ name: `${emp.first_name} ${emp.last_name}`, value: emp.id }));
        managerChoices.unshift({ name: 'None', value: null });
        const answers = yield inquirer_1.default.prompt([
            { type: 'input', name: 'first_name', message: 'Employees first-name:' },
            { type: 'input', name: 'last_name', message: 'Employees last-name:' },
            { type: 'list', name: 'role_id', message: 'Employees role:', choices: roleChoices },
            { type: 'list', name: 'manager_id', message: 'Select manager:', choices: managerChoices }
        ]);
        yield pool.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', [answers.first_name, answers.last_name, answers.role_id, answers.manager_id]);
        console.log('Employee added successfully');
    });
}
// Function to delete a department
function deleteDepartment() {
    return __awaiter(this, void 0, void 0, function* () {
        const { id } = yield inquirer_1.default.prompt([
            {
                type: 'input',
                name: 'id',
                message: 'Enter the ID of the department to delete:',
            },
        ]);
        yield pool.query('DELETE FROM department WHERE id = $1', [id]);
        console.log(`Department deleted.`);
    });
}
// Function to delete a role
function deleteRole() {
    return __awaiter(this, void 0, void 0, function* () {
        const { id } = yield inquirer_1.default.prompt([
            {
                type: 'input',
                name: 'id',
                message: 'Enter the ID of the role to delete:',
            },
        ]);
        yield pool.query('DELETE FROM role WHERE id = $1', [id]);
        console.log(`Role deleted.`);
    });
}
// Function to delete an employee
function deleteEmployee() {
    return __awaiter(this, void 0, void 0, function* () {
        const { id } = yield inquirer_1.default.prompt([
            {
                type: 'input',
                name: 'id',
                message: 'Enter the ID of the employee to delete:',
            },
        ]);
        yield pool.query('DELETE FROM employee WHERE id = $1', [id]);
        console.log(`Employee deleted.`);
    });
}
startApp();
