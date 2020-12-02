const express=require('express');
const app=express();
const morgan=require('morgan');
const cors=require('cors');
const bodyParser=require('body-Parser');
const mongoose=require('mongoose');
require('dotenv').config();

// connect to DB
mongoose.connect(process.env.DATABASE,{
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}) 
.then(()=> console.log('DB connected'))
.catch(err=> console.log('DB CONNECTION ERROR:', err));

// importing routes
const authRoutes=require('./routes/auth');
const userRoutes=require('./routes/user');

// app middlewares
app.use(morgan('dev'));
app.use(bodyParser.json());
// app.use(cors());// allows all origins
if(process.env.NODE_ENV='development'){
    app.use(cors({origin:`http://localhost:3000`}));
}


//middleware
app.use(authRoutes);
app.use(userRoutes);

const port=process.env.PORT||8000;
app.listen(port,()=>{console.log(`API listening on PORT ${port} - ${process.env.NODE_ENV}`);
});
