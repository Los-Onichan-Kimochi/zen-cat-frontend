// Utility to map column keys to user-friendly labels
export const getColumnLabel = (columnKey: string): string => {
  const columnLabels: Record<string, string> = {
    // Sessions columns
    title: 'Título',
    date: 'Fecha',
    time_range: 'Horario',
    state: 'Estado',
    capacity_info: 'Capacidad',
    view_reservations: 'Ver reservas',

    // Professionals columns
    name: 'Nombres',
    lastNames: 'Apellidos',
    specialty: 'Especialidad',
    email: 'Correo electrónico',
    phone_number: 'Número de celular',
    type: 'Tipo',

    // Services columns
    description: 'Descripción',
    is_virtual: 'Tipo',

    // Locals columns
    local_name: 'Nombre del Local',
    address: 'Dirección',
    reference: 'Referencia',
    district: 'Distrito',
    province: 'Provincia',
    region: 'Región',
    capacity: 'Capacidad',
    street_name: 'Calle',
    building_number: 'Número',

    // Users columns (if exists)
    first_name: 'Nombres',
    last_name: 'Apellidos',
    username: 'Usuario',
    role: 'Rol',
    status: 'Estado',

    // Common columns
    select: 'Seleccionar',
    actions: 'Acciones',
    created_at: 'Fecha de creación',
    updated_at: 'Fecha de actualización',
  };

  return columnLabels[columnKey] || columnKey;
};

// Get all available sortable columns for a specific table
export const getSortableColumns = (
  tableType: 'sessions' | 'professionals' | 'services' | 'locals' | 'users',
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
    default:
      return [];
  }
};
