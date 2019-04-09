# component-structure
structure of files in components with gulp tasks for web development


## How to install
Run `npm i`

## How to use
Run `gulp` for development files <br/>
Run `gulp --production` for production files

##Structure
All components are created inside the folder `Components` (Ex: `src/Components/{ComponentName}`)<br />
All components can be composed of an `index.scss`, `index.js`, and `index.html`. Ex: <br/>

```bash
├── src
    ├── index.html
    ├── Components
    │   ├── HelloWorld
    │   │   ├── index.js
    │   │   ├── index.scss
    └── └── └──  index.html
```


To import the component, simply include the div tag in the main html (`index.html`) by passing the `data-type=component` and `data-name={component-name}`. Ex:
```
<div data-type="component" data-name="HelloWorld"></div>
```

The gulp will automatically replace the component reference for the html of it.
Also the javascript and sass dependencies will be automatically imported into the general files `app.min.js` and `app.css` in the dist path.
