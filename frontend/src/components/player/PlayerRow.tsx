import React from "react";
import { cx } from "../../ui/cx";
import { PlayerHead } from "../../ui/player-head";

export const PlayerRow: React.FC<{
  name: string;
  uuid?: string;
  head?: React.ReactNode;
  badges?: React.ReactNode;
  detail?: React.ReactNode;
  actions?: React.ReactNode;
  onOpen?: () => void;
}> = ({ name, uuid, head, badges, detail, actions, onOpen }) => {
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onOpen) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen();
    }
  };

  return (
    <div
      className={cx("k-row", onOpen && "k-row-clickable")}
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={onOpen}
      onKeyDown={onKeyDown}
    >
      {head ?? <PlayerHead name={name} size={32} className="k-row-head" />}

      <div className="k-row-main">
        <div className="k-row-title">
          <span className="k-row-name">{name}</span>
          {badges}
        </div>

        {uuid !== undefined ? (
          <div className="k-row-uuid">
            <span className="k-row-uuid-text">{uuid || "—"}</span>
            {uuid ? (
              <button
                type="button"
                className="k-row-copy"
                aria-label="Copy UUID"
                title="Copy UUID"
                onClick={(event) => {
                  event.stopPropagation();
                  void navigator.clipboard?.writeText(uuid);
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="9" y="9" width="11" height="11" rx="2" />
                  <path d="M5 15V5a2 2 0 0 1 2-2h10" />
                </svg>
              </button>
            ) : null}
          </div>
        ) : null}

        {detail ? <div className="k-row-detail">{detail}</div> : null}
      </div>

      {actions ? (
        <div className="k-row-actions" onClick={(event) => event.stopPropagation()}>
          {actions}
        </div>
      ) : null}
    </div>
  );
};
