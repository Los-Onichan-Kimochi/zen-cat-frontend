import React, { useEffect, useState, useRef } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Label,
  Tooltip as PieTooltip,
} from 'recharts';
import {
  reportesApi,
  ServiceReportResponse,
} from '@/api/reportes/serviceReports';
import dayjs from 'dayjs';
import { FaCalendarAlt } from 'react-icons/fa';
import { ExportButtons } from '@/components/common/ExportButtons';

const groupByOptions = [
  { value: 'day', label: 'Día' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mes' },
];

// Paleta de colores del Admin (azul, naranja, verde, rojo, negro)
const PALETTE = [
  '#2563eb', // Azul
  '#f59e42', // Naranja
  '#10b981', // Verde
  '#ef4444', // Rojo
  '#111111', // Negro
];

// Quick filters simplificados
const today = dayjs();
const quickRanges = [
  { label: 'Próxima semana', get: () => [today, today.add(6, 'day')] },
  { label: 'Próximo mes', get: () => [today, today.add(1, 'month')] },
  { label: 'Próximos 6 meses', get: () => [today, today.add(6, 'month')] },
  {
    label: 'Últimos 6 meses',
    get: () => [today.subtract(6, 'month').add(1, 'day'), today],
  },
];

function formatDate(date: string) {
  // date puede venir como '2025-07-03' o '2025-07' o '2025-W27'
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
  data: any[],
  services: string[],
  from: string,
  to: string,
  totalGeneral: number,
) {
  if (!data.length) return;
  const header = [
    'Fecha',
    ...services,
    'Total por fecha',
    ...services.map((s) => `% ${s}`),
  ];
  const rows = data.map((row) => {
    const counts = services.map((s) => row[s] ?? 0);
    const total = counts.reduce((a, b) => a + b, 0);
    const percentages = counts.map((c) =>
      total ? ((c / total) * 100).toFixed(1) + '%' : '0%',
    );
    return [formatDate(row.date), ...counts, total, ...percentages];
  });
  // Fila de totales generales
  const totals = [
    'TOTAL GENERAL',
    ...services.map((s) => data.reduce((acc, row) => acc + (row[s] ?? 0), 0)),
    totalGeneral,
    ...services.map(() => ''),
  ];
  const csv = [header, ...rows, totals].map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reporte_reservas_${from}_a_${to}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded shadow text-sm border border-gray-200 text-black">
        <div className="font-semibold mb-1">{formatDate(label)}</div>
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex items-center gap-2">
            <span
              style={{
                display: 'inline-block',
                width: 12,
                height: 12,
                background: entry.color,
                borderRadius: 2,
              }}
            />
            <span>{entry.dataKey}:</span>
            <span className="font-bold">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Label personalizado para el PieChart
const renderPieLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
  fill,
}: any) => {
  if (percent * 100 < 3) return null;
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 18; // Valor original
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill={fill}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={percent * 100 < 7 ? 14 : 16}
      fontWeight={600}
    >
      {(percent * 100).toFixed(1)}%
    </text>
  );
};

