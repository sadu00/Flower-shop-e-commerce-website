const mongoose = require('mongoose');
require('dotenv').config();
const { Product } = require('./models/Schemas');

const sampleProducts = [
  {
    title: 'Royal Red Rose Bouquet',
    price: 1850,
    category: 'Romance',
    description: 'A luxurious bouquet of premium red roses wrapped in black paper with satin ribbon.',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800'
  },


  {
  title: 'Pink Tulips & Eucalyptus',
  price: 2400, // সরাসরি টাকায় দাম
  category: 'Spring',
  description: 'Fresh pink tulips wrapped in aesthetic kraft paper.',
  imageUrl: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=800'
},
{
  title: 'Classic Red Rose Stand',
  price: 3500,
  category: 'Luxury',
  description: 'Premium long stem red roses in a deluxe box.',
  imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800'
},
  {
    title: 'Pastel Pink Tulip Dream',
    price: 2200,
    category: 'Spring',
    description: 'Fresh pastel pink tulips elegantly arranged in natural kraft wrapping.',
    imageUrl: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=800'
  },
  {
    title: 'Golden Sunflower Glow',
    price: 1500,
    category: 'Birthday',
    description: 'Vibrant sunflowers paired with baby breath flowers to brighten anyone\'s day.',
    imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=800'
  },
  {
    title: 'Elegant White Lily & Rose',
    price: 2600,
    category: 'Wedding',
    description: 'Pure white lilies combined with blush pink roses and fresh eucalyptus leaves.',
    imageUrl: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800'
  },
  {
    title: 'Exotic Orchid Symphony',
    price: 3200,
    category: 'Luxury',
    description: 'Handcrafted arrangement of exotic purple orchids for special moments.',
    imageUrl: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=800'
  }
];

const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/flowershop';

mongoose.connect(mongoURI)
  .then(async () => {
    console.log('MongoDB Connected Successfully');
    await Product.deleteMany({});
    await Product.insertMany(sampleProducts);
    console.log('🌸 Beautiful BDT Flower Bouquets Added Successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error adding seed data:', err);
    process.exit(1);
  });