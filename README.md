[![Build Status](https://travis-ci.org/linn/redux-undoable.svg?branch=master)](https://travis-ci.org/linn/redux-undoable) [![codecov](https://codecov.io/gh/linn/redux-undoable/branch/master/graph/badge.svg)](https://codecov.io/gh/linn/redux-undoable)


# redux-undoable
A reducer enhancer (or higher order reducer) that provides undo/redo functionality for Redux by replaying actions (rather than storing previous state)

## Basic Usage
redux-undoable exports a *reducer enhancer*; a function that takes a reducer, and returns a new reducer with some additional capability.
```javascript
import undoable, { UNDO, REDO } from 'redux-undoable';
import { createStore } from 'redux'

// standard reducer function
const todos = function(state = [], action) {
  /* ... */
}

// enhanced (wrapped) reducer
const undoableTodos = undoable(todos);

const store = createStore(undoableTodos);
```

This will change your state tree from:
```json
{
  "todos": []
}
```

To:
```json
{
  "todos": {
    "initial": [],
    "past": [],
    "present": [],
    "future": []
  }
}
```

When you dispatch some actions:
```javascript
store.dispatch({
  type: 'ADD_TODO',
  text: 'Do something'
});
store.dispatch({
  type: 'ADD_TODO',
  text: 'Do something else'
});
```

The state tree will change as follows:
```json
{
  "todos": {
    "initial": [],
    "past": [
      { "type": "ADD_TODO", "text": "Do something" },
      { "type": "ADD_TODO", "text": "Do something else" }
    ],
    "present": [
      { "text": "Do something", "completed": false },
      { "text": "Do something else", "completed": false }
    ],
    "future": []
  }
}
```

You can then dispatch an `UNDO` action:
```javascript
store.dispatch({ type: UNDO });
```

And the state tree will change as follows:
```json
{
  "todos": {
    "initial": [],
    "past": [
      { "type": "ADD_TODO", "text": "Do something" }
    ],
    "present": [
      { "text": "Do something", "completed": false }
    ],
    "future": [
      { "type": "ADD_TODO", "text": "Do something else" }
    ]
  }
}
```

And then dispatch a `REDO` action:
```javascript
store.dispatch({ type: REDO });
```

And the state tree will look like this:
```json
{
  "todos": {
    "initial": [],
    "past": [
      { "type": "ADD_TODO", "text": "Do something" },
      { "type": "ADD_TODO", "text": "Do something else" }
    ],
    "present": [
      { "text": "Do something", "completed": false },
      { "type": "ADD_TODO", "text": "Do something else" }
    ],
    "future": []
  }
}
```

Rather than storing intermediate state, redux-undoable *replays* actions through the wrapped reducer from the initial state to arrive at the desired computed state, keeping track of your place in history by manipulating the `past` and `present` properties.

## Installation
### [npm](https://www.npmjs.org/package/redux-undoable) [![npm Version](http://img.shields.io/npm/v/redux-undoable.svg?style=flat)](https://www.npmjs.org/package/redux-undoable) [![npm Downloads](http://img.shields.io/npm/dm/redux-undoable.svg?style=flat)](https://www.npmjs.org/package/redux-undoable)
```
npm install redux-undoable
```

## Prior Art
### [redux-undo](https://github.com/omnidan/redux-undo) [![npm Version](http://img.shields.io/npm/v/redux-undo.svg?style=flat)](https://www.npmjs.org/package/redux-undo) [![npm Downloads](http://img.shields.io/npm/dm/redux-undo.svg?style=flat)](https://www.npmjs.org/package/redux-undo)
redux-undo differs from redux-undoable in that it stores copies of the entire state tree in order to provide undo/redo functionality. redux-undoable takes a different approach whereby we store the *actions* and replay them in order to arrive at the desired state. This is more space efficient (assuming your state tree is larger than your actions), but less computationally efficient, particularly if there are any expensive operations in your reducer functions.

### [redux-undo-stack](https://github.com/stephan83/redux-undo-stack) [![npm Version](http://img.shields.io/npm/v/redux-undo-stack.svg?style=flat)](https://www.npmjs.org/package/redux-undo-stack) [![npm Downloads](http://img.shields.io/npm/dm/redux-undo-stack.svg?style=flat)](https://www.npmjs.org/package/redux-undo-stack)
redux-undo-stack takes the same approach as redux-undoable by storing actions rather than state. It works in combination with the [redux-smart-action](https://github.com/stephan83/redux-smart-action) middleware.
