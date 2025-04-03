const fs = require("fs");
const { Command } = require("commander");
const program = new Command();
const TODO_FILE = "todos.json";
let todos = []; // In-memory todos storage

async function date() {
  const date = new Date();
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

async function loadTodos() {
  if (todos.length > 0) return todos; // Use in-memory data if available
  try {
    const data = await fs.promises.readFile(TODO_FILE, "utf8");
    todos = JSON.parse(data); // Load from file if no in-memory data
    return todos;
  } catch (error) {
    if (error.code === "ENOENT") {
      return []; // No tasks found
    }
    throw new Error(`Error loading tasks: ${error.message}`);
  }
}

async function saveTodos() {
  try {
    await fs.promises.writeFile(TODO_FILE, JSON.stringify(todos, null, 2));
  } catch (error) {
    throw new Error(`Error saving tasks: ${error.message}`);
  }
}

async function addTask(task) {
  const currentDate = await date();
  todos.push({ task, done: false, date: currentDate });
  await saveTodos(); // Save only after modification
  console.log(`${currentDate}: Task added: ${task}`);
}

function viewTask() {
  if (todos.length === 0) {
    console.log("No tasks to show 🥳");
    return;
  }
  todos.forEach((todo, index) => {
    const status = todo.done ? "✅" : "❌";
    console.log(`${index + 1}. ${todo.task} ${status} ${todo.date}`);
  });
}

function viewTaskDone() {
  if (todos.length === 0) {
    console.log("No tasks to show 🥳");
    return;
  }
  todos.forEach((todo, index) => {
    const status = todo.done ? "✅" : "❌";
    const dateInfo = todo.done && todo.date ? ` (Completed on: ${todo.date})` : "";
    console.log(`${index + 1}. ${todo.task} ${status}${dateInfo}`);
  });
}

async function markDone(index) {
  if (index >= 0 && index < todos.length) {
    todos[index].done = true;
    await saveTodos(); // Save only after modification
    console.log(`Task ${index + 1} marked as done`);
    viewTaskDone();
  } else {
    console.log("Invalid task index");
  }
}

async function main() {
  program
    .name("cli-toDoList")
    .description("A ToDo List CLI")
    .version("1.0.0");

  program
    .command("add <task>")
    .description("Add a task to the list")
    .action(async (task) => {
      await addTask(task);
    });

  program
    .command("view")
    .description("View all tasks in the list")
    .action(() => {
      viewTask();
    });

  program
    .command("done <index>")
    .description("Mark a task as done")
    .action(async (index) => {
      const taskIndex = parseInt(index) - 1;
      if (!isNaN(taskIndex)) {
        await markDone(taskIndex);
      } else {
        console.log("Provide a valid task index 🖕🏻");
      }
    });

  program
    .command("clear")
    .description("Clear all tasks")
    .action(async () => {
      todos = []; // Clear in-memory data
      await saveTodos(); // Clear the file as well
      console.log("All tasks cleared 🧹");
    });

  await loadTodos(); // Load todos when the program starts
  await program.parseAsync();
}

main().catch(console.error);

