// TASK: import helper functions from utils
// TASK: import initialData
//import { functionName } from

import { getTasks, createNewTask, patchTask, putTask, deleteTask} from './utils/taskFunctions.js';

import { initialData } from './initialData.js';

/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {

    localStorage.setItem('tasks', JSON.stringify(initialData));

    localStorage.setItem('show-SideBar', JSON.stringify(true));
  } else {
    console.log('Data already exists in localStorage');
  }
}

// TASK: Get elements from the DOM
const elements = {
  headerBoardName: document.getElementById("header-board-name"),
  columnDivs: document.querySelectorAll(".column-div"),
  filterDiv: document.getElementById("filterDiv"),
  sideBar : document.getElementById("side-bar-div"),
  hideSideBarBtn: document.getElementById("hide-side-bar-btn"),
  showSideBarBtn: document.getElementById("show-side-bar-btn"),
  addTaskBtn: document.getElementById("add-new-task-btn"),
  createNewTaskBtn: document.getElementById("create-task-btn"),
  modalWindow : document.getElementById("new-task-modal-window"),
  taskForm: document.getElementById("edit-task-form"),
  themeSwitch: document.getElementById("switch"),
  editTaskModal: document.getElementById("edit-task-modal-window"),


}

let activeBoard = ""

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  if (!Array.isArray(tasks) || tasks.length === 0) {
    console.error("No tasks found!");
    return;}

  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  console.log("Boards found:", boards); // Debugging


  displayBoards(boards);


  if (boards.length > 0) {
    activeBoard = JSON.parse(localStorage.getItem("activeBoard")) || boards[0];
    console.log("Active Board:", activeBoard); // Debugging log

    elements.headerBoardName.textContent = activeBoard;
    
    styleActiveBoard(activeBoard);

    refreshTasksUI();
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container


  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");

//Fixed bug on event listener
    boardElement.addEventListener("click", function() { 
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard))
      styleActiveBoard(activeBoard)
    });

    boardsContainer.appendChild(boardElement);
  });

}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName);
  console.log(`filtered tasks:`, filteredTasks); //debugging log



  
  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;



    const tasksContainer = document.createElement("div"); //might need to add a classlist?
    column.appendChild(tasksContainer);

    filteredTasks
    .filter(task => task.status === status)
    .forEach(task => { 
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
      taskElement.addEventListener("click", function(){ 
        openEditTaskModal(task);
      });

      tasksContainer.appendChild(taskElement);
    });
  });
}


function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => { 
    
    if(btn.textContent === boardName) {
      btn.classList.add('active')  // Fix: Use `classList.add()`
    }
    else {
      btn.classList.remove('active'); // Fix: Use `classList.remove()`
    }
  });
}


function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`); 
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.classList.add('task-div');
  taskElement.setAttribute('data-task-id', task.id);
  taskElement.innerHTML = `
    <h3>${task.title}</h3>
    <p>${task.description}</p>
    <span>${task.status}</span>
    <span>${task.board}</span>
  `; 


  taskElement.addEventListener("click", function(){
    openEditTaskModal(task.id);
  });
  
  tasksContainer.appendChild(taskElement); 
}



function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener("click" , () => toggleModal(false, elements.editTaskModal));

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener("click", () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener("click", () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener("click", () => toggleSidebar(true));

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.addTaskBtn.addEventListener('click', () => {
    console.log("Add Task button clicked!");
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.taskForm.addEventListener('submit',  (event) => {
    event.preventDefault();
    addTask(event)
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block' : 'none'; 
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault(); 

  //Assign user input to the task object
  const taskTitle = document.getElementById("title-input").value.trim();
  const taskDescription = document.getElementById("desc-input").value.trim();
  const taskStatus = document.getElementById("status-input").value;
//Make sure there is a title.
  if (!taskTitle){
    alert("Please enter a title for your task");
    return;
  }

  // Define newTask object
  const newTask = {
    id: Date.now(),  // Generate a unique ID for the new task
    title: taskTitle,
    description: taskDescription,
    status: taskStatus,
    board: activeBoard  // Use activeBoard as the default board for new task
  };


    createNewTask(newTask);
    addTaskToUI(newTask);
    refreshTasksUI();

    
    toggleModal(false);
    elements.filterDiv.style.display = "none";

      // Clear input fields
      document.getElementById("title-input").value = "";
      document.getElementById("description-input").value = "";
      document.getElementById("status-input").value = "To-Do";

      refreshTasksUI();
    }
}


function toggleSidebar(show) {
 
}

function toggleTheme() {
 
}



function openEditTaskModal(task) {
  // Set task details in modal inputs
  

  // Get button elements from the task modal


  // Call saveTaskChanges upon click of Save Changes button
 

  // Delete task using a helper function and close the task modal


  toggleModal(true, elements.editTaskModal); // Show the edit task modal
}

function saveTaskChanges(taskId) {
  // Get new user inputs
  

  // Create an object with the updated task details


  // Update task using a hlper functoin
 

  // Close the modal and refresh the UI to reflect the changes

  refreshTasksUI();
}

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  initializeData()
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}