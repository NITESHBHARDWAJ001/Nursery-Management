const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Import models
const User = require('./models/User');
const Plant = require('./models/Plant');

// Sample users
const users = [
  {
    name: 'Admin',
    email: 'admin@greenhaven.com',
    password: 'admin123',
    phoneNumber: '+1234567890',
    address: 'Green Haven Nursery HQ',
    role: 'admin',
    preferredPlantType: 'all'
  },
  {
    name: 'John Doe',
    email: 'user@example.com',
    password: 'user123',
    phoneNumber: '+1987654321',
    address: '123 Garden Street, Green City',
    role: 'user',
    preferredPlantType: 'indoor'
  }
];

// Sample plants
const plants = [
  {
    name: 'Monstera Deliciosa',
    category: 'indoor',
    description: 'A stunning tropical plant with large, heart-shaped leaves that develop natural holes as they mature. Perfect for adding a bold statement to any room.',
    price: 499,
    quantityAvailable: 25,
    lowStockThreshold: 10,
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800',
    careLevel: 'easy',
    sunlight: 'partial-sun',
    wateringFrequency: 'Once a week',
    height: '2-3 feet',
    growthTime: '2-3 months',
    plantType: 'evergreen',
    features: ['Air purifying', 'Easy to care', 'Fast growing', 'Pet friendly']
  },
  {
    name: 'Snake Plant',
    category: 'indoor',
    description: 'One of the most resilient houseplants with striking upright leaves. Excellent for beginners and low-light conditions.',
    price: 299,
    quantityAvailable: 40,
    lowStockThreshold: 15,
    imageUrl: 'https://images.unsplash.com/photo-1593482892540-75a8f1c5d0b7?w=800',
    careLevel: 'easy',
    sunlight: 'shade',
    wateringFrequency: 'Every 2 weeks',
    height: '1-2 feet',
    growthTime: '3-4 months',
    plantType: 'perennial',
    features: ['Air purifying', 'Low maintenance', 'Drought tolerant', 'Beginner friendly']
  },
  {
    name: 'Fiddle Leaf Fig',
    category: 'indoor',
    description: 'A popular choice with large, violin-shaped leaves. Makes a stunning focal point in living rooms and offices.',
    price: 799,
    quantityAvailable: 15,
    lowStockThreshold: 8,
    imageUrl: 'https://images.unsplash.com/photo-1614594895304-fe7116ac3b58?w=800',
    careLevel: 'medium',
    sunlight: 'partial-sun',
    wateringFrequency: 'Once a week',
    height: '3-6 feet',
    growthTime: '4-6 months',
    plantType: 'evergreen',
    features: ['Statement piece', 'Air purifying', 'Large leaves', 'Indoor tree']
  },
  {
    name: 'Peace Lily',
    category: 'flowering',
    description: 'Beautiful flowering plant with glossy green leaves and elegant white blooms. Thrives in low light and purifies air.',
    price: 349,
    quantityAvailable: 30,
    lowStockThreshold: 12,
    imageUrl: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800',
    careLevel: 'easy',
    sunlight: 'shade',
    wateringFrequency: 'Twice a week',
    height: '1-2 feet',
    growthTime: '2-3 months',
    plantType: 'perennial',
    features: ['Air purifying', 'Low light tolerant', 'Beautiful flowers', 'Easy care']
  },
  {
    name: 'Aloe Vera',
    category: 'succulent',
    description: 'A versatile succulent with medicinal properties. Perfect for sunny spots and requires minimal watering.',
    price: 199,
    quantityAvailable: 50,
    lowStockThreshold: 20,
    imageUrl: 'https://images.unsplash.com/photo-1596548438137-d51ea5c83ca5?w=800',
    careLevel: 'easy',
    sunlight: 'full-sun',
    wateringFrequency: 'Every 3 weeks',
    height: '1-2 feet',
    growthTime: '3-5 months',
    plantType: 'perennial',
    features: ['Medicinal', 'Low maintenance', 'Drought tolerant', 'Air purifying']
  },
  {
    name: 'Rose Bush',
    category: 'outdoor',
    description: 'Classic flowering plant with fragrant blooms in various colors. Perfect for gardens and outdoor spaces.',
    price: 599,
    quantityAvailable: 20,
    lowStockThreshold: 10,
    imageUrl: 'https://images.unsplash.com/photo-1518709594023-6eab9bab7b23?w=800',
    careLevel: 'medium',
    sunlight: 'full-sun',
    wateringFrequency: 'Every 2 days',
    height: '2-4 feet',
    growthTime: '4-6 months',
    plantType: 'deciduous',
    features: ['Fragrant blooms', 'Multiple colors', 'Garden favorite', 'Attracts butterflies']
  },
  {
    name: 'Lavender',
    category: 'herb',
    description: 'Aromatic herb with purple flowers. Great for cooking, aromatherapy, and attracting pollinators.',
    price: 249,
    quantityAvailable: 35,
    lowStockThreshold: 15,
    imageUrl: 'https://images.unsplash.com/photo-1611251157801-7901c4011525?w=800',
    careLevel: 'medium',
    sunlight: 'full-sun',
    wateringFrequency: 'Twice a week',
    height: '1-2 feet',
    growthTime: '3-4 months',
    plantType: 'perennial',
    features: ['Aromatic', 'Culinary use', 'Attracts bees', 'Medicinal']
  },
  {
    name: 'Bonsai Ficus',
    category: 'bonsai',
    description: 'Miniature tree perfect for indoor decoration. Requires patience and regular pruning.',
    price: 899,
    quantityAvailable: 10,
    lowStockThreshold: 5,
    imageUrl: 'https://images.unsplash.com/photo-1585074968803-ef2937ff0977?w=800',
    careLevel: 'hard',
    sunlight: 'partial-sun',
    wateringFrequency: 'Every 2 days',
    height: '8-12 inches',
    growthTime: '6-12 months',
    plantType: 'evergreen',
    features: ['Artistic', 'Indoor tree', 'Zen aesthetic', 'Requires pruning']
  },
  {
    name: 'Bamboo Palm',
    category: 'indoor',
    description: 'Elegant palm with bamboo-like stems. Excellent air purifier and adds tropical vibes.',
    price: 649,
    quantityAvailable: 18,
    lowStockThreshold: 8,
    imageUrl: 'https://images.unsplash.com/photo-1509937528035-ad76254b0356?w=800',
    careLevel: 'easy',
    sunlight: 'partial-sun',
    wateringFrequency: 'Twice a week',
    height: '3-5 feet',
    growthTime: '4-6 months',
    plantType: 'evergreen',
    features: ['Air purifying', 'Tropical look', 'Pet safe', 'Low maintenance']
  },
  {
    name: 'Jade Plant',
    category: 'succulent',
    description: 'Lucky plant with thick, glossy leaves. Symbol of prosperity and good fortune.',
    price: 279,
    quantityAvailable: 28,
    lowStockThreshold: 12,
    imageUrl: 'https://images.unsplash.com/photo-1459156212016-c812468e2115?w=800',
    careLevel: 'easy',
    sunlight: 'full-sun',
    wateringFrequency: 'Once a week',
    height: '1-2 feet',
    growthTime: '3-5 months',
    plantType: 'perennial',
    features: ['Good luck plant', 'Low maintenance', 'Drought tolerant', 'Easy propagation']
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('\n🧹 Clearing existing data...');
    await User.deleteMany({});
    await Plant.deleteMany({});
    console.log('✅ Existing data cleared');

    // Create users
    console.log('\n👥 Creating users...');
    for (let userData of users) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
    }
    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Create plants
    console.log('\n🌱 Creating plants...');
    const createdPlants = await Plant.insertMany(plants);
    console.log(`✅ Created ${createdPlants.length} plants`);

    // Summary
    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${createdUsers.length}`);
    console.log(`   Plants: ${createdPlants.length}`);
    
    console.log('\n🔑 Login Credentials:');
    console.log('\n   Admin:');
    console.log('   Email: admin@greenhaven.com');
    console.log('   Password: admin123');
    console.log('\n   User:');
    console.log('   Email: user@example.com');
    console.log('   Password: user123');
    
    console.log('\n⚠️  Remember to change these passwords in production!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeder
seedDatabase();
