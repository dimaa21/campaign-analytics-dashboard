import { useEffect, useMemo, useState } from 'react';
import { flexRender, type PaginationState, type SortingState } from '@tanstack/react-table';
import { sortFn_basic, sortFn_text } from '@tanstack/react-table';
import {
  getPaginationRowModel,
  getSortedRowModel,
  useLegacyTable,
  type LegacyColumnDef,
} from '@tanstack/react-table/legacy';
import type { CampaignRow } from '../../types';
import { Panel } from '../../components/ui/Panel';
import { cx, fieldClass } from '../../utils/cx';
import { formatInteger, formatMoney, formatPercent } from '../../utils/format';
import { toMetrics } from '../../utils/metrics';

const NUMERIC = new Set(['clicks', 'leads', 'cr', 'epc', 'revenue', 'cost', 'profit', 'roi']);

function tone(value: number): string {
  if (value < 0) return 'text-bad';
  if (value > 0) return 'text-good';
  return 'text-muted';
}

function SortMark({ direction }: { direction: false | 'asc' | 'desc' }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 12 12" className="h-3 w-3 shrink-0">
      <path d="M6 2.2 8.4 5H3.6L6 2.2Z" className={direction === 'asc' ? 'fill-ink' : 'fill-line'} />
      <path d="M6 9.8 3.6 7h4.8L6 9.8Z" className={direction === 'desc' ? 'fill-ink' : 'fill-line'} />
    </svg>
  );
}

function buildColumns(): LegacyColumnDef<CampaignRow>[] {
  return [
    { accessorKey: 'offer', header: 'Offer', sortFn: sortFn_text },
    {
      accessorKey: 'geoCode',
      header: 'GEO',
      sortFn: sortFn_text,
      cell: (info) => <span title={info.row.original.geo}>{info.row.original.geoCode}</span>,
    },
    { accessorKey: 'source', header: 'Source', sortFn: sortFn_text },
    {
      accessorKey: 'clicks',
      header: 'Clicks',
      sortFn: sortFn_basic,
      cell: (info) => formatInteger(Number(info.getValue())),
    },
    {
      accessorKey: 'leads',
      header: 'Leads',
      sortFn: sortFn_basic,
      cell: (info) => formatInteger(Number(info.getValue())),
    },
    {
      accessorKey: 'cr',
      header: 'CR',
      sortFn: sortFn_basic,
      cell: (info) => formatPercent(Number(info.getValue()), 2),
    },
    {
      accessorKey: 'epc',
      header: 'EPC',
      sortFn: sortFn_basic,
      cell: (info) => formatMoney(Number(info.getValue()), 3),
    },
    {
      accessorKey: 'revenue',
      header: 'Revenue',
      sortFn: sortFn_basic,
      cell: (info) => formatMoney(Number(info.getValue())),
    },
    {
      accessorKey: 'cost',
      header: 'Cost',
      sortFn: sortFn_basic,
      cell: (info) => formatMoney(Number(info.getValue())),
    },
    {
      accessorKey: 'profit',
      header: 'Profit',
      sortFn: sortFn_basic,
      cell: (info) => {
        const value = Number(info.getValue());
        return <span className={tone(value)}>{formatMoney(value)}</span>;
      },
    },
    {
      accessorKey: 'roi',
      header: 'ROI',
      sortFn: sortFn_basic,
      cell: (info) => {
        const value = Number(info.getValue());
        return <span className={tone(value)}>{formatPercent(value, 1)}</span>;
      },
    },
  ];
}

