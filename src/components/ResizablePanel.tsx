import React from "react";
import ViewModel from "../viewmodel.ts";
import styles from "./ResizablePanel.module.css";

class OffsetModel extends ViewModel<number>() {
  minOffset = 0.1;
  maxOffset = 0.9;
  private container: HTMLDivElement | null = null;

  setup(container: HTMLDivElement | null) {
    this.container = container;
    (() => (this.container = null));
  }

  startResizing(startEvent: React.MouseEvent | React.TouchEvent) {
    if (!this.container) return;
    if (startEvent.cancelable) startEvent.preventDefault();

    const width = this.container.clientWidth;
    const containerX = this.container.getBoundingClientRect().x;
    const minClientX = containerX + width * this.minOffset;
    const maxClientX = containerX + width * this.maxOffset;
    const handleMove = (fromX: number, toX: number) => {
      if (fromX < minClientX || maxClientX < fromX) return;
      this.setState((curr) =>
        Math.max(
          this.minOffset,
          Math.min(this.maxOffset, curr += (toX - fromX) / width),
        )
      );
    };

    if ("touches" in startEvent) {
      let prevX: number = startEvent.touches[0].clientX;
      const onTouchMove = (e: TouchEvent) => {
        handleMove(prevX, e.touches[0].clientX);
        prevX = e.touches[0].clientX;
      };
      const onTouchEnd = () => {
        removeEventListener("touchmove", onTouchMove);
        removeEventListener("touchend", onTouchEnd);
      };
      addEventListener("touchmove", onTouchMove);
      addEventListener("touchend", onTouchEnd);
    } else {
      const onMouseMove = (e: MouseEvent) => {
        handleMove(e.clientX - e.movementX, e.clientX);
      };
      const onMouseUp = () => {
        removeEventListener("mousemove", onMouseMove);
        removeEventListener("mouseup", onMouseUp);
      };
      addEventListener("mousemove", onMouseMove);
      addEventListener("mouseup", onMouseUp);
    }
  }
}

export default function () {
  const offsetModel = OffsetModel.useModel(0.5);
  const offset = `${offsetModel.getState() * 100}%`;

  return (
    <article id="resizable-panel">
      <header>
        <h4>Resizable Panel</h4>
      </header>
      <div className={styles.container} ref={(node) => offsetModel.setup(node)}>
        <textarea
          className={styles.panel}
          rows={10}
          style={{ flexBasis: offset }}
        >
        </textarea>
        <div
          className={styles.divider}
          onMouseDown={(e) => offsetModel.startResizing(e)}
          onTouchStart={(e) => offsetModel.startResizing(e)}
          style={{ left: offset }}
        >
        </div>
        <textarea className={styles.panel} rows={10}></textarea>
      </div>
    </article>
  );
}
