const { Vacancy } = require('../models/models')
const uuid = require('uuid')
const path = require('path')
const fs = require('node:fs')
const ApiError = require('../error/ApiError')

class VacancyController {
  async create(req, res, next) {
    try {
      const {
        name,
        description,
        countries,
        payForHour,
        salaryPerMonthFrom,
        salaryPerMonthTo,
        isFast,
      } = req.body
      const { imgVacancy, imgCountriesFlag } = req.files

      const vacancyExtension = imgVacancy.name.split('.').pop()
      const countriesExtension = imgCountriesFlag.name.split('.').pop()

      let fileName = uuid.v4()
      if (['png', 'jpg', 'jpeg', 'webp'].includes(vacancyExtension)) {
        fileName += '.' + vacancyExtension
      } else {
        return next(ApiError.badRequest('Invalid file extension'))
      }
      await imgVacancy.mv(path.resolve(__dirname, '..', 'static', fileName))

      let fileNameCountries = uuid.v4()
      if (['png', 'jpg', 'jpeg', 'webp'].includes(countriesExtension)) {
        fileNameCountries += '.' + countriesExtension
      } else {
        return next(ApiError.badRequest('Invalid file extension'))
      }
      await imgCountriesFlag.mv(
        path.resolve(__dirname, '..', 'static', fileNameCountries),
      )

      const vacancy = await Vacancy.create({
        name,
        description,
        countries,
        payForHour,
        salaryPerMonthFrom,
        salaryPerMonthTo,
        imgVacancy: fileName,
        imgCountriesFlag: fileNameCountries,
        isFast,
      })

      return res.json(vacancy)
    } catch (e) {
      next(ApiError.badRequest(e.message))
    }
  }
  async getAll(req, res, next) {
    try {
      let { page } = req.query

      page = parseInt(page) || 1
      const limit = 6
      let offset = page * limit - limit

      let { count, rows: vacancies } = await Vacancy.findAndCountAll({
        order: [
          ['isFast', 'DESC'],
          ['createdAt', 'ASC'],
        ],
        limit,
        offset,
      })

      const totalPages = Math.ceil(count / limit)
      const prevPage =
        page > 1 ? `/api/vacancy/?limit=${limit}&page=${page - 1}` : null
      const nextPage =
        page < totalPages
          ? `/api/vacancy/?limit=${limit}&page=${page + 1}`
          : null

      return res.json({ vacancies, totalPages, prevPage, nextPage })
    } catch (e) {
      next(ApiError.badRequest(e.message))
    }
  }
  async getAllForUpdate(req, res, next) {
    try {
      const vacancies = await Vacancy.findAll()
      return res.json(vacancies)
    } catch (e) {
      next(ApiError.badRequest(e.message))
    }
  }
  async deleteById(req, res, next) {
    try {
      const { id } = req.params
      const vacancy = await Vacancy.findOne({ where: { id } })
      if (!vacancy) {
        return next(ApiError.badRequest('Вибраної вакансії не існує'))
      }

      const imgVacancyPath = path.resolve(
        __dirname,
        '..',
        'static',
        vacancy.imgVacancy,
      )
      const imgCountriesFlagPath = path.resolve(
        __dirname,
        '..',
        'static',
        vacancy.imgCountriesFlag,
      )

      const deleteFile = (filePath) => {
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Помилка при видаленні файлу ${filePath}:`, err)
          } else {
            console.log(`Файл ${filePath} успішно видалений`)
          }
        })
      }

      deleteFile(imgVacancyPath)
      deleteFile(imgCountriesFlagPath)

      await Vacancy.destroy({ where: { id } })
      return res.json({
        message: `Вакансія ${vacancy.dataValues.name} була успішно видалена`,
      })
    } catch (e) {
      next(ApiError.badRequest(e.message))
    }
  }

  async update(req, res, next) {
    try {
      const {
        id,
        name,
        description,
        countries,
        payForHour,
        salaryPerMonthFrom,
        salaryPerMonthTo,
        isFast,
      } = req.body

      const vacancy = await Vacancy.findOne({ where: { id } })
      if (!vacancy) {
        return next(ApiError.badRequest('Вибраної вакансії не існує'))
      }

      let imgVacancy = vacancy.imgVacancy
      let imgCountriesFlag = vacancy.imgCountriesFlag

      if (req.files) {
        if (req.files.imgVacancy) {
          const vacancyExtension = req.files.imgVacancy.name.split('.').pop()
          if (!['png', 'jpg', 'jpeg', 'webp'].includes(vacancyExtension)) {
            return next(
              ApiError.badRequest('Invalid file extension for imgVacancy'),
            )
          }

          // Видалення попереднього файлу imgVacancy
          const oldImgVacancyPath = path.resolve(
            __dirname,
            '..',
            'static',
            imgVacancy,
          )
          if (fs.existsSync(oldImgVacancyPath)) {
            fs.unlinkSync(oldImgVacancyPath)
          }

          imgVacancy = uuid.v4() + '.' + vacancyExtension
          await req.files.imgVacancy.mv(
            path.resolve(__dirname, '..', 'static', imgVacancy),
          )
        }

        if (req.files.imgCountriesFlag) {
          const countriesExtension = req.files.imgCountriesFlag.name
            .split('.')
            .pop()
          if (!['png', 'jpg', 'jpeg', 'webp'].includes(countriesExtension)) {
            return next(
              ApiError.badRequest(
                'Invalid file extension for imgCountriesFlag',
              ),
            )
          }

          // Видалення попереднього файлу imgCountriesFlag
          const oldImgCountriesFlagPath = path.resolve(
            __dirname,
            '..',
            'static',
            imgCountriesFlag,
          )
          if (fs.existsSync(oldImgCountriesFlagPath)) {
            fs.unlinkSync(oldImgCountriesFlagPath)
          }

          imgCountriesFlag = uuid.v4() + '.' + countriesExtension
          await req.files.imgCountriesFlag.mv(
            path.resolve(__dirname, '..', 'static', imgCountriesFlag),
          )
        }
      } else {
        imgVacancy = req.body.imgVacancy
        imgCountriesFlag = req.body.imgCountriesFlag
      }

      const updatedVacancy = await Vacancy.update(
        {
          name,
          description,
          countries,
          payForHour,
          salaryPerMonthFrom,
          salaryPerMonthTo,
          imgVacancy,
          imgCountriesFlag,
          isFast,
        },
        {
          where: { id },
        },
      )

      return res.json(updatedVacancy)
    } catch (e) {
      next(ApiError.badRequest(e.message))
    }
  }
}

module.exports = new VacancyController()
