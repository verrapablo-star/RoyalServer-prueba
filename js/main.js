// --- RULETA ---
const itemsRuleta = [
	'Diamante', 'Oro', 'Hierro', 'XP', 'Llave', 'Nada', 'Cofre', 'Espada', 'Escudo', 'Poción', 'Monedas', 'Sorpresa'
];

const btnRuleta = document.getElementById('btn-ruleta');
const ruletaModal = document.getElementById('ruleta-modal');
const cerrarRuleta = document.getElementById('cerrar-ruleta');
const girarRuleta = document.getElementById('girar-ruleta');
const canvas = document.getElementById('ruleta-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;

let anguloActual = 0;
let girando = false;

function dibujarRuleta(items, angulo = 0) {
	if (!ctx) return;
	const size = canvas.width;
	const radio = size / 2;
	const cx = radio, cy = radio;
	const n = items.length;
	ctx.clearRect(0, 0, size, size);
	for (let i = 0; i < n; i++) {
		const start = angulo + (i * 2 * Math.PI / n);
		const end = angulo + ((i + 1) * 2 * Math.PI / n);
		ctx.beginPath();
		ctx.moveTo(cx, cy);
		ctx.arc(cx, cy, radio, start, end);
		ctx.closePath();
		ctx.fillStyle = i % 2 === 0 ? '#f1c40f' : '#e67e22';
		ctx.fill();
		ctx.save();
		ctx.translate(cx, cy);
		ctx.rotate(start + (end - start) / 2);
		ctx.textAlign = 'right';
		ctx.font = 'bold 20px Poppins, sans-serif';
		ctx.fillStyle = '#222';
		ctx.fillText(items[i], radio - 20, 10);
		ctx.restore();
	}
	// Flecha
	ctx.save();
	ctx.translate(cx, cy);
	ctx.rotate(-Math.PI/2);
	ctx.beginPath();
	ctx.moveTo(radio - 10, 0);
	ctx.lineTo(radio + 30, -20);
	ctx.lineTo(radio + 30, 20);
	ctx.closePath();
	ctx.fillStyle = '#e74c3c';
	ctx.fill();
	ctx.restore();
}

function mostrarRuleta() {
	ruletaModal.style.display = 'flex';
	anguloActual = 0;
	dibujarRuleta(itemsRuleta, anguloActual);
}

function ocultarRuleta() {
	ruletaModal.style.display = 'none';
}

function girarAnimacion() {
	if (girando) return;
	girando = true;
	let vueltas = Math.random() * 3 + 5; // 5-8 vueltas
	let anguloFinal = anguloActual + vueltas * 2 * Math.PI + Math.random() * 2 * Math.PI;
	let duracion = 3500;
	let start = null;
	function animarRuleta(ts) {
		if (!start) start = ts;
		let t = ts - start;
		let progreso = Math.min(t / duracion, 1);
		// Ease out
		let ease = 1 - Math.pow(1 - progreso, 3);
		let angulo = anguloActual + (anguloFinal - anguloActual) * ease;
		dibujarRuleta(itemsRuleta, angulo);
		if (progreso < 1) {
			requestAnimationFrame(animarRuleta);
		} else {
			anguloActual = anguloFinal % (2 * Math.PI);
			girando = false;
			mostrarPremio();
		}
	}
	requestAnimationFrame(animarRuleta);
}

function mostrarPremio() {
	const n = itemsRuleta.length;
	let anguloPorItem = 2 * Math.PI / n;
	let idx = Math.floor((n - ((anguloActual - Math.PI/2) % (2*Math.PI)) / anguloPorItem)) % n;
	if (idx < 0) idx += n;
	setTimeout(() => {
		alert('¡Ganaste: ' + itemsRuleta[idx] + '!');
	}, 500);
}

if (btnRuleta && ruletaModal && cerrarRuleta && girarRuleta && canvas) {
	btnRuleta.addEventListener('click', mostrarRuleta);
	cerrarRuleta.addEventListener('click', ocultarRuleta);
	girarRuleta.addEventListener('click', girarAnimacion);
	// Cerrar al clickear fuera
	ruletaModal.querySelector('.ruleta-overlay').addEventListener('click', ocultarRuleta);
}

/* ======= Dropdown init for injected nav fragment ======= */
function initGamesDropdown(){
	try{
		var navRoot = document.querySelector('.nav.container');
		if(!navRoot) return false;
		var dropdown = navRoot.querySelector('.nav__dropdown');
		if(!dropdown) return false;
		var btn = dropdown.querySelector('.nav__dropdown-toggle');
		if(!btn) return false;

		function toggleDropdown(open){
			var isOpen = dropdown.classList.contains('open');
			var shouldOpen = typeof open === 'boolean' ? open : !isOpen;
			dropdown.classList.toggle('open', shouldOpen);
			btn.setAttribute('aria-expanded', String(shouldOpen));
		}

		btn.addEventListener('click', function(e){ e.stopPropagation(); toggleDropdown(); });
		document.addEventListener('click', function(e){ if(!dropdown.contains(e.target) && dropdown.classList.contains('open')) toggleDropdown(false); });
		document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && dropdown.classList.contains('open')){ toggleDropdown(false); btn.focus(); } });
		dropdown.querySelectorAll('.nav__submenu a').forEach(function(a){ a.addEventListener('click', function(){ toggleDropdown(false); }); });
		return true;
	}catch(err){ return false; }
}

// Try to init immediately (for pages where nav is already in DOM)
if(!initGamesDropdown()){
	// If the nav is injected later, observe the body for the nav element
	var observer = new MutationObserver(function(mutations, obs){
		if(initGamesDropdown()){
			obs.disconnect();
		}
	});
	observer.observe(document.body, {childList:true, subtree:true});
}
