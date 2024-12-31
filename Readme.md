# BookStore API & web app

---

**This app runs on port 5000 by default**
_The API is completed and it works just fine_
**The Login/sign up/search doesn't work on the web app .. yet**

### This project was made using

1. Node js
2. Express js
3. Mongodb/Mongoose
4. Pug js
5. Sass
6. I18next library
   And it has :
7. Multilingual API & Web pages
8. A great error handling with Arabic/English messages

---

### How to set up

After downloading use the command `npm install` to get node_modules file
and then make a config.env file with :

1. PORT= (your port)
2. NODE_ENV=development
3. JWT_SECRET= (write any long text here)
4. JWT_EXPIRES_IN=90d (or any amount of days)
5. JWT_COOKIE_EXPIRES_IN=90

### Data

there is a data inside /public/data folder, it contains books.json - authors.json - genres.json, go inside of that folder and use the command `node importAndDelete.js --import books` to import books, replace books with authors to import them ..etc, and you can also use that to delete `node importAndDelete.js --delete books`
