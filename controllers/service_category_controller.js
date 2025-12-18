const service_category = require("../models/service_category_model");

exports.createcategory = async (req, res) => {
  try {
    const { category_name,description} = req.body;
    const newcategory = new service_category({
    category_name,
    description
    });
    await newcategory.save();
    res
      .status(200)
      .json({ message: 'category  registered successfully', category: newcategory });
  } catch (err) {
    console.error('Error in createcategory:', err);
    res.status(500).json({ message: err.message });
  }
}
exports.viewAllCategory = async (req, res) => {
  try {
    const findcategory = await service_category.find();
    if(findcategory==0)
      return res.status(200).json({message:"there are no category registered"})
    return res.status(200).json({ message: 'Success', data: findcategory });
  } catch (err) {
    return res
      .status(500)
      .json({ message: `Server error: ${err.message}` });
  }
};
// update SINGLE CATEGORY BY ID

exports.updatecategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_name,description } = req.body;
    updateData={ category_name,description }
    const updatedCategory = await service_category.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );
    if (!updatedCategory) return res.status(404).json({ message: "Category  not found" });

    res.status(200).json(updatedCategory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Delete category
exports.deleteCategory = async (req, res) => {
  try {const service_category = require("../models/service_category_model");

// CREATE CATEGORY
exports.createcategory = async (req, res) => {
  try {
    const { category_name, description, basic_amount } = req.body;

    if (
      !category_name ||
      !description ||
      basic_amount == null ||
      basic_amount.full_day == null ||
      basic_amount.half_day == null
    ) {
      return res.status(400).json({
        message: "All fields including full_day and half_day are required"
      });
    }

    const newcategory = new service_category({
      category_name,
      description,
      basic_amount: {
        full_day: Number(basic_amount.full_day),
        half_day: Number(basic_amount.half_day)
      }
    });

    await newcategory.save();

    res.status(201).json({
      message: "Category registered successfully",
      category: newcategory
    });
  } catch (err) {
    console.error("Error in createcategory:", err);
    res.status(500).json({ message: err.message });
  }
};

// VIEW ALL CATEGORY
exports.viewAllCategory = async (req, res) => {
  try {
    const categories = await service_category.find();

    if (categories.length === 0) {
      return res.status(200).json({
        message: "No categories found",
        data: []
      });
    }

    res.status(200).json({
      message: "Success",
      data: categories
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE CATEGORY
exports.updatecategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_name, description, basic_amount } = req.body;

    const updatedCategory = await service_category.findByIdAndUpdate(
      id,
      {
        category_name,
        description,
        basic_amount
      },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({
      message: "Category updated successfully",
      data: updatedCategory
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE CATEGORY
exports.deleteCategory = async (req, res) => {
  try {
    const deletedcategory = await service_category.findByIdAndDelete(req.params.id);

    if (!deletedcategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({
      message: "Category deleted successfully"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

  
    const deletedcategory = await service_category.findByIdAndDelete(req.params.id);

    if (!deletedcategory)
      return res.status(404).json({ message: "Category not found" });

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};