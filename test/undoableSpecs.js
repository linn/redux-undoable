import chai from 'chai';
import undoable, { UNDO, REDO, REPLAY_FINISHED } from '../lib/undoable';

const should = chai.should();

describe('undoable reducer enhancer', () => {
  let state;
  let reducer;
  let enhancedReducer;
  let actions;
  const undo = { type: UNDO };
  const redo = { type: REDO };
  const increment = { type: 'INCREMENT' };
  const decrement = { type: 'DECREMENT' };
  const replayFinished = { type: REPLAY_FINISHED };
  const init = { type: 'INIT' };
  const config = {
    include: [ increment.type ],
    init: [ init.type ]
  };

  beforeEach(() => {
    actions = [];

    reducer = (s, a) => {
      actions.push(a);

      if (a.type === increment.type) {
        return s + 1;
      }

      return s;
    };

    enhancedReducer = undoable(reducer, config);

    state = {
      initial: 0,
      past: [{
        type: 'INCREMENT'
      }],
      future: [{
        type: 'INCREMENT'
      }]
    };
  });

  describe('when initialized', () => {
    let newState;

    beforeEach(() => {
      newState = enhancedReducer(state, init);
    });

    it('should construct the present state', () => {
      newState.present.should.equal(1);
    });

    it('should attach replay metadata to actions as they are replayed', () => {
      actions[actions.length - 2].meta.replay.should.be.true;
    });

    it('should not mutate the original actions', () => {
      should.not.exist(state.past[0].meta);
    });

    it('should append an action to indicate that a replay has finished', () => {
      actions[actions.length - 1].type.should.equal(replayFinished.type);
    });

    it('should not attach replay metadata to replay finsihed action', () => {
      should.not.exist(actions[actions.length - 1].meta);
    });
  });

  describe('when undoing an action', () => {
    let newState;

    beforeEach(() => {
      state = {
        initial: 0,
        past: [ increment ],
        present: 1,
        future: []
      };

      newState = enhancedReducer(state, undo);
    });

    it('should remove the action from the past', () => {
      newState.past.should.be.empty;
    });

    it('should replace present with the new state', () => {
      newState.present.should.equal(0);
    });

    it('should add the action to the future', () => {
      newState.future.should.include(increment);
    });
  });

  describe('when redoing an action', () => {
    let newState;

    beforeEach(() => {
      state = {
        initial: 0,
        past: [],
        present: 0,
        future: [ increment ]
      };

      newState = enhancedReducer(state, redo);
    });

    it('should add the action to the past', () => {
      newState.past.should.include(increment);
    });

    it('should replace present with the new state', () => {
      newState.present.should.equal(1);
    });

    it('should remove the action from the future', () => {
      newState.future.should.be.empty;
    });
  });

  describe('when any other action is passed', () => {
    let newState;

    beforeEach(() => {
      state = {
        initial: 0,
        past: [],
        present: 0,
        future: [ increment ]
      };

      newState = enhancedReducer(state, increment);
    });

    it('should add the action to the past', () => {
      newState.past.should.include(increment);
    });

    it('should replace present with the new state', () => {
      newState.present.should.equal(1);
    });

    it('should discard the future', () => {
      newState.future.should.be.empty;
    });
  });

  describe('when an action is excluded', () => {
    let newState;

    beforeEach(() => {
      state = {
        initial: 0,
        past: [],
        present: 0,
        future: [ decrement ]
      };

      config.include.pop();

      newState = enhancedReducer(state, increment);
    });

    it('should not add the action to the past', () => {
      newState.past.should.be.empty;
    });

    it('should replace present with the new state', () => {
      newState.present.should.equal(1);
    });

    it('should not discard the future', () => {
      newState.future.should.include(decrement);
    });
  });
});
