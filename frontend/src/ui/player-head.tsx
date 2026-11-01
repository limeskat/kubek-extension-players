import React from "react";
import { cx } from "./cx";
import { generatedFacePixels } from "./head-face";

const VALID_NAME = /^[A-Za-z0-9_]{1,16}$/;

export const PlayerHead: React.FC<{
  name: string;
  size?: number;
  className?: string;
}> = ({ name, size = 32, className }) => {
  const [failed, setFailed] = React.useState(false);

  if (!VALID_NAME.test(name) || failed) {
    return (
      <svg
        viewBox="0 0 8 8"
        width={size}
        height={size}
        shapeRendering="crispEdges"
        role="img"
        aria-label={name}
        className={cx("k-head", className)}
      >
        {generatedFacePixels(name).map(([x, y, w, h, fill], index) => (
          <rect key={index} x={x} y={y} width={w} height={h} fill={fill} />
        ))}
      </svg>
    );
  }

  return (
    <img
      src={`/api/heads/${encodeURIComponent(name)}`}
      alt=""
      title={name}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      draggable={false}
      onError={() => setFailed(true)}
      className={cx("k-head", "k-head-pixel", className)}
    />
  );
};
