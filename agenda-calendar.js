/**
 * agenda-calendar.js - Sistema de agendamiento tipo Calendly
 * Conectado a backend API
 */

(function() {
    const result = checkAuth('agenda');
    if (!result.allowed) {
        if (result.msg) showToast(result.msg, 'error');
        window.location.href = result.redirect || 'login.html';
        return;
    }

    const session = getSession();
    const userEmail = session?.usuario?.email || '';
    const userId = session?.usuario?.id || '2';

    const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const WEEKDAYS = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];

    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let selectedDate = null;
    let selectedSlot = null;

    const calendarDays = document.getElementById('calendarDays');
    const calendarMonthLabel = document.getElementById('calendarMonthLabel');
    const calendarPrev = document.getElementById('calendarPrev');
    const calendarNext = document.getElementById('calendarNext');
    const slotHeaderHint = document.getElementById('slotHeaderHint');
    const slotHeaderDate = document.getElementById('slotHeaderDate');
    const slotsList = document.getElementById('slotsList');
    const slotsEmpty = document.getElementById('slotsEmpty');
    const slotsSelectDate = document.getElementById('slotsSelectDate');
    const appointmentSummary = document.getElementById('appointmentSummary');
    const summaryDetails = document.getElementById('summaryDetails');
    const btnConfirmarCita = document.getElementById('btnConfirmarCita');
    const btnCancelarSlot = document.getElementById('btnCancelarSlot');
    const timezoneSelect = document.getElementById('timezone');

    const tz = localStorage.getItem('ytg_timezone') || 'America/Lima';
    if (timezoneSelect) {
        timezoneSelect.value = tz;
        timezoneSelect.addEventListener('change', () => localStorage.setItem('ytg_timezone', timezoneSelect.value));
    }

    document.getElementById('btnLogout').addEventListener('click', () => {
        logout();
        window.location.href = 'index.html';
    });

    function escapeHtml(s) {
        const div = document.createElement('div');
        div.textContent = s || '';
        return div.innerHTML;
    }

    function formatDateLabel(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr + 'T12:00:00');
        const day = d.getDate();
        const month = MONTHS[d.getMonth()];
        const weekday = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'][d.getDay()];
        return `${weekday}, ${day} de ${month}`;
    }

    function updateCitaActivaBanner() {
        const activas = getCitas().filter(c => c.estado !== 'Cancelada' && c.email.toLowerCase() === userEmail.toLowerCase());
        const banner = document.getElementById('citaActivaBanner');
        if (banner) banner.style.display = activas.length >= 1 ? 'block' : 'none';
    }

    function renderCalendar() {
        if (!calendarMonthLabel) return;
        calendarMonthLabel.textContent = `${MONTHS[currentMonth]} ${currentYear}`;

        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const startDow = (firstDay.getDay() + 6) % 7;
        const daysInMonth = lastDay.getDate();

        const hoy = new Date();
        const hoyStr = hoy.toISOString().split('T')[0];

        let html = '';
        for (let i = 0; i < startDow; i++) {
            html += '<span class="calendar-day calendar-day-empty"></span>';
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const isPast = dateStr < hoyStr;
            const isToday = dateStr === hoyStr;
            const isSelected = selectedDate === dateStr;
            const { disponibles } = getEstadoSlotsParaFecha(dateStr);
            const ahora = new Date();
            const esHoy = dateStr === hoyStr;
            let disponiblesHoy = disponibles;
            if (esHoy) {
                disponiblesHoy = disponibles.filter(slot => {
                    const [h, m] = slot.split(':').map(Number);
                    const slotTime = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), h, m);
                    return slotTime > ahora;
                });
            }
            const hasAvailability = disponiblesHoy.length > 0;

            let classes = 'calendar-day';
            if (isPast) classes += ' calendar-day-past';
            if (isToday) classes += ' calendar-day-today';
            if (isSelected) classes += ' calendar-day-selected';
            if (!hasAvailability && !isPast) classes += ' calendar-day-no-avail';

            html += `<button type="button" class="${classes}" data-date="${dateStr}" ${isPast ? 'disabled' : ''}>${d}</button>`;
        }

        calendarDays.innerHTML = html;

        calendarDays.querySelectorAll('.calendar-day:not(.calendar-day-empty):not([disabled])').forEach(btn => {
            btn.addEventListener('click', () => selectDate(btn.dataset.date));
        });
    }

    function selectDate(dateStr) {
        selectedDate = dateStr;
        selectedSlot = null;
        appointmentSummary.style.display = 'none';
        renderCalendar();
        renderSlots();
        slotHeaderHint.style.display = 'none';
        slotHeaderDate.style.display = 'block';
        slotHeaderDate.textContent = formatDateLabel(dateStr);
        slotsSelectDate.style.display = 'none';
    }

    function renderSlots() {
        if (!slotsList) return;
        slotsList.innerHTML = '';
        slotsEmpty.style.display = 'none';
        slotsSelectDate.style.display = selectedDate ? 'none' : 'block';

        if (!selectedDate) return;

        const { disponibles, ocupados, todos } = getEstadoSlotsParaFecha(selectedDate);
        const ahora = new Date();
        const hoyStr = ahora.toISOString().split('T')[0];
        const esHoy = selectedDate === hoyStr;

        let slotsToShow = disponibles;
        if (esHoy) {
            slotsToShow = disponibles.filter(slot => {
                const [h, m] = slot.split(':').map(Number);
                const slotTime = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), h, m);
                return slotTime > ahora;
            });
        }

        slotsToShow.forEach(slot => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'slot-btn slot-btn-available';
            btn.textContent = slot;
            btn.dataset.slot = slot;
            btn.addEventListener('click', () => selectSlot(slot));
            slotsList.appendChild(btn);
        });

        if (slotsToShow.length === 0) {
            slotsEmpty.style.display = 'block';
            slotsEmpty.textContent = 'No hay disponibilidad para esta fecha.';
        }
    }

    function selectSlot(slot) {
        selectedSlot = slot;
        document.querySelectorAll('.slot-btn-available').forEach(b => b.classList.remove('slot-btn-selected'));
        const btn = slotsList?.querySelector(`[data-slot="${slot}"]`);
        if (btn) btn.classList.add('slot-btn-selected');

        const horaFin = add15Minutes(slot);
        summaryDetails.innerHTML = `
            <div class="summary-row"><span>Fecha:</span><strong>${formatDateLabel(selectedDate)}</strong></div>
            <div class="summary-row"><span>Hora inicio:</span><strong>${slot}</strong></div>
            <div class="summary-row"><span>Hora fin:</span><strong>${horaFin}</strong></div>
            <div class="summary-row"><span>Modalidad:</span><strong>Virtual</strong></div>
            <div class="summary-row"><span>Duración:</span><strong>15 minutos</strong></div>
        `;
        appointmentSummary.style.display = 'block';
    }

    function clearSelection() {
        selectedSlot = null;
        appointmentSummary.style.display = 'none';
        renderSlots();
        if (slotsList?.querySelector('.slot-btn-selected')) {
            slotsList.querySelector('.slot-btn-selected').classList.remove('slot-btn-selected');
        }
    }

    if (calendarPrev) calendarPrev.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) { currentMonth = 11; currentYear--; }
        renderCalendar();
    });

    if (calendarNext) calendarNext.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) { currentMonth = 0; currentYear++; }
        renderCalendar();
    });

    if (btnCancelarSlot) btnCancelarSlot.addEventListener('click', clearSelection);

    if (btnConfirmarCita) btnConfirmarCita.addEventListener('click', async function() {
        if (!selectedSlot || !selectedDate) {
            showToast('Selecciona una fecha y hora', 'error');
            return;
        }

        const u = session?.usuario || {};
        const data = {
            nombre: u.nombre || 'Usuario',
            whatsapp: u.celular || u.whatsapp || '—',
            email: u.email || '',
            servicio: 'Mentoría',
            fecha: selectedDate,
            horaInicio: selectedSlot,
            comentarios: '',
        };

        const res = await crearCita(data, userId);
        if (res.success) {
            showToast('Cita agendada correctamente', 'success');
            clearSelection();
            renderSlots();
            renderMisCitas();
            updateCitaActivaBanner();
        } else {
            showToast(res.error || 'Error al agendar', 'error');
        }
    });

    function renderMisCitas() {
        const list = document.getElementById('citasList');
        const empty = document.getElementById('emptyCitas');
        if (!list) return;

        const citas = getCitasByUserEmail(userEmail).filter(c => c.estado !== 'Cancelada');

        list.innerHTML = '';

        if (citas.length === 0) {
            if (empty) empty.style.display = 'block';
            return;
        }
        if (empty) empty.style.display = 'none';

        citas.sort((a, b) => {
            if (a.fecha !== b.fecha) return a.fecha.localeCompare(b.fecha);
            return a.horaInicio.localeCompare(b.horaInicio);
        });

        citas.forEach(c => {
            const badgeClass = 'badge-' + (c.estado || 'pendiente').toLowerCase();
            const card = document.createElement('div');
            card.className = 'cita-card';
            card.innerHTML = `
                <div class="cita-card-header">
                    <span class="cita-card-servicio">${escapeHtml(c.servicio)}</span>
                    <span class="badge ${badgeClass}">${escapeHtml(c.estado)}</span>
                </div>
                <div class="cita-card-meta">
                    ${formatDateLabel(c.fecha)} · ${c.horaInicio} - ${c.horaFin} · Virtual
                </div>
                ${c.comentarios ? `<p class="cita-card-meta">${escapeHtml(c.comentarios)}</p>` : ''}
                <div class="cita-card-actions">
                    <button type="button" class="btn btn-outline btn-sm" data-action="reprogramar" data-id="${c.id}">Reprogramar</button>
                    <button type="button" class="btn btn-ghost btn-sm" data-action="cancel" data-id="${c.id}">Cancelar cita</button>
                </div>
            `;
            list.appendChild(card);
        });

        list.querySelectorAll('[data-action="cancel"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                showModal({
                    title: 'Cancelar cita',
                    content: '<p>¿Estás seguro de cancelar esta cita?</p>',
                    confirmText: 'Sí, cancelar',
                    cancelText: 'No',
                    onConfirm: async () => {
                        const res = await actualizarCita(id, { estado: 'Cancelada' });
                        if (res.success) {
                            showToast('Cita cancelada', 'success');
                            renderMisCitas();
                            updateCitaActivaBanner();
                        } else {
                            showToast(res.error, 'error');
                        }
                    },
                });
            });
        });

        list.querySelectorAll('[data-action="reprogramar"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const cita = getCitas().find(x => x.id === id);
                if (!cita) return;
                const hoy = new Date().toISOString().split('T')[0];
                const content = `
                    <p class="cita-card-meta" style="margin-bottom: 1rem;">Reprogramar: ${escapeHtml(cita.servicio)} · ${cita.fecha} ${cita.horaInicio}</p>
                    <div class="form-group">
                        <label class="form-label">Nueva fecha</label>
                        <input type="date" id="reprogFecha" class="form-input" value="${cita.fecha}" min="${hoy}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Nueva hora</label>
                        <select id="reprogHora" class="form-input">
                            <option value="">Selecciona hora</option>
                        </select>
                    </div>
                `;
                showModal({
                    title: 'Reprogramar cita',
                    content,
                    confirmText: 'Reprogramar',
                    cancelText: 'Cancelar',
                    onOpen: (overlay) => {
                        const fechaInput = overlay.querySelector('#reprogFecha');
                        const horaSelect = overlay.querySelector('#reprogHora');
                        function cargarHoras() {
                            const f = fechaInput.value;
                            if (!f) return;
                            const { disponibles } = getEstadoSlotsParaFecha(f);
                            const ahora = new Date();
                            const hoyStr = ahora.toISOString().split('T')[0];
                            let opts = disponibles;
                            if (f === hoyStr) {
                                opts = disponibles.filter(s => {
                                    const [h, m] = s.split(':').map(Number);
                                    const t = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), h, m);
                                    return t > ahora;
                                });
                            }
                            if (!opts.includes(cita.horaInicio)) opts = [...opts, cita.horaInicio].sort();
                            horaSelect.innerHTML = '<option value="">Selecciona hora</option>' + opts.map(s => `<option value="${s}" ${s === cita.horaInicio ? 'selected' : ''}>${s}</option>`).join('');
                        }
                        fechaInput.addEventListener('change', cargarHoras);
                        cargarHoras();
                    },
                    onConfirm: async (overlayEl) => {
                        const fecha = overlayEl?.querySelector('#reprogFecha')?.value;
                        const hora = overlayEl?.querySelector('#reprogHora')?.value;
                        if (!fecha || !hora) {
                            showToast('Selecciona fecha y hora', 'error');
                            return false;
                        }
                        const res = await actualizarCita(id, { fecha, horaInicio: hora, estado: 'Reprogramada' });
                        if (res.success) {
                            showToast('Cita reprogramada', 'success');
                            renderMisCitas();
                            renderSlots();
                            updateCitaActivaBanner();
                        } else {
                            showToast(res.error || 'El nuevo horario no está disponible', 'error');
                            return false;
                        }
                    },
                });
            });
        });
    }

    async function init() {
        try {
            await loadCitas();
            await loadSchedule();
        } catch (err) {
            showToast(err.message || 'Error al cargar datos', 'error');
            return;
        }
        renderCalendar();
        renderSlots();
        renderMisCitas();
        updateCitaActivaBanner();
    }

    init();
})();
