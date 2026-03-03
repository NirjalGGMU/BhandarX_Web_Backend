const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../src/modules/auth/User.model');
const { ROLES } = require('../src/shared/constants');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const users = [
    {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: ROLES.ADMIN,
        phone: '9800000001',
        isActive: true,
    },
    {
        name: 'Employee User',
        email: 'employee@example.com',
        password: 'password123',
        role: ROLES.EMPLOYEE,
        phone: '9800000002',
        isActive: true,
    },
];

const seedDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ims';
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB for seeding...');

        // Delete existing users to avoid duplicates
        await User.deleteMany({ email: { $in: users.map(u => u.email) } });
        console.log('Cleaned up existing seed users...');

        // Create new users
        for (const userData of users) {
            const user = new User(userData);
            await user.save();
            console.log(`Created user: ${userData.name} with role: ${userData.role}`);
        }

        console.log('Successfully seeded database!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};
seedDB();
