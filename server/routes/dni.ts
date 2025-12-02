import { RequestHandler } from "express";

export const searchDNI: RequestHandler = async (req, res) => {
  const { numero } = req.query;

  if (!numero || typeof numero !== "string") {
    res.status(400).json({ message: "Número de DNI requerido" });
    return;
  }

  if (numero.length !== 8 || !/^\d+$/.test(numero)) {
    res.status(400).json({ message: "DNI debe tener 8 dígitos" });
    return;
  }

  try {
    const response = await fetch(
      `https://api.apis.net.pe/v1/dni?numero=${numero}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer apis-token-3781",
        },
      }
    );

    if (!response.ok) {
      res.status(response.status).json({ message: "DNI no encontrado" });
      return;
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error searching DNI:", error);
    res.status(500).json({ message: "Error al consultar DNI" });
  }
};