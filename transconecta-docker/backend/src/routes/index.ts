import { Router } from 'express';

const router = Router();

// Define your routes here
router.get('/', (req, res) => {
    res.send('Welcome to the TransConecta API');
});

// Add more routes as needed
// router.get('/example', (req, res) => {
//     res.send('This is an example route');
// });

export default router;