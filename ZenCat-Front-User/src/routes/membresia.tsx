import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/membresia')({
  component: MembresiaComponent,
});

function MembresiaComponent() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Únete a Nuestras Comunidades
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Encuentra tu comunidad perfecta y comienza a disfrutar de
              experiencias increíbles con personas que comparten tus mismos
              intereses.
            </p>
          </div>

          {/* Comunidades disponibles */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Comunidad Runners */}
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <div className="text-white text-center">
                  <h3 className="text-2xl font-bold mb-2">🏃‍♂️</h3>
                  <h3 className="text-xl font-semibold">Runners</h3>
                </div>
              </div>
              <CardContent className="p-6">
                <p className="text-gray-600 mb-4">
                  Únete a nuestra comunidad de corredores. Participa en
                  entrenamientos grupales, carreras y eventos especiales.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Desde S/ 959.90/mes
                  </span>
                  <Link to="/onboarding/membresia">
                    <Button className="bg-black text-white hover:bg-gray-800">
                      Únete ahora
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Comunidad Yoga */}
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
                <div className="text-white text-center">
                  <h3 className="text-2xl font-bold mb-2">🧘‍♀️</h3>
                  <h3 className="text-xl font-semibold">Yoga & Mindfulness</h3>
                </div>
              </div>
              <CardContent className="p-6">
                <p className="text-gray-600 mb-4">
                  Encuentra tu equilibrio interior con nuestras clases de yoga y
                  meditación para todos los niveles.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Próximamente</span>
                  <Button
                    disabled
                    className="bg-gray-300 text-gray-500 cursor-not-allowed"
                  >
                    Próximamente
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Comunidad Fitness */}
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                <div className="text-white text-center">
                  <h3 className="text-2xl font-bold mb-2">💪</h3>
                  <h3 className="text-xl font-semibold">Fitness & Gym</h3>
                </div>
              </div>
              <CardContent className="p-6">
                <p className="text-gray-600 mb-4">
                  Alcanza tus metas fitness con entrenamientos personalizados y
                  acceso a gimnasios premium.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Próximamente</span>
                  <Button
                    disabled
                    className="bg-gray-300 text-gray-500 cursor-not-allowed"
                  >
                    Próximamente
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Beneficios generales */}
          <div className="bg-white rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-center mb-8">
              ¿Por qué elegir nuestras membresías?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="font-semibold mb-2">Flexibilidad total</h3>
                <p className="text-gray-600 text-sm">
                  Reserva actividades cuando quieras, cancela sin penalizaciones
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👥</span>
                </div>
                <h3 className="font-semibold mb-2">Comunidad activa</h3>
                <p className="text-gray-600 text-sm">
                  Conecta con personas que comparten tus mismos intereses
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⭐</span>
                </div>
                <h3 className="font-semibold mb-2">Experiencias premium</h3>
                <p className="text-gray-600 text-sm">
                  Acceso a eventos exclusivos y actividades especiales
                </p>
              </div>
            </div>
          </div>

          {/* Call to action */}
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">¿Listo para comenzar?</h2>
            <p className="text-gray-600 mb-6">
              Únete a miles de personas que ya disfrutan de nuestras comunidades
            </p>
            <Link to="/onboarding/membresia">
              <Button
                size="lg"
                className="bg-black text-white hover:bg-gray-800 px-8 py-3"
              >
                Explorar membresías
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
