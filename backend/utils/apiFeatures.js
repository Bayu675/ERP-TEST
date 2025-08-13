// utils/apiFeatures.js
const { Op } = require('sequelize');

class APIFeatures {
  constructor(model, queryString) {
    this.model = model;
    this.queryString = queryString;
    this.queryOptions = { include: [] };
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    const whereClause = {};
    const relationFilters = ['brand', 'subcategory', 'category', 'uom', 'tax'];

    for (const key in queryObj) {
      const value = queryObj[key];

      if (relationFilters.includes(key)) {
        // Jangan bikin where kosong di include
        if (value && value.trim() !== '') {
          this.queryOptions.include.push({
            association: key,
            where: { name: value },
            required: true
          });
        } else {
          this.queryOptions.include.push({ association: key });
        }
        continue;
      }

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const subQuery = {};
        for (const operator in value) {
          const opSymbol = Op[operator] || operator;
          subQuery[opSymbol] = value[operator];
        }
        if (Object.keys(subQuery).length > 0) {
          whereClause[key] = subQuery;
        }
      } else if (value && value.trim() !== '') {
        whereClause[key] = value;
      }
    }

    if (Object.keys(whereClause).length > 0) {
      this.queryOptions.where = whereClause;
    }

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').map(field =>
        field.startsWith('-') ? [field.substring(1), 'DESC'] : [field, 'ASC']
      );
      this.queryOptions.order = sortBy;
    } else {
      this.queryOptions.order = [['createdAt', 'DESC']];
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      this.queryOptions.attributes = this.queryString.fields.split(',');
    } else {
      this.queryOptions.attributes = { exclude: ['password'] };
    }
    return this;
  }

  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 100;
    const offset = (page - 1) * limit;
    this.queryOptions.limit = limit;
    this.queryOptions.offset = offset;
    return this;
  }
}

module.exports = APIFeatures;
