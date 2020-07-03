# ClipIt app
This project contains the API for the ClipIt project. 

### Link to live app- https://vercel.com/ap104826/clip-it-client/ohacse4sj

### Documentation of API- 
  
  Get All Routes- /api
  Get All bookmarks- /api/bookmarks
  Get all bookmarks by category. To see a specific bookmark, the bookmark_id is required and can be added the following way: /api/bookmarks/:id
  
  Post- To add a bookmark to the database, use the api/bookmarks endpoint. A Url is required. 
  
  Put- To update a bookmark in the database, use the api/bookmarks/:id endpoint. The bookmark_id and the updated value are required. 
  
  Delete- To delete a bookmark in the database, provide the _id of the bookmark you want to delete to the /api/bookmarks endpoint. api/bookmarks/:id. 
  


### Screenshots of the App- 
<img width="1440" alt="Screen Shot 2020-06-19 at 2 13 39 PM" src="https://user-images.githubusercontent.com/56480531/85184410-9412c600-b244-11ea-984c-2d11016b953c.png">

<img width="1440" alt="Screen Shot 2020-06-19 at 2 14 01 PM" src="https://user-images.githubusercontent.com/56480531/85185446-caeadb00-b248-11ea-8b46-5570ae79c984.png">

<img width="1440" alt="Screen Shot 2020-06-19 at 2 14 05 PM" src="https://user-images.githubusercontent.com/56480531/85185448-cde5cb80-b248-11ea-8cfe-d8b99fb96252.png">

### Summary

  ClipIt app is a user friendly app for saving and organizing bookmarks. The user is able to add categories as well as add bookmarks to those categories. They are also able to Favorite them based on preference. This app works well on phone, table as well as a desktop computer. 
  
 The technology used for this app include: JavaScript, React, Responsive Design, Node.js, Express, 


## Set up

Complete the following steps to start a new project (ClipIt):

1. Clone this repository to your local machine `git clone https://github.com/ap104826/clip-it-server.git`
2. `cd` into the cloned repository
3. Make a fresh start of the git history for this project with `rm -rf .git && git init`
4. Install the node dependencies `npm install`
5. Move the example Environment file to `.env` that will be ignored by git and read by the express server `mv example.env .env`
6. Edit the contents of the `package.json` to use ClipIt instead of `"name": "express-boilerplate",`

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests `npm test`

## Deploying

When your new project is ready for deployment, add a new Heroku application with `heroku create`. This will make a new git remote called "heroku" and you can then `npm run deploy` which will push to this remote's master branch.

https://github.com/brianc/node-postgres/issues/2009

## Built with
React, Node(Express)

## Tested with
Chai, Mocha, Supertest
