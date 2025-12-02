import { RequestHandler } from "express";

interface DNIApiResponse {
  nombre: string;
  tipoDocumento: string;
  numeroDocumento: string;
  estado: string;
  condicion: string;
  direccion: string;
  ubigeo: string;
  viaTipo: string;
  viaNombre: string;
  zonaCodigo: string;
  zonaTipo: string;
  numero: string;
  interior: string;
  lote: string;
  dpto: string;
  manzana: string;
  kilometro: string;
  distrito: string;
  provincia: string;
  departamento: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombres: string;
}

export const searchDNI: RequestHandler = async (req, res) => {
  const { dni } = req.params;

  if (!dni || typeof dni !== "string") {
    res.status(400).json({ message: "Número de DNI requerido" });
    return;
  }

  if (dni.length !== 8 || !/^\d+$/.test(dni)) {
    res.status(400).json({ message: "DNI debe tener 8 dígitos" });
    return;
  }

  try {
    const response = await fetch(
      `https://api.apis.net.pe/v1/dni?numero=${dni}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${process.env.DNI_API_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      res.status(response.status).json({ message: "DNI no encontrado" });
      return;
    }

    const raw: DNIApiResponse = await response.json();
    
    // Formatear respuesta con estructura completa
    const formattedResponse = {
      fullName: raw.nombre,
      dni: raw.numeroDocumento,
      firstName: raw.nombres,
      lastName: `${raw.apellidoPaterno} ${raw.apellidoMaterno}`.trim(),
      apellidoPaterno: raw.apellidoPaterno,
      apellidoMaterno: raw.apellidoMaterno,
      nombres: raw.nombres,
      tipoDocumento: raw.tipoDocumento,
      raw,
    };

    res.json(formattedResponse);
  } catch (error) {
    console.error("Error searching DNI:", error);
    res.status(500).json({ message: "Error al consultar DNI" });
  }
};