import React, { useEffect, useState } from "react";

export interface Store<T> {
  getState(): T;
}

type StoreType<T> = T extends Store<infer S> ? S : never;
export const createStore = <T extends Store<StoreType<T>>>(
  store: T
): [() => StoreType<T>, T] => {
  const setters: React.Dispatch<React.SetStateAction<StoreType<T>>>[] = [];

  const proxy = new Proxy(store, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value === "function") {
        return (...args: unknown[]) => {
          const result = value.apply(target, args);
          if (result instanceof Promise) {
            result.then(() =>
              setters.forEach((setState) => setState(target.getState()))
            );
          } else {
            setters.forEach((setState) => setState(target.getState()));
          }
          return result;
        };
      }
    },
  });

  const useHook = () => {
    const [state, setState] = useState(store.getState());
    setters.push(setState);
    useEffect(() => () => {
      setters.filter((set) => set !== setState), [];
    });
    return state;
  };

  return [useHook, proxy];
};