export default function ReportsDashboard() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [groupBy, setGroupBy] = useState('day');
  const [forcedGroupBy, setForcedGroupBy] = useState<string | null>(null);
  const [data, setData] = useState<ServiceReportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rangeWarning, setRangeWarning] = useState<string | null>(null);
  const [initialFetchDone, setInitialFetchDone] = useState(false);

  // Ref para el elemento que se exportará como PDF
  const pdfElementRef = useRef<HTMLDivElement>(null);

  // Calcular días de diferencia
  function getDaysDiff() {
    if (!from || !to) return 0;
    return dayjs(to).diff(dayjs(from), 'day') + 1;
  }

  // Determinar agrupación dinámica
  function getDynamicGroupBy() {
    const days = getDaysDiff();
    if (days > 60) return 'month';
    if (days >= 10) return 'week';
    return 'day';
  }

  const dynamicGroupBy = getDynamicGroupBy();

  // Lógica de agrupación dinámica
  useEffect(() => {
    const days = getDaysDiff();
    if (days > 90) {
      setForcedGroupBy('month');
      setGroupBy('month');
      setRangeWarning('El rango es muy grande, agrupando por mes.');
    } else if (days > 30) {
      setForcedGroupBy(null);
      setRangeWarning(
        'Sugerencia: agrupa por semana para mejor visualización.',
      );
    } else {
      setForcedGroupBy(null);
      setRangeWarning(null);
    }
  }, [from, to]);

  // Al cargar, rango por defecto: Próxima semana
  useEffect(() => {
    if (!from && !to) {
      const [start, end] = quickRanges[0].get(); // Próxima semana
      setFrom(start.format('YYYY-MM-DD'));
      setTo(end.format('YYYY-MM-DD'));
    }
    // eslint-disable-next-line
  }, []);

  // Disparar fetch cada vez que cambian from, to o dynamicGroupBy
  useEffect(() => {
    // Validar fechas antes de hacer fetch
    if (
      !from ||
      !to ||
      !dayjs(from).isValid() ||
      !dayjs(to).isValid() ||
      dayjs(from).isAfter(dayjs(to))
    ) {
      setData(null);
      return;
    }
    setData(null); // Limpiar datos antes de fetch
    fetchReport();
    // eslint-disable-next-line
  }, [from, to, dynamicGroupBy]);

  async function fetchReport() {
    setLoading(true);
    setError(null);
    try {
      const json = await reportesApi.getServiceReport({
        from,
        to,
        groupBy: dynamicGroupBy,
      });
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  // Preparar datos para el gráfico
  const chartData: Record<string, any>[] = [];
  if (data && Array.isArray(data.services) && data.services.length > 0) {
    // Obtener todas las fechas únicas
    const allDates = Array.from(
      new Set(
        data.services.flatMap((s) =>
          Array.isArray(s.Data) ? s.Data.map((d) => d.Date) : [],
        ),
      ),
    ).sort();
    // Para cada fecha, armar un objeto con los counts por servicio
    for (const date of allDates) {
      const entry: Record<string, any> = { date };
      for (const service of data.services) {
        const found = Array.isArray(service.Data)
          ? service.Data.find((d) => d.Date === date)
          : undefined;
        entry[service.ServiceType] = found ? found.Count : 0;
      }
      chartData.push(entry);
    }
  }

  // Asignar un color de la paleta a cada servicio
  const serviceColors: Record<string, string> = {};
  if (data && Array.isArray(data.services)) {
    data.services.forEach((s, idx) => {
      serviceColors[s.ServiceType] = PALETTE[idx % PALETTE.length];
    });
  }

  return (
    <div className="space-y-6 font-montserrat" ref={pdfElementRef}>
      {/* Barra de filtros */}
      <div className="flex flex-col md:flex-row md:items-end gap-4 bg-zinc-50 rounded-lg p-4 shadow-sm border border-zinc-200 mb-2" data-pdf-hide>
        <div className="flex flex-wrap gap-2 items-center flex-1">
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
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-black focus:outline-none focus:border-blue-500 transition w-36 shadow-sm"
            />
          </div>
          <span className="mx-1 text-gray-400">-</span>
          <div className="flex items-center gap-1">
            <FaCalendarAlt color="#a3a3a3" size={20} />
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-black focus:outline-none focus:border-blue-500 transition w-36 shadow-sm"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <ExportButtons
            onExportCSV={() =>
              exportToCSV(
                chartData,
                data?.services.map((s) => s.ServiceType) || [],
                from,
                to,
                data?.totalReservations || 0,
              )
            }
            pdfElementRef={pdfElementRef}
            pdfOptions={{
              filename: `reporte_reservas_${from}_a_${to}.pdf`,
              title: 'Reporte de Reservas por Servicio',
              subtitle: 'ZenCat - Dashboard de Reportes',
              dateRange: `Período: ${formatDate(from)} - ${formatDate(to)}`,
            }}
            disabled={loading || !chartData.length}
            loading={loading}
          />
        </div>
      </div>
      {rangeWarning && (
        <div className="text-xs text-orange-600 font-semibold mb-2">
          {rangeWarning}
        </div>
      )}
      {!loading &&
        (!data ||
          !Array.isArray(data.services) ||
          !data.services ||
          data.services.length === 0) && (
          <div className="text-sm text-gray-500 font-semibold mb-2">
            No hay reservas para el rango seleccionado.
          </div>
        )}
      <div className="text-xs text-gray-600 font-semibold mb-2">
        Agrupando por:{' '}
        {dynamicGroupBy === 'day'
          ? 'Día'
          : dynamicGroupBy === 'week'
            ? 'Semana'
            : 'Mes'}
      </div>
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-black border-l-4 border-black p-4 rounded shadow flex flex-col items-center justify-center min-h-[100px]">
          <div className="text-lg font-semibold text-white">Total reservas</div>
          <div className="text-3xl font-bold text-white">
            {data ? data.totalReservations : '-'}
          </div>
        </div>
        {(Array.isArray(data?.services) ? data.services : []).map((s, idx) => {
          const porcentaje =
            data && data.totalReservations
              ? ((s.Total / data.totalReservations) * 100).toFixed(1)
              : '0';
          return (
            <div
              key={s.ServiceType}
              className="bg-white border-l-4 p-4 rounded shadow flex flex-col items-center justify-center min-h-[100px]"
              style={{ borderColor: serviceColors[s.ServiceType] }}
            >
              <div
                className="text-lg font-semibold"
                style={{ color: serviceColors[s.ServiceType] }}
              >
                {s.ServiceType}
              </div>
              <div className="text-2xl font-bold text-black">{s.Total}</div>
              <div className="text-xs text-gray-500 font-semibold mt-1">
                {porcentaje}% del total
              </div>
            </div>
          );
        })}
      </div>
      {/* Gráficos y títulos alineados */}
      <div className="bg-white rounded shadow p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-4">
          <h2 className="text-xl font-semibold text-black m-0">
            Reservas por servicio
          </h2>
          <span className="text-base font-semibold text-black">
            Distribución
          </span>
        </div>
        {loading && <div>Cargando...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {!loading && !error && chartData.length > 0 && (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1 min-w-0">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData} barGap={6} barCategoryGap={16}>
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    stroke="#111"
                  />
                  <YAxis allowDecimals={false} stroke="#111" />
                  <Tooltip content={<CustomTooltip />} />
                  {(Array.isArray(data?.services) ? data.services : []).map(
                    (s) => (
                      <Bar
                        key={s.ServiceType}
                        dataKey={s.ServiceType}
                        fill={serviceColors[s.ServiceType]}
                        radius={[6, 6, 0, 0]}
                        barSize={32}
                        isAnimationActive={true}
                      />
                    ),
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Pie chart de proporciones */}
            {data &&
              Array.isArray(data.services) &&
              data.services.length > 0 && (
                <div className="flex flex-col items-center min-w-[320px]">
                  <ResponsiveContainer width={320} height={320}>
                    <PieChart>
                      <Pie
                        data={data.services}
                        dataKey="Total"
                        nameKey="ServiceType"
                        cx="50%"
                        cy="50%"
                        innerRadius={90}
                        outerRadius={130}
                        paddingAngle={2}
                        label={renderPieLabel}
                        labelLine={false}
                        isAnimationActive={true}
                      >
                        {data.services.map((entry, idx) => (
                          <Cell
                            key={entry.ServiceType}
                            fill={serviceColors[entry.ServiceType]}
                          />
                        ))}
                      </Pie>
                      <PieTooltip
                        formatter={(value, name, props) => [
                          `${value} reservas`,
                          name,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
          </div>
        )}
        {!loading && !error && chartData.length === 0 && (
          <div className="text-gray-500 text-center py-8 font-semibold">
            No hay reservas para este rango. ¡Prueba otro filtro!
          </div>
        )}
      </div>
      {/* Resumen inteligente */}
      {data && Array.isArray(data.services) && data.services.length > 0 && (
        <div className="text-sm text-gray-700 font-semibold mt-2 text-center">
          {(() => {
            const max = data.services.reduce((a, b) =>
              a.Total > b.Total ? a : b,
            );
            const porcentaje = data.totalReservations
              ? ((max.Total / data.totalReservations) * 100).toFixed(1)
              : '0';
            return `El servicio más reservado es ${max.ServiceType} con ${max.Total} reservas (${porcentaje}%)`;
          })()}
        </div>
      )}
    </div>
  );
}
