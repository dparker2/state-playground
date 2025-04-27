import React, { useEffect, useMemo, useRef, useState } from "react";

function updateState<T>(oldState: T, newState: Partial<T> | T) {
  if (typeof newState === "object") {
    return { ...oldState, ...newState };
  }
  return newState;
}

export default class ViewModel<T> {
  protected isMounted: boolean = false;
  private memoCache = new Map();

  constructor(
    private _stateRef: React.RefObject<T>,
    private _setState: React.Dispatch<React.SetStateAction<T>>
  ) {}

  getState() {
    return Object.freeze(this._stateRef.current);
  }

  setState(newState: Partial<T> | ((prevState: T) => Partial<T>)) {
    this._setState((prev) => {
      if (typeof newState === "function") {
        this._stateRef.current = updateState(prev, newState(prev));
      } else {
        this._stateRef.current = updateState(prev, newState);
      }
      this.onStateUpdated(prev, this._stateRef.current);
      console.debug("setState", prev, this._stateRef.current);
      return this._stateRef.current;
    });
  }

  memo<S, R>(
    key: string,
    selector: (state: T) => S,
    func: (selected: S) => R
  ): R {
    const old = this.memoCache.get(key);
    const selected = selector(this.getState());

    if (old && this.shallowEqual(old.selected, selected)) {
      return old.result;
    }

    const result = func(selected);
    this.memoCache.set(key, { selected, result });
    return result;
  }

  private shallowEqual(a: unknown, b: unknown): boolean {
    if (Object.is(a, b)) return true;

    if (typeof a !== typeof b || a == null || b == null) {
      return false;
    }

    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!Object.is(a[i], b[i])) {
          return false;
        }
      }
      return true;
    }

    if (typeof a === "object" && typeof b === "object") {
      const aKeys = Object.keys(a);
      const bKeys = Object.keys(b);
      if (aKeys.length !== bKeys.length) return false;

      for (let i = 0; i < aKeys.length; i++) {
        const key = aKeys[i];

        if (!Object.prototype.hasOwnProperty.call(b, key)) {
          return false;
        }

        // Access through Object.getOwnPropertyDescriptor to avoid 'as'
        const aDesc = Object.getOwnPropertyDescriptor(a, key);
        const bDesc = Object.getOwnPropertyDescriptor(b, key);

        if (!aDesc || !bDesc || !("value" in aDesc) || !("value" in bDesc)) {
          return false;
        }

        if (!Object.is(aDesc.value, bDesc.value)) {
          return false;
        }
      }

      return true;
    }

    return false;
  }

  onInit() {}
  onMount() {}
  onUnmount() {}
  onStateUpdated(_prev: T, _next: T) {}

  static useModel<T, P extends ViewModel<T>>(
    this: new (
      _stateRef: React.RefObject<T>,
      _setState: React.Dispatch<React.SetStateAction<T>>
    ) => P,
    initialState: T
  ): P {
    const [state, setState] = useState(initialState);
    const stateRef = useRef(state);

    const viewmodel = useMemo(
      () => new this(stateRef, setState),
      [setState, stateRef]
    );

    const initRef = useRef(true);
    if (initRef.current) {
      viewmodel.onInit();
      initRef.current = false;
    }

    useEffect(() => {
      viewmodel.isMounted = true;
      viewmodel.onMount();
      return () => {
        viewmodel.isMounted = false;
        viewmodel.onUnmount();
      };
    }, [viewmodel]);

    return viewmodel;
  }
}
