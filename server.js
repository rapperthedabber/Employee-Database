require("console.table")
const inquirer = require("inquirer");
const mysql = require('mysql');
const { title } = require("process");
const utils = require("util");
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'Migda1ia?',
        database: 'job_db'
    },
    console.log(`Connected to the job_db database.`)
);
db.query = utils.promisify(db.query);

const employee = [{
    type: 'input',
    message: 'What is the employee first name',
    name: 'employeeFirst',
}, {
    type: 'input',
    message: 'what is the employee last name?',
    name: 'employeeLast',
}, {
    type: 'list',
    message: 'what is the employee role',
    name: 'employeeRole',
    choices: 'roles'
}, {
    type: 'list',
    message: 'who is the employee manager?',
    name: 'managerId',
    choices: 'employees'
}
]
const ask =
    [{
        type: 'list',
        message: 'What would you like to do',
        name: 'choice',
        choices: ['add employee', 'View all employees', 'add roles', 'view all roles', 'add department', 'view all departments', 'quit']
    }
    ]


function questions() {
    inquirer.prompt(ask).then((answer) => {
        if (answer.choice === 'add employee') {
            console.log('you choose to update employee info')
            addEmployee()
        } else if (answer.choice === 'View all employees') {
            console.log('you choose to see all employees')
            allEmployee()
        } else if (answer.choice === 'add roles') {
            console.log('you chose to update roles')
            addRole();
        } else if (answer.choice === 'view all roles') {
            console.log('you chose to view all roles')
            viewRole();
        } else if (answer.choice === 'view all departments') {
            console.log("you want to view all departments")
            viewDepartments();
        }else{
            quit()
        }
    })
}





async function allEmployee() {
    const sql = `SELECT employee.id, employee.first_name AS "first name", employee.last_name 
                    AS "last name", role.title, department.name AS department, role.salary, 
                    concat(manager.first_name, " ", manager.last_name) AS manager
                    FROM employee
                    LEFT JOIN role
                    ON employee.role_id = role.id
                    LEFT JOIN department
                    ON role.department_id = department.id
                    LEFT JOIN employee manager
                    ON manager.id = employee.manager_id`

    const result = await db.query(sql)
    console.table(result)
    questions();
} //await helps javascript code to wait for a second

async function addEmployee() {
    const employeeResult = await db.query('SELECT * FROM employee');
    const roleResult = await db.query('SELECT * FROM role');
    const employees = employeeResult.map(employee => ({
        value: employee.id,
        name: `${employee.first_name} ${employee.last_name}`
    }))
    const roles = roleResult.map(role => ({
        name: role.title,
        value: role.id
    }))
    const employee = [{
        type: 'input',
        message: 'What is the employee first name',
        name: 'employeeFirst',
    }, {
        type: 'input',
        message: 'what is the employee last name?',
        name: 'employeeLast',
    }, {
        type: 'list',
        message: 'what is the employee role',
        name: 'employeeRole',
        choices: roles
    }, {
        type: 'list',
        message: 'who is the employee manager?',
        name: 'managerId',
        choices: employees
    }
    ]
    const res = await inquirer.prompt(employee)
    await db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('${res.employeeFirst}', '${res.employeeLast}', '${res.employeeRole}', '${res.managerId}')`)
    console.log("employee successfully added!")
    questions();
}

async function viewDepartments() {
    const result = await db.query("SELECT * FROM department")
    console.table(result)
    questions();

}

async function addRole() {
    const departmentResult = await db.query('SELECT * FROM department');
    const departments = departmentResult.map(department => ({
        value: department.id,
        name: department.name
    }))
    const askRole = [{
        type: 'input',
        message: 'what is the new role title?',
        name: 'title'
    }, {
        type: 'input',
        message: 'what is the salary?',
        name: 'salary'
    }, {
        type: 'list',
        message: 'what department?',
        name: 'department',
        choices: departments
    }]
    const res = await inquirer.prompt(askRole)
    await db.query(`INSERT INTO role ( title, salary, department_id) VALUES ('${res.title}',' ${res.salary}', '${res.department}')`)
    console.log("successfully added!")
    questions();
}

async function viewRole(){
    const result = await db.query(`SELECT * FROM role`);
    console.table(result);
    questions()
}
// db.query('SELECT SUM(quantity) AS total_in_section, MAX(quantity) AS max_quantity, MIN(quantity) AS min_quantity, AVG(quantity) AS avg_quantity FROM favorite_books GROUP BY section', function (err, results) {
//   console.log(results);
// });

// app.use((req, res) => {
//   res.status(404).end();
// });

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

//module.exports = allEmployee;
questions();