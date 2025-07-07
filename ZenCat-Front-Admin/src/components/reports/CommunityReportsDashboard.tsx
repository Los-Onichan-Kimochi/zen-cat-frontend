import React, { useEffect, useState, useRef } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as PieTooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  communityReportsApi,
  CommunityReportResponse,
} from '@/api/reportes/communityReports';
import dayjs from 'dayjs';
import {
  FaCalendarAlt,
  FaUsers,
  FaUserCheck,
  FaUserTimes,
  FaCalendarCheck,
  FaCalendarTimes,
  FaTimes,
} from 'react-icons/fa';
import { ExportButtons } from '@/components/common/ExportButtons';
import jsPDF from 'jspdf';

// Paleta de colores del Admin
const PALETTE = [
  '#2563eb', // Azul
  '#f59e42', // Naranja
  '#10b981', // Verde
  '#ef4444', // Rojo
  '#111111', // Negro
  '#8b5cf6', // Púrpura
  '#06b6d4', // Cyan
];

// Quick filters (enfocados al pasado)
const today = dayjs();
const quickRanges = [
  { label: 'Última semana', get: () => [today.subtract(6, 'day'), today] },
  {
    label: 'Último mes',
    get: () => [today.subtract(1, 'month').add(1, 'day'), today],
  },
  {
    label: 'Últimos 6 meses',
    get: () => [today.subtract(6, 'month').add(1, 'day'), today],
  },
  { label: 'Este año', get: () => [today.startOf('year'), today] },
];

function formatDate(date: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [y, m, d] = date.split('-');
    return `${d}/${m}/${y}`;
  }
  if (/^\d{4}-\d{2}$/.test(date)) {
    const [y, m] = date.split('-');
    return `${m}/${y}`;
  }
  if (/^\d{4}-W\d{2}$/.test(date)) {
    return date.replace('-W', ' Semana ');
  }
  return date;
}

