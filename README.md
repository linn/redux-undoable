[![Build Status](https://travis-ci.org/linn/redux-undoable.svg?branch=master)](https://travis-ci.org/linn/redux-undoable)

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
}
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

And the state tree will change as follows:
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
