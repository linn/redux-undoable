const REDUX_INIT = '@@redux/INIT';
export const UNDO = '@@redux-undoable/UNDO';
export const REDO = '@@redux-undoable/REDO';
export const REPLAY_FINISHED = '@@redux-undoable/REPLAY_FINISHED';

const replayFinished = () => {
  return {
    type: REPLAY_FINISHED
  };
};

const replay = function(initial, actions, reducer) {
  return actions
    .map(action => {
      // create a copy of the action with metadata to indicate that a replay is in progress
      return { ...action, meta: { replay: true } };
    })
    .concat(replayFinished())
    .reduce((state, action) => reducer(state, action), initial);
};

const undo = function(initial, past, present, future, reducer) {
  const action = past[past.length - 1];
  const newPast = past.slice(0, past.length - 1);
  const previous = replay(initial, newPast, reducer);

  return {
    initial,
    past: newPast,
    present: previous,
    future: [ action, ...future ]
  };
};

const redo = function(initial, past, present, future, reducer){
  const action = future[0];
  const newFuture = future.slice(1);
  const newPresent = reducer(present, action);

  return {
    initial,
    past: [ ...past, action ],
    present: newPresent,
    future: newFuture
  };
};

const defaultConfig = {
  init: [REDUX_INIT],
  include: []
};

export default function(reducer, config) {
  const initialState = {
    initial: null,
    past: [],
    present: reducer(undefined, {}),
    future: []
  };

  const mergedConfig = { ...defaultConfig, ...config };

  return function (state = initialState, action) {
    const { initial, past, present, future } = state;

    if (mergedConfig.init.includes(action.type) && !state.present) {
      return {
        initial,
        past,
        present: replay(initial, past, reducer),
        future
      };
    }

    switch (action.type) {
      case UNDO:
        return undo(initial, past, present, future, reducer);
      case REDO:
        return redo(initial, past, present, future, reducer);
      default:
        const newPresent = reducer(present, action);
        if (present === newPresent) {
          return state;
        }

        if (!mergedConfig.include.includes(action.type)) {
          return {
            initial,
            past,
            present: newPresent,
            future
          };
        }

        return {
          initial,
          past: [ ...past, action ],
          present: newPresent,
          future: []
        };
    }
  };
}
