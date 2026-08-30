require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();

// ---------------- Middleware ----------------

app.use(express.json());
app.use(cors());

// Images folder
app.use('/images', express.static('images'));

// ---------------- JWT Secret ----------------

const JWT_SECRET = process.env.JWT_SECRET || 'flora_fleur_secret_key_123';

// ---------------- JWT Authentication Middleware ----------------

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            message: 'Access Token Required'
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                message: 'Invalid or Expired Token'
            });
        }

        req.user = user;
        next();
    });
};


// ============================================================
//                       MONGODB MODELS
// ============================================================

// ---------------- User Model ----------------

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        default: 'customer'
    },

    phone: {
        type: String,
        default: ''
    },

    address: {
        type: String,
        default: ''
    }
});


// ---------------- Product Model ----------------

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    category: {
        type: String,
        required: true
    },

    imageUrl: {
        type: String,
        required: true
    },

    description: {
        type: String,
        default: ''
    }
});


// ---------------- Order Model ----------------

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    customerName: String,

    phone: String,

    address: String,

    items: Array,

    totalAmount: Number,

    paymentMethod: String,

    paymentInfo: String,

    status: {
        type: String,
        default: 'Pending'
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});


// ---------------- Message Model ----------------

const messageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    senderName: String,

    text: String,

    isAdmin: {
        type: Boolean,
        default: false
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});


// ---------------- Review Model ----------------

const reviewSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    userName: String,

    rating: {
        type: Number,
        required: true
    },

    comment: String,

    createdAt: {
        type: Date,
        default: Date.now
    }
});


// ---------------- Create Models ----------------

const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);
const Message = mongoose.model('Message', messageSchema);
const Review = mongoose.model('Review', reviewSchema);


// ============================================================
//                       AUTH ROUTES
// ============================================================

// ---------------- Register ----------------

