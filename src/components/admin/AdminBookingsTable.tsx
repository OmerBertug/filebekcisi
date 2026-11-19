// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

'use client';

import { Trash2 } from 'lucide-react';
import type { BookingRecord } from '@/domain/goalkeeper';
import type { AppDictionary } from '@/i18n';

/**
 * Props accepted by the `AdminBookingsTable` moderation component.
 */
export interface AdminBookingsTableProps {
  /** Persisted customer match bookings loaded from PostgreSQL or JSON storage. */
  readonly bookings: readonly BookingRecord[];
  /** Active localized copy dictionary. */
  readonly dictionary: AppDictionary;
  /** ID of the booking currently being deleted, or `null`. */
  readonly busyBookingId: string | null;
  /** Callback deleting a booking record by `id`. */
  readonly onDeleteBooking: (id: string) => Promise<void>;
}

interface BookingTableRowProps {
  readonly booking: BookingRecord;
  readonly dictionary: AppDictionary;
  readonly isBusy: boolean;
  readonly onDeleteBooking: (id: string) => Promise<void>;
}

/**
 * Renders a single customer booking row showing organizer details, booked goalkeeper,
 * venue schedule, and dual-sided 15% + 15% commission revenue figures.
 */
function BookingTableRow({
  booking,
  dictionary,
  isBusy,
  onDeleteBooking,
}: BookingTableRowProps): React.JSX.Element {
  const currency = dictionary.filters.currencySymbol;
  return (
    <tr className="border-t border-white/[0.06] transition hover:bg-[#1A232C]">
      <td className="px-4 py-4">
        <p className="font-heading font-semibold text-[#F8FAFC]">{booking.organizerName}</p>
        <p className="font-heading text-xs tabular-nums text-[#94A3B8]">{booking.organizerPhone}</p>
      </td>
      <td className="px-4 py-4">
        <p className="font-heading font-semibold text-[#F8FAFC]">{booking.goalkeeperName}</p>
        <p className="text-xs text-[#94A3B8]">{dictionary.districts[booking.district]}</p>
      </td>
      <td className="px-4 py-4 text-xs text-[#94A3B8]">
        <p className="font-medium text-[#E0E3E7]">{booking.venueName}</p>
        <p>
          {dictionary.days[booking.matchDate]} · {booking.matchTime}
        </p>
      </td>
      <td className="px-4 py-4 text-xs text-[#94A3B8]">
        <p>
          {dictionary.admin.bookingCustomerPaysPrefix}{' '}
          <strong className="font-heading font-semibold tabular-nums text-[#F8FAFC]">
            {booking.totalPayableTry} {currency}
          </strong>
        </p>
        <p>
          {dictionary.admin.bookingKeeperNetPrefix}{' '}
          <strong className="font-heading font-semibold tabular-nums text-[#E0E3E7]">
            {booking.goalkeeperNetPayoutTry} {currency}
          </strong>
        </p>
        <p>
          {dictionary.admin.bookingPlatformCutPrefix}{' '}
          <strong className="font-heading font-bold tabular-nums text-[#14E777]">
            +{booking.platformTotalRevenueTry} {currency}
          </strong>
        </p>
      </td>
      <td className="px-4 py-4">
        <button
          type="button"
          disabled={isBusy}
          onClick={() => void onDeleteBooking(booking.id)}
          className="inline-flex items-center gap-1 rounded-md border border-[#FFB4AB]/40 bg-[#93000A]/30 px-3 py-1.5 font-heading text-[11px] font-semibold tracking-wider text-[#FFB4AB] uppercase transition hover:bg-[#FFB4AB] hover:text-[#690005] disabled:opacity-50"
        >
          <Trash2 className="h-3 w-3" aria-hidden="true" />
          <span>{dictionary.admin.deleteButton}</span>
        </button>
      </td>
    </tr>
  );
}

/**
 * Administrator table displaying customer match booking orders, venue schedules, and
 * dual-sided (15% goalkeeper + 15% customer) brokerage revenue figures.
 *
 * @param props - `AdminBookingsTableProps` binding booking records and delete callback.
 * @returns Rendered bookings moderation section.
 */
export function AdminBookingsTable({
  bookings,
  dictionary,
  busyBookingId,
  onDeleteBooking,
}: AdminBookingsTableProps): React.JSX.Element {
  return (
    <div className="mt-12 space-y-4">
      <div className="border-l-2 border-[#14E777] pl-4">
        <h2 className="font-heading text-xl font-bold text-[#F8FAFC]">
          {dictionary.admin.bookingsSectionTitle}
        </h2>
        <p className="mt-1 text-xs text-[#94A3B8]">{dictionary.admin.bookingsSectionSubtitle}</p>
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-lg border border-white/[0.08] bg-[#12181F] p-8 text-center text-sm text-[#94A3B8]">
          {dictionary.admin.emptyBookings}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-white/[0.08] bg-[#12181F]">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-[#1A232C] font-heading text-[11px] font-semibold tracking-[0.1em] text-[#94A3B8] uppercase">
                <th className="px-4 py-3.5">{dictionary.admin.bookingHeaderOrganizer}</th>
                <th className="px-4 py-3.5">{dictionary.admin.bookingHeaderKeeper}</th>
                <th className="px-4 py-3.5">{dictionary.admin.bookingHeaderSchedule}</th>
                <th className="px-4 py-3.5">{dictionary.admin.bookingHeaderFinancials}</th>
                <th className="px-4 py-3.5">{dictionary.admin.tableHeaderActions}</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <BookingTableRow
                  key={booking.id}
                  booking={booking}
                  dictionary={dictionary}
                  isBusy={busyBookingId === booking.id}
                  onDeleteBooking={onDeleteBooking}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
