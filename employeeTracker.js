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
    const queryAllDepts = `SELECT * FROM department`;
    let deptList = [];
    let deptObjArr = [];
    connection.query(queryAllDepts, function(err, res) {
      deptObjArr = res;
      deptList = res.map(row => row.name);
      
    })
    //Get list of roles
    let roleList = [];
    let roleObjArr = [];
    const queryAllRoles = `SELECT * FROM role`;
    connection.query(queryAllRoles, function(err, res) {
      roleObjArr = res;

      roleList = res.map(row => row.title);
    })    
    
    //Get list of managers
    const queryAllMgrs = 
    `SELECT 
    e.manager_id,
    concat (m.first_name,' ', m.last_name) manager
  FROM employee e
  INNER JOIN employee m
    ON m.id = e.manager_id
  INNER JOIN role
    ON e.role_id = role.id 
  INNER JOIN department
    ON role.department_id = department.id`;
    let managerList = [];
    let managerObjArr = [];

    connection.query(queryAllMgrs, function(err, res) {
      managerObjArr = res;
      managerList = res.map(row => row.manager);
    })

    // Get list of Employees
    let employeeObjArr = [];
    let employeeList = [];
    
    const queryAllEmployees = `SELECT * FROM employee`;
    connection.query(queryAllEmployees, function(err, res) {
      employeeObjArr = res;
      employeeList = res.map(row => row.first_name + ' ' + row.last_name);
    }) 
    
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
        "View Roles",
        "View Departments",
        "View Department total salary budget",
        "Add Employee",
        "Add Role",
        "Add Department",
        "Remove Employee",
        "Update Employee details",
      ]}
  )
}

