const { time } = require('console');
const express = require('express');
const morgan = require('morgan');
const { dirname } = require('path');
const userRouter=require("./routes/userRoutes")
const app = express();
const AppError=require('./utils/appError')
const globalErrorHandler=require('./controller/errorController')
// MIDDLEWARE

app.use(morgan('dev'))
app.use(express.json());
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// ROUTERS
app.use('/api/v1/users',userRouter)

app.all('*',(req,res,next)=>{
  next(new AppError(`Can't find ${req.originalUrl} on this server.`),404)
})

app.use(globalErrorHandler)
module.exports=app