// pages/services.js
import { useEffect, useState } from 'react';

const Services = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        // Faça a requisição para a API do Django
        const response = await fetch('http://localhost:8000/api/services/');
        const data = await response.json();
        setServices(data);
      } catch (error) {
        console.error('Erro ao buscar serviços:', error);
      }
    };

    fetchServices();
  }, []);

  return (
    <div>
      <h1>Serviços</h1>
      <ul>
        {services.map((service) => (
          <li key={service.id}>
            <h2>{service.icon} {service.title}</h2>
            <p>{service.action}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Services;
