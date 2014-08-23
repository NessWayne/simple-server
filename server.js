var ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;

net = require('net');
var StringDecoder = require('string_decoder').StringDecoder;
var decoder = new StringDecoder('utf8');

var clients = [];
var namesock = "";
var p = "";

net.createServer(function (socket) {
    
    socket.on('data', function (data){
    p = decoder.write(data);
    
    switch(p.split(":::")[1]) {
    case "AddUser":
         // NCaracteres         NombreUser.length
        if(p.split(":::")[2] == p.split(":::")[3].length){  
        namesock = p.split(":::")[3]; 
        }else{
        namesock = p.split(":::")[3].substring(0,p.split(":::")[3].length-2); 
        }
        socket.name = namesock;
        console.log("Cliente Conectado: "+ socket.name);
        clients.push(socket);
        useradd(socket.name); //Notifica a los demas usuarios que alguien se ha conectado.  
        break;
    case "ListaUsers":
        var list = "LSU";
        clients.forEach(function(client){
            if(p.split(":::")[2] === client.name){ return;}
            list = list + ":::"+client.name;
        });
        socket.write(list+"\n");
        break;
    case "MsgUnique":
        msgunique(p.split(":::")[2], socket.name+": " + p.split(":::")[3]);
        break;
    case "MsgAll":
        broadcast(socket.name+": " + p.split(":::")[2],socket);
        break;
    default:
        console.log("Ninguna Operacion Realizada.");  
      } 
         
    });
    
    socket.on('end',function() {
        console.log("Se desconecto: " + socket.name);
        clients.splice(clients.indexOf(socket),1); //Elimina el socket que termino la conexion.
        userquit(socket.name);
    });
    
     socket.on('error',function() {
        console.log("Se perdio Conexion con: " + socket.name);
        clients.splice(clients.indexOf(socket),1);
        userquit(socket.name);
    });
    
   function broadcast(mensaje , remitente){ //Envia un mensaje a todos los usuarios conectados.
       clients.forEach(function(client){
            if(client === remitente){ return;}
            client.write("MB:::"+mensaje+"\n");
        });
        process.stdout.write(mensaje+"\n");
   }
   
   
    function msgunique(destinatario  ,mensaje){ //Envia mensaje a un usuario en especifico.
        clients.forEach(function(client){

            if(client.name === destinatario){ 
               client.write("MU:::"+socket.name+":::"+mensaje+"\n");
            }
            
        });
        process.stdout.write(mensaje+"\n");
   }
    
      function useradd(usuario){ // Notifica a todos los usuarios que un nuevo usuario se ha conectado.
       clients.forEach(function(client){
            if(client.name === usuario){ return;}
            client.write("UC:::"+usuario+"\n");
        });
   }
   
      function userquit(usuario){ // Notifica a todos los usuarios que un usuario se ha desconectado.
       clients.forEach(function(client){
            client.write("UD:::"+usuario+"\n");
        });
   }
   
}).listen(8000,"127.0.0.1");

console.log("Server Activo");
