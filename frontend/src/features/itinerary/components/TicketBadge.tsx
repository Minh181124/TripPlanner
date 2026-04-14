'use client';

import React from 'react';
import { FileText, Image as ImageIcon, X } from 'lucide-react';
import type { AttachedTicket } from '../services/ticketService';

interface TicketBadgeProps {
  ticket: AttachedTicket;
  onDetach: (attachId: number) => void;
  isDetaching?: boolean;
}

function getTicketIcon(kieu_file: string | null) {
  if (!kieu_file) return <FileText className="w-3 h-3" />;
  if (kieu_file === 'application/pdf') return <FileText className="w-3 h-3" />;
  if (kieu_file.startsWith('image/')) return <ImageIcon className="w-3 h-3" />;
  return <FileText className="w-3 h-3" />;
}

function getLoaiLabel(loai_ve: string | null): string {
  if (!loai_ve) return '';
  const map: Record<string, string> = {
    bus: 'Xe',
    train: 'Tàu',
    event: 'Sự kiện',
    other: 'Khác',
  };
  return map[loai_ve] ?? loai_ve;
}

export function TicketBadge({ ticket, onDetach, isDetaching }: TicketBadgeProps) {
  const handleClick = () => {
    if (ticket.file_url) {
      window.open(ticket.file_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className={`
        group inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5
        rounded-full border text-xs font-semibold
        transition-all duration-200 select-none
        ${ticket.file_url
          ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 cursor-pointer'
          : 'bg-slate-100 border-slate-200 text-slate-600'
        }
      `}
    >
      {/* Icon */}
      <span className="opacity-70">{getTicketIcon(ticket.kieu_file)}</span>

      {/* Tên vé — click mở file */}
      <button
        onClick={handleClick}
        disabled={!ticket.file_url}
        className="max-w-[140px] truncate text-left disabled:cursor-default"
        title={ticket.tieu_de}
      >
        {ticket.tieu_de}
      </button>

      {/* Loại vé badge nhỏ */}
      {ticket.loai_ve && (
        <span className="px-1.5 py-0.5 rounded-full bg-indigo-200/60 text-indigo-600 text-[10px] font-bold">
          {getLoaiLabel(ticket.loai_ve)}
        </span>
      )}

      {/* Xóa */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDetach(ticket.attachId);
        }}
        disabled={isDetaching}
        className={`
          ml-0.5 w-4 h-4 rounded-full flex items-center justify-center
          transition-all duration-150
          ${isDetaching
            ? 'opacity-30 cursor-not-allowed'
            : 'opacity-0 group-hover:opacity-100 hover:bg-indigo-200 text-indigo-500'
          }
        `}
        title="Gỡ vé"
      >
        <X className="w-2.5 h-2.5" />
      </button>
    </div>
  );
}
