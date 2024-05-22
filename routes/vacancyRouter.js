const Router = require('express')
const router = new Router()
const vacancyController = require('../controllers/vacancyController')
const checkRole = require('../middleware/chechRoleMiddleware')

router.post('/', checkRole('ADMIN'), vacancyController.create)
router.get('/', vacancyController.getAll)
router.get('/all', checkRole('ADMIN'), vacancyController.getAllForUpdate)
router.delete('/:id', checkRole('ADMIN'), vacancyController.deleteById)
router.put('/', checkRole('ADMIN'), vacancyController.update)

module.exports = router
