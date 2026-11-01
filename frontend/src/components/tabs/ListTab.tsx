import React from "react";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../../ui/empty";
import { Panel, PanelHead, PanelMeta } from "../../ui/panel";
import { SearchInput } from "../../ui/search-input";
import { useKubek } from "../../ui/kubek";

export const ListTab: React.FC<{
  meta: React.ReactNode;
  head?: React.ReactNode;
  /** Entries before filtering. */
  total: number;
  /** Entries after filtering. */
  shown: number;
  query: string;
  onQuery: (value: string) => void;
  addForm?: React.ReactNode;
  loading?: boolean;
  empty: { icon?: React.ReactNode; title: string; description?: string };
  noMatches: { title: string; hint?: string };
  children?: React.ReactNode;
}> = ({ meta, head, total, shown, query, onQuery, addForm, loading, empty, noMatches, children }) => (
  <Panel>
    <PanelHead>
      {head}
      <PanelMeta>{meta}</PanelMeta>
      {total > 0 ? (
        <div className="k-panel-search">
          <SearchInput
            value={query}
            onChange={onQuery}
            placeholder="Search"
            label="Search"
          />
        </div>
      ) : null}
    </PanelHead>

    {addForm}

    {loading ? (
      <div className="k-skeleton" aria-busy="true">
        <div className="k-skeleton-row" />
        <div className="k-skeleton-row" />
      </div>
    ) : total === 0 ? (
      <Empty>
        <EmptyHeader>
          <EmptyMedia icon={empty.icon} />
          <EmptyTitle>{empty.title}</EmptyTitle>
          {empty.description ? <EmptyDescription>{empty.description}</EmptyDescription> : null}
        </EmptyHeader>
      </Empty>
    ) : shown === 0 ? (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{noMatches.title}</EmptyTitle>
          {noMatches.hint ? <EmptyDescription>{noMatches.hint}</EmptyDescription> : null}
        </EmptyHeader>
      </Empty>
    ) : (
      children
    )}
  </Panel>
);

export const ListAddForm: React.FC<{
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  submitLabel: string;
  pending?: boolean;
  reason?: string;
  onReason?: (value: string) => void;
  reasonPlaceholder?: string;
}> = ({ value, onChange, onSubmit, placeholder, submitLabel, pending, reason, onReason, reasonPlaceholder }) => {
  const kubek = useKubek();
  const Input: any = kubek?.ui?.Input ?? "input";
  const Button: any = kubek?.ui?.Button ?? "button";
  const Plus = kubek?.icons?.Plus || (() => null);

  return (
    <form
      className="k-add-row"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <Input
        className="k-input"
        value={value}
        placeholder={placeholder}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
      />
      {onReason ? (
        <Input
          className="k-input k-add-reason"
          value={reason ?? ""}
          placeholder={reasonPlaceholder ?? "Reason (optional)"}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => onReason(event.target.value)}
        />
      ) : null}
      <Button type="submit" disabled={!value.trim() || pending}>
        <Plus />
        {submitLabel}
      </Button>
    </form>
  );
};
