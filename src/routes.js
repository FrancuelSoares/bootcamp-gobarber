import { Router } from 'express';
import User from './app/models/User';

const routes = new Router();

routes.get('/', async (req, res) => {
  const user = await User.create({
    name: 'Françuel',
    email: 'fran@teste.com',
    password_hash: 'dwvdyqfdyvhvbjhv'
  });

  return res.json(user);
});

export default routes;
