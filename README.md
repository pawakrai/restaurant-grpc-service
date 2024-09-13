## google drive for this example

https://drive.google.com/file/d/1B0e5kn2xWbN1vkIy10HKnCctNDl7RBdn/view

This project is separated in two parts:

- Server: where gRPC serves the remote calls defined in the proto file
- Client: Express/Node/Bootstrap web page to CRUD the server operations.

In order to run this app, issue in separate command line windows:

- Inside the /client folder: node index
- Inside the /root folder: npm start
Then, go to http://localhost:3000/ and test it out.