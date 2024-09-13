const PROTO_PATH="./restaurant.proto";
require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
var grpc = require("@grpc/grpc-js");
var protoLoader = require("@grpc/proto-loader");
const Menu = require('./models/menu');

// Connect to MongoDB
mongoose.set('strictQuery', true);
mongoose.connect(process.env.DATABASE_URL)
  .then(() => console.log('Connected to Database'))
  .catch((error) => console.error(error));


var packageDefinition = protoLoader.loadSync(PROTO_PATH,{
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true
});

var restaurantProto =grpc.loadPackageDefinition(packageDefinition);

// const {v4: uuidv4}=require("uuid");

const server = new grpc.Server();
// const menu=[
//     {
//         id: "a68b823c-7ca6-44bc-b721-fb4d5312cafc",
//         name: "Tomyam Gung",
//         price: 500
//     },
//     {
//         id: "34415c7c-f82d-4e44-88ca-ae2a1aaa92b7",
//         name: "Somtam",
//         price: 60
//     },
//     {
//         id: "8551887c-f82d-4e44-88ca-ae2a1ccc92b7",
//         name: "Pad-Thai",
//         price: 120
//     }
// ];

server.addService(restaurantProto.RestaurantService.service, {
    getAllMenu: async (_, callback) => {
      try {
        const menus = await Menu.find();
        callback(null, { menu: menus });
      } catch (error) {
        callback({
          code: grpc.status.INTERNAL,
          details: "Error fetching menus"
        });
      }
    },
    get: async (call, callback) => {
      try {
        const menuItem = await Menu.findById(call.request.id);
        if (menuItem) {
          callback(null, menuItem);
        } else {
          callback({
            code: grpc.status.NOT_FOUND,
            details: "Menu item not found"
          });
        }
      } catch (error) {
        callback({
          code: grpc.status.INTERNAL,
          details: "Error fetching menu item"
        });
      }
    },
    insert: async (call, callback) => {
      try {
        const menuItem = new Menu(call.request);
        await menuItem.save();
        callback(null, menuItem);
      } catch (error) {
        callback({
          code: grpc.status.INTERNAL,
          details: "Error inserting menu item"
        });
      }
    },
    update: async (call, callback) => {
      try {
        const menuItem = await Menu.findByIdAndUpdate(
          call.request.id,
          { name: call.request.name, price: call.request.price },
          { new: true }
        );
        if (menuItem) {
          callback(null, menuItem);
        } else {
          callback({
            code: grpc.status.NOT_FOUND,
            details: "Menu item not found"
          });
        }
      } catch (error) {
        callback({
          code: grpc.status.INTERNAL,
          details: "Error updating menu item"
        });
      }
    },
    remove: async (call, callback) => {
      try {
        const result = await Menu.findByIdAndDelete(call.request.id);
        if (result) {
          callback(null, {});
        } else {
          callback({
            code: grpc.status.NOT_FOUND,
            details: "Menu item not found"
          });
        }
      } catch (error) {
        callback({
          code: grpc.status.INTERNAL,
          details: "Error deleting menu item"
        });
      }
    }
  });

server.bindAsync("127.0.0.1:30043",grpc.ServerCredentials.createInsecure(), ()=>{server.start();});
console.log("Server running at http://127.0.0.1:30043");
