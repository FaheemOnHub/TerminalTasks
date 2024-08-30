const fs = require("fs");
const path = require("path");
const process = require("process");
const { Command } = require("commander");
const { error } = require("console");
const program = new Command();
const TODO_FILE = "todos.json";

async function date() {
  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

async function loadTodos() {
  try {
    const data = await fs.promises.readFile(TODO_FILE, "utf8");

    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}
async function saveTodos(todos) {
  await fs.promises.writeFile(TODO_FILE, JSON.stringify(todos, null, 2));
}
async function addTask(task) {
  const todos = await loadTodos();
  todos.push({ task, done: false, date: await date() });
  await saveTodos(todos);
  console.log(await date());
  console.log(`Task added: ${task} 🥶`);
}
async function viewTask(todos) {
  todos.forEach((todo, index) => {
    const status = todo.done ? "✅" : "❌";
    console.log(`${index + 1} ${todo.task} ${status} ${todo.date}`);
  });
}
async function viewTaskDone(todos) {
  todos.forEach((todo, index) => {
    const status = todo.done ? "✅" : "❌";
    const dateInfo =
      todo.done && todo.date ? ` (Completed on: ${todo.date})` : "";
    console.log(`${index + 1}. ${todo.task} ${status}${dateInfo}`);
  });
}
async function markDone(index) {
  const todos = await loadTodos();
  if (index >= 0 && index < todos.length) {
    todos[index].done = true;
    await saveTodos(todos);
    console.log(`Task ${index + 1} marked as done`);
    viewTaskDone(todos);
  } else {
    console.log("Invalid task index");
  }
}
async function main() {
  program
    .name("cli-toDoList")
    .description("a toDoList based out of your cli")
    .version("1.0.0");

  program
    .command("add <task>")
    .description("adds a task in list")
    .action(async (task) => {
      await addTask(task);
    });

  program
    .command("view")
    .description("used to view all the tasks in your list")
    .action(async () => {
      const todos = await loadTodos();
      if (todos.length === 0) {
        console.log("No tasks to show 🥳");
        return;
      }
      viewTask(todos);
    });

  program
    .command("done <index>")
    .description("Mark a task as done")
    .action(async (index) => {
      const taskIndexer = parseInt(index) - 1;
      if (!isNaN(taskIndexer)) {
        await markDone(taskIndexer);
      } else {
        console.log("Provide a valid task index 🖕🏻");
      }
    });
  program
    .command("clear")
    .description("clears all the tasks")
    .action(async () => {
      await fs.promises.writeFile(TODO_FILE, "[]");
      console.log("All tasks cleared 🧹");
    });
  await program.parseAsync();
}
main().catch(console.error);
