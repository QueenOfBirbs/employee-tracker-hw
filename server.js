// dependencies
const mysql = require('mysql');
const inquirer = require('inquirer');
const consoleTable = require('console.table');
const util = require('util');

// connects to workbench
let connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'password',
    database: 'employee_DB'
});

connection.query = util.promisify(connection.query);

// starts application after connecting
connection.connect(function (err) {
    if (err) throw err;
    askUser();
})

// welcome message
console.table(
    "\n------------ EMPLOYEE TRACKER ------------\n"
)

// asks the user what they want to do
const askUser = async () => {
    try {
        let answer = await inquirer.prompt({
            name: 'action',
            type: 'list',
            message: 'What would you like to do?',
            choices: [
                'View Employees',
                'View Departments',
                'View Roles',
                'Add Employees',
                'Add Departments',
                'Add Roles',
                'Update Employee Role',
                'Exit'
            ]
        });
        switch (answer.action) {
            case 'View Employees':
                viewEmployee();
                break;

            case 'View Departments':
                viewDepartment();
                break;

            case 'View Roles':
                viewRole();
                break;

            case 'Add Employees':
                addEmployee();
                break

            case 'Add Departments':
                addDepartment();
                break

            case 'Add Roles':
                addRole();
                break

            case 'Update Employee Role':
                updateEmployee();
                break

            case 'Exit':
                connection.end();
                break;
        };
    } catch (err) {
        console.log(err);
        askUser();
    };
}

// view all employees
const viewEmployee = async () => {
    console.log('Employee View');
    try {
        let query = 'SELECT * FROM employee';
        connection.query(query, function (err, res) {
            if (err) throw err;
            let employeeArray = [];
            res.forEach(employee => employeeArray.push(employee));
            console.table(employeeArray);
            askUser();
        });
    } catch (err) {
        console.log(err);
        askUser();
    };
}

// view all departments
constviewDepartment = async () => {
    console.log('Department View');
    try {
        let query = 'SELECT * FROM department';
        connection.query(query, function (err, res) {
            if (err) throw err;
            let departmentArray = [];
            res.forEach(department => departmentArray.push(department));
            console.table(departmentArray);
            askUser();
        });
    } catch (err) {
        console.log(err);
        askUser();
    };
}

// views all roles
const viewRole = async () => {
    console.log('Role View');
    try {
        let query = 'SELECT * FROM role';
        connection.query(query, function (err, res) {
            if (err) throw err;
            let roleArray = [];
            res.forEach(role => roleArray.push(role));
            console.table(roleArray);
            askUser();
        });
    } catch (err) {
        console.log(err);
        askUser();
    };
}

// adding a new employee
const addEmployee = async () => {
    try {
        console.log('Employee Add');

        let roles = await connection.query("SELECT * FROM role");

        let managers = await connection.query("SELECT * FROM employee");

        let answer = await inquirer.prompt([
            {
                name: 'firstName',
                type: 'input',
                message: 'What is the first name of this Employee?'
            },
            {
                name: 'lastName',
                type: 'input',
                message: 'What is the last name of this Employee?'
            },
            {
                name: 'employeeRoleId',
                type: 'list',
                choices: roles.map((role) => {
                    return {
                        name: role.title,
                        value: role.id
                    }
                }),
                message: "What is this Employee's role id?"
            },
            {
                name: 'employeeManagerId',
                type: 'list',
                choices: managers.map((manager) => {
                    return {
                        name: manager.first_name + " " + manager.last_name,
                        value: manager.id
                    }
                }),
                message: "What is this Employee's Manager's Id?"
            }
        ])

        let result = await connection.query("INSERT INTO employee SET ?", {
            first_name: answer.firstName,
            last_name: answer.lastName,
            role_id: (answer.employeeRoleId),
            manager_id: (answer.employeeManagerId)
        });

        console.log(`${answer.firstName} ${answer.lastName} added successfully.\n`);
        askUser();

    } catch (err) {
        console.log(err);
        askUser();
    };
}

// adding a new department
const addDepartment = async () => {
    try {
        console.log('Department Add');

        let answer = await inquirer.prompt([
            {
                name: 'deptName',
                type: 'input',
                message: 'What is the name of your new department?'
            }
        ]);

        let result = await connection.query("INSERT INTO department SET ?", {
            department_name: answer.deptName
        });

        console.log(`${answer.deptName} added successfully to departments.\n`)
        askUser();

    } catch (err) {
        console.log(err);
        askUser();
    };
}

// adding a new role
const addRole = async () => {
    try {
        console.log('Role Add');

        let departments = await connection.query("SELECT * FROM department")

        let answer = await inquirer.prompt([
            {
                name: 'title',
                type: 'input',
                message: 'What is the name of your new role?'
            },
            {
                name: 'salary',
                type: 'input',
                message: 'What salary will this role provide?'
            },
            {
                name: 'departmentId',
                type: 'list',
                choices: departments.map((departmentId) => {
                    return {
                        name: departmentId.department_name,
                        value: departmentId.id
                    }
                }),
                message: 'What department ID is this role associated with?',
            }
        ]);

        let departmentChoice;
        for (i = 0; i < departments.length; i++) {
            if (departments[i].department_id === answer.choice) {
                departmentChoice = departments[i];
            };
        }
        let result = await connection.query("INSERT INTO role SET ?", {
            title: answer.title,
            salary: answer.salary,
            department_id: answer.departmentId
        })

        console.log(`${answer.title} role added successfully.\n`)
        askUser();

    } catch (err) {
        console.log(err);
        askUser();
    };
}

//updating the employee stats
const updateEmployee = async () => {
    try {
        console.log('Employee Update');

        let employees = await connection.query("SELECT * FROM employee");

        let employeeChoice = await inquirer.prompt([
            {
                name: 'employee',
                type: 'list',
                choices: employees.map((employeeName) => {
                    return {
                        name: employeeName.first_name + " " + employeeName.last_name,
                        value: employeeName.id
                    }
                }),
                message: 'Please choose an employee to update.'
            }
        ]);

        let roles = await connection.query("SELECT * FROM role");

        let roleChoice = await inquirer.prompt([
            {
                name: 'role',
                type: 'list',
                choices: roles.map((roleName) => {
                    return {
                        name: roleName.title,
                        value: roleName.id
                    }
                }),
                message: 'Please select the role to update the employee with.'
            }
        ]);

        let result = await connection.query("UPDATE employee SET ? WHERE ?", [{ role_id: roleChoice.role }, { id: employeeSelection.employee }]);

        console.log(`The role was successfully updated.\n`);
        askUser();

    } catch (err) {
        console.log(err);
        askUser();
    };
}