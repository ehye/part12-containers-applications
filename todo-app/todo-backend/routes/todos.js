const express = require('express');
const { Todo } = require('../mongo')
const router = express.Router();
const redis = require('../redis/index')

/* GET todos listing. */
router.get('/', async (_, res) => {
  const todos = await Todo.find({})
  res.send(todos);
});

/* POST todo to listing. */
router.post('/', async (req, res) => {
  const todo = await Todo.create({
    text: req.body.text,
    done: false
  })
  res.send(todo);
  
  const count = await redis.getAsync('todos')
  redis.setAsync('todos', Number(count) + 1);
});

router.get('/statistics', async (_, res) => {
  const count = await redis.getAsync('todos')
  res.json({ added_todos: Number(count) })
});

const singleRouter = express.Router();

const findByIdMiddleware = async (req, res, next) => {
  const { id } = req.params
  req.todo = await Todo.findById(id)
  if (!req.todo) return res.sendStatus(404)

  next()
}

/* DELETE todo. */
singleRouter.delete('/', async (req, res) => {
  await req.todo.delete()  
  res.sendStatus(200);
});

/* GET todo. */
singleRouter.get('/', async (req, res) => {
  res.send(req.todo);
});

/* PUT todo. */
singleRouter.put('/', async (req, res) => {
  const todo = { ...req.body }
  const updateResult = await Todo.findByIdAndUpdate(req.todo._id, todo, {
    new: true,
    runValidators: true,
    context: 'query',
  })
  res.send(updateResult);
});

router.use('/:id', findByIdMiddleware, singleRouter)


module.exports = router;
