import Image from "next/image";
import { Button } from "./components/Button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Seção principal */}
      <section className="pt-24 pb-12 bg-gradient-to-b from-purple-50 to-purple-100">
        <div className="container mx-auto px-6 sm:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0 text-center md:text-left">
              <h1 className="  justify-center items-center text-4xl md:text-5xl font-extrabold font-sans text-gray-800 mb-6 leading-tight">
                Encontre Apoio Emocional Online
              </h1>
              <p className="text-xl font-serif text-gray-600 mb-8">
                Conectamos você aos melhores profissionais de saúde mental do Brasil
              </p>
              <Button size="lg" className="flex justify-center items-center animate-pulse transition-transform duration-150 transform hover:scale-50 mx-auto mt-4">
                Comece Agora
              </Button>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <Image
                src="/img/TesteLogo.png"
                alt="Atendimento Online"
                width={500}
                height={250}
                className="rounded-lg shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-xl ease-in-out"
              />
            </div>

          </div>
        </div>
      </section>
      {/* Seção de Serviços */}
      <section className="py-16 bg-white flex justify-center">
        <div className="container mx-auto px-6 sm:px-8 text-center">
          <h2 className="text-3xl font-extrabold mb-12 text-gray-800">
            Nossos Serviços
          </h2>

          <div className="flex flex-wrap justify-center gap-6">
            {[
              { title: 'PSIQUIATRIA', action: 'AGENDE AGORA', icon: '🧠', link: '/psiquiatria' },
              { title: 'PSICOLOGIA', action: 'AGENDE AGORA', icon: '🗣️', link: '/psicologia' },
            ].map((service, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 w-80"
              >
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="font-semibold text-gray-800 mb-2">{service.title}</h3>
                <a
                  href={service.link}
                  className="text-sm text-purple-600 cursor-pointer hover:text-purple-700 font-medium"
                >
                  {service.action}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
