import { useState, useCallback, useRef } from 'react';
import { BlockData } from '@/components/builder/types';

interface HistoryState {
    past: BlockData[][];
    present: BlockData[];
    future: BlockData[][];
}

const MAX_HISTORY_LENGTH = 50;

export function useBuilderHistory(initialBlocks: BlockData[] = []) {
    const [history, setHistory] = useState<HistoryState>({
        past: [],
        present: initialBlocks,
        future: [],
    });

    // Track if we should skip adding to history (for initial load)
    const skipNextRef = useRef(false);

    const setBlocks = useCallback((blocksOrUpdater: BlockData[] | ((prev: BlockData[]) => BlockData[])) => {
        setHistory((prev) => {
            const newPresent = typeof blocksOrUpdater === 'function'
                ? blocksOrUpdater(prev.present)
                : blocksOrUpdater;

            // Skip if this is marked to skip (e.g., initial load or undo/redo)
            if (skipNextRef.current) {
                skipNextRef.current = false;
                return { ...prev, present: newPresent };
            }

            // Don't add to history if nothing changed
            if (JSON.stringify(prev.present) === JSON.stringify(newPresent)) {
                return prev;
            }

            const newPast = [...prev.past, prev.present].slice(-MAX_HISTORY_LENGTH);

            return {
                past: newPast,
                present: newPresent,
                future: [], // Clear future on new action
            };
        });
    }, []);

    const undo = useCallback(() => {
        setHistory((prev) => {
            if (prev.past.length === 0) return prev;

            const newPast = prev.past.slice(0, -1);
            const newPresent = prev.past[prev.past.length - 1];
            const newFuture = [prev.present, ...prev.future];

            return {
                past: newPast,
                present: newPresent,
                future: newFuture,
            };
        });
    }, []);

    const redo = useCallback(() => {
        setHistory((prev) => {
            if (prev.future.length === 0) return prev;

            const newFuture = prev.future.slice(1);
            const newPresent = prev.future[0];
            const newPast = [...prev.past, prev.present];

            return {
                past: newPast,
                present: newPresent,
                future: newFuture,
            };
        });
    }, []);

    const resetHistory = useCallback((blocks: BlockData[]) => {
        skipNextRef.current = true;
        setHistory({
            past: [],
            present: blocks,
            future: [],
        });
    }, []);

    return {
        blocks: history.present,
        setBlocks,
        undo,
        redo,
        canUndo: history.past.length > 0,
        canRedo: history.future.length > 0,
        resetHistory,
    };
}
