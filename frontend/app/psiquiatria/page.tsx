export default function Psiquiatria() {
  return (
    <div className="pt-20 bg-gray-50 min-h-screen flex justify-center">
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-4xl font-extrabold text-center text-indigo-600 mb-12">Psiquiatria Online</h1>

        <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
          <h2 className="text-2xl font-semibold text-center text-gray-700">Encontre seu Psiquiatra</h2>
          <p className="text-gray-600 text-center mb-6">
            Consulte com os melhores psiquiatras do Brasil de forma online e segura.
          </p>

          {/* Lista de médicos */}
          <div className="space-y-6">
            {/* Médico 1 */}
            <div className="bg-gray-100 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex items-center space-x-6">
              <img 
                src="/img/logo.png"
                alt="Dr. João Silva" 
                className="w-20 h-20 rounded-full object-cover"
              />
              <div>
                <h3 className="text-xl font-semibold text-indigo-600 mb-2">Dr. João Silva</h3>
                <p className="text-gray-600 mb-2">Especialista em transtornos de ansiedade, depressão e TDAH.</p>
                <p className="text-gray-500 text-sm">CRM: 123456-SP</p>
                <button className="bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 transition duration-300 mt-4">
                  Agendar Consulta
                </button>
              </div>
            </div>

            {/* Médico 2 */}
            <div className="bg-gray-100 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex items-center space-x-6">
              <img 
                src="/img/cerebro.jpg"
                alt="Dra. Ana Souza" 
                className="w-20 h-20 rounded-full object-cover"
              />
              <div>
                <h3 className="text-xl font-semibold text-indigo-600 mb-2">Dra. Ana Souza</h3>
                <p className="text-gray-600 mb-2">Especialista em psicoterapia e acompanhamento psicológico.</p>
                <p className="text-gray-500 text-sm">CRM: 654321-RJ</p>
                <button className="bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 transition duration-300 mt-4">
                  Agendar Consulta
                </button>
              </div>
            </div>

            {/* Médico 3 */}
            <div className="bg-gray-100 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex items-center space-x-6">
              <img 
                src="/img/ligacoes.jpg"
                alt="Dr. Carlos Pereira" 
                className="w-20 h-20 rounded-full object-cover"
              />
              <div>
                <h3 className="text-xl font-semibold text-indigo-600 mb-2">Dr. Carlos Pereira</h3>
                <p className="text-gray-600 mb-2">Especialista em psicopatologias e distúrbios do sono.</p>
                <p className="text-gray-500 text-sm">CRM: 789456-MG</p>
                <button className="bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 transition duration-300 mt-4">
                  Agendar Consulta
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
