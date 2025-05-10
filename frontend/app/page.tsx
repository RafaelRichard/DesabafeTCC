import Image from "next/image";
import { Button } from "./components/Button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Seção Principal + Especialidades */}
      <section className="py-28 bg-gradient-to-b from-purple-50 to-purple-100">
        <div className="container max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            {/* Coluna de texto + especialidades */}
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-6 leading-tight">
                Apoio Emocional de Qualidade, Onde e Quando Você Precisar
              </h1>
              <p className="text-lg text-gray-600 mb-10 font-serif max-w-xl">
                Conectamos você com profissionais experientes em saúde mental, prontos para oferecer
                atendimento humanizado e sigiloso — tudo no conforto da sua casa. Agende consultas
                com psiquiatras e psicólogos qualificados, com horários flexíveis e acompanhamento personalizado.
              </p>

              {/* Cards das Especialidades com mais destaque */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 max-w-md">
                {[
                  { title: 'PSIQUIATRIA', icon: '🧠', link: '/psiquiatria' },
                  { title: 'PSICOLOGIA', icon: '🗣️', link: '/psicologia' },
                ].map((service, index) => (
                  <a
                    key={index}
                    href={service.link}
                    className="group bg-white border border-purple-200 rounded-2xl shadow-md p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
                  >
                    <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">{service.icon}</div>
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-purple-700">
                      {service.title}
                    </h3>
                  </a>
                ))}
              </div>

              <Button className="mt-2 animate-pulse hover:animate-none transition duration-300">
                Comece Agora
              </Button>
            </div>

            {/* Coluna de imagem */}
            <div className="flex justify-center">
              <Image
                src="/img/TesteLogo.png"
                alt="Atendimento Online"
                width={520}
                height={320}
                className="rounded-xl shadow-2xl transition-transform duration-300 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Benefícios / Confiança */}
      <section className="bg-gradient-to-b from-white to-purple-50 py-24">
        <div className="container max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4">
            Por que escolher nossa plataforma?
          </h2>
          <p className="text-gray-600 text-base md:text-lg mb-16 max-w-2xl mx-auto">
            Comprometidos com seu bem-estar, oferecemos atendimento seguro, acessível e com profissionais altamente qualificados.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            {[
              {
                icon: '🔒',
                title: 'Sigilo Garantido',
                desc: 'Privacidade total e proteção de dados em todas as suas consultas.',
              },
              {
                icon: '👩‍⚕️',
                title: 'Profissionais Certificados',
                desc: 'Trabalhamos apenas com especialistas registrados e experientes.',
              },
              {
                icon: '📅',
                title: 'Agendamento Flexível',
                desc: 'Você escolhe o melhor horário — sem complicações e com poucos cliques.',
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border-t-4 border-purple-300"
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
