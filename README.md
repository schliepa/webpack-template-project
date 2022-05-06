# Generic Webpack NPM Project
This is a project template / boilerplate for a fairly generic Webpack built NPM project.
The build configs are set up for the most common use cases while still offering support for fairly complex projects.

While this setup would likely be overkill for the most simple of projects, those have a tendency to grow in complexity and expanding the build system at a later time tends to take more effort.
Therefore, starting right is always recommended.

## Features
- Full TypeScript support (ts-loader).
- Babel build (babel-loader).
- Ifdef support via comments (ifdef-loader)
- ESLint with enforced code formatting (ESLintPlugin).
- Separate TypeScript type checking (ForkTsCheckerWebpackPlugin).
- Terser code compression (TerserPlugin).
- Raw dist file support (CopyWebpackPlugin).
- Simple index.html generation (HtmlWebpackPlugin).
- Partial support for multiple build platforms/targets via env.platform (separate build caches, ifdef PLATFORM property).


## Installation
1. Clone the repo and start your own:
```
git clone git@gist.github.com:3c83db422f03ef66ea36.git
rm -rf .git
git init
```
2. Install dependencies:
```
npm install
```

## Building
- For development: ```npm run start```
- For production: ```npm run build```

## Development
Place source code into ./src/ and whatever other folders you need. Build output is going into ./dist/.
Adjust webpack.config.js as required
