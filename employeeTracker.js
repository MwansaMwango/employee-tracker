const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require('console.table');

const connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "sql0044",
  database: "employee_trackerdb"
});

// Connect to MySQL datbase
connection.connect(function(err) {
  if (err) throw err;
  console.log("Connected to database!");

});
    //Get list of departments
    const queryAllDepts = `SELECT name FROM department`;
    let deptList = [];
    connection.query(queryAllDepts, function(err, res) {
          deptList = res.map(row => row.name);

    })
let allDepts = '';


const queryAllData = 
      `SELECT 
        e.id,
        e.first_name,
        e.last_name,
        role.title,
        department.name as department,
        role.salary,
        concat (m.first_name,' ', m.last_name) manager
      FROM employee e
      INNER JOIN employee m
        ON m.id = e.manager_id
      INNER JOIN role
        ON e.role_id = role.id 
      INNER JOIN department
        ON role.department_id = department.id`;

function promptAction() {
  return inquirer.prompt({
      name: "action",
      type: "rawlist",
      message: "What would you like to do?",
      choices: [
        "View all employees",
          "View all employees by Department",
          "View all employees by Manager",
        "View department total salary",
        "Add Employee",
        "Remove Employee",
        "Update Employee",
          "Update Employee Role",
          "Update Employee Manager"
      ]}
  )
}

async function getAction () {
  try {

    const promptActionAnswer = await promptAction();
 
    switch (promptActionAnswer.action) {
    
      case "View all employees":
        viewEmployees();
        break;
    
      case "View all employees by Department":
        const answer = await inquirer.prompt({
          name: "department",
          type: "rawlist",
          message: "What department would you like to view?",
          choices: deptList
        })
        const selectedDept = answer.department
        console.log(selectedDept);
        viewEmployeesByDept(selectedDept);

      break;
    }

  } catch (err) {
    console.error(err.message);
  }
  
}
          
function viewEmployees() {
  connection.query(
    `SELECT 
      e.id,
      e.first_name,
      e.last_name,
      role.title,
      department.name as department,
      role.salary,
      concat (m.first_name,' ', m.last_name) manager
    FROM employee e
    INNER JOIN employee m
      ON m.id = e.manager_id
    INNER JOIN role
      ON e.role_id = role.id 
    INNER JOIN department
      ON role.department_id = department.id`, function(err, res) {
    console.table(res);
    getAction();
  });
}

function viewEmployeesByDept(dept) {
   console.log('Variable for selected department = '+ dept);
  connection.query(`SELECT 
    e.id,
    e.first_name,
    e.last_name,
    role.title,
    department.name as department,
    role.salary,
    concat (m.first_name,' ', m.last_name) manager
  FROM employee e
  LEFT JOIN employee m
    ON m.id = e.manager_id
  INNER JOIN role
    ON e.role_id = role.id 
  INNER JOIN department
    ON role.department_id = department.id
    WHERE department.name = '${dept}'` , function(err, res) {
    console.table(res);
    getAction();
  });
}

getAction();



