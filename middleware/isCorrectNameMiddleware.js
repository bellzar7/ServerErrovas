const { Vacancy } = require('../models/models')

module.exports = function (role) {
  return async function (req, res, next) {
    if (req.method === 'OPTIONS') {
      next()
    }
    try {
      const { name } = req.body
      const vacancy = await Vacancy.findOne({ where: { name } })
      if (!vacancy) {
        next()
      }
      return res
        .status(404)
        .json({ message: 'Вакансія з такою назвою вже існує!' })
    } catch (e) {
      res.status(400).json({ message: 'Не авторизований' })
    }
  }
}
