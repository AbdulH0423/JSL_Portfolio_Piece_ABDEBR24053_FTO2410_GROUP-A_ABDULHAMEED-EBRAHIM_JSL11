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



function openEditTaskModal(taskId) {
  const tasks = getTasks();         // Retrieve all tasks from local storage
  const task = tasks.find(task => task.id === taskId); // Find the task to edit
      
      console.log("All tasks from local storage:", tasks); // Debugging
      console.log("Looking for task ID:", taskId); // Debugging

      const taskToEdit = tasks.find(task => task.id === Number(taskId))

  if (!taskToEdit) {
      console.error("Task not found!");
      return;
  }

  // Get modal elements
  const editModal = document.querySelector(".edit-task-modal-window");
  const titleInput = document.getElementById("edit-task-title-input");
  const descInput = document.getElementById("edit-task-desc-input");
  const statusSelect = document.getElementById("edit-select-status");
  const saveBtn = document.getElementById("save-task-changes-btn");
  const deleteBtn = document.getElementById("delete-task-btn");
  const cancelBtn = document.getElementById("cancel-edit-btn");

  if (!editModal || !titleInput || !descInput || !statusSelect || !saveBtn || !deleteBtn) {
      console.error("Edit modal elements not found!");
      return;
  }

  // Populate modal fields with existing task data
  titleInput.value = taskToEdit.title;
  descInput.value = taskToEdit.description;
  statusSelect.value = taskToEdit.status;

  // Open the modal
  editModal.style.display = "block";

  // Set up event listeners for save and delete buttons
  saveBtn.onclick = () => saveTaskChanges(taskId);
  deleteBtn.onclick = () => {
      deleteTask(taskId);
      editModal.style.display = "none"; // Close modal after deletion
      refreshTasksUI(); // Refresh the UI to remove the deleted task
  };
  cancelBtn.onclick = () => editModal.style.display = "none"
}



function saveTaskChanges(taskId) {
  // Get new user inputs
  const updatedTitle = document.getElementById("edit-task-title-input").value.trim();
  const updatedDescription = document.getElementById("edit-task-desc-input").value.trim();
  const updatedStatus = document.getElementById("edit-select-status").value;


  if (!updatedTitle){
    alert("Please enter a title");
    return;
  }

  let tasks = getTasks();
  const taskIndex = tasks.findIndex(task => task.id === task.id);


  if (taskIndex === -1) {
    console.error("Task not found!"); //debugging
    return;
  }

  tasks[taskIndex] = {
    ...tasks[taskIndex],
    title: updatedTitle,
    description: updatedDescription,
    status: updatedStatus
  };

  patchTask(taskId);
  putTask(taskId);

  localStorage.setItem("tasks", JSON.stringify(tasks));

  console.log("Task Updated:", tasks[taskIndex]);

  toggleModal(false, elements.editTaskModal);//debugging


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