export {
	clearProliferateUndoStack,
	getProliferateUndoCount,
	proliferateAction,
	undoProliferateAction,
} from './action';
export {createProliferateSlice, type ProliferateSlice} from './slice';
export {useProliferate} from './hooks/useProliferate';
export {ProliferateButton} from './components/ProliferateButton';
