import React, { useEffect, useMemo, useRef, useState } from "react";

function updateState<T>(oldState: T, newState: Partial<T> | T) {
  if (typeof newState === "object") {
    return { ...oldState, ...newState };
  }
  return newState;
}

export default class ViewModel<T> {
  protected isMounted: boolean = false;

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
