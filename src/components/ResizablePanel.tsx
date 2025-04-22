import React, { useLayoutEffect, useRef } from "react";
import ViewModel from "../viewmodel.ts";
import styles from "./ResizablePanel.module.css";

class OffsetModel extends ViewModel<number> {
  static minOffset = 100;

  initialize(containerWidth: number) {
    this.setState(containerWidth / 2);
  }

  startResizing(
    container: HTMLDivElement | null,
    startEvent: React.MouseEvent | React.TouchEvent
  ) {
    if (!container) return;
    if (startEvent.cancelable) startEvent.preventDefault();

    const maxOffset = container.clientWidth - OffsetModel.minOffset;
    const containerX = container.getBoundingClientRect().x;
    const minClientX = containerX + OffsetModel.minOffset;
    const maxClientX = containerX + maxOffset;
    const handleMove = (fromX: number, toX: number) => {
      if (fromX < minClientX || maxClientX < fromX) return;
      this.setState((curr) =>
        Math.max(
          OffsetModel.minOffset,
          Math.min(maxOffset, (curr += toX - fromX))
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
  const offsetModel = OffsetModel.useModel(OffsetModel.minOffset);
  const container = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!container.current) return;
    offsetModel.initialize(container.current.clientWidth);
  }, [container.current]);

  const offset = offsetModel.getState();
  return (
    <article id="resizable-panel">
      <header>
        <h4>Resizable Panel</h4>
      </header>
      <div className={styles.container} ref={container}>
        <textarea
          className={styles.panel}
          rows={10}
          style={{ flexBasis: offset }}
        ></textarea>
        <div
          className={styles.divider}
          onMouseDown={(e) => offsetModel.startResizing(container.current, e)}
          onTouchStart={(e) => offsetModel.startResizing(container.current, e)}
          style={{ left: offset }}
        ></div>
        <textarea className={styles.panel} rows={10}></textarea>
      </div>
    </article>
  );
}