function exportToCSV(
  data: {
    name: string;
    total: number;
    percent: string;
    active: number;
    expired: number;
    cancelled: number;
    activeUsers: number;
  }[],
  from: string,
  to: string,
  totalGeneral: number,
  totalActive: number,
  totalExpired: number,
  totalCancelled: number,
  totalActiveUsers: number,
) {
  if (!data.length) return;
  const header = [
    'Comunidad',
    'Total membresías',
    '% del total',
    'Activas',
    'Expiradas',
    'Canceladas',
    'Usuarios activos',
  ];
  const rows = data.map((row) => [
    row.name,
    row.total,
    row.percent,
    row.active,
    row.expired,
    row.cancelled,
    row.activeUsers,
  ]);
  const totals = [
    'TOTAL GENERAL',
    totalGeneral,
    '100%',
    totalActive,
    totalExpired,
    totalCancelled,
    totalActiveUsers,
  ];
  const csv = [header, ...rows, totals].map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reporte_comunidades_totales_${from}_a_${to}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportToPDF(
  communities: any[],
  from: string,
  to: string,
  totalGeneral: number,
  totalActive: number,
  totalExpired: number,
  totalCancelled: number,
  totalActiveUsers: number,
) {
  const doc = new jsPDF();
  let y = 15;

  // Colores ejecutivos para el PDF
  const colors = ['#2E86AB', '#A23B72', '#F18F01', '#C73E1D', '#3A1772', '#8B5CF6', '#06B6D4'];

  // Título
  doc.setFontSize(18);
  doc.text('Reporte de Comunidades', 10, y);
  y += 10;
  doc.setFontSize(12);
  doc.text('ZenCat - Dashboard de Comunidades', 10, y);
  y += 8;
  doc.setFontSize(10);
  doc.text(`Período: ${formatDate(from)} - ${formatDate(to)}`, 10, y);
  y += 10;

  // Totales generales
  doc.setFontSize(12);
  doc.text(`Total membresías: ${totalGeneral}`, 10, y);
  y += 7;
  doc.text(`Activas: ${totalActive}   Expiradas: ${totalExpired}   Canceladas: ${totalCancelled}   Usuarios activos: ${totalActiveUsers}`, 10, y);
  y += 10;

  // Resumen de comunidades
  if (communities.length > 0) {
    doc.setFontSize(14);
    doc.text('Distribución de Membresías por Comunidad', 10, y);
    y += 8;

    // Filtrar comunidades con membresías activas
    const activeCommunities = communities
      .filter(c => c.ActiveMemberships > 0)
      .sort((a, b) => b.ActiveMemberships - a.ActiveMemberships);

    if (activeCommunities.length > 0) {
      const totalActiveSum = activeCommunities.reduce((sum, c) => sum + c.ActiveMemberships, 0);

      // Mostrar top 5 comunidades
      const topCommunities = activeCommunities.slice(0, 5);

      doc.setFontSize(10);
      doc.text('Top 5 Comunidades por Membresías Activas:', 10, y);
      y += 6;

      topCommunities.forEach((community, index) => {
        const percentage = ((community.ActiveMemberships / totalActiveSum) * 100).toFixed(1);
        doc.text(`${community.CommunityName}: ${community.ActiveMemberships} activas (${percentage}%)`, 10, y);
        y += 5;
      });

      y += 5;
    }
  }

  // Tabla de comunidades
  doc.setFontSize(11);
  doc.text('Comunidades:', 10, y);
  y += 7;
  doc.setFontSize(10);
  doc.text('Comunidad', 10, y);
  doc.text('Total', 50, y);
  doc.text('%', 70, y);
  doc.text('Activas', 85, y);
  doc.text('Expiradas', 110, y);
  doc.text('Canceladas', 140, y);
  doc.text('Usuarios activos', 170, y);
  y += 5;
  doc.text('----------------------------------------------------------------------------------------------------', 10, y);
  y += 3;

  communities.forEach((c) => {
    doc.text(String(c.CommunityName), 10, y);
    doc.text(String(c.Total), 50, y);
    doc.text(c.percent || '', 70, y);
    doc.text(String(c.ActiveMemberships), 85, y);
    doc.text(String(c.ExpiredMemberships), 110, y);
    doc.text(String(c.CancelledMemberships), 140, y);
    doc.text(String(c.ActiveUsers), 170, y);
    y += 6;
  });

  y += 4;
  doc.text('----------------------------------------------------------------------------------------------------', 10, y);
  y += 8;

  // Resumen destacado
  if (communities.length > 0) {
    const max = communities.reduce((a, b) =>
      a.ActiveMemberships > b.ActiveMemberships ? a : b,
    );
    const porcentaje = totalActive
      ? ((max.ActiveMemberships / totalActive) * 100).toFixed(1)
      : '0';
    doc.setFontSize(11);
    doc.text(
      `La comunidad con más membresías activas es ${max.CommunityName} con ${max.ActiveMemberships} activas (${porcentaje}%)`,
      10,
      y,
    );
  }

  doc.save(`reporte_comunidades_${from}_a_${to}.pdf`);
}

const renderPieLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize="12"
      fontWeight="bold"
    >
      {percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
    </text>
  );
};

