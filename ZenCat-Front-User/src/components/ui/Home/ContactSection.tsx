// src/components/ui/Home/ContactSection.tsx
import React, { useState, FormEvent } from 'react';
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaMapMarkerAlt,
  FaEnvelope,
  FaWhatsapp,
} from 'react-icons/fa';

export default function ContactSection() {
  // Estados para controlar el envío y mostrar mensaje inline
  const [estadoEnvio, setEstadoEnvio] = useState<
    'idle' | 'enviando' | 'exito' | 'error'
  >('idle');
  const [errorMensaje, setErrorMensaje] = useState('');

  // Handler del formulario que envía datos a Formspree vía fetch
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEstadoEnvio('enviando');
    setErrorMensaje('');

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch('https://formspree.io/f/xblydjkn', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: formData,
      });

      if (response.ok) {
        setEstadoEnvio('exito');
        form.reset(); // limpia los campos
        setTimeout(() => setEstadoEnvio('idle'), 5000);
      } else {
        const data = await response.json();
        const msg =
          data?.errors?.length > 0
            ? data.errors.map((err: any) => err.message).join(', ')
            : 'Error al enviar el formulario.';
        setErrorMensaje(msg);
        setEstadoEnvio('error');
      }
    } catch {
      setErrorMensaje('Ocurrió un error de red. Intenta nuevamente más tarde.');
      setEstadoEnvio('error');
    }
  };

  return (
    <section id="contacto" className="scroll-mt-24 bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Título */}
        <h2 className="flex items-center justify-center text-3xl font-bold text-gray-800 mb-4">
          <FaEnvelope className="text-gray-800 mr-2" size={28} />
          Contáctanos
        </h2>
        <p className="text-center text-gray-600 mb-6">
          ¿Tienes dudas sobre grupos, horarios o membresías? Llena el formulario
          y te responderemos pronto.
        </p>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Formulario / Mensaje de “Gracias” */}
          <div className="lg:w-2/3">
            <div className="bg-white shadow-lg rounded-lg p-6">
              {estadoEnvio === 'exito' ? (
                // Mensaje inline de éxito
                <div className="text-center py-8">
                  <p className="text-2xl font-semibold text-green-600">
                    ¡Gracias! Tu mensaje ha sido enviado con éxito.
                  </p>
                  <p className="mt-2 text-gray-600">
                    Nos pondremos en contacto contigo pronto.
                  </p>
                </div>
              ) : (
                // Formulario activo
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Nombre completo */}
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Nombre completo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      placeholder="Tu nombre completo"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2
                                 focus:outline-none focus:ring focus:ring-blue-300 focus:border-blue-600"
                    />
                  </div>

                  {/* Correo electrónico */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Correo electrónico <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      placeholder="ejemplo@correo.com"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2
                                 focus:outline-none focus:ring focus:ring-blue-300 focus:border-blue-600"
                    />
                  </div>

                  {/* Teléfono (opcional) */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Teléfono (opcional)
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder="+51 968085604"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2
                                 focus:outline-none focus:ring focus:ring-blue-300 focus:border-blue-600"
                    />
                  </div>

                  {/* Asunto */}
                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Asunto <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      required
                      placeholder="¿Sobre qué quieres escribirnos?"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2
                                 focus:outline-none focus:ring focus:ring-blue-300 focus:border-blue-600"
                    />
                  </div>

                  {/* Mensaje */}
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Mensaje <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      required
                      placeholder="Cuéntanos cómo podemos ayudarte con tu equipo o actividad..."
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2
                                 focus:outline-none focus:ring focus:ring-blue-300 focus:border-blue-600"
                    />
                  </div>

                  {/* Feedback de error */}
                  {estadoEnvio === 'error' && (
                    <p className="text-sm text-red-600">{errorMensaje}</p>
                  )}

                  {/* Botón */}
                  <div>
                    <button
                      type="submit"
                      disabled={estadoEnvio === 'enviando'}
                      className={`w-full md:w-auto px-6 py-3 text-white rounded-md transition 
                        ${
                          estadoEnvio === 'enviando'
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-black hover:bg-gray-800'
                        }`}
                    >
                      {estadoEnvio === 'enviando'
                        ? 'Enviando...'
                        : 'Enviar mensaje'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Información lateral */}
          <div className="lg:w-1/3">
            <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
              {/* Datos directos */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2 border-b-2 border-blue-800 inline-block">
                  Datos directos
                </h3>

                {/* WhatsApp para dos números */}
                <p className="text-gray-600 mt-2 flex items-center">
                  <strong className="mr-1">WhatsApp:</strong>
                  <FaWhatsapp className="text-green-600 mr-1" size={18} />
                  <a
                    href="https://wa.me/51968085604"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-700 mr-2"
                    aria-label="Chatear por WhatsApp al +51 968085604"
                  >
                    +51 968085604
                  </a>
                  <span className="text-gray-600 mr-2">/</span>
                  <a
                    href="https://wa.me/51983097563"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-700"
                    aria-label="Chatear por WhatsApp al +51 983097563"
                  >
                    +51 983097563
                  </a>
                </p>

                {/* Email */}
                <p className="text-gray-600 mt-1 flex items-center">
                  <strong className="mr-1">Email:</strong>
                  <a
                    href="mailto:informes@astrocats.com"
                    className="text-blue-800 hover:underline"
                  >
                    informes@astrocats.com
                  </a>
                </p>
              </div>

              {/* Nuestras sedes */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2 border-b-2 border-blue-800 inline-block">
                  Nuestras sedes
                </h3>
                <div className="space-y-4 mt-4">
                  {/* Sede 1 */}
                  <div>
                    <p className="text-gray-600 flex items-center">
                      <FaMapMarkerAlt className="text-blue-800 mr-1" />
                      <a
                        href="https://goo.gl/maps/primerEnlace"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline text-blue-800"
                      >
                        Av. Deportiva 123, Sector A, Lima, Perú
                      </a>
                    </p>
                    <p className="text-gray-600 mt-1">
                      <strong>Horario:</strong> Lun–Vie: 8:00 AM – 8:00 PM |
                      Sáb–Dom: 9:00 AM – 2:00 PM
                    </p>
                  </div>

                  {/* Sede 2 */}
                  <div>
                    <p className="text-gray-600 flex items-center">
                      <FaMapMarkerAlt className="text-blue-800 mr-1" />
                      <a
                        href="https://goo.gl/maps/segundoEnlace"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline text-blue-800"
                      >
                        Av. Central 456, Sector B, Lima, Perú
                      </a>
                    </p>
                    <p className="text-gray-600 mt-1">
                      <strong>Horario:</strong> Lun–Vie: 7:00 AM – 7:00 PM |
                      Sáb: 8:00 AM – 1:00 PM
                    </p>
                  </div>

                  {/* Sede 3 */}
                  <div>
                    <p className="text-gray-600 flex items-center">
                      <FaMapMarkerAlt className="text-blue-800 mr-1" />
                      <a
                        href="https://goo.gl/maps/tercerEnlace"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline text-blue-800"
                      >
                        Av. Sur 789, Sector C, Lima, Perú
                      </a>
                    </p>
                    <p className="text-gray-600 mt-1">
                      <strong>Horario:</strong> Lun–Vie: 9:00 AM – 9:00 PM |
                      Dom: 10:00 AM – 2:00 PM
                    </p>
                  </div>
                </div>
              </div>

              {/* Redes sociales */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2 border-b-2 border-blue-800 inline-block">
                  Síguenos
                </h3>
                <div className="flex space-x-4 mt-2">
                  <a
                    href="https://facebook.com/tuPagina"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-blue-800 transition"
                    aria-label="Facebook"
                  >
                    <FaFacebookF size={20} />
                  </a>
                  <a
                    href="https://instagram.com/tuPagina"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-blue-800 transition"
                    aria-label="Instagram"
                  >
                    <FaInstagram size={20} />
                  </a>
                  <a
                    href="https://www.linkedin.com/company/tuEmpresa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-blue-800 transition"
                    aria-label="LinkedIn"
                  >
                    <FaLinkedinIn size={20} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pie de sección */}
        <p className="text-sm text-gray-500 text-center mt-8">
          Tus datos estarán seguros. Consulta nuestra{' '}
          <a
            href="/politica-privacidad"
            className="text-blue-800 hover:underline"
          >
            Política de privacidad
          </a>
          .
        </p>
      </div>
    </section>
  );
}
