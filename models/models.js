const sequelize = require('../db')

const { DataTypes } = require('sequelize')

const User = sequelize.define('user', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, unique: true },
  password: { type: DataTypes.STRING },
  role: { type: DataTypes.STRING, defaultValue: 'ADMIN' },
})

const Vacancy = sequelize.define('vacancy', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, unique: true, allowNull: false },
  description: { type: DataTypes.STRING, allowNull: false },
  isFast: { type: DataTypes.BOOLEAN, allowNull: false },
  countries: { type: DataTypes.STRING, allowNull: false },
  payForHour: { type: DataTypes.STRING, allowNull: false },
  salaryPerMonthFrom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  salaryPerMonthTo: { type: DataTypes.STRING, allowNull: false },
  imgVacancy: { type: DataTypes.STRING, allowNull: false },
  imgCountriesFlag: { type: DataTypes.STRING, allowNull: false },
})

module.exports = { User, Vacancy }
