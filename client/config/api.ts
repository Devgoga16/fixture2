/**
 * Centralized API Configuration
 * Change the API_BASE_URL here to point to your backend
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || "https://fixture-api-6ds7q1-0d111f-31-97-133-67.traefik.me/api";

/**
 * Helper function to make API calls
 */
export async function apiCall<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    alert('A. apiCall iniciado\nEndpoint: ' + endpoint + '\nURL: ' + url + '\nMethod: ' + (options?.method || 'GET'));
    
    // Crear un AbortController para timeout
    const controller = new AbortController();
    
    // Contador de segundos
    let secondsElapsed = 0;
    const countInterval = setInterval(() => {
      secondsElapsed += 5;
      if (secondsElapsed <= 20) {
        alert(`Esperando respuesta... ${secondsElapsed} segundos transcurridos`);
      }
    }, 5000); // Cada 5 segundos

    const timeoutId = setTimeout(() => {
      clearInterval(countInterval);
      alert('TIMEOUT: La petición superó 20 segundos. Puede ser problema de red o el servidor tarda mucho.');
      controller.abort();
    }, 20000); // 20 segundos timeout

    try {
      alert('A2. Ejecutando fetch con modo CORS...\nURL destino: ' + url.substring(0, 50) + '...');
      
      const fetchPromise = fetch(url, {
        mode: 'cors',
        credentials: 'omit',
        cache: 'no-cache',
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          ...options?.headers,
        },
        ...options,
        signal: controller.signal,
      });

      alert('A3. Fetch iniciado, esperando respuesta...');
      const response = await fetchPromise;
      clearInterval(countInterval);
      alert('A4. Respuesta recibida!');

      clearTimeout(timeoutId);
      alert('B. fetch completado. Status: ' + response.status);

      if (!response.ok) {
        alert('C. Response no OK, status: ' + response.status);
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || error.message || `API Error: ${response.status}`);
      }

      alert('D. Parseando respuesta JSON...');
      const data = await response.json();
      alert('E. JSON parseado exitosamente');
      return data;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        throw new Error('Timeout: El servidor tardó más de 20 segundos en responder');
      }
      throw fetchError;
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    alert('F. ERROR en apiCall: ' + errorMsg);
    throw error;
  }
}