async function getAction () {
  try {

    displayBanner();  
    const promptActionAnswer = await promptAction();
 
    switch (promptActionAnswer.action) {
    
      case "View all employees":
        viewEmployees();
        break;
      
      case "View Roles":
        viewRoles();
        break;
      
      case "View Departments":
        viewDepts();
        break;
    
      case "View all employees by Department":
        const promptDept = await inquirer.prompt({
          name: "department",
          type: "rawlist",
          message: "What department would you like to view?",
          choices: deptList
        })
        const selectedDept = promptDept.department
        viewEmployeesByDept(selectedDept);
        break;

      case "View all employees by Manager":
        const promptMgr = await inquirer.prompt({
          name: "manager",
          type: "rawlist",
          message: "Under which manager are the employees?",
          choices: managerList
        })
        let selectedMgr = promptMgr.manager
        let selectedMgrObj = await managerObjArr.find(row => row.manager === selectedMgr)
        let selectedMgrId = selectedMgrObj.manager_id;
        viewEmployeesByMgr(selectedMgrId);
        break;

      case "View Department total salary budget":
        const promptDeptBudget = await inquirer.prompt({
          name: "departmentBudget",
          type: "rawlist",
          message: "What department's budget would you like to view?",
          choices: deptList
        })
        const selectedDeptBudget = promptDeptBudget.departmentBudget
        viewBudgetByDept(selectedDeptBudget);
        break;
    
      case "Add Employee":
      
      const promptEmployeeData = await inquirer.prompt([
          {
          name: "firstName",
          type: "input",
          message: "What is your first name?",
          },
          {
            name: "lastName",
            type: "input",
            message: "What is your last name?",
            },
            {
              name: "role",
              type: "rawlist",
              message: "What is your role?",
              choices: roleList
            },
            {
              name: "manager",
              type: "rawlist",
              message: "Select your manager?",
              choices: managerList
            }
          ]);

          let employeeData = {};
          employeeData.first_name = promptEmployeeData.firstName;
          employeeData.last_name = promptEmployeeData.lastName;
          let selectedEmpMgr = promptEmployeeData.manager;
          let selectedEmpMgrObj = await managerObjArr.find(row => row.manager === selectedEmpMgr)
          let selectedEmpMgrId = selectedEmpMgrObj.manager_id;
          employeeData.manager_id = selectedEmpMgrId;
         
          let selectedRole = promptEmployeeData.role
          let selectedRoleObj = await roleObjArr.find(row => row.title === selectedRole)
          let selectedRoleId = selectedRoleObj.id;
          employeeData.role_id = selectedRoleId;
          addEmployeeData(employeeData);
          break;

          case "Add Role":
            const promptRoleData = await inquirer.prompt([
              {
                name: "title",
                type: "input",
                message: "What is the title of the new role?",
              },
              {
                name: "salary",
                type: "input",
                message: "What is the expected salary for the new role?",
              },
              {
                  name: "dept",
                  type: "rawlist",
                  message: "What department does the new role fall under?",
                  choices: deptList
              }
            ]);

            let roleData = {};
            roleData.title = promptRoleData.title;
            roleData.salary = promptRoleData.salary;
            selectedRoleDept = await deptObjArr.find(row => row.name === promptRoleData.dept)
            roleData.department_id = selectedRoleDept.id;
            addRole(roleData);
            break;

          case "Add Department":
              const promptDeptData = await inquirer.prompt([
                {
                  name: "name",
                  type: "input",
                  message: "What is the name of the new department?"
                }
              ]);
  
              let deptData = {};
              deptData.name = promptDeptData.name;
              addDept(deptData);
              break;

          case "Remove Employee":
             const promptRemoveEmployee = await inquirer.prompt([
              {
                name: "firstName",
                type: "input",
                message: "Enter first name of employee to remove?"
              },
              {
                name: "lastName",
                type: "input",
                message: "Enter last name of employee to remove?"
              }
            ]);

            let employeeFirstName = promptRemoveEmployee.firstName;
            let employeeLastName = promptRemoveEmployee.lastName;
            console.log("Employee Obj Array = ", employeeObjArr);
            let selectedEmpObj = await employeeObjArr.find(
              row => row.first_name === employeeFirstName && row.last_name === employeeLastName
            );
              console.log("Selected Empl Obj from await function = ",selectedEmpObj);
              let selectedEmpId = selectedEmpObj.id;
            removeEmployee(selectedEmpId);
            break;

            case "Update Employee details":
              const promptUpdateEmployee = await inquirer.prompt([
                {
                name: "selectedEmployee",
                type: "rawlist",
                message: "Select Employee to update?",
                choices: employeeList
                }
                ]);
      
                let selectedEmpFullName = promptUpdateEmployee.selectedEmployee;
                let selectedEmployeeObj = await employeeObjArr.find(row => row.first_name + ' ' + row.last_name === selectedEmpFullName)
                let selectedEmployeeId = selectedEmployeeObj.id;

                const promptUpdateEmployeeData = await inquirer.prompt([
                  {
                    name: "firstName",
                    type: "input",
                    message: "Enter updated first name?",
                    },
                    {
                      name: "lastName",
                      type: "input",
                      message: "Enter updated last name?",
                      },
                      {
                        name: "role",
                        type: "rawlist",
                        message: "Enter updated role?",
                        choices: roleList
                      },
                      {
                        name: "manager",
                        type: "rawlist",
                        message: "Enter updated manager?",
                        choices: managerList
                      }
                    ]);
          
                    let updatedEmployeeData = {};
                    updatedEmployeeData.first_name = promptUpdateEmployeeData.firstName;
                    updatedEmployeeData.last_name = promptUpdateEmployeeData.lastName;
                    let updatedEmpMgr = promptUpdateEmployeeData.manager;
                    let updatedEmpMgrObj = await managerObjArr.find(row => row.manager === updatedEmpMgr)
                    let updatedEmpMgrId = updatedEmpMgrObj.manager_id;
                    updatedEmployeeData.manager_id = updatedEmpMgrId;
                
                    let updatedRole = promptUpdateEmployeeData.role
                    let updatedRoleObj = await roleObjArr.find(row => row.title === updatedRole)
                    let updatedRoleId = updatedRoleObj.id;
                    updatedEmployeeData.role_id = updatedRoleId;

                    updateEmployeeData(selectedEmployeeId, updatedEmployeeData);
                    break;

            
      //--- switch ---
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
    LEFT JOIN employee m
      ON m.id = e.manager_id
    INNER JOIN role
      ON e.role_id = role.id 
    INNER JOIN department
      ON role.department_id = department.id`, function(err, res) {
    console.table(res);
    getAction();
  });
}
function viewRoles() {
  connection.query(
    `SELECT * FROM role`, function(err, res) {
    console.table(res);
    getAction();
  });
}
function viewDepts() {
  connection.query(
    `SELECT * FROM department`, function(err, res) {
    console.table(res);
    getAction();
  });
}
function viewEmployeesByDept(dept) {
  console.log('Selected department = '+ dept);
  connection.query(`SELECT 
    e.id,
    e.first_name,
    e.last_name,
    e.manager_id,
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
function viewEmployeesByMgr(mgrId) { 
  console.log('Selected manager = '+ mgrId);
  connection.query(`SELECT 
    e.id,
    e.first_name,
    e.last_name,
    e.manager_id,
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
  WHERE e.manager_id = '${mgrId}'` , function(err, res) {
  console.table(res);
  getAction();
  });
}
function viewBudgetByDept(dept) {
  console.log('Selected department = '+ dept);
  connection.query(
  `SELECT SUM(salary) AS 'Total Budget'
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
function addEmployeeData(emplDetails) {
  console.log('Employee data = ', emplDetails);
  connection.query(
  `INSERT INTO employee (first_name, last_name, manager_id, role_id) VALUES (?,?,?,?)`,
  [emplDetails.first_name,emplDetails.last_name,emplDetails.manager_id, emplDetails.role_id ],
  function(err, res) {
    if (err) throw err;
    console.table(res);
  getAction();
  });
}
function addRole(roleDetails) {
  console.log('Role data = ', roleDetails);
  connection.query(
  `INSERT INTO role (title, salary, department_id) VALUES (?,?,?)`,
  [roleDetails.title,roleDetails.salary, roleDetails.department_id],
  function(err, res) {
    if (err) throw err;
    console.table(res);
  getAction();
  });
}
function addDept(deptDetails) {
  console.log('Dept data = ', deptDetails);
  connection.query(
  `INSERT INTO department (name) VALUES (?)`, [deptDetails.name],
  function(err, res) {
    if (err) throw err;
    console.table(res);
  getAction();
  });
}
function removeEmployee(employeeId) {
  console.log('Employee ID = ', employeeId);
  connection.query(
  `DELETE FROM employee WHERE employee.id = (?)`, [employeeId],
  function(err, res) {
    if (err) throw err;
    console.table(res);
  getAction();
  });
}
function updateEmployeeData(emplId, emplDetails) {
  console.log('Update Employee id = ',emplId, 'Update Employee data = ', emplDetails);
  connection.query(
  `UPDATE employee SET first_name = ?, last_name = ?, manager_id =?, role_id = ? WHERE id = ?`,
  [emplDetails.first_name,emplDetails.last_name,emplDetails.manager_id, emplDetails.role_id, emplId ],
  function(err, res) {
    if (err) throw err;
    console.table(res);
  getAction();
  });
}
function displayBanner() {
  const banner = `

  ▓█████  ███▄ ▄███▓ ██▓███   ██▓     ▒█████ ▓██   ██▓▓█████ ▓█████    ▄▄▄█████▓ ██▀███   ▄▄▄       ▄████▄   ██ ▄█▀▓█████  ██▀███  
  ▓█   ▀ ▓██▒▀█▀ ██▒▓██░  ██▒▓██▒    ▒██▒  ██▒▒██  ██▒▓█   ▀ ▓█   ▀    ▓  ██▒ ▓▒▓██ ▒ ██▒▒████▄    ▒██▀ ▀█   ██▄█▒ ▓█   ▀ ▓██ ▒ ██▒
  ▒███   ▓██    ▓██░▓██░ ██▓▒▒██░    ▒██░  ██▒ ▒██ ██░▒███   ▒███      ▒ ▓██░ ▒░▓██ ░▄█ ▒▒██  ▀█▄  ▒▓█    ▄ ▓███▄░ ▒███   ▓██ ░▄█ ▒
  ▒▓█  ▄ ▒██    ▒██ ▒██▄█▓▒ ▒▒██░    ▒██   ██░ ░ ▐██▓░▒▓█  ▄ ▒▓█  ▄    ░ ▓██▓ ░ ▒██▀▀█▄  ░██▄▄▄▄██ ▒▓▓▄ ▄██▒▓██ █▄ ▒▓█  ▄ ▒██▀▀█▄  
  ░▒████▒▒██▒   ░██▒▒██▒ ░  ░░██████▒░ ████▓▒░ ░ ██▒▓░░▒████▒░▒████▒     ▒██▒ ░ ░██▓ ▒██▒ ▓█   ▓██▒▒ ▓███▀ ░▒██▒ █▄░▒████▒░██▓ ▒██▒
  ░░ ▒░ ░░ ▒░   ░  ░▒▓▒░ ░  ░░ ▒░▓  ░░ ▒░▒░▒░   ██▒▒▒ ░░ ▒░ ░░░ ▒░ ░     ▒ ░░   ░ ▒▓ ░▒▓░ ▒▒   ▓▒█░░ ░▒ ▒  ░▒ ▒▒ ▓▒░░ ▒░ ░░ ▒▓ ░▒▓░
   ░ ░  ░░  ░      ░░▒ ░     ░ ░ ▒  ░  ░ ▒ ▒░ ▓██ ░▒░  ░ ░  ░ ░ ░  ░       ░      ░▒ ░ ▒░  ▒   ▒▒ ░  ░  ▒   ░ ░▒ ▒░ ░ ░  ░  ░▒ ░ ▒░
     ░   ░      ░   ░░         ░ ░   ░ ░ ░ ▒  ▒ ▒ ░░     ░      ░        ░        ░░   ░   ░   ▒   ░        ░ ░░ ░    ░     ░░   ░ 
     ░  ░       ░                ░  ░    ░ ░  ░ ░        ░  ░   ░  ░               ░           ░  ░░ ░      ░  ░      ░  ░   ░     
                                              ░ ░                                                  ░                               
  
`
  // end of banner ASCII
  console.log(banner);
}

getAction();





