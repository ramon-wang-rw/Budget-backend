const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const User = require('./models/user.model')
const Budget = require('./models/budget.model')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

app.use(cors())
app.use(express.json())

//environment variables
require('dotenv').config();

//database connection

const uri = process.env.ATLAS_URI;

mongoose.connect(uri);

const connection = mongoose.connection;

connection.once('open', () => {
    console.log('Connected Database Successfully');
});

app.post('/api/register', async (req,res) => {
    console.log(req.body)
    try{
        const newPassword = await bcrypt.hash(req.body.password, 10)
        
        //creates user if its email is unique
        await User.create({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            password: newPassword,
        })
        res.json({status:'ok'})
    } catch(err) {
        res.json({status :'error'});
    }
    
})

app.post('/api/login', async (req,res) => {
        const user = await User.findOne({
            email: req.body.email,
        })

        if(!user) {
            return res.json({status: 'error', error: 'email'})
        }

        const isValid = await bcrypt.compare(req.body.password, user.password)

        

        if(isValid) {
            const token = jwt.sign({

                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
            },
            'secret123')

            return res.json({status: 'ok', user: token})
        } else{
            return res.json({ status: 'error', user: false })
        }
    
    
})

app.post('/api/addBudget', async (req,res) => {
    console.log(req.body)
    const token = req.headers['x-access-token']

    try{
        const decoded = jwt.verify(token, 'secret123')
        const user = decoded.email
        await Budget.create({
            name: req.body.name,
            allowance: req.body.allowance,
            email: user,
            id: req.body.id
        })
        return res.json({status:'ok'})
    } catch(err) {
        res.json({status :'error'});
    }
    
})

app.get('/api/getBudget', async (req,res) => {
    const token = req.headers['x-access-token']

    try{
        const decoded = jwt.verify(token, 'secret123')
        const user = decoded.email
        const budget = await Budget.find({ email: user })
        return res.json({status:'ok', budgets: budget})
    } catch(err) {
        res.json({status :'error'});
    }
    
})

app.post('/api/deleteBudget', async (req,res) => {
    console.log(req.body)
    try{
        await Budget.deleteOne({id: req.body.id})
        return res.json({status: 'ok'})
    } catch(err) {
        res.json({status: 'error'})
    }
    
})

app.post('/api/updateBudget', async (req,res) => {
    console.log(req.body)
    try{
        await Budget.updateOne({id: req.body.id}, {$set:{name:req.body.name, allowance:req.body.allowance}})
        return res.json({status: 'ok'})
    } catch(err) {
        res.json({status: 'error'})
    }
    
})

app.listen(5000, () => {
    console.log('Server started on 5000')
})