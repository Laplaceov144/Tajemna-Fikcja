To run this website locally from repo files you need to:

1. Install all dependencies from package.json.
2. In index.html - substitute the script's src from './dist/bundle.js' to just 'bundle.js' (this dist directory is created only when Netlify build is executed).
3. From the directory where webpack.config.js is located run 'npm start'.
4. Website should be served at 'localhost:8080' on your computer. 
