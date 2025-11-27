function showPage(page) {
  document
    .querySelectorAll(".page-section")
    .forEach((sec) => sec.classList.add("d-none"));
  const target = document.getElementById(page);
  if (target) target.classList.remove("d-none");

  document.querySelectorAll(".nav-link").forEach((link) => {
    const onclick = link.getAttribute("onclick") || "";
    if (
      onclick.includes("'" + page + "'") ||
      onclick.includes('"' + page + '"')
    ) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}



// --- TU CÓDIGO DE LÓGICA (SISTEMA EXPERTO) ---
function diagnosticar() {
  const checks = Array.from(document.querySelectorAll(".symptom"));
  const seleccionados = checks.filter((ch) => ch.checked).map((ch) => ch.value);
  const salidaElem = document.getElementById("diagnostico-res");

  if (seleccionados.length === 0) {
      Swal.fire({
          icon: "warning",
          title: "Falta información",
          text: "Selecciona al menos un síntoma para diagnosticar.",
          timer: 3000,
          showConfirmButton: false,
      });
      return;
  }

  // Base de Conocimientos (Reglas)
  const reglas = {
      no_enciende: "Revisar fuente de poder y cables de alimentación.",
      ventilador_no_gira: "Posible falla en tarjeta madre o conector de 12V del ventilador.",
      so_no_carga: "Verificar integridad del disco duro y sector de arranque (MBR/GPT).",
      reinicia: "Revisar temperatura del CPU y visor de eventos de energía (Kernel-Power).",
      temp_alta: "Limpiar disipador, verificar flujo de aire y cambiar pasta térmica.",
      sin_senal: "Revisar conexión de video (HDMI/DP) y asentar tarjeta gráfica.",
      tarjeta_video_floja: "Ajustar tarjeta de video en slot PCIe y verificar alimentación auxiliar.",
      disco_ruido: "CRÍTICO: Posible falla mecánica. Realizar respaldo inmediato y reemplazar disco.",
      no_red: "Verificar cable Ethernet, switch y configuración de adaptador.",
      ip_correcta: "IP válida detectada. Si no hay internet, el problema está en la puerta de enlace (Router) o DNS.",
  };

  // Reglas Derivadas (Inferencia de segundo nivel)
  const derivadas = {
      reinicia: "Si la temperatura también es alta → El reinicio es por protección térmica (Thermal Throttling).",
      temp_alta: "Post-mantenimiento: Verificar curvas de ventilación en BIOS.",
      no_red: "Si la IP es correcta pero no navega → Verificar reglas de Firewall o bloqueo de MAC en Router.",
      ip_correcta: "Si IP es correcta y hay 'no_red' → Fallo lógico en Router o ISP.",
  };

  const categorias = {
      energia: ["no_enciende", "ventilador_no_gira"],
      arranque: ["so_no_carga", "disco_ruido"],
      temperatura: ["reinicia", "temp_alta"],
      video: ["sin_senal", "tarjeta_video_floja"],
      red: ["no_red", "ip_correcta"],
  };

  const resultadosPorCategoria = {
      energia: [],
      arranque: [],
      temperatura: [],
      video: [],
      red: [],
  };

  // Motor de Inferencia
  seleccionados.forEach((h) => {
      if (reglas[h]) {
          for (const cat in categorias) {
              if (categorias[cat].includes(h)) {
                  resultadosPorCategoria[cat].push({ hecho: h, accion: reglas[h] });
                  if (derivadas[h]) {
                      resultadosPorCategoria[cat].push({
                          hecho: `${h}_der`,
                          accion: `↳ NOTA: ${derivadas[h]}`,
                      });
                  }
              }
          }
      }
  });

  let salida = [];

  const hechosTotales = Object.keys(reglas).length;
  if (seleccionados.length === hechosTotales) {
      salida.push("⚠️ SE DETECTARON FALLAS SISTÉMICAS MÚLTIPLES ⚠️\n");
      Swal.fire({
          icon: "error",
          title: "Sistema Crítico",
          text: "Se han marcado todos los síntomas. El equipo requiere revisión mayor.",
      });
  }

  const ordenCategorias = ["energia", "arranque", "temperatura", "video", "red"];
  
  ordenCategorias.forEach((cat) => {
      const items = resultadosPorCategoria[cat];
      if (items.length > 0) {
          const titulo = {
              energia: " Problemas de Energía / Hardware",
              arranque: "Problemas de Arranque / Almacenamiento",
              temperatura: "Problemas Térmicos",
              video: "Problemas de Video / GPU",
              red: "Problemas de Red / Conectividad",
          }[cat];

          salida.push(titulo);
          salida.push("------------------------------------------------");
          const mostrados = new Set();
          items.forEach((it) => {
              if (!mostrados.has(it.accion)) {
                  salida.push(`• ${it.accion}`);
                  mostrados.add(it.accion);
              }
          });
          salida.push(""); // Espacio
      }
  });

  // Reglas de conflicto / Independientes
  const independientes = [];
  if (seleccionados.includes("no_enciende") && seleccionados.includes("no_red")) {
      independientes.push("• Paradoja: Si no enciende, la falla de red es irrelevante por ahora.");
  }
  if (seleccionados.includes("disco_ruido") && seleccionados.includes("no_enciende")) {
      independientes.push("• Prioridad: Revisar encendido primero. El ruido de disco puede ser secundario.");
  }
  
  if (independientes.length > 0) {
      salida.push("💡 OBSERVACIONES LÓGICAS:");
      salida.push(independientes.join("\n"));
      Swal.fire({
          icon: "info",
          title: "Observación Lógica",
          text: "Existen contradicciones o dependencias en los síntomas seleccionados.",
          timer: 4000
      });
  }

  if (salida.length === 0) {
      salida.push("No se encontraron reglas aplicables a los síntomas seleccionados.");
  }

  salidaElem.textContent = salida.join("\n");
}

function resetExpert() {
  document.querySelectorAll(".symptom").forEach((ch) => (ch.checked = false));
  const salidaElem = document.getElementById("diagnostico-res");
  if (salidaElem) salidaElem.textContent = "Esperando datos...";
  Swal.fire({
      icon: "success",
      title: "Diagnóstico Reiniciado",
      text: "El sistema está listo para una nueva evaluación.",
      timer: 1500,
      showConfirmButton: false,
  });
}

function simularConflicto() {
  const res = document.getElementById("resultado-conflictos");
  if (!res) return console.warn("Elemento conflicto-res no encontrado");

  // 1. Hacemos visible el contenedor y limpiamos
  res.classList.remove("d-none");
  res.innerHTML = ""; // Limpiar contenido previo

  // 2. Definir Prioridades y Colores para el diseño
  const getBadgeColor = (prio) => {
    if (prio === 3) return "bg-danger"; // Alta
    if (prio === 2) return "bg-warning text-dark"; // Media
    return "bg-info text-dark"; // Baja
  };

  // 3. ESTRUCTURA INICIAL (Escenario y Hechos)
  // Usamos HTML real en lugar de solo texto
  let htmlInicial = `
      <div class="mb-4">
          <h5 class="fw-bold text-primary"><i class="bi bi-router"></i> Escenario: Configuración Router Doméstico</h5>
          <div class="card bg-light border-0 p-3 mt-2">
              <h6 class="fw-bold text-secondary">Hechos detectados por los sensores:</h6>
              <ul class="list-group list-group-flush bg-transparent">
                  <li class="list-group-item bg-transparent py-1"><i class="bi bi-check-circle-fill text-success"></i> Contraseña de fábrica: <strong>DETECTADA</strong></li>
                  <li class="list-group-item bg-transparent py-1"><i class="bi bi-check-circle-fill text-success"></i> Acceso al panel: <strong>REALIZADO</strong></li>
                  <li class="list-group-item bg-transparent py-1"><i class="bi bi-check-circle-fill text-success"></i> Conectividad LAN: <strong>ACTIVA</strong></li>
                  <li class="list-group-item bg-transparent py-1"><i class="bi bi-x-circle-fill text-danger"></i> DHCP: <strong>DESHABILITADO</strong></li>
                  <li class="list-group-item bg-transparent py-1"><i class="bi bi-exclamation-triangle-fill text-warning"></i> Firmware: <strong>DESACTUALIZADO</strong></li>
              </ul>
          </div>
          <hr>
          <h6 class="mt-3 fw-bold"><i class="bi bi-cpu"></i> Motor de Inferencia (Log de Ejecución):</h6>
          <div id="log-container" class="border rounded p-3 bg-white" style="max-height: 300px; overflow-y: auto;">
             <p class="text-muted fst-italic small">Iniciando evaluación de reglas...</p>
          </div>
      </div>
  `;
  
  res.innerHTML = htmlInicial;
  const logContainer = document.getElementById("log-container");

  // --- DATOS DE REGLAS ---
  const reglas = [
    {
      id: 1, prioridad: 3,
      descripcion: "Router con pass default → Cambiar contraseña",
      accion: "Cambiar contraseña por una segura"
    },
    {
      id: 2, prioridad: 2,
      descripcion: "Acceso al panel detectado → Configurar IP",
      accion: "Configurar IP LAN en el panel"
    },
    {
      id: 3, prioridad: 1,
      descripcion: "Hay conectividad LAN → Checar firmware",
      accion: "Verificar y actualizar firmware"
    },
    {
      id: 4, prioridad: 2,
      descripcion: "DHCP apagado → Habilitar DHCP",
      accion: "Habilitar DHCP"
    },
    // Nota: Agregué la regla 4 que estaba en tu lógica pero no en tu visualización anterior
  ];

  // Hechos simulados (para activar reglas)
  const hechos = { contrasenaDefault: true, accesoPanel: true, conectividadLAN: true, dhcpOff: true, firmwareViejo: true };
  
  // Filtrar reglas activas
  const activadas = [];
  if (hechos.contrasenaDefault) activadas.push(reglas.find((r) => r.id === 1));
  if (hechos.accesoPanel) activadas.push(reglas.find((r) => r.id === 2));
  if (hechos.conectividadLAN) activadas.push(reglas.find((r) => r.id === 3));
  if (hechos.dhcpOff) activadas.push(reglas.find((r) => r.id === 4));
  
  // Ordenar por prioridad
  activadas.sort((a, b) => b.prioridad - a.prioridad);

  // --- EJECUCIÓN DINÁMICA (ANIMACIÓN) ---
  let delay = 500;
  
  activadas.forEach((regla) => {
    setTimeout(() => {
      // Crear elemento visual para cada regla
      const item = document.createElement("div");
      item.className = "d-flex align-items-center mb-2 border-bottom pb-2 fade-in";
      item.innerHTML = `
        <span class="badge ${getBadgeColor(regla.prioridad)} me-2">P${regla.prioridad}</span>
        <div>
            <small class="d-block text-muted">Regla ${regla.id}: ${regla.descripcion}</small>
            <strong class="text-primary"><i class="bi bi-arrow-return-right"></i> Acción: ${regla.accion}</strong>
        </div>
      `;
      logContainer.appendChild(item);
      logContainer.scrollTop = logContainer.scrollHeight; // Auto-scroll hacia abajo
    }, delay);
    delay += 1000;
  });

  // --- RESOLUCIÓN FINAL ---
  setTimeout(() => {
    const conclusion = document.createElement("div");
    conclusion.className = "alert alert-success mt-3 shadow-sm";
    conclusion.innerHTML = `
        <h6 class="alert-heading fw-bold"><i class="bi bi-check-all"></i> Resolución de Conflictos Finalizada</h6>
        <p class="mb-0 small">El sistema ejecutó las acciones ordenadas por prioridad (3 -> 2 -> 1). Se priorizó la seguridad del dispositivo.</p>
    `;
    res.appendChild(conclusion);
  }, delay + 500);
}



let intentosLogin = 0;
let bloqueado = false;

function procesarLogin() {
  const userElem = document.getElementById("login-user");
  const passElem = document.getElementById("login-pass");
  const reiniciarBtn = document.getElementById("btn-reiniciar");

  if (!userElem || !passElem)
    return console.warn("Inputs de login no encontrados");

  if (bloqueado) {
    Swal.fire({
      icon: "warning",
      title: "Usuario bloqueado",
      text: "Se han agotado los intentos. Usa 'Reiniciar'.",
      timer: 3000,
      showConfirmButton: false,
    });

    return;
  }

  const user = userElem.value.trim();
  const pass = passElem.value.trim();

  if (user === "unidad3" && pass === "123") {
    intentosLogin = 0;
    Swal.fire({
      icon: "success",
      title: "Acceso concedido",
      text: "Credenciales correctas.",
      timer: 3000,
      showConfirmButton: false,
    });

    return;
  }

  intentosLogin++;
  const restantes = Math.max(0, 3 - intentosLogin);

  Swal.fire({
    icon: "error",
    title: "Credenciales inválidas",
    text: `Intentos: ${intentosLogin}/3. Restan ${restantes}.`,
    timer: 3000,
    showConfirmButton: false,
  });

  if (intentosLogin >= 3) {
    bloqueado = true;
    if (reiniciarBtn) reiniciarBtn.classList.remove("d-none");
    setTimeout(() => {
      Swal.fire({
        icon: "warning",
        title: "Usuario bloqueado",
        text: "Se han agotado los intentos. Usa 'Reiniciar'.",
        timer: 3000,
        showConfirmButton: false,
      });
    }, 400);
  }
}

function reiniciarLogin() {
  intentosLogin = 0;
  bloqueado = false;
  const reiniciarBtn = document.getElementById("btn-reiniciar");
  if (reiniciarBtn) reiniciarBtn.classList.add("d-none");

  const userElem = document.getElementById("login-user");
  const passElem = document.getElementById("login-pass");
  if (userElem) userElem.value = "";
  if (passElem) passElem.value = "";

  Swal.fire({
    icon: "success",
    title: "Estado reiniciado",
    timer: 3000,
    showConfirmButton: false,
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("sistema-experto")) showPage("sistema-experto");
});
