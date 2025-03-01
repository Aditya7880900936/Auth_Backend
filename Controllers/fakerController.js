const { faker } = require('@faker-js/faker');
const Category = require('../Models/Categories');
exports.getFakeData = (req, res) => {
    try {
        const categories = Array.from({ length: 100 }, () => ({
            name: faker.commerce.department()
        }));
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error generating fake data', error });
    }
};

exports.saveCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Category name is required' });
        }
        const category = new Category({ name });
        await category.save();
        res.status(201).json({ message: 'Category saved successfully', category });
    } catch (error) {
        res.status(500).json({ message: 'Error saving category', error });
    }
};
