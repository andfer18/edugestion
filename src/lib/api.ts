const API_URL = `http://${window.location.hostname}:3000`;

export async function verificarCedula(cedula: string) {
    const response = await fetch(`${API_URL}/api/verificar-cedula`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cedula })
    });
    return response.json();
}

export async function login(cedula: string, password: string, rol: string) {
    const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cedula, password, rol })
    });
    return response.json();
}
