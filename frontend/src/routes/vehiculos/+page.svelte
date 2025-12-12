<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { vehiculos, addNotificacion } from '$lib/stores.js';
	import { vehiculoService, documentoService } from '$lib/api/services.js';
	import { estadoLabel, estadoClass } from '$lib/status.js';
	import { puedeCrear, puedeEditar, puedeEliminar, puedeCambiarEstado, puedeVerModulo } from '$lib/permisos.js';
	import { modulosConfig } from '$lib/modulos.js';

	let mostrarFormulario = false;
	let editandoId = null;
	let confirmAction = { open: false, type: null, id: null, label: '' };
	let historialModal = { open: false, data: null, loading: false };
	let formData = {
		placa: '',
		modelo: '',
		marca: '',
		año: '',
		capacidad_carga: '',
		tipo_combustible: '',
		estado_operativo: 'operativo'
	};

	const documentosIniciales = {
		soat: null,
		tecnicomecanica: null,
		tarjeta_propiedad: null,
		foto_placa: null,
		foto_exterior: null,
		foto_interior: null
	};

	let documentos = { ...documentosIniciales };
	let subiendoDocs = false;
	let documentosExistentes = [];
	let cargandoDocs = false;
	const API_HOST = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/api$/, '');
	let documentosMap = {};

	const MODULO = 'vehiculos';

	let puedeCrearVehiculos = false;
	let puedeEditarVehiculos = false;
	let puedeEliminarVehiculos = false;
	let puedeCambiarEstadoVehiculos = false;

	$: permisosModulo = $modulosConfig;
	$: {
		permisosModulo;
		puedeCrearVehiculos = puedeCrear(MODULO);
		puedeEditarVehiculos = puedeEditar(MODULO);
		puedeEliminarVehiculos = puedeEliminar(MODULO);
		puedeCambiarEstadoVehiculos = puedeCambiarEstado(MODULO);
	}

	const fmtDateTime = (value) => {
		if (!value) return '—';
		const d = new Date(value);
		const t = d.getTime();
		return Number.isNaN(t) ? value : d.toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
	};

	onMount(async () => {
		if (!puedeVerModulo(MODULO)) {
			addNotificacion('No tienes acceso al módulo Vehículos', 'error');
			goto('/');
			return;
		}
		await cargarVehiculos();
	});

	async function verVehiculo(vehiculo) {
		historialModal = { open: true, data: null, loading: true };
		try {
			const data = await vehiculoService.obtenerHistorial(vehiculo.id_vehiculo);
			historialModal = { open: true, data, loading: false };
		} catch (error) {
			addNotificacion('No se pudo cargar el historial', 'error');
			historialModal = { open: false, data: null, loading: false };
		}
	}

	async function cargarVehiculos() {
		vehiculos.update((v) => ({ ...v, loading: true }));
		try {
			const data = await vehiculoService.listar();
			vehiculos.update((v) => ({ ...v, items: data.vehiculos || [], loading: false }));
		} catch (error) {
			vehiculos.update((v) => ({ ...v, error: error.message, loading: false }));
			addNotificacion(error.message, 'error');
		}
	}

	function resetForm() {
		editandoId = null;
		formData = {
			placa: '',
			modelo: '',
			marca: '',
			año: '',
			capacidad_carga: '',
			tipo_combustible: '',
			estado_operativo: 'operativo'
		};
		documentos = { ...documentosIniciales };
		subiendoDocs = false;
		documentosExistentes = [];
		cargandoDocs = false;
		documentosMap = {};
	}

	function abrirFormulario() {
		resetForm();
		mostrarFormulario = true;
	}

	function editarVehiculo(vehiculo) {
		editandoId = vehiculo.id_vehiculo;
		formData = {
			placa: vehiculo.placa,
			modelo: vehiculo.modelo,
			marca: vehiculo.marca,
			año: vehiculo.año,
			capacidad_carga: vehiculo.capacidad_carga,
			tipo_combustible: vehiculo.tipo_combustible || '',
			estado_operativo: vehiculo.estado_operativo
		};
		mostrarFormulario = true;
		cargarDocumentosVehiculo(vehiculo.id_vehiculo);
	}

	const etiquetasDocumento = {
		soat: 'SOAT',
		tecnicomecanica: 'TECNICOMECANICA',
		tarjeta_propiedad: 'TARJETA_PROPIEDAD',
		foto_placa: 'FOTO_PLACA',
		foto_exterior: 'FOTO_EXTERIOR',
		foto_interior: 'FOTO_INTERIOR'
	};

	const keyPorTipo = Object.fromEntries(Object.entries(etiquetasDocumento).map(([k, v]) => [v, k]));

	const docFields = [
		{ key: 'soat', label: 'SOAT', accept: 'application/pdf' },
		{ key: 'tecnicomecanica', label: 'Tecnicomecánica', accept: 'application/pdf' },
		{ key: 'tarjeta_propiedad', label: 'Tarjeta de propiedad', accept: 'application/pdf' },
		{ key: 'foto_placa', label: 'Foto placa', accept: 'image/png,image/jpeg,image/jpg' },
		{ key: 'foto_exterior', label: 'Foto exterior', accept: 'image/png,image/jpeg,image/jpg' },
		{ key: 'foto_interior', label: 'Foto interior', accept: 'image/png,image/jpeg,image/jpg' }
	];

	const acceptPorKey = Object.fromEntries(docFields.map((d) => [d.key, d.accept.split(',')]));

	function handleFileChange(event, key) {
		const file = event?.target?.files?.[0] || null;
		if (file && !archivoPermitido(key, file)) {
			addNotificacion('Formato no permitido para este documento', 'warning');
			if (event?.target) event.target.value = '';
			documentos = { ...documentos, [key]: null };
			return;
		}
		documentos = { ...documentos, [key]: file };
	}

	function abrirSelector(key) {
		const el = document?.getElementById(`file-${key}`);
		if (el) el.click();
	}

	const nombreArchivo = (file) => file?.name || 'Sin archivo';

	const archivoPermitido = (key, file) => {
		const accepts = acceptPorKey[key] || [];
		const mime = (file.type || '').toLowerCase();
		const ext = (file.name || '').split('.').pop()?.toLowerCase();
		return accepts.some((acc) => {
			const accLower = acc.toLowerCase();
			if (accLower === 'application/pdf') {
				return mime === 'application/pdf' || ext === 'pdf';
			}
			if (accLower.startsWith('image/')) {
				return mime.startsWith('image/') || ['jpg', 'jpeg', 'png'].includes(ext || '');
			}
			if (accLower.startsWith('.')) {
				return ext === accLower.slice(1);
			}
			return mime === accLower;
		});
	};

	const docUrl = (archivo_url) => {
		if (!archivo_url) return '#';
		return archivo_url.startsWith('http') ? archivo_url : `${API_HOST}${archivo_url}`;
	};

	async function descargarDocumento(id_documento) {
		try {
			const data = await documentoService.descargarDocumento(id_documento);
			const directUrl = data?.descarga_url || data?.archivo_url;
			const finalUrl = directUrl?.startsWith('http') ? directUrl : directUrl ? `${API_HOST}${directUrl}` : null;
			if (finalUrl && typeof window !== 'undefined') {
				window.open(finalUrl, '_blank');
			} else {
				addNotificacion('No se pudo obtener la URL de descarga', 'warning');
			}
		} catch (error) {
			addNotificacion(error.message || 'Error al descargar', 'error');
		}
	}

	async function cargarDocumentosVehiculo(idVehiculo) {
		cargandoDocs = true;
		try {
			const data = await documentoService.listarDocumentos(idVehiculo);
			documentosExistentes = data.documentos || [];
			documentosMap = {};
			documentosExistentes.forEach((doc) => {
				const key = keyPorTipo[doc.tipo_documento];
				if (key) documentosMap[key] = doc;
			});
		} catch (error) {
			documentosExistentes = [];
			documentosMap = {};
			addNotificacion('No se pudieron cargar los documentos', 'warning');
		} finally {
			cargandoDocs = false;
		}
	}

	const hayArchivosSeleccionados = () => Object.values(documentos).some(Boolean);

	async function subirDocumentos(idVehiculo) {
		if (!hayArchivosSeleccionados()) return true;
		subiendoDocs = true;

		const cargas = Object.entries(documentos)
			.filter(([, file]) => file)
			.map(([key, file]) => {
				const fd = new FormData();
				fd.append('tipo_documento', etiquetasDocumento[key]);
				fd.append('archivo', file);
				return documentoService.subirDocumento(idVehiculo, fd);
			});

		const resultados = await Promise.allSettled(cargas);
		subiendoDocs = false;

		const fallas = resultados.filter((r) => r.status === 'rejected');
		if (fallas.length === 0) {
			documentos = { ...documentosIniciales };
			return true;
		}

		return false;
	}

	async function guardarVehiculo() {
		if (!formData.placa || !formData.marca || !formData.modelo || !formData.año || !formData.capacidad_carga) {
			addNotificacion('Completa todos los campos', 'warning');
			return;
		}
		try {
			let vehiculoId = editandoId;

			if (editandoId) {
				await vehiculoService.actualizar(editandoId, formData);
				addNotificacion('Vehículo actualizado', 'success');
			} else {
				const respuesta = await vehiculoService.crear(formData);
				vehiculoId = respuesta?.vehiculo?.id_vehiculo || vehiculoId;
				addNotificacion('Vehículo creado', 'success');
			}

			let docsOk = true;
			if (vehiculoId && hayArchivosSeleccionados()) {
				docsOk = await subirDocumentos(vehiculoId);
				addNotificacion(docsOk ? 'Documentos cargados' : 'Algunos documentos no se cargaron. Reintenta.', docsOk ? 'success' : 'warning');
			} else if (hayArchivosSeleccionados() && !vehiculoId) {
				addNotificacion('Vehículo guardado pero sin ID para cargar documentos. Reabre y edita para adjuntar.', 'warning');
			}
			mostrarFormulario = false;
			await cargarVehiculos();
		} catch (error) {
			addNotificacion(error.message, 'error');
		}
	}

	function solicitarAccion(tipo, vehiculo) {
		confirmAction = {
			open: true,
			type: tipo,
			id: vehiculo.id_vehiculo,
			label: vehiculo.placa
		};
	}

	async function confirmarAccion() {
		if (!confirmAction.id || !confirmAction.type) return;
		try {
			if (confirmAction.type === 'eliminar') {
				await vehiculoService.eliminar(confirmAction.id);
				addNotificacion('Vehículo eliminado', 'success');
			} else if (confirmAction.type === 'desactivar') {
				await vehiculoService.desactivar(confirmAction.id);
				addNotificacion('Vehículo desactivado', 'success');
			} else if (confirmAction.type === 'activar') {
				await vehiculoService.activar(confirmAction.id);
				addNotificacion('Vehículo activado', 'success');
			}
			confirmAction = { open: false, type: null, id: null, label: '' };
			await cargarVehiculos();
		} catch (error) {
			addNotificacion(error.message, 'error');
		}
	}

	$: stats = {
		total: $vehiculos.items.length,
		operativos: $vehiculos.items.filter((v) => v.estado_operativo === 'operativo').length,
		inactivos: $vehiculos.items.filter((v) => v.estado_operativo === 'inactivo').length
	};
