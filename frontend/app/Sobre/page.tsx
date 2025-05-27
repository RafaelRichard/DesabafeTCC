'use client';
export default function Sobre() {
  return (
    <div className="bg-gradient-to-b from-indigo-50 to-white min-h-screen pt-24 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-700 text-center mb-12">
          Sobre o <span className="text-gray-900">Desabafe</span>
        </h1>

        <section className="bg-white p-8 md:p-10 rounded-2xl shadow-xl mb-10 transition-transform hover:-translate-y-1 hover:shadow-2xl duration-300">
          <h2 className="text-2xl font-semibold text-indigo-600 mb-4">A História do Desabafe</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            O Desabafe nasceu da necessidade de criar um espaço seguro e acolhedor para todos aqueles que buscam desabafar, compartilhar sentimentos e encontrar apoio emocional. A ideia surgiu quando um grupo de profissionais da saúde mental, em colaboração com especialistas em tecnologia, percebeu o potencial da internet para ajudar pessoas a lidarem com desafios emocionais como ansiedade, depressão e estresse.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            Em um mundo acelerado e, muitas vezes, impessoal, onde o estigma sobre saúde mental ainda é um obstáculo, o Desabafe visa ser um local sem julgamentos. A nossa missão é oferecer informações confiáveis, apoio psicológico e criar conexões entre as pessoas que passam por experiências semelhantes.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Com um crescimento rápido, especialmente entre os jovens, a plataforma se tornou um espaço importante para quem deseja falar sobre suas emoções sem medo de serem incompreendidos.
          </p>
        </section>

        <section className="bg-white p-8 md:p-10 rounded-2xl shadow-xl mb-10 transition-transform hover:-translate-y-1 hover:shadow-2xl duration-300">
          <h2 className="text-2xl font-semibold text-indigo-600 mb-6">Nossa Missão, Visão e Valores</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-medium text-indigo-500 mb-2">Missão</h3>
              <p className="text-gray-700 leading-relaxed">
                Oferecer um espaço de empatia, compreensão e acolhimento, onde todos possam se expressar livremente sobre seus sentimentos. Acreditamos que a saúde mental deve ser tratada com a mesma seriedade que qualquer outra condição de saúde.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-medium text-indigo-500 mb-2">Visão</h3>
              <p className="text-gray-700 leading-relaxed">
                Ser uma plataforma de referência global no apoio à saúde emocional, conectando pessoas que precisam de ajuda com profissionais e recursos que fazem a diferença.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-medium text-indigo-500 mb-2">Valores</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li><strong>Empatia e Compreensão:</strong> Ouvimos sem julgamentos.</li>
                <li><strong>Privacidade e Segurança:</strong> Tratamos todos os dados com total confidencialidade.</li>
                <li><strong>Inovação Contínua:</strong> Estamos sempre evoluindo.</li>
                <li><strong>Acessibilidade:</strong> Soluções inclusivas e ao alcance de todos.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-white p-8 md:p-10 rounded-2xl shadow-xl transition-transform hover:-translate-y-1 hover:shadow-2xl duration-300">
          <h2 className="text-2xl font-semibold text-indigo-600 mb-4">O Futuro do Desabafe</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Estamos apenas começando, mas já temos grandes planos para o futuro. A plataforma está em constante evolução, com o desenvolvimento de novas funcionalidades que vão tornar a experiência de nossos usuários ainda mais rica e acessível.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            Pretendemos expandir nossa rede de profissionais, integrar novas ferramentas de apoio emocional e criar uma comunidade ainda mais engajada. Em breve, teremos sessões de terapia online, fóruns temáticos e espaços para grupos de apoio.
          </p>
          <p className="text-gray-700 leading-relaxed">
            O Desabafe é mais do que uma plataforma – é um movimento. Acreditamos que, juntos, podemos superar barreiras e promover a saúde emocional com a seriedade que ela merece.
          </p>
        </section>
      </div>
    </div>
  );
}
