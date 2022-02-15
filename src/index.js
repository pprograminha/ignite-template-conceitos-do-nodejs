const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find(user => user.username === username)

  if(!user) {
    return response.status(404).json({
      error: 'User does not exists'
    })
  }

  request.user = user

  return next()
}

app.post('/users', (request, response) => {
  const { username, name } = request.body
  const checkUsernameAlreadyExists = users.some(user => user.username === username)

  if (checkUsernameAlreadyExists) {
    return response.status(400).json({ error: 'Username already exists.' })
  }

  const user = {
    id: uuidv4(),
    username,
    name,
    todos: []
  }

  users.push(user)

  return response.status(201).send(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.status(200).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body

  const todo = {
    id: uuidv4(),
    title, 
    deadline: new Date(deadline),
    done: false,
    created_at: new Date()
  }

  user.todos.push(todo)

  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params
  const { title, deadline } = request.body

  const todoIndex = user.todos.findIndex(todo => todo.id === id)

  if(todoIndex === -1) {
    return response.status(404).json({
      error: 'Todo not found'
    })
  }

  Object.assign(user.todos[todoIndex], {
    title,
    deadline: new Date(deadline),
  })

  return response.status(200).json(user.todos[todoIndex])
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const todoIndex = user.todos.findIndex(todo => todo.id === id)

  if(todoIndex === -1) {
    return response.status(404).json({
      error: 'Todo not found'
    })
  }

  user.todos[todoIndex].done = true

  return response.status(200).json(user.todos[todoIndex])
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const todo = user.todos.find(todo => todo.id === id)

  if(!todo) {
    return response.status(404).json({
      error: 'Todo not found'
    })
  }

  user.todos.splice(todo, 1)

  return response.status(204).json()
});

module.exports = app;