</script>

<svelte:head>
	<title>Gestión de Vehículos - TransConecta</title>
</svelte:head>

<div class="page-shell">
	<div class="bg-shape shape-a" aria-hidden="true"></div>
	<div class="bg-shape shape-b" aria-hidden="true"></div>

	<section class="hero">
		<div class="hero-text">
			<p class="eyebrow">Flota</p>
			<h1>Gestión de Vehículos</h1>
			<p class="lede">Administra placas, capacidad y estado operativo de la flota.</p>
			<div class="chips">
				<span class="chip success">{stats.operativos} operativos</span>
				<span class="chip muted">{stats.inactivos} inactivos</span>
			</div>
		</div>
		<div class="hero-actions">
			{#if puedeCrearVehiculos}
				<button class="primary" on:click={abrirFormulario}>+ Nuevo vehículo</button>
			{/if}
		</div>
	</section>

	{#if mostrarFormulario}
		<section class="panel">
			<div class="panel-head">
				<div>
					<p class="label">Formulario</p>
					<h2>{editandoId ? 'Editar vehículo' : 'Nuevo vehículo'}</h2>
				</div>
				<button class="ghost" on:click={() => (mostrarFormulario = false)}>Cerrar</button>
			</div>
			<form class="form-grid" on:submit|preventDefault={guardarVehiculo}>
				<label class="field">
					<span>Placa</span>
					<input type="text" placeholder="ABC-123" bind:value={formData.placa} required />
				</label>
				<label class="field">
					<span>Marca</span>
					<input type="text" placeholder="Toyota" bind:value={formData.marca} required />
				</label>
				<label class="field">
					<span>Modelo</span>
					<input type="text" placeholder="Hiace" bind:value={formData.modelo} required />
				</label>
				<label class="field">
					<span>Año</span>
					<input type="number" min="1900" max="2100" placeholder="2024" bind:value={formData.año} required />
				</label>
				<label class="field">
					<span>Capacidad (kg)</span>
					<input type="number" min="1" placeholder="1000" bind:value={formData.capacidad_carga} required />
				</label>
				<label class="field">
					<span>Tipo de combustible</span>
					<select bind:value={formData.tipo_combustible}>
						<option value="">Selecciona combustible</option>
						<option value="Diesel">Diésel</option>
						<option value="Gasolina">Gasolina</option>
						<option value="Gas">Gas</option>
						<option value="Electrico">Eléctrico</option>
						<option value="Hibrido">Híbrido</option>
						
					</select>
				</label>
				<label class="field">
					<span>Estado Operativo</span>
					<select bind:value={formData.estado_operativo}>
						<option value="operativo">Operativo</option>
						<option value="en_mantenimiento">En mantenimiento</option>
						<option value="en_ruta">En ruta</option>
						<option value="inactivo">Inactivo</option>
					</select>
				</label>

				<div class="doc-block">
					<div class="doc-head">
						<p class="label">Documentos y evidencias</p>
						<p class="doc-hint">Opcional. Adjunta SOAT, tecnicomecánica, tarjeta de propiedad y fotos del vehículo.</p>
					</div>
					<div class="doc-grid">
						{#each docFields as doc}
							<div class="field doc-field">
								<div class="doc-label">
									<span>{doc.label}</span>
									<div class="doc-label-meta">
										{#if documentosMap[doc.key]}
											<a class="doc-chip mini" href={docUrl(documentosMap[doc.key].archivo_url)} target="_blank" rel="noreferrer">DESCARGAR</a>
										{/if}
									</div>
								</div>
								<div class="doc-actions">
									<button type="button" class="outline" on:click={() => abrirSelector(doc.key)}>
										{documentosMap[doc.key] ? 'Actualizar documento' : 'Subir documento'}
									</button>
									<span class={documentos[doc.key] ? 'doc-pill' : documentosMap[doc.key] ? 'doc-hint-light strong' : 'doc-hint-light'}>
										{documentos[doc.key]
											? nombreArchivo(documentos[doc.key])
											: documentosMap[doc.key]
											? 'Se reemplazará al actualizar'
											: 'Sin archivo'}
									</span>
									<input
										id={`file-${doc.key}`}
										type="file"
										accept={doc.accept}
										on:change={(e) => handleFileChange(e, doc.key)}
										class="file-input"
									/>
								</div>
							</div>
						{/each}
					</div>
					{#if subiendoDocs}
						<p class="doc-status">Subiendo documentos...</p>
					{/if}
				</div>
				<div class="form-actions">
					<button type="submit" class="primary">Guardar</button>
					<button type="button" class="ghost" on:click={() => (mostrarFormulario = false)}>Cancelar</button>
				</div>
			</form>
		</section>
	{/if}

	<section class="panel">
		<div class="panel-head">
			<div>
				<p class="label">Listado</p>
				<h2>Vehículos</h2>
			</div>
		</div>

		{#if $vehiculos.loading}
			<div class="loading">
				<div class="spinner"></div>
				<p>Cargando vehículos...</p>
			</div>
		{:else if $vehiculos.items.length === 0}
			<div class="empty">
				<p>No hay vehículos registrados.</p>
			</div>
		{:else}
			<div class="table-wrap">
				<table>
					<thead>
						<tr>
							<th>Placa</th>
							<th>Marca</th>
							<th>Modelo</th>
							<th>Año</th>
							<th>Capacidad</th>
							<th>Combustible</th>
							<th>Estado</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{#each $vehiculos.items as v}
							<tr>
								<td>{v.placa}</td>
								<td>{v.marca}</td>
								<td>{v.modelo}</td>
								<td>{v.año}</td>
								<td>{v.capacidad_carga} kg</td>
								<td>{v.tipo_combustible || 'N/D'}</td>
								<td>
									<span class={`status-pill status-${estadoClass(v.estado_operativo)}`}>
										{estadoLabel(v.estado_operativo)}
									</span>
							</td>
							<td class="actions">
									<button class="ghost" on:click={() => verVehiculo(v)}>Ver</button>
								{#if puedeEditarVehiculos}
									<button class="ghost" on:click={() => editarVehiculo(v)}>Editar</button>
								{/if}
								{#if puedeCambiarEstadoVehiculos}
									{#if v.estado_operativo === 'inactivo'}
										<button class="success" on:click={() => solicitarAccion('activar', v)}>Activar</button>
									{:else}
										<button class="danger" on:click={() => solicitarAccion('desactivar', v)}>Desactivar</button>
									{/if}
								{/if}
								{#if puedeEliminarVehiculos}
									<button class="outline" on:click={() => solicitarAccion('eliminar', v)}>Eliminar</button>
								{/if}
							</td>
						</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</section>

	{#if confirmAction.open}
		<div class="modal-backdrop">
			<div class="modal">
				<p class="label">Confirmar</p>
				<h3>
					{confirmAction.type === 'eliminar'
						? '¿Eliminar vehículo?'
						: confirmAction.type === 'desactivar'
						? '¿Desactivar vehículo?'
						: '¿Activar vehículo?'}
				</h3>
				<p class="lede">
					{confirmAction.type === 'eliminar'
						? 'Se eliminará '
						: confirmAction.type === 'desactivar'
						? 'Se marcará inactivo '
						: 'Se marcará operativo '}
					<strong>{confirmAction.label}</strong>.
				</p>
				<div class="modal-actions">
					<button class="ghost" on:click={() => (confirmAction = { open: false, type: null, id: null, label: '' })}>Cancelar</button>
					<button class="danger" on:click={confirmarAccion}>Confirmar</button>
				</div>
			</div>
		</div>
	{/if}

	{#if historialModal.open}
		<div class="modal-backdrop">
			<div class="modal wide">
				<p class="label">Historial de vehículo</p>
				{#if historialModal.loading}
					<p class="lede">Cargando...</p>
				{:else if historialModal.data}
					<h3>{historialModal.data.vehiculo?.placa || 'Vehículo'}</h3>
					<p class="lede small">Marca/Modelo: {historialModal.data.vehiculo?.marca} {historialModal.data.vehiculo?.modelo} • Estado: {estadoLabel(historialModal.data.vehiculo?.estado_operativo || '')}</p>
					<div class="detail-scroll">
						<div class="detail-grid">
							<div class="card">
								<div class="card-head">
									<h4>Documentos</h4>
									<span class="pill">{Math.min(historialModal.data.documentos?.length || 0, 5)} / {historialModal.data.total_documentos}</span>
								</div>
								{#if historialModal.data.documentos?.length}
									<div class="list-scroll">
										<ul class="lined">
											{#each (historialModal.data.documentos || []).slice(0,5) as d}
												<li class="doc-row">
													<div>
														<strong>{fmtDateTime(d.fecha_carga)}</strong> • {d.tipo_documento}
													</div>
													{#if d.id_documento}
														<button class="mini" type="button" on:click={() => descargarDocumento(d.id_documento)}>Descargar</button>
													{/if}
												</li>
											{/each}
										</ul>
									</div>
								{:else}
									<p class="muted">Sin documentos</p>
								{/if}
							</div>
							<div class="card full">
								<div class="card-head">
									<h4>Historial</h4>
									<span class="pill muted-pill">{Math.min(historialModal.data.historial?.length || 0, 5)} / {historialModal.data.total_eventos}</span>
								</div>
								{#if historialModal.data.historial?.length}
									<div class="list-scroll">
										<ul class="lined">
											{#each (historialModal.data.historial || []).slice(0,5) as e}
												<li><strong>{fmtDateTime(e.fecha_evento)}</strong> • {e.descripcion_evento}</li>
											{/each}
										</ul>
									</div>
								{:else}
									<p class="muted">Sin historial</p>
								{/if}
							</div>
						</div>
					</div>
				{/if}
				<div class="modal-actions">
					<button class="ghost" on:click={() => (historialModal = { open: false, data: null, loading: false })}>Cerrar</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&display=swap');

	.page-shell { position: relative; padding: 22px 20px 60px 20px; font-family: 'Manrope', system-ui, -apple-system, 'Segoe UI', sans-serif; color: #1f1f1f; }
	.bg-shape { position: absolute; border-radius: 999px; filter: blur(90px); opacity: 0.32; z-index: 0; }
	.shape-a { width: 420px; height: 420px; background: #f6c3c3; top: -140px; left: -120px; }
	.shape-b { width: 360px; height: 360px; background: #ffd8cf; bottom: -160px; right: -120px; }

	.hero { position: relative; z-index: 1; display: flex; justify-content: space-between; gap: 16px; align-items: center; background: linear-gradient(125deg, #ffffff 0%, #fff4f2 100%); border: 1px solid #f0d8d3; border-radius: 16px; padding: 18px 20px; box-shadow: 0 12px 36px rgba(0,0,0,0.06); margin-bottom: 16px; }
	.hero-text h1 { margin: 6px 0 6px 0; font-size: 26px; font-weight: 800; letter-spacing: -0.02em; }
	.eyebrow { text-transform: uppercase; letter-spacing: 0.08em; font-size: 12px; color: #a33b36; font-weight: 800; margin: 0; }
	.lede { margin: 0; color: #4f4f4f; font-size: 14px; max-width: 540px; }
	.chips { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
	.chip { padding: 8px 12px; border-radius: 999px; font-weight: 700; font-size: 13px; border: 1px solid #f4d5d2; background: #fff1f1; color: #a33b36; }
	.chip.muted { background: #fafafa; border-color: #ededed; color: #3f3f46; }
	.chip.success { background: #f2fcf6; border-color: #cce8d8; color: #1d5a39; }

	.hero-actions { display: flex; gap: 10px; }
	.primary { background: linear-gradient(135deg, #e3473c, #c23630); color: #fff; border: 1px solid #f4d5d2; border-radius: 12px; padding: 10px 14px; font-weight: 800; cursor: pointer; box-shadow: 0 12px 26px rgba(227,71,60,0.25); transition: transform 0.12s ease, box-shadow 0.18s ease; }
	.primary:hover { transform: translateY(-1px); box-shadow: 0 16px 30px rgba(227,71,60,0.3); }
	.primary:active { transform: translateY(0); box-shadow: 0 10px 22px rgba(227,71,60,0.22); }

	.panel { position: relative; z-index: 1; background: #fff; border-radius: 16px; border: 1px solid #f1f1f1; box-shadow: 0 14px 40px rgba(0,0,0,0.04); padding: 18px 18px 22px 18px; margin-bottom: 16px; }
	.panel-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
	.label { text-transform: uppercase; letter-spacing: 0.1em; font-size: 11px; color: #9a9a9a; margin: 0; font-weight: 800; }
	.panel h2 { margin: 4px 0 0 0; font-size: 20px; font-weight: 800; }

	.ghost, .outline, .success, .danger {
		border-radius: 12px;
		padding: 10px 12px;
		font-weight: 700;
		cursor: pointer;
		border: 1px solid #f0d0cb;
		background: #fff;
		color: #a33b36;
		transition: transform 0.12s ease, box-shadow 0.18s ease;
	}
	.ghost:hover, .outline:hover, .success:hover, .danger:hover { transform: translateY(-1px); }
	.outline { color: #4a4a4a; border-color: #e6e6e6; }
	.success { color: #1d5a39; border-color: #cce8d8; background: #f2fcf6; }
	.danger { background: #fff1f1; }

	.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; margin-top: 14px; }
	.field { display: grid; gap: 6px; font-size: 14px; color: #3f3f46; }
	.field input, .field select {
		padding: 12px 12px;
		border-radius: 12px;
		border: 1.5px solid #e6e6e9;
		background: #fbfbfc;
		font-size: 14px;
		transition: border-color 0.18s ease, box-shadow 0.18s ease;
		font-family: inherit;
	}
	.field input:focus, .field select:focus {
		outline: none;
		border-color: #e3473c;
		box-shadow: 0 10px 30px rgba(227, 71, 60, 0.12);
		background: #fff;
	}
	.doc-block { grid-column: 1 / -1; border: 1.5px dashed #f0d8d3; background: #fff8f6; border-radius: 12px; padding: 12px; display: grid; gap: 10px; }
	.doc-head { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
	.doc-hint { margin: 0; color: #5d5d5d; font-size: 13px; }
	.doc-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
	.doc-field { background: #fff; border: 1px solid #f1f1f1; border-radius: 12px; padding: 10px; display: grid; gap: 8px; }
	.doc-label { display: flex; justify-content: space-between; align-items: center; gap: 8px; font-weight: 700; color: #3f3f46; }
	.doc-label-meta { display: flex; align-items: center; gap: 6px; }
	.doc-hint-light { color: #9a9a9a; font-weight: 600; font-size: 12px; }
	.doc-hint-light.strong { color: #a33b36; }
	.doc-pill { display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; border-radius: 999px; background: #f2fcf6; border: 1px solid #cce8d8; color: #1d5a39; font-size: 12px; font-weight: 700; }
	.doc-status { margin: 0; color: #a33b36; font-weight: 700; font-size: 13px; }
	.doc-existing { display: flex; flex-wrap: wrap; gap: 8px; padding: 4px 2px 8px 2px; }
	.doc-existing.muted { color: #9a9a9a; font-size: 13px; }
	.doc-chip { display: inline-flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 12px; border: 1px solid #e6e6e9; background: #fff; color: #333; text-decoration: none; font-weight: 700; box-shadow: 0 6px 18px rgba(0,0,0,0.04); transition: transform 0.12s ease, box-shadow 0.18s ease; }
	.doc-chip.mini { padding: 4px 10px; font-size: 12px; background: #e7f1ff; border-color: #c9dcff; color: #1f4b99; }
	.doc-chip:hover { transform: translateY(-1px); box-shadow: 0 10px 26px rgba(0,0,0,0.08); }
	.doc-meta { color: #9a9a9a; font-size: 12px; font-weight: 600; }
	.loading-docs { color: #a33b36; font-weight: 700; font-size: 13px; }
	.doc-actions { display: flex; flex-direction: column; gap: 6px; align-items: flex-start; }
	.file-input { display: none; }
	@media (max-width: 960px) {
		.doc-grid { grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
	}
	.form-actions { grid-column: 1 / -1; display: flex; gap: 10px; margin-top: 4px; }

	.table-wrap { overflow-x: auto; border-radius: 12px; border: 1px solid #f1f1f1; box-shadow: 0 12px 32px rgba(0,0,0,0.04); }
	table { width: 100%; border-collapse: collapse; font-size: 14px; }
	thead { background: #fff8f6; }
	thead th { text-align: left; padding: 14px; font-weight: 800; color: #2a2a2a; border-bottom: 1px solid #f0d8d3; font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; }
	tbody td { padding: 14px; border-bottom: 1px solid #f5f5f5; color: #3f3f46; }
	tbody tr:hover { background: #fff4f2; }
	.actions { display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }
	.status { padding: 6px 10px; border-radius: 10px; font-weight: 800; font-size: 12px; text-transform: capitalize; }
	.status.green { background: #f2fcf6; color: #1d5a39; border: 1px solid #cce8d8; }
	.status.red { background: #fff1f1; color: #a33b36; border: 1px solid #f4d5d2; }
	.status.blue { background: #e7f1ff; color: #1f4b99; border: 1px solid #c9dcff; }
	.status.amber { background: #fff4e5; color: #8a4b14; border: 1px solid #ffd9a8; }

	.loading, .empty { display: grid; place-items: center; gap: 10px; padding: 40px; color: #4a4a4a; }
	.spinner { width: 32px; height: 32px; border-radius: 50%; border: 4px solid #ffe0db; border-top-color: #e3473c; animation: spin 0.8s linear infinite; }
	@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }

	.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.35); backdrop-filter: blur(4px); display: grid; place-items: center; z-index: 20; }
	.modal { width: min(440px, 92%); background: #fff; border-radius: 18px; border: 1px solid #f0d8d3; box-shadow: 0 30px 80px rgba(0,0,0,0.18); padding: 18px 18px 16px; display: grid; gap: 10px; }
	.modal.wide { width: min(900px, 95%); }
	.modal h3 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.01em; }
	.modal .lede { margin: 0; color: #4f4f4f; font-size: 14px; }
	.modal .lede.small { font-size: 13px; color: #5e5e5e; }
	.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 6px; }
	.detail-scroll { max-height: 70vh; overflow-y: auto; padding-right: 6px; }
	.detail-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; }
	.card { background: linear-gradient(145deg, #fff, #fdf7f5); border: 1px solid #f1deda; border-radius: 14px; padding: 12px; box-shadow: 0 10px 24px rgba(0,0,0,0.06); display: grid; gap: 8px; }
	.card-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
	.card h4 { margin: 0; font-size: 15px; font-weight: 800; }
	.card ul { margin: 0; padding-left: 16px; display: grid; gap: 6px; font-size: 13px; }
	.lined li { padding: 6px 0; border-bottom: 1px dashed #eee; }
	.lined li:last-child { border-bottom: none; }
	.list-scroll { max-height: 190px; overflow-y: auto; padding-right: 6px; }
	.doc-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
	.doc-row .mini { font-size: 12px; padding: 6px 10px; border-radius: 10px; border: 1px solid #d7e4ff; background: #eef5ff; color: #1f4b99; text-decoration: none; font-weight: 700; }
	.doc-row .mini:hover { background: #dbe9ff; }
	.pill { display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; border-radius: 999px; background: #eef7ff; color: #1f4b99; font-weight: 700; font-size: 12px; }
	.pill.muted-pill { background: #f4f4f5; color: #4f4f4f; }
	.detail-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; }
	.detail-grid h4 { margin: 0 0 4px 0; }
	.detail-grid ul { margin: 0; padding-left: 18px; display: grid; gap: 4px; }
	.muted { color: #8a8a8a; }

	@media (max-width: 720px) {
		.hero { flex-direction: column; align-items: flex-start; }
		.panel { padding: 16px; }
		thead { display: none; }
		table, tbody, tr, td { display: block; width: 100%; }
		tbody tr { margin-bottom: 12px; border: 1px solid #f1f1f1; border-radius: 12px; padding: 10px; }
		tbody td { border: none; padding: 8px 4px; }
		tbody td:last-child { padding-top: 8px; }
	}
</style>