export function CampaignTable({ rows }: { rows: CampaignRow[] }) {
  const columns = useMemo(buildColumns, []);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'profit', desc: true }]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const rowKey = rows.map((row) => row.campaignId).join('|');

  useEffect(() => {
    setPagination((current) => (current.pageIndex === 0 ? current : { ...current, pageIndex: 0 }));
  }, [rowKey]);

  const table = useLegacyTable({
    data: rows,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
  });

  const totals = useMemo(
    () =>
      toMetrics(
        rows.reduce(
          (bucket, row) => ({
            clicks: bucket.clicks + row.clicks,
            leads: bucket.leads + row.leads,
            revenue: bucket.revenue + row.revenue,
            cost: bucket.cost + row.cost,
          }),
          { clicks: 0, leads: 0, revenue: 0, cost: 0 },
        ),
      ),
    [rows],
  );

  const page = table.getState().pagination;
  const pageRows = table.getRowModel().rows;
  const total = rows.length;
  const from = total === 0 ? 0 : page.pageIndex * page.pageSize + 1;
  const to = Math.min(total, from + pageRows.length - 1);
  const headerCount = table.getHeaderGroups()[0]?.headers.length ?? 1;

  return (
    <Panel title="Campaigns" description="Rates in the total row are recomputed from the summed clicks, leads, revenue and cost.">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] border-collapse text-left text-sm">
          <caption className="sr-only">Campaign performance for the selected filters</caption>
          <thead>
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id} className="border-b border-line">
                {group.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  const alignRight = NUMERIC.has(header.column.id);
                  const ariaSort = sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none';
                  return (
                    <th
                      key={header.id}
                      scope="col"
                      aria-sort={ariaSort}
                      className={cx(
                        'px-3 py-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted',
                        alignRight && 'text-right',
                        header.column.id === 'offer' && 'sticky left-0 z-10 bg-panel',
                      )}
                    >
                      <button
                        type="button"
                        className={cx(
                          'inline-flex items-center gap-1 rounded focus-visible:ring-2 focus-visible:ring-accent',
                          alignRight && 'ml-auto',
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <SortMark direction={sorted} />
                      </button>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={headerCount} className="px-3 py-8 text-center text-sm text-muted">
                  No campaigns match these filters.
                </td>
              </tr>
            ) : (
              pageRows.map((row) => (
                <tr key={row.id} className="group border-t border-line">
                  {row.getAllCells().map((cell) => {
                    const alignRight = NUMERIC.has(cell.column.id);
                    return (
                      <td
                        key={cell.id}
                        className={cx(
                          'whitespace-nowrap px-3 py-2 text-ink group-hover:bg-soft',
                          alignRight && 'text-right font-mono text-xs tabular-nums',
                          cell.column.id === 'geoCode' && 'font-mono text-xs',
                          cell.column.id === 'offer' &&
                            'sticky left-0 z-10 bg-panel text-sm group-hover:bg-soft',
                          (cell.column.id === 'source' || cell.column.id === 'offer') && 'text-sm',
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
          {total > 0 ? (
            <tfoot>
              <tr className="border-t border-line font-medium">
                <th scope="row" className="sticky left-0 z-10 bg-panel px-3 py-2 text-left text-sm">
                  Total
                </th>
                <td className="px-3 py-2 text-muted">—</td>
                <td className="px-3 py-2 text-muted">—</td>
                <td className="px-3 py-2 text-right font-mono text-xs tabular-nums">{formatInteger(totals.clicks)}</td>
                <td className="px-3 py-2 text-right font-mono text-xs tabular-nums">{formatInteger(totals.leads)}</td>
                <td className="px-3 py-2 text-right font-mono text-xs tabular-nums">{formatPercent(totals.cr, 2)}</td>
                <td className="px-3 py-2 text-right font-mono text-xs tabular-nums">{formatMoney(totals.epc, 3)}</td>
                <td className="px-3 py-2 text-right font-mono text-xs tabular-nums">{formatMoney(totals.revenue)}</td>
                <td className="px-3 py-2 text-right font-mono text-xs tabular-nums">{formatMoney(totals.cost)}</td>
                <td className={cx('px-3 py-2 text-right font-mono text-xs tabular-nums', tone(totals.profit))}>
                  {formatMoney(totals.profit)}
                </td>
                <td className={cx('px-3 py-2 text-right font-mono text-xs tabular-nums', tone(totals.roi))}>
                  {formatPercent(totals.roi, 1)}
                </td>
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
        <p>
          Showing {from}–{Math.max(from, to)} of {total}
        </p>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2">
            <span>Rows</span>
            <select
              className={cx(fieldClass, 'h-8')}
              value={page.pageSize}
              onChange={(event) => {
                table.setPageSize(Number(event.target.value));
                table.setPageIndex(0);
              }}
            >
              {[10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="h-8 rounded-md border border-line px-2 disabled:opacity-40"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </button>
          <span>
            {page.pageIndex + 1} / {Math.max(table.getPageCount(), 1)}
          </span>
          <button
            type="button"
            className="h-8 rounded-md border border-line px-2 disabled:opacity-40"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </button>
        </div>
      </div>
    </Panel>
  );
}
