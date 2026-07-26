const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

const User = require('./models/user');
const Recipe = require('./models/recipe');
const Review = require('./models/review');
const Rating = require('./models/rating');
const connectDB = require('./config/db');

const seedDB = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await Recipe.deleteMany();
    await Review.deleteMany();
    await Rating.deleteMany();

    console.log('Database cleared.');

    // Create a demo chef user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const chef = await User.create({
      name: 'Chef Mario',
      email: 'mario@chef.com',
      password: hashedPassword
    });

    const foodie = await User.create({
      name: 'Sarah Jenkins',
      email: 'sarah@foodie.com',
      password: hashedPassword
    });

    console.log('Users created.');

    // Define default recipes with the generated image filenames
    const recipes = [
      {
        title: 'Creamy Tuscan Garlic Chicken',
        description: 'Tender chicken breasts simmered in a rich, creamy sauce packed with garlic, sun-dried tomatoes, and fresh spinach. Perfect with pasta or crusty bread!',
        ingredients: [
          '2 large chicken breasts, halved horizontally',
          '1 tbsp olive oil',
          '1 cup heavy cream',
          '1/2 cup chicken broth',
          '1 tsp garlic powder',
          '1 cup fresh spinach leaves',
          '1/2 cup sun-dried tomatoes, drained and chopped',
          '1/2 cup grated parmesan cheese',
          '3 cloves garlic, minced'
        ],
        steps: [
          'Season chicken breasts with salt, pepper, and garlic powder on both sides.',
          'Heat olive oil in a large skillet over medium-high heat. Sear chicken for 5 minutes on each side until golden and cooked through. Remove chicken from skillet and set aside.',
          'In the same skillet, add minced garlic and sun-dried tomatoes. Sauté for 1 minute until fragrant.',
          'Pour in chicken broth, heavy cream, and grated parmesan. Bring to a simmer and let thicken for 3-4 minutes.',
          'Add fresh spinach and let it wilt in the sauce.',
          'Return chicken to the skillet, spoon the creamy sauce over the chicken, and simmer for another 2 minutes. Serve hot!'
        ],
        cookingTime: 30,
        category: 'Dinner',
        tags: ['chicken', 'italian', 'creamy', 'garlic'],
        image: '/uploads/garlic_chicken.png',
        author: chef._id,
        averageRating: 5.0
      },
      {
        title: 'Classic Fluffy Pancakes',
        description: 'Super thick, fluffy, and golden pancakes. A timeless breakfast classic that melts in your mouth. Serve with a generous dollop of butter and pure maple syrup!',
        ingredients: [
          '1.5 cups all-purpose flour',
          '3.5 tsp baking powder',
          '1 tbsp white sugar',
          '1 tsp salt',
          '1.25 cups milk',
          '1 egg',
          '3 tbsp butter, melted'
        ],
        steps: [
          'In a large bowl, sift together the flour, baking powder, sugar, and salt.',
          'Make a well in the center and pour in the milk, egg, and melted butter. Whisk until smooth (a few lumps are okay).',
          'Heat a lightly oiled griddle or frying pan over medium-high heat.',
          'Pour or scoop the batter onto the griddle, using approximately 1/4 cup for each pancake. Cook until bubbles form on the surface, then flip and cook until golden brown on the other side.',
          'Serve warm with maple syrup, butter, and fresh berries.'
        ],
        cookingTime: 20,
        category: 'Breakfast',
        tags: ['breakfast', 'sweet', 'fluffy', 'classic'],
        image: '/uploads/fluffy_pancakes.png',
        author: chef._id,
        averageRating: 4.0
      },
      {
        title: 'Triple Chocolate Fudge Brownies',
        description: 'Rich, chewy, and loaded with chocolate chips. These brownies have a perfect crinkly top and a dense, fudgy center that chocolate lovers will adore.',
        ingredients: [
          '1/2 cup unsalted butter, melted',
          '1 cup granulated sugar',
          '2 large eggs',
          '1 tsp vanilla extract',
          '1/3 cup unsweetened cocoa powder',
          '1/2 cup all-purpose flour',
          '1/4 tsp salt',
          '1/4 tsp baking powder',
          '1/2 cup chocolate chips'
        ],
        steps: [
          'Preheat oven to 350°F (175°C). Grease an 8x8 inch square baking dish.',
          'In a medium bowl, blend melted butter, sugar, eggs, and vanilla extract.',
          'Beat in cocoa powder, flour, salt, and baking powder until just combined. Do not overmix.',
          'Gently fold in chocolate chips.',
          'Spread batter evenly into the prepared baking dish.',
          'Bake in preheated oven for 20 to 22 minutes until a toothpick inserted in the center comes out with a few fudgy crumbs. Let cool completely before slicing.'
        ],
        cookingTime: 45,
        category: 'Dessert',
        tags: ['chocolate', 'sweet', 'baking', 'dessert'],
        image: '/uploads/chocolate_brownies.png',
        author: foodie._id,
        averageRating: 5.0
      },
      {
        title: 'Spicy Thai Basil Chicken',
        description: 'A classic street food dish from Thailand. Minced chicken stir-fried with hot chilies, garlic, and fresh holy basil, served next to warm jasmine rice and topped with a crispy fried egg.',
        ingredients: [
          '1 lb ground chicken',
          '2 tbsp oyster sauce',
          '1 tbsp soy sauce',
          '1 tsp dark soy sauce',
          '1 tbsp fish sauce',
          '2 tbsp vegetable oil',
          '5 cloves garlic, minced',
          '4 Thai bird\'s eye chilies, minced',
          '1 cup fresh holy basil leaves',
          '1 egg (for frying)'
        ],
        steps: [
          'In a small bowl, mix together oyster sauce, soy sauce, dark soy sauce, and fish sauce.',
          'Heat vegetable oil in a wok or large skillet over high heat. Add garlic and minced chilies. Stir-fry for 30 seconds until fragrant.',
          'Add ground chicken and stir-fry, breaking it up with a spatula, until cooked through (about 4-5 minutes).',
          'Pour in the sauce mixture and toss to coat the chicken evenly.',
          'Turn off the heat and stir in the holy basil leaves until wilted.',
          'In a separate pan, fry an egg in hot oil until edges are crispy and yolk is still runny.',
          'Serve the basil chicken over jasmine rice, topped with the fried egg.'
        ],
        cookingTime: 15,
        category: 'Lunch',
        tags: ['spicy', 'thai', 'asian', 'lunch'],
        image: '/uploads/thai_basil_chicken.png',
        author: chef._id,
        averageRating: 4.7
      },
      {
        title: 'Avocado Toast with Poached Egg',
        description: 'Creamy avocado mash spread over toasted artisanal sourdough bread, topped with a warm poached egg, red pepper flakes, and organic microgreens.',
        ingredients: [
          '2 slices artisanal sourdough bread',
          '1 ripe avocado',
          '1/2 lemon, juiced',
          '2 large eggs',
          '1 tbsp vinegar (for poaching)',
          '1/2 tsp red pepper flakes',
          'Salt and black pepper to taste',
          'A handful of microgreens or sprouts'
        ],
        steps: [
          'Cut open the avocado, remove the pit, and scoop the flesh into a bowl.',
          'Add lemon juice, salt, and black pepper, and mash with a fork until chunky-smooth.',
          'Toast the sourdough bread slices until golden and crisp.',
          'Bring a pot of water to a gentle simmer. Add vinegar. Swirl the water to create a gentle vortex and slide in the eggs. Poach for 3 minutes. Remove with a slotted spoon.',
          'Spread the mashed avocado evenly over the toasted bread slices.',
          'Top each toast with a poached egg.',
          'Garnish with red pepper flakes, freshly ground black pepper, and microgreens. Serve immediately!'
        ],
        cookingTime: 15,
        category: 'Breakfast',
        tags: ['breakfast', 'healthy', 'avocado', 'egg'],
        image: '/uploads/avocado_toast.png',
        author: foodie._id,
        averageRating: 4.9
      },
      {
        title: 'Classic New York Cheesecake',
        description: 'Rich, dense, and ultra-creamy cheesecake baked on a buttery graham cracker crust, topped with fresh strawberry compote.',
        ingredients: [
          '2 cups graham cracker crumbs',
          '1/2 cup unsalted butter, melted',
          '32 oz cream cheese, softened',
          '1 cup granulated sugar',
          '1 cup sour cream',
          '1 tsp vanilla extract',
          '4 large eggs',
          '1 cup fresh strawberries, sliced',
          '2 tbsp strawberry jam'
        ],
        steps: [
          'Preheat oven to 325°F (160°C). Wrap the outside of a 9-inch springform pan with heavy-duty foil.',
          'Mix graham cracker crumbs and melted butter. Press firmly into the bottom of the pan. Bake for 10 minutes, then let cool.',
          'In a large bowl, beat the softened cream cheese and sugar together until completely smooth.',
          'Add sour cream and vanilla extract. Beat until blended.',
          'Add eggs one at a time, mixing on low speed just until combined (do not overmix).',
          'Pour batter over the crust. Place springform pan in a large roasting pan and fill with hot water halfway up the sides of the pan (water bath).',
          'Bake for 75 to 80 minutes until the edges are set and center is slightly jiggly. Turn off oven, crack the door, and let cool inside for 1 hour. Chill in fridge for at least 4 hours.',
          'Serve topped with sliced strawberries tossed with strawberry jam.'
        ],
        cookingTime: 75,
        category: 'Dessert',
        tags: ['cheese', 'sweet', 'baking', 'classic'],
        image: '/uploads/ny_cheesecake.png',
        author: foodie._id,
        averageRating: 4.8
      },
      {
        title: 'Refreshing Mango Mint Mojito',
        description: 'A tropical twist on the classic Cuban mojito. Ripe sweet mango puree muddled with fresh mint, lime juice, and topped with sparkling soda water.',
        ingredients: [
          '1/2 cup ripe mango chunks, pureed',
          '10 fresh mint leaves',
          '1/2 lime, cut into wedges',
          '1 tbsp sugar or simple syrup',
          '1 cup sparkling club soda',
          '1/2 cup crushed ice'
        ],
        steps: [
          'In a tall serving glass, add lime wedges, fresh mint leaves, and sugar.',
          'Muddle gently with a muddler or wooden spoon handle to release the lime juices and mint oils.',
          'Stir in the fresh mango puree.',
          'Fill the glass with crushed ice.',
          'Top with sparkling club soda and stir gently to combine.',
          'Garnish with a sprig of fresh mint and a lime wheel. Serve ice cold!'
        ],
        cookingTime: 10,
        category: 'Drinks',
        tags: ['mango', 'mint', 'refreshing', 'drinks'],
        image: '/uploads/mango_mojito.png',
        author: chef._id,
        averageRating: 4.6
      }
    ];

    // Map recipes to read local images and save as binary buffers
    const recipesWithImages = recipes.map(recipe => {
      const recipeId = new mongoose.Types.ObjectId();
      const relativePath = recipe.image.replace('/uploads/', '');
      const absoluteImagePath = path.join(__dirname, 'uploads', relativePath);
      let fileBuffer;
      try {
        fileBuffer = fs.readFileSync(absoluteImagePath);
      } catch (err) {
        console.warn(`Warning: Could not read seed image at ${absoluteImagePath}`);
        fileBuffer = Buffer.alloc(0);
      }
      return {
        ...recipe,
        _id: recipeId,
        image: `/api/recipes/${recipeId}/image`,
        imageData: fileBuffer,
        imageContentType: 'image/png'
      };
    });

    const createdRecipes = await Recipe.insertMany(recipesWithImages);
    console.log('Recipes seeded.');

    // Seed some ratings & reviews
    await Rating.create({ recipe: createdRecipes[0]._id, user: foodie._id, rating: 5 });
    await Rating.create({ recipe: createdRecipes[1]._id, user: foodie._id, rating: 4 });
    await Rating.create({ recipe: createdRecipes[2]._id, user: chef._id, rating: 5 });

    await Review.create({
      recipe: createdRecipes[0]._id,
      user: foodie._id,
      comment: 'This was incredibly easy to make and my family absolutely loved it! Will definitely be cooking this again.'
    });

    await Review.create({
      recipe: createdRecipes[1]._id,
      user: foodie._id,
      comment: 'Super fluffy as promised. I added chocolate chips to mine and they turned out perfect.'
    });

    await Review.create({
      recipe: createdRecipes[2]._id,
      user: chef._id,
      comment: 'Perfect fudgy consistency. Baking time was exact. Great dessert!'
    });

    console.log('Reviews and ratings seeded.');
    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error.message);
    process.exit(1);
  }
};

seedDB();
