export function formatRupiah(number) {
  if (number === undefined || number === null) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
}

/**
 * Robustly parses UTC timestamps from SQLite (which lack 'Z' or timezone offset)
 * or standard ISO strings, ensuring the browser converts it correctly to local WIB time
 * without the +7 hour offset bug.
 */
export function parseDate(dateInput) {
  if (!dateInput) return new Date();
  if (dateInput instanceof Date) return dateInput;
  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();
    // If it lacks timezone information (e.g. SQLite "YYYY-MM-DD HH:MM:SS" or "YYYY-MM-DDTHH:MM:SS")
    if (!trimmed.includes('Z') && !trimmed.includes('+') && !trimmed.includes('UTC')) {
      if (trimmed.includes(' ') && !trimmed.includes('T')) {
        return new Date(trimmed.replace(' ', 'T') + 'Z');
      }
      return new Date(trimmed + 'Z');
    }
  }
  return new Date(dateInput);
}

export function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const date = parseDate(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // If call or order was just created (or minor clock variance < 60s)
  if (diffInSeconds < 60) return 'Baru saja';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} mnt lalu`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} jam lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

export function formatDate(dateString) {
  if (!dateString) return '';
  const date = parseDate(dateString);
  return date.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
