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

  const reglas = {
    no_enciende: "Revisar fuente de poder.",
    ventilador_no_gira: "Posible falla en tarjeta madre o 12V del ventilador.",
    so_no_carga: "Verificar disco duro y sector de arranque.",
    reinicia: "Revisar temperatura del CPU y eventos de energía.",
    temp_alta:
      "Limpiar ventilador y aplicar pasta térmica; verificar flujo de aire.",
    sin_senal: "Revisar conexión de video (HDMI/DP/VGA) y tarjeta de video.",
    tarjeta_video_floja:
      "Ajustar tarjeta de video en la ranura y comprobar alimentación adicional.",
    disco_ruido: "Recomendado: respaldo inmediato y reemplazo del disco.",
    no_red: "Verificar configuración de IP y conexión física.",
    ip_correcta: "IP correcta. Si no hay conexión, revisar switch o router.",
  };

  const derivadas = {
    reinicia:
      "Si la temperatura es alta → limpiar ventilador y aplicar pasta térmica.",
    temp_alta:
      "Después de limpiar/verificar temperatura, comprobar que el equipo no se reinicie.",
    no_red:
      "Si la IP está correcta y sigue sin conexión → revisar switch o router.",
    ip_correcta: "Si IP correcta y sin conexión → revisar switch/router.",
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

  seleccionados.forEach((h) => {
    if (reglas[h]) {
      for (const cat in categorias) {
        if (categorias[cat].includes(h)) {
          resultadosPorCategoria[cat].push({ hecho: h, accion: reglas[h] });
          if (derivadas[h])
            resultadosPorCategoria[cat].push({
              hecho: `${h}_der`,
              accion: derivadas[h],
            });
        }
      }
    }
  });

  let salida = [];

  const hechosTotales = Object.keys(reglas).length;
  if (seleccionados.length === hechosTotales) {
    salida.push(
      "Se detectaron múltiples fallas. Acciones recomendadas en orden por categoría:\n"
    );
    Swal.fire({
      icon: "info",
      title: "Múltiples fallas detectadas",
      text: "Se han seleccionado todos los síntomas. Se mostrarán acciones agrupadas.",
      timer: 3000,
      showConfirmButton: false,
    });
  }

  const ordenCategorias = [
    "energia",
    "arranque",
    "temperatura",
    "video",
    "red",
  ];
  ordenCategorias.forEach((cat) => {
    const items = resultadosPorCategoria[cat];
    if (items.length > 0) {
      const titulo = {
        energia: "Problemas de energía / hardware",
        arranque: "Problemas de arranque / disco",
        temperatura: "Problemas térmicos",
        video: "Problemas de video",
        red: "Problemas de red",
      }[cat];

      salida.push(`== ${titulo} ==`);
      const mostrados = new Set();
      items.forEach((it) => {
        if (!mostrados.has(it.accion)) {
          salida.push(`- ${it.accion}`);
          mostrados.add(it.accion);
        }
      });
      salida.push("");
    }
  });

  const independientes = [];
  if (
    seleccionados.includes("no_enciende") &&
    seleccionados.includes("no_red")
  ) {
    independientes.push(
      "Se detectan problemas independientes: energía y red. Trátalos por separado."
    );
  }
  if (
    seleccionados.includes("disco_ruido") &&
    seleccionados.includes("no_enciende")
  ) {
    independientes.push(
      "Posible falla mecánica del disco (respaldar) y problemas de inicio (fuente/placa)."
    );
  }
  if (independientes.length > 0) {
    Swal.fire({
      icon: "info",
      title: "Fallas independientes detectadas",
      text: independientes.join(" "),
      timer: 3000,
      showConfirmButton: false,
    });
  }

  if (salida.length === 0) {
    salida.push(
      "No se encontraron reglas aplicables a los síntomas seleccionados."
    );
  }

  salidaElem.textContent = salida.join("\n");
}

function resetExpert() {
  document.querySelectorAll(".symptom").forEach((ch) => (ch.checked = false));
  const salidaElem = document.getElementById("diagnostico-res");
  if (salidaElem) salidaElem.textContent = "Esperando datos...";
  Swal.fire({
    icon: "success",
    title: "Estado reiniciado",
    text: "Puedes comenzar una nueva evaluación.",
    timer: 3000,
    showConfirmButton: false,
  });
}

function simularConflicto() {
  const res = document.getElementById("conflicto-res");
  if (!res) return console.warn("Elemento conflicto-res no encontrado");

  const hechos = {
    clienteEntra: true,
    telefonoSuena: true,
    correoUrgente: true,
    impresoraErrorPapel: true,
  };

  const reglas = [
    {
      id: 1,
      prioridad: 1,
      descripcion:
        "SI un cliente entra a la oficina → Atender al cliente personalmente.",
      accion: "Atender al cliente personalmente",
    },
    {
      id: 2,
      prioridad: 2,
      descripcion: "SI el teléfono suena → Contestar la llamada.",
      accion: "Contestar la llamada",
    },
    {
      id: 3,
      prioridad: 2,
      descripcion:
        "SI llega un correo urgente → Revisar el correo electrónico.",
      accion: "Revisar correo urgente",
    },
    {
      id: 4,
      prioridad: 3,
      descripcion:
        "SI la impresora marca error de papel → Revisar la bandeja de papel.",
      accion: "Revisar bandeja de papel",
    },
  ];

  const activadas = [];
  if (hechos.clienteEntra) activadas.push(reglas.find((r) => r.id === 1));
  if (hechos.telefonoSuena) activadas.push(reglas.find((r) => r.id === 2));
  if (hechos.correoUrgente) activadas.push(reglas.find((r) => r.id === 3));
  if (hechos.impresoraErrorPapel)
    activadas.push(reglas.find((r) => r.id === 4));

  activadas.sort((a, b) => {
    if (a.prioridad !== b.prioridad) return a.prioridad - b.prioridad;
    return a.id - b.id;
  });

  res.innerHTML = "Escenario: Oficina de Soporte Técnico\nHechos detectados:\n";
  res.innerHTML += `- Cliente entra: ${hechos.clienteEntra}\n- Teléfono suena: ${hechos.telefonoSuena}\n- Correo urgente: ${hechos.correoUrgente}\n- Impresora error papel: ${hechos.impresoraErrorPapel}\n\n`;
  res.innerHTML += "Motor de inferencia evaluando prioridades...\n\n";

  let delay = 700;
  activadas.forEach((regla) => {
    setTimeout(() => {
      res.innerHTML += `→ [Ejecución] Regla ${regla.id} (prioridad ${regla.prioridad}): ${regla.descripcion}\n`;
      res.innerHTML += `   Acción ejecutada: ${regla.accion}\n\n`;
    }, delay);
    delay += 900;
  });

  setTimeout(() => {
    res.innerHTML +=
      " Resolución del conflicto (orden ejecutado por prioridad):\n";
    res.innerHTML += "- 1) Atender al cliente (Regla 1, prioridad ALTA)\n";
    res.innerHTML += "- 2) Contestar la llamada (Regla 2, prioridad MEDIA)\n";
    res.innerHTML +=
      "- 3) Revisar el correo urgente (Regla 3, prioridad MEDIA)\n";
    res.innerHTML += "- 4) Revisar la impresora (Regla 4, prioridad BAJA)\n\n";
    res.innerHTML +=
      " Nota: El motor de inferencia resolvió el conflicto aplicando prioridad a las reglas activas.";
  }, delay + 300);
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
