mongoose = require('mongoose');

const service_category_schema = new mongoose.Schema(
  {
    category_name: {
      type: String,
      required: true
    },

    description: {
      type: String,
      required: true
    },

    basic_amount: {
      full_day: {
        type: Number
      },
      half_day: {
        type: Number
       
      }
    }
  },
  { timestamps: true }
);

const service_category = mongoose.model(
  'service_category',
  service_category_schema
);

module.exports = service_category;
