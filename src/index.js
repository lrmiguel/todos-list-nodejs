const express = require('express');
const cors = require('cors');
const { v4: uuidV4, v4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  console.log(username)
  const user = users.find((user) => user.username === username)
  console.log(user)

  if (!user)
    response.status(400).json({ error: 'User not found' })

  request.user = user

  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const userToBeFound = users.find((u) => u.username === username);

  if (userToBeFound)
    response.status(400).json({ error: 'User already exists' });

  const user = {
    id: v4(),
    name,
    username,
    todos: [],
  }

  users.push(user)

  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const todos = request.user.todos

  return response.status(200).json(todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body

  const todo = {
    id: v4(),
    title,
    done: false,
    deadline: new Date(deadline).toISOString(),
    created_at: new Date().toISOString(),
  }

  request.user.todos.push(todo)

  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const todoToBeUpdated = request.user.todos.find(t => t.id === id)

  if (!todoToBeUpdated)
    return response.status(404).json({ 'error': 'Todo not found' })

  const todo = request.body
  todoToBeUpdated.title = todo.title
  todoToBeUpdated.deadline = todo.deadline

  return response.status(200).json(todoToBeUpdated)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params

  const todo = request.user.todos.find(t => t.id === id)
  if (!todo)
    return response.status(404).json({ 'error': 'Todo not found' })

  todo.done = true
  return response.status(200).json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params

  const todos = request.user.todos
  const todo = todos.find(t => t.id === id)

  if (!todo)
    return response.status(404).json({ 'error': 'Todo not found' })

  todos.splice(todo, 1)

  return response.status(204).send()
});

module.exports = app;