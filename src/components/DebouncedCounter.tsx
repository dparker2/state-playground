/**
 * 1. Button to increase and decrease count
 * 2. Show current count on screen
 * 3. Show debounced count on screen
 */
import ViewModel from "../viewmodel.ts";

type CounterState = {
  value: number;
  debounced: number;
};
class Counter extends ViewModel<CounterState>() {
  private timeoutId?: number;

  override onUnmount(): void {
    clearTimeout(this.timeoutId);
  }

  override onStateUpdated(prev: CounterState, next: CounterState) {
    if (prev.value !== next.value) {
      clearTimeout(this.timeoutId);
      this.timeoutId = setTimeout(
        () => this.setState(({ value }) => ({ debounced: value })),
        2000,
      );
    }
  }

  increase() {
    this.setState(({ value }) => ({ value: value + 1 }));
  }

  decrease() {
    this.setState(({ value }) => ({ value: value - 1 }));
  }
}

export default function () {
  const counter = Counter.useModel({ value: 0, debounced: 0 });
  const { value, debounced } = counter.getState();

  return (
    <article id="debounced-counter">
      <header>
        <h4>Debounced Counter</h4>
      </header>
      <div style={{ maxWidth: 270 }}>
        <div role="group">
          <button type="button" onClick={() => counter.decrease()}>
            -1
          </button>
          <input disabled value={value} />
          <button type="button" onClick={() => counter.increase()}>
            +1
          </button>
        </div>
      </div>
      <p>Debounced Value: {debounced}</p>
    </article>
  );
}
