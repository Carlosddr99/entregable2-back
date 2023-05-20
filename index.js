
const express = require('express');
const app = express();
const PORT = 3000;
const https = require('https');
const mongoose = require('mongoose');

app.use(express.json());

//Consumo API
async function obtenerDatos(){
    return new Promise((resolve, reject) =>{
        https.get("https://jsonplaceholder.typicode.com/todos/2",(respuesta)=>{
            respuesta.on('data',(data)=>{
                resolve(data.toString('utf8'));
            })
            respuesta.on('error',(error)=>{
                console.log("error")
                reject(error.toString('utf8'));
            })
        })
    })
}

async function consumirApi(res){
    await obtenerDatos()
    .catch(()=>{
        res.writeHead(404,{'Content-Type':'text/plain'})
        res.end("Error al consumir la API");
    })
    .then((data)=>{
        res.writeHead(200,{'Content-Type':'application/json'})
        res.end(data)
    })

}

app.get('/consumoApi', (req,res)=>{
    const respuesta = consumirApi(res);
})


//CRUD en MongoDB

mongoose.connect('mongodb://127.0.0.1:27017/entrega2',{
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(()=>console.log("Conectado mongoDB"))
.catch((error)=>console.log("Problema conexión MongoDB" + error));

const UserSchema = new mongoose.Schema({
    _id:{type:String},
    email:{type:String ,required:true},
    password:{type:String ,required:true},
    nombre:{type:String },
})

const User = mongoose.model("User", UserSchema);

//POST
async function addUser(req,res){
    try{
        const user = new User({email: req.body.email , password: req.body.password, nombre: req.body.nombre});
        await user.save();
        res.status(201).send(user);
    }catch(error){
        res.status(400).send({error: error.message});
    }
}

app.post('/addUser', (req,res)=>{
    addUser(req, res);
})

//GET
async function getUsers(req,res){
    try{
        const users = await User.find({});
        res.writeHead(200,{'Content-Type':'application/json'});
        res.end(JSON.stringify(users, null, 2));
    } catch(error){
        res.end(JSON.stringify(error));
        console.log(error);
    }
}

app.get('/getUsers', (req,res)=>{
    getUsers(req, res);
})

//PUT
async function updateUser(req,res){
    try{
        const _id = req.body.id;
        const user = await User.findByIdAndUpdate({_id}, req.body);
        if(!user){
            res.status(404).send("Usuario no encontrado");
        }else{
            res.status(200).send(user);
        }
    }catch(error){
        res.status(500).send({error: error.message});
    }
}

app.put('/updateUser', (req,res)=>{
    updateUser(req, res);
})

//DELETE
async function deleteUser(req,res){
    try{
        const user = await User.findByIdAndDelete( req.body.id);
        if(!user){
            res.status(404).send("Usuario no encontrado");
        }
        else{
            res.status(200).send(user);
        }    
    }catch(error){
        res.status(500).send({error: error.message});
    }
}

app.delete('/deleteUser', (req,res)=>{
    deleteUser(req, res);
})

app.listen(PORT, ()=>{
    console.log("Aplicación escuchando por el puerto " + PORT)
});