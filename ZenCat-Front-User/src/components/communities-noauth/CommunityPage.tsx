import { useParams, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { communitiesApi } from '@/api/communities/communities';
import { communityServicesApi } from '@/api/communities/community-services';
import { servicesApi } from '@/api/services/services';
import { CommunityService } from '@/types/community-service';
import { Community } from '@/types/community';
import { Service } from '@/types/service';

export default function CommunityPage() {
  const { communityId } = useParams({ from: '/comunidades/$communityId' });

  const [community, setCommunity] = useState<Community | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const handleInscribirme = () => {
    navigate({
      to: '/onboarding/membresia',
      search: { communityId: communityId },
    });
  };

  useEffect(() => {
    const fetchCommunityAndServices = async () => {
      try {
        // Obtener datos de la comunidad
        const fetchedCommunity =
          await communitiesApi.getCommunityById(communityId);
        setCommunity(fetchedCommunity);

        // Obtener los community-services
        const communityServices: CommunityService[] =
          await communityServicesApi.getCommunityServicesByCommunityId(
            communityId,
          );

        // Obtener los services completos en paralelo
        const servicePromises = communityServices.map((cs) =>
          servicesApi.getServiceById(cs.service_id),
        );
        const services = await Promise.all(servicePromises);
        setServices(services);
      } catch (err) {
        console.error('Error cargando comunidad o servicios', err);
        setCommunity(null);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunityAndServices();
  }, [communityId]);

  if (loading)
    return <p className="text-center mt-10">Cargando comunidad...</p>;
  if (!community)
    return (
      <p className="text-center mt-10 text-red-500">Comunidad no encontrada</p>
    );

  return (
<div className="min-h-screen pt-6 pb-12 px-4">
  <div className="ml-4 mb-4">
    <Button
      onClick={handleGoBack}
      className="text-gray-600 bg-white border border-gray-400 hover:bg-black hover:text-white"
    >
      &lt; Retroceder
    </Button>
  </div>

      <section className="text-center mb-8">
        <h2 className="uppercase text-sm font-medium text-gray-500">
          Comunidad
        </h2>
        <h1 className="text-4xl font-bold mb-3">{community.name}</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">{community.purpose}</p>

        <div className="mt-6">
          <Button onClick={handleInscribirme}>Inscribirme</Button>
        </div>
      </section>

      <div className="w-full h-[300px] bg-gray-200 rounded-xl overflow-hidden mb-12">
        <img
          src={community.image_url}
          alt={`Imagen de ${community.name}`}
          className="w-full h-full object-cover"
        />
      </div>

      <section>
        <h2 className="text-2xl font-bold text-center mb-6">
          Actividades y servicios disponibles
        </h2>

        {services.length === 0 ? (
          <p className="text-center text-gray-500">
            Esta comunidad aún no tiene servicios disponibles.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white border rounded-lg overflow-hidden shadow hover:shadow-md transition"
              >
                <div className="h-40 bg-gray-200">
                  <img
                    src={service.image_url || '/images/default.jpg'}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-1">{service.name}</h3>
                  <p className="text-sm text-gray-600">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Para acceder debes activar una membresía
        </p>
      </section>
    </div>
  );
}