app.post('/api/auth/register', async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            role
        } = req.body;

        const existingUser = await User.findOne({
            email
        });

        if (existingUser) {
            return res.status(400).json({
                message: 'User already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'customer'
        });

        await user.save();

        res.status(201).json({
            message: 'User registered successfully'
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

});


// ---------------- Login ----------------

app.post('/api/auth/login', async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;

        const user = await User.findOne({
            email
        });

        if (!user) {
            return res.status(400).json({
                message: 'Invalid credentials'
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: 'Invalid credentials'
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            JWT_SECRET,
            {
                expiresIn: '1d'
            }
        );

        res.json({

            token,

            user: {

                id: user._id,

                _id: user._id,

                name: user.name,

                email: user.email,

                phone: user.phone || '',

                address: user.address || '',

                role: user.role

            }

        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

});


// ============================================================
//                       PROFILE ROUTES
// ============================================================

// ---------------- Get Profile ----------------

app.get(
    '/api/users/profile',
    authenticateToken,
    async (req, res) => {

        try {

            const userId =
                req.user.id || req.user._id;

            const user =
                await User.findById(userId)
                    .select('-password');

            if (!user) {

                return res.status(404).json({
                    message: 'User not found'
                });

            }

            res.json(user);

        } catch (err) {

            res.status(500).json({
                message: 'Error fetching profile'
            });

        }

    }
);


// ---------------- Update Profile ----------------

app.put(
    '/api/users/profile',
    authenticateToken,
    async (req, res) => {

        try {

            const userId =
                req.user.id || req.user._id;

            const user =
                await User.findById(userId);

            if (!user) {

                return res.status(404).json({
                    message: 'User not found'
                });

            }

            user.name =
                req.body.name || user.name;

            user.phone =
                req.body.phone !== undefined
                    ? req.body.phone
                    : user.phone;

            user.address =
                req.body.address !== undefined
                    ? req.body.address
                    : user.address;

            if (
                req.body.password &&
                req.body.password.trim() !== ''
            ) {

                user.password =
                    await bcrypt.hash(
                        req.body.password,
                        10
                    );

            }

            const updatedUser =
                await user.save();

            res.json({

                message: 'Profile updated successfully',

                user: {

                    _id: updatedUser._id,

                    id: updatedUser._id,

                    name: updatedUser.name,

                    email: updatedUser.email,

                    phone: updatedUser.phone,

                    address: updatedUser.address,

                    role: updatedUser.role

                }

            });

        } catch (error) {

            res.status(500).json({

                message: 'Error updating profile',

                error: error.message

            });

        }

    }
);


// ============================================================
//                       PRODUCT ROUTES
// ============================================================

// ---------------- Get All Products ----------------

app.get('/api/products', async (req, res) => {

    try {

        const products =
            await Product.find();

        res.json(products);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

});


// ---------------- Add Product ----------------

app.post('/api/products', async (req, res) => {

    try {

        const product =
            new Product(req.body);

        await product.save();

        res.status(201).json(product);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

});


// ---------------- Update Product ----------------

app.put('/api/products/:id', async (req, res) => {

    try {

        const updatedProduct =
            await Product.findByIdAndUpdate(
                req.params.id,
                req.body,
                {
                    new: true
                }
            );

        res.json(updatedProduct);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

});


// ---------------- Delete Product ----------------

app.delete('/api/products/:id', async (req, res) => {

    try {

        await Product.findByIdAndDelete(
            req.params.id
        );

        res.json({
            message: 'Product deleted'
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

});


// ============================================================
//                       ORDER ROUTES
// ============================================================

// ---------------- My Orders ----------------

app.get(
    '/api/orders/my-orders',
    authenticateToken,
    async (req, res) => {

        try {

            const userId =
                req.user.id || req.user._id;

            const orders =
                await Order.find({

                    $or: [
                        {
                            userId: userId
                        },
                        {
                            customerName:
                                req.user.name
                        }
                    ]

                }).sort({
                    createdAt: -1
                });

            res.json(orders);

        } catch (err) {

            res.status(500).json({
                message:
                    'Server error while fetching orders'
            });

        }

    }
);


// ---------------- Get All Orders ----------------

app.get('/api/orders', async (req, res) => {

    try {

        const orders =
            await Order.find()
                .sort({
                    createdAt: -1
                });

        res.json(orders);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

});


// ---------------- Create Order ----------------

app.post('/api/orders', async (req, res) => {

    try {

        const order =
            new Order(req.body);

        await order.save();

        res.status(201).json(order);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

});


// ---------------- Update Order Status ----------------

app.put(
    '/api/orders/:id/status',
    async (req, res) => {

        try {

            const order =
                await Order.findByIdAndUpdate(

                    req.params.id,

                    {
                        status:
                            req.body.status
                    },

                    {
                        new: true
                    }

                );

            res.json(order);

        } catch (err) {

            res.status(500).json({
                message: err.message
            });

        }

    }
);


// ---------------- Delete Order ----------------

app.delete('/api/orders/:id', async (req, res) => {

    try {

        await Order.findByIdAndDelete(
            req.params.id
        );

        res.json({
            message: 'Order deleted'
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

});


// ============================================================
//                       REVIEW ROUTES
// ============================================================

// ---------------- Get Product Reviews ----------------

app.get(
    '/api/reviews/product/:id',
    async (req, res) => {

        try {

            const reviews =
                await Review.find({
                    productId: req.params.id
                });

            const count =
                reviews.length;

            const average =
                count > 0
                    ? (
                        reviews.reduce(
                            (acc, item) =>
                                item.rating + acc,
                            0
                        ) / count
                    ).toFixed(1)
                    : 0;

            res.json({

                reviews,

                stats: {
                    average:
                        Number(average),

                    count
                }

            });

        } catch (err) {

            res.status(500).json({
                message:
                    'Error loading reviews'
            });

        }

    }
);


// ============================================================
//                       CHAT / MESSAGE ROUTES
// ============================================================

// ---------------- Send Message ----------------

app.post(
    '/api/messages/send',
    authenticateToken,
    async (req, res) => {

        try {

            const userId =
                req.user.id || req.user._id;

            const user =
                await User.findById(userId);

            const {
                text
            } = req.body;

            const msg =
                new Message({

                    userId: userId,

                    senderName:
                        user
                            ? user.name
                            : 'Customer',

                    text: text,

                    isAdmin: false

                });

            await msg.save();

            res.status(201).json(msg);

        } catch (err) {

            res.status(500).json({

                message:
                    'Error sending message',

                error:
                    err.message

            });

        }

    }
);


// ---------------- My Messages ----------------

app.get(
    '/api/messages/my-messages',
    authenticateToken,
    async (req, res) => {

        try {

            const userId =
                req.user.id || req.user._id;

            const messages =
                await Message.find({
                    userId: userId
                }).sort({
                    createdAt: 1
                });

            res.json(messages);

        } catch (err) {

            res.status(500).json({
                message:
                    'Error fetching messages'
            });

        }

    }
);


// ---------------- Messages ----------------

app.get(
    '/api/messages',
    authenticateToken,
    async (req, res) => {

        try {

            const userId =
                req.user.id || req.user._id;

            const messages =
                await Message.find({
                    userId: userId
                }).sort({
                    createdAt: 1
                });

            res.json(messages);

        } catch (err) {

            res.status(500).json({
                message:
                    'Error fetching messages'
            });

        }

    }
);


// ---------------- Admin: User List ----------------

app.get(
    '/api/messages/users',
    async (req, res) => {

        try {

            const users =
                await User.find({
                    role: 'customer'
                }).select(
                    'name email _id'
                );

            res.json(users);

        } catch (err) {

            res.status(500).json({
                message: err.message
            });

        }

    }
);


// ---------------- Admin: Specific User Messages ----------------

app.get(
    '/api/messages/user/:userId',
    async (req, res) => {

        try {

            const messages =
                await Message.find({
                    userId:
                        req.params.userId
                }).sort({
                    createdAt: 1
                });

            res.json(messages);

        } catch (err) {

            res.status(500).json({
                message: err.message
            });

        }

    }
);


// ---------------- Admin Reply ----------------

app.post(
    '/api/messages/reply',
    async (req, res) => {

        try {

            const {
                userId,
                text
            } = req.body;

            const msg =
                new Message({

                    userId,

                    senderName: 'Admin',

                    text,

                    isAdmin: true

                });

            await msg.save();

            res.status(201).json(msg);

        } catch (err) {

            res.status(500).json({
                message: err.message
            });

        }

    }
);


// ============================================================
//                MONGODB CONNECTION & SERVER
// ============================================================

const MONGO_URI =
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    'mongodb+srv://saduaadmin:sadia77@cluster0.ykv8qem.mongodb.net/flora_fleur?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)

    .then(() => {

        console.log(
            '✅ MongoDB Connected Successfully!'
        );

    })

    .catch((err) => {

        console.error(
            '❌ MongoDB Connection Error:',
            err.message
        );

    });


const PORT =
    process.env.PORT || 5000;


// ---------------- Local vs Vercel ----------------
// Vercel serverless environment এ app.listen() চালানো যায় না।
// শুধু local development এ (VERCEL env var না থাকলে) server চালু হবে।

if (!process.env.VERCEL) {

    app.listen(
        PORT,
        '0.0.0.0',
        () => {

            console.log(
                `🚀 Server running on port ${PORT}`
            );

        }
    );

}
app.get('/', (req, res) => {
  res.send("Backend server is live and working!");
});

// Vercel কে app টা serverless function হিসেবে ব্যবহার করতে দিতে export করা lagbe
module.exports = app;