// Tooltip enriquecido para el donut
function CustomPieTooltip({ active, payload }: any) {
  if (active && payload && payload.length && payload[0].payload) {
    const c = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded shadow text-sm border border-gray-200 text-black min-w-[180px]">
        <div className="font-bold mb-1" style={{ color: payload[0].color }}>
          {c.CommunityName}
        </div>
        <div>
          <b>Total:</b> {c.Total} membresías
        </div>
        <div>
          <b>% del total:</b> {c._percent ? c._percent : ''}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
          <div className="text-green-600">
            Activas: <b>{c.ActiveMemberships}</b>
          </div>
          <div className="text-orange-500">
            Expiradas: <b>{c.ExpiredMemberships}</b>
          </div>
          <div className="text-red-500">
            Canceladas: <b>{c.CancelledMemberships}</b>
          </div>
          <div className="text-blue-600">
            Usuarios activos: <b>{c.ActiveUsers}</b>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export default function CommunityReportsDashboard() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [data, setData] = useState<CommunityReportResponse | null>(null);
  const [prevData, setPrevData] = useState<CommunityReportResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialFetchDone, setInitialFetchDone] = useState(false);

  // Ref para el elemento que se exportará como PDF
  const pdfElementRef = useRef<HTMLDivElement>(null);

  // Calcular días de diferencia
  function getDaysDiff() {
    if (!from || !to) return 0;
    return dayjs(to).diff(dayjs(from), 'day') + 1;
  }

  // Calcular rango anterior equivalente
  function getPreviousRange() {
    if (!from || !to) return [null, null];
    const days = getDaysDiff();
    const prevTo = dayjs(from).subtract(1, 'day');
    const prevFrom = prevTo.subtract(days - 1, 'day');
    return [prevFrom.format('YYYY-MM-DD'), prevTo.format('YYYY-MM-DD')];
  }

  // Al cargar, rango por defecto: Último mes
  useEffect(() => {
    if (!from && !to) {
      const [start, end] = quickRanges[1].get(); // Último mes
      setFrom(start.format('YYYY-MM-DD'));
      setTo(end.format('YYYY-MM-DD'));
    }
  }, []);

  // Disparar fetch cada vez que cambian from o to
  useEffect(() => {
    if (
      !from ||
      !to ||
      !dayjs(from).isValid() ||
      !dayjs(to).isValid() ||
      dayjs(from).isAfter(dayjs(to))
    ) {
      setData(null);
      setPrevData(null);
      return;
    }
    setData(null);
    setPrevData(null);
    fetchBothReports();
  }, [from, to]);

  async function fetchBothReports() {
    setLoading(true);
    setError(null);
    try {
      const [prevFrom, prevTo] = getPreviousRange();
      const [current, previous] = await Promise.all([
        communityReportsApi.getCommunityReport({
          from,
          to,
          groupBy: 'day', // Usar 'day' como valor fijo
        }),
        prevFrom && prevTo
          ? communityReportsApi.getCommunityReport({
            from: prevFrom,
            to: prevTo,
            groupBy: 'day', // Usar 'day' como valor fijo
          })
          : Promise.resolve(null),
      ]);
      setData(current);
      setPrevData(previous);
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-zinc-50 pb-12 font-montserrat" ref={pdfElementRef}>
      {/* Barra de filtros visual igual a ReportsDashboard */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 bg-zinc-50 rounded-lg p-4 shadow-sm border border-zinc-200 mb-2">
        {/* Filtros a la izquierda */}
        <div className="flex flex-wrap gap-2 items-center">
          {quickRanges.map((r) => (
            <button
              key={r.label}
              className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all duration-200 bg-white text-gray-700 hover:border-blue-600 hover:bg-blue-50 hover:shadow-md active:scale-95 ${from === r.get()[0].format('YYYY-MM-DD') && to === r.get()[1].format('YYYY-MM-DD') ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}
              onClick={() => {
                const [start, end] = r.get();
                setFrom(start.format('YYYY-MM-DD'));
                setTo(end.format('YYYY-MM-DD'));
              }}
            >
              {r.label}
            </button>
          ))}
          <div className="flex items-center gap-1 ml-4">
            <FaCalendarAlt color="#a3a3a3" size={20} />
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-black focus:outline-none focus:border-blue-500 transition w-36 shadow-sm font-montserrat text-sm"
            />
          </div>
          <span className="mx-1 text-gray-400">-</span>
          <div className="flex items-center gap-1">
            <FaCalendarAlt color="#a3a3a3" size={20} />
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-black focus:outline-none focus:border-blue-500 transition w-36 shadow-sm font-montserrat text-sm"
            />
          </div>
        </div>
        {/* Botones a la derecha */}
        <div className="flex gap-2">
          <ExportButtons
            onExportCSV={() => {
              if (
                !data ||
                !Array.isArray(data.communities) ||
                !data.communities.length
              )
                return;
              const totalGeneral = data.totalMemberships || 0;
              const totalActive = data.summary?.totalActiveMemberships || 0;
              const totalExpired = data.summary?.totalExpiredMemberships || 0;
              const totalCancelled = data.summary?.totalCancelledMemberships || 0;
              const totalActiveUsers = data.summary?.totalActiveUsers || 0;
              const rows = data.communities.map((c) => ({
                name: c.CommunityName,
                total: c.Total,
                percent: totalGeneral
                  ? ((c.Total / totalGeneral) * 100).toFixed(1) + '%'
                  : '0%',
                active: c.ActiveMemberships,
                expired: c.ExpiredMemberships,
                cancelled: c.CancelledMemberships,
                activeUsers: c.ActiveUsers,
              }));
              exportToCSV(
                rows,
                from,
                to,
                totalGeneral,
                totalActive,
                totalExpired,
                totalCancelled,
                totalActiveUsers,
              );
            }}
            onExportPDF={() => {
              if (
                !data ||
                !Array.isArray(data.communities) ||
                !data.communities.length
              )
                return;
              const totalGeneral = data.totalMemberships || 0;
              const totalActive = data.summary?.totalActiveMemberships || 0;
              const totalExpired = data.summary?.totalExpiredMemberships || 0;
              const totalCancelled = data.summary?.totalCancelledMemberships || 0;
              const totalActiveUsers = data.summary?.totalActiveUsers || 0;
              exportToPDF(
                data.communities.map((c) => ({
                  ...c,
                  percent: totalGeneral
                    ? ((c.Total / totalGeneral) * 100).toFixed(1) + '%'
                    : '0%',
                })),
                from,
                to,
                totalGeneral,
                totalActive,
                totalExpired,
                totalCancelled,
                totalActiveUsers,
              );
            }}
            disabled={loading || !data?.communities.length}
            loading={loading}
          />
        </div>
      </div>

      {!loading &&
        (!data ||
          !Array.isArray(data.communities) ||
          !data.communities ||
          data.communities.length === 0) && (
          <div className="text-sm text-gray-500 font-semibold mb-2">
            No hay membresías para el rango seleccionado.
          </div>
        )}

      {/* Tarjetas de resumen general */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-black border-l-4 border-black p-4 rounded shadow flex flex-col items-center justify-center min-h-[100px]">
          <div className="text-lg font-semibold text-white">
            Total membresías
          </div>
          <div className="text-3xl font-bold text-white">
            {data ? data.totalMemberships : '-'}
          </div>
        </div>
        <div className="bg-green-600 border-l-4 border-green-600 p-4 rounded shadow flex flex-col items-center justify-center min-h-[100px]">
          <div className="text-lg font-semibold text-white flex items-center gap-2">
            <FaUserCheck /> Activas
          </div>
          <div className="text-3xl font-bold text-white">
            {data ? data.summary.totalActiveMemberships : '-'}
          </div>
        </div>
        <div className="bg-orange-500 border-l-4 border-orange-500 p-4 rounded shadow flex flex-col items-center justify-center min-h-[100px]">
          <div className="text-lg font-semibold text-white flex items-center gap-2">
            <FaCalendarTimes /> Expiradas
          </div>
          <div className="text-3xl font-bold text-white">
            {data ? data.summary.totalExpiredMemberships : '-'}
          </div>
        </div>
        <div className="bg-red-500 border-l-4 border-red-500 p-4 rounded shadow flex flex-col items-center justify-center min-h-[100px]">
          <div className="text-lg font-semibold text-white flex items-center gap-2">
            <FaTimes /> Canceladas
          </div>
          <div className="text-3xl font-bold text-white">
            {data ? data.summary.totalCancelledMemberships : '-'}
          </div>
        </div>
      </div>

      {/* Tarjetas de engagement */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-600 border-l-4 border-blue-600 p-4 rounded shadow flex flex-col items-center justify-center min-h-[100px]">
          <div className="text-lg font-semibold text-white flex items-center gap-2">
            <FaUsers /> Usuarios activos
          </div>
          <div className="text-3xl font-bold text-white">
            {data ? data.summary.totalActiveUsers : '-'}
          </div>
        </div>
        <div className="bg-gray-500 border-l-4 border-gray-500 p-4 rounded shadow flex flex-col items-center justify-center min-h-[100px]">
          <div className="text-lg font-semibold text-white flex items-center gap-2">
            <FaUserTimes /> Usuarios inactivos
          </div>
          <div className="text-3xl font-bold text-white">
            {data ? data.summary.totalInactiveUsers : '-'}
          </div>
        </div>
        <div className="bg-purple-600 border-l-4 border-purple-600 p-4 rounded shadow flex flex-col items-center justify-center min-h-[100px]">
          <div className="text-lg font-semibold text-white flex items-center gap-2">
            <FaCalendarCheck /> Total reservas
          </div>
          <div className="text-3xl font-bold text-white">
            {data ? data.summary.totalReservations : '-'}
          </div>
        </div>
      </div>

      {!loading &&
        !error &&
        data &&
        Array.isArray(data.communities) &&
        data.communities.length > 0 && (
          <>
            {/* Subtítulo explicativo */}
            <div className="w-full max-w-3xl mx-auto text-center mt-4 mb-2">
              <h2 className="text-2xl font-bold text-black mb-1">
                Membresías por comunidad
              </h2>
              <div className="text-base text-gray-500 font-medium">
                Distribución de membresías activas por comunidad en el periodo
                seleccionado
              </div>
            </div>
            {/* Donut centrado arriba */}
            <div className="w-full flex justify-center mb-10 mt-6">
              <ResponsiveContainer width={420} height={420}>
                <PieChart>
                  <Pie
                    data={data.communities.map((c) => ({
                      ...c,
                      _percent: data.summary?.totalActiveMemberships
                        ? (
                          (c.ActiveMemberships /
                            data.summary.totalActiveMemberships) *
                          100
                        ).toFixed(1) + '%'
                        : '0%',
                    }))}
                    dataKey="ActiveMemberships"
                    nameKey="CommunityName"
                    cx="50%"
                    cy="50%"
                    innerRadius={120}
                    outerRadius={180}
                    paddingAngle={2}
                    label={renderPieLabel}
                    labelLine={false}
                    isAnimationActive={true}
                    animationDuration={900}
                  >
                    {data.communities.map((entry, idx) => (
                      <Cell
                        key={entry.CommunityName}
                        fill={PALETTE[idx % PALETTE.length]}
                      />
                    ))}
                  </Pie>
                  <PieTooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Grid de tarjetas de comunidades */}
            <div className="w-full max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-2 md:px-8">
              {data.communities.map((c, idx) => {
                // Buscar comunidad correspondiente en prevData
                const prevC = prevData?.communities?.find(
                  (pc) => pc.CommunityId === c.CommunityId,
                );
                const diff = prevC
                  ? c.ActiveMemberships - prevC.ActiveMemberships
                  : null;
                const percentDiff =
                  prevC && prevC.ActiveMemberships > 0
                    ? ((c.ActiveMemberships - prevC.ActiveMemberships) /
                      prevC.ActiveMemberships) *
                    100
                    : null;
                return (
                  <div
                    key={c.CommunityId}
                    className={`flex flex-col gap-1 rounded-2xl px-6 py-4 shadow-lg border-l-8 border-t border-r border-b border-zinc-200 bg-white/90 hover:bg-blue-50 transition-all duration-200 animate-fade-in ${idx % 2 === 0 ? 'bg-white' : 'bg-zinc-50'}`}
                    style={{ borderLeftColor: PALETTE[idx % PALETTE.length] }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="inline-block w-4 h-4 rounded"
                        style={{ background: PALETTE[idx % PALETTE.length] }}
                      ></span>
                      <span className="font-semibold text-lg text-black">
                        {c.CommunityName}
                      </span>
                    </div>
                    <div className="flex items-end gap-2 mb-1">
                      <span className="text-3xl font-bold text-black">
                        {c.ActiveMemberships}
                      </span>
                      <span className="text-base text-gray-500">activas</span>
                      <span
                        className="text-xs font-bold ml-2"
                        style={{ color: PALETTE[idx % PALETTE.length] }}
                      >
                        {data.summary?.totalActiveMemberships
                          ? (
                            (c.ActiveMemberships /
                              data.summary.totalActiveMemberships) *
                            100
                          ).toFixed(1)
                          : '0'}
                        %
                      </span>
                      {/* Comparativa visual */}
                      {diff !== null && (
                        <span
                          className={`ml-2 text-xs font-bold flex items-center ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-500' : 'text-gray-400'}`}
                        >
                          {diff > 0 && <span>▲</span>}
                          {diff < 0 && <span>▼</span>}
                          {diff !== 0 && (
                            <span className="ml-0.5">{Math.abs(diff)}</span>
                          )}
                          {diff === 0 && <span>=</span>}
                          {percentDiff !== null && (
                            <span className="ml-1">
                              ({percentDiff > 0 ? '+' : ''}
                              {percentDiff.toFixed(1)}%)
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                    {/* Métricas principales: activas, expiradas, canceladas */}
                    <div className="flex items-center gap-4 mt-1 text-sm">
                      <div className="flex items-center gap-1 text-green-600">
                        <span>✔️</span> {c.ActiveMemberships}
                      </div>
                      <div className="flex items-center gap-1 text-orange-500">
                        <span>🗓️</span> {c.ExpiredMemberships}
                      </div>
                      <div className="flex items-center gap-1 text-red-500">
                        <span>✖️</span> {c.CancelledMemberships}
                      </div>
                    </div>
                    {/* Usuarios activos: solo como badge separado */}
                    <div className="mt-2 flex items-center gap-2 text-xs text-blue-600 bg-blue-50 rounded px-2 py-1 w-fit">
                      <span>👥</span>
                      <span>{c.ActiveUsers} usuarios activos</span>
                    </div>
                    <div className="text-[11px] text-gray-400 mt-1">
                      Usuarios que han usado su membresía en el periodo
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Resumen destacado centrado al final */}
            <div className="mt-10 text-base text-center font-semibold text-gray-700 w-full">
              {(() => {
                if (
                  !data ||
                  !Array.isArray(data.communities) ||
                  data.communities.length === 0
                )
                  return null;
                const max = data.communities.reduce((a, b) =>
                  a.ActiveMemberships > b.ActiveMemberships ? a : b,
                );
                const porcentaje = data.summary?.totalActiveMemberships
                  ? (
                    (max.ActiveMemberships /
                      data.summary.totalActiveMemberships) *
                    100
                  ).toFixed(1)
                  : '0';
                // Buscar comunidad líder en prevData
                const prevC = prevData?.communities?.find(
                  (pc) => pc.CommunityId === max.CommunityId,
                );
                const diff = prevC
                  ? max.ActiveMemberships - prevC.ActiveMemberships
                  : null;
                const percentDiff =
                  prevC && prevC.ActiveMemberships > 0
                    ? ((max.ActiveMemberships - prevC.ActiveMemberships) /
                      prevC.ActiveMemberships) *
                    100
                    : null;
                return (
                  <span>
                    🏆 La comunidad con más membresías activas es{' '}
                    <span
                      className="font-bold"
                      style={{
                        color:
                          PALETTE[
                          data.communities.indexOf(max) % PALETTE.length
                          ],
                      }}
                    >
                      {max.CommunityName}
                    </span>{' '}
                    con {max.ActiveMemberships} activas ({porcentaje}%)
                    {diff !== null && (
                      <span
                        className={`ml-2 text-xs font-bold ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-500' : 'text-gray-400'}`}
                      >
                        {diff > 0 && <span>▲</span>}
                        {diff < 0 && <span>▼</span>}
                        {diff !== 0 && (
                          <span className="ml-0.5">{Math.abs(diff)}</span>
                        )}
                        {diff === 0 && <span>=</span>}
                        {percentDiff !== null && (
                          <span className="ml-1">
                            ({percentDiff > 0 ? '+' : ''}
                            {percentDiff.toFixed(1)}%)
                          </span>
                        )}
                      </span>
                    )}
                  </span>
                );
              })()}
            </div>
          </>
        )}
    </div>
  );
}
