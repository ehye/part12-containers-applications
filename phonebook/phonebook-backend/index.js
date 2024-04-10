require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const PhoneBook = require('./models/person')
const app = express()

app.use(cors())
app.use(express.json())
morgan.token('body', (req) => {
  return JSON.stringify(req.body)
})

app.use(
  morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'),
      '-',
      tokens['response-time'](req, res),
      'ms',
      tokens.body(req, res),
    ].join(' ')
  })
)

app.use(express.static('dist'))

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
  PhoneBook.find({}).then((result) => {
    if (result.length > 0) {
      result.forEach((person) => {
        console.log(person.name, person.number)
      })
    }
    response.json(result)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  PhoneBook.findById(request.params.id)
    .then((p) => {
      if (p) {
        response.json(p)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => next(error))
})

app.get('/info', (request, response) => {
  response.send(
    `<div>Phonebook has info for ${
      PhoneBook.length
    } people</div><br /><div>${new Date()}</div>`
  )
})

app.put('/api/persons/:id', (request, response, next) => {
  let phoneBook = {
    name: request.body.name,
    number: request.body.number,
  }

  PhoneBook.findByIdAndUpdate(request.params.id, phoneBook, {
    new: true,
    runValidators: true,
    context: 'query',
  })
    .then((updatedPerson) => {
      response.json(updatedPerson)
    })
    .catch((error) => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  PhoneBook.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end()
    })
    .catch((error) => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  let phoneBook = new PhoneBook({
    name: body.name,
    number: body.number,
  })

  phoneBook
    .save()
    .then((result) => {
      response.json(result)
    })
    .catch((error) => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)
