// src/utils/table-utils.ts (o la ruta que uses para @/utils/table-utils)

// Utility to map column keys to user-friendly labels
export const getColumnLabel = (columnKey: string): string => {
  const columnLabels: Record<string, string> = {
    // Reservation columns (added/updated for your table)
    id: 'ID',
    name: 'Servicio', // Modificado para tu tabla, si aplica
    user_name: 'Usuario',
    user_email: 'Email de Usuario',
    state: 'Estado',
    reservation_time: 'Fecha de Reserva', // Etiqueta genérica
    time_range: 'Horario', // Nuevo campo para horario
    place: 'Lugar', // Nuevo campo para lugar
    teacher: 'Profesor', // Nuevo campo para profesor
    last_modification: 'Última Modificación',
    
    // Default TanStack Table IDs (common for checkbox selection and actions dropdown)
    select: 'Seleccionar',
    actions: 'Acciones',

    // Sessions columns (de tu código original, si aún los usas en otras tablas)
    title: 'Título',
    date: 'Fecha',
    // time_range: 'Horario', // Si es un campo global, ya definido arriba
    // state: 'Estado', // Si es un campo global, ya definido arriba
    capacity_info: 'Capacidad',
    view_reservations: 'Ver reservas',

    // Professionals columns (de tu código original)
    // name: 'Nombres', // Si es un campo global, ya definido arriba
    lastNames: 'Apellidos',
    specialty: 'Especialidad',
    email: 'Correo electrónico',
    phone_number: 'Número de celular',
    type: 'Tipo',

    // Services columns (de tu código original)
    description: 'Descripción',
    is_virtual: 'Tipo',

    // Locals columns (de tu código original)
    local_name: 'Nombre del Local',
    address: 'Dirección',
    reference: 'Referencia',
    district: 'Distrito',
    province: 'Provincia',
    region: 'Región',
    capacity: 'Capacidad',
    street_name: 'Calle',
    building_number: 'Número',

    // Users columns (de tu código original)
    first_name: 'Nombres',
    last_name: 'Apellidos',
    username: 'Usuario',
    role: 'Rol',
    status: 'Estado',

    // Audit columns (de tu código original)
    user: 'Usuario',
    action: 'Acción',
    entityType: 'Entidad',
    success: 'Estado',
    ipAddress: 'Dirección IP',
    createdAt: 'Fecha y Hora',

    // Common columns (de tu código original, si no están ya en Reservation columns)
    // created_at: 'Fecha de creación', // Si ya es handled por reservation_time o last_modification
    // updated_at: 'Fecha de actualización', // Si ya es handled por last_modification
  };

  return columnLabels[columnKey] || columnKey;
};

// Get all available sortable columns for a specific table
// Esta función define qué columnas son ordenables para cada tipo de tabla.
// Aunque en tu ReservationsTable actual las columnas se definen directamente,
// esta utilidad es útil si tienes un sistema más genérico para configurar columnas.
export const getSortableColumns = (
  tableType: 'sessions' | 'professionals' | 'services' | 'locals' | 'users' | 'reservations' | 'audit',
): Array<{ key: string; label: string }> => {
  const sessionsColumns = [
    { key: 'title', label: getColumnLabel('title') },
    { key: 'date', label: getColumnLabel('date') },
    { key: 'time_range', label: getColumnLabel('time_range') },
    { key: 'state', label: getColumnLabel('state') },
    { key: 'capacity_info', label: getColumnLabel('capacity_info') },
  ];

  const professionalsColumns = [
    { key: 'name', label: getColumnLabel('name') },
    { key: 'lastNames', label: getColumnLabel('lastNames') },
    { key: 'specialty', label: getColumnLabel('specialty') },
    { key: 'email', label: getColumnLabel('email') },
    { key: 'phone_number', label: getColumnLabel('phone_number') },
    { key: 'type', label: getColumnLabel('type') },
  ];

  const servicesColumns = [
    { key: 'name', label: getColumnLabel('name') },
    { key: 'description', label: getColumnLabel('description') },
    { key: 'is_virtual', label: getColumnLabel('is_virtual') },
  ];

  const localsColumns = [
    { key: 'local_name', label: getColumnLabel('local_name') },
    { key: 'address', label: getColumnLabel('address') },
    { key: 'district', label: getColumnLabel('district') },
    { key: 'province', label: getColumnLabel('province') },
    { key: 'region', label: getColumnLabel('region') },
    { key: 'capacity', label: getColumnLabel('capacity') },
  ];

  const usersColumns = [
    { key: 'first_name', label: getColumnLabel('first_name') },
    { key: 'last_name', label: getColumnLabel('last_name') },
    { key: 'username', label: getColumnLabel('username') },
    { key: 'email', label: getColumnLabel('email') },
    { key: 'role', label: getColumnLabel('role') },
    { key: 'status', label: getColumnLabel('status') },
  ];

  const auditColumns = [
    { key: 'user', label: getColumnLabel('user') },
    { key: 'action', label: getColumnLabel('action') },
    { key: 'entityType', label: getColumnLabel('entityType') },
    { key: 'success', label: getColumnLabel('success') },
    { key: 'ipAddress', label: getColumnLabel('ipAddress') },
    { key: 'createdAt', label: getColumnLabel('createdAt') },
  ];

  // Columnas específicas para la tabla de reservaciones, si quieres que sean ordenables.
  // Es importante que los `key` coincidan con los `accessorKey` en tus ColumnDef.
  const reservationsColumns = [
    { key: 'name', label: getColumnLabel('name') },
    { key: 'reservation_time', label: getColumnLabel('reservation_time') },
    { key: 'state', label: getColumnLabel('state') },
    { key: 'last_modification', label: getColumnLabel('last_modification') },
    // 'time_range', 'place', 'teacher' no suelen ser ordenables directamente como strings simples
    // Si quieres ordenarlos, necesitarías una lógica de ordenación personalizada o si los datos son simples strings.
  ];


  switch (tableType) {
    case 'sessions':
      return sessionsColumns;
    case 'professionals':
      return professionalsColumns;
    case 'services':
      return servicesColumns;
    case 'locals':
      return localsColumns;
    case 'users':
      return usersColumns;
    case 'audit':
      return auditColumns;
    case 'reservations':
      return reservationsColumns;
    default:
      return [];
  }
};