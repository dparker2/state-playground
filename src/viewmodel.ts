import { useEffect, useMemo, useRef, useState } from "react";

function updateState<T>(oldState: T, newState: Partial<T> | T) {
  if (typeof newState === "object") {
    return { ...oldState, ...newState };
  }
  return newState;
}

export default class ViewModel<T> {
  protected isMounted: boolean = false;

  getState(): Readonly<T> {
    throw new Error(
      "ViewModel not initialized properly. Use `.useModel` in components."
    );
  }

  setState(_newState: Partial<T> | ((prevState: T) => Partial<T>)) {
    throw new Error(
      "ViewModel not initialized properly. Use `.useModel` in components."
    );
  }

  protected memoize<Deps extends [unknown] | unknown[], R>(
    depsSelector: (state: Readonly<T>) => Deps,
    compute: (...args: Deps) => R
  ): () => R {
    let initialRun = true;
    let lastDeps: unknown[] = [];
    let cachedValue: R;

    return () => {
      const deps = depsSelector(this.getState());
      const changed =
        deps.length !== lastDeps.length ||
        deps.some((dep, i) => dep !== lastDeps[i]);

      if (changed || initialRun) {
        cachedValue = compute(...deps);
        lastDeps = deps;
        initialRun = false;
      }

      return cachedValue;
    };
  }

  onInit() {}
  onMount() {}
  onUnmount() {}
  onStateUpdated(_prev: T, _next: T) {}

  static useModel<T, P extends ViewModel<T>>(
    this: new () => P,
    initialState: T
  ): P {
    const [state, setState] = useState(initialState);
    const stateRef = useRef(state);

    const viewmodel = useMemo(() => {
      const vm = new this();
      // Late bind getState and setState as closures
      vm.getState = function () {
        return Object.freeze(stateRef.current);
      };
      vm.setState = function (newState) {
        setState((prev) => {
          if (typeof newState === "function") {
            stateRef.current = updateState(prev, newState(prev));
          } else {
            stateRef.current = updateState(prev, newState);
          }
          this.onStateUpdated(prev, stateRef.current);
          console.debug("setState", prev, stateRef.current);
          return stateRef.current;
        });
      };
      return vm;
    }, [setState, stateRef]);

